"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, Users, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";
import { fetchAPI } from "@/utils/api"; // <-- IMPORT BARU
import { useSession } from "next-auth/react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

// Definisikan tipe data event
interface Event {
  id: string; // <-- UBAH: Spring Boot mengirim 'id', bukan '_id'
  title: string;
  date: string;
  location: string;
  spsLink?: string;
  registrantCount: number; // TODO: Backend Java perlu hitung ini. Untuk sekarang akan undefined/0.
}

// Definisikan tipe data pendaftar
interface Registrant {
  name: string;
  email: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const isAdmin = session?.user?.role === "admin";

  // State
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State untuk Dialog Pendaftar
  const [isRegistrantDialogOpen, setIsRegistrantDialogOpen] = useState(false);
  const [registrants, setRegistrants] = useState<Registrant[]>([]);
  const [selectedEventTitle, setSelectedEventTitle] = useState("");
  const [isLoadingRegistrants, setIsLoadingRegistrants] = useState(false);

  // State untuk Dialog Hapus
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // --- EFEK 1: Autentikasi ---
  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated" || !isAdmin) {
      router.push("/");
    }
  }, [status, isAdmin, router]);

  // --- EFEK 2: Ambil Semua Event ---
  useEffect(() => {
    if (status === "authenticated" && isAdmin) {
      const fetchEvents = async () => {
        try {
          setIsLoading(true);

          // UBAH: Pakai fetchAPI ke endpoint Java
          // Java return langsung Array: [{}, {}]
          const data = await fetchAPI("/api/events");

          // Adaptasi jika data kosong atau null
          // Pastikan data adalah array
          setEvents(Array.isArray(data) ? data : []);
        } catch (err: any) {
          // Gunakan any atau unknown
          setError(err.message || "Terjadi kesalahan yang tidak diketahui");
        } finally {
          setIsLoading(false);
        }
      };
      fetchEvents();
    }
  }, [status, isAdmin]);

  // --- FUNGSI HAPUS (Konfirmasi) ---
  const handleDeleteClick = (event: Event) => {
    setSelectedEventId(event.id); // UBAH: _id jadi id
    setSelectedEventTitle(event.title);
    setIsDeleteAlertOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedEventId) return;

    try {
      // UBAH: Endpoint DELETE Java: /api/events/{id}
      await fetchAPI(`/api/events/${selectedEventId}`, {
        method: "DELETE",
      });

      // Hapus event dari state secara lokal
      // UBAH: _id jadi id
      setEvents((prevEvents) => prevEvents.filter((event) => event.id !== selectedEventId));
      alert("Event berhasil dihapus");
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat menghapus");
    } finally {
      setIsDeleteAlertOpen(false);
      setSelectedEventId(null);
      setSelectedEventTitle("");
    }
  };

  // --- FUNGSI LIHAT PENDAFTAR (Fetch data) ---
  const handleViewRegistrants = async (event: Event) => {
    setSelectedEventTitle(event.title);
    setIsRegistrantDialogOpen(true);
    setIsLoadingRegistrants(true);
    setRegistrants([]);

    try {
      // UBAH: Endpoint Java untuk get pendaftar by event
      // Format: /api/registrations/event/{id}
      const data = await fetchAPI(`/api/registrations/event/${event.id}`);

      // Java return List<Registration>.
      // Note: Jika data user (nama/email) belum di-join di Backend Java,
      // data ini mungkin belum lengkap. Tapi logic frontend-nya sudah benar disini.
      setRegistrants(data || []);
    } catch (err: any) {
      setError(err.message || "Gagal memuat pendaftar");
    } finally {
      setIsLoadingRegistrants(false);
    }
  };

  // --- Helper ---
  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // --- Tampilan Loading ---
  if (isLoading || status === "loading") {
    return <div className="min-h-screen flex items-center justify-center">Memuat dashboard...</div>;
  }

  if (!isAdmin) return null;

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-12 py-12">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <Button onClick={() => router.push("/admin/edit/new")} className="gap-2 bg-blue-400">
              <Plus className="h-4 w-4" />
              Buat Event Baru
            </Button>
          </div>

          {error && <p className="text-red-500 mb-4">{error}</p>}

          <Card>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center">Judul Event</TableHead>
                    <TableHead className="text-center">Tanggal</TableHead>
                    <TableHead className="text-center">Lokasi</TableHead>
                    {/* <TableHead className="text-center">Pendaftar</TableHead> */}
                    <TableHead className="text-center">SPS Link</TableHead>
                    <TableHead className="text-center">Tindakan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                        Belum ada event. Buat event pertama Anda!
                      </TableCell>
                    </TableRow>
                  ) : (
                    events.map((event) => (
                      <TableRow key={event.id}>
                        {" "}
                        {/* UBAH: _id jadi id */}
                        <TableCell className="font-medium text-center">{event.title}</TableCell>
                        <TableCell className="text-center">{formatDate(event.date)}</TableCell>
                        <TableCell className="text-center">{event.location}</TableCell>
                        {/* <TableCell className="text-center">{event.registrantCount || 0}</TableCell> */}
                        <TableCell className="text-center">
                          {event.spsLink ? (
                            <a href={event.spsLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center gap-1 md:gap-2">
                            <Button variant="ghost" size="sm" onClick={() => router.push(`/admin/edit/${event.id}`)} className="gap-1">
                              <Edit className="h-4 w-4" />
                              Edit
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(event)} className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50">
                              <Trash2 className="h-4 w-4" />
                              Hapus
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleViewRegistrants(event)} className="gap-1">
                              <Users className="h-4 w-4" />
                              Lihat Pendaftar
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      </div>

      {/* Registrants Dialog */}
      <Dialog open={isRegistrantDialogOpen} onOpenChange={setIsRegistrantDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Pendaftar Event</DialogTitle>
            <DialogDescription>{selectedEventTitle}</DialogDescription>
          </DialogHeader>
          <div className="mt-4 max-h-[60vh] overflow-y-auto">
            {isLoadingRegistrants ? (
              <p className="text-center text-gray-500 py-8">Memuat pendaftar...</p>
            ) : registrants.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Belum ada pendaftar untuk event ini</p>
            ) : (
              <div className="space-y-3">
                {registrants.map((registrant, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{registrant?.name || "Nama belum tersedia"}</p>
                        <p className="text-sm text-gray-500">{registrant?.email || "Email belum tersedia"}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda Yakin?</AlertDialogTitle>
            <AlertDialogDescription>Tindakan ini akan menghapus event {selectedEventTitle} secara permanen. Semua data pendaftaran terkait juga akan dihapus.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={confirmDelete}>
              Ya, Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
// "use client";
// import { useRouter } from "next/navigation";
// import { Button } from "@/components/ui/button"; // <-- Ganti path ke alias
// import { Card } from "@/components/ui/card";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Plus, Edit, Trash2, Users, ExternalLink } from "lucide-react";
// import { useState, useEffect } from "react";
// import { fetchAPI } from "@/utils/api";
// import { useSession } from "next-auth/react"; // <-- IMPORT BARU
// import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"; // <-- IMPORT BARU

// // Definisikan tipe data event
// interface Event {
//   _id: string; // <-- Gunakan _id
//   title: string;
//   date: string;
//   location: string;
//   spsLink?: string;
//   registrantCount: number; // <-- Properti baru dari API
// }

// // Definisikan tipe data pendaftar
// interface Registrant {
//   name: string;
//   email: string;
// }

// export default function AdminDashboard() {
//   const router = useRouter();
//   const { data: session, status } = useSession(); // <-- Gunakan useSession
//   const isAdmin = session?.user?.role === "admin";

//   // State
//   const [events, setEvents] = useState<Event[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   // State untuk Dialog Pendaftar
//   const [isRegistrantDialogOpen, setIsRegistrantDialogOpen] = useState(false);
//   const [registrants, setRegistrants] = useState<Registrant[]>([]);
//   const [selectedEventTitle, setSelectedEventTitle] = useState("");
//   const [isLoadingRegistrants, setIsLoadingRegistrants] = useState(false);

//   // State untuk Dialog Hapus
//   const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
//   const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

//   // --- EFEK 1: Autentikasi ---
//   useEffect(() => {
//     if (status === "loading") return; // Tunggu
//     if (status === "unauthenticated" || !isAdmin) {
//       router.push("/"); // Tendang jika bukan admin
//     }
//   }, [status, isAdmin, router]);

//   // --- EFEK 2: Ambil Semua Event ---
//   useEffect(() => {
//     // Hanya ambil data jika user adalah admin
//     if (status === "authenticated" && isAdmin) {
//       const fetchEvents = async () => {
//         try {
//           setIsLoading(true);
//           const res = await fetch("/api/events"); // Panggil API yang sudah kita modif
//           if (!res.ok) throw new Error("Gagal memuat event");
//           const data = await res.json();
//           setEvents(data.events || []);
//         } catch (err: unknown) {
//           if (err instanceof Error) {
//             setError(err.message);
//           } else {
//             setError("Terjadi kesalahan yang tidak diketahui");
//           }
//         } finally {
//           setIsLoading(false);
//         }
//       };
//       fetchEvents();
//     }
//   }, [status, isAdmin]); // Dijalankan saat status admin berubah

//   // --- FUNGSI HAPUS (Konfirmasi) ---
//   const handleDeleteClick = (event: Event) => {
//     setSelectedEventId(event._id);
//     setSelectedEventTitle(event.title);
//     setIsDeleteAlertOpen(true);
//   };

//   const confirmDelete = async () => {
//     if (!selectedEventId) return;

//     try {
//       // Panggil API DELETE
//       const res = await fetch(`/api/events/${selectedEventId}`, {
//         method: "DELETE",
//       });

//       if (!res.ok) {
//         const data = await res.json();
//         throw new Error(data.message || "Gagal menghapus event");
//       }

//       // Hapus event dari state secara lokal
//       setEvents((prevEvents) => prevEvents.filter((event) => event._id !== selectedEventId));
//       alert("Event berhasil dihapus");
//     } catch (err: unknown) {
//       if (err instanceof Error) {
//         setError(err.message);
//       } else {
//         setError("Terjadi kesalahan yang tidak diketahui");
//       }
//     } finally {
//       setIsDeleteAlertOpen(false);
//       setSelectedEventId(null);
//       setSelectedEventTitle("");
//     }
//   };

//   // --- FUNGSI LIHAT PENDAFTAR (Fetch data) ---
//   const handleViewRegistrants = async (event: Event) => {
//     setSelectedEventTitle(event.title);
//     setIsRegistrantDialogOpen(true);
//     setIsLoadingRegistrants(true);
//     setRegistrants([]); // Kosongkan list sebelumnya

//     try {
//       // Panggil API baru kita
//       const res = await fetch(`/api/registrations/by-event?eventId=${event._id}`);
//       if (!res.ok) throw new Error("Gagal memuat pendaftar");
//       const data = await res.json();
//       setRegistrants(data.registrants || []);
//     } catch (err: unknown) {
//       if (err instanceof Error) {
//         setError(err.message);
//       } else {
//         setError("Terjadi kesalahan yang tidak diketahui");
//       }
//     } finally {
//       setIsLoadingRegistrants(false);
//     }
//   };

//   // --- Helper (Sudah Benar) ---
//   const formatDate = (dateString: string) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString("id-ID", {
//       day: "numeric",
//       month: "short",
//       year: "numeric",
//     });
//   };

//   // --- Tampilan Loading ---
//   if (isLoading || status === "loading") {
//     return <div className="min-h-screen flex items-center justify-center">Memuat dashboard...</div>;
//   }

//   if (!isAdmin) return null;

//   return (
//     <>
//       <div className="min-h-screen bg-gray-50">
//         <div className="container mx-auto px-12 py-12">
//           <div className="flex items-center justify-between mb-8">
//             <h1 className="text-3xl font-bold">Dashboard</h1>
//             <Button onClick={() => router.push("/admin/edit/new")} className="gap-2 bg-blue-400">
//               <Plus className="h-4 w-4" />
//               Buat Event Baru
//             </Button>
//           </div>

//           {error && <p className="text-red-500 mb-4">{error}</p>}

//           <Card>
//             <div className="overflow-x-auto">
//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead className="text-center">Judul Event</TableHead>
//                     <TableHead className="text-center">Tanggal</TableHead>
//                     <TableHead className="text-center">Lokasi</TableHead>
//                     <TableHead className="text-center">Pendaftar</TableHead>
//                     <TableHead className="text-center">SPS Link</TableHead>
//                     <TableHead className="text-center">Tindakan</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {events.length === 0 ? (
//                     <TableRow>
//                       <TableCell colSpan={6} className="text-center text-gray-500 py-8">
//                         Belum ada event. Buat event pertama Anda!
//                       </TableCell>
//                     </TableRow>
//                   ) : (
//                     events.map((event) => (
//                       <TableRow key={event._id}>
//                         <TableCell className="font-medium text-center">{event.title}</TableCell>
//                         <TableCell className="text-center">{formatDate(event.date)}</TableCell>
//                         <TableCell className="text-center">{event.location}</TableCell>
//                         <TableCell className="text-center">{event.registrantCount}</TableCell> {/* Ganti ke registrantCount */}
//                         <TableCell className="text-center">
//                           {event.spsLink ? (
//                             <a href={event.spsLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline">
//                               <ExternalLink className="h-4 w-4" />
//                             </a>
//                           ) : (
//                             <span className="text-gray-400">-</span>
//                           )}
//                         </TableCell>
//                         <TableCell className="text-center">
//                           <div className="flex justify-center gap-1 md:gap-2">
//                             <Button variant="ghost" size="sm" onClick={() => router.push(`/admin/edit/${event._id}`)} className="gap-1">
//                               <Edit className="h-4 w-4" />
//                               Edit
//                             </Button>
//                             <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(event)} className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50">
//                               <Trash2 className="h-4 w-4" />
//                               Hapus
//                             </Button>
//                             <Button variant="ghost" size="sm" onClick={() => handleViewRegistrants(event)} className="gap-1">
//                               <Users className="h-4 w-4" />
//                               Lihat Pendaftar
//                             </Button>
//                           </div>
//                         </TableCell>
//                       </TableRow>
//                     ))
//                   )}
//                 </TableBody>
//               </Table>
//             </div>
//           </Card>
//         </div>
//       </div>

//       {/* Registrants Dialog */}
//       <Dialog open={isRegistrantDialogOpen} onOpenChange={setIsRegistrantDialogOpen}>
//         <DialogContent className="max-w-2xl">
//           <DialogHeader>
//             <DialogTitle>Pendaftar Event</DialogTitle>
//             <DialogDescription>{selectedEventTitle}</DialogDescription>
//           </DialogHeader>
//           <div className="mt-4 max-h-[60vh] overflow-y-auto">
//             {isLoadingRegistrants ? (
//               <p className="text-center text-gray-500 py-8">Memuat pendaftar...</p>
//             ) : registrants.length === 0 ? (
//               <p className="text-center text-gray-500 py-8">Belum ada pendaftar untuk event ini</p>
//             ) : (
//               <div className="space-y-3">
//                 {registrants.map((registrant, index) => (
//                   <Card key={index} className="p-4">
//                     <div className="flex items-center justify-between">
//                       <div>
//                         <p className="font-medium">{registrant?.name}</p>
//                         <p className="text-sm text-gray-500">{registrant?.email}</p>
//                       </div>
//                     </div>
//                   </Card>
//                 ))}
//               </div>
//             )}
//           </div>
//         </DialogContent>
//       </Dialog>

//       {/* Delete Confirmation Dialog */}
//       <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Apakah Anda Yakin?</AlertDialogTitle>
//             <AlertDialogDescription>Tindakan ini akan menghapus event {selectedEventTitle} secara permanen. Semua data pendaftaran terkait juga akan dihapus.</AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel>Batal</AlertDialogCancel>
//             <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={confirmDelete}>
//               Ya, Hapus
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </>
//   );
// }
