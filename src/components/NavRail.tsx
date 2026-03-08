"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function NavRail() {
    const pathname = usePathname();
    const { data: session } = useSession();
    return (
        <nav className="nav-rail" style={{
            margin: '16px 0 24px 24px',
            borderRadius: '16px',
            border: '2px solid transparent',
            backgroundImage: 'linear-gradient(var(--md-sys-color-surface-container-low), var(--md-sys-color-surface-container-low)), linear-gradient(135deg, rgba(66,133,244,0.6), rgba(234,67,53,0.6), rgba(251,188,5,0.6), rgba(52,168,83,0.6))',
            backgroundOrigin: 'border-box',
            backgroundClip: 'padding-box, border-box',
            backgroundColor: 'var(--md-sys-color-surface-container-low)',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            paddingTop: '24px' // Extra padding since menu icon is gone
        }}>
            <div className="nav-rail-top">
                <Link href="/" className={`nav-item ${pathname === '/' ? 'active' : ''}`} title="Board" style={{ textDecoration: 'none' }}>
                    <span className={`material-symbols-outlined ${pathname === '/' ? 'indicator' : ''}`}>dashboard</span>
                    <span className="nav-label">Board</span>
                </Link>

                <Link href="/projects" className={`nav-item ${pathname === '/projects' ? 'active' : ''}`} title="Projects" style={{ textDecoration: 'none' }}>
                    <span className={`material-symbols-outlined ${pathname === '/projects' ? 'indicator' : ''}`}>folder</span>
                    <span className="nav-label">Projects</span>
                </Link>

                <Link href="/team" className={`nav-item ${pathname === '/team' ? 'active' : ''}`} title="Team" style={{ textDecoration: 'none' }}>
                    <span className={`material-symbols-outlined ${pathname === '/team' ? 'indicator' : ''}`}>group</span>
                    <span className="nav-label">Team</span>
                </Link>
            </div>
        </nav>
    );
}
