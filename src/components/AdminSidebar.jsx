import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Store, 
  ShoppingCart, 
  AlertTriangle, 
  BarChart3, 
  Settings 
} from 'lucide-react';

const navItems = [
  { path: '/admin', name: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/users', name: 'User Management', icon: Users },
  { path: '/admin/sellers', name: 'Seller Approvals', icon: Store },
  { path: '/admin/orders', name: 'All Orders', icon: ShoppingCart },
  { path: '/admin/grievances', name: 'Grievances', icon: AlertTriangle },
  { path: '/admin/analytics', name: 'Platform Analytics', icon: BarChart3 },
  { path: '/admin/settings', name: 'System Settings', icon: Settings },
];

const AdminSidebar = () => {
  return (
    <div className="sidebar">
      <div style={{ padding: '0 1.5rem', marginBottom: '2rem' }}>
        <h3 style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Admin Panel
        </h3>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0 1rem' }}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/admin'}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              color: isActive ? 'white' : 'var(--text-secondary)',
              backgroundColor: isActive ? 'var(--accent-primary)' : 'transparent',
              fontWeight: isActive ? '600' : '500',
              transition: 'all 0.2s',
              textDecoration: 'none'
            })}
          >
            <item.icon size={20} />
            {item.name}
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default AdminSidebar;
