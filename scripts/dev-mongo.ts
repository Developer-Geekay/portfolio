#!/usr/bin/env node
// Local dev/testing helper: runs a temporary in-memory MongoDB on a fixed
// port so the app can be exercised without a real MongoDB install.
// Not used in production — the Pi runs a real mongod on localhost.
import { MongoMemoryServer } from "mongodb-memory-server";

const PORT = Number(process.env.DEV_MONGO_PORT ?? 27017);

const server = await MongoMemoryServer.create({
  instance: { port: PORT, ip: "127.0.0.1" },
});

console.log(`In-memory MongoDB running at ${server.getUri()}`);
console.log("Press Ctrl-C to stop.");

process.on("SIGINT", async () => {
  await server.stop();
  process.exit(0);
});
