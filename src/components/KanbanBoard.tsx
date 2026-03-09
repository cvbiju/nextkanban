"use client";
import React, { useState, useEffect } from 'react';
import TaskCard, { TaskProps } from './TaskCard';
import TaskModal from './TaskModal';
import { useSession } from "next-auth/react";
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';

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

    const handleDragEnd = async (result: DropResult) => {
        const { destination, source, draggableId } = result;

        if (!destination) {
            return;
        }

        // Check if dropped in the same position
        if (destination.droppableId === source.droppableId && destination.index === source.index) {
            return;
        }

        // Find the moved task
        const movedTask = tasks.find(t => t.id === draggableId);
        if (!movedTask) return;

        // Create a new array of tasks to manipulate for optimistic UI update
        let updatedTasks = Array.from(tasks);

        // Remove the task from its original position
        updatedTasks = updatedTasks.filter(t => t.id !== draggableId);

        // Get the destination column tasks, sorted by order
        const destColumnTasks = updatedTasks
            .filter(t => t.status === destination.droppableId)
            .sort((a, b) => (a.order || 0) - (b.order || 0));

        // Calculate the new order value
        let newOrder = 0;
        if (destColumnTasks.length === 0) {
            newOrder = 1000; // First item in column
        } else if (destination.index === 0) {
            newOrder = (destColumnTasks[0].order || 1000) / 2; // Before first item
        } else if (destination.index >= destColumnTasks.length) {
            newOrder = (destColumnTasks[destColumnTasks.length - 1].order || 0) + 1000; // After last item
        } else {
            // Between two items
            const prevOrder = destColumnTasks[destination.index - 1].order || 0;
            const nextOrder = destColumnTasks[destination.index].order || 0;
            newOrder = (prevOrder + nextOrder) / 2;
        }

        // Optimistically update the UI
        const updatedTask = { ...movedTask, status: destination.droppableId, order: newOrder };
        updatedTasks.push(updatedTask);
        setTasks(updatedTasks);

        // Persist to API
        try {
            await fetch(`/api/tasks`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: draggableId, status: destination.droppableId, order: newOrder })
            });
        } catch (error) {
            console.error("Failed to update task order", error);
            // Optionally revert UI state here on failure
            fetchTasks();
        }
    };

    const renderColumn = (title: string, statusId: string, cssClass: string) => {
        const columnTasks = tasks
            .filter(t => t.status === statusId)
            .sort((a, b) => (a.order || 0) - (b.order || 0));

        return (
            <Droppable droppableId={statusId}>
                {(provided, snapshot) => (
                    <section
                        className={`board-column ${cssClass}`}
                        style={{
                            display: 'flex', flexDirection: 'column', height: '100%',
                            backgroundColor: snapshot.isDraggingOver ? 'var(--sys-color-surface-container)' : undefined
                        }}
                    >
                        <div className="column-header">
                            <h2 className="title-medium">{title}</h2>
                            <span className="task-count">{columnTasks.length}</span>
                        </div>
                        <div
                            className="kanban-cards"
                            style={{ flexGrow: 1, minHeight: '150px' }}
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                        >
                            {columnTasks.map((task, index) => (
                                // @ts-ignore
                                <TaskCard key={task.id} task={task} index={index} onEdit={() => { setTaskToEdit(task); setIsTaskModalOpen(true); }} />
                            ))}
                            {provided.placeholder}
                        </div>
                    </section>
                )}
            </Droppable>
        );
    };

    // Authentication is handled via middleware now

    return (
        <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, backgroundColor: 'var(--sys-color-background)' }}>
            {/* Project Selector Header Area */}
            <div style={{ padding: '16px 32px', borderBottom: '1px solid var(--sys-color-outline)', backgroundColor: 'var(--sys-color-surface)' }}>
                <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="material-symbols-outlined" style={{ color: 'var(--sys-color-primary)', fontSize: '20px' }}>deployed_code</span>
                        <span className="title-medium" style={{ margin: 0 }}>Workspace:</span>
                    </div>
                    <div style={{ maxWidth: '400px', position: 'relative' }}>
                        <select
                            className="custom-input"
                            style={{
                                padding: '6px 32px 6px 12px',
                                width: '100%',
                                cursor: 'pointer',
                                backgroundColor: 'transparent',
                                border: '1px solid transparent',
                                appearance: 'none',
                                fontWeight: 600,
                                margin: 0,
                                fontSize: '18px'
                            }}
                            value={activeProject || ''}
                            onChange={e => setActiveProject(e.target.value)}
                        >
                            <option value="" disabled>Select a project...</option>
                            {projects.map(p => (
                                <option key={p.id} value={p.id}>{p.title}</option>
                            ))}
                        </select>
                        <span className="material-symbols-outlined" style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#6B778C' }}>
                            unfold_more
                        </span>
                    </div>
                </div>
            </div>

            {/* Kanban Board Area */}
            {projects.length > 0 ? (
                <DragDropContext onDragEnd={handleDragEnd}>
                    <main className="board-container">
                        {renderColumn('Ready to begin', 'TODO', 'column-todo')}
                        {renderColumn('In Progress', 'IN_PROGRESS', 'column-inprogress')}
                        {renderColumn('Done', 'DONE', 'column-done')}

                        <button className="fab" aria-label="Add new task" onClick={() => { setTaskToEdit(null); setIsTaskModalOpen(true); }}>
                            <span className="material-symbols-outlined">add</span>
                        </button>
                    </main>
                </DragDropContext>
            ) : (
                <main className="board-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{ textAlign: 'center', maxWidth: '400px', padding: '40px', backgroundColor: 'var(--sys-color-surface)', borderRadius: '24px', boxShadow: 'var(--sys-elevation-2)' }}>
                        <div style={{ width: '80px', height: '80px', backgroundColor: '#F4F5F7', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '40px', color: 'var(--sys-color-primary)' }}>rule_folder</span>
                        </div>
                        <h2 className="title-large" style={{ marginBottom: '12px' }}>No Projects Found</h2>
                        <p className="body-medium text-variant" style={{ marginBottom: '32px' }}>To start managing your tasks, you first need to create a project workspace.</p>
                        <button
                            className="btn filled-btn"
                            style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 auto' }}
                            onClick={() => setIsTaskModalOpen(false) /* Ensure any task modal is closed */}
                            onMouseDown={() => { window.location.href = '/projects'; }}
                        >
                            <span className="material-symbols-outlined">add</span>
                            Create Your First Project
                        </button>
                    </div>
                </main>
            )}

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
