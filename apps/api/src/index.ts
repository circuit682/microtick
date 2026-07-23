import { createServer } from "./server.js";

const server = createServer();

const PORT = Number(process.env.PORT ?? 3000);

async function start(): Promise<void> {
  try {
    await server.listen({
      host: "0.0.0.0",
      port: PORT,
    });

    server.log.info(
      `MicroTick API listening on port ${PORT}`,
    );
  } catch (error) {
    server.log.error(error);
    process.exit(1);
  }
}

void start();