import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import dbConnect from "@/lib/dbConnect";
import RegistrationModel from "@/models/Registration";
import { IUser } from "@/models/User";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ isRegistered: false });
  }

  const user = session.user as IUser;
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get("eventId");

  if (!eventId) {
    return NextResponse.json({ message: "Event ID tidak ada" }, { status: 400 });
  }

  try {
    await dbConnect();
    const registration = await RegistrationModel.findOne({
      user: user.id,
      event: eventId,
    });

    return NextResponse.json({ isRegistered: !!registration });
  } catch (error) {
    return NextResponse.json({ message: "Kesalahan Server", error }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Tidak diizinkan" }, { status: 401 });
  }

  const user = session.user as IUser;

  try {
    const { eventId } = await request.json();
    if (!eventId) {
      return NextResponse.json({ message: "Event ID tidak ada" }, { status: 400 });
    }

    await dbConnect();

    const existing = await RegistrationModel.findOne({ user: user.id, event: eventId });
    if (existing) {
      return NextResponse.json({ message: "Anda sudah terdaftar" }, { status: 409 });
    }

    await RegistrationModel.create({
      user: user.id,
      event: eventId,
    });

    return NextResponse.json({ message: "Berhasil mendaftar" }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Kesalahan Server", error }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Tidak diizinkan" }, { status: 401 });
  }

  const user = session.user as IUser;
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get("eventId");

  if (!eventId) {
    return NextResponse.json({ message: "Event ID tidak ada" }, { status: 400 });
  }

  try {
    await dbConnect();

    const result = await RegistrationModel.findOneAndDelete({
      user: user.id,
      event: eventId,
    });

    if (!result) {
      return NextResponse.json({ message: "Registrasi tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ message: "Pendaftaran dibatalkan" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Kesalahan Server", error }, { status: 500 });
  }
}
