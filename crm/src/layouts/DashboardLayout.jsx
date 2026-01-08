import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    ClipboardList,
    ShieldCheck,
    LogOut,
    Truck,
    Bell,
    Search,
    ChevronRight,
    Settings,
    UserCircle,
    X,
    Menu
} from 'lucide-react';

const SidebarLink = ({ to, icon, label, badge }) => (
    <NavLink
        to={to}
        style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem 1rem',
            textDecoration: 'none',
            color: isActive ? '#ffffff' : '#94a3b8',
            background: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontWeight: '600',
            transition: 'all 0.2s',
            marginBottom: '4px',
            position: 'relative'
        })}
    >
        {icon}
        <span style={{ flex: 1 }}>{label}</span>
        {badge && (
            <span style={{
                background: '#ef4444',
                color: 'white',
                fontSize: '0.7rem',
                padding: '2px 6px',
                borderRadius: '99px',
                minWidth: '20px',
                textAlign: 'center'
            }}>{badge}</span>
        )}
    </NavLink>
);

const DashboardLayout = ({ children, user, logout }) => {
    const location = useLocation();
    const [showProfile, setShowProfile] = React.useState(false);
    const [sidebarOpen, setSidebarOpen] = React.useState(false);

    const pageTitle = {
        '/dashboard': 'Dashboard',
        '/leads': 'Leads Management',
        '/sales-team': 'Sales Team',
        '/audit': 'System Reports'
    }[location.pathname] || 'Details';

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', zIndex: 95 }}
                />
            )}

            {/* Dark Sidebar */}
            <aside
                className={sidebarOpen ? 'open' : ''}
                style={{
                    width: '260px',
                    background: '#0f172a',
                    padding: '2rem 1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'fixed',
                    height: '100vh',
                    zIndex: 100
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem', paddingLeft: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                            background: '#10b981',
                            padding: '6px',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Truck size={22} color="white" />
                        </div>
                        <div>
                            <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#ffffff', lineHeight: 1 }}>AI Estimator</div>
                            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '4px' }}>{user?.role === 'ADMIN' ? 'Admin Panel' : 'Sales Panel'}</div>
                        </div>
                    </div>
                    {/* Close button for mobile */}
                    <button
                        onClick={() => setSidebarOpen(false)}
                        style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'none' }}
                        className="desktop-hide mobile-show"
                    >
                        <X size={20} />
                    </button>
                </div>

                <nav style={{ flex: 1 }}>
                    <div onClick={() => setSidebarOpen(false)}>
                        <SidebarLink to="/dashboard" icon={<LayoutDashboard size={18} />} label="Dashboard" />
                    </div>
                    <div onClick={() => setSidebarOpen(false)}>
                        <SidebarLink to="/leads" icon={<ClipboardList size={18} />} label="Leads" />
                    </div>
                    {user?.role === 'ADMIN' && (
                        <>
                            <div onClick={() => setSidebarOpen(false)}>
                                <SidebarLink to="/sales-team" icon={<UserCircle size={18} />} label="Sales Persons" />
                            </div>
                            <div onClick={() => setSidebarOpen(false)}>
                                <SidebarLink to="/reports" icon={<ShieldCheck size={18} />} label="Reports" />
                            </div>
                        </>
                    )}
                </nav>

                <div style={{ marginTop: 'auto', paddingTop: '1.5rem' }}>
                    <button
                        onClick={logout}
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '0.75rem 1rem',
                            background: 'transparent',
                            color: '#94a3b8',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            fontSize: '0.9rem'
                        }}
                    >
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main style={{ marginLeft: sidebarOpen ? '260px' : 'var(--sidebar-width, 260px)', flex: 1, transition: 'margin-left 0.3s' }}>
                <header style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1.25rem 2rem',
                    background: 'rgba(248, 250, 252, 0.95)',
                    backdropFilter: 'blur(8px)',
                    position: 'sticky',
                    top: 0,
                    zIndex: 200,
                    borderBottom: '1px solid #e2e8f0'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button
                            onClick={() => setSidebarOpen(true)}
                            style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'none' }}
                            className="mobile-show"
                        >
                            <Menu size={24} />
                        </button>
                        <div>
                            <h1 style={{ fontSize: 'clamp(1.1rem, 4vw, 1.5rem)', fontWeight: '800', color: '#0f172a', margin: 0 }}>{pageTitle}</h1>
                            <p className="mobile-hide" style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '2px', margin: 0 }}>
                                {location.pathname === '/dashboard' ? "Welcome back! Here's an overview of your moving business." : ""}
                            </p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div
                            title="View Profile"
                            onClick={() => setShowProfile(true)}
                            style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'white', padding: '4px 10px 4px 4px', borderRadius: '99px', border: '1px solid #e2e8f0', cursor: 'pointer', transition: 'all 0.2s' }}
                        >
                            <div style={{ width: '28px', height: '28px', background: '#eff6ff', borderRadius: '50%', display: 'grid', placeItems: 'center', color: '#1d4ed8', fontWeight: '800', fontSize: '0.75rem' }}>
                                {user?.name?.charAt(0) || 'A'}
                            </div>
                            <span className="mobile-hide" style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b' }}>{user?.name || 'User'}</span>
                        </div>
                    </div>
                </header>

                <div style={{ padding: 'clamp(1rem, 3vw, 2rem)', minHeight: 'calc(100vh - 8rem)' }}>
                    {children}
                </div>

                {showProfile && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'grid', placeItems: 'center', zIndex: 1000, padding: '1rem' }}>
                        <div style={{ background: 'white', borderRadius: '24px', width: '100%', maxWidth: '400px', padding: 'clamp(1.5rem, 5vw, 2.5rem)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', position: 'relative' }}>
                            <button
                                onClick={() => setShowProfile(false)}
                                style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                            >
                                <X size={24} />
                            </button>

                            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                                <div style={{ width: '80px', height: '80px', background: '#eff6ff', borderRadius: '50%', margin: '0 auto 1.25rem', display: 'grid', placeItems: 'center', color: '#1d4ed8', border: '4px solid white', boxShadow: '0 0 0 2px #eff6ff' }}>
                                    <UserCircle size={40} />
                                </div>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>My Account</h2>
                                <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '4px' }}>Profile Information</p>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', background: '#f8fafc', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                                <div>
                                    <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Full Name</div>
                                    <div style={{ fontWeight: '700', color: '#1e293b' }}>{user?.name}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Email Address</div>
                                    <div style={{ fontWeight: '700', color: '#1e293b' }}>{user?.email}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Account Role</div>
                                    <div style={{
                                        display: 'inline-block',
                                        padding: '4px 10px',
                                        background: user?.role === 'ADMIN' ? '#eff6ff' : '#f0fdf4',
                                        color: user?.role === 'ADMIN' ? '#1d4ed8' : '#15803d',
                                        borderRadius: '6px',
                                        fontSize: '0.75rem',
                                        fontWeight: '800',
                                        marginTop: '4px'
                                    }}>
                                        {user?.role}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setShowProfile(false)}
                                style={{ width: '100%', marginTop: '1.5rem', padding: '12px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s' }}
                            >
                                Close Profile
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default DashboardLayout;
