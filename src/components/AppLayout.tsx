"use client";
import React from 'react';
import { usePathname } from 'next/navigation';
import NavRail from './NavRail';
import TopAppBar from './TopAppBar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // Do not show navigation elements on the login page
    if (pathname === '/login') {
        return <>{children}</>;
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', backgroundColor: 'var(--md-sys-color-surface-container-lowest)' }}>
            <TopAppBar title={
                pathname === '/projects' ? 'Project Workspaces' :
                    pathname === '/team' ? 'Team Directory' :
                        ''
            } />
            <div style={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
                <NavRail />
                <div className="content-wrapper" style={{ backgroundColor: 'transparent' }}>
                    {children}
                </div>
            </div>
        </div>
    );
}
