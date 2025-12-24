import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { token, ...details } = await req.json();
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    const email = payload.email as string;

    await prisma.racer.update({
      where: { email },
      data: {
        ...details,
        birthDate: details.birthDate ? new Date(details.birthDate) : null,
        emailVerified: true,
        verificationCode: null, // Güvenlik için kodu siliyoruz
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Oturum geçersiz" }, { status: 403 });
  }
}