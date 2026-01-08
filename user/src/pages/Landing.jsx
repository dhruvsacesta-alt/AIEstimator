import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui';
import {
    Zap, BarChart3, Shield,
    ArrowRight, Clock, Star
} from 'lucide-react';

const Landing = () => {
    const navigate = useNavigate();

    return (
        <div>
            {/* Hero Section */}
            <section style={{
                padding: '4rem 1rem',
                textAlign: 'center',
                minHeight: '80vh',
                display: 'flex',
                alignItems: 'center',
                background: 'radial-gradient(50% 50% at 50% 50%, rgba(29, 78, 216, 0.03) 0%, rgba(255, 255, 255, 0) 100%)'
            }}>
                <div className="container">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: '#eff6ff',
                            padding: '8px 16px',
                            borderRadius: '100px',
                            color: '#1d4ed8',
                            fontSize: '0.875rem',
                            fontWeight: '700',
                            marginBottom: '2rem'
                        }}>
                            <Zap size={14} fill="currentColor" /> AI-Powered Moving Estimates
                        </div>

                        <h1 style={{ fontSize: 'clamp(2rem, 8vw, 4rem)', fontWeight: '800', lineHeight: 1.1, marginBottom: '1.5rem', color: '#0f172a' }}>
                            Get Accurate Moving <br />
                            <span style={{ color: '#1d4ed8' }}>Estimates with AI</span>
                        </h1>

                        <p style={{ fontSize: 'clamp(1rem, 4vw, 1.25rem)', color: '#64748b', maxWidth: '650px', margin: '0 auto 2.5rem', lineHeight: 1.6 }}>
                            Upload photos of your belongings and let our AI calculate a precise moving cost estimate. Fast, accurate, and hassle-free.
                        </p>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Button size="lg" onClick={() => navigate('/assessment')} style={{ paddingLeft: '2rem', paddingRight: '2rem' }}>
                                Start Estimation <ArrowRight size={18} style={{ marginLeft: '8px' }} />
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features (White Cards with Blue Icons as in screenshot) */}
            <section style={{ padding: '4rem 0' }}>
                <div className="container grid grid-cols-3 lg:grid-cols-2 md:grid-cols-1" style={{ gap: '2rem' }}>
                    {[
                        {
                            icon: <Zap size={24} />,
                            title: 'AI-Powered',
                            desc: 'Smart item detection from photos for precise inventory mapping.'
                        },
                        {
                            icon: <Clock size={24} />,
                            title: 'Quick Estimates',
                            desc: 'Get quotes in minutes, not days. Reduced waiting time for your move.'
                        },
                        {
                            icon: <Shield size={24} />,
                            title: 'Trusted',
                            desc: 'Verified moving partners ensuring safety for your precious belongings.'
                        }
                    ].map((f, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ y: -5 }}
                            style={{
                                padding: '2.5rem 2rem',
                                background: '#ffffff',
                                borderRadius: '20px',
                                border: '1px solid #e2e8f0',
                                textAlign: 'center',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)'
                            }}
                        >
                            <div style={{
                                background: '#eff6ff',
                                width: '56px',
                                height: '56px',
                                borderRadius: '16px',
                                display: 'grid',
                                placeItems: 'center',
                                color: '#1d4ed8',
                                margin: '0 auto 1.5rem'
                            }}>
                                {f.icon}
                            </div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.75rem', color: '#1e293b' }}>{f.title}</h3>
                            <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.6 }}>{f.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Content Band */}
            <section style={{ padding: '6rem 0', background: '#f8fafc' }}>
                <div className="container grid grid-cols-2 md:grid-cols-1" style={{ gap: '4rem', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: '800', lineHeight: 1.2, marginBottom: '1.5rem', color: '#1e293b' }}>
                            Modern Logistics for <br />the Modern Home
                        </h2>
                        <p style={{ color: '#64748b', fontSize: '1.1rem', lineHeight: 1.7, marginBottom: '2rem' }}>
                            Traditional moving quotes are tedious and inaccurate. Our AI vision engine analyzes every detail of your space to provide a fair, transparent price without the need for an in-house visit.
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {[
                                'Real-time item recognition',
                                'Volume-based precise pricing',
                                'Secure end-to-end data handling',
                                'Professional support integration'
                            ].map((item, idx) => (
                                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#475569', fontWeight: '600' }}>
                                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#dcfce7', display: 'grid', placeItems: 'center', color: '#16a34a' }}>
                                        <ArrowRight size={12} />
                                    </div>
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div style={{ background: 'white', borderRadius: '32px', height: '400px', border: '8px solid #f1f5f9', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', display: 'grid', placeItems: 'center', color: '#cbd5e1' }}>
                        <div style={{ textAlign: 'center' }}>
                            <BarChart3 size={80} />
                            <p style={{ marginTop: '1rem', fontWeight: '600' }}>AI Analysis Preview</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Landing;
