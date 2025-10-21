import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { name, email, password, adminCode } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: "Field wajib tidak boleh kosong" }, { status: 400 });
    }

    const userExists = await UserModel.findOne({ email });
    if (userExists) {
      return NextResponse.json({ message: "Email sudah terdaftar" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    let role = "user";

    if (adminCode && adminCode === process.env.ADMIN_REGISTRATION_KEY) {
      role = "admin";
    }

    await UserModel.create({
      name,
      email,
      password: hashedPassword,
      role: role,
    });

    return NextResponse.json({ message: "User berhasil dibuat" }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Kesalahan Server", error }, { status: 500 });
  }
}
