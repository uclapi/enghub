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
      if (token?.sub != null && session?.user != null) {
        session.user.id = token.sub;
        session.user.isAdmin = token.isAdmin;
      }
      return session;
    },
    jwt: async ({ token }) => {
      const isAdmin =
        (await prisma.admins.findFirst({
          where: { cn: { equals: token.sub } },
        })) != null;

      token.isAdmin = isAdmin;
      return token;
    },
  },
  session: {
    maxAge: 24 * 60 * 60 // One day idle session expiry
  }
});
