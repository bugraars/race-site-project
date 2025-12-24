import { NextResponse } from "next/server";
import { Resend } from "resend";
import prisma from "@/lib/prisma";

const resend = new Resend(process.env.RESEND_API_KEY || "re_build_dummy");

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    await prisma.racer.upsert({
      where: { email },
      update: { verificationCode: code, codeCreatedAt: new Date() },
      create: { email, verificationCode: code },
    });

    await resend.emails.send({
      from: "Hard Enduro <onboarding@resend.dev>", // Domain onaylanınca güncellenecek
      to: email,
      subject: "Doğrulama Kodunuz",
      html: `<h1>Kodunuz: ${code}</h1>`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Mail hatası" }, { status: 500 });
  }
}