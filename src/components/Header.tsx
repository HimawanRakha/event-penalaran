"use client";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";

export function Header() {
  const router = useRouter();
  const pathname = usePathname();

  const { data: session, status } = useSession();

  const user = session?.user;
  const isAdmin = session?.user?.role === "admin";

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  const linkWrapperClasses = "h-16 flex items-center group";

  const spanBaseClasses = "pb-1 border-b-2 transition-all";

  const spanInactiveClasses = "text-gray-500 border-transparent group-hover:text-gray-600 group-hover:border-gray-300";

  const spanActiveClasses = "text-gray-900 font-medium border-blue-400";

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center font-bold text-lg ps-4">
          <Image src="/logo-penalaran.JPG" alt="EventPenalaran Logo" width={32} height={32} className="mr-2" />
          <span className="hidden sm:inline">EventPenalaran</span>
        </Link>

        <nav className="flex items-center h-16">
          <div className="flex items-center gap-6 h-full">
            <Link href="/" className={linkWrapperClasses}>
              <span className={`${spanBaseClasses} ${pathname === "/" ? spanActiveClasses : spanInactiveClasses}`}>Events</span>
            </Link>

            {status === "loading" && <span className="text-sm text-gray-500">Memuat...</span>}

            {status === "authenticated" && user && (
              <>
                {isAdmin ? (
                  <Link href="/admin/dashboard" className={linkWrapperClasses}>
                    <span className={`${spanBaseClasses} ${pathname?.startsWith("/admin") ? spanActiveClasses : spanInactiveClasses}`}>Admin</span>
                  </Link>
                ) : (
                  <Link href="/dashboard" className={linkWrapperClasses}>
                    <span className={`${spanBaseClasses} ${pathname === "/dashboard" ? spanActiveClasses : spanInactiveClasses}`}>Dashboard</span>
                  </Link>
                )}
              </>
            )}

            {status === "unauthenticated" && (
              <>
                <Link href="/login" className={linkWrapperClasses}>
                  <span className={`${spanBaseClasses} ${pathname === "/login" ? spanActiveClasses : spanInactiveClasses}`}>Login</span>
                </Link>
              </>
            )}
          </div>
          <div className="flex items-center gap-3 ml-6">
            {status === "authenticated" && user && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 hidden sm:block">{user.name}</span>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </div>
            )}

            {status === "unauthenticated" && (
              <Button asChild variant="default">
                <Link href="/register">Register</Link>
              </Button>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
