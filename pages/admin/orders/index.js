import { useEffect, useState } from 'react';
import Layout from '../../../components/Layout';
import { formatAmount, fromBase } from '../../../lib/units';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/orders')
      .then((res) => res.json())
      .then((data) => setOrders(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Layout><p>Loading orders…</p></Layout>;

  return (
    <Layout>
      <div className="card">
        <h2>Quotations & Orders</h2>
        {orders.length === 0 ? (
          <p>No quotations or orders have been placed yet.</p>
        ) : (
          <div style={{ display: 'grid', gap: '18px' }}>
            {orders.map((order) => (
              <div key={order.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                  <div>
                    <p>
                      <strong>Order #{order.id}</strong> — {order.isQuotation ? 'Quotation' : 'Order'}
                    </p>
                    <p>Status: {order.status}</p>
                    <p>Customer: {order.user.name} ({order.user.email})</p>
                  </div>
                  <div>
                    <p>Total: {formatAmount(order.totalAmount)}</p>
                    <p>{new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <div style={{ marginTop: '14px' }}>
                  {order.items.map((item) => (
                    <div key={item.id} style={{ padding: '12px', borderTop: '1px solid #e5e7eb' }}>
                      <p>
                        <strong>{item.product.name}</strong> — {item.quantity} {item.unit}
                      </p>
                      <p>
                        Base quantity: {fromBase(item.quantityBase, item.product.baseUnit).toFixed(3)} {item.product.baseUnit}
                      </p>
                      <p>Unit price: ₹{Number(item.pricePerBase).toFixed(2)} / {item.product.baseUnit}</p>
                      <p>Line total: {formatAmount(item.lineTotal)}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
