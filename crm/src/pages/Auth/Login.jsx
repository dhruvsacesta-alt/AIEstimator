import React, { useState } from 'react';
import { Button, Input } from '../../components/ui';
import { Truck, ArrowRight, ShieldCheck, Mail, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../../utils/api';

const Login = ({ onLogin }) => {
    const [email, setEmail] = useState('admin@aiestimator.com');
    const [password, setPassword] = useState('admin123');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const data = await loginUser(email, password);
            onLogin(data.user.role, data.token, data.user);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const quickRole = (e, targetEmail) => {
        e.preventDefault();
        setEmail(targetEmail);
        setPassword('admin123');
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', background: '#f8fafc' }}>
            {/* Left Brand Section */}
            <div style={{ flex: 1.2, background: '#0f172a', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '5rem', color: 'white' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4rem' }}>
                    <div style={{ background: '#10b981', padding: '8px', borderRadius: '12px' }}>
                        <Truck size={32} color="white" />
                    </div>
                    <span style={{ fontSize: '1.75rem', fontWeight: '800' }}>AI Estimator</span>
                </div>

                <h1 style={{ fontSize: '3.5rem', fontWeight: '800', lineHeight: 1.1, marginBottom: '2rem' }}>
                    Manage Your Move <br />
                    <span style={{ color: '#1d4ed8' }}>With Precision.</span>
                </h1>

                <p style={{ fontSize: '1.25rem', color: '#94a3b8', maxWidth: '480px', lineHeight: 1.6 }}>
                    Join 500+ moving companies using our AI-driven insights to streamine lead management and increase conversion.
                </p>

                <div style={{ marginTop: '5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
                    <div>
                        <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#1d4ed8' }}>0.5s</div>
                        <div style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '4px' }}>AI Latency</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#1d4ed8' }}>35%</div>
                        <div style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '4px' }}>Cost Reduced</div>
                    </div>
                </div>
            </div>

            {/* Right Form Section */}
            <div style={{ flex: 1, display: 'grid', placeItems: 'center', padding: '2rem' }}>
                <div style={{ width: '100%', maxWidth: '400px' }}>
                    <div style={{ marginBottom: '3rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1d4ed8', fontWeight: '700', marginBottom: '12px' }}>
                            <ShieldCheck size={18} /> Internal Security
                        </div>
                        <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a' }}>Welcome Back</h2>
                        <p style={{ color: '#64748b', marginTop: '4px' }}>Please login with your company credentials.</p>
                    </div>

                    <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {error && (
                            <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '14px', borderRadius: '10px', fontSize: '0.875rem', fontWeight: '600', border: '1px solid #fecaca' }}>
                                {error}
                            </div>
                        )}

                        <Input
                            label="Corporate Email"
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="name@company.com"
                            required
                        />

                        <Input
                            label="Private Password"
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />

                        <Button type="submit" disabled={loading} size="lg" style={{ marginTop: '0.5rem' }}>
                            {loading ? 'Authenticating...' : 'Explore Dashboard'} <ArrowRight size={18} style={{ marginLeft: '8px' }} />
                        </Button>
                    </form>

                    <div style={{ marginTop: '4rem', padding: '2rem', background: '#eff6ff', borderRadius: '20px', border: '1px solid #dbeafe' }}>
                        <p style={{ fontSize: '0.875rem', color: '#1d4ed8', fontWeight: '700', marginBottom: '1rem', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Demo Access Portal</p>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <Button variant="secondary" size="sm" onClick={(e) => quickRole(e, 'admin@aiestimator.com')} style={{ flex: 1, background: 'white' }}>Admin</Button>
                            <Button variant="secondary" size="sm" onClick={(e) => quickRole(e, 'sales@aiestimator.com')} style={{ flex: 1, background: 'white' }}>Sales</Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
