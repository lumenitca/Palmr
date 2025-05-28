import { buildApp } from "./app";
import { env } from "./env";
import { appRoutes } from "./modules/app/routes";
import { authRoutes } from "./modules/auth/routes";
import { fileRoutes } from "./modules/file/routes";
import { filesystemRoutes } from "./modules/filesystem/routes";
import { healthRoutes } from "./modules/health/routes";
import { shareRoutes } from "./modules/share/routes";
import { storageRoutes } from "./modules/storage/routes";
import { userRoutes } from "./modules/user/routes";
import fastifyMultipart from "@fastify/multipart";
import fastifyStatic from "@fastify/static";
import * as fs from "fs/promises";
import path from "path";

async function ensureDirectories() {
  const uploadsDir = path.join(process.cwd(), "uploads");
  const tempChunksDir = path.join(process.cwd(), "temp-chunks");

  try {
    await fs.access(uploadsDir);
  } catch {
    await fs.mkdir(uploadsDir, { recursive: true });
    console.log("📁 Created uploads directory");
  }

  try {
    await fs.access(tempChunksDir);
  } catch {
    await fs.mkdir(tempChunksDir, { recursive: true });
    console.log("📁 Created temp-chunks directory");
  }
}

async function startServer() {
  const app = await buildApp();

  await ensureDirectories();

  await app.register(fastifyMultipart, {
    limits: {
      fieldNameSize: 100,
      fieldSize: 1024 * 1024, // 1MB for chunk metadata
      fields: 10,
      fileSize: 1024 * 1024 * 1024 * 1024 * 1024, // 1PB (1 petabyte) - practically unlimited
      files: 1,
      headerPairs: 2000,
    },
  });

  if (env.ENABLE_S3 !== "true") {
    await app.register(fastifyStatic, {
      root: path.join(process.cwd(), "uploads"),
      prefix: "/uploads/",
      decorateReply: false,
    });
  }

  app.register(authRoutes);
  app.register(userRoutes);
  app.register(fileRoutes);

  if (env.ENABLE_S3 !== "true") {
    app.register(filesystemRoutes);
  }

  app.register(shareRoutes);
  app.register(storageRoutes);
  app.register(appRoutes);
  app.register(healthRoutes);

  await app.listen({
    port: Number(env.PORT),
    host: "0.0.0.0",
  });

  console.log(`🌴 Palmr server running on port ${env.PORT} 🌴`);
  console.log(`📦 Storage mode: ${env.ENABLE_S3 === "true" ? "S3" : "Local Filesystem (Encrypted)"}`);

  console.log("\n📚 API Documentation:");
  console.log(`   - API Reference: http://localhost:${env.PORT}/docs\n`);
}

startServer().catch((err) => {
  console.error("Error starting server:", err);
  process.exit(1);
});
