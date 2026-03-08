"use client";
import React from 'react';

// Defines the shape of our mocked data (later Prisma Model)
export interface TaskProps {
    task: {
        id: string;
        title: string;
        description?: string;
        status: string;
        priority: string;
        assignee?: {
            name: string;
            image?: string | null;
        } | null;
    };
    onEdit?: () => void;
}

export default function TaskCard({ task, onEdit }: TaskProps) {
    const priorityCaps = task.priority.charAt(0).toUpperCase() + task.priority.slice(1);

    const handleDragStart = (e: React.DragEvent) => {
        e.dataTransfer.setData('taskId', task.id);
        // Add dragging class to the target element
        (e.target as HTMLElement).classList.add('dragging');
    };

    const handleDragEnd = (e: React.DragEvent) => {
        (e.target as HTMLElement).classList.remove('dragging');
    };

    return (
        <div
            className={`card card-${task.priority} elevated`}
            draggable="true"
            tabIndex={0}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="card-state-layer"></div>
            <div className="card-content">
                <div className="card-header">
                    <h3 className="title-medium">{task.title}</h3>
                    <button className="icon-btn small" aria-label="Options" onClick={(e) => { e.stopPropagation(); if (onEdit) onEdit(); }}>
                        <span className="material-symbols-outlined">more_vert</span>
                    </button>
                </div>
                <p className="body-small text-variant">{task.description}</p>
                <div className="card-footer">
                    <div className={`filter-chip chip-${task.priority}`}>
                        <span className="body-small">{priorityCaps}</span>
                    </div>
                    {task.assignee ? (
                        task.assignee.image ? (
                            <img src={task.assignee.image} alt="Assignee" title={task.assignee.name} className="avatar-small" style={{ objectFit: 'cover' }} />
                        ) : (
                            <div className="avatar-small" title={task.assignee.name} style={{ backgroundColor: 'var(--md-sys-color-primary)', color: 'var(--md-sys-color-on-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                {task.assignee.name.charAt(0).toUpperCase()}
                            </div>
                        )
                    ) : (
                        <div className="avatar-small" style={{ backgroundColor: 'var(--md-sys-color-surface-variant)', borderRadius: '50%' }}></div>
                    )}
                </div>
            </div>
        </div>
    );
}
