"use client";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, User, Clock, ArrowLeft, CheckCircle2, XCircle, Sparkles } from "lucide-react";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { fetchAPI } from "@/utils/api";
import { Skeleton } from "@/components/ui/skeleton";

interface PopulatedEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time?: string;
  location: string;
  images: string[];
  creatorId?: string;
  creator?: {
    id: string;
    name: string;
  };
}

export default function EventDetail() {
  const params = useParams();
  const { id } = params as { id: string };
  const router = useRouter();
  const { data: session, status } = useSession();
  const user = session?.user as { id: string; role: string; name: string } | undefined;

  const [event, setEvent] = useState<PopulatedEvent | null>(null);
  const [registered, setRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (!id) return;

    const fetchEvent = async () => {
      try {
        setIsLoading(true);
        const data = await fetchAPI(`/api/events/${id}`);
        setEvent(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  useEffect(() => {
    if (status === "authenticated" && event && user?.id) {
      const checkRegistration = async () => {
        try {
          const isRegistered = await fetchAPI(`/api/registrations/check?userId=${user.id}&eventId=${id}`);
          setRegistered(isRegistered);
        } catch (err) {
          console.error("Gagal mengecek registrasi:", err);
        }
      };
      checkRegistration();
    }
  }, [status, event, id, user?.id]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return "-";
    const [hours, minutes] = timeString.split(":");
    return `${hours}:${minutes} WIB`;
  };

  const getDayName = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
    });
  };

  const handleRegister = async () => {
    if (!session || !id || !user?.id) {
      alert("Session error. Silakan login ulang.");
      return;
    }
    try {
      await fetchAPI("/api/registrations", {
        method: "POST",
        body: JSON.stringify({
          userId: user.id,
          eventId: id,
        }),
      });

      setRegistered(true);
      alert("Berhasil mendaftar event!");
    } catch (err: any) {
      alert(`Gagal mendaftar: ${err.message}`);
    }
  };

  const handleUnregister = async () => {
    if (!user?.id) return;

    try {
      await fetchAPI(`/api/registrations?userId=${user.id}&eventId=${id}`, {
        method: "DELETE",
      });
      setRegistered(false);
      alert("Pendaftaran dibatalkan");
    } catch (err: any) {
      alert(`Gagal batal: ${err.message}`);
    }
  };
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Skeleton className="w-full h-[60vh] rounded-none" />
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <Skeleton className="h-12 w-3/4 mb-6" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4 border-0 shadow-xl">
          <CardContent className="pt-6 text-center">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{error || "Event tidak ditemukan"}</h2>
            <p className="text-gray-600 mb-6">Event yang Anda cari tidak tersedia atau telah dihapus.</p>
            <Button onClick={() => router.push("/")} className="bg-gradient-to-r from-blue-600 to-indigo-600">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali ke Beranda
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const images = event.images && event.images.length > 0 ? event.images : ["/placeholder.jpg"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="relative w-full h-[60vh] md:h-[70vh] overflow-hidden">
        {images.length === 1 ? (
          <div className="relative w-full h-full">
            <ImageWithFallback src={images[0]} alt={event.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          </div>
        ) : (
          <Carousel className="w-full h-full">
            <CarouselContent>
              {images.map((image, index) => (
                <CarouselItem key={index}>
                  <div className="relative w-full h-full">
                    <ImageWithFallback src={image} alt={`${event.title} - ${index + 1}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-4 text-white border-white/20 hover:bg-white/20" />
            <CarouselNext className="right-4 text-white border-white/20 hover:bg-white/20" />
          </Carousel>
        )}

        <div className="absolute top-4 left-4 z-10">
          <Button variant="secondary" size="sm" onClick={() => router.push("/")} className="bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
          <div className="container mx-auto max-w-4xl">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">{event.title}</h1>
            {registered && (
              <Badge className="bg-green-500 hover:bg-green-600 text-white mb-4">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Anda Terdaftar
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Calendar className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Tanggal</p>
                      <p className="font-semibold text-gray-900">{formatDate(event.date)}</p>
                      <p className="text-xs text-gray-500">{getDayName(event.date)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-red-100 rounded-lg">
                      <MapPin className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Lokasi</p>
                      <p className="font-semibold text-gray-900 line-clamp-2">{event.location}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            {event.time && (
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <Clock className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Waktu</p>
                      <p className="font-semibold text-gray-900">{formatTime(event.time)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="pt-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Tentang Event</h2>
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">{event.description}</p>
                </div>
              </CardContent>
            </Card>
            {event.creator && (
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-100 rounded-lg">
                      <User className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Diselenggarakan oleh</p>
                      <p className="font-semibold text-gray-900">{event.creator.name}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white sticky top-8">
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold mb-2">Bergabung Sekarang</h3>
                    <p className="text-blue-100 text-sm">Daftarkan diri Anda untuk mengikuti event ini dan dapatkan pengalaman yang berharga.</p>
                  </div>

                  <div className="pt-4 border-t border-white/20">
                    {status === "loading" ? (
                      <Button size="lg" className="w-full bg-white/20 hover:bg-white/30" disabled>
                        Memuat...
                      </Button>
                    ) : !session ? (
                      <Button size="lg" className="w-full bg-white text-blue-600 hover:bg-blue-50" asChild>
                        <Link href="/login">Login untuk Mendaftar</Link>
                      </Button>
                    ) : isAdmin ? (
                      <div className="space-y-3">
                        <Button size="lg" className="w-full bg-white text-blue-600 hover:bg-blue-50" asChild>
                          <Link href={`/admin/edit/${id}`}>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Edit Event
                          </Link>
                        </Button>
                        <p className="text-xs text-blue-100 text-center">Anda adalah admin event ini</p>
                      </div>
                    ) : registered ? (
                      <div className="space-y-3">
                        <Button size="lg" className="w-full bg-green-500 hover:bg-green-600 text-white" disabled>
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Anda Sudah Terdaftar
                        </Button>
                        <Button size="lg" variant="outline" className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20" onClick={handleUnregister}>
                          <XCircle className="h-4 w-4 mr-2" />
                          Batalkan Pendaftaran
                        </Button>
                      </div>
                    ) : (
                      <Button size="lg" className="w-full bg-white text-blue-600 hover:bg-blue-50 font-semibold" onClick={handleRegister}>
                        Daftar Sekarang
                      </Button>
                    )}
                  </div>
                  <div className="pt-4 border-t border-white/20">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold">{formatDate(event.date).split(" ")[0]}</p>
                        <p className="text-xs text-blue-100">Tanggal</p>
                      </div>
                      {event.time && (
                        <div>
                          <p className="text-2xl font-bold">{formatTime(event.time)}</p>
                          <p className="text-xs text-blue-100">Waktu</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}