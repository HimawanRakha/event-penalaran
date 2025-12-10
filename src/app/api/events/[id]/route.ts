import { NextRequest, NextResponse } from "next/server";
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

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
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

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const user = session?.user as IUser;

  if (!session || user?.role !== "admin") {
    return NextResponse.json({ message: "Tidak diizinkan" }, { status: 403 });
  }

  try {
    await dbConnect();
    const body = await request.json();
    const updatedEvent = await EventModel.findByIdAndUpdate(id, body, {
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

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const user = session?.user as IUser;

  if (!session || user?.role !== "admin") {
    return NextResponse.json({ message: "Tidak diizinkan" }, { status: 403 });
  }

  try {
    await dbConnect();
    const deletedEvent = await EventModel.findByIdAndDelete(id);

    if (!deletedEvent) {
      return NextResponse.json({ message: "Event tidak ditemukan" }, { status: 404 });
    }
    await RegistrationModel.deleteMany({ event: id });

    return NextResponse.json({ message: "Event dan registrasi terkait dihapus" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Kesalahan Server", error }, { status: 500 });
  }
}
