
export const buildFirebaseAuthProvider = ({ auth }) => {
  return {
    create: async ({ uid }) => {
      await auth.createUser({ uid });
      return await auth.createCustomToken(uid);
    },
    verify: async ({ token }) => {
      const { uid } = await auth.verifyIdToken(token);
      return { uid };
    }
  };
};
