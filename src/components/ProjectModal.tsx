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
    const [clientName, setClientName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [targetEndDate, setTargetEndDate] = useState('');
    const [engagementModel, setEngagementModel] = useState('');
    const [totalBudget, setTotalBudget] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    React.useEffect(() => {
        if (isOpen) {
            if (projectToEdit) {
                setTitle(projectToEdit.title || '');
                setDescription(projectToEdit.description || '');
                setClientName(projectToEdit.clientName || '');
                setStartDate(projectToEdit.startDate ? new Date(projectToEdit.startDate).toISOString().split('T')[0] : '');
                setTargetEndDate(projectToEdit.targetEndDate ? new Date(projectToEdit.targetEndDate).toISOString().split('T')[0] : '');
                setEngagementModel(projectToEdit.engagementModel || '');
                setTotalBudget(projectToEdit.totalBudget !== null && projectToEdit.totalBudget !== undefined ? projectToEdit.totalBudget.toString() : '');
            } else {
                setTitle('');
                setDescription('');
                setClientName('');
                setStartDate('');
                setTargetEndDate('');
                setEngagementModel('');
                setTotalBudget('');
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
                    clientName,
                    startDate,
                    targetEndDate,
                    engagementModel,
                    totalBudget,
                })
            });

            if (res.ok) {
                setTitle('');
                setDescription('');
                setClientName('');
                setStartDate('');
                setTargetEndDate('');
                setEngagementModel('');
                setTotalBudget('');
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

                {/* Scrollable Container */}
                <div className="modal-body">
                    {/* General Details Section */}
                    <div>
                        <h3 className="title-medium" style={{ marginBottom: '16px', color: 'var(--sys-color-primary)', borderBottom: '1px solid var(--sys-color-outline-variant)', paddingBottom: '8px' }}>
                            General Details
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label className="body-medium" style={{ display: 'block', marginBottom: '8px' }}>Project Title <span style={{ color: 'var(--md-sys-color-error)' }}>*</span></label>
                                <input
                                    className="custom-input"
                                    type="text"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    required
                                    placeholder="Enter project title"
                                    style={{ width: '100%' }}
                                />
                            </div>

                            <div>
                                <label className="body-medium" style={{ display: 'block', marginBottom: '8px' }}>Description</label>
                                <textarea
                                    className="custom-input"
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    placeholder="Enter description (optional)"
                                    rows={3}
                                    style={{ width: '100%', resize: 'vertical' }}
                                />
                            </div>

                            <div>
                                <label className="body-medium" style={{ display: 'block', marginBottom: '8px' }}>Client Name</label>
                                <input
                                    className="custom-input"
                                    type="text"
                                    value={clientName}
                                    onChange={e => setClientName(e.target.value)}
                                    placeholder="Enter client or company name"
                                    style={{ width: '100%' }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Financials & Scheduling Section */}
                    <div>
                        <h3 className="title-medium" style={{ marginBottom: '16px', color: 'var(--sys-color-primary)', borderBottom: '1px solid var(--sys-color-outline-variant)', paddingBottom: '8px' }}>
                            Financials & Scheduling
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'flex', gap: '16px' }}>
                                <div style={{ flex: 1 }}>
                                    <label className="body-medium" style={{ display: 'block', marginBottom: '8px' }}>Start Date</label>
                                    <input
                                        className="custom-input"
                                        type="date"
                                        value={startDate}
                                        onChange={e => setStartDate(e.target.value)}
                                        style={{ width: '100%' }}
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label className="body-medium" style={{ display: 'block', marginBottom: '8px' }}>Target End Date</label>
                                    <input
                                        className="custom-input"
                                        type="date"
                                        value={targetEndDate}
                                        min={startDate || undefined} // UI Logic: Cannot end before start
                                        onChange={e => setTargetEndDate(e.target.value)}
                                        style={{ width: '100%' }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '16px' }}>
                                <div style={{ flex: 1 }}>
                                    <label className="body-medium" style={{ display: 'block', marginBottom: '8px' }}>Engagement Model</label>
                                    <select
                                        className="custom-input"
                                        value={engagementModel}
                                        onChange={e => setEngagementModel(e.target.value)}
                                        style={{ width: '100%' }}
                                    >
                                        <option value="">Select model...</option>
                                        <option value="FIXED_BID">Fixed Bid</option>
                                        <option value="TIME_AND_MATERIALS">Time & Materials</option>
                                        <option value="RETAINER">Retainer</option>
                                    </select>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label className="body-medium" style={{ display: 'block', marginBottom: '8px' }}>Total Budget</label>
                                    <div style={{ position: 'relative' }}>
                                        <span style={{
                                            position: 'absolute',
                                            left: '12px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: 'var(--sys-color-on-surface-variant)',
                                            pointerEvents: 'none',
                                            fontWeight: '500'
                                        }}>$</span>
                                        <input
                                            className="custom-input"
                                            type="number"
                                            step="0.01"
                                            value={totalBudget}
                                            onChange={e => setTotalBudget(e.target.value)}
                                            placeholder="0.00"
                                            style={{ width: '100%', paddingLeft: '28px' }} // Padding to clear the $ symbol
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div> {/* End modal-body */}

                {/* Sticky Footer */}
                <div className="modal-footer">
                    <button type="button" className="btn text-btn" onClick={onClose} disabled={isLoading}>Cancel</button>
                    <button type="submit" className="btn filled-btn" disabled={isLoading}>
                        {isLoading ? 'Saving...' : (projectToEdit ? 'Save Changes' : 'Create Project')}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
