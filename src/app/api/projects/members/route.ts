import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

// POST add a member to a project (Project Admin Only)
export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { projectId, userId, role } = await req.json();

        // Standard users must be a Project Admin to add members
        const globalRole = (session.user as any).role;
        if (globalRole !== 'ADMIN') {
            const projectMembership = await prisma.projectMember.findFirst({
                where: {
                    projectId,
                    userId: session.user.id,
                    role: 'ADMIN'
                }
            });

            if (!projectMembership) {
                return NextResponse.json({ error: "Forbidden: You are not an admin of this project" }, { status: 403 });
            }
        }

        // Check if project exists
        const project = await prisma.project.findUnique({ where: { id: projectId } });
        if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

        const member = await prisma.projectMember.create({
            data: {
                projectId,
                userId,
                role: role || 'MEMBER'
            }
        });

        return NextResponse.json(member);
    } catch (error) {
        return NextResponse.json({ error: "Failed to add member" }, { status: 500 });
    }
}

// DELETE remove a member from a project (Project Admin Only)
export async function DELETE(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { projectId, userId } = await req.json();

        // Standard users must be a Project Admin to remove members
        const globalRole = (session.user as any).role;
        if (globalRole !== 'ADMIN') {
            const projectMembership = await prisma.projectMember.findFirst({
                where: {
                    projectId,
                    userId: session.user.id,
                    role: 'ADMIN'
                }
            });

            if (!projectMembership) {
                return NextResponse.json({ error: "Forbidden: You are not an admin of this project" }, { status: 403 });
            }
        }

        await prisma.projectMember.delete({
            where: {
                projectId_userId: {
                    projectId,
                    userId
                }
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to remove member" }, { status: 500 });
    }
}
