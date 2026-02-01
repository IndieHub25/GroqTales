import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { clientPromise, connectMongoose } from "@/lib/db";
import { User } from "../../models/User";
import bcrypt from "bcryptjs";
import { MongoClient } from "mongodb";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: MongoDBAdapter(clientPromise as Promise<MongoClient>),
  
  session: { strategy: "jwt" },
  
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        await connectMongoose();
        const user = await User.findOne({ email: credentials.email }).select("+password");

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        const isValid = await bcrypt.compare(
          credentials.password as string, 
          user.password
        );

        if (!isValid) {
          throw new Error("Invalid credentials");
        }

        return { 
          id: user._id.toString(), 
          email: user.email, 
          name: user.displayName || user.username || "User" 
        };
      },
    }),
  ],
  
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
  
  secret: process.env.NEXTAUTH_SECRET,
});