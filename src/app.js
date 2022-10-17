import express from "express";
import morgan from "morgan";
import { fileURLToPath } from "url";

import { buildUserRouter } from "./routes/index.js";
import { buildMemoryStorer } from "./storers/index.js";

export const createApp = ({ userStorer }) => {
  const app = express();
  app.use(morgan("combined"));
  app.use(express.json({ limit: "50mb" }));

  // Routes
  app.get("/", (req, res) => res.sendStatus(200));
  app.use("/users", buildUserRouter({ userStorer }));

  return app;
};

const run = async () => {
  const userStorer = buildMemoryStorer();

  const app = createApp({ userStorer });
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
