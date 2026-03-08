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
        <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                {projects.map(project => {
                    // Check if the current user is a Global Admin OR a Project-Level Admin
                    const isProjectAdmin = role === 'ADMIN' || project.members?.some((m: any) => m.userId === session?.user?.id && m.role === 'ADMIN');

                    return (
                        <div key={project.id} className="card elevated" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div className="card-state-layer"></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <h2 className="title-medium">{project.title}</h2>
                                {isProjectAdmin && (
                                    <button className="icon-btn small" onClick={() => handleEditProject(project)} title="Edit Project" style={{ marginTop: '-4px', marginRight: '-4px' }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
                                    </button>
                                )}
                            </div>
                            <p className="body-medium text-variant">{project.description || "No description provided."}</p>
                            <div style={{ marginTop: 'auto', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span className="body-small text-variant">Members: {project.members?.length || 0}</span>
                                {isProjectAdmin && (
                                    <button className="btn text-btn" onClick={() => handleManageMembers(project)}>
                                        Manage Members
                                    </button>
                                )}
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
        </div>
    );
}
