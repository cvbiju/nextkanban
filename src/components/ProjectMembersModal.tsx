"use client";
import React, { useState, useEffect } from 'react';
import Modal from './Modal';

interface ProjectMembersModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectId: string;
    projectName: string;
    existingMembers: any[];
    onMembersUpdated: () => void;
}

export default function ProjectMembersModal({ isOpen, onClose, projectId, projectName, existingMembers, onMembersUpdated }: ProjectMembersModalProps) {
    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [localMemberIds, setLocalMemberIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (isOpen) {
            setLocalMemberIds(new Set(existingMembers.map((m: any) => m.userId)));
            fetch('/api/users')
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) setAllUsers(data);
                });
            setSearchTerm('');
        }
    }, [isOpen]);

    const handleAddMember = async (userId: string) => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/projects/members', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectId, userId, role: 'MEMBER' })
            });
            if (res.ok) {
                const newIds = new Set(localMemberIds);
                newIds.add(userId);
                setLocalMemberIds(newIds);
                onMembersUpdated();
            } else {
                alert("Failed to add member.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveMember = async (userId: string) => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/projects/members', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectId, userId })
            });
            if (res.ok) {
                const newIds = new Set(localMemberIds);
                newIds.delete(userId);
                setLocalMemberIds(newIds);
                onMembersUpdated();
            } else {
                alert("Failed to remove member.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const filteredUsers = allUsers.filter(u =>
    (u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Manage Members: ${projectName}`}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minHeight: '300px' }}>
                <input
                    type="text"
                    className="custom-input"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', flexGrow: 1 }}>
                    {filteredUsers.map(user => {
                        const isMember = localMemberIds.has(user.id);

                        return (
                            <div key={user.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', border: '1px solid var(--md-sys-color-outline-variant)', borderRadius: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    {user.image ? (
                                        <img src={user.image} alt="Avatar" style={{ width: '75px', height: '75px', borderRadius: '50%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ width: '75px', height: '75px', borderRadius: '50%', backgroundColor: 'var(--md-sys-color-primary)', color: 'var(--md-sys-color-on-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold' }}>
                                            {(user.name || user.email || '?').charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div>
                                        <div className="title-medium" style={{ fontSize: '14px' }}>{user.name || "Unknown"}</div>
                                        <div className="body-medium text-variant" style={{ fontSize: '12px' }}>{user.email}</div>
                                    </div>
                                </div>
                                <button
                                    className={`btn ${isMember ? 'text-btn' : 'filled-btn'}`}
                                    onClick={() => isMember ? handleRemoveMember(user.id) : handleAddMember(user.id)}
                                    disabled={isLoading}
                                    style={isMember ? { color: 'var(--md-sys-color-error)' } : {}}
                                >
                                    {isMember ? 'Remove' : 'Add'}
                                </button>
                            </div>
                        );
                    })}
                    {filteredUsers.length === 0 && (
                        <div className="body-medium text-variant" style={{ textAlign: 'center', marginTop: '32px' }}>No users found.</div>
                    )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                    <button className="btn filled-tonal-btn" onClick={onClose}>Done</button>
                </div>
            </div>
        </Modal>
    );
}
