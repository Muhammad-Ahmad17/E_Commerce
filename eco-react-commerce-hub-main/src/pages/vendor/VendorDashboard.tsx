import React, { useState, useEffect } from 'react';
import { getVendorAnalytics, getVendorOrders } from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type Analytics = {
  totalSales: number;
  totalOrders: number;
  totalProducts: number;
  salesByCategory: { category: string; sales: number }[];
  recentSales: { date: string; amount: number }[];
};

type OrderItem = {
  id: string;
  name: string;
  quantity: number;
  price: number;
};

type Order = {
  id: string;
  orderDate: string;
  buyerName: string;
  status: string;
  total: number;
  items: OrderItem[];
};

const VendorDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [analyticsResponse, ordersResponse] = await Promise.all([
          getVendorAnalytics(),
          getVendorOrders()
        ]);

        // Analytics mapping
        const analyticsRaw = analyticsResponse.data[0];
        setAnalytics({
          totalSales: analyticsRaw.totalSales,
          totalOrders: analyticsRaw.totalOrders,
          totalProducts: analyticsRaw.totalProducts,
          salesByCategory: JSON.parse(analyticsRaw.salesByCategory || '[]'),
          recentSales: JSON.parse(analyticsRaw.recentSales || '[]'),
        });

        // Orders mapping
        const ordersArray = Array.isArray(ordersResponse.data) ? ordersResponse.data : [];
        setPendingOrders(
          ordersArray
            .filter((order: any) =>
              order.status &&
              (order.status.toLowerCase() === 'pending' || order.status.toLowerCase() === 'processing')
            )
            .map((order: any) => ({
              ...order,
              items: JSON.parse(order.items || '[]'),
              shippingAddress: JSON.parse(order.shippingAddress || '{}'),
            }))
            .slice(0, 5)
        );
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
      <h1 className="text-3xl font-bold mb-8">Vendor Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-brand">
          <p className="text-sm font-medium text-gray-500">Total Sales</p>
          <p className="text-2xl font-bold">${analytics?.totalSales.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500">
          <p className="text-sm font-medium text-gray-500">Total Orders</p>
          <p className="text-2xl font-bold">{analytics?.totalOrders}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
          <p className="text-sm font-medium text-gray-500">Total Products</p>
          <p className="text-2xl font-bold">{analytics?.totalProducts}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Sales by Category</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={analytics?.salesByCategory}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sales" fill="#9b87f5" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Recent Sales</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={analytics?.recentSales}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="amount" fill="#9b87f5" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Recent Orders</h2>
          <Link to="/vendor/orders">
            <Button variant="outline" size="sm">View All</Button>
          </Link>
        </div>
        {pendingOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="px-4 py-2">Order ID</th>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Buyer</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {pendingOrders.map((order) => (
                  <tr key={order.id} className="border-t">
                    <td className="px-4 py-4 whitespace-nowrap">{order.id}</td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {new Date(order.orderDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">{order.buyerName}</td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold
                        ${order.status.toLowerCase() === 'completed' ? 'bg-green-100 text-green-800' :
                          order.status.toLowerCase() === 'processing' ? 'bg-blue-100 text-blue-800' :
                          order.status.toLowerCase() === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right">
                      ${order.total.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 italic">No pending orders.</p>
        )}
      </div>
    </div>
  );
};

export default VendorDashboard;
