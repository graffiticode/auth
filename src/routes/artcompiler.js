import { Router } from "express";
import { buildHttpHandler } from "./utils.js";

const buildGet = () => buildHttpHandler(async (req, res) => {
  res.sendStatus(200);
});

export const buildArtCompilerRouter = () => {
  const router = new Router();
  router.get("/", buildGet());
  return router;
};
