import { buildApp } from "./app";
import { env } from "./env";
import { appRoutes } from "./modules/app/routes";
import { authRoutes } from "./modules/auth/routes";
import { fileRoutes } from "./modules/file/routes";
import { healthRoutes } from "./modules/health/routes";
import { shareRoutes } from "./modules/share/routes";
import { storageRoutes } from "./modules/storage/routes";
import { userRoutes } from "./modules/user/routes";
import fastifyMultipart from "@fastify/multipart";

async function startServer() {
  const app = await buildApp();

  await app.register(fastifyMultipart, {
    limits: {
      fileSize: 5 * 1024 * 1024,
    },
    attachFieldsToBody: true,
  });

  app.register(authRoutes);
  app.register(userRoutes);
  app.register(fileRoutes);
  app.register(shareRoutes);
  app.register(storageRoutes);
  app.register(appRoutes);
  app.register(healthRoutes);

  await app.listen({
    port: Number(env.PORT),
    host: "0.0.0.0",
  });

  console.log(`🌴 Palmr server running on port ${env.PORT} 🌴`);

  console.log("\n📚 API Documentation:");
  console.log(`   - API Reference: http://localhost:${env.PORT}/docs\n`);
}

startServer().catch((error) => {
  console.error("Error starting server:", error);
  process.exit(1);
});
