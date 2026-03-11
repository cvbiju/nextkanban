"use client";
import React, { useState, useEffect } from 'react';
import TaskCard, { TaskProps } from './TaskCard';
import TaskModal from './TaskModal';
import { useSession } from "next-auth/react";
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
    defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import {
    SortableContext,
    arrayMove,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';

// Helper component for Sortable Columns
function DroppableColumn({ id, title, tasks, cssClass, activeId, onEdit, onAddTask }: any) {
    const { setNodeRef } = useDroppable({ id });

    return (
        <section className={`board-column ${cssClass}`} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div className="column-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h2 className="title-medium">{title}</h2>
                    <span className="task-count">{tasks.length}</span>
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                        onClick={onAddTask}
                        className="icon-btn small"
                        title="Add task"
                    >
                        <span className="material-symbols-outlined">add</span>
                    </button>
                    <button
                        className="icon-btn small"
                        title="Column actions"
                    >
                        <span className="material-symbols-outlined">more_vert</span>
                    </button>
                </div>
            </div>
            <SortableContext id={id} items={tasks.map((t: any) => t.id)} strategy={verticalListSortingStrategy}>
                <div
                    ref={setNodeRef}
                    className="kanban-cards"
                    style={{ flexGrow: 1, minHeight: '150px' }}
                >
                    {tasks.map((task: any, index: number) => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            index={index}
                            onEdit={() => onEdit(task)}
                        />
                    ))}
                </div>
            </SortableContext>
        </section>
    );
}

