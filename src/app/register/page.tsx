"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Registration failed');
            }

            // Immediately redirect to login on success
            router.push('/login?registered=true');
        } catch (err: any) {
            setError(err.message || 'An error occurred during registration');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            height: '100vh',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, var(--md-sys-color-primary-container) 0%, var(--md-sys-color-background) 100%)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Decorative background blobs (Google Colors) */}
            <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '40vw', height: '40vw', background: '#4285F4', opacity: 0.08, filter: 'blur(80px)', borderRadius: '50%' }} />
            <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '40vw', height: '40vw', background: '#EA4335', opacity: 0.08, filter: 'blur(80px)', borderRadius: '50%' }} />
            <div style={{ position: 'absolute', bottom: '-20%', left: '-10%', width: '50vw', height: '50vw', background: '#FBBC05', opacity: 0.08, filter: 'blur(100px)', borderRadius: '50%' }} />
            <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '50vw', height: '50vw', background: '#34A853', opacity: 0.08, filter: 'blur(100px)', borderRadius: '50%' }} />

            <div className="modal-surface" style={{ width: '100%', maxWidth: '420px', padding: 0, transform: 'none', position: 'relative', zIndex: 1, boxShadow: '0 24px 64px rgba(0,0,0,0.1)', border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'var(--md-sys-color-surface)' }}>
                {/* Google 4-color strip */}
                <div style={{ display: 'flex', height: '6px', width: '100%' }}>
                    <div style={{ flex: 1, backgroundColor: '#4285F4' }} />
                    <div style={{ flex: 1, backgroundColor: '#EA4335' }} />
                    <div style={{ flex: 1, backgroundColor: '#FBBC05' }} />
                    <div style={{ flex: 1, backgroundColor: '#34A853' }} />
                </div>

                <div style={{ padding: '48px 32px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', backgroundColor: 'var(--md-sys-color-primary-container)', color: 'var(--md-sys-color-on-primary-container)', borderRadius: '16px', marginBottom: '24px' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '32px', color: '#34A853' }}>person_add</span>
                        </div>
                        <h1 className="title-large" style={{ color: 'var(--md-sys-color-on-surface)', fontWeight: 600, fontSize: '28px', marginBottom: '8px' }}>
                            Create Account
                        </h1>
                        <p className="body-medium text-variant">Join Kanban2.0 to manage your projects</p>
                    </div>

                    <form onSubmit={handleSubmit} className="modal-form">
                        {error && (
                            <div style={{ padding: '12px', marginBottom: '16px', backgroundColor: 'var(--md-sys-color-error-container)', color: 'var(--md-sys-color-on-error-container)', borderRadius: '8px', fontSize: '14px' }}>
                                {error}
                            </div>
                        )}

                        <label className="body-medium">Full Name</label>
                        <input
                            type="text"
                            className="custom-input"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />

                        <label className="body-medium" style={{ marginTop: '16px' }}>Email address</label>
                        <input
                            type="email"
                            className="custom-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <label className="body-medium" style={{ marginTop: '16px' }}>Password</label>
                        <input
                            type="password"
                            className="custom-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                        />

                        <button
                            type="submit"
                            style={{ marginTop: '32px', width: '100%', padding: '12px', backgroundColor: '#34A853', color: '#ffffff', border: 'none', borderRadius: '24px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', transition: 'background-color 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            disabled={isLoading}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#29803d'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#34A853'}
                        >
                            {isLoading ? 'Creating Account...' : 'Register'}
                        </button>
                    </form>

                    <div style={{ marginTop: '24px', textAlign: 'center' }}>
                        <Link href="/login" className="body-medium" style={{ color: '#4285F4', textDecoration: 'none', fontWeight: 500 }}>
                            Already have an account? Sign in
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
