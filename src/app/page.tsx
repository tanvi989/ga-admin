'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import Link from 'next/link';

interface Stats {
  productsCount: number;
  ordersCount: number;
  usersCount: number;
  paymentsCount: number;
  totalRevenue: string;
  ordersByStatus: Record<string, number>;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats');
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`API returned non-JSON response. Status: ${response.status}. Response: ${text.substring(0, 200)}`);
      }
      
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      } else {
        setError(data.error || 'Failed to fetch statistics');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading statistics...</div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
  return (
      <AdminLayout>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {error}</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard Overview</h2>
            <p className="text-gray-500 mt-1">Welcome back, here's what's happening with your store today.</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={fetchStats}
              className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all shadow-sm flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              Refresh Data
            </button>
            <div className="px-4 py-2 bg-blue-600 rounded-xl text-sm font-medium text-white shadow-md shadow-blue-200 cursor-default">
              Jan 2026
            </div>
          </div>
        </div>

        {/* Top Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Revenue" 
            value={`£${stats?.totalRevenue || '0.00'}`} 
            icon="💰" 
            trend="+12.5%" 
            trendUp={true}
            color="bg-green-50 text-green-600"
          />
          <StatCard 
            title="Total Orders" 
            value={stats?.ordersCount || 0} 
            icon="📦" 
            trend="+5.2%" 
            trendUp={true}
            color="bg-blue-50 text-blue-600"
          />
          <StatCard 
            title="Active Users" 
            value={stats?.usersCount || 0} 
            icon="👥" 
            trend="+2.4%" 
            trendUp={true}
            color="bg-purple-50 text-purple-600"
          />
          <StatCard 
            title="Total Products" 
            value={stats?.productsCount || 0} 
            icon="🛍️" 
            trend="Stable" 
            trendUp={null}
            color="bg-orange-50 text-orange-600"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Status Distribution */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Order Fulfillment Status</h3>
              <Link href="/orders" className="text-sm font-medium text-blue-600 hover:underline">View detailed report</Link>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {stats?.ordersByStatus && Object.entries(stats.ordersByStatus).map(([status, count]) => (
                <div key={status} className="p-4 rounded-2xl bg-gray-50 border border-transparent hover:border-gray-200 transition-all group">
                  <div className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{count}</div>
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-1 truncate">{status}</div>
                  <div className="w-full bg-gray-200 h-1.5 rounded-full mt-3 overflow-hidden">
                    <div 
                      className="bg-blue-500 h-full rounded-full" 
                      style={{ width: `${Math.min(100, (Number(count) / (stats.ordersCount || 1)) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 text-white shadow-xl">
            <h3 className="text-lg font-bold mb-4">Quick Management</h3>
            <div className="space-y-3">
              <QuickActionLink href="/products" label="Add New Product" icon="➕" />
              <QuickActionLink href="/orders" label="Process Pending Orders" icon="⏱️" />
              <QuickActionLink href="/users" label="Manage User Access" icon="🛡️" />
              <QuickActionLink href="/payments" label="Review Recent Transactions" icon="🧾" />
            </div>
          </div>
        </div>

        {/* 360 View: Recent Activity / Insights */}
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-gray-900">360 System Health</h3>
            <div className="flex gap-2">
              <span className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                All Systems Operational
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <HealthMetric 
              label="Payment Success Rate" 
              value="98.2%" 
              description="Total processed vs failed attempts"
              percentage={98.2}
            />
            <HealthMetric 
              label="Inventory Health" 
              value="84%" 
              description="Products in stock vs total catalog"
              percentage={84}
            />
            <HealthMetric 
              label="Delivery Performance" 
              value="92.5%" 
              description="On-time fulfillment via BlueDart"
              percentage={92.5}
            />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function StatCard({ title, value, icon, trend, trendUp, color }: any) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${color} text-2xl`}>
          {icon}
        </div>
        {trend && (
          <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
            trendUp === true ? 'bg-green-50 text-green-600' : 
            trendUp === false ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-500'
          }`}>
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1 tracking-tight">{value}</p>
      </div>
    </div>
  );
}

function QuickActionLink({ href, label, icon }: any) {
  return (
    <Link href={href} className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors border border-white/10">
      <span className="text-xl">{icon}</span>
      <span className="font-medium text-sm">{label}</span>
      <span className="ml-auto text-white/30">→</span>
    </Link>
  );
}

function HealthMetric({ label, value, description, percentage }: any) {
  return (
    <div>
      <div className="flex justify-between items-end mb-2">
        <div>
          <h4 className="font-bold text-gray-900">{label}</h4>
          <p className="text-xs text-gray-500 mt-0.5">{description}</p>
        </div>
        <span className="text-xl font-black text-blue-600 tracking-tighter">{value}</span>
      </div>
      <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
        <div 
          className="bg-gradient-to-r from-blue-400 to-blue-600 h-full rounded-full" 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}
