import { IS_RUNNING_IN_CONTAINER } from "../../utils/container-detection";
import { ConfigService } from "../config/service";
import { PrismaClient } from "@prisma/client";
import { exec } from "child_process";
import fs from "node:fs";
import { promisify } from "util";

const execAsync = promisify(exec);
const prisma = new PrismaClient();

export class StorageService {
  private configService = new ConfigService();

  private _ensureNumber(value: number, fallback: number = 0): number {
    if (isNaN(value) || !isFinite(value)) {
      return fallback;
    }
    return value;
  }

  private _safeParseInt(value: string): number {
    const parsed = parseInt(value);
    return this._ensureNumber(parsed, 0);
  }

  private async _tryDiskSpaceCommand(
    command: string,
    pathToCheck: string
  ): Promise<{ total: number; available: number } | null> {
    try {
      console.log(`Trying disk space command: ${command}`);
      const { stdout, stderr } = await execAsync(command);

      if (stderr) {
        console.warn(`Command stderr: ${stderr}`);
      }

      console.log(`Command stdout: ${stdout}`);

      let total = 0;
      let available = 0;

      if (process.platform === "win32") {
        const lines = stdout.trim().split("\n").slice(1);
        for (const line of lines) {
          const parts = line.trim().split(/\s+/);
          if (parts.length >= 3) {
            const [, size, freespace] = parts;
            total += this._safeParseInt(size);
            available += this._safeParseInt(freespace);
          }
        }
      } else if (process.platform === "darwin") {
        const lines = stdout.trim().split("\n");
        if (lines.length >= 2) {
          const parts = lines[1].trim().split(/\s+/);
          if (parts.length >= 4) {
            const [, size, , avail] = parts;
            total = this._safeParseInt(size) * 1024; // df -k returns KB, convert to bytes
            available = this._safeParseInt(avail) * 1024;
          }
        }
      } else {
        // Linux
        const lines = stdout.trim().split("\n");
        if (lines.length >= 2) {
          const parts = lines[1].trim().split(/\s+/);
          if (parts.length >= 4) {
            const [, size, , avail] = parts;
            // Check if command used -B1 (bytes) or default (1K blocks)
            if (command.includes("-B1")) {
              total = this._safeParseInt(size);
              available = this._safeParseInt(avail);
            } else {
              // Default df returns 1K blocks
              total = this._safeParseInt(size) * 1024;
              available = this._safeParseInt(avail) * 1024;
            }
          }
        }
      }

      if (total > 0 && available >= 0) {
        console.log(`Successfully parsed disk space: ${total} bytes total, ${available} bytes available`);
        return { total, available };
      } else {
        console.warn(`Invalid values parsed: total=${total}, available=${available}`);
        return null;
      }
    } catch (error) {
      console.warn(`Command failed: ${command}`, error);
      return null;
    }
  }

  private async _getDiskSpaceMultiplePaths(): Promise<{ total: number; available: number } | null> {
    const pathsToTry = IS_RUNNING_IN_CONTAINER
      ? ["/app/server/uploads", "/app/server", "/app", "/"]
      : [".", "./uploads", process.cwd()];

    for (const pathToCheck of pathsToTry) {
      console.log(`Trying path: ${pathToCheck}`);

      // Ensure the path exists if it's our uploads directory
      if (pathToCheck.includes("uploads")) {
        try {
          if (!fs.existsSync(pathToCheck)) {
            fs.mkdirSync(pathToCheck, { recursive: true });
            console.log(`Created directory: ${pathToCheck}`);
          }
        } catch (err) {
          console.warn(`Could not create path ${pathToCheck}:`, err);
          continue;
        }
      }

      // Check if path exists
      if (!fs.existsSync(pathToCheck)) {
        console.warn(`Path does not exist: ${pathToCheck}`);
        continue;
      }

      const commandsToTry =
        process.platform === "win32"
          ? ["wmic logicaldisk get size,freespace,caption"]
          : process.platform === "darwin"
            ? [`df -k "${pathToCheck}"`, `df "${pathToCheck}"`]
            : [`df -B1 "${pathToCheck}"`, `df -k "${pathToCheck}"`, `df "${pathToCheck}"`];

      for (const command of commandsToTry) {
        const result = await this._tryDiskSpaceCommand(command, pathToCheck);
        if (result) {
          console.log(`✅ Successfully got disk space for path: ${pathToCheck}`);
          return result;
        }
      }
    }

    return null;
  }

