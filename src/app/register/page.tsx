"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff } from "lucide-react";
import { fetchAPI } from "@/utils/api"; // <--- 1. IMPORT BARU

export default function Register() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminCode, setAdminCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password) {
      setError("Mohon isi semua field yang wajib");
      return;
    }

    try {
      // Panggil Spring Boot BE untuk register
      await fetchAPI("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name,
          email,
          password,
          adminCode: adminCode || "", // Kirim adminCode, backend akan handle logic
        }),
      });

      alert("Registrasi berhasil! Silakan login.");
      router.push("/login");
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat registrasi");
    }
  };

  // ... JSX TAMPILAN DI BAWAH INI TIDAK BERUBAH ...
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <Card className="w-full max-w-md">
        {/* ... Isi form sama persis ... */}
        <CardHeader>
          <CardTitle>Buat Akun Baru</CardTitle>
          <CardDescription>Daftar untuk mulai mengikuti event penalaran</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          {/* ... Input fields sama persis ... */}
          <CardContent className="space-y-4">
            {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{error}</div>}

            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Masukkan nama lengkap" required />
            </div>

            {/* ... Sisa input field email, password, adminCode ... */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@example.com" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Masukkan password" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminCode" className="text-sm text-gray-500">
                Kode Admin (Opsional)
              </Label>
              <Input id="adminCode" type="text" value={adminCode} onChange={(e) => setAdminCode(e.target.value)} placeholder="Kosongkan jika Anda anggota" />
            </div>
          </CardContent>
          <div className="pt-4">
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full">
                Daftar
              </Button>
              <p className="text-sm text-center text-gray-600">
                Sudah punya akun?{" "}
                <Link href="/login" className="text-gray-900 hover:underline">
                  Login di sini
                </Link>
              </p>
            </CardFooter>
          </div>
        </form>
      </Card>
    </div>
  );
}

// "use client";
// import { useState } from "react";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { Button } from "../../components/ui/button";
// import { Input } from "../../components/ui/input";
// import { Label } from "../../components/ui/label";
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
// import { Eye, EyeOff } from "lucide-react";

// export default function Register() {
//   const router = useRouter();
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [adminCode, setAdminCode] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [error, setError] = useState("");

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError("");

//     if (!name || !email || !password) {
//       setError("Mohon isi semua field yang wajib");
//       return;
//     }

//     try {
//       // Ganti logika `register` lokal dengan `fetch`
//       const res = await fetch("/api/register", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ name, email, password, adminCode }),
//       });

//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message);

//       alert("Registrasi berhasil! Silakan login.");
//       router.push("/login");
//     } catch (err: any) {
//       setError(err.message);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
//       <Card className="w-full max-w-md">
//         <CardHeader>
//           <CardTitle>Buat Akun Baru</CardTitle>
//           <CardDescription>Daftar untuk mulai mengikuti event penalaran</CardDescription>
//         </CardHeader>
//         <form onSubmit={handleSubmit}>
//           <CardContent className="space-y-4">
//             {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{error}</div>}

//             <div className="space-y-2">
//               <Label htmlFor="name">Nama Lengkap</Label>
//               <Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Masukkan nama lengkap" required />
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="email">Email</Label>
//               <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@example.com" required />
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="password">Password</Label>
//               <div className="relative">
//                 <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Masukkan password" required />
//                 <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
//                   {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
//                 </button>
//               </div>
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="adminCode" className="text-sm text-gray-500">
//                 Kode Admin (Opsional)
//               </Label>
//               <Input id="adminCode" type="text" value={adminCode} onChange={(e) => setAdminCode(e.target.value)} placeholder="Kosongkan jika Anda anggota" />
//             </div>
//           </CardContent>
//           <div className="pt-4">
//             <CardFooter className="flex flex-col gap-4">
//               <Button type="submit" className="w-full">
//                 Daftar
//               </Button>
//               <p className="text-sm text-center text-gray-600">
//                 Sudah punya akun?{" "}
//                 <Link href="/login" className="text-gray-900 hover:underline">
//                   Login di sini
//                 </Link>
//               </p>
//             </CardFooter>
//           </div>
//         </form>
//       </Card>
//     </div>
//   );
// }
