import { registerSwagger } from "./config/swagger.config";
import { prisma } from "./shared/prisma";
import fastifyCookie from "@fastify/cookie";
import { fastifyCors } from "@fastify/cors";
import fastifyJwt from "@fastify/jwt";
import { fastifySwaggerUi } from "@fastify/swagger-ui";
import { fastify } from "fastify";
import { validatorCompiler, serializerCompiler, ZodTypeProvider } from "fastify-type-provider-zod";
import crypto from "node:crypto";

export async function buildApp() {
  const jwtConfig = await prisma.appConfig.findUnique({
    where: { key: "jwtSecret" },
  });

  const JWT_SECRET = jwtConfig?.value || crypto.randomBytes(64).toString("hex");

  const app = fastify({
    ajv: {
      customOptions: {
        removeAdditional: false,
      },
    },
  }).withTypeProvider<ZodTypeProvider>();

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  app.addSchema({
    $id: "dateFormat",
    type: "string",
    format: "date-time",
  });

  app.register(fastifyCors, {
    origin: true,
    credentials: true,
  });

  app.register(fastifyCookie);
  app.register(fastifyJwt, {
    secret: JWT_SECRET,
    cookie: {
      cookieName: "token",
      signed: false,
    },
    sign: {
      expiresIn: "1d",
    },
  });

  app.decorateRequest("jwtSign", function (this: any, payload: object, options?: object) {
    return this.server.jwt.sign(payload, options);
  });

  registerSwagger(app);
  app.register(fastifySwaggerUi, {
    routePrefix: "/swagger",
  });

  app.register(require("@scalar/fastify-api-reference"), {
    routePrefix: "/docs",
    configuration: {
      theme: "deepSpace",
    },
  });

  return app;
}
