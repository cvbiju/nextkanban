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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%', overflow: 'hidden' }}>
                <div style={{ position: 'relative' }}>
                    <span className="material-symbols-outlined" style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        fontSize: '20px',
                        color: 'var(--text-variant)'
                    }}>search</span>
                    <input
                        type="text"
                        className="custom-input"
                        placeholder="Search users by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%', paddingLeft: '40px' }}
                    />
                </div>

                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    overflowY: 'auto',
                    flexGrow: 1,
                    paddingRight: '8px',
                    maxHeight: '450px' // Ensure scrollbar appears
                }}>
                    {filteredUsers.map(user => {
                        const isMember = localMemberIds.has(user.id);

                        return (
                            <div key={user.id} style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '12px',
                                border: '1px solid var(--sys-color-outline-variant)',
                                borderRadius: '12px',
                                backgroundColor: 'var(--sys-color-surface)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    {user.image ? (
                                        <img src={user.image} alt="Avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '50%',
                                            backgroundColor: 'var(--sys-color-primary)',
                                            color: 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '16px',
                                            fontWeight: 'bold'
                                        }}>
                                            {(user.name || user.email || '?').charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <div className="body-large" style={{ fontWeight: '600' }}>{user.name || "Unknown"}</div>
                                        <div className="body-small text-variant">{user.email}</div>
                                    </div>
                                </div>
                                <button
                                    className={`btn ${isMember ? 'text-btn' : 'filled-btn'}`}
                                    onClick={() => isMember ? handleRemoveMember(user.id) : handleAddMember(user.id)}
                                    disabled={isLoading}
                                    style={isMember ? { color: 'var(--sys-color-status-critical)', padding: '6px 12px' } : { padding: '6px 12px' }}
                                >
                                    {isMember ? 'Remove' : 'Add'}
                                </button>
                            </div>
                        );
                    })}
                    {filteredUsers.length === 0 && (
                        <div className="body-medium text-variant" style={{ textAlign: 'center', marginTop: '32px', padding: '20px' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '48px', opacity: 0.2, display: 'block', marginBottom: '8px' }}>person_search</span>
                            No users found matching "{searchTerm}"
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px', borderTop: '1px solid var(--sys-color-outline-variant)', paddingTop: '16px' }}>
                    <button className="btn filled-btn" onClick={onClose} style={{ padding: '10px 24px' }}>Done</button>
                </div>
            </div>
        </Modal>
    );
}
