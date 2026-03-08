"use client";
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return createPortal(
        <div className={`modal-backdrop ${isOpen ? '' : 'hidden'}`} onClick={onClose}>
            <div className="modal-surface" onClick={e => e.stopPropagation()}>
                <h2 className="title-large" style={{ marginBottom: '16px' }}>{title}</h2>
                {children}
            </div>
        </div>,
        document.body
    );
}
