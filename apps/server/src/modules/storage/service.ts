import { exec } from "child_process";
import fs from "node:fs";
import { promisify } from "util";
import { PrismaClient } from "@prisma/client";

import { IS_RUNNING_IN_CONTAINER } from "../../utils/container-detection";
import { ConfigService } from "../config/service";

const execAsync = promisify(exec);
const prisma = new PrismaClient();

// TODO: REMOVE LOGGING AFTER TESTING

export class StorageService {
  private configService = new ConfigService();

  private _ensureNumber(value: number, fallback: number = 0): number {
    return Number.isNaN(value) || !Number.isFinite(value) || value < 0 ? fallback : value;
  }

  private _safeParseInt(value: string): number {
    const parsed = parseInt(value, 10);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  private _parseSize(value: string): number {
    if (!value) return 0;

    // Remove any whitespace and convert to lowercase
    const cleanValue = value.trim().toLowerCase();

    // Extract the numeric part
    const numericMatch = cleanValue.match(/^(\d+(?:\.\d+)?)/);
    if (!numericMatch) return 0;

    const numericValue = parseFloat(numericMatch[1]);
    if (Number.isNaN(numericValue)) return 0;

    // Determine the unit multiplier
    if (cleanValue.includes("t")) {
      return Math.round(numericValue * 1024 * 1024 * 1024 * 1024); // TB to bytes
    } else if (cleanValue.includes("g")) {
      return Math.round(numericValue * 1024 * 1024 * 1024); // GB to bytes
    } else if (cleanValue.includes("m")) {
      return Math.round(numericValue * 1024 * 1024); // MB to bytes
    } else if (cleanValue.includes("k")) {
      return Math.round(numericValue * 1024); // KB to bytes
    } else {
      // Assume bytes if no unit
      return Math.round(numericValue);
    }
  }

  private async _tryDiskSpaceCommand(command: string): Promise<{ total: number; available: number } | null> {
    try {
      const { stdout, stderr } = await execAsync(command);

      if (stderr) {
        console.warn(`Command stderr: ${stderr}`);
      }

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
            total = this._safeParseInt(size) * 1024;
            available = this._safeParseInt(avail) * 1024;
          }
        }
      } else {
        // Handle different Linux/Unix command formats
        const lines = stdout.trim().split("\n");

        // Handle findmnt command output
        if (command.includes("findmnt")) {
          if (lines.length >= 1) {
            const parts = lines[0].trim().split(/\s+/);
            if (parts.length >= 2) {
              const [availStr, sizeStr] = parts;
              available = this._parseSize(availStr);
              total = this._parseSize(sizeStr);
            }
          }
        }
        // Handle stat -f command output
        else if (command.includes("stat -f")) {
          // Parse stat -f output (different format)
          let blockSize = 0;
          let totalBlocks = 0;
          let freeBlocks = 0;

          for (const line of lines) {
            if (line.includes("Block size:")) {
              blockSize = this._safeParseInt(line.split(":")[1].trim());
            } else if (line.includes("Total blocks:")) {
              totalBlocks = this._safeParseInt(line.split(":")[1].trim());
            } else if (line.includes("Free blocks:")) {
              freeBlocks = this._safeParseInt(line.split(":")[1].trim());
            }
          }

          if (blockSize > 0 && totalBlocks > 0) {
            total = totalBlocks * blockSize;
            available = freeBlocks * blockSize;
            console.log(
              `📊 stat -f parsed: blockSize=${blockSize}, totalBlocks=${totalBlocks}, freeBlocks=${freeBlocks}`
            );
          } else {
            console.warn(
              `❌ stat -f parsing failed: blockSize=${blockSize}, totalBlocks=${totalBlocks}, freeBlocks=${freeBlocks}`
            );
            return null;
          }
        }
        // Handle df --output format
        else if (command.includes("--output=")) {
          if (lines.length >= 2) {
            const parts = lines[1].trim().split(/\s+/);
            if (parts.length >= 2) {
              const [availStr, sizeStr] = parts;
              available = this._safeParseInt(availStr) * 1024; // df --output gives in KB
              total = this._safeParseInt(sizeStr) * 1024;
            }
          }
        }
        // Handle regular df command output
        else {
          if (lines.length >= 2) {
            const parts = lines[1].trim().split(/\s+/);
            if (parts.length >= 4) {
              const [, size, , avail] = parts;
              if (command.includes("-B1")) {
                total = this._safeParseInt(size);
                available = this._safeParseInt(avail);
              } else if (command.includes("-h")) {
                // Handle human-readable format (e.g., "1.5G", "500M")
                total = this._parseSize(size);
                available = this._parseSize(avail);
              } else {
                // Default to KB (standard df output)
                total = this._safeParseInt(size) * 1024;
                available = this._safeParseInt(avail) * 1024;
              }
            }
          }
        }
      }

      if (total > 0 && available >= 0) {
        return { total, available };
      } else {
        console.warn(`Invalid values parsed: total=${total}, available=${available} for command: ${command}`);
        return null;
      }
    } catch (error) {
      console.warn(`Command failed: ${command}`, error);
      return null;
    }
  }

  /**
   * Gets detailed mount information for debugging
   */
  private async _getMountInfo(path: string): Promise<{ filesystem: string; mountPoint: string; type: string } | null> {
    try {
      if (!fs.existsSync("/proc/mounts")) {
        console.log("❌ /proc/mounts not found for mount info");
        return null;
      }

      const mountsContent = await fs.promises.readFile("/proc/mounts", "utf8");
      const lines = mountsContent.split("\n").filter((line) => line.trim());

      let bestMatch = null;
      let bestMatchLength = 0;

      console.log(`🔍 Getting mount info for path: ${path}`);

      for (const line of lines) {
        const parts = line.split(/\s+/);
        if (parts.length >= 3) {
          const [filesystem, mountPoint, type] = parts;

          // Log interesting filesystems for debugging
          if (
            filesystem.includes("volume") ||
            filesystem.includes("mapper") ||
            type === "ext4" ||
            type === "btrfs" ||
            type === "xfs" ||
            mountPoint.includes("volume") ||
            mountPoint.includes("app")
          ) {
            console.log(`📋 Mount detail: ${filesystem} → ${mountPoint} (${type})`);
          }

          if (path.startsWith(mountPoint) && mountPoint.length > bestMatchLength) {
            bestMatch = { filesystem, mountPoint, type };
            bestMatchLength = mountPoint.length;
          }
        }
      }

      if (bestMatch) {
        console.log(`🎯 Selected mount info: ${bestMatch.filesystem} → ${bestMatch.mountPoint} (${bestMatch.type})`);
      }

      return bestMatch;
    } catch (error) {
      console.warn(`Could not get mount info for ${path}:`, error);
      return null;
    }
  }

  /**
   * Detects if a path is a bind mount or mount point by checking /proc/mounts
   * Returns the actual filesystem path for bind mounts
   */
  private async _detectMountPoint(path: string): Promise<string | null> {
    try {
      if (!fs.existsSync("/proc/mounts")) {
        console.log("❌ /proc/mounts not found, cannot detect mount points");
        return null;
      }

      const mountsContent = await fs.promises.readFile("/proc/mounts", "utf8");
      const lines = mountsContent.split("\n").filter((line) => line.trim());

      let bestMatch = null;
      let bestMatchLength = 0;

      console.log(`🔍 Checking ${lines.length} mount points for path: ${path}`);

      for (const line of lines) {
        const parts = line.split(/\s+/);
        if (parts.length >= 3) {
          const [device, mountPoint, filesystem] = parts;

          // Log useful mount information for debugging
          if (mountPoint.includes("volume") || mountPoint.includes("app") || mountPoint === "/") {
            console.log(`📍 Found mount: ${device} → ${mountPoint} (${filesystem})`);
          }

          if (path.startsWith(mountPoint) && mountPoint.length > bestMatchLength) {
            bestMatch = mountPoint;
            bestMatchLength = mountPoint.length;
            console.log(`✅ Better match found: ${mountPoint} (length: ${mountPoint.length})`);
          }
        }
      }

      if (bestMatch && bestMatch !== "/") {
        console.log(`🎯 Selected mount point: ${bestMatch}`);
        return bestMatch;
      }

      console.log("❌ No specific mount point found, using root");
      return null;
    } catch (error) {
      console.warn(`Could not detect mount point for ${path}:`, error);
      return null;
    }
  }

  /**
   * Gets filesystem information for a specific path, with bind mount detection
   */
  private async _getFileSystemInfo(
    path: string
  ): Promise<{ total: number; available: number; mountPoint?: string } | null> {
    try {
      const mountInfo = await this._getMountInfo(path);
      if (mountInfo && mountInfo.mountPoint !== "/") {
        console.log(`📁 Bind mount detected: ${path} → ${mountInfo.filesystem} (${mountInfo.type})`);
      }

      const mountPoint = await this._detectMountPoint(path);
      const targetPath = mountPoint || path;

      const commandsToTry =
        process.platform === "win32"
          ? ["wmic logicaldisk get size,freespace,caption"]
          : process.platform === "darwin"
            ? [`df -k "${targetPath}"`, `df "${targetPath}"`]
            : [
                // Try different df commands for better compatibility
                `df -B1 "${targetPath}"`,
                `df -k "${targetPath}"`,
                `df "${targetPath}"`,
                // Additional commands for Synology NAS and other systems
                `df -h "${targetPath}"`,
                `df -T "${targetPath}"`,
                // Fallback to statfs if available
                `stat -f "${targetPath}"`,
                // Direct filesystem commands
                `findmnt -n -o AVAIL,SIZE "${targetPath}"`,
                `findmnt -n -o AVAIL,SIZE,TARGET "${targetPath}"`,
                // Alternative df with different formatting
                `df -P "${targetPath}"`,
                `df --output=avail,size "${targetPath}"`,
              ];

      console.log(`🔍 Trying ${commandsToTry.length} commands for path: ${targetPath}`);

      for (const command of commandsToTry) {
        console.log(`🔧 Executing command: ${command}`);
        const result = await this._tryDiskSpaceCommand(command);
        if (result) {
          console.log(`✅ Command successful: ${command}`);
          return {
            ...result,
            mountPoint: mountPoint || undefined,
          };
        }
      }

      console.warn(`❌ All commands failed for path: ${targetPath}`);
      return null;
    } catch (error) {
      console.warn(`Error getting filesystem info for ${path}:`, error);
      return null;
    }
  }

  /**
   * Dynamically detect Synology volume paths by reading /proc/mounts
   */
  private async _detectSynologyVolumes(): Promise<string[]> {
    try {
      if (!fs.existsSync("/proc/mounts")) {
        return [];
      }

      const mountsContent = await fs.promises.readFile("/proc/mounts", "utf8");
      const lines = mountsContent.split("\n").filter((line) => line.trim());
      const synologyPaths: string[] = [];

      for (const line of lines) {
        const parts = line.split(/\s+/);
        if (parts.length >= 2) {
          const [, mountPoint] = parts;

          // Check if this is a Synology volume mount point
          if (mountPoint.match(/^\/volume\d+$/)) {
            synologyPaths.push(mountPoint);
            console.log(`🔍 Found Synology volume: ${mountPoint}`);
          }
        }
      }

      return synologyPaths;
    } catch (error) {
      console.warn("Could not detect Synology volumes:", error);
      return [];
    }
  }

  private async _getDiskSpaceMultiplePaths(): Promise<{ total: number; available: number } | null> {
    // Base paths that work for all systems
    const basePaths = IS_RUNNING_IN_CONTAINER
      ? ["/app/server/uploads", "/app/server/temp-uploads", "/app/server/temp-chunks", "/app/server", "/app", "/"]
      : [".", "./uploads", process.cwd()];

    // Dynamically detect Synology volume paths
    const synologyPaths = await this._detectSynologyVolumes();

    // Combine base paths with detected Synology paths
    const pathsToTry = [...basePaths, ...synologyPaths];

    console.log(`🔍 Attempting disk space detection for ${pathsToTry.length} paths...`);
    console.log(`📋 Synology volumes detected: ${synologyPaths.length > 0 ? synologyPaths.join(", ") : "none"}`);

    for (const pathToCheck of pathsToTry) {
      console.log(`📁 Checking path: ${pathToCheck}`);

      if (pathToCheck.includes("uploads") || pathToCheck.includes("temp-")) {
        try {
          if (!fs.existsSync(pathToCheck)) {
            fs.mkdirSync(pathToCheck, { recursive: true });
          }
        } catch (err) {
          console.warn(`Could not create path ${pathToCheck}:`, err);
          continue;
        }
      }

      if (!fs.existsSync(pathToCheck)) {
        console.log(`❌ Path does not exist: ${pathToCheck}`);
        continue;
      }

      // Use the new filesystem detection method
      const result = await this._getFileSystemInfo(pathToCheck);
      if (result) {
        if (result.mountPoint) {
          console.log(`✅ Storage resolved via bind mount: ${result.mountPoint}`);
        }
        console.log(
          `✅ Disk space detected for path ${pathToCheck}: ${(result.total / (1024 * 1024 * 1024)).toFixed(2)}GB total, ${(result.available / (1024 * 1024 * 1024)).toFixed(2)}GB available`
        );
        return { total: result.total, available: result.available };
      } else {
        console.log(`❌ No filesystem info available for path: ${pathToCheck}`);
      }
    }

    console.error("❌ All disk space detection attempts failed");
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
        const diskInfo = await this._getDiskSpaceMultiplePaths();

        if (!diskInfo) {
          console.error("❌ Could not determine disk space - system configuration issue");
          throw new Error("Unable to determine actual disk space - system configuration issue");
        }

        const { total, available } = diskInfo;
        const used = total - available;

        const diskSizeGB = this._ensureNumber(total / (1024 * 1024 * 1024), 0);
        const diskUsedGB = this._ensureNumber(used / (1024 * 1024 * 1024), 0);
        const diskAvailableGB = this._ensureNumber(available / (1024 * 1024 * 1024), 0);

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
