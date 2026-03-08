import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import bcrypt from "bcryptjs";
const hashPassword = (pw: string) => bcrypt.hashSync(pw, 10);

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await params;
        const { name, email, password, role, image, isActive } = await req.json();

        const globalRole = (session.user as any).role;
        const isSelf = session.user.id === id;

        // Must be an Admin, or be editing your own profile
        if (globalRole !== 'ADMIN' && !isSelf) {
            return NextResponse.json({ error: "Forbidden: You do not have permission to edit this user" }, { status: 403 });
        }

        // Check if user exists
        const existingUser = await prisma.user.findUnique({ where: { id } });
        if (!existingUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Build update data. Only global Admins can change roles or status (privilege escalation protection)
        const updateData: any = { name, email };
        if (globalRole === 'ADMIN') {
            if (role) updateData.role = role;
            if (isActive !== undefined) updateData.isActive = Boolean(isActive);
        }
        if (password) {
            updateData.passwordHash = hashPassword(password);
        }
        if (image !== undefined) {
            updateData.image = image;
        }

        console.log("Executing Prisma update for ID:", id, "with data:", updateData);
        const user = await prisma.user.update({
            where: { id },
            data: updateData,
            select: { id: true, name: true, email: true, role: true, image: true }
        });

        return NextResponse.json(user);
    } catch (error) {
        console.error("User update error:", error);
        return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    return NextResponse.json(
        { error: "Account deletion is deprecated. Please disable the user instead." },
        { status: 405 }
    );
}
