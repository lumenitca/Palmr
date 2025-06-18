import { ConfigService } from "../config/service";
import { PrismaClient } from "@prisma/client";
import { exec } from "child_process";
import { promisify } from "util";
import fs from 'node:fs';

const execAsync = promisify(exec);
const prisma = new PrismaClient();

export class StorageService {
  private configService = new ConfigService();
  private isDockerCached = undefined;

  private _hasDockerEnv() {
    try {
      fs.statSync('/.dockerenv');
      return true;
    } catch {
      return false;
    }
  }

  private _hasDockerCGroup() {
    try {
      return fs.readFileSync('/proc/self/cgroup', 'utf8').includes('docker');
    } catch {
      return false;
    }
  }

  private _isDocker() {
    return this.isDockerCached ?? (this._hasDockerEnv() || this._hasDockerCGroup());
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
        const isDocker = this._isDocker();
        const pathToCheck = isDocker ? "/app/server/uploads" : ".";

        const command = process.platform === "win32"
          ? "wmic logicaldisk get size,freespace,caption"
          : process.platform === "darwin"
            ? `df -k ${pathToCheck}`
            : `df -B1 ${pathToCheck}`;

        const { stdout } = await execAsync(command);
        let total = 0;
        let available = 0;

        if (process.platform === "win32") {
          const lines = stdout.trim().split("\n").slice(1);
          for (const line of lines) {
            const [, size, freespace] = line.trim().split(/\s+/);
            total += parseInt(size) || 0;
            available += parseInt(freespace) || 0;
          }
        } else if (process.platform === "darwin") {
          const lines = stdout.trim().split("\n");
          const [, size, , avail] = lines[1].trim().split(/\s+/);
          total = parseInt(size) * 1024;
          available = parseInt(avail) * 1024;
        } else {
          const lines = stdout.trim().split("\n");
          const [, size, , avail] = lines[1].trim().split(/\s+/);
          total = parseInt(size);
          available = parseInt(avail);
        }

        const used = total - available;

        return {
          diskSizeGB: Number((total / (1024 * 1024 * 1024)).toFixed(2)),
          diskUsedGB: Number((used / (1024 * 1024 * 1024)).toFixed(2)),
          diskAvailableGB: Number((available / (1024 * 1024 * 1024)).toFixed(2)),
          uploadAllowed: true,
        };
      } else if (userId) {
        const maxTotalStorage = BigInt(await this.configService.getValue("maxTotalStoragePerUser"));
        const maxStorageGB = Number(maxTotalStorage) / (1024 * 1024 * 1024);

        const userFiles = await prisma.file.findMany({
          where: { userId },
          select: { size: true },
        });

        const totalUsedStorage = userFiles.reduce((acc, file) => acc + file.size, BigInt(0));

        const usedStorageGB = Number(totalUsedStorage) / (1024 * 1024 * 1024);
        const availableStorageGB = maxStorageGB - usedStorageGB;

        return {
          diskSizeGB: maxStorageGB,
          diskUsedGB: usedStorageGB,
          diskAvailableGB: availableStorageGB,
          uploadAllowed: availableStorageGB > 0,
        };
      }

      throw new Error("User ID is required for non-admin users");
    } catch (error) {
      console.error("Error getting disk space:", error);
      throw new Error("Failed to get disk space information");
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
