import express from "express";
import morgan from "morgan";
import { fileURLToPath } from "url";

import { buildArtCompilerRouter, buildEthereumRouter, buildUserRouter } from "./routes/index.js";
import { createUserStorer } from "./storers/index.js";
import { createTokenCreator } from "./tokens/index.js";

export const createApp = ({ userStorer, tokenCreator }) => {
  const app = express();
  app.use(morgan("combined"));
  app.use(express.json({ limit: "50mb" }));

  // Routes
  app.get("/", (req, res) => res.sendStatus(200));
  app.use("/exchange/artcompiler", buildArtCompilerRouter({ userStorer }));
  app.use("/exchange/ethereum", buildEthereumRouter({ userStorer, tokenCreator }));
  app.use("/users", buildUserRouter({ userStorer }));

  // Handle errors
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.sendStatus(500);
  });

  return app;
};

const run = async () => {
  const userStorer = createUserStorer({ type: "firestore" });
  const tokenCreator = createTokenCreator({ type: "firebase" });
  const app = createApp({ userStorer, tokenCreator });

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
