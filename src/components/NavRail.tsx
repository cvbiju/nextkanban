"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function NavRail() {
    const pathname = usePathname();
    const { data: session } = useSession();

    // Only admins should see Team and Projects globally.
    // Standard users manage projects from inside the Board UI.
    const isAdmin = (session?.user as any)?.role === 'ADMIN';

    return (
        <nav className="nav-rail">
            <div className="nav-rail-top">
                <Link href="/" className={`nav-item ${pathname === '/' ? 'active' : ''}`} title="Board">
                    <span className="material-symbols-outlined">dashboard</span>
                    <span className="nav-label">Board</span>
                </Link>

                <Link href="/projects" className={`nav-item ${pathname === '/projects' ? 'active' : ''}`} title="Projects">
                    <span className="material-symbols-outlined">folder</span>
                    <span className="nav-label">Projects</span>
                </Link>

                {isAdmin && (
                    <>
                        <Link href="/team" className={`nav-item ${pathname === '/team' ? 'active' : ''}`} title="Team">
                            <span className="material-symbols-outlined">group</span>
                            <span className="nav-label">Team</span>
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
}
