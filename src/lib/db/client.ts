import mongoose from "mongoose";

const MONGODB_URI =
  process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/personal-portfolio";

const globalForDb = globalThis as unknown as {
  _mongooseConn: Promise<typeof mongoose> | undefined;
};

export function dbConnect(): Promise<typeof mongoose> {
  if (!globalForDb._mongooseConn) {
    globalForDb._mongooseConn = mongoose
      .connect(MONGODB_URI, { bufferCommands: false })
      .catch((err) => {
        // don't cache a failed connection — next call retries
        globalForDb._mongooseConn = undefined;
        throw err;
      });
  }
  return globalForDb._mongooseConn;
}
