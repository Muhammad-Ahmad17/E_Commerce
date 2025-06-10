import React, { useState, useEffect } from 'react';
import { getBuyerOrders } from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import { Link } from 'react-router-dom';

type Order = {
  id: string;
  orderDate: string;
  status: string;
  total: number;
  shippingAddress?: string;
  postalCode?: string;
  deliveryStatus?: string;
  expectedDeliveryDate?: string | null;
  items: OrderItem[];
};

type OrderItem = {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  itemTotal?: number;
};

const OrderHistory: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<{ [orderId: string]: boolean }>({});

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await getBuyerOrders();
        setOrders(
          (() => {
            const grouped: { [orderId: string]: Order } = {};
            (response.data || []).forEach((row: any) => {
              const orderId = row.orderId?.toString();
              if (!grouped[orderId]) {
                grouped[orderId] = {
                  id: orderId,
                  orderDate: row.orderDate,
                  status: row.orderStatus,
                  total: row.totalAmount,
                  shippingAddress: row.shippingAddress,
                  postalCode: row.postalCode,
                  deliveryStatus: row.deliveryStatus,
                  expectedDeliveryDate: row.expectedDeliveryDate,
                  items: [],
                };
              }
              grouped[orderId].items.push({
                id: row.productId?.toString(),
                productId: row.productId?.toString(),
                name: row.productName,
                price: row.unitPrice,
                quantity: row.quantity,
                itemTotal: row.itemTotal,
              });
            });
            return Object.values(grouped);
          })()
        );
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const toggleExpand = (orderId: string) => {
    setExpanded((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorMessage message={error} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Order History</h1>
      {orders.length === 0 ? (
        <div className="text-center py-16">
          <h3 className="text-xl font-medium text-gray-500">No orders found</h3>
          <p className="mt-2 text-gray-500">You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className="space-y-10">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden"
            >
              <div className="bg-gray-50 px-6 py-4 border-b flex flex-wrap justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">Order #{order.id}</p>
                  <p className="text-sm text-gray-500">
                    Placed on {new Date(order.orderDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  {order.deliveryStatus && (
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold mb-1
                      ${order.deliveryStatus === 'Order Completed' ? 'bg-green-100 text-green-800' :
                        order.deliveryStatus === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'}`}>
                      {order.deliveryStatus}
                    </span>
                  )}
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold
                    ${order.status.toLowerCase() === 'completed' ? 'bg-green-100 text-green-800' :
                      order.status.toLowerCase() === 'shipped' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                  <p className="text-lg font-semibold mt-1">${order.total.toFixed(2)}</p>
                  <button
                    onClick={() => toggleExpand(order.id)}
                    className="mt-2 text-xs text-indigo-600 hover:underline focus:outline-none"
                  >
                    {expanded[order.id] ? 'Hide Details' : 'Other Details'}
                  </button>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Items</h3>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center border-b pb-2 last:border-b-0">
                      <div className="ml-0 flex flex-1 flex-col">
                        <div>
                          <div className="flex justify-between text-base font-medium text-gray-900">
                            <h4>
                              <Link to={`/buyer/product/${item.productId}`} className="hover:text-brand">
                                {item.name}
                              </Link>
                            </h4>
                            <p className="ml-4">${item.price.toFixed(2)}</p>
                          </div>
                          <p className="mt-1 text-sm text-gray-500">Qty: {item.quantity}</p>
                          {item.itemTotal !== undefined && (
                            <p className="mt-1 text-sm text-gray-500">Item Total: ${item.itemTotal.toFixed(2)}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {expanded[order.id] && (
                  <div className="mt-6 border-t pt-4 space-y-2">
                    {order.shippingAddress && (
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold">Shipping Address:</span> {order.shippingAddress}
                      </p>
                    )}
                    {order.postalCode && (
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold">Postal Code:</span> {order.postalCode}
                      </p>
                    )}
                    {order.expectedDeliveryDate && (
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold">Expected Delivery:</span> {new Date(order.expectedDeliveryDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
