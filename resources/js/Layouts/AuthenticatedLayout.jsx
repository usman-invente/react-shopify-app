import { Link, usePage, router } from '@inertiajs/react';
import { useState, useCallback } from 'react';
import { Frame, TopBar, Navigation, Text } from '@shopify/polaris';
import {
    HomeIcon,
    ConnectIcon,
    ProductIcon,
} from '@shopify/polaris-icons';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    const toggleUserMenu = useCallback(() => setUserMenuOpen((open) => !open), []);
    const toggleMobileNav = useCallback(() => setMobileNavOpen((open) => !open), []);

    const userMenuMarkup = (
        <TopBar.UserMenu
            actions={[
                {
                    items: [
                        {
                            content: 'Profile',
                            onAction: () => router.visit(route('profile.edit')),
                        },
                    ],
                },
                {
                    items: [
                        {
                            content: 'Log out',
                            onAction: () => router.post(route('logout')),
                        },
                    ],
                },
            ]}
            name={user.name}
            initials={user.name.charAt(0).toUpperCase()}
            open={userMenuOpen}
            onToggle={toggleUserMenu}
        />
    );

    const topBarMarkup = (
        <TopBar
            showNavigationToggle
            userMenu={userMenuMarkup}
            onNavigationToggle={toggleMobileNav}
        />
    );

    const navigationMarkup = (
        <Navigation location={window.location.pathname}>
            <Navigation.Section
                items={[
                    {
                        label: 'Dashboard',
                        icon: HomeIcon,
                        url: route('dashboard'),
                        selected: route().current('dashboard'),
                    },
                    {
                        label: 'Connector',
                        icon: ConnectIcon,
                        url: route('connector'),
                        selected: route().current('connector'),
                    },
                    {
                        label: 'Products',
                        icon: ProductIcon,
                        url: route('products'),
                        selected: route().current('products'),
                    },
                ]}
            />
        </Navigation>
    );

    return (
        <div style={{ height: '100vh' }}>
            <Frame
                topBar={topBarMarkup}
                navigation={navigationMarkup}
                showMobileNavigation={mobileNavOpen}
                onNavigationDismiss={toggleMobileNav}
            >
                <div style={{ padding: '20px 32px', maxWidth: '100%' }}>
                    {header && (
                        <div style={{ marginBottom: '20px' }}>
                            <Text variant="headingXl" as="h1">{header}</Text>
                        </div>
                    )}
                    {children}
                </div>
            </Frame>
        </div>
    );
}
