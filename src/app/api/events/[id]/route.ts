import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import dbConnect from "@/lib/dbConnect";
import EventModel from "@/models/Event";
import RegistrationModel from "@/models/Registration";
import { IUser } from "@/models/User";

interface Params {
  request: Request;
  params: { id: string };
}

// GET: Mengambil SATU event (Publik)
export async function GET(request: Request, { params }: Params) {
  try {
    await request.text();
  } catch (e) {
    // Abaikan error jika body kosong atau sudah dibaca
  }
  // -------------------------

  const { id } = params;
  try {
    await dbConnect();
    const event = await EventModel.findById(id).populate("creator", "name");
    if (!event) {
      return NextResponse.json({ message: "Event tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json({ event }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Kesalahan Server", error }, { status: 500 });
  }
}

// PUT: Mengupdate SATU event (Hanya Admin)
export async function PUT(request: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  const user = session?.user as IUser;

  if (!session || user?.role !== "admin") {
    return NextResponse.json({ message: "Tidak diizinkan" }, { status: 403 });
  }

  try {
    await dbConnect();
    const body = await request.json();
    const updatedEvent = await EventModel.findByIdAndUpdate(params.id, body, {
      new: true,
      runValidators: true,
    });

    if (!updatedEvent) {
      return NextResponse.json({ message: "Event tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json({ message: "Event diupdate", event: updatedEvent }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Kesalahan Server", error }, { status: 500 });
  }
}

// DELETE: Menghapus SATU event (Hanya Admin)
export async function DELETE(request: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  const user = session?.user as IUser;

  if (!session || user?.role !== "admin") {
    return NextResponse.json({ message: "Tidak diizinkan" }, { status: 403 });
  }

  try {
    await dbConnect();
    const deletedEvent = await EventModel.findByIdAndDelete(params.id);

    if (!deletedEvent) {
      return NextResponse.json({ message: "Event tidak ditemukan" }, { status: 404 });
    }

    // Juga hapus semua registrasi yang terkait dengan event ini
    await RegistrationModel.deleteMany({ event: params.id });

    return NextResponse.json({ message: "Event dan registrasi terkait dihapus" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Kesalahan Server", error }, { status: 500 });
  }
}
