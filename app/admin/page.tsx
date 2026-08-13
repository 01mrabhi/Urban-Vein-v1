'use client';
import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  ShoppingCart, 
  Users, 
  Package, 
  Settings, 
  Search, 
  Bell, 
  Sun, 
  Moon, 
  RefreshCw, 
  Download, 
  Truck, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ExternalLink,
  ChevronDown,
  Filter,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  Building2,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../context/ToastContext';

export default function AdminDashboard() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const { showToast } = useToast();

  // Fetch real-time orders from Supabase
  const fetchOrders = async (showRefreshToast = false) => {
    if (showRefreshToast) setRefreshing(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
      if (showRefreshToast) showToast('Dashboard synced with live database', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch orders', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    // Subscribe to Supabase Realtime changes on orders
    const channel = supabase
      .channel('realtime-admin-orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          fetchOrders();
          showToast('New order or update received live!', 'info');
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Update order status live in Supabase DB
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      showToast(`Order status updated to ${newStatus.toUpperCase()}`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update order status', 'error');
    }
  };

  // Export Manifest to CSV
  const exportCSV = () => {
    if (orders.length === 0) {
      showToast('No orders to export', 'error');
      return;
    }

    const headers = ['Order ID', 'Date', 'Amount (INR)', 'Payment Status', 'Payment Method', 'Shipping Address', 'Phone', 'Order Status', 'Items Count'];
    const rows = orders.map(o => [
      `ORD-${o.id.slice(0, 8).toUpperCase()}`,
      new Date(o.created_at).toLocaleString('en-IN'),
      o.total_amount,
      o.payment_status || 'pending',
      o.payment_method || 'razorpay',
      `"${(o.shipping_address || '').replace(/"/g, '""')}"`,
      o.phone || '',
      o.status || 'pending',
      o.order_items?.length || 0
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `UrbanVein_Orders_Manifest_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Orders manifest exported to CSV!', 'success');
  };

  // Derived Analytics Metrics
  const totalRevenue = orders
    .filter(o => o.payment_status === 'captured' || o.payment_status === 'paid' || o.status === 'delivered')
    .reduce((acc, o) => acc + (o.total_amount || 0), 0);

  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter(o => o.status === 'pending' || o.status === 'processing').length;
  const deliveredOrdersCount = orders.filter(o => o.status === 'delivered').length;
  const avgOrderValue = totalOrdersCount > 0 ? Math.round(totalRevenue / (totalOrdersCount || 1)) : 0;

  // Filtered Orders
  const filteredOrders = orders.filter(o => {
    const matchesSearch = 
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.shipping_address && o.shipping_address.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (o.phone && o.phone.includes(searchQuery));

    if (statusFilter === 'all') return matchesSearch;
    if (statusFilter === 'paid') return matchesSearch && (o.payment_status === 'captured' || o.payment_status === 'paid');
    if (statusFilter === 'pending') return matchesSearch && (o.status === 'pending' || o.status === 'processing');
    if (statusFilter === 'shipped') return matchesSearch && o.status === 'shipped';
    if (statusFilter === 'delivered') return matchesSearch && o.status === 'delivered';
    return matchesSearch;
  });

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark ? 'bg-[#0a0a0a] text-white selection:bg-red-600/30' : 'bg-zinc-50 text-zinc-900 selection:bg-red-500/20'
    } flex`}>
      
      {/* SIDEBAR */}
      <aside className={`w-64 border-r ${
        isDark ? 'bg-[#0f0f0f] border-zinc-900' : 'bg-white border-zinc-200 shadow-sm'
      } hidden lg:flex flex-col justify-between transition-colors`}>
        <div>
          {/* Logo Header */}
          <div className={`h-20 border-b ${isDark ? 'border-zinc-900' : 'border-zinc-200'} flex items-center px-6 gap-3`}>
            <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center text-white font-black text-lg shadow-[0_0_15px_rgba(220,38,38,0.4)]">
              UV
            </div>
            <div>
              <h1 className="font-black tracking-wider uppercase text-sm">Urban Vein</h1>
              <p className="text-[9px] font-black uppercase tracking-widest text-red-500">HQ Control Panel</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            <button className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              isDark ? 'bg-red-600/10 text-red-500 border border-red-900/30' : 'bg-red-50 text-red-600 border border-red-200'
            }`}>
              <BarChart3 size={16} />
              Live Dashboard
            </button>
            <Link href="/#shop" target="_blank" className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
              isDark ? 'text-zinc-400 hover:text-white hover:bg-zinc-900' : 'text-zinc-600 hover:text-black hover:bg-zinc-100'
            }`}>
              <ShoppingCart size={16} />
              Live Storefront
              <ExternalLink size={12} className="ml-auto opacity-50" />
            </Link>
          </nav>
        </div>

        {/* System Footer Status */}
        <div className={`p-5 border-t ${isDark ? 'border-zinc-900 text-zinc-600' : 'border-zinc-200 text-zinc-400'} text-[10px] font-bold uppercase tracking-widest space-y-1`}>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span>Supabase Sync: Active</span>
          </div>
          <p className="text-[9px] opacity-70">&copy; URBAN VEIN ENTERPRISE 2026</p>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        
        {/* TOP BAR */}
        <header className={`h-20 border-b ${
          isDark ? 'bg-[#0f0f0f]/80 border-zinc-900' : 'bg-white/80 border-zinc-200 shadow-sm'
        } backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-6 lg:px-10 transition-colors`}>
          
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-black uppercase tracking-tight">HQ Management</h2>
            <span className="hidden sm:inline-block text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-red-600/10 text-red-500 border border-red-900/30">
              Live Realtime Feed
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Sync Button */}
            <button
              onClick={() => fetchOrders(true)}
              disabled={refreshing}
              className={`p-2.5 rounded-xl border transition-all ${
                isDark 
                  ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700' 
                  : 'bg-zinc-100 border-zinc-200 text-zinc-700 hover:bg-zinc-200'
              }`}
              title="Sync Database Now"
            >
              <RefreshCw size={16} className={refreshing ? 'animate-spin text-red-500' : ''} />
            </button>

            {/* DAY & NIGHT THEME TOGGLE BUTTON */}
            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${
                isDark 
                  ? 'bg-zinc-900 border-zinc-800 text-yellow-400 hover:border-yellow-400/50' 
                  : 'bg-zinc-100 border-zinc-300 text-zinc-800 hover:border-zinc-400'
              }`}
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
              <span className="hidden sm:inline">{isDark ? 'Light Studio' : 'Dark Cyber'}</span>
            </button>

            {/* CSV Manifest Download */}
            <button
              onClick={exportCSV}
              className="bg-red-600 hover:bg-red-500 text-white px-4 py-2.5 rounded-xl font-black uppercase text-xs tracking-widest flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(220,38,38,0.3)] active:scale-95"
            >
              <Download size={14} />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
          </div>
        </header>

        {/* DASHBOARD BODY */}
        <div className="p-6 lg:p-10 space-y-8 max-w-[1600px] w-full mx-auto">
          
          {/* ANALYTICS STAT CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Total Revenue */}
            <div className={`p-6 rounded-3xl border relative overflow-hidden transition-all ${
              isDark ? 'bg-[#0f0f0f] border-zinc-900 hover:border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Gross Sales Revenue</span>
                <div className="w-10 h-10 rounded-2xl bg-green-500/10 text-green-500 flex items-center justify-center">
                  <DollarSign size={20} />
                </div>
              </div>
              <p className="text-3xl font-black tracking-tight mb-1">₹{totalRevenue.toLocaleString()}</p>
              <div className="flex items-center gap-1.5 text-xs text-green-500 font-bold">
                <TrendingUp size={14} /> 100% Verified via Razorpay
              </div>
            </div>

            {/* Total Orders */}
            <div className={`p-6 rounded-3xl border relative overflow-hidden transition-all ${
              isDark ? 'bg-[#0f0f0f] border-zinc-900 hover:border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Total Customer Orders</span>
                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <ShoppingCart size={20} />
                </div>
              </div>
              <p className="text-3xl font-black tracking-tight mb-1">{totalOrdersCount}</p>
              <p className="text-xs text-zinc-500 font-medium">{deliveredOrdersCount} Successfully Delivered</p>
            </div>

            {/* Pending Shipments */}
            <div className={`p-6 rounded-3xl border relative overflow-hidden transition-all ${
              isDark ? 'bg-[#0f0f0f] border-zinc-900 hover:border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Pending Shipments</span>
                <div className="w-10 h-10 rounded-2xl bg-yellow-500/10 text-yellow-500 flex items-center justify-center">
                  <Truck size={20} />
                </div>
              </div>
              <p className="text-3xl font-black tracking-tight mb-1 text-yellow-500">{pendingOrdersCount}</p>
              <p className="text-xs text-zinc-500 font-medium">Ready for Courier Dispatch</p>
            </div>

            {/* Average Order Value */}
            <div className={`p-6 rounded-3xl border relative overflow-hidden transition-all ${
              isDark ? 'bg-[#0f0f0f] border-zinc-900 hover:border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Avg Order Value (AOV)</span>
                <div className="w-10 h-10 rounded-2xl bg-red-600/10 text-red-500 flex items-center justify-center">
                  <BarChart3 size={20} />
                </div>
              </div>
              <p className="text-3xl font-black tracking-tight mb-1">₹{avgOrderValue.toLocaleString()}</p>
              <p className="text-xs text-zinc-500 font-medium">Per Customer Checkout</p>
            </div>

          </div>

          {/* SEARCH BAR & FILTER TABS */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
              <input
                type="text"
                placeholder="Search Order ID, Phone, Address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-11 pr-4 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider border focus:outline-none transition-all ${
                  isDark 
                    ? 'bg-[#0f0f0f] border-zinc-800 text-white focus:border-red-600 placeholder:text-zinc-600' 
                    : 'bg-white border-zinc-300 text-black focus:border-red-600 placeholder:text-zinc-400 shadow-sm'
                }`}
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
              {[
                { id: 'all', label: 'All Orders' },
                { id: 'paid', label: 'Paid Only' },
                { id: 'pending', label: 'Processing' },
                { id: 'shipped', label: 'Shipped' },
                { id: 'delivered', label: 'Delivered' }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setStatusFilter(f.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all border ${
                    statusFilter === f.id
                      ? 'bg-red-600 text-white border-red-600 shadow-md'
                      : isDark
                        ? 'bg-[#0f0f0f] text-zinc-400 border-zinc-800 hover:text-white'
                        : 'bg-white text-zinc-600 border-zinc-200 hover:text-black shadow-sm'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

          </div>

          {/* ORDERS TABLE */}
          <div className={`rounded-3xl border overflow-hidden transition-all ${
            isDark ? 'bg-[#0f0f0f] border-zinc-900' : 'bg-white border-zinc-200 shadow-md'
          }`}>
            <div className={`p-6 border-b flex items-center justify-between ${
              isDark ? 'border-zinc-900 bg-zinc-900/30' : 'border-zinc-200 bg-zinc-50'
            }`}>
              <div className="flex items-center gap-3">
                <Package size={18} className="text-red-500" />
                <h3 className="font-black uppercase tracking-wider text-sm">Customer Orders Table</h3>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                Showing {filteredOrders.length} of {orders.length} Entries
              </span>
            </div>

            {loading ? (
              <div className="py-20 text-center space-y-3">
                <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Fetching Live Orders from Database...</p>
              </div>
            ) : filteredOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className={`border-b text-[10px] font-black uppercase tracking-widest ${
                      isDark ? 'border-zinc-900 text-zinc-500' : 'border-zinc-200 text-zinc-400'
                    }`}>
                      <th className="py-4 px-6">Order Reference</th>
                      <th className="py-4 px-6">Timestamp</th>
                      <th className="py-4 px-6">Customer & Phone</th>
                      <th className="py-4 px-6">Shipping Address</th>
                      <th className="py-4 px-6">Total Amount</th>
                      <th className="py-4 px-6">Payment</th>
                      <th className="py-4 px-6">Current Status</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? 'divide-zinc-900/80' : 'divide-zinc-100'}`}>
                    {filteredOrders.map(order => {
                      const isExpanded = expandedOrderId === order.id;
                      return (
                        <React.Fragment key={order.id}>
                          <tr className={`transition-colors ${
                            isDark ? 'hover:bg-zinc-900/40' : 'hover:bg-zinc-50'
                          }`}>
                            {/* Order Reference */}
                            <td className="py-5 px-6">
                              <p className="font-black uppercase tracking-wider text-red-500">
                                ORD-{order.id.slice(0, 8).toUpperCase()}
                              </p>
                              <span className="text-[9px] text-zinc-500 font-mono">
                                {order.id}
                              </span>
                            </td>

                            {/* Timestamp */}
                            <td className="py-5 px-6 font-bold whitespace-nowrap">
                              {new Date(order.created_at).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </td>

                            {/* Phone */}
                            <td className="py-5 px-6">
                              <p className="font-bold">{order.phone || 'Phone not provided'}</p>
                              <span className="text-[9px] text-zinc-500 font-bold uppercase">
                                {order.payment_method || 'Razorpay'}
                              </span>
                            </td>

                            {/* Shipping Address */}
                            <td className="py-5 px-6 max-w-xs">
                              <p className="font-medium truncate text-zinc-400">
                                {order.shipping_address || 'Provided at checkout'}
                              </p>
                            </td>

                            {/* Amount */}
                            <td className="py-5 px-6 font-black text-sm text-white">
                              <span className={isDark ? 'text-white' : 'text-zinc-900'}>
                                ₹{order.total_amount?.toLocaleString()}
                              </span>
                            </td>

                            {/* Payment Badge */}
                            <td className="py-5 px-6">
                              <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                                order.payment_status === 'captured' || order.payment_status === 'paid'
                                  ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                  : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                              }`}>
                                {order.payment_status === 'captured' || order.payment_status === 'paid' ? '✓ Paid' : 'Pending'}
                              </span>
                            </td>

                            {/* Status Selector Dropdown */}
                            <td className="py-5 px-6">
                              <select
                                value={order.status || 'pending'}
                                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border focus:outline-none cursor-pointer ${
                                  order.status === 'delivered' ? 'bg-green-500/10 text-green-500 border-green-500/30' :
                                  order.status === 'shipped' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
                                  order.status === 'processing' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30' :
                                  'bg-red-500/10 text-red-500 border-red-500/30'
                                }`}
                              >
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </td>

                            {/* Actions */}
                            <td className="py-5 px-6 text-right whitespace-nowrap">
                              <button
                                onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                                className="text-xs font-bold text-red-500 hover:text-red-400 uppercase tracking-widest transition-colors inline-flex items-center gap-1"
                              >
                                {isExpanded ? 'Hide' : 'Inspect'}
                                <ChevronDown size={14} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                              </button>
                            </td>
                          </tr>

                          {/* Expanded Order Drawer */}
                          {isExpanded && (
                            <tr>
                              <td colSpan={8} className={`p-6 ${isDark ? 'bg-zinc-900/50' : 'bg-zinc-50'}`}>
                                <div className="space-y-4 max-w-4xl">
                                  <h4 className="text-xs font-black uppercase tracking-widest text-red-500">Order Items Manifest</h4>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                    {order.order_items && order.order_items.length > 0 ? (
                                      order.order_items.map((item: any, idx: number) => (
                                        <div key={idx} className={`p-4 rounded-2xl border text-xs ${
                                          isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'
                                        }`}>
                                          <p className="font-bold text-sm mb-1">Product #{item.product_id}</p>
                                          <p className="text-[10px] text-zinc-500 font-bold uppercase">Size: {item.size} • Qty: {item.quantity}</p>
                                          <p className="font-black text-red-500 mt-2">₹{(item.price * item.quantity).toLocaleString()}</p>
                                        </div>
                                      ))
                                    ) : (
                                      <p className="text-xs text-zinc-500 italic">No individual item details recorded.</p>
                                    )}
                                  </div>

                                  <div className="pt-3 flex items-center gap-6 text-[10px] font-bold uppercase text-zinc-500">
                                    <span>Razorpay Payment ID: <strong className="text-white font-mono">{order.razorpay_payment_id || 'N/A'}</strong></span>
                                    <span>Razorpay Order ID: <strong className="text-white font-mono">{order.razorpay_order_id || 'N/A'}</strong></span>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-20 text-center space-y-2">
                <Package size={48} className="mx-auto text-zinc-700" />
                <p className="font-bold text-sm text-zinc-500">No orders match your filter criteria.</p>
              </div>
            )}
          </div>

        </div>
      </main>

    </div>
  );
}
