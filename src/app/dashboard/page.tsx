"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button"; // Ganti path ke alias
import { Card } from "@/components/ui/card";
import { Calendar, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

// Definisikan tipe data event untuk TypeScript
interface Event {
  _id: string; // MongoDB menggunakan _id
  title: string;
  date: string;
  location: string;
}

export default function UserDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession(); // <-- Gunakan useSession

  // State untuk data, loading, dan dialog konfirmasi
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // --- EFEK 1: Melindungi Halaman & Mengambil Data ---
  useEffect(() => {
    // Jika status sesi masih loading, jangan lakukan apa-apa
    if (status === "loading") {
      return;
    }

    // Jika user tidak login, tendang ke halaman login
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    // Jika user sudah login, ambil data event-nya
    if (status === "authenticated") {
      const fetchUserEvents = async () => {
        try {
          setIsLoading(true);
          // Panggil API yang baru kita buat
          const res = await fetch("/api/registrations/my-events");
          if (!res.ok) {
            throw new Error("Gagal memuat data event");
          }
          const data = await res.json();
          setEvents(data.events || []);
        } catch (err: any) {
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      };

      fetchUserEvents();
    }
  }, [status, router]); // Dijalankan setiap kali status sesi berubah

  // --- FUNGSI BATAL DAFTAR (Menggunakan API) ---
  const handleUnregister = async (eventId: string) => {
    try {
      // Panggil API DELETE dari halaman EventDetail
      const res = await fetch(`/api/registrations?eventId=${eventId}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      // Update state secara lokal agar UI langsung berubah tanpa refresh
      setEvents((prevEvents) => prevEvents.filter((event) => event._id !== eventId));
      alert("Pendaftaran berhasil dibatalkan");
    } catch (err: any) {
      alert(`Gagal membatalkan: ${err.message}`);
    } finally {
      // Tutup dialog konfirmasi
      setIsAlertOpen(false);
      setSelectedEventId(null);
    }
  };

  // --- Fungsi helper (Sudah Benar) ---
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // --- Tampilan Loading ---
  if (isLoading || status === "loading") {
    return <div className="min-h-screen flex items-center justify-center">Memuat data...</div>;
  }

  // Jika user tidak login (seharusnya sudah di-redirect, tapi ini pengaman)
  if (!session) return null;

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Event Saya</h1>

            {error && <p className="text-red-500 mb-4">{error}</p>}

            {events.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-gray-500 mb-6">Anda belum mendaftar event apapun.</p>
                <Button onClick={() => router.push("/")}>Cari Event Sekarang</Button>
              </Card>
            ) : (
              <div className="space-y-4">
                {events.map((event) => (
                  <Card key={event._id} className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(event.date)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{event.location}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => router.push(`/event/${event._id}`)}>
                          Lihat Detail
                        </Button>
                        {/* Tombol ini sekarang membuka dialog, bukan langsung menghapus */}
                        <Button
                          variant="ghost"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => {
                            setSelectedEventId(event._id);
                            setIsAlertOpen(true);
                          }}
                        >
                          Batalkan Pendaftaran
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dialog Konfirmasi Pembatalan */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda Yakin?</AlertDialogTitle>
            <AlertDialogDescription>Tindakan ini akan membatalkan pendaftaran Anda pada event ini. Anda tidak bisa mengurungkannya.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedEventId(null)}>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (selectedEventId) {
                  handleUnregister(selectedEventId);
                }
              }}
            >
              Ya, Batalkan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
