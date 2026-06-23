import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

const styles = {
    container: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px',
        marginBottom: '24px',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: '8px',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb',
    },
    cardTitle: {
        fontSize: '14px',
        fontWeight: '500',
        color: '#666',
        marginBottom: '12px',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
    },
    cardValue: {
        fontSize: '32px',
        fontWeight: '700',
        color: '#000',
        marginBottom: '8px',
    },
    cardSubtext: {
        fontSize: '13px',
        color: '#999',
    },
    section: {
        marginBottom: '32px',
    },
    sectionTitle: {
        fontSize: '20px',
        fontWeight: '600',
        color: '#000',
        marginBottom: '16px',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
    },
    tableHeader: {
        backgroundColor: '#f9fafb',
        borderBottom: '1px solid #e5e7eb',
    },
    tableHeaderCell: {
        padding: '12px 16px',
        fontSize: '12px',
        fontWeight: '600',
        color: '#666',
        textAlign: 'left',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
    },
    tableCell: {
        padding: '12px 16px',
        fontSize: '14px',
        color: '#333',
        borderBottom: '1px solid #e5e7eb',
    },
    tableRow: {
        ':hover': {
            backgroundColor: '#f5f5f5',
        },
    },
    badge: {
        display: 'inline-block',
        paddingTop: '4px',
        paddingBottom: '4px',
        paddingLeft: '8px',
        paddingRight: '8px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: '500',
    },
    badgeSuccess: {
        backgroundColor: '#dffcf0',
        color: '#137752',
    },
    badgePending: {
        backgroundColor: '#fef3c7',
        color: '#92400e',
    },
};

export default function Dashboard() {
    const stats = [
        { label: 'Total Users', value: '2,543', change: '+12% from last month' },
        { label: 'Revenue', value: '$45,231', change: '+8% from last month' },
        { label: 'Active Sessions', value: '342', change: '+23% from last week' },
        { label: 'Conversion Rate', value: '3.24%', change: '+0.5% from last month' },
    ];

    const recentActivity = [
        { id: 1, user: 'John Doe', action: 'Signed up', time: '2 hours ago', status: 'success' },
        { id: 2, user: 'Jane Smith', action: 'Updated profile', time: '4 hours ago', status: 'success' },
        { id: 3, user: 'Mike Johnson', action: 'Password reset', time: '1 day ago', status: 'pending' },
        { id: 4, user: 'Sarah Williams', action: 'Logged in', time: '2 days ago', status: 'success' },
    ];

    return (
        <AuthenticatedLayout header="Dashboard">
            <Head title="Dashboard" />

            {/* Statistics Cards */}
            <div style={styles.section}>
                <h2 style={styles.sectionTitle}>Overview</h2>
                <div style={styles.container}>
                    {stats.map((stat, idx) => (
                        <div key={idx} style={styles.card}>
                            <div style={styles.cardTitle}>{stat.label}</div>
                            <div style={styles.cardValue}>{stat.value}</div>
                            <div style={styles.cardSubtext}>{stat.change}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Activity */}
            <div style={styles.section}>
                <h2 style={styles.sectionTitle}>Recent Activity</h2>
                <table style={styles.table}>
                    <thead style={styles.tableHeader}>
                        <tr>
                            <th style={styles.tableHeaderCell}>User</th>
                            <th style={styles.tableHeaderCell}>Action</th>
                            <th style={styles.tableHeaderCell}>Time</th>
                            <th style={styles.tableHeaderCell}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentActivity.map((activity) => (
                            <tr key={activity.id} style={styles.tableRow}>
                                <td style={styles.tableCell}>{activity.user}</td>
                                <td style={styles.tableCell}>{activity.action}</td>
                                <td style={styles.tableCell}>{activity.time}</td>
                                <td style={styles.tableCell}>
                                    <span
                                        style={{
                                            ...styles.badge,
                                            ...(activity.status === 'success'
                                                ? styles.badgeSuccess
                                                : styles.badgePending),
                                        }}
                                    >
                                        {activity.status === 'success' ? '✓ Active' : '⏱ Pending'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Quick Stats Section */}
            <div style={styles.section}>
                <h2 style={styles.sectionTitle}>Quick Stats</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    <div style={styles.card}>
                        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#000' }}>
                            Performance
                        </h3>
                        <div style={{ fontSize: '14px', color: '#666', lineHeight: '1.6' }}>
                            <p>✓ Page load time: 1.2s</p>
                            <p>✓ Uptime: 99.9%</p>
                            <p>✓ Response time: 245ms</p>
                        </div>
                    </div>

                    <div style={styles.card}>
                        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#000' }}>
                            System Health
                        </h3>
                        <div style={{ fontSize: '14px', color: '#666', lineHeight: '1.6' }}>
                            <p>✓ CPU Usage: 34%</p>
                            <p>✓ Memory: 2.4GB / 8GB</p>
                            <p>✓ Disk Space: 45.2GB / 500GB</p>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
