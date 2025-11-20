import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import dbConnect from "@/lib/dbConnect";
import RegistrationModel from "@/models/Registration";
import { IUser } from "@/models/User";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as IUser).role !== "admin") {
    return NextResponse.json({ message: "Tidak diizinkan" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get("eventId");

  if (!eventId) {
    return NextResponse.json({ message: "Event ID tidak ada" }, { status: 400 });
  }

  try {
    await dbConnect();
    const registrations = await RegistrationModel.find({ event: eventId }).populate("user", "name email");
    const registrants = registrations.map((reg) => reg.user);

    return NextResponse.json({ registrants });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Kesalahan Server" }, { status: 500 });
  }
}
