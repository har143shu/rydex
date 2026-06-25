import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { connectDB } from "./lib/db";
import User from "./models/user.model";
import bcrypt from "bcryptjs";
import Google from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: {
          type: "email",
          label: "Email",
          placeholder: "johndoe@gmail.com",
        },
        password: {
          type: "password",
          label: "Password",
          placeholder: "*****",
        },
      },
      async authorize(credentials) {
        //1 user check
        if (!credentials.email || !credentials.password) {
          throw new Error("User information missing!!");
        }
        const email = credentials.email;
        const password = credentials.password as string;
        await connectDB();
        const user = await User.findOne({ email });
        if (!user) {
          throw new Error("User not  found!!");
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
          throw new Error("Password field is incorrect");
        }
        return {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
    if (account?.provider === "google") {
      await connectDB();
      // Let use karo taaki hum isko baad mein update kar sakein
      let dbUser = await User.findOne({ email: user.email });
      
      // Agar user nahi mila, toh create karo aur wapas dbUser mein assign kar do
      if (!dbUser) {
        dbUser = await User.create({
          name: user.name,
          email: user.email,
          role: "user" // Default role bhi de dena chahiye
        });
      }

      // Ab error nahi aayega kyunki dbUser hamesha available hoga (chahe naya ho ya purana)
      user.id = dbUser._id;
      user.role = dbUser.role;
    }

    return true; // Login allow kardo
  },
    // Step 1: Token banate waqt user ki details token me daalo
    async jwt({ token, user }) {
      // 'user' object sirf login ke time par explicitly available hota hai
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.role = user.role; // Example custom field
      }
      return token;
    },
    // Step 2: Token se nikal kar data session me pass karo
    async session({ session, token }) {
      // Agar token available hai toh session object ko update kardo
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/signin",
    error: "/signin",
  },

  session: {
    strategy: "jwt",
    maxAge: 10 * 24 * 60 * 60,
  },

  secret: process.env.AUTH_SECRET,
});
