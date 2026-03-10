"use client";
import React, { useState } from 'react';
import Modal from './Modal';

interface TaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectId: string;
    projectMembers: any[];
    onTaskSaved: () => void;
    taskToEdit?: any;
}

export default function TaskModal({ isOpen, onClose, projectId, projectMembers, onTaskSaved, taskToEdit }: TaskModalProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('low');
    const [assigneeId, setAssigneeId] = useState('');

    // IT Services Fields
    const [startDate, setStartDate] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [estimatedHours, setEstimatedHours] = useState('');
    const [actualHours, setActualHours] = useState('');
    const [taskCategory, setTaskCategory] = useState('');
    const [isBillable, setIsBillable] = useState(true);

    const [isLoading, setIsLoading] = useState(false);
    const [notes, setNotes] = useState<any[]>([]);
    const [newNoteText, setNewNoteText] = useState('');
    const [newNoteAttachments, setNewNoteAttachments] = useState<{ name: string, data: string, type: string }[]>([]);
    const [isNotesLoading, setIsNotesLoading] = useState(false);

    React.useEffect(() => {
        if (isOpen) {
            if (taskToEdit) {
                setTitle(taskToEdit.title || '');
                setDescription(taskToEdit.description || '');
                setPriority(taskToEdit.priority || 'low');
                setAssigneeId(taskToEdit.assigneeId || '');
                setStartDate(taskToEdit.startDate ? new Date(taskToEdit.startDate).toISOString().split('T')[0] : '');
                setDueDate(taskToEdit.dueDate ? new Date(taskToEdit.dueDate).toISOString().split('T')[0] : '');
                setEstimatedHours(taskToEdit.estimatedHours?.toString() || '');
                setActualHours(taskToEdit.actualHours?.toString() || '');
                setTaskCategory(taskToEdit.taskCategory || '');
                setIsBillable(taskToEdit.isBillable ?? true);

                // Fetch notes
                fetch(`/api/tasks/${taskToEdit.id}/notes`)
                    .then(res => res.json())
                    .then(data => {
                        if (Array.isArray(data)) setNotes(data);
                    });
            } else {
                setTitle('');
                setDescription('');
                setPriority('low');
                setAssigneeId('');
                setStartDate('');
                setDueDate('');
                setEstimatedHours('');
                setActualHours('');
                setTaskCategory('');
                setIsBillable(true);

                setNotes([]);
                setNewNoteText('');
                setNewNoteAttachments([]);
            }
        }
    }, [isOpen, taskToEdit]);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewNoteAttachments(prev => [...prev, { name: file.name, data: reader.result as string, type: file.type }]);
            };
            reader.readAsDataURL(file);
        });
        e.target.value = '';
    };

    const handleAddNote = async () => {
        if (!newNoteText.trim() && newNoteAttachments.length === 0) return;
        setIsNotesLoading(true);
        try {
            const res = await fetch(`/api/tasks/${taskToEdit.id}/notes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: newNoteText,
                    mediaUrl: newNoteAttachments.length > 0 ? JSON.stringify(newNoteAttachments) : null
                })
            });
            if (res.ok) {
                const newNote = await res.json();
                setNotes([...notes, newNote]);
                setNewNoteText('');
                setNewNoteAttachments([]);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsNotesLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const isEditing = !!taskToEdit;

        try {
            const res = await fetch('/api/tasks', {
                method: isEditing ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...(isEditing ? { id: taskToEdit.id } : {}),
                    projectId,
                    title,
                    description,
                    priority,
                    ...(isEditing ? {} : { status: 'TODO' }),
                    assigneeId: assigneeId || null,
                    startDate: startDate || null,
                    dueDate: dueDate || null,
                    estimatedHours: estimatedHours ? parseFloat(estimatedHours) : null,
                    actualHours: actualHours ? parseFloat(actualHours) : null,
                    taskCategory: taskCategory || null,
                    isBillable
                })
            });

            if (res.ok) {
                setTitle('');
                setDescription('');
                setPriority('low');
                setAssigneeId('');
                onTaskSaved();
                onClose();
            } else {
                alert(`Failed to ${isEditing ? 'update' : 'create'} task`);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={taskToEdit ? "Edit Task" : "Create New Task"}>
            <form onSubmit={handleSubmit} className="modal-form">

                {/* Scrollable Container */}
                <div className="modal-body">
                    {/* Task Details Section */}
                    <div>
                        <h3 className="title-medium" style={{ marginBottom: '16px', borderBottom: '1px solid var(--sys-color-outline-variant)', paddingBottom: '8px', color: 'var(--sys-color-on-surface)' }}>
                            Task Details
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label className="body-medium" style={{ display: 'block', marginBottom: '8px' }}>Task Title <span style={{ color: 'var(--md-sys-color-error)' }}>*</span></label>
                                <input
                                    className="custom-input"
                                    type="text"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    required
                                    placeholder="Enter task title"
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

                            <div style={{ display: 'flex', gap: '16px' }}>
                                <div style={{ flex: 1 }}>
                                    <label className="body-medium" style={{ display: 'block', marginBottom: '8px' }}>Priority</label>
                                    <select className="custom-input" value={priority} onChange={e => setPriority(e.target.value)} style={{ width: '100%' }}>
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label className="body-medium" style={{ display: 'block', marginBottom: '8px' }}>Assign To</label>
                                    <select className="custom-input" value={assigneeId} onChange={e => setAssigneeId(e.target.value)} style={{ width: '100%' }}>
                                        <option value="">Unassigned</option>
                                        {projectMembers.map(member => (
                                            <option key={member.userId} value={member.userId}>
                                                {member.user?.name || member.user?.email}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Effort & Scheduling Section */}
                    <div>
                        <h3 className="title-medium" style={{ marginBottom: '16px', borderBottom: '1px solid var(--sys-color-outline-variant)', paddingBottom: '8px', color: 'var(--sys-color-on-surface)' }}>
                            Effort & Scheduling
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
                                    <label className="body-medium" style={{ display: 'block', marginBottom: '8px' }}>Due Date</label>
                                    <input
                                        className="custom-input"
                                        type="date"
                                        value={dueDate}
                                        min={startDate || undefined}
                                        onChange={e => setDueDate(e.target.value)}
                                        style={{ width: '100%' }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '16px' }}>
                                <div style={{ flex: 1 }}>
                                    <label className="body-medium" style={{ display: 'block', marginBottom: '8px' }}>Estimated Hours</label>
                                    <input
                                        className="custom-input"
                                        type="number"
                                        step="0.5"
                                        min="0"
                                        value={estimatedHours}
                                        onChange={e => setEstimatedHours(e.target.value)}
                                        placeholder="0"
                                        style={{ width: '100%' }}
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label className="body-medium" style={{ display: 'block', marginBottom: '8px' }}>Actual Hours</label>
                                    <input
                                        className="custom-input"
                                        type="number"
                                        step="0.5"
                                        min="0"
                                        value={actualHours}
                                        onChange={e => setActualHours(e.target.value)}
                                        placeholder="0"
                                        style={{ width: '100%' }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                                <div style={{ flex: 1 }}>
                                    <label className="body-medium" style={{ display: 'block', marginBottom: '8px' }}>Task Category</label>
                                    <select className="custom-input" value={taskCategory} onChange={e => setTaskCategory(e.target.value)} style={{ width: '100%' }}>
                                        <option value="">Select category...</option>
                                        <option value="DEV">Development</option>
                                        <option value="DESIGN">Design</option>
                                        <option value="QA">Quality Assurance</option>
                                        <option value="PM">Project Management</option>
                                        <option value="SUPPORT">Support</option>
                                    </select>
                                </div>
                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', height: '80px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={isBillable}
                                            onChange={e => setIsBillable(e.target.checked)}
                                            style={{ width: '18px', height: '18px', accentColor: 'var(--sys-color-primary)' }}
                                        />
                                        <span className="body-medium">Billable Task</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {taskToEdit && (
                        <div style={{ marginTop: '24px', borderTop: '1px solid var(--md-sys-color-outline-variant)', paddingTop: '16px' }}>
                            <h3 className="title-medium" style={{ marginBottom: '16px', borderBottom: '1px solid var(--sys-color-outline-variant)', paddingBottom: '8px', color: 'var(--sys-color-on-surface)' }}>Notes & Attachments</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '200px', overflowY: 'auto', marginBottom: '16px', paddingRight: '8px' }}>
                                {notes.length === 0 && <p className="body-small text-variant">No notes yet.</p>}
                                {notes.map(note => (
                                    <div key={note.id} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', backgroundColor: 'var(--md-sys-color-surface-container)', padding: '8px 12px', borderRadius: '8px' }}>
                                        {note.author?.image ? (
                                            <img src={note.author.image} alt={note.author.name} style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                                        ) : (
                                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--md-sys-color-primary)', color: 'var(--md-sys-color-on-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold', flexShrink: 0 }}>
                                                {note.author?.name?.charAt(0) || '?'}
                                            </div>
                                        )}
                                        <div style={{ flexGrow: 1 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                                <span className="body-small" style={{ fontWeight: 500 }}>{note.author?.name}</span>
                                                <span className="body-small text-variant" style={{ fontSize: '10px' }}>{new Date(note.createdAt).toLocaleString()}</span>
                                            </div>
                                            {note.text && <p className="body-small" style={{ whiteSpace: 'pre-wrap', marginBottom: note.mediaUrl ? '8px' : '0', wordBreak: 'break-word' }}>{note.text}</p>}
                                            {note.mediaUrl && (() => {
                                                try {
                                                    const attachments = JSON.parse(note.mediaUrl);
                                                    if (Array.isArray(attachments)) {
                                                        return (
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                                                                {attachments.map((att, i) => (
                                                                    att.type && att.type.startsWith('image/') ? (
                                                                        <img key={i} src={att.data} alt={att.name} style={{ maxWidth: '100%', borderRadius: '4px', border: '1px solid var(--md-sys-color-outline-variant)' }} />
                                                                    ) : (
                                                                        <a key={i} href={att.data} download={att.name} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', border: '1px solid var(--md-sys-color-outline)', borderRadius: '4px', textDecoration: 'none', color: 'var(--md-sys-color-primary)', backgroundColor: 'var(--md-sys-color-surface)' }}>
                                                                            <span className="material-symbols-outlined">description</span>
                                                                            <span className="body-small" style={{ wordBreak: 'break-all' }}>{att.name}</span>
                                                                        </a>
                                                                    )
                                                                ))}
                                                            </div>
                                                        );
                                                    }
                                                    return <img src={note.mediaUrl} alt="Attachment" style={{ maxWidth: '100%', borderRadius: '4px', border: '1px solid var(--md-sys-color-outline-variant)', marginTop: '8px' }} />;
                                                } catch {
                                                    return <img src={note.mediaUrl} alt="Attachment" style={{ maxWidth: '100%', borderRadius: '4px', border: '1px solid var(--md-sys-color-outline-variant)', marginTop: '8px' }} />;
                                                }
                                            })()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', border: '1px solid var(--md-sys-color-outline)', borderRadius: '8px', padding: '12px', backgroundColor: 'var(--md-sys-color-surface)' }}>
                                <textarea
                                    className="body-medium"
                                    style={{ width: '100%', border: 'none', background: 'transparent', resize: 'vertical', minHeight: '60px', outline: 'none', fontFamily: 'inherit', padding: 0 }}
                                    placeholder="Write a detailed note or add multiple documents..."
                                    value={newNoteText}
                                    onChange={e => setNewNoteText(e.target.value)}
                                />

                                {newNoteAttachments.length > 0 && (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                                        {newNoteAttachments.map((att, i) => (
                                            <div key={i} style={{ position: 'relative', width: '60px', height: '60px', borderRadius: '4px', border: '1px solid var(--md-sys-color-outline)', overflow: 'hidden', backgroundColor: 'var(--md-sys-color-surface-variant)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                {att.type.startsWith('image/') ? (
                                                    <img src={att.data} alt={att.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <span className="material-symbols-outlined" title={att.name} style={{ margin: 'auto' }}>description</span>
                                                )}
                                                <button type="button" onClick={() => setNewNoteAttachments(prev => prev.filter((_, idx) => idx !== i))} style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '10px' }}>×</button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                                    <label className="icon-btn small" title="Attach Files" style={{ cursor: 'pointer', backgroundColor: 'var(--md-sys-color-surface-variant)', color: 'var(--md-sys-color-on-surface-variant)' }}>
                                        <span className="material-symbols-outlined">attach_file</span>
                                        <input type="file" multiple onChange={handleFileUpload} style={{ display: 'none' }} />
                                    </label>
                                    <button type="button" className="btn filled-btn" style={{ padding: '0 16px', height: '32px' }} onClick={handleAddNote} disabled={isNotesLoading || (!newNoteText.trim() && newNoteAttachments.length === 0)}>
                                        Add Note
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                </div> {/* End modal-body */}

                {/* Sticky Footer */}
                <div className="modal-footer">
                    <button type="button" className="btn text-btn" onClick={onClose} disabled={isLoading}>Cancel</button>
                    <button type="submit" className="btn filled-btn" disabled={isLoading}>
                        {isLoading ? 'Saving...' : (taskToEdit ? 'Save Changes' : 'Create Task')}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
