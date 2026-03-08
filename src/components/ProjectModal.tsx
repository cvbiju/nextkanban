"use client";
import React, { useState } from 'react';
import Modal from './Modal';

interface ProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onProjectSaved: () => void;
    projectToEdit?: any;
}

export default function ProjectModal({ isOpen, onClose, onProjectSaved, projectToEdit }: ProjectModalProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    React.useEffect(() => {
        if (isOpen) {
            if (projectToEdit) {
                setTitle(projectToEdit.title || '');
                setDescription(projectToEdit.description || '');
            } else {
                setTitle('');
                setDescription('');
            }
        }
    }, [isOpen, projectToEdit]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const isEditing = !!projectToEdit;

        try {
            const res = await fetch('/api/projects', {
                method: isEditing ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...(isEditing ? { id: projectToEdit.id } : {}),
                    title,
                    description,
                })
            });

            if (res.ok) {
                setTitle('');
                setDescription('');
                onProjectSaved();
                onClose();
            } else {
                alert(`Failed to ${isEditing ? 'update' : 'create'} project. Ensure you are an Admin.`);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={projectToEdit ? "Edit Project" : "Create New Project"}>
            <form onSubmit={handleSubmit} className="modal-form">
                <label className="body-medium">Project Title</label>
                <input
                    className="custom-input"
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required
                    placeholder="Enter project title"
                />

                <label className="body-medium">Description</label>
                <textarea
                    className="custom-input"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Enter description (optional)"
                    rows={3}
                />

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
                    <button type="button" className="btn text-btn" onClick={onClose} disabled={isLoading}>Cancel</button>
                    <button type="submit" className="btn filled-btn" disabled={isLoading}>
                        {isLoading ? 'Saving...' : (projectToEdit ? 'Save Changes' : 'Create Project')}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
