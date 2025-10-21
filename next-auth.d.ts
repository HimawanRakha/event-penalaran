// Import modul asli
import "next-auth";
import "next-auth/jwt";

// Deklarasikan modul untuk diperluas
declare module "next-auth" {
  /**
   * Perluas tipe 'Session' default
   */
  interface Session {
    user: {
      id: string; // <-- Tambahkan ID Anda
      role: string; // <-- Tambahkan Role Anda
    } & DefaultSession["user"]; // <-- Gabungkan dengan tipe default
  }

  /**
   * Perluas tipe 'User' default (digunakan di callback 'authorize')
   */
  interface User {
    id: string;
    role: string;
  }
}

declare module "next-auth/jwt" {
  /**
   * Perluas tipe 'JWT' default
   */
  interface JWT {
    id: string;
    role: string;
  }
}
