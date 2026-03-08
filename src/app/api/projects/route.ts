import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

// GET all projects the user has access to
export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const role = (session.user as any).role;

    try {
        let projects;

        // Admins see all projects
        if (role === 'ADMIN') {
            projects = await prisma.project.findMany({
                include: { members: { include: { user: true } } }
            });
        } else {
            // Standard users only see projects they are members of
            projects = await prisma.project.findMany({
                where: {
                    members: {
                        some: { userId: userId }
                    }
                },
                include: { members: { include: { user: true } } }
            });
        }

        return NextResponse.json(projects);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
    }
}

// POST create a new project (Any user can create one, they become Project ADMIN)
export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    console.log("POST /api/projects SESSION:", JSON.stringify(session));
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { title, description } = await req.json();

        const project = await prisma.project.create({
            data: {
                title,
                description,
                createdById: session.user.id,
                members: {
                    create: [{ userId: session.user.id, role: 'ADMIN' }] // Creator is admin of project
                }
            }
        });

        return NextResponse.json(project);
    } catch (error) {
        return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
    }
}

// PUT update an existing project (Project Admin Only)
export async function PUT(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id, title, description } = await req.json();

        if (!id) {
            return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
        }

        // Global Admins can edit anything. Standard users must be a Project Admin.
        const globalRole = (session.user as any).role;
        if (globalRole !== 'ADMIN') {
            const projectMembership = await prisma.projectMember.findFirst({
                where: {
                    projectId: id,
                    userId: session.user.id,
                    role: 'ADMIN' // They must hold the ADMIN role for this specific project
                }
            });

            if (!projectMembership) {
                return NextResponse.json({ error: "Forbidden: You are not an admin of this project" }, { status: 403 });
            }
        }

        const updatedProject = await prisma.project.update({
            where: { id },
            data: {
                title,
                description,
            }
        });

        return NextResponse.json(updatedProject);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
    }
}
