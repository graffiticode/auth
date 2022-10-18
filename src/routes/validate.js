import { Router } from "express";
import { InvalidArgumentError } from "../errors/http.js";
import { isNonEmptyString } from "../utils.js";
import { buildHttpHandler, createSuccessResponse } from "./utils.js";

const buildPost = ({ authProvider }) => buildHttpHandler(async (req, res) => {
  const { token } = req.body;
  if (!isNonEmptyString(token)) {
    throw new InvalidArgumentError("token must be present");
  }
  const { uid } = await authProvider.verify({ token });
  res.status(200).json(createSuccessResponse({ uid }));
});

export const buildValidateRouter = ({ authProvider }) => {
  const router = new Router();
  router.post("/", buildPost({ authProvider }));
  return router;
};
