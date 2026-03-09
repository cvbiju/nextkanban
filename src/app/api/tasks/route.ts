import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

// GET all tasks for a specific project
export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const projectId = url.searchParams.get("projectId");

    if (!projectId) {
        return NextResponse.json({ error: "ProjectId is required" }, { status: 400 });
    }

    // Check if user has access to this project
    const role = (session.user as any).role;
    if (role !== 'ADMIN') {
        const membership = await prisma.projectMember.findUnique({
            where: { projectId_userId: { projectId, userId: session.user.id } }
        });
        if (!membership) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
    }

    const tasks = await prisma.task.findMany({
        where: { projectId },
        include: { assignee: true },
        orderBy: { order: 'asc' }
    });

    return NextResponse.json(tasks);
}

// POST create a new task
export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { projectId, title, description, priority, status, assigneeId } = await req.json();

        // RBAC check: Ensure user is a member of the project
        const globalRole = (session.user as any).role;
        if (globalRole !== 'ADMIN') {
            const membership = await prisma.projectMember.findUnique({
                where: {
                    projectId_userId: { projectId, userId: session.user.id }
                }
            });
            if (!membership) {
                return NextResponse.json({ error: "Forbidden: You are not a member of this project" }, { status: 403 });
            }
        }

        // Determine the next highest order for new tasks created in TODO
        const existingTasks = await prisma.task.findMany({
            where: { projectId, status: status || 'TODO' },
            orderBy: { order: 'desc' },
            take: 1
        });

        let initialOrder = 1000;
        if (existingTasks.length > 0) {
            initialOrder = (existingTasks[0].order || 0) + 1000;
        }

        const task = await prisma.task.create({
            data: {
                projectId,
                title,
                description,
                priority: priority || 'low',
                status: status || 'TODO',
                assigneeId: assigneeId || null,
                order: initialOrder
            },
            include: { assignee: true }
        });

        return NextResponse.json(task);
    } catch (error) {
        return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
    }
}

// PUT update a task (such as dragging / dropping)
export async function PUT(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const data = await req.json();
        const { id, ...updateData } = data;

        const task = await prisma.task.update({
            where: { id },
            data: updateData,
            include: { assignee: true }
        });

        return NextResponse.json(task);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
    }
}
