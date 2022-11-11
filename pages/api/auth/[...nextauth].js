import NextAuth from "next-auth";
import { prisma } from "../../../lib/db";

const makeTokenRequest = async (context) =>
  fetch(
    `${context.provider.token.url}?code=${context.params.code}&client_id=${context.client.client_id}&client_secret=${context.client.client_secret}`
  ).then((res) => res.json());

const makeUserInfoRequest = async (context) =>
  fetch(
    `${context.provider.userinfo.url}?client_secret=${context.client.client_secret}&token=${context.tokens.access_token}`
  ).then((res) => res.json());

/**
 * NextAuth.js configuration. See https://next-auth.js.org/configuration/initialization for details.
 * We use a custom OAuth provider to point NextAuth.js towards UCL API's OAuth system.
 * We also use NextAuth.js callbacks to ensure only Engineering users can login, and to grant admin privileges.
 */
export default NextAuth({
  providers: [
    {
      id: "uclapi",
      name: "UCL API",
      params: { grant_type: "authorization_code" },
      type: "oauth",
      authorization: "https://uclapi.com/oauth/authorise",
      token: {
        url: "https://uclapi.com/oauth/token",
        async request(context) {
          const tokens = await makeTokenRequest(context);
          return { tokens };
        },
      },
      userinfo: {
        url: "https://uclapi.com/oauth/user/data",
        async request(context) {
          return await makeUserInfoRequest(context);
        },
      },
      clientId: process.env.UCL_API_CLIENT_ID,
      clientSecret: process.env.UCL_API_CLIENT_SECRET,
      profile(profile) {
        return {
          id: profile.cn,
          name: profile.full_name,
          email: profile.email,
          image: "",
        };
      },
    },
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    session: async ({ session, token }) => {
      // Called on every request to get the session
      // Adds the isAdmin flag to the session.user object
      if (token?.sub != null && session?.user != null) {
        session.user.isAdmin = token.isAdmin;
        session.user.uclGroups = token.uclGroups;
      }
      return session;
    },
    jwt: async ({ token, profile }) => {
      // Called when a JWT is created (on sign in) or updated
      // Checks to see if the user should have admin privileges based on our db
      const isAdmin =
        (await prisma.enghub_users.findFirst({
          where: { email: { equals: token.email }, is_admin: { equals: true } },
        })) != null;

      token.isAdmin = isAdmin;
      if (profile) token.uclGroups = profile.ucl_groups;
      return token;
    },
  },
  events: {
    signIn: async (message) => {
      // Fired on successful logins
      // Make sure our database is up to date with this user's details
      // If they don't exist, add them
      await prisma.enghub_users.upsert({
        where: { email: message.user.email },
        update: { full_name: message.user.name },
        create: {
          full_name: message.user.name,
          email: message.user.email,
          is_admin: false,
        },
      });
    },
  },
  session: {
    maxAge: 24 * 60 * 60, // One day idle session expiry
  },
});
