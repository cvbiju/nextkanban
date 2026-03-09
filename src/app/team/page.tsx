"use client";
import React, { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import UserModal from '../../components/UserModal';

export default function TeamPage() {
    const { data: session } = useSession();
    const [users, setUsers] = useState<any[]>([]);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
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

    const filteredUsers = users.filter(user =>
        (user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

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
        <main style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px', gap: '24px', flexWrap: 'wrap' }}>
                <div style={{ flex: '1', minWidth: '300px' }}>
                    <h1 className="title-large" style={{ fontSize: '28px', color: 'var(--sys-color-on-background)' }}>Team Directory</h1>
                    <p className="body-medium text-variant" style={{ marginBottom: '20px' }}>Manage your organization's members and their roles</p>

                    <div style={{ position: 'relative', maxWidth: '500px' }}>
                        <span className="material-symbols-outlined" style={{
                            position: 'absolute',
                            left: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            fontSize: '20px',
                            color: '#6B778C'
                        }}>search</span>
                        <input
                            type="text"
                            className="custom-input"
                            placeholder="Find someone by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ width: '100%', paddingLeft: '40px', height: '44px' }}
                        />
                    </div>
                </div>
                {role === 'ADMIN' && (
                    <button className="btn filled-btn" onClick={handleCreateUser} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', flexShrink: 0, height: '44px' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>person_add</span>
                        Add Team Member
                    </button>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                {filteredUsers.map(user => (
                    <div key={user.id} className="card" style={{
                        padding: '24px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '20px',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                        border: '1px solid var(--sys-color-outline-variant)',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
                    }}
                        onMouseOver={e => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.boxShadow = '0 12px 20px rgba(0,0,0,0.08)';
                        }}
                        onMouseOut={e => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.04)';
                        }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <div style={{ position: 'relative' }}>
                                <img
                                    src={user.image || `https://ui-avatars.com/api/?name=${user.name || user.email}&background=random&size=128`}
                                    alt="Avatar"
                                    style={{
                                        width: '64px',
                                        height: '64px',
                                        borderRadius: '16px',
                                        objectFit: 'cover',
                                        backgroundColor: '#f0f0f0',
                                        filter: user.isActive === false ? 'grayscale(100%) opacity(70%)' : 'none',
                                        boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
                                    }}
                                />
                                {user.isActive !== false && (
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '-2px',
                                        right: '-2px',
                                        width: '14px',
                                        height: '14px',
                                        backgroundColor: '#36B37E',
                                        borderRadius: '50%',
                                        border: '2px solid white'
                                    }} />
                                )}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--sys-color-on-surface)', margin: 0 }}>{user.name || "Unknown User"}</h2>
                                <p style={{ fontSize: '14px', color: 'var(--sys-color-on-surface-variant)', margin: 0 }}>{user.email}</p>
                            </div>
                        </div>

                        <div style={{
                            paddingTop: '20px',
                            borderTop: '1px solid var(--sys-color-outline-variant)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <span className={`filter-chip ${user.isActive === false ? 'chip-inactive' : (user.role === 'ADMIN' ? 'chip-high' : 'chip-low')}`} style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '12px' }}>
                                    {user.isActive === false ? 'Inactive' : user.role}
                                </span>
                            </div>
                            {(role === 'ADMIN' || user.id === session?.user?.id) && (
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button className="icon-btn" onClick={() => handleEditUser(user)} title="Edit Profile" style={{ backgroundColor: '#F4F5F7' }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>edit</span>
                                    </button>
                                    {role === 'ADMIN' && user.id !== session?.user?.id && (
                                        <button className="icon-btn" onClick={() => handleDeleteUser(user)} title="Delete User" style={{ backgroundColor: '#FFEBE6', color: '#BF2600' }}>
                                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>delete</span>
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {filteredUsers.length === 0 && (
                    <div style={{
                        gridColumn: '1 / -1',
                        padding: '80px 20px',
                        textAlign: 'center',
                        backgroundColor: 'var(--sys-color-surface)',
                        borderRadius: '16px',
                        border: '1px dashed var(--sys-color-outline)'
                    }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '64px', opacity: 0.15, display: 'block', marginBottom: '16px' }}>person_search</span>
                        <h3 className="title-medium">No team members found</h3>
                        <p className="body-medium text-variant">Try adjusting your search for "{searchTerm}"</p>
                    </div>
                )}
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
        </main>
    );
}
