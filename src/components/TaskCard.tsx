"use client";
import React from 'react';
import { Draggable } from '@hello-pangea/dnd';

// Defines the shape of our mocked data (later Prisma Model)
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
    };
    index: number;
    onEdit?: () => void;
}

export default function TaskCard({ task, index, onEdit }: TaskProps) {
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
        <Draggable draggableId={task.id} index={index}>
            {(provided, snapshot) => (
                <div
                    className={`card card-${task.priority} ${snapshot.isDragging ? 'is-dragging' : ''}`}
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={{
                        ...provided.draggableProps.style,
                        opacity: snapshot.isDragging ? 0.8 : 1,
                        boxShadow: snapshot.isDragging ? '0 8px 16px rgba(0,0,0,0.1)' : undefined
                    }}
                >
                    <div className="card-content">
                        <div className="card-header">
                            <h3>{task.title}</h3>
                            <button className="icon-btn small" aria-label="Options" onClick={(e) => { e.stopPropagation(); if (onEdit) onEdit(); }}>
                                <span className="material-symbols-outlined">more_horiz</span>
                            </button>
                        </div>
                        {task.description && (
                            <p className="body-medium text-variant" style={{ margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                {task.description}
                            </p>
                        )}
                        <div className="card-footer">
                            <div className={`filter-chip chip-${task.priority}`}>
                                <span>{priorityCaps}</span>
                            </div>
                            {task.assignee ? (
                                task.assignee.image ? (
                                    <img src={task.assignee.image} alt="Assignee" title={task.assignee.name} className="avatar-small" />
                                ) : (
                                    <div className="avatar-small" title={task.assignee.name} style={{ backgroundColor: 'var(--sys-color-secondary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold' }}>
                                        {task.assignee.name.charAt(0).toUpperCase()}
                                    </div>
                                )
                            ) : (
                                <div className="avatar-small" style={{ backgroundColor: 'var(--sys-color-outline-variant)' }} title="Unassigned"></div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </Draggable>
    );
}
