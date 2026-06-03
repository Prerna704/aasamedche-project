import { useState } from 'react';
import Layout from '../components/Layout';
import { useRouter } from 'next/router';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('Admin@123');
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) {
      router.push('/');
    } else {
      const body = await res.json();
      setError(body.error || 'Login failed');
    }
  }

  return (
    <Layout>
      <div className="card" style={{ maxWidth: '420px', margin: '0 auto' }}>
        <h2>Login</h2>
        <p>Only seeded users can sign in. Registration is disabled so use the provided test accounts.</p>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '14px' }}>
          <label>
            Email
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@example.com" />
          </label>
          <label>
            Password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
          </label>
          <button className="button" type="submit">
            Sign in
          </button>
          {error ? <p style={{ color: 'red' }}>{error}</p> : null}
          <div style={{ fontSize: '0.95rem' }}>
            <p>Admin: admin@example.com / Admin@123</p>
            <p>Seller: seller@example.com / Seller@123</p>
          </div>
        </form>
      </div>
    </Layout>
  );
}
