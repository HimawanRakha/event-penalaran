import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { fetchAPI } from "@/utils/api";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email dan password wajib diisi");
        }

        try {
          // Panggil Spring Boot BE untuk login
          const response = await fetchAPI("/api/auth/login", {
            method: "POST",
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          // Spring Boot return AuthResponse dengan id, name, email, role
          return {
            id: response.id,
            name: response.name,
            email: response.email,
            role: response.role.toLowerCase(), // Convert ADMIN -> admin untuk konsistensi
          };
        } catch (error: any) {
          throw new Error(error.message || "Email atau password salah");
        }
      },
    }),
  ],
  callbacks: {
    // Menambahkan role dan id ke token JWT
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    // Menambahkan role dan id ke Sesi (Client-side)
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login", // Halaman login kustom Anda
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
