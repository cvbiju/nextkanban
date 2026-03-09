"use client";
import React, { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import ProjectModal from '../../components/ProjectModal';
import ProjectMembersModal from '../../components/ProjectMembersModal';

export default function ProjectsPage() {
    const { data: session } = useSession();
    const [projects, setProjects] = useState<any[]>([]);
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const [projectToEdit, setProjectToEdit] = useState<any>(null);

    // Project Members State
    const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<any>(null);

    const role = (session?.user as any)?.role;

    const fetchProjects = () => {
        fetch('/api/projects')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setProjects(data);
            });
    };

    useEffect(() => {
        if (session) fetchProjects();
    }, [session]);

    const handleManageMembers = (project: any) => {
        setSelectedProject(project);
        setIsMembersModalOpen(true);
    };

    const handleEditProject = (project: any) => {
        setProjectToEdit(project);
        setIsProjectModalOpen(true);
    };

    if (!session) {
        return (
            <main className="board-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--md-sys-color-error)', marginBottom: '16px' }}>lock</span>
                    <h2 className="title-large text-variant">Authentication Required</h2>
                    <p className="body-medium text-variant" style={{ marginTop: '8px' }}>Please log in to view your projects.</p>
                </div>
            </main>
        );
    }

    return (
        <main style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 className="title-large" style={{ fontSize: '28px', color: 'var(--sys-color-on-background)' }}>Project Workspaces</h1>
                    <p className="body-medium text-variant">Organize your tasks and collaborate with your team</p>
                </div>
                <button
                    className="btn filled-btn"
                    onClick={() => { setProjectToEdit(null); setIsProjectModalOpen(true); }}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', flexShrink: 0, whiteSpace: 'nowrap' }}
                >
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>add</span>
                    New Project
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '32px' }}>
                {projects.map(project => {
                    const isProjectAdmin = role === 'ADMIN' || project.members?.some((m: any) => m.userId === session?.user?.id && m.role === 'ADMIN');

                    return (
                        <div key={project.id} className="card" style={{
                            padding: '0',
                            display: 'flex',
                            flexDirection: 'column',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            border: '1px solid var(--sys-color-outline-variant)',
                            overflow: 'hidden',
                            position: 'relative',
                            backgroundColor: 'white'
                        }}
                            onMouseOver={e => {
                                e.currentTarget.style.transform = 'translateY(-8px)';
                                e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)';
                            }}
                            onMouseOut={e => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}>
                            {/* Card Header with background accent */}
                            <div style={{
                                height: '80px',
                                background: 'linear-gradient(135deg, #DFE1E6 0%, #FFFFFF 100%)',
                                padding: '20px 24px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start'
                            }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    backgroundColor: 'white',
                                    borderRadius: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                }}>
                                    <span className="material-symbols-outlined" style={{ color: 'var(--sys-color-primary)', fontSize: '24px' }}>folder_open</span>
                                </div>
                                {isProjectAdmin && (
                                    <button className="icon-btn" onClick={() => handleEditProject(project)} title="Edit Project" style={{ backgroundColor: 'white' }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>settings</span>
                                    </button>
                                )}
                            </div>

                            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--sys-color-on-surface)', margin: 0 }}>{project.title}</h2>
                                <p style={{
                                    fontSize: '14px',
                                    color: 'var(--sys-color-on-surface-variant)',
                                    margin: 0,
                                    lineHeight: '1.6',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                    minHeight: '44px'
                                }}>
                                    {project.description || "No description provided."}
                                </p>

                                <div style={{
                                    marginTop: '12px',
                                    paddingTop: '20px',
                                    borderTop: '1px solid var(--sys-color-outline-variant)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            {project.members?.slice(0, 3).map((member: any, i: number) => (
                                                <img
                                                    key={member.id}
                                                    src={member.user?.image || `https://ui-avatars.com/api/?name=${member.user?.name || 'User'}&background=random`}
                                                    alt="Member"
                                                    style={{
                                                        width: '28px',
                                                        height: '28px',
                                                        borderRadius: '50%',
                                                        border: '2px solid white',
                                                        marginLeft: i === 0 ? 0 : '-8px',
                                                        zIndex: 3 - i
                                                    }}
                                                />
                                            ))}
                                            {project.members?.length > 3 && (
                                                <div style={{
                                                    width: '28px',
                                                    height: '28px',
                                                    borderRadius: '50%',
                                                    backgroundColor: '#F4F5F7',
                                                    border: '2px solid white',
                                                    marginLeft: '-8px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '10px',
                                                    fontWeight: '700',
                                                    color: '#6B778C',
                                                    zIndex: 0
                                                }}>
                                                    +{project.members.length - 3}
                                                </div>
                                            )}
                                        </div>
                                        <span style={{ fontSize: '13px', fontWeight: '500', color: '#6B778C' }}>
                                            {project.members?.length || 0} Member{(project.members?.length !== 1) ? 's' : ''}
                                        </span>
                                    </div>
                                    {isProjectAdmin && (
                                        <button className="btn text-btn" onClick={() => handleManageMembers(project)} style={{ fontSize: '13px', padding: '6px 12px' }}>
                                            Manage Team
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <button className="fab" aria-label="Add new project" onClick={() => { setProjectToEdit(null); setIsProjectModalOpen(true); }}>
                <span className="material-symbols-outlined">add</span>
            </button>

            <ProjectModal
                isOpen={isProjectModalOpen}
                onClose={() => setIsProjectModalOpen(false)}
                onProjectSaved={fetchProjects}
                projectToEdit={projectToEdit}
            />

            {selectedProject && (
                <ProjectMembersModal
                    isOpen={isMembersModalOpen}
                    onClose={() => setIsMembersModalOpen(false)}
                    projectId={selectedProject.id}
                    projectName={selectedProject.title}
                    existingMembers={selectedProject.members || []}
                    onMembersUpdated={fetchProjects}
                />
            )}
        </main>
    );
}
