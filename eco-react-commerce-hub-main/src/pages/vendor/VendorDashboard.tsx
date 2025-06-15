import React, { useState, useEffect } from 'react';
import { getVendorAnalytics, getVendorOrders } from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

type Analytics = {
  totalSales: number;
  totalOrders: number;
  totalProducts: number;
  salesByCategory: { category: string; sales: number }[];
  recentSales: { date: string; amount: number; orderCount?: number }[];
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

const COLORS = ['#9b87f5', '#6ee7b7', '#fbbf24', '#f87171', '#60a5fa', '#f472b6', '#34d399', '#facc15'];

// Helper to fill missing days in the month with amount: 0
function fillMissingDays(
  sales: { date: string; amount: number; orderCount?: number }[],
  start: Date,
  end: Date
) {
  const filled: { date: string; amount: number; orderCount: number }[] = [];
  const salesMap = Object.fromEntries(sales.map(s => [s.date.slice(0, 10), s]));
  let current = new Date(start);
  while (current <= end) {
    const dateStr = current.toISOString().slice(0, 10);
    filled.push({
      date: dateStr,
      amount: salesMap[dateStr]?.amount ?? 0,
      orderCount: salesMap[dateStr]?.orderCount ?? 0,
    });
    current.setDate(current.getDate() + 1);
  }
  return filled;
}

const VendorDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dynamic duration state
  const [duration, setDuration] = useState<'7d' | '30d' | '90d'>('30d');

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

  // Dynamic date range calculation
  const today = new Date();
  let start: Date;
  if (duration === '7d') {
    start = new Date(today);
    start.setDate(today.getDate() - 6);
  } else if (duration === '30d') {
    start = new Date(today);
    start.setDate(today.getDate() - 29);
  } else {
    start = new Date(today);
    start.setDate(today.getDate() - 89);
  }
  const end = today;

  const salesData = analytics
    ? fillMissingDays(
        analytics.recentSales.filter(s => {
          const d = new Date(s.date);
          return d >= start && d <= end;
        }),
        start,
        end
      )
    : [];

  // Dynamic totals for selected duration
  const totalSalesDynamic = salesData.reduce((sum, s) => sum + s.amount, 0);
  // If you have order count per day, sum those; otherwise, count days with sales
  const totalOrdersDynamic = salesData.reduce((sum, s) => sum + (s.orderCount || 0), 0);

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
          <p className="text-sm font-medium text-gray-500">Total Sales ({duration})</p>
          <p className="text-2xl font-bold">${totalSalesDynamic.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500">
          <p className="text-sm font-medium text-gray-500">Total Orders ({duration})</p>
          <p className="text-2xl font-bold">{totalOrdersDynamic}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
          <p className="text-sm font-medium text-gray-500">Total Products</p>
          <p className="text-2xl font-bold">{analytics?.totalProducts}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Sales by Category Pie Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Sales by Category</h2>
          <div className="h-80 flex items-center justify-center">
            {analytics?.salesByCategory && analytics.salesByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.salesByCategory}
                    dataKey="sales"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ category, percent }) => `${category} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {analytics.salesByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center">No sales data available.</p>
            )}
          </div>
        </div>
        {/* Sales Bar Chart with dynamic duration */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Sales Bar Chart</h2>
            <div>
              <button
                className={`px-3 py-1 rounded text-xs font-semibold mr-2 ${duration === '7d' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                onClick={() => setDuration('7d')}
              >
                7 Days
              </button>
              <button
                className={`px-3 py-1 rounded text-xs font-semibold mr-2 ${duration === '30d' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                onClick={() => setDuration('30d')}
              >
                30 Days
              </button>
              <button
                className={`px-3 py-1 rounded text-xs font-semibold ${duration === '90d' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                onClick={() => setDuration('90d')}
              >
                90 Days
              </button>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={salesData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={date => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis />
                <Tooltip
                  formatter={(value: any, name: string, props: any) => {
                    if (name === 'amount') {
                      return [`$${value.toFixed(2)}`, 'Sales'];
                    }
                    if (name === 'orderCount') {
                      return [value, 'Orders'];
                    }
                    return [value, name];
                  }}
                  labelFormatter={date => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
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
