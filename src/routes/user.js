import { Router } from "express";
import { InvalidArgumentError } from "../errors/http.js";
import { isNonEmptyString } from "../utils.js";
import { buildHttpHandler, createSuccessResponse } from "./utils.js";

const generateNonce = () => Math.floor(Math.random() * 1000000);

const buildUserGet = ({ userStorer }) => buildHttpHandler(async (req, res) => {
  const { uid } = req.params;
  if (!isNonEmptyString(uid)) {
    throw new InvalidArgumentError("must provide a uid");
  }

  const user = await userStorer.findById(uid);

  res.status(200).json(createSuccessResponse(user));
});

const buildUserRegister = ({ userStorer }) => buildHttpHandler(async (req, res) => {
  const { uid } = req.body;
  if (!isNonEmptyString(uid)) {
    throw new InvalidArgumentError("must provide a uid");
  }

  const nonce = generateNonce();
  const user = { uid, nonce };
  await userStorer.create(user);

  res.status(200).json(createSuccessResponse("user registered"));
});

export const buildUserRouter = ({ userStorer }) => {
  const router = new Router();
  router.get("/:uid", buildUserGet({ userStorer }));
  router.post("/register", buildUserRegister({ userStorer }));
  return router;
};
