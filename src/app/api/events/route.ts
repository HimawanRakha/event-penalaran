import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import dbConnect from "@/lib/dbConnect";
import EventModel from "@/models/Event";
import { IUser } from "@/models/User";
import RegistrationModel from "@/models/Registration";

export async function GET() {
  try {
    await dbConnect();
    const events = await EventModel.find().populate("creator", "name").sort({ date: "desc" }).lean();
    const eventsWithCounts = await Promise.all(
      events.map(async (event) => {
        const registrantCount = await RegistrationModel.countDocuments({ event: event._id });
        return {
          ...event,
          registrantCount: registrantCount,
        };
      })
    );

    return NextResponse.json({ events: eventsWithCounts }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Kesalahan Server", error }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user as IUser;

  if (!session || user?.role !== "admin") {
    return NextResponse.json({ message: "Tidak diizinkan" }, { status: 403 });
  }

  try {
    await dbConnect();
    const body = await request.json();

    const newEvent = await EventModel.create({
      ...body,
      creator: user.id,
    });

    return NextResponse.json({ message: "Event berhasil dibuat", event: newEvent }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Kesalahan Server", error }, { status: 500 });
  }
}
