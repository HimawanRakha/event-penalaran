"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, MapPin, User, Clock, X, ExternalLink, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { fetchAPI } from "@/utils/api";
import { Skeleton } from "@/components/ui/skeleton";

interface Event {
  id: string;
  title: string;
  date: string;
  time?: string;
  location: string;
  images?: string[];
  description?: string;
}

export default function UserDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") {
      return;
    }

    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated" && session?.user) {
      const fetchUserEvents = async () => {
        try {
          setIsLoading(true);
          const user = session.user as { id: string };
          const data = await fetchAPI(`/api/registrations/my-events?userId=${user.id}`);
          setEvents(Array.isArray(data) ? data : []);
        } catch (err: any) {
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      };

      fetchUserEvents();
    }
  }, [status, router]);
  const handleUnregister = async (eventId: string) => {
    if (!session?.user) return;
    
    try {
      const user = session.user as { id: string };
      await fetchAPI(`/api/registrations?userId=${user.id}&eventId=${eventId}`, {
        method: "DELETE",
      });
      setEvents((prevEvents) => prevEvents.filter((event) => event.id !== eventId));
      alert("Pendaftaran berhasil dibatalkan");
    } catch (err: any) {
      alert(`Gagal membatalkan: ${err.message}`);
    } finally {
      setIsAlertOpen(false);
      setSelectedEventId(null);
    }
  };
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return null;
    const [hours, minutes] = timeString.split(":");
    return `${hours}:${minutes} WIB`;
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading || status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            <Skeleton className="h-64 w-full mb-8 rounded-2xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-64 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const user = session.user as { name: string; email: string; role: string };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-white shadow-lg">
                  <AvatarFallback className="bg-white text-blue-600 text-2xl font-bold">
                    {getInitials(user.name || "U")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                    <h1 className="text-3xl md:text-4xl font-bold">{user.name}</h1>
                    {user.role === "admin" && (
                      <Badge className="bg-yellow-400 text-yellow-900 hover:bg-yellow-500">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Admin
                      </Badge>
                    )}
                  </div>
                  <p className="text-blue-100 text-lg mb-4">{user.email}</p>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-blue-100">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      <span>{events.length} Event Terdaftar</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardDescription>Total Event</CardDescription>
                  <CardTitle className="text-3xl font-bold text-blue-600">{events.length}</CardTitle>
                </CardHeader>
              </Card>
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardDescription>Status Akun</CardDescription>
                  <CardTitle className="text-3xl font-bold text-green-600">
                    {user.role === "admin" ? "Admin" : "Aktif"}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardDescription>Bergabung</CardDescription>
                  <CardTitle className="text-lg font-semibold text-gray-600">Event Penalaran</CardTitle>
                </CardHeader>
              </Card>
            </div>
            <div className="mb-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Event Saya</h2>
                  <p className="text-gray-600 mt-1">Daftar event yang telah Anda ikuti</p>
                </div>
                <Button
                  onClick={() => router.push("/")}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Cari Event
                </Button>
              </div>

              {error && (
                <Card className="mb-6 border-red-200 bg-red-50">
                  <CardContent className="pt-6">
                    <p className="text-red-600">{error}</p>
                  </CardContent>
                </Card>
              )}

              {events.length === 0 ? (
                <Card className="border-2 border-dashed border-gray-300 bg-white/50 backdrop-blur-sm">
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <div className="rounded-full bg-blue-100 p-6 mb-4">
                      <Calendar className="h-12 w-12 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Belum Ada Event</h3>
                    <p className="text-gray-600 text-center mb-6 max-w-md">
                      Anda belum mendaftar event apapun. Jelajahi event yang tersedia dan daftar sekarang!
                    </p>
                    <Button
                      onClick={() => router.push("/")}
                      size="lg"
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    >
                      Jelajahi Event
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {events.map((event) => (
                    <Card
                      key={event.id}
                      className="group border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white/90 backdrop-blur-sm overflow-hidden hover:-translate-y-1"
                    >
                      {event.images && event.images.length > 0 && (
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={event.images[0]}
                            alt={event.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            onError={(e) => {
                              e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23e5e7eb' width='400' height='300'/%3E%3Ctext fill='%23999' x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle'%3EEvent Image%3C/text%3E%3C/svg%3E";
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        </div>
                      )}
                      <CardHeader>
                        <CardTitle className="line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {event.title}
                        </CardTitle>
                        <CardDescription className="flex flex-col gap-2 mt-3">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="h-4 w-4 text-blue-600" />
                            <span className="text-sm">{formatDate(event.date)}</span>
                            {event.time && (
                              <>
                                <Clock className="h-4 w-4 text-purple-600 ml-2" />
                                <span className="text-sm">{formatTime(event.time)}</span>
                              </>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <MapPin className="h-4 w-4 text-red-600" />
                            <span className="text-sm line-clamp-1">{event.location}</span>
                          </div>
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            className="flex-1 border-blue-200 hover:bg-blue-50 hover:border-blue-300"
                            onClick={() => router.push(`/event/${event.id}`)}
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Detail
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => {
                              setSelectedEventId(event.id);
                              setIsAlertOpen(true);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
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
