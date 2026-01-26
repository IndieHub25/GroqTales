import bcrypt from 'bcryptjs';
import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';

import connectDB from '@/lib/mongoose';
import { User } from '../models/User';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }

        await connectDB();

        const user = await User.findOne({ email: credentials.email }).select(
          '+password'
        );

        if (!user || !user.password) {
          throw new Error('Invalid credentials');
        }

        const isMatch = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!isMatch) {
          throw new Error('Invalid credentials');
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.displayName || user.username,
        };
      },
    }),
  ],

  session: {
    strategy: 'jwt',
  },

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        if (!user.email) {
          return false;
        }

        try {
          await connectDB();

          const existingUser = await User.findOne({ email: user.email });

          let dbUser = existingUser;
          if (!existingUser) {
            dbUser = await User.create({
              email: user.email,
              displayName: user.name || '',
              image: user.image || '',
              authProvider: 'google',
              googleId: account.providerAccountId,
            });
          } else if (!existingUser.googleId) {
            // Update existing user with googleId if missing
            existingUser.googleId = account.providerAccountId;
            await existingUser.save();
          }

          // Set the DB user ID for session
          user.id = dbUser!._id.toString();

          return true;
        } catch (error: any) {
          console.error('Error checking or creating user:', {
            message: error?.message,
            code: error?.code,
            ...(process.env.NODE_ENV === 'development' && {
              stack: error?.stack,
            }),
          });
          return false;
        }
      }
      return true;
    },

    async session({ session, token }) {
      if (token && session.user) {
        // @ts-expect-error - NextAuth types don't include id on user
        session.user.id = token.sub;
      }
      return session;
    },

    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },

  secret: process.env.NEXTAUTH_SECRET,
};
