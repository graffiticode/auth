import { randomBytes } from "node:crypto";

export const isNonEmptyString = (str) => (typeof (str) === "string" && str.length > 0);

export const generateNonce = () =>
  new Promise((resolve, reject) =>
    randomBytes(32, (err, buf) => {
      if (err) {
        reject(err);
      } else {
        resolve(buf.toString("hex"));
      }
    }));
