import express from "express";
import morgan from "morgan";
import { fileURLToPath } from "url";

export const createApp = () => {
  const app = express();
  app.use(morgan("combined"));

  // Routes
  app.get("/", (req, res) => res.sendStatus(200));

  return app;
};

const run = async () => {
  const app = createApp({});
  const port = process.env.PORT || "4100";

  app.listen(port, () => {
    console.log(`Listening on ${port}...`);
  });

  process.on("uncaughtException", (err) => {
    console.log(`ERROR Caught exception: ${err.stack}`);
  });
};

const __filename = fileURLToPath(import.meta.url);
const entryFile = process.argv?.[1];
if (entryFile === __filename) {
  run().catch(console.error);
}
