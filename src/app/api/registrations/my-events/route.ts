import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import dbConnect from "@/lib/dbConnect";
import RegistrationModel from "@/models/Registration";
import { IUser } from "@/models/User";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Tidak diizinkan" }, { status: 401 });
  }

  const user = session.user as IUser;

  try {
    await dbConnect();
    const registrations = await RegistrationModel.find({ user: user.id }).populate("event");
    const myEvents = registrations.map((reg) => reg.event);

    return NextResponse.json({ events: myEvents });
  } catch (error) {
    console.error("Gagal mengambil event saya:", error);
    return NextResponse.json({ message: "Kesalahan Server" }, { status: 500 });
  }
}
