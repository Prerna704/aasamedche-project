import { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from '../../components/Layout';

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then((res) => res.json())
      .then((json) => {
        setUser(json.user || null);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Layout><p>Loading…</p></Layout>;
  if (!user || user.role !== 'ADMIN') {
    return (
      <Layout>
        <div className="card">
          <h2>Admin area</h2>
          <p>Administrator access is required. Please sign in as an admin.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="card">
        <h2>Admin dashboard</h2>
        <p>Use the admin panel to manage products and review incoming quotations/orders.</p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Link href="/admin/products" className="button">
            Manage products
          </Link>
          <Link href="/admin/orders" className="button">
            View quotations & orders
          </Link>
        </div>
      </div>
    </Layout>
  );
}
