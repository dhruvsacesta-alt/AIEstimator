import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Card } from '../../components/ui';
import {
    Upload, ChevronRight, ChevronLeft,
    Check, X, Home, Briefcase,
    Building2, ClipboardCheck, ArrowRight, ShieldCheck
} from 'lucide-react';
import { submitAssessment } from '../../utils/api';

const AssessmentForm = () => {
    const [step, setStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        // Step 1: Basic Details
        firstName: '', lastName: '', email: '', phone: '', moveType: 'Residential', moveDate: '',
        originAddress: '', originPincode: '',
        destinationAddress: '', destinationPincode: '',
        consent: false,
        // (Property details kept as internal context for better estimation, but moved to Step 1 per spec "fills basic details")
        propertyType: 'Apartment', pickupFloor: '0', dropFloor: '0',
        pickupLift: 'No', dropLift: 'No',
        // Step 2: Media
        media: []
    });
    const navigate = useNavigate();

    const next = () => setStep(s => s + 1);
    const back = () => setStep(s => s - 1);

    const validateStep1 = () => {
        const newErrors = {};
        const phoneRegex = /^[6-9]\d{9}$/; // Indian mobile number validation
        const pincodeRegex = /^[1-9][0-9]{5}$/; // Indian 6-digit pincode
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';

        if (!formData.phone) {
            newErrors.phone = 'Phone number is required';
        } else if (!phoneRegex.test(formData.phone)) {
            newErrors.phone = 'Please enter a valid 10-digit mobile number';
        }

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!formData.moveDate) {
            newErrors.moveDate = 'Move date is required';
        } else {
            const selectedDate = new Date(formData.moveDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Reset time for accurate comparison
            if (selectedDate < today) {
                newErrors.moveDate = 'Move date cannot be in the past';
            }
        }

        if (!formData.originAddress.trim()) newErrors.originAddress = 'Origin address is required';
        if (!formData.originPincode) {
            newErrors.originPincode = 'Pincode is required';
        } else if (!pincodeRegex.test(formData.originPincode)) {
            newErrors.originPincode = 'Enter valid 6-digit pincode';
        }

        if (!formData.destinationAddress.trim()) newErrors.destinationAddress = 'Destination address is required';
        if (!formData.destinationPincode) {
            newErrors.destinationPincode = 'Pincode is required';
        } else if (!pincodeRegex.test(formData.destinationPincode)) {
            newErrors.destinationPincode = 'Enter valid 6-digit pincode';
        }

        if (parseInt(formData.pickupFloor) < 0) newErrors.pickupFloor = 'Floor cannot be negative';
        if (parseInt(formData.dropFloor) < 0) newErrors.dropFloor = 'Floor cannot be negative';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (step === 1) {
            if (validateStep1()) next();
            return;
        }

        setSubmitting(true);
        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if (key !== 'media') data.append(key, formData[key]);
            });
            formData.media.forEach(file => data.append('media', file));

            await submitAssessment(data);
            setSubmitting(false);
            navigate('/success');
        } catch (error) {
            console.error(error);
            alert('Failed to submit. Please check your network.');
            setSubmitting(false);
        }
    };

    const handleFile = (e) => {
        const files = Array.from(e.target.files);
        setFormData(p => ({ ...p, media: [...p.media, ...files] }));
    };

    const removeFile = (idx) => {
        setFormData(p => ({ ...p, media: p.media.filter((_, i) => i !== idx) }));
    };

    return (
        <div className="container" style={{ maxWidth: '800px', padding: '2rem 1rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: 'clamp(1.5rem, 6vw, 2.5rem)', fontWeight: '800', marginBottom: '1rem', color: '#0f172a' }}>AI Moving Estimator</h1>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                    {[1, 2, 3].map(i => (
                        <div key={i} style={{
                            width: 'clamp(60px, 20vw, 100px)', height: '6px', borderRadius: '3px',
                            background: step >= i ? '#1d4ed8' : '#e2e8f0',
                            transition: 'all 0.3s'
                        }} />
                    ))}
                </div>
                <div style={{ color: '#64748b', fontWeight: '700', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Step {step}: {
                        step === 1 ? 'Move Details' :
                            step === 2 ? 'Media Upload' : 'AI Analysis'
                    }
                </div>
            </div>

            <Card style={{ padding: 'clamp(1.5rem, 5vw, 2.5rem)' }}>
                <form onSubmit={handleSubmit}>
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                                {/* Section 1: Customer */}
                                <div>
                                    <h3 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '1.25rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <ShieldCheck size={18} color="#1d4ed8" /> Basic Customer Details
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-1" style={{ gap: '1.5rem', marginBottom: '1.5rem' }}>
                                        <div>
                                            <Input label="First Name" placeholder="John" value={formData.firstName} onChange={e => { setFormData({ ...formData, firstName: e.target.value }); if (errors.firstName) setErrors({ ...errors, firstName: '' }); }} />
                                            {errors.firstName && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{errors.firstName}</span>}
                                        </div>
                                        <div>
                                            <Input label="Last Name" placeholder="Doe" value={formData.lastName} onChange={e => { setFormData({ ...formData, lastName: e.target.value }); if (errors.lastName) setErrors({ ...errors, lastName: '' }); }} />
                                            {errors.lastName && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{errors.lastName}</span>}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-1" style={{ gap: '1.5rem' }}>
                                        <div>
                                            <Input label="Mobile Number" type="tel" placeholder="9988776655" maxLength="10" value={formData.phone} onChange={e => { const val = e.target.value.replace(/\D/g, ''); setFormData({ ...formData, phone: val }); if (errors.phone) setErrors({ ...errors, phone: '' }); }} />
                                            {errors.phone && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{errors.phone}</span>}
                                        </div>
                                        <div>
                                            <Input label="Email Address" type="email" placeholder="john@example.com" value={formData.email} onChange={e => { setFormData({ ...formData, email: e.target.value }); if (errors.email) setErrors({ ...errors, email: '' }); }} />
                                            {errors.email && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{errors.email}</span>}
                                        </div>
                                    </div>
                                </div>

                                {/* Section 2: Move Info */}
                                <div>
                                    <h3 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '1.25rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <TruckIcon size={18} color="#1d4ed8" /> Move Information
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-1" style={{ gap: '1.5rem', marginBottom: '1.5rem' }}>
                                        <div>
                                            <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '8px' }}>Move Type</label>
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                {['Residential', 'Commercial'].map(type => (
                                                    <div key={type} onClick={() => setFormData({ ...formData, moveType: type })} style={{ flex: 1, padding: '12px', borderRadius: '10px', fontSize: '0.85rem', textAlign: 'center', cursor: 'pointer', border: `1px solid ${formData.moveType === type ? '#1d4ed8' : '#e2e8f0'}`, background: formData.moveType === type ? '#eff6ff' : 'white', fontWeight: '700', color: formData.moveType === type ? '#1d4ed8' : '#64748b' }}>
                                                        {type}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '8px' }}>Property Type</label>
                                            <select
                                                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', fontWeight: '600', color: '#1e293b', outline: 'none' }}
                                                value={formData.propertyType}
                                                onChange={e => setFormData({ ...formData, propertyType: e.target.value })}
                                            >
                                                <option value="Apartment">Apartment</option>
                                                <option value="Independent House">Independent House</option>
                                                <option value="Office">Office</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 lg:grid-cols-1" style={{ gap: '1.5rem', marginBottom: '1.5rem' }}>
                                        <div className="grid grid-cols-2" style={{ gap: '10px' }}>
                                            <div>
                                                <Input label="Pickup Floor" type="number" min="0" value={formData.pickupFloor} onChange={e => { setFormData({ ...formData, pickupFloor: e.target.value }); if (errors.pickupFloor) setErrors({ ...errors, pickupFloor: '' }); }} />
                                                {errors.pickupFloor && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{errors.pickupFloor}</span>}
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '8px' }}>Lift?</label>
                                                <select
                                                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', fontWeight: '600', color: '#1e293b', outline: 'none' }}
                                                    value={formData.pickupLift}
                                                    onChange={e => setFormData({ ...formData, pickupLift: e.target.value })}
                                                >
                                                    <option value="Yes">Yes</option>
                                                    <option value="No">No</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2" style={{ gap: '10px' }}>
                                            <div>
                                                <Input label="Drop Floor" type="number" min="0" value={formData.dropFloor} onChange={e => { setFormData({ ...formData, dropFloor: e.target.value }); if (errors.dropFloor) setErrors({ ...errors, dropFloor: '' }); }} />
                                                {errors.dropFloor && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{errors.dropFloor}</span>}
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '8px' }}>Lift?</label>
                                                <select
                                                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', fontWeight: '600', color: '#1e293b', outline: 'none' }}
                                                    value={formData.dropLift}
                                                    onChange={e => setFormData({ ...formData, dropLift: e.target.value })}
                                                >
                                                    <option value="Yes">Yes</option>
                                                    <option value="No">No</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <Input
                                            label="Moving Date"
                                            type="date"
                                            min={new Date().toISOString().split('T')[0]}
                                            value={formData.moveDate}
                                            onChange={e => { setFormData({ ...formData, moveDate: e.target.value }); if (errors.moveDate) setErrors({ ...errors, moveDate: '' }); }}
                                        />
                                        {errors.moveDate && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{errors.moveDate}</span>}
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-1" style={{ gap: '1.5rem', marginBottom: '1.5rem' }}>
                                        <div className="grid grid-cols-2" style={{ gap: '10px' }}>
                                            <div>
                                                <Input label="From Address" placeholder="Detailed Address" value={formData.originAddress} onChange={e => { setFormData({ ...formData, originAddress: e.target.value }); if (errors.originAddress) setErrors({ ...errors, originAddress: '' }); }} />
                                                {errors.originAddress && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{errors.originAddress}</span>}
                                            </div>
                                            <div>
                                                <Input label="Pincode" placeholder="Pincode" maxLength="6" value={formData.originPincode} onChange={e => { const val = e.target.value.replace(/\D/g, ''); setFormData({ ...formData, originPincode: val }); if (errors.originPincode) setErrors({ ...errors, originPincode: '' }); }} />
                                                {errors.originPincode && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{errors.originPincode}</span>}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2" style={{ gap: '10px' }}>
                                            <div>
                                                <Input label="To Address" placeholder="Detailed Address" value={formData.destinationAddress} onChange={e => { setFormData({ ...formData, destinationAddress: e.target.value }); if (errors.destinationAddress) setErrors({ ...errors, destinationAddress: '' }); }} />
                                                {errors.destinationAddress && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{errors.destinationAddress}</span>}
                                            </div>
                                            <div>
                                                <Input label="Pincode" placeholder="Pincode" maxLength="6" value={formData.destinationPincode} onChange={e => { const val = e.target.value.replace(/\D/g, ''); setFormData({ ...formData, destinationPincode: val }); if (errors.destinationPincode) setErrors({ ...errors, destinationPincode: '' }); }} />
                                                {errors.destinationPincode && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{errors.destinationPincode}</span>}
                                            </div>
                                        </div>
                                    </div>

                                </div>

                                <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
                                        <input type="checkbox" required checked={formData.consent} onChange={e => setFormData({ ...formData, consent: e.target.checked })} style={{ marginTop: '4px', width: '20px', height: '20px' }} />
                                        <span style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.5, fontWeight: '500' }}>
                                            I agree to the Terms & Privacy Policy and consent to being contacted by AI Estimator for a moving quotation.
                                        </span>
                                    </label>
                                </div>

                                <Button type="submit" disabled={!formData.consent} size="lg">
                                    Continue to Media Upload <ArrowRight size={18} />
                                </Button>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div onClick={() => document.getElementById('media-inp').click()} style={{ border: '3px dashed #e2e8f0', borderRadius: '24px', padding: '5rem 2rem', textAlign: 'center', background: '#f8fafc', cursor: 'pointer', transition: 'all 0.2s' }}>
                                    <div style={{ background: '#eff6ff', width: '80px', height: '80px', borderRadius: '50%', display: 'grid', placeItems: 'center', margin: '0 auto 1.5rem', color: '#1d4ed8' }}>
                                        <Upload size={32} />
                                    </div>
                                    <h4 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.5rem', color: '#1e293b' }}>Upload Item Media</h4>
                                    <p style={{ color: '#64748b', fontSize: '1rem' }}>Upload photos or videos of the items you want to move.</p>
                                    <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '1rem' }}>Drag and drop supported. Multiple files allowed.</p>
                                    <input id="media-inp" type="file" multiple hidden onChange={handleFile} />
                                </div>

                                {formData.media.length > 0 && (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '1rem' }}>
                                        {formData.media.map((f, i) => (
                                            <div key={i} style={{ padding: '10px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
                                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
                                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: '600' }}>{f.name}</span>
                                                <button type="button" onClick={() => removeFile(i)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                    <Button type="button" variant="outline" onClick={back} style={{ flex: 1 }}>Back</Button>
                                    <Button type="submit" disabled={submitting || formData.media.length === 0} style={{ flex: 2 }} size="lg">
                                        {submitting ? 'Analyzing & Submitting...' : 'Submit for AI Analysis'}
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </form>
            </Card>
        </div>
    );
};

// Simple Truck Icon component since lucide variant might differ
const TruckIcon = ({ size, color }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" />
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
);

export default AssessmentForm;
