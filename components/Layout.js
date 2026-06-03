import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Layout({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((json) => {
        if (json.user) setUser(json.user);
      })
      .catch(() => setUser(null));
  }, []);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    window.location.href = '/login';
  }

  return (
    <div className="container">
      <header className="header">
        <div>
          <Link href="/">
            <h1>Inventory & Order System</h1>
          </Link>
          <p>Search products, create quotations, and manage stock with unit-aware pricing.</p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Link href="/">Browse</Link>
          <Link href="/admin">Admin</Link>
          {user ? (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span>{user.name} ({user.role})</span>
              <button type="button" className="button secondary" onClick={handleLogout}>
                Logout
              </button>
            </div>
          ) : (
            <Link href="/login" className="button">
              Login
            </Link>
          )}
        </div>
      </header>
      {children}
    </div>
  );
}
