"use client";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Calendar, MapPin } from "lucide-react";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

// Tipe Event (asumsi sudah benar dari kode Anda)
interface Event {
  _id: string;
  title: string;
  date: string;
  location: string;
  images: string[];
}

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" }).toUpperCase();
  };

  // --- PERUBAHAN: Placeholder disesuaikan ke rasio 3:4 ---
  const images = event.images && event.images.length > 0 ? event.images : ["https://via.placeholder.com/450x600.png?text=Event"]; // Rasio 3:4

  return (
    <Link href={`/event/${event._id}`} className="block">
      <Card className="overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow duration-300 relative aspect-3/4">
        <div className="absolute top-4 right-4 z-20">
          <div className="relative flex items-center justify-center w-12 h-12 rounded-full backdrop-blur-sm text-white p-1 bg-transparent">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2.5" // Sedikit dipertebal agar lebih terlihat
              stroke="currentColor"
              width="20"
              height="20"
              className="text-white" // Pastikan warna stroke putih
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
            </svg>
          </div>
        </div>
        <div className="absolute inset-0 w-full h-full bg-gray-100">
          <ImageWithFallback src={images[0]} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        </div>

        <div className="absolute inset-0 w-full h-full flex flex-col justify-end p-4 md:p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
          {/* Teks diubah menjadi putih/terang agar kontras */}
          <h3 className="font-bold text-md md:text-xl text-white mb-2 truncate">{event.title}</h3>
          {/* Info tanggal & lokasi dibuat 'flex-col' agar rapi di layout portrait */}
          <div className="flex flex-col gap-1.5 text-md text-gray-200">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 flex-shrink-0" />
              <span>{formatDate(event.date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
