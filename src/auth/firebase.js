
export const buildFirebaseAuthProvider = ({ auth }) => {
  return {
    create: async ({ uid }) => {
      const user = await auth.createUser({ uid });
      console.log(user);
      return await auth.createCustomToken(uid);
    },
    verify: async ({ token }) => {
      const { uid } = await auth.verifyIdToken(token);
      return { uid };
    }
  };
};
