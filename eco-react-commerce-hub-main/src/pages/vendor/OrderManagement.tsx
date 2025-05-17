
import React, { useState, useEffect } from 'react';
import { getVendorOrders } from '@/services/api';
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
        setOrders(response.data.data || []);
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
    // API endpoint for updating order status doesn't exist in the requirements,
    // so we'll just simulate a successful update
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
    
    toast({
      title: 'Order status updated',
      description: `Order #${orderId} status changed to ${newStatus}`,
    });
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
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              {/* Order Header */}
              <div 
                className="px-6 py-4 flex flex-wrap justify-between items-center cursor-pointer hover:bg-gray-50"
                onClick={() => toggleOrderDetails(order.id)}
              >
                <div>
                  <p className="font-medium">Order #{order.id}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(order.orderDate).toLocaleDateString()} • {order.buyerName}
                  </p>
                </div>
                
                <div className="flex items-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold mr-4
                    ${order.status === 'completed' ? 'bg-green-100 text-green-800' :
                      order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                  <span className="font-semibold">${order.total.toFixed(2)}</span>
                </div>
              </div>
              
              {/* Order Details */}
              {expandedOrder === order.id && (
                <div className="p-6 border-t">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Customer Information */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Customer Information</h3>
                      <p className="font-medium">{order.buyerName}</p>
                      <p className="text-gray-600">{order.buyerEmail}</p>
                    </div>
                    
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
