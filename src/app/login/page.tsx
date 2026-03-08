"use client";

import { signIn } from "next-auth/react";
import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginContent() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (searchParams.get('registered') === 'true') {
            setSuccessMessage('Account created successfully! Please sign in.');
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const res = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (res?.error) {
                setError(res.error === "CredentialsSignin" ? 'Invalid credentials' : res.error);
            } else {
                router.push('/');
                router.refresh();
            }
        } catch (err) {
            setError('An error occurred during login');
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
                            <span className="material-symbols-outlined" style={{ fontSize: '30px', color: '#D3202A' }}>dashboard</span>
                        </div>

                        <h1 style={{
                            margin: '0 0 8px 0',
                            fontSize: '26px',
                            fontWeight: 700,
                            color: '#172B4D',
                            letterSpacing: '-0.02em',
                            fontFamily: 'inherit'
                        }}>
                            Kanban<span style={{ color: '#D3202A' }}>2.0</span>
                        </h1>
                        <p style={{ margin: 0, fontSize: '14px', color: '#6B778C' }}>Sign in to continue to your workspace</p>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                        {successMessage && (
                            <div style={{ padding: '12px 14px', marginBottom: '20px', backgroundColor: '#E3FCEF', color: '#006644', borderRadius: '6px', fontSize: '14px', border: '1px solid #ABF5D1' }}>
                                {successMessage}
                            </div>
                        )}
                        {error && (
                            <div style={{ padding: '12px 14px', marginBottom: '20px', backgroundColor: '#FFEBE6', color: '#BF2600', borderRadius: '6px', fontSize: '14px', border: '1px solid #FFBDAD' }}>
                                {error}
                            </div>
                        )}

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
                            {isLoading ? 'Signing In...' : 'Sign In'}
                        </button>
                    </form>

                    <div style={{ marginTop: '24px', textAlign: 'center' }}>
                        <Link href="/register" style={{ color: '#D3202A', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>
                            Don't have an account? Register here
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <LoginContent />
        </Suspense>
    );
}