  async getDiskSpace(
    userId?: string,
    isAdmin?: boolean
  ): Promise<{
    diskSizeGB: number;
    diskUsedGB: number;
    diskAvailableGB: number;
    uploadAllowed: boolean;
  }> {
    try {
      if (isAdmin) {
        console.log(`Running in container: ${IS_RUNNING_IN_CONTAINER}`);

        const diskInfo = await this._getDiskSpaceMultiplePaths();

        if (!diskInfo) {
          console.error("❌ CRITICAL: Could not determine disk space using any method!");
          console.error("This indicates a serious system issue. Please check:");
          console.error("1. File system permissions");
          console.error("2. Available disk utilities (df, wmic)");
          console.error("3. Container/system configuration");

          // Only now use fallback, but make it very clear this is an error state
          throw new Error("Unable to determine actual disk space - system configuration issue");
        }

        const { total, available } = diskInfo;
        const used = total - available;

        const diskSizeGB = this._ensureNumber(total / (1024 * 1024 * 1024), 0);
        const diskUsedGB = this._ensureNumber(used / (1024 * 1024 * 1024), 0);
        const diskAvailableGB = this._ensureNumber(available / (1024 * 1024 * 1024), 0);

        console.log(
          `✅ Real disk space: ${diskSizeGB.toFixed(2)}GB total, ${diskUsedGB.toFixed(2)}GB used, ${diskAvailableGB.toFixed(2)}GB available`
        );

        return {
          diskSizeGB: Number(diskSizeGB.toFixed(2)),
          diskUsedGB: Number(diskUsedGB.toFixed(2)),
          diskAvailableGB: Number(diskAvailableGB.toFixed(2)),
          uploadAllowed: diskAvailableGB > 0.1, // At least 100MB free
        };
      } else if (userId) {
        const maxTotalStorage = BigInt(await this.configService.getValue("maxTotalStoragePerUser"));
        const maxStorageGB = this._ensureNumber(Number(maxTotalStorage) / (1024 * 1024 * 1024), 10);

        const userFiles = await prisma.file.findMany({
          where: { userId },
          select: { size: true },
        });

        const totalUsedStorage = userFiles.reduce((acc, file) => acc + file.size, BigInt(0));

        const usedStorageGB = this._ensureNumber(Number(totalUsedStorage) / (1024 * 1024 * 1024), 0);
        const availableStorageGB = this._ensureNumber(maxStorageGB - usedStorageGB, 0);

        return {
          diskSizeGB: Number(maxStorageGB.toFixed(2)),
          diskUsedGB: Number(usedStorageGB.toFixed(2)),
          diskAvailableGB: Number(availableStorageGB.toFixed(2)),
          uploadAllowed: availableStorageGB > 0,
        };
      }

      throw new Error("User ID is required for non-admin users");
    } catch (error) {
      console.error("❌ Error getting disk space:", error);

      // Re-throw the error instead of returning fallback values
      // This way the API will return a proper error and the frontend can handle it
      throw new Error(
        `Failed to get disk space information: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async checkUploadAllowed(
    fileSize: number,
    userId?: string
  ): Promise<{
    diskSizeGB: number;
    diskUsedGB: number;
    diskAvailableGB: number;
    uploadAllowed: boolean;
    fileSizeInfo: {
      bytes: number;
      kb: number;
      mb: number;
      gb: number;
    };
  }> {
    const diskSpace = await this.getDiskSpace(userId);
    const fileSizeGB = fileSize / (1024 * 1024 * 1024);

    return {
      ...diskSpace,
      uploadAllowed: diskSpace.diskAvailableGB > fileSizeGB,
      fileSizeInfo: {
        bytes: fileSize,
        kb: Number((fileSize / 1024).toFixed(2)),
        mb: Number((fileSize / (1024 * 1024)).toFixed(2)),
        gb: Number((fileSize / (1024 * 1024 * 1024)).toFixed(2)),
      },
    };
  }
}
