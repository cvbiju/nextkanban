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
            background: 'linear-gradient(135deg, #fdf2f2 0%, #f4f5f7 50%, #eef2f8 100%)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Insight-themed decorative blobs */}
            <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '40vw', height: '40vw', background: '#D3202A', opacity: 0.06, filter: 'blur(80px)', borderRadius: '50%', zIndex: 0 }} />
            <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '40vw', height: '40vw', background: '#005E85', opacity: 0.06, filter: 'blur(80px)', borderRadius: '50%', zIndex: 0 }} />
            <div style={{ position: 'absolute', bottom: '-20%', left: '-10%', width: '50vw', height: '50vw', background: '#172B4D', opacity: 0.04, filter: 'blur(100px)', borderRadius: '50%', zIndex: 0 }} />
            <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '50vw', height: '50vw', background: '#D3202A', opacity: 0.04, filter: 'blur(100px)', borderRadius: '50%', zIndex: 0 }} />

            <div style={{
                width: '100%',
                maxWidth: '420px',
                position: 'relative',
                zIndex: 1,
                boxShadow: '0 20px 60px rgba(9,30,66,0.15)',
                border: '1px solid rgba(255,255,255,0.6)',
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                overflow: 'hidden'
            }}>
                {/* Insight Red accent bar */}
                <div style={{ height: '5px', width: '100%', backgroundColor: '#D3202A' }} />

                <div style={{ padding: '48px 36px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '36px' }}>
                        {/* Logo icon */}
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '60px',
                            height: '60px',
                            backgroundColor: '#FEF2F2',
                            borderRadius: '12px',
                            marginBottom: '20px'
                        }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '30px', color: '#D3202A' }}>person_add</span>
                        </div>

                        <h1 style={{
                            margin: '0 0 8px 0',
                            fontSize: '26px',
                            fontWeight: 700,
                            color: '#172B4D',
                            letterSpacing: '-0.02em',
                            fontFamily: 'inherit'
                        }}>
                            Create Account
                        </h1>
                        <p style={{ margin: 0, fontSize: '14px', color: '#6B778C' }}>Join Kanban2.0 to manage your projects</p>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                        {error && (
                            <div style={{ padding: '12px 14px', marginBottom: '20px', backgroundColor: '#FFEBE6', color: '#BF2600', borderRadius: '6px', fontSize: '14px', border: '1px solid #FFBDAD' }}>
                                {error}
                            </div>
                        )}

                        <label style={{ fontSize: '13px', fontWeight: 600, color: '#172B4D', marginBottom: '6px' }}>Full Name</label>
                        <input
                            type="text"
                            className="custom-input"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            style={{ marginBottom: '18px' }}
                        />

                        <label style={{ fontSize: '13px', fontWeight: 600, color: '#172B4D', marginBottom: '6px' }}>Email address</label>
                        <input
                            type="email"
                            className="custom-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{ marginBottom: '18px' }}
                        />

                        <label style={{ fontSize: '13px', fontWeight: 600, color: '#172B4D', marginBottom: '6px' }}>Password</label>
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
                            style={{
                                marginTop: '28px',
                                width: '100%',
                                padding: '13px',
                                backgroundColor: '#D3202A',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '14px',
                                fontWeight: 600,
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                opacity: isLoading ? 0.75 : 1,
                                transition: 'background-color 0.15s, opacity 0.15s',
                                letterSpacing: '0.01em'
                            }}
                            disabled={isLoading}
                            onMouseOver={(e) => { if (!isLoading) e.currentTarget.style.backgroundColor = '#B51C24'; }}
                            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#D3202A'; }}
                        >
                            {isLoading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>

                    <div style={{ marginTop: '24px', textAlign: 'center' }}>
                        <Link href="/login" style={{ color: '#D3202A', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>
                            Already have an account? Sign in
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
