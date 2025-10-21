"use client";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { Button } from "../../../components/ui/button";
import { Calendar, MapPin, User } from "lucide-react";
import { ImageWithFallback } from "../../../components/ui/ImageWithFallback";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "../../../components/ui/carousel";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface PopulatedEvent {
  _id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  images: string[];
  creator: {
    _id: string;
    name: string;
  };
}

export default function EventDetail() {
  const params = useParams();
  const { id } = params as { id: string };
  const router = useRouter();
  const { data: session, status } = useSession();

  const [event, setEvent] = useState<PopulatedEvent | null>(null);
  const [registered, setRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = session?.user?.role === "admin";
  useEffect(() => {
    if (!id) return; // Jangan lakukan apa-apa jika tidak ada ID

    const fetchEvent = async () => {
      try {
        setIsLoading(true);
        // Ganti getEventById dengan fetch
        const res = await fetch(`/api/events/${id}`);
        if (!res.ok) {
          throw new Error("Event tidak ditemukan");
        }
        const data = await res.json();
        setEvent(data.event);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvent();
  }, [id]); // Dijalankan setiap kali 'id' berubah

  // --- EFEK 2: MENGECEK STATUS REGISTRASI USER ---
  useEffect(() => {
    // Hanya cek jika user sudah login DAN event sudah di-load
    if (status === "authenticated" && event) {
      const checkRegistration = async () => {
        try {
          // Kita akan buat API ini
          const res = await fetch(`/api/registrations?eventId=${id}`);
          const data = await res.json();
          setRegistered(data.isRegistered);
        } catch (err) {
          console.error("Gagal mengecek registrasi:", err);
        }
      };
      checkRegistration();
    }
  }, [status, event, id]); // Dijalankan saat status login atau event berubah

  // --- FUNGSI FORMAT TANGGAL (Sudah Benar) ---
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // --- FUNGSI HANDLE DAFTAR (Ganti dengan fetch POST) ---
  const handleRegister = async () => {
    if (!session || !id) return;

    try {
      const res = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setRegistered(true);
      alert("Berhasil mendaftar event!");
    } catch (err: any) {
      alert(`Gagal mendaftar: ${err.message}`);
    }
  };

  // --- FUNGSI HANDLE BATAL DAFTAR (Ganti dengan fetch DELETE) ---
  const handleUnregister = async () => {
    if (!session || !id) return;

    try {
      const res = await fetch(`/api/registrations?eventId=${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setRegistered(false);
      alert("Pendaftaran dibatalkan");
    } catch (err: any) {
      alert(`Gagal batal: ${err.message}`);
    }
  };

  // --- TAMPILAN LOADING DAN ERROR ---
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2>Memuat event...</h2>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="mb-4">{error || "Event tidak ditemukan"}</h2>
        <Button onClick={() => router.push("/")}>Kembali ke Beranda</Button>
      </div>
    );
  }

  // --- RENDER HALAMAN ---
  // Pastikan images array ada
  const images = event.images && event.images.length > 0 ? event.images : ["/placeholder.jpg"]; // Sediakan placeholder jika kosong
  return (
    <div className="min-h-screen">
      {/* Banner Image Carousel */}
      <div className="w-full h-[50vh] md:h-[60vh] overflow-hidden relative">
        {images.length === 1 ? (
          <ImageWithFallback src={images[0]} alt={event.title} className="w-full h-full object-cover" />
        ) : (
          <Carousel className="w-full h-full">
            <CarouselContent>
              {images.map((image, index) => (
                <CarouselItem key={index}>
                  <ImageWithFallback src={image} alt={`${event.title} - ${index + 1}`} className="w-full h-full object-cover" />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-4" />
            <CarouselNext className="right-4" />
          </Carousel>
        )}
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="mb-6">{event.title}</h1>

        {/* Info Bar */}
        <div className="flex flex-wrap items-center gap-6 mb-8 text-gray-600">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            <span>{formatDate(event.date)}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            <span>{event.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5" />
            <span>Oleh: Admin Penalaran</span>
          </div>
        </div>

        {/* Description */}
        <div className="prose max-w-none mb-8">
          <p className="text-gray-700 leading-relaxed">{event.description}</p>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-4">
          {status === "loading" ? (
            <Button size="lg" disabled>
              Memuat...
            </Button>
          ) : !session ? (
            <Button size="lg" asChild>
              <Link href="/login">Login untuk Mendaftar</Link>
            </Button>
          ) : isAdmin ? (
            <Button size="lg" variant="outline" asChild>
              <Link href={`/admin/edit/${id}`}>Edit Event</Link>
            </Button>
          ) : registered ? (
            <div className="flex items-center gap-4">
              <Button size="lg" disabled>
                Anda Sudah Terdaftar
              </Button>
              <Button size="lg" variant="outline" onClick={handleUnregister}>
                Batalkan Pendaftaran
              </Button>
            </div>
          ) : (
            <Button size="lg" onClick={handleRegister}>
              Daftar Sekarang
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
