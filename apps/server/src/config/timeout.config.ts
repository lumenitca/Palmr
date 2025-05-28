import { env } from "../env";

/**
 * Timeout Configuration for Large File Handling
 *
 * These settings control how long the server will wait for various operations
 * when dealing with large files. Adjust based on your infrastructure needs.
 */

export const timeoutConfig = {
  // Connection timeouts
  connection: {
    // How long to wait for initial connection (0 = disabled)
    timeout: 0,

    // Keep-alive timeout for long-running uploads/downloads
    // 20 hours should be enough for most large file operations
    keepAlive: 20 * 60 * 60 * 1000, // 20 hours in milliseconds
  },

  // Request timeouts
  request: {
    // Global request timeout (0 = disabled, let requests run indefinitely)
    timeout: 0,

    // Body parsing timeout for large files
    bodyTimeout: 0, // Disabled for large files
  },

  // File operation timeouts
  file: {
    // Maximum time to wait for file upload (0 = no limit)
    uploadTimeout: 0,

    // Maximum time to wait for file download (0 = no limit)
    downloadTimeout: 0,

    // Streaming chunk timeout (time between chunks)
    streamTimeout: 30 * 1000, // 30 seconds between chunks
  },

  // Token expiration (for filesystem storage)
  token: {
    // How long upload/download tokens remain valid
    expiration: 60 * 60 * 1000, // 1 hour in milliseconds
  },
};

/**
 * Get timeout configuration based on file size
 * For very large files, we might want different timeouts
 */
export function getTimeoutForFileSize(fileSizeBytes: number) {
  const fileSizeGB = fileSizeBytes / (1024 * 1024 * 1024);

  if (fileSizeGB > 100) {
    // For files larger than 100GB, extend token expiration
    return {
      ...timeoutConfig,
      token: {
        expiration: 24 * 60 * 60 * 1000, // 24 hours for very large files
      },
    };
  }

  if (fileSizeGB > 10) {
    // For files larger than 10GB, extend token expiration
    return {
      ...timeoutConfig,
      token: {
        expiration: 4 * 60 * 60 * 1000, // 4 hours for large files
      },
    };
  }

  return timeoutConfig;
}

/**
 * Environment-based timeout overrides
 * You can set these in your .env file to override defaults
 */
export const envTimeoutOverrides = {
  // Override connection keep-alive if set in environment
  keepAliveTimeout: process.env.KEEP_ALIVE_TIMEOUT
    ? parseInt(process.env.KEEP_ALIVE_TIMEOUT)
    : timeoutConfig.connection.keepAlive,

  // Override request timeout if set in environment
  requestTimeout: process.env.REQUEST_TIMEOUT ? parseInt(process.env.REQUEST_TIMEOUT) : timeoutConfig.request.timeout,

  // Override token expiration if set in environment
  tokenExpiration: process.env.TOKEN_EXPIRATION
    ? parseInt(process.env.TOKEN_EXPIRATION)
    : timeoutConfig.token.expiration,
};
