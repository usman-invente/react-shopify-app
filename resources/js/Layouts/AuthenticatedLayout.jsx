import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import { Link, usePage } from '@inertiajs/react';
import { Box, Page, TopBar, Navigation } from '@shopify/polaris';
import { useState } from 'react';

const styles = {
    navbar: {
        backgroundColor: '#fff',
        borderBottom: '1px solid #e5e7eb',
        padding: '0 16px',
    },
    navbarContent: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '64px',
        maxWidth: '1280px',
        margin: '0 auto',
    },
    navLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '32px',
    },
    navRight: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
    },
    userButton: {
        backgroundColor: 'transparent',
        border: 'none',
        padding: '8px 12px',
        cursor: 'pointer',
        fontSize: '14px',
        color: '#666',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        transition: 'background-color 0.2s',
    },
    mainContent: {
        padding: '24px 16px',
        maxWidth: '1280px',
        margin: '0 auto',
    },
    header: {
        backgroundColor: '#fff',
        padding: '24px 16px',
        borderBottom: '1px solid #e5e7eb',
        marginBottom: '24px',
    },
    headerTitle: {
        fontSize: '24px',
        fontWeight: '600',
        color: '#000',
        maxWidth: '1280px',
        margin: '0 auto',
    },
};

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const [dropdownOpen, setDropdownOpen] = useState(false);

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
            {/* Navigation */}
            <nav style={styles.navbar}>
                <div style={styles.navbarContent}>
                    <div style={styles.navLeft}>
                        <Link href="/">
                            <ApplicationLogo style={{ height: '36px', width: '36px', display: 'block' }} />
                        </Link>
                        <Link href={route('dashboard')} style={{ fontSize: '14px', color: route().current('dashboard') ? '#000' : '#666', fontWeight: route().current('dashboard') ? '500' : '400', textDecoration: 'none' }}>
                            Dashboard
                        </Link>
                    </div>

                    <div style={styles.navRight}>
                        <div style={{ position: 'relative' }}>
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <button style={styles.userButton}>
                                        {user.name}
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor">
                                            <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                                        </svg>
                                    </button>
                                </Dropdown.Trigger>

                                <Dropdown.Content>
                                    <Dropdown.Link href={route('profile.edit')}>
                                        Profile
                                    </Dropdown.Link>
                                    <Dropdown.Link
                                        href={route('logout')}
                                        method="post"
                                        as="button"
                                    >
                                        Log Out
                                    </Dropdown.Link>
                                </Dropdown.Content>
                            </Dropdown>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Header */}
            {header && (
                <header style={styles.header}>
                    <div style={styles.headerTitle}>
                        {header}
                    </div>
                </header>
            )}

            {/* Main Content */}
            <main style={styles.mainContent}>
                {children}
            </main>
        </div>
    );
}
