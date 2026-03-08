import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
    try {
        const payload = await req.json();
        const email = payload.email?.toLowerCase();
        const { name, password } = payload;

        // 1. Basic validation
        if (!name || !email || !password || password.length < 6) {
            return NextResponse.json({ error: "Missing required fields or password too short" }, { status: 400 });
        }

        // 2. Check if email is already in use
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json({ error: "An account with this email already exists" }, { status: 400 });
        }

        // 3. Hash password and save to DB
        // Force the role to 'USER' regardless of what they pass in the payload
        const hashedPassword = bcrypt.hashSync(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                passwordHash: hashedPassword,
                role: 'USER',
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
            }
        });

        // 4. Return success stripped of the password hash
        return NextResponse.json(user, { status: 201 });
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json({ error: "Failed to register account" }, { status: 500 });
    }
}
