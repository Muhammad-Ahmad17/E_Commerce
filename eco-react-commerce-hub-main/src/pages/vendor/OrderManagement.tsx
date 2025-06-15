import React, { useState, useEffect } from 'react';
import { getVendorOrders, markOrderAsDelivered } from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import { Button } from "@/components/ui/button";
import { toast } from '@/components/ui/use-toast';

type Order = {
  id: string;
  orderDate: string;
  buyerName: string;
  buyerEmail: string;
  status: string;
  total: number;
  items: {
    id: string;
    name: string;
    quantity: number;
    price: number;
  }[];
  shippingAddress: {
    addressLine1: string;
    city: string;
    postalCode: string;
    country: string;
  };
};

const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await getVendorOrders();
        const mappedOrders = (response.data || []).map((item: any) => ({
          id: item.id,
          orderDate: item.orderDate,
          buyerName: item.buyerName,
          buyerEmail: item.buyerEmail,
          status: item.status,
          total: item.total,
          items: typeof item.items === 'string' ? JSON.parse(item.items) : item.items,
          shippingAddress: typeof item.shippingAddress === 'string' ? JSON.parse(item.shippingAddress) : item.shippingAddress,
          vendorId: item.vendorId,
          vendorName: item.vendorName,
        }));
        setOrders(mappedOrders);
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

  const handleUpdateStatus = (orderId: string, newStatus: string) => {
    setOrders(orders.map(order =>
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
    toast({
      title: 'Order status updated',
      description: `Order #${orderId} status changed to ${newStatus}`,
    });
  };

  const handleAutoDeliver = async (orderId: string) => {
    try {
      await markOrderAsDelivered(orderId);
      setOrders(orders.map(order =>
        order.id === orderId ? { ...order, status: 'Delivered' } : order
      ));
      toast({
        title: 'Order delivered',
        description: `Order #${orderId} marked as delivered.`,
      });
    } catch (err: any) {
      toast({
        title: 'Auto delivery failed',
        description: err.response?.data?.message || 'Failed to mark order as delivered',
        variant: 'destructive',
      });
    }
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
      <h1 className="text-3xl font-bold mb-8">Order Management</h1>
      {orders.length > 0 ? (
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
                  <p className="text-sm text-gray-500">Buyer: <span className="font-semibold">{order.buyerName}</span></p>
                  {order.buyerEmail && (
                    <p className="text-sm text-gray-400">{order.buyerEmail}</p>
                  )}
                </div>
                <div className="flex flex-col items-end">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold mb-1
                      ${order.status.toLowerCase() === 'delivered'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                      }`
                    }
                  >
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Shipping Address */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Shipping Address</h3>
                      <p>{order.shippingAddress?.addressLine1}</p>
                      <p>{order.shippingAddress?.city}, {order.shippingAddress?.postalCode}</p>
                      <p>{order.shippingAddress?.country}</p>
                    </div>
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
                              <td className="px-4 py-3">{item.name}</td>
                              <td className="px-4 py-3">{item.quantity}</td>
                              <td className="px-4 py-3">${item.price.toFixed(2)}</td>
                              <td className="px-4 py-3 text-right">
                                ${(item.price * item.quantity).toFixed(2)}
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
                  {/* Order Actions */}
                  <div className="mt-6 flex flex-wrap gap-2 justify-end">
                    {order.status === 'pending' && (
                      <Button variant="outline" onClick={() => handleUpdateStatus(order.id, 'processing')}>
                        Process Order
                      </Button>
                    )}
                    {order.status === 'processing' && (
                      <Button variant="outline" onClick={() => handleUpdateStatus(order.id, 'shipped')}>
                        Mark as Shipped
                      </Button>
                    )}
                    {order.status === 'shipped' && (
                      <Button variant="outline" onClick={() => handleUpdateStatus(order.id, 'completed')}>
                        Mark as Completed
                      </Button>
                    )}
                    <Button variant="outline">Print Invoice</Button>
                    <Button variant="outline" onClick={() => handleAutoDeliver(order.id)}>
                      Auto Deliver
                    </Button>
                    <Button variant="destructive">Cancel Order</Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <h3 className="text-xl font-medium text-gray-500">No orders found</h3>
          <p className="mt-2 text-gray-500">New orders will appear here when customers place them</p>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
