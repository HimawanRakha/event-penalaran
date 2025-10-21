"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { EventCard } from "@/components/EventCard";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupText, InputGroupTextarea } from "@/components/ui/input-group";
import { ArrowUpIcon, Search } from "lucide-react";

interface Event {
  _id: string;
  title: string;
  date: string;
  location: string;
  images: string[];
}

export default function HomePage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);

        const res = await fetch("/api/events");
        if (!res.ok) {
          throw new Error("Gagal memuat event");
        }
        const data = await res.json();
        setEvents(data.events || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* <Header /> */}
      {/* Hero Section (Sudah Benar) */}
      <section className="relative py-32 bg-cover bg-center" style={{ backgroundImage: `url('/bg-hero.jpg')` }}>
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 max-w-4xl mx-auto text-white">Kembangkan Wawasan, Asah Nalar.</h1>
          <p className="text-lg text-white mb-8 max-w-2xl mx-auto">Bergabunglah dalam berbagai kegiatan penalaran dan tingkatkan kemampuan berpikir kritis Anda</p>
          <Button
            className="cursor-pointer bg-trasparent backdrop-blur "
            size="lg"
            onClick={() => {
              const eventsSection = document.getElementById("events");
              eventsSection?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Jelajahi Event
          </Button>
        </div>
      </section>

      {/* Events Section */}
      <section id="events" className="py-8 flex-1 px-12 sm:px-16 lg:px-20">
        <div className="container mx-auto px-2 sm:px-4">
          <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-center">Event Penalaran</h2>

          {/* Input Search */}
          <InputGroup className="w-full max-w-md mx-auto mb-8 sm:mb-12 h-10 sm:h-12">
            <InputGroupInput placeholder="Search..." />
            <InputGroupAddon className="h-10 sm:h-12">
              <Search />
            </InputGroupAddon>
          </InputGroup>

          {/* Loading / Error / Empty / Events */}
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Memuat event...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500 mb-4">{error}</p>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">Belum ada event tersedia</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {events.map((event) => (
                <EventCard key={event._id} event={event} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* <Footer /> */}
    </div>
  );
}
