// "use client";
// import { useState, useEffect } from "react";
// import { useRouter, useParams } from "next/navigation";
// import { Button } from "../../../components/ui/button";
// import { Input } from "../../../components/ui/input";
// import { Label } from "../../../components/ui/label";
// import { Textarea } from "../../../components/ui/textarea";
// import { Card } from "../../../components/ui/card";
// import { getCurrentUser, isAdmin } from "../../../lib/auth";
// import { createEvent, updateEvent, getEventById } from "../../../lib/events";

// export default function CreateEditEvent() {
//   const params = useParams();
//   const router = useRouter();
//   const { id } = params as { id: string };
//   const user = getCurrentUser();
//   const isEditing = !!id;

//   const [title, setTitle] = useState("");
//   const [description, setDescription] = useState("");
//   const [date, setDate] = useState("");
//   const [location, setLocation] = useState("");
//   const [images, setImages] = useState<string[]>([""]);
//   const [spsLink, setSpsLink] = useState("");
//   const [isLoaded, setIsLoaded] = useState(false);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     if (!user || !isAdmin()) {
//       router.push("/");
//       return;
//     }

//     if (isEditing && id && !isLoaded) {
//       const event = getEventById(id);
//       if (event) {
//         setTitle(event.title);
//         setDescription(event.description);
//         setDate(event.date);
//         setLocation(event.location);
//         setImages(event.images || [""]);
//         setSpsLink(event.spsLink || "");
//         setIsLoaded(true);
//       } else {
//         router.push("/admin/dashboard");
//       }
//     }
//   }, [user, router, isEditing, id, isLoaded]);

//   if (!user || !isAdmin()) return null;

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     setError("");

//     const validImages = images.filter((img) => img.trim() !== "");

//     if (!title || !description || !date || !location || validImages.length === 0) {
//       setError("Mohon isi semua field dan minimal satu gambar");
//       return;
//     }

//     if (isEditing && id) {
//       const updated = updateEvent(id, {
//         title,
//         description,
//         date,
//         location,
//         images: validImages,
//         spsLink: spsLink.trim() || undefined,
//       });

//       if (updated) {
//         alert("Event berhasil diupdate");
//         router.push("/admin/dashboard");
//       } else {
//         setError("Gagal mengupdate event");
//       }
//     } else {
//       createEvent({
//         title,
//         description,
//         date,
//         location,
//         images: validImages,
//         spsLink: spsLink.trim() || undefined,
//         createdBy: user.id,
//       });

//       alert("Event berhasil dibuat");
//       router.push("/admin/dashboard");
//     }
//   };

//   const handleImageChange = (index: number, value: string) => {
//     const newImages = [...images];
//     newImages[index] = value;
//     setImages(newImages);
//   };

//   const addImageField = () => {
//     setImages([...images, ""]);
//   };

//   const removeImageField = (index: number) => {
//     if (images.length > 1) {
//       setImages(images.filter((_, i) => i !== index));
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="container mx-auto px-4 py-12">
//         <div className="max-w-3xl mx-auto">
//           <h1 className="mb-8">{isEditing ? `Edit: ${title}` : "Buat Event Baru"}</h1>

//           <Card className="p-6">
//             <form onSubmit={handleSubmit} className="space-y-6">
//               {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{error}</div>}

//               {/* Info Dasar */}
//               <div className="space-y-4">
//                 <h3>Info Dasar</h3>

//                 <div className="space-y-2">
//                   <Label htmlFor="title">Judul Event</Label>
//                   <Input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Masukkan judul event" required />
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="description">Deskripsi</Label>
//                   <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Deskripsikan event Anda..." rows={6} className="resize-y" required />
//                 </div>
//               </div>

//               {/* Logistik */}
//               <div className="space-y-4">
//                 <h3>Logistik</h3>

//                 <div className="space-y-2">
//                   <Label htmlFor="date">Tanggal</Label>
//                   <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="location">Lokasi</Label>
//                   <Input id="location" type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Contoh: Gedung Robotika ITS atau Online" required />
//                 </div>
//               </div>

//               {/* Media */}
//               <div className="space-y-4">
//                 <h3>Media</h3>

//                 <div className="space-y-3">
//                   <div className="flex items-center justify-between">
//                     <Label>URL Gambar Event</Label>
//                     <Button type="button" variant="outline" size="sm" onClick={addImageField}>
//                       + Tambah Gambar
//                     </Button>
//                   </div>

//                   {images.map((image, index) => (
//                     <div key={index} className="flex gap-2">
//                       <Input type="url" value={image} onChange={(e) => handleImageChange(index, e.target.value)} placeholder={`https://example.com/image${index + 1}.jpg`} />
//                       {images.length > 1 && (
//                         <Button type="button" variant="ghost" size="sm" onClick={() => removeImageField(index)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
//                           Hapus
//                         </Button>
//                       )}
//                     </div>
//                   ))}

//                   <p className="text-sm text-gray-500">Gunakan URL gambar dari Unsplash atau sumber lainnya. Tambahkan beberapa gambar untuk carousel.</p>
//                 </div>

//                 {images.some((img) => img.trim() !== "") && (
//                   <div className="mt-4">
//                     <p className="text-sm text-gray-600 mb-2">Preview:</p>
//                     <div className="grid grid-cols-2 gap-2">
//                       {images
//                         .filter((img) => img.trim() !== "")
//                         .map((img, index) => (
//                           <img
//                             key={index}
//                             src={img}
//                             alt={`Preview ${index + 1}`}
//                             className="w-full h-32 object-cover rounded-md"
//                             onError={(e) => {
//                               e.currentTarget.src =
//                                 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ddd" width="400" height="300"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle"%3EError%3C/text%3E%3C/svg%3E';
//                             }}
//                           />
//                         ))}
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* SPS Link */}
//               <div className="space-y-4">
//                 <h3>Link Spreadsheet Pendaftaran (Opsional)</h3>

//                 <div className="space-y-2">
//                   <Label htmlFor="spsLink">URL Google Spreadsheet</Label>
//                   <Input id="spsLink" type="url" value={spsLink} onChange={(e) => setSpsLink(e.target.value)} placeholder="https://docs.google.com/spreadsheets/d/..." />
//                   <p className="text-sm text-gray-500">Link ini akan ditampilkan di admin dashboard untuk tracking pendaftaran</p>
//                 </div>
//               </div>

//               {/* Sticky Submit Button */}
//               <div className="sticky bottom-0 bg-white pt-4 pb-2 -mx-6 px-6 border-t">
//                 <div className="flex gap-3">
//                   <Button type="button" variant="outline" className="flex-1" onClick={() => router.push("/admin/dashboard")}>
//                     Batal
//                   </Button>
//                   <Button type="submit" className="flex-1">
//                     {isEditing ? "Simpan Perubahan" : "Publikasikan Event"}
//                   </Button>
//                 </div>
//               </div>
//             </form>
//           </Card>
//         </div>
//       </div>
//     </div>
//   );
// }
