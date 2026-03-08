"use client";
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Modal from './Modal';

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUserSaved: () => void;
    userToEdit?: any;
}

export default function UserModal({ isOpen, onClose, onUserSaved, userToEdit }: UserModalProps) {
    const { data: session, update } = useSession();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('USER');
    const [isActive, setIsActive] = useState(true);
    const [image, setImage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const isAdmin = (session?.user as any)?.role === 'ADMIN';
    const isEditingSelf = userToEdit && userToEdit.id === session?.user?.id;

    useEffect(() => {
        if (isOpen) {
            if (userToEdit) {
                setName(userToEdit.name || '');
                setEmail(userToEdit.email || '');
                setRole(userToEdit.role || 'USER');
                setIsActive(userToEdit.isActive === undefined ? true : Boolean(userToEdit.isActive));
                setPassword('');
                setImage(userToEdit.image || '');
            } else {
                setName(''); setEmail(''); setRole('USER');
                setIsActive(true); setPassword(''); setImage('');
            }
            setError('');
        }
    }, [isOpen, userToEdit]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setImage(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const isEditing = !!userToEdit;
        const endpoint = isEditing ? `/api/users/${userToEdit.id}` : '/api/users';
        const method = isEditing ? 'PUT' : 'POST';

        const payload: any = { name, email, role, image, isActive };
        if (!isEditing || password.trim() !== '') payload.password = password;

        try {
            const res = await fetch(endpoint, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                if (isEditing && session?.user?.id === userToEdit.id) {
                    await update({ name, image });
                }
                onUserSaved();
                onClose();
            } else {
                const data = await res.json();
                setError(data.error || `Failed to ${isEditing ? 'update' : 'create'} user`);
            }
        } catch {
            setError("An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={userToEdit ? "Edit User" : "Create New User"}>
            <form onSubmit={handleSubmit} className="modal-form">
                {error && (
                    <div style={{
                        padding: '10px 14px', marginBottom: '16px',
                        backgroundColor: '#FFEBE6', color: '#BF2600',
                        borderRadius: '6px', fontSize: '13px',
                        border: '1px solid #FFBDAD'
                    }}>
                        {error}
                    </div>
                )}

                {/* Name + Email row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#6B778C', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>Full Name</label>
                        <input className="custom-input" type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Jane Doe" />
                    </div>
                    <div>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#6B778C', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>Email Address</label>
                        <input className="custom-input" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="jane@example.com" />
                    </div>
                </div>

                {/* Password */}
                <div style={{ marginTop: '16px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#6B778C', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
                        Password {userToEdit && <span style={{ fontWeight: 400, textTransform: 'none', fontSize: '11px' }}>(leave blank to keep current)</span>}
                    </label>
                    <input className="custom-input" type="password" value={password} onChange={e => setPassword(e.target.value)} required={!userToEdit} placeholder="••••••••" />
                </div>

                {/* Profile Image */}
                <div style={{ marginTop: '16px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#6B778C', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>Profile Image</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', border: '1px solid var(--sys-color-outline)', borderRadius: 'var(--sys-shape-corner-small)', backgroundColor: '#FAFBFC' }}>
                        {(image || (userToEdit?.image)) ? (
                            <img src={image || userToEdit.image} alt="Preview" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                        ) : (
                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#DFE1E6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#6B778C' }}>person</span>
                            </div>
                        )}
                        <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--sys-color-primary)', fontWeight: 500 }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>upload</span>
                            {image ? 'Change photo' : 'Upload photo'}
                            <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                        </label>
                        {image && (
                            <button type="button" onClick={() => setImage('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#BF2600', padding: '4px', display: 'flex', alignItems: 'center' }} title="Remove">
                                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Account Role - admin only */}
                {isAdmin && (
                    <div style={{ marginTop: '20px' }}>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#6B778C', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>Account Role</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <label className={`role-option ${role === 'USER' ? 'selected' : ''}`}>
                                <input type="radio" name="role" value="USER" checked={role === 'USER'} onChange={() => setRole('USER')} />
                                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>person</span>
                                <span style={{ fontSize: '13px', fontWeight: 500 }}>Standard User</span>
                            </label>
                            <label className={`role-option ${role === 'ADMIN' ? 'selected' : ''}`}>
                                <input type="radio" name="role" value="ADMIN" checked={role === 'ADMIN'} onChange={() => setRole('ADMIN')} />
                                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>shield_person</span>
                                <span style={{ fontSize: '13px', fontWeight: 500 }}>Administrator</span>
                            </label>
                        </div>
                    </div>
                )}

                {/* Active/Inactive toggle - admin only, not self */}
                {isAdmin && userToEdit && !isEditingSelf && (
                    <div style={{
                        marginTop: '20px', padding: '14px 16px',
                        backgroundColor: isActive ? '#E3FCEF' : '#FFEBE6',
                        borderRadius: 'var(--sys-shape-corner-medium)',
                        border: `1px solid ${isActive ? '#ABF5D1' : '#FFBDAD'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        transition: 'all 0.2s ease'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '20px', color: isActive ? '#006644' : '#BF2600' }}>
                                {isActive ? 'check_circle' : 'block'}
                            </span>
                            <div>
                                <div style={{ fontSize: '13px', fontWeight: 600, color: isActive ? '#006644' : '#BF2600' }}>
                                    {isActive ? 'Account Active' : 'Account Disabled'}
                                </div>
                                <div style={{ fontSize: '11px', color: isActive ? '#006644' : '#BF2600', opacity: 0.8 }}>
                                    {isActive ? 'User can log in' : 'User cannot log in'}
                                </div>
                            </div>
                        </div>
                        <label className="toggle-switch">
                            <input
                                type="checkbox"
                                checked={isActive}
                                onChange={(e) => setIsActive(e.target.checked)}
                            />
                            <span className="toggle-track" />
                        </label>
                    </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '28px', paddingTop: '16px', borderTop: '1px solid var(--sys-color-outline-variant)' }}>
                    <button type="button" className="btn text-btn" onClick={onClose} disabled={isLoading}>Cancel</button>
                    <button type="submit" className="btn filled-btn" disabled={isLoading} style={{ minWidth: '100px' }}>
                        {isLoading ? 'Saving...' : (userToEdit ? 'Save Changes' : 'Create Account')}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
