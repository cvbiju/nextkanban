const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding...');

    // Hash password "password123"
    const passwordHash = await bcrypt.hash('password123', 10);

    // 1. Create Admin User
    const admin = await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: {
            email: 'admin@example.com',
            name: 'Admin User',
            passwordHash,
            role: 'ADMIN',
            image: 'https://i.pravatar.cc/150?img=11',
        },
    });

    // 2. Create Friend User
    const friend1 = await prisma.user.upsert({
        where: { email: 'friend@example.com' },
        update: {},
        create: {
            email: 'friend@example.com',
            name: 'Best Friend',
            passwordHash,
            role: 'USER',
            image: 'https://i.pravatar.cc/150?img=32',
        },
    });

    // 3. Create Project & Assign Users (idempotent: skip if already exists)
    const existingProject = await prisma.project.findFirst({
        where: { title: 'Project Alpha', createdById: admin.id }
    });

    let project;
    if (!existingProject) {
        project = await prisma.project.create({
            data: {
                title: 'Project Alpha',
                description: 'The first seeded workspace',
                createdById: admin.id,
                members: {
                    create: [
                        { userId: admin.id, role: 'ADMIN' },
                        { userId: friend1.id, role: 'MEMBER' },
                    ]
                },
                tasks: {
                    create: [
                        {
                            title: 'Welcome Task',
                            description: 'This is the very first task in this project',
                            priority: 'medium',
                            status: 'TODO',
                            assigneeId: admin.id
                        }
                    ]
                }
            }
        });
    } else {
        project = existingProject;
    }

    console.log(`Seeding finished. Created Admin (${admin.email}) and Project: ${project.title}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