export default function KanbanBoard() {
    const { data: session } = useSession();
    const [tasks, setTasks] = useState<TaskProps["task"][]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [activeProject, setActiveProject] = useState<string | null>(null);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState<any>(null);
    const [newTaskStatus, setNewTaskStatus] = useState<string | null>(null);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [myTasksOnly, setMyTasksOnly] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5, // 5px drag tolerance before starting
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        if (session) {
            fetch('/api/projects')
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        setProjects(data);
                        if (data.length > 0) setActiveProject(data[0].id);
                    }
                });
        }
    }, [session]);

    const fetchTasks = () => {
        if (activeProject) {
            fetch(`/api/tasks?projectId=${activeProject}`)
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) setTasks(data.sort((a: any, b: any) => (a.order || 0) - (b.order || 0)));
                });
        }
    };

    useEffect(() => { fetchTasks(); }, [activeProject]);

    // Handle initial item drag
    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    // Handle moving items across columns instantly
    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        // active can only be a Task. over can be a Task OR a Column (droppable area).
        const isActiveTask = active.data.current?.type === "Task";
        const isOverTask = over.data.current?.type === "Task";

        if (!isActiveTask) return;

        setTasks((prev) => {
            const activeIndex = prev.findIndex((t) => t.id === activeId);
            const overIndex = prev.findIndex((t) => t.id === overId);

            if (activeIndex === -1) return prev;

            const activeTask = prev[activeIndex];

            // 1. Dropping over another task
            if (isOverTask) {
                const overTask = prev[overIndex];
                if (activeTask.status !== overTask.status) {
                    // Changing columns
                    const newTasks = [...prev];
                    newTasks[activeIndex] = { ...newTasks[activeIndex], status: overTask.status };
                    return arrayMove(newTasks, activeIndex, overIndex);
                } else {
                    // Sorting in same column
                    return arrayMove(prev, activeIndex, overIndex);
                }
            }

            // 2. Dropping over an empty column
            const isOverColumn = overId === 'TODO' || overId === 'IN_PROGRESS' || overId === 'DONE';
            if (isOverColumn) {
                const newStatus = overId as string;
                if (activeTask.status !== newStatus) {
                    const newTasks = [...prev];
                    newTasks[activeIndex] = { ...newTasks[activeIndex], status: newStatus };
                    // Move to the end of the new array
                    return arrayMove(newTasks, activeIndex, newTasks.length - 1);
                }
            }

            return prev;
        });
    };

    // Finalize drag, calculate new order, trigger API
    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) {
            fetchTasks(); // Revert on invalid drop
            return;
        }

        const activeId = active.id;
        const activeTask = tasks.find(t => t.id === activeId);
        if (!activeTask) return;

        // Calculate the new order logic based on current visually sorted array
        const destColumnTasks = tasks.filter(t => t.status === activeTask.status);
        const currentIndex = destColumnTasks.findIndex(t => t.id === activeId);

        let newOrder = 0;
        if (destColumnTasks.length === 1) {
            newOrder = 1000;
        } else if (currentIndex === 0) {
            newOrder = (destColumnTasks[1]?.order || 1000) / 2;
        } else if (currentIndex === destColumnTasks.length - 1) {
            newOrder = (destColumnTasks[currentIndex - 1]?.order || 0) + 1000;
        } else {
            const prevOrder = destColumnTasks[currentIndex - 1]?.order || 0;
            const nextOrder = destColumnTasks[currentIndex + 1]?.order || 0;
            newOrder = (prevOrder + nextOrder) / 2;
        }

        // Optimistic update
        setTasks(prev => prev.map(t => t.id === activeId ? { ...t, order: newOrder } : t));

        try {
            await fetch(`/api/tasks`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: activeId, status: activeTask.status, order: newOrder })
            });
        } catch (error) {
            console.error("Failed to persist task state", error);
            fetchTasks(); // Reload on failure
        }
    };

    const activeTask = activeId ? tasks.find(t => t.id === activeId) : null;

    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesUser = myTasksOnly ? (task.assignee as any)?.id === (session?.user as any)?.id : true;
        return matchesSearch && matchesUser;
    });

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
                                padding: '6px 32px 6px 12px', width: '100%', cursor: 'pointer', backgroundColor: 'transparent',
                                border: '1px solid transparent', appearance: 'none', fontWeight: 600, margin: 0, fontSize: '16px'
                            }}
                            value={activeProject || ''}
                            onChange={e => setActiveProject(e.target.value)}
                        >
                            <option value="" disabled>Select a project...</option>
                            {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                        </select>
                        <span className="material-symbols-outlined" style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#6B778C' }}>
                            unfold_more
                        </span>
                    </div>
                </div>
            </div>

            {/* Quick Filter Bar */}
            {activeProject && projects.length > 0 && (
                <div style={{ padding: '12px 32px', borderBottom: '1px solid var(--sys-color-outline-variant)', backgroundColor: 'var(--sys-color-surface)', display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{ position: 'relative', width: '300px' }}>
                        <span className="material-symbols-outlined" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--sys-color-on-surface-variant)', fontSize: '18px', pointerEvents: 'none' }}>
                            search
                        </span>
                        <input
                            type="text"
                            className="custom-input"
                            placeholder="Search tasks..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            style={{ paddingLeft: '38px', backgroundColor: 'var(--sys-color-surface-variant)', border: 'none', height: '36px', width: '100%', fontSize: '14px' }}
                        />
                    </div>
                    <button
                        className={`btn ${myTasksOnly ? 'filled-btn' : 'outlined-btn'}`}
                        onClick={() => setMyTasksOnly(!myTasksOnly)}
                        style={{ padding: '0 16px', height: '36px', borderRadius: '18px', fontSize: '13px', display: 'flex', alignItems: 'center' }}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: '16px', marginRight: '6px' }}>
                            person
                        </span>
                        My Tasks
                    </button>
                    {(searchTerm || myTasksOnly) && (
                        <div style={{ fontSize: '13px', color: 'var(--sys-color-on-surface-variant)', marginLeft: 'auto' }}>
                            Showing {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}
                        </div>
                    )}
                </div>
            )}

            {/* Kanban Board Area */}
            {projects.length > 0 ? (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCorners}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragEnd={handleDragEnd}
                >
                    <main className="board-container">
                        <DroppableColumn
                            id="TODO" title="Ready to begin" cssClass="column-todo"
                            tasks={filteredTasks.filter(t => t.status === 'TODO')}
                            onEdit={(task: any) => { setTaskToEdit(task); setIsTaskModalOpen(true); }}
                            onAddTask={() => { setNewTaskStatus('TODO'); setTaskToEdit(null); setIsTaskModalOpen(true); }}
                        />
                        <DroppableColumn
                            id="IN_PROGRESS" title="In Progress" cssClass="column-inprogress"
                            tasks={filteredTasks.filter(t => t.status === 'IN_PROGRESS')}
                            onEdit={(task: any) => { setTaskToEdit(task); setIsTaskModalOpen(true); }}
                            onAddTask={() => { setNewTaskStatus('IN_PROGRESS'); setTaskToEdit(null); setIsTaskModalOpen(true); }}
                        />
                        <DroppableColumn
                            id="DONE" title="Done" cssClass="column-done"
                            tasks={filteredTasks.filter(t => t.status === 'DONE')}
                            onEdit={(task: any) => { setTaskToEdit(task); setIsTaskModalOpen(true); }}
                            onAddTask={() => { setNewTaskStatus('DONE'); setTaskToEdit(null); setIsTaskModalOpen(true); }}
                        />

                        {/* Drag Overlay for smooth visual dragging detached from layout */}
                        <DragOverlay dropAnimation={{ sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.4' } } }) }}>
                            {activeId && activeTask ? (
                                <TaskCard task={activeTask} index={0} />
                            ) : null}
                        </DragOverlay>
                    </main>
                </DndContext>
            ) : (
                <main className="board-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
                    {/* Empty State omitted for brevity here, keeping previous empty state design */}
                    <div style={{ textAlign: 'center', maxWidth: '400px', padding: '40px', backgroundColor: 'var(--sys-color-surface)', borderRadius: '24px', boxShadow: 'var(--sys-elevation-2)' }}>
                        <div style={{ width: '80px', height: '80px', backgroundColor: '#F4F5F7', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '40px', color: 'var(--sys-color-primary)' }}>rule_folder</span>
                        </div>
                        <h2 className="title-large" style={{ marginBottom: '12px' }}>No Projects Found</h2>
                        <p className="body-medium text-variant" style={{ marginBottom: '32px' }}>To start managing your tasks, you first need to create a project workspace.</p>
                        <button
                            className="btn filled-btn"
                            style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 auto' }}
                            onClick={() => window.location.href = '/projects'}
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
                    onClose={() => { setIsTaskModalOpen(false); setTaskToEdit(null); setNewTaskStatus(null); }}
                    projectId={activeProject}
                    projectMembers={projects.find(p => p.id === activeProject)?.members || []}
                    onTaskSaved={fetchTasks}
                    taskToEdit={taskToEdit}
                    initialStatus={newTaskStatus || undefined}
                />
            )}
        </div>
    );
}
