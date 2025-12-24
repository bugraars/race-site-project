import { NextResponse } from "next/server";
import { SignJWT } from "jose";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();
    const racer = await prisma.racer.findUnique({ where: { email } });

    if (!racer || racer.verificationCode !== code) {
      return NextResponse.json({ error: "Hatalı kod" }, { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const token = await new SignJWT({ email })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("2h")
      .sign(secret);

    return NextResponse.json({ success: true, token });
  } catch (error) {
    return NextResponse.json({ error: "Doğrulama hatası" }, { status: 500 });
  }
}