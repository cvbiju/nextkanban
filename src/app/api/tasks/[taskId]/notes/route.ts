import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";

export async function GET(req: NextRequest, { params }: { params: Promise<{ taskId: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { taskId } = await params;

    try {
        const notes = await prisma.taskNote.findMany({
            where: { taskId },
            include: {
                author: {
                    select: { name: true, image: true }
                }
            },
            orderBy: { createdAt: 'asc' }
        });
        return NextResponse.json(notes);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch task notes" }, { status: 500 });
    }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ taskId: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { taskId } = await params;

    try {
        const body = await req.json();
        const { text, mediaUrl } = body;

        if (!text && !mediaUrl) {
            return NextResponse.json({ error: "Note must contain text or media attachment" }, { status: 400 });
        }

        const note = await prisma.taskNote.create({
            data: {
                taskId,
                authorId: session.user.id,
                text: text || null,
                mediaUrl: mediaUrl || null
            },
            include: {
                author: {
                    select: { name: true, image: true }
                }
            }
        });

        return NextResponse.json(note);
    } catch (error) {
        return NextResponse.json({ error: "Failed to create task note" }, { status: 500 });
    }
}
