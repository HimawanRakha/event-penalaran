"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { EventCard } from "@/components/EventCard";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpIcon, Search, Sparkles, Calendar, TrendingUp, Users } from "lucide-react";
import { fetchAPI } from "@/utils/api";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

interface Event {
  id: string;
  title: string;
  date: string;
  time?: string;
  location: string;
  images: string[];
}

export default function HomePage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);

        // UBAH: Pakai fetchAPI ke backend JSP yang return array langsung
        const data = await fetchAPI("/api/events");

        // Backend JSP return array langsung, bukan { events: [...] }
        setEvents(Array.isArray(data) ? data : []);
      } catch (err: any) {
        console.error("Error fetching events:", err);
        setError(err.message || "Gagal memuat event. Pastikan backend JSP berjalan di http://localhost:8080");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Filter events berdasarkan search query
  const filteredEvents = events.filter((event) => event.title.toLowerCase().includes(searchQuery.toLowerCase()) || event.location.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section - Modern */}
      <section className="relative py-20 md:py-32 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-1">
          <Image
            src="/bg-hero.jpg"
            alt="Background"
            fill // Pengganti w-full h-full absolute
            priority // Agar gambar diload duluan (karena ini hero section)
            className="object-cover opacity-70"
            sizes="100vw"
            onError={(e) => {
              // Opsional: Log error ke console untuk debugging
              console.error("Gagal memuat gambar hero");
            }}
          />
        </div>
        {/* Overlay untuk memastikan text tetap readable */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/80 via-indigo-600/80 to-purple-600/80" />

        <div className="container mx-auto px-4 text-center relative z-10">
          <Badge className="mb-4 bg-white/20 text-white border-white/30 hover:bg-white/30">
            <Sparkles className="h-3 w-3 mr-1" />
            ManageEvent
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 max-w-4xl mx-auto text-white leading-tight">
            Temukan dan Ikuti Event Terbaik di Sini,
            <br />
            Capai potensimu.
          </h1>
          <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl mx-auto">Bergabunglah dalam berbagai kegiatan dan tingkatkan kemampuan Anda</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-blue-50 shadow-xl px-8"
              onClick={() => {
                const eventsSection = document.getElementById("events");
                eventsSection?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Jelajahi Event
              <ArrowUpIcon className="h-4 w-4 ml-2 rotate-[-45deg]" />
            </Button>
            <Button size="lg" variant="outline" className="bg-white/10 text-white border-white/30 hover:bg-white/20 backdrop-blur-sm">
              Pelajari Lebih Lanjut
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white/50 backdrop-blur-sm border-y border-gray-200/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm text-center">
              <CardContent className="pt-6">
                <div className="flex justify-center mb-3">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{events.length}</h3>
                <p className="text-gray-600 text-sm">Event Tersedia</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm text-center">
              <CardContent className="pt-6">
                <div className="flex justify-center mb-3">
                  <div className="p-3 bg-green-100 rounded-full">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">100+</h3>
                <p className="text-gray-600 text-sm">Peserta Aktif</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm text-center">
              <CardContent className="pt-6">
                <div className="flex justify-center mb-3">
                  <div className="p-3 bg-purple-100 rounded-full">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">24/7</h3>
                <p className="text-gray-600 text-sm">Akses Online</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section id="events" className="py-16 flex-1">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">ManageEvent</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Temukan event yang sesuai dengan minat dan jadwal Anda</p>
          </div>

          {/* Search Bar - Modern */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Cari event berdasarkan judul atau lokasi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-xl shadow-lg bg-white/90 backdrop-blur-sm"
              />
            </div>
          </div>

          {/* Loading / Error / Empty / Events */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="aspect-3/4 rounded-xl" />
              ))}
            </div>
          ) : error ? (
            <Card className="max-w-md mx-auto border-red-200 bg-red-50">
              <CardContent className="pt-6 text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={() => window.location.reload()} variant="outline">
                  Coba Lagi
                </Button>
              </CardContent>
            </Card>
          ) : filteredEvents.length === 0 ? (
            <Card className="max-w-md mx-auto border-2 border-dashed border-gray-300 bg-white/50">
              <CardContent className="pt-6 text-center py-12">
                <div className="rounded-full bg-gray-100 p-6 mb-4 inline-block">
                  <Search className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{searchQuery ? "Event Tidak Ditemukan" : "Belum Ada Event"}</h3>
                <p className="text-gray-600">{searchQuery ? "Coba gunakan kata kunci lain untuk mencari event" : "Event akan segera tersedia"}</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {searchQuery && (
                <p className="text-center text-gray-600 mb-6">
                  Menampilkan {filteredEvents.length} dari {events.length} event
                </p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
