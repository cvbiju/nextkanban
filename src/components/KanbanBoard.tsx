"use client";
import React, { useState, useEffect } from 'react';
import TaskCard, { TaskProps } from './TaskCard';
import TaskModal from './TaskModal';
import { useSession } from "next-auth/react";

export default function KanbanBoard() {
    const { data: session } = useSession();
    const [tasks, setTasks] = useState<TaskProps["task"][]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [activeProject, setActiveProject] = useState<string | null>(null);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState<any>(null);

    useEffect(() => {
        if (session) {
            // Fetch user's projects
            fetch('/api/projects')
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        setProjects(data);
                        if (data.length > 0) {
                            setActiveProject(data[0].id);
                        }
                    }
                });
        }
    }, [session]);

    const fetchTasks = () => {
        if (activeProject) {
            // Fetch tasks for the active project
            fetch(`/api/tasks?projectId=${activeProject}`)
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) setTasks(data);
                });
        }
    };

    useEffect(() => {
        fetchTasks();
    }, [activeProject]);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = async (e: React.DragEvent, status: string) => {
        e.preventDefault();
        const taskId = e.dataTransfer.getData('taskId');

        // Optimistic UI Update
        setTasks(tasks.map(t => t.id === taskId ? { ...t, status } : t));

        // Persist to DB
        await fetch('/api/tasks', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: taskId, status })
        });
    };

    const renderColumn = (title: string, statusId: string, cssClass: string) => {
        const columnTasks = tasks.filter(t => t.status === statusId);

        return (
            <section
                className={`board-column ${cssClass}`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, statusId)}
            >
                <div className="column-header">
                    <h2 className="title-medium">{title}</h2>
                    <span className="task-count">{columnTasks.length}</span>
                </div>
                <div className="kanban-cards">
                    {columnTasks.map(task => (
                        // @ts-ignore
                        <TaskCard key={task.id} task={task} onEdit={() => { setTaskToEdit(task); setIsTaskModalOpen(true); }} />
                    ))}
                </div>
            </section>
        );
    };

    // Authentication is handled via middleware now

    return (
        <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
            {/* Project Selector Panel */}
            <div style={{ padding: '16px 24px 0 24px' }}>
                <div style={{
                    padding: '16px 24px',
                    border: '2px solid transparent',
                    backgroundImage: 'linear-gradient(var(--md-sys-color-surface-container-low), var(--md-sys-color-surface-container-low)), linear-gradient(135deg, rgba(66,133,244,0.6), rgba(234,67,53,0.6), rgba(251,188,5,0.6), rgba(52,168,83,0.6))',
                    backgroundOrigin: 'border-box',
                    backgroundClip: 'padding-box, border-box',
                    borderRadius: '16px',
                    backgroundColor: 'var(--md-sys-color-surface-container-low)',
                    display: 'flex',
                    gap: '16px',
                    alignItems: 'center',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 'max-content' }}>
                        <span className="material-symbols-outlined" style={{ color: 'var(--md-sys-color-primary)', fontSize: '24px' }}>deployed_code</span>
                        <span className="title-medium" style={{ margin: 0 }}>Active Project:</span>
                    </div>
                    <div style={{ flexGrow: 1, maxWidth: '400px', position: 'relative' }}>
                        <select
                            className="custom-input"
                            style={{
                                padding: '10px 16px',
                                width: '100%',
                                cursor: 'pointer',
                                backgroundColor: 'var(--md-sys-color-surface)',
                                appearance: 'none',
                                fontWeight: 500
                            }}
                            value={activeProject || ''}
                            onChange={e => setActiveProject(e.target.value)}
                        >
                            <option value="" disabled>Select a project...</option>
                            {projects.map(p => (
                                <option key={p.id} value={p.id}>{p.title}</option>
                            ))}
                        </select>
                        <span className="material-symbols-outlined" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--md-sys-color-on-surface-variant)' }}>
                            expand_more
                        </span>
                    </div>
                </div>
            </div>

            <div style={{ padding: '24px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{
                    border: '2px solid transparent',
                    backgroundImage: 'linear-gradient(var(--md-sys-color-surface-container-low), var(--md-sys-color-surface-container-low)), linear-gradient(135deg, rgba(66,133,244,0.6), rgba(234,67,53,0.6), rgba(251,188,5,0.6), rgba(52,168,83,0.6))',
                    backgroundOrigin: 'border-box',
                    backgroundClip: 'padding-box, border-box',
                    borderRadius: '16px',
                    backgroundColor: 'var(--md-sys-color-surface-container-low)',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                    display: 'flex',
                    flexGrow: 1,
                    overflow: 'hidden'
                }}>
                    <main className="board-container" style={{ backgroundColor: 'transparent', margin: 0, padding: '24px' }}>
                        {renderColumn('To Do', 'TODO', 'column-todo')}
                        {renderColumn('In Progress', 'IN_PROGRESS', 'column-inprogress')}
                        {renderColumn('Done', 'DONE', 'column-done')}

                        <button className="fab" aria-label="Add new task" onClick={() => { setTaskToEdit(null); setIsTaskModalOpen(true); }}>
                            <span className="material-symbols-outlined">add</span>
                        </button>
                    </main>
                </div>
            </div>

            {activeProject && (
                <TaskModal
                    isOpen={isTaskModalOpen}
                    onClose={() => { setIsTaskModalOpen(false); setTaskToEdit(null); }}
                    projectId={activeProject}
                    projectMembers={projects.find(p => p.id === activeProject)?.members || []}
                    onTaskSaved={fetchTasks}
                    taskToEdit={taskToEdit}
                />
            )}
        </div>
    );
}
