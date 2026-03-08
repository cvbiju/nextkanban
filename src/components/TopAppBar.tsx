"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function TopAppBar({ title }: { title: string }) {
    const { data: session } = useSession();
    const router = useRouter();

    return (
        <header className="top-app-bar">
            <h1 className="title-large">{title}</h1>

            <div className="top-bar-actions">
                <div className="search-bar">
                    <span className="material-symbols-outlined search-icon">search</span>
                    <input type="text" placeholder="Search tasks..." aria-label="Search" />
                </div>

                {session ? (
                    <div className="user-profile" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="body-medium text-variant">{session.user?.name}</span>
                            {session.user?.image ? (
                                <img src={session.user.image} alt="Profile" className="avatar" />
                            ) : (
                                <div className="avatar" style={{ backgroundColor: 'var(--md-sys-color-primary)', color: 'var(--md-sys-color-on-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                    {session.user?.name?.charAt(0).toUpperCase() || '?'}
                                </div>
                            )}
                        </div>
                        <button
                            className="btn text-btn"
                            style={{ padding: '6px 16px' }}
                            onClick={() => signOut({ callbackUrl: '/login' })}
                        >
                            Logout
                        </button>
                    </div>
                ) : (
                    <button className="btn text-btn" onClick={() => router.push('/login')}>Login</button>
                )}
            </div>
        </header>
    );
}
