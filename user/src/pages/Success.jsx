import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight, Clock, ShieldCheck } from 'lucide-react';
import { Button, Card } from '../components/ui';
import { useNavigate } from 'react-router-dom';

const Success = () => {
    const navigate = useNavigate();

    return (
        <div className="container" style={{ maxWidth: '650px', padding: 'clamp(4rem, 15vh, 7rem) 1.5rem', textAlign: 'center' }}>
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4 }}
            >
                <div style={{ background: '#ecfdf5', width: 'clamp(70px, 15vw, 90px)', height: 'clamp(70px, 15vw, 90px)', borderRadius: '50%', display: 'grid', placeItems: 'center', color: '#10b981', margin: '0 auto 2rem', border: '1px solid #d1fae5' }}>
                    <CheckCircle2 size={40} />
                </div>

                <h1 style={{ fontSize: 'clamp(2rem, 8vw, 3rem)', fontWeight: '800', marginBottom: '1.5rem', color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                    Assessment Submitted
                </h1>

                <p style={{ color: '#64748b', fontSize: 'clamp(1rem, 3vw, 1.2rem)', lineHeight: '1.6', marginBottom: '3.5rem', maxWidth: '500px', margin: '0 auto 3.5rem' }}>
                    Thank you! Our AI is currently analyzing your media to catalog your inventory.
                    <span style={{ color: '#1d4ed8', fontWeight: '700', display: 'block', marginTop: '1rem' }}>Your moving estimate will be sent to you shortly.</span>
                </p>

                <div className="grid grid-cols-2 md:grid-cols-1" style={{ gap: '1rem', marginBottom: '3rem' }}>
                    <Card style={{ padding: '1.5rem', textAlign: 'left', border: '1px solid #e2e8f0', background: '#ffffff' }}>
                        <div style={{ background: '#eff6ff', width: '40px', height: '40px', borderRadius: '10px', display: 'grid', placeItems: 'center', color: '#1d4ed8', marginBottom: '1.25rem' }}>
                            <Clock size={22} />
                        </div>
                        <h4 style={{ fontWeight: '700', color: '#1e293b', marginBottom: '0.5rem' }}>Review Period</h4>
                        <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: '1.5' }}>A moving specialist will verify the AI analysis within 2-4 business hours.</p>
                    </Card>
                    <Card style={{ padding: '1.5rem', textAlign: 'left', border: '1px solid #e2e8f0', background: '#ffffff' }}>
                        <div style={{ background: '#f0fdf4', width: '40px', height: '40px', borderRadius: '10px', display: 'grid', placeItems: 'center', color: '#10b981', marginBottom: '1.25rem' }}>
                            <ShieldCheck size={22} />
                        </div>
                        <h4 style={{ fontWeight: '700', color: '#1e293b', marginBottom: '0.5rem' }}>Price Security</h4>
                        <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: '1.5' }}>Once confirmed by our team, your quote is valid for 7 days for easy booking.</p>
                    </Card>
                </div>

                <Button onClick={() => navigate('/')} variant="outline" size="lg" style={{ width: '100%', maxWidth: '300px' }}>
                    Return to Homepage <ArrowRight size={18} style={{ marginLeft: '8px' }} />
                </Button>
            </motion.div>
        </div>
    );
};

export default Success;
