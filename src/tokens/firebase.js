
export const buildFirebaseTokenCreator = ({ auth }) => {
  return ({ uid }) => auth.createCustomToken(uid);
};
