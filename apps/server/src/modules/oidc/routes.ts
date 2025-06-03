import { OIDCController } from "./controller";
import { FastifyInstance } from "fastify";

export async function oidcRoutes(fastify: FastifyInstance) {
  const oidcController = new OIDCController();

  fastify.get("/config", oidcController.getConfig.bind(oidcController));

  fastify.get("/authorize", oidcController.authorize.bind(oidcController));

  fastify.get("/callback", oidcController.callback.bind(oidcController));
}
