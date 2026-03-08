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

    useEffect(() => {
        if (isOpen) {
            if (userToEdit) {
                setName(userToEdit.name || '');
                setEmail(userToEdit.email || '');
                setRole(userToEdit.role || 'USER');
                setIsActive(userToEdit.isActive === undefined ? true : Boolean(userToEdit.isActive)); // Explicitly cast the original DB state to true/false, defaulting to true
                setPassword(''); // Don't prefill password
                setImage(userToEdit.image || '');
            } else {
                setName('');
                setEmail('');
                setRole('USER');
                setIsActive(true);
                setPassword('');
                setImage('');
            }
            setError('');
        }
    }, [isOpen, userToEdit]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
            };
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

        // Prepare payload - don't send empty password on edit
        const payload: any = { name, email, role, image, isActive };
        if (!isEditing || password.trim() !== '') {
            payload.password = password;
        }

        try {
            const res = await fetch(endpoint, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                // Force session sync if user alters themselves from the admin panel
                if (isEditing && session?.user?.id === userToEdit.id) {
                    await update({ name, image });
                }

                onUserSaved();
                onClose();
            } else {
                const data = await res.json();
                setError(data.error || `Failed to ${isEditing ? 'update' : 'create'} user`);
            }
        } catch (error) {
            setError("An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={userToEdit ? "Edit User" : "Create New User"}>
            <form onSubmit={handleSubmit} className="modal-form">
                {error && <div style={{ color: 'var(--md-sys-color-error)', fontSize: '14px', marginBottom: '8px' }}>{error}</div>}

                <label className="body-medium">Full Name</label>
                <input
                    className="custom-input"
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    placeholder="Jane Doe"
                />

                <label className="body-medium">Email Address</label>
                <input
                    className="custom-input"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="jane@example.com"
                />

                <label className="body-medium">Profile Image (Optional)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {(image || (userToEdit && userToEdit.image)) && (
                        <div style={{ width: '48px', height: '48px', overflow: 'hidden', borderRadius: '50%', flexShrink: 0, border: '1px solid var(--md-sys-color-outline-variant)' }}>
                            <img src={image || userToEdit.image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                    )}
                    <label className="btn text-btn" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>upload</span>
                        {image ? 'Change Image' : 'Upload Image'}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            style={{ display: 'none' }}
                        />
                    </label>
                    {image && (
                        <button type="button" className="icon-btn small" onClick={() => setImage('')} title="Remove Image" style={{ color: 'var(--md-sys-color-error)' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
                        </button>
                    )}
                </div>

                <label className="body-medium">
                    Password {userToEdit && <span className="text-variant" style={{ fontSize: '12px' }}>(Leave blank to keep current)</span>}
                </label>
                <input
                    className="custom-input"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required={!userToEdit}
                    placeholder="••••••••"
                />

                {(session?.user as any)?.role === 'ADMIN' && (
                    <>
                        <label className="body-medium" style={{ marginTop: '16px' }}>Account Role</label>
                        <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', margin: 0 }}>
                                <input
                                    type="radio"
                                    name="role"
                                    value="USER"
                                    checked={role === 'USER'}
                                    onChange={() => setRole('USER')}
                                />
                                <span className="body-medium">Standard User</span>
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', margin: 0 }}>
                                <input
                                    type="radio"
                                    name="role"
                                    value="ADMIN"
                                    checked={role === 'ADMIN'}
                                    onChange={() => setRole('ADMIN')}
                                />
                                <span className="body-medium">Administrator</span>
                            </label>
                        </div>
                    </>
                )}

                {(session?.user as any)?.role === 'ADMIN' && userToEdit && userToEdit.id !== session?.user?.id && (
                    <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '40px', height: '20px' }}>
                            <input
                                type="checkbox"
                                checked={isActive}
                                onChange={(e) => setIsActive(e.target.checked)}
                                style={{ opacity: 0, width: 0, height: 0 }}
                            />
                            <span className={`slider round ${isActive ? 'checked' : ''}`} style={{
                                position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                                backgroundColor: isActive ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-outline)',
                                transition: '.4s', borderRadius: '20px'
                            }}>
                                <span style={{
                                    position: 'absolute', content: '""', height: '16px', width: '16px',
                                    left: isActive ? '22px' : '2px', bottom: '2px', backgroundColor: 'white',
                                    transition: '.4s', borderRadius: '50%'
                                }} />
                            </span>
                        </label>
                        <span className="body-medium">Account is {isActive ? 'Active' : 'Disabled'}</span>
                    </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '24px' }}>
                    <button type="button" className="btn text-btn" onClick={onClose} disabled={isLoading}>Cancel</button>
                    <button type="submit" className="btn filled-btn" disabled={isLoading}>
                        {isLoading ? 'Saving...' : (userToEdit ? 'Save Changes' : 'Create Account')}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
