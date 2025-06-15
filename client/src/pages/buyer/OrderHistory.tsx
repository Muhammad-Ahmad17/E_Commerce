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
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

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

  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
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
        <div className="space-y-8">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden"
            >
              {/* Order Header */}
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
                        order.deliveryStatus === 'Pending' || order.deliveryStatus === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'}`}>
                      {order.deliveryStatus}
                    </span>
                  )}
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold
                    ${order.status.toLowerCase() === 'completed' ? 'bg-green-100 text-green-800' :
                      order.status.toLowerCase() === 'pending' || order.status.toLowerCase() === 'in progress' ? 'bg-yellow-100 text-yellow-800' :
                      order.status.toLowerCase() === 'shipped' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                  <span className="text-lg font-semibold mt-1">${order.total.toFixed(2)}</span>
                  <button
                    onClick={() => toggleOrderDetails(order.id)}
                    className="mt-2 text-xs text-indigo-600 hover:underline focus:outline-none"
                  >
                    {expandedOrder === order.id ? 'Hide Details' : 'Order Details'}
                  </button>
                </div>
              </div>
              {/* Order Details */}
              {expandedOrder === order.id && (
                <div className="p-6">
                  {/* Shipping Address */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Shipping Address</h3>
                      <p>{order.shippingAddress}</p>
                      {order.postalCode && <p>{order.postalCode}</p>}
                    </div>
                    {order.expectedDeliveryDate && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Expected Delivery</h3>
                        <p>{new Date(order.expectedDeliveryDate).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                  {/* Order Items */}
                  <div className="mt-6">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Order Items</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                            <th className="px-4 py-2">Product</th>
                            <th className="px-4 py-2">Quantity</th>
                            <th className="px-4 py-2">Unit Price</th>
                            <th className="px-4 py-2 text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {order.items.map((item) => (
                            <tr key={item.id}>
                              <td className="px-4 py-3">
                                <Link to={`/buyer/product/${item.productId}`} className="hover:text-brand font-medium">
                                  {item.name}
                                </Link>
                              </td>
                              <td className="px-4 py-3">{item.quantity}</td>
                              <td className="px-4 py-3">${item.price.toFixed(2)}</td>
                              <td className="px-4 py-3 text-right">
                                ${(item.itemTotal ?? item.price * item.quantity).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="font-semibold">
                            <td colSpan={3} className="px-4 py-3 text-right">Total</td>
                            <td className="px-4 py-3 text-right">${order.total.toFixed(2)}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;