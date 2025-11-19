"use client";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock } from "lucide-react";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

// Tipe Event
interface Event {
  id: string;
  title: string;
  date: string;
  time?: string;
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

  const formatTime = (timeString?: string) => {
    if (!timeString) return null;
    // Format waktu dari "HH:mm" atau "HH:mm:ss" menjadi format yang lebih readable
    const [hours, minutes] = timeString.split(":");
    return `${hours}:${minutes} WIB`;
  };

  const images = event.images && event.images.length > 0 ? event.images : ["https://via.placeholder.com/450x600.png?text=Event"];

  return (
    <Link href={`/event/${event.id}`} className="block group">
      <Card className="overflow-hidden cursor-pointer hover:shadow-2xl transition-all duration-300 relative aspect-3/4 border-0 shadow-lg bg-white">
        {/* Image Container */}
        <div className="absolute inset-0 w-full h-full bg-gray-100">
          <ImageWithFallback
            src={images[0]}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 w-full h-full bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

        {/* Content */}
        <div className="absolute inset-0 w-full h-full flex flex-col justify-end p-5 md:p-6">
          <div className="space-y-3">
            <h3 className="font-bold text-lg md:text-xl text-white line-clamp-2 group-hover:text-blue-300 transition-colors">
              {event.title}
            </h3>
            
            <div className="flex flex-col gap-2 text-sm text-gray-200">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 flex-shrink-0 text-blue-300" />
                <span className="font-medium">{formatDate(event.date)}</span>
              </div>
              
              {event.time && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 flex-shrink-0 text-purple-300" />
                  <span className="font-medium">{formatTime(event.time)}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 flex-shrink-0 text-red-300" />
                <span className="truncate">{event.location}</span>
              </div>
            </div>

            {/* View Badge */}
            <div className="pt-2">
              <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30 backdrop-blur-sm">
                Lihat Detail →
              </Badge>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
