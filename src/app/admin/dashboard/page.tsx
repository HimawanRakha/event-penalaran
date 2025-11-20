"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, Users, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";
import { fetchAPI } from "@/utils/api";
import { useSession } from "next-auth/react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  spsLink?: string;
  registrantCount: number;
}

interface Registrant {
  name: string;
  email: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const isAdmin = session?.user?.role === "admin";

  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isRegistrantDialogOpen, setIsRegistrantDialogOpen] = useState(false);
  const [registrants, setRegistrants] = useState<Registrant[]>([]);
  const [selectedEventTitle, setSelectedEventTitle] = useState("");
  const [isLoadingRegistrants, setIsLoadingRegistrants] = useState(false);

  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated" || !isAdmin) {
      router.push("/");
    }
  }, [status, isAdmin, router]);

  useEffect(() => {
    if (status === "authenticated" && isAdmin) {
      const fetchEvents = async () => {
        try {
          setIsLoading(true);
          const data = await fetchAPI("/api/events");
          setEvents(Array.isArray(data) ? data : []);
        } catch (err: any) {
          setError(err.message || "Terjadi kesalahan yang tidak diketahui");
        } finally {
          setIsLoading(false);
        }
      };
      fetchEvents();
    }
  }, [status, isAdmin]);

  const handleDeleteClick = (event: Event) => {
    setSelectedEventId(event.id);
    setSelectedEventTitle(event.title);
    setIsDeleteAlertOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedEventId) return;

    try {
      await fetchAPI(`/api/events/${selectedEventId}`, {
        method: "DELETE",
      });
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

  const handleViewRegistrants = async (event: Event) => {
    setSelectedEventTitle(event.title);
    setIsRegistrantDialogOpen(true);
    setIsLoadingRegistrants(true);
    setRegistrants([]);

    try {
      const data = await fetchAPI(`/api/registrations/event/${event.id}`);
      setRegistrants(data || []);
    } catch (err: any) {
      setError(err.message || "Gagal memuat pendaftar");
    } finally {
      setIsLoadingRegistrants(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

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
                        <TableCell className="font-medium text-center">{event.title}</TableCell>
                        <TableCell className="text-center">{formatDate(event.date)}</TableCell>
                        <TableCell className="text-center">{event.location}</TableCell>
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

