import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Type augmentation to include id and role in session
declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            role: string;
            name?: string | null;
            email?: string | null;
            image?: string | null;
        }
    }
}

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma) as any,
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email", placeholder: "admin@example.com" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;
                const normalizedEmail = credentials.email.toLowerCase();
                const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
                if (!user || !user.passwordHash) return null;
                const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);
                if (!isPasswordValid) return null;

                if (user.isActive === false) {
                    throw new Error("Your account is disabled. Please contact your Administrator.");
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role
                    // explicitly do not return image here to prevent JWT bloat natively
                };
            }
        })
    ],
    session: { strategy: "jwt" },
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            // Explicitly strip the auto-populated OpenID `picture` field that NextAuth maps from Prisma
            if (token.picture) delete token.picture;
            if ((token as any).image) delete (token as any).image;

            if (user) {
                token.role = (user as any).role;
                token.id = user.id;
                token.name = user.name;
            }
            if (trigger === "update" && session) {
                if (session.name !== undefined) token.name = session.name;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.role = token.role as string;
                session.user.id = token.id as string;
                session.user.name = token.name as string | null | undefined;

                // Dynamically fetch the image from the DB so we don't bloat the JWT cookie
                const dbUser = await prisma.user.findUnique({
                    where: { id: token.id as string },
                    select: { image: true }
                });
                if (dbUser) {
                    session.user.image = dbUser.image;
                }
            }
            return session;
        }
    },
    pages: { signIn: '/login' }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
