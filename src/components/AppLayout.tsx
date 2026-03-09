"use client";
import React from 'react';
import { usePathname } from 'next/navigation';
import NavRail from './NavRail';
import TopAppBar from './TopAppBar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // Do not show navigation elements on the login or register pages
    if (pathname === '/login' || pathname === '/register') {
        return <>{children}</>;
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', backgroundColor: 'var(--sys-color-background)' }}>
            <TopAppBar title={
                pathname === '/projects' ? 'Project Workspaces' :
                    pathname === '/team' ? 'Team Directory' :
                        ''
            } />
            <div style={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
                <NavRail />
                <div className="content-wrapper">
                    {children}
                </div>
            </div>
        </div>
    );
}
