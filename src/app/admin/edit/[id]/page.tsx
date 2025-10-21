"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Textarea } from "../../../../components/ui/textarea";
import { Card } from "../../../../components/ui/card";
import { useSession } from "next-auth/react";

export default function CreateEditEvent() {
  const params = useParams();
  const router = useRouter();
  const { id } = params as { id: string };
  const isEditing = !!id;
  const { data: session, status } = useSession();
  const isAdmin = session?.user?.role === "admin";
  const isCreateMode = id === "new";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [images, setImages] = useState<string[]>([""]);
  const [spsLink, setSpsLink] = useState("");
  const [isLoading, setIsLoading] = useState(!isCreateMode);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "loading") {
      return; // Tunggu sesi selesai loading
    }
    if (status === "unauthenticated" || !isAdmin) {
      router.push("/"); // Tendang ke homepage jika bukan admin
    }
  }, [status, isAdmin, router]);

  useEffect(() => {
    if (!isCreateMode && isLoading && status === "authenticated" && isAdmin) {
      const fetchEventData = async () => {
        try {
          const res = await fetch(`/api/events/${id}`); // Panggil API
          if (!res.ok) {
            throw new Error("Gagal mengambil data event");
          }
          const data = await res.json();
          const event = data.event; // Sesuai API yang kita buat

          if (event) {
            setTitle(event.title);
            setDescription(event.description);
            // Format tanggal agar sesuai dengan <input type="date">
            setDate(new Date(event.date).toISOString().split("T")[0]);
            setLocation(event.location);
            setImages(event.images && event.images.length > 0 ? event.images : [""]);
            setSpsLink(event.spsLink || "");
          } else {
            setError("Event tidak ditemukan");
            router.push("/admin/dashboard");
          }
        } catch (err: any) {
          setError(err.message);
        } finally {
          setIsLoading(false); // Selesai loading
        }
      };

      fetchEventData();
    }

    // Jika mode create, set loading ke false
    if (isCreateMode) {
      setIsLoading(false);
    }
  }, [id, isCreateMode, isLoading, status, isAdmin, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const validImages = images.filter((img) => img.trim() !== "");

    if (!title || !description || !date || !location || validImages.length === 0) {
      setError("Mohon isi semua field dan minimal satu gambar");
      return;
    }

    const eventData = {
      title,
      description,
      date,
      location,
      images: validImages,
      spsLink: spsLink.trim() || undefined,
      // Kita TIDAK perlu mengirim 'createdBy'. API akan mengaturnya dari sesi server.
    };

    try {
      let response;
      if (isCreateMode) {
        // Panggil API POST untuk BUAT BARU
        response = await fetch("/api/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(eventData),
        });
      } else {
        // Panggil API PUT untuk UPDATE
        response = await fetch(`/api/events/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(eventData),
        });
      }

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Gagal menyimpan data");
      }

      alert(isCreateMode ? "Event berhasil dibuat" : "Event berhasil diupdate");
      router.push("/admin/dashboard");
    } catch (err: any) {
      setError(err.message);
    }
  };

  // --- Fungsi Helper (Sudah Benar) ---
  const handleImageChange = (index: number, value: string) => {
    const newImages = [...images];
    newImages[index] = value;
    setImages(newImages);
  };

  const addImageField = () => {
    setImages([...images, ""]);
  };

  const removeImageField = (index: number) => {
    if (images.length > 1) {
      setImages(images.filter((_, i) => i !== index));
    }
  };

  // Tampilkan ini saat sesi sedang dicek ATAU saat data event sedang diambil
  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  // Jika sudah dicek tapi bukan admin, return null (karena redirect sedang proses)
  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="mb-8">{isEditing ? `Edit: ${title}` : "Buat Event Baru"}</h1>

          <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{error}</div>}

              {/* Info Dasar */}
              <div className="space-y-4">
                <h3>Info Dasar</h3>

                <div className="space-y-2">
                  <Label htmlFor="title">Judul Event</Label>
                  <Input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Masukkan judul event" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Deskripsi</Label>
                  <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Deskripsikan event Anda..." rows={6} className="resize-y" required />
                </div>
              </div>

              {/* Logistik */}
              <div className="space-y-4">
                <h3>Logistik</h3>

                <div className="space-y-2">
                  <Label htmlFor="date">Tanggal</Label>
                  <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Lokasi</Label>
                  <Input id="location" type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Contoh: Gedung Robotika ITS atau Online" required />
                </div>
              </div>

              {/* Media */}
              <div className="space-y-4">
                <h3>Media</h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>URL Gambar Event</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addImageField}>
                      + Tambah Gambar
                    </Button>
                  </div>

                  {images.map((image, index) => (
                    <div key={index} className="flex gap-2">
                      <Input type="url" value={image} onChange={(e) => handleImageChange(index, e.target.value)} placeholder={`https://example.com/image${index + 1}.jpg`} />
                      {images.length > 1 && (
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeImageField(index)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                          Hapus
                        </Button>
                      )}
                    </div>
                  ))}

                  <p className="text-sm text-gray-500">Gunakan URL gambar dari Unsplash atau sumber lainnya. Tambahkan beberapa gambar untuk carousel.</p>
                </div>

                {images.some((img) => img.trim() !== "") && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">Preview:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {images
                        .filter((img) => img.trim() !== "")
                        .map((img, index) => (
                          <img
                            key={index}
                            src={img}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-32 object-cover rounded-md"
                            onError={(e) => {
                              e.currentTarget.src =
                                'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ddd" width="400" height="300"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle"%3EError%3C/text%3E%3C/svg%3E';
                            }}
                          />
                        ))}
                    </div>
                  </div>
                )}
              </div>

              {/* SPS Link */}
              <div className="space-y-4">
                <h3>Link Spreadsheet Pendaftaran (Opsional)</h3>

                <div className="space-y-2">
                  <Label htmlFor="spsLink">URL Google Spreadsheet</Label>
                  <Input id="spsLink" type="url" value={spsLink} onChange={(e) => setSpsLink(e.target.value)} placeholder="https://docs.google.com/spreadsheets/d/..." />
                  <p className="text-sm text-gray-500">Link ini akan ditampilkan di admin dashboard untuk tracking pendaftaran</p>
                </div>
              </div>

              {/* Sticky Submit Button */}
              <div className="sticky bottom-0 bg-white pt-4 pb-2 -mx-6 px-6 border-t">
                <div className="flex gap-3">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => router.push("/admin/dashboard")}>
                    Batal
                  </Button>
                  <Button type="submit" className="flex-1">
                    {isEditing ? "Simpan Perubahan" : "Publikasikan Event"}
                  </Button>
                </div>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
