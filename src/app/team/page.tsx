"use client";
import React, { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import UserModal from '../../components/UserModal';

export default function TeamPage() {
    const { data: session } = useSession();
    const [users, setUsers] = useState<any[]>([]);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState<any>(null);

    const role = (session?.user as any)?.role;

    const fetchUsers = () => {
        fetch('/api/users')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setUsers(data);
            });
    };

    useEffect(() => {
        if (session) {
            fetchUsers();
        }
    }, [session]);

    const handleEditUser = (user: any) => {
        setUserToEdit(user);
        setIsUserModalOpen(true);
    };

    const handleCreateUser = () => {
        setUserToEdit(null);
        setIsUserModalOpen(true);
    };

    const handleDeleteUser = async (user: any) => {
        if (confirm(`Are you sure you want to delete ${user.name || user.email}?`)) {
            try {
                const res = await fetch(`/api/users/${user.id}`, { method: 'DELETE' });
                if (res.ok) {
                    fetchUsers();
                } else {
                    const data = await res.json();
                    alert(data.error || "Failed to delete user");
                }
            } catch (err) {
                alert("An unexpected error occurred");
            }
        }
    };

    if (!session) {
        return (
            <main className="board-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--md-sys-color-error)', marginBottom: '16px' }}>lock</span>
                    <h2 className="title-large text-variant">Authentication Required</h2>
                    <p className="body-medium text-variant" style={{ marginTop: '8px' }}>Please log in to view the directory.</p>
                </div>
            </main>
        );
    }

    return (
        <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                {users.map(user => (
                    <div key={user.id} className="card elevated" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div className="card-state-layer"></div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <img src={user.image || `https://ui-avatars.com/api/?name=${user.name || user.email}&background=random`} alt="Avatar" className="avatar" style={{ width: '75px', height: '75px', borderRadius: '50%', objectFit: 'cover', filter: user.isActive === false ? 'grayscale(100%) opacity(70%)' : 'none' }} />
                            <div>
                                <h2 className="title-medium">{user.name || "Unknown User"}</h2>
                                <p className="body-medium text-variant">{user.email}</p>
                            </div>
                        </div>

                        <div style={{ marginTop: 'auto', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span className={`filter-chip ${user.isActive === false ? 'chip-inactive' : (user.role === 'ADMIN' ? 'chip-high' : 'chip-low')}`} style={{ opacity: user.isActive === false ? 0.6 : 1 }}>
                                {user.isActive === false ? 'Inactive' : user.role}
                            </span>
                            {(role === 'ADMIN' || user.id === session?.user?.id) && (
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button className="icon-btn small" onClick={() => handleEditUser(user)} title="Edit Profile">
                                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {role === 'ADMIN' && (
                <button className="fab" aria-label="Add new user" onClick={handleCreateUser}>
                    <span className="material-symbols-outlined">person_add</span>
                </button>
            )}

            <UserModal
                isOpen={isUserModalOpen}
                onClose={() => setIsUserModalOpen(false)}
                onUserSaved={fetchUsers}
                userToEdit={userToEdit}
            />
        </div>
    );
}
