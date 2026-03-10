"use client";
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export interface TaskProps {
    task: {
        id: string;
        title: string;
        description?: string;
        status: string;
        priority: string;
        order?: number;
        assignee?: {
            name: string;
            image?: string | null;
        } | null;
        estimatedHours?: number | null;
        actualHours?: number | null;
        taskCategory?: string | null;
        isBillable?: boolean;
    };
    index: number;
    onEdit?: () => void;
}

export default function TaskCard({ task, index, onEdit }: TaskProps) {
    const priorityCaps = task.priority.charAt(0).toUpperCase() + task.priority.slice(1);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: task.id,
        data: {
            task: task,
            type: "Task"
        }
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        boxShadow: isDragging ? '0 12px 24px rgba(0,0,0,0.15)' : undefined,
        zIndex: isDragging ? 999 : 1,
        position: 'relative' as const,
        cursor: isDragging ? 'grabbing' : 'grab',
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`card card-${task.priority} ${isDragging ? 'is-dragging' : ''}`}
        >
            <div className="card-content" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>

                {/* Header: Title + Edit Button */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: 'var(--sys-color-on-surface)', lineHeight: '1.4' }}>
                        {task.isBillable && (
                            <span
                                className="material-symbols-outlined"
                                style={{ fontSize: '16px', color: 'var(--sys-color-primary)', verticalAlign: 'text-bottom', marginRight: '6px' }}
                                title="Billable Task"
                            >
                                payments
                            </span>
                        )}
                        {task.title}
                    </h3>
                    <button
                        className="icon-btn small"
                        aria-label="Edit Task"
                        // Stop pointer down propagation to prevent drag from starting when clicking edit
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => { e.stopPropagation(); if (onEdit) onEdit(); }}
                        style={{ margin: '-4px -8px 0 8px', color: 'var(--sys-color-on-surface-variant)' }}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
                    </button>
                </div>

                {/* Description Truncated */}
                {task.description && (
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--sys-color-on-surface-variant)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.5' }}>
                        {task.description}
                    </p>
                )}

                {/* Metadata Row: Chips and Hours */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px', alignItems: 'center' }}>
                    <div className={`filter-chip chip-${task.priority}`} style={{ padding: '2px 8px', fontSize: '11px', margin: 0, height: 'auto', minHeight: 'unset' }}>
                        <span>{priorityCaps}</span>
                    </div>

                    {task.taskCategory && (
                        <div style={{ backgroundColor: 'var(--sys-color-surface-variant)', color: 'var(--sys-color-on-surface-variant)', padding: '2px 8px', border: '1px solid var(--sys-color-outline-variant)', borderRadius: '12px', fontSize: '11px', fontWeight: 500 }}>
                            {task.taskCategory}
                        </div>
                    )}
                </div>

                {/* Footer: Hours & Assignee */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '4px' }}>
                    <div style={{ flex: 1 }}>
                        {(task.estimatedHours || task.actualHours) ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--sys-color-on-surface-variant)', fontSize: '12px', fontWeight: 500 }}>
                                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>schedule</span>
                                {task.actualHours || 0}{task.estimatedHours ? ` / ${task.estimatedHours}` : ''}h
                            </div>
                        ) : (
                            <div style={{ height: '20px' }}></div> /* Spacer to keep avatar aligned */
                        )}
                    </div>

                    {task.assignee && (
                        <div>
                            {task.assignee.image ? (
                                <img src={task.assignee.image} alt="Assignee" title={task.assignee.name} className="avatar-small" style={{ margin: 0 }} />
                            ) : (
                                <div className="avatar-small" title={task.assignee.name} style={{ margin: 0, backgroundColor: 'var(--sys-color-secondary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold' }}>
                                    {task.assignee.name.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
