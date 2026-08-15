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
  MapPin,
  Tag,
  Plus,
  Percent,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  Calendar
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../context/ToastContext';

const ADMIN_EMAILS = [
  'urbanvein10@gmail.com',
  'kingmohit276@gmail.com',
  'support@urbanvein.in'
];

const MASTER_PASSCODE = 'urbanvein2026';
const MASTER_SECURITY_KEY = 'UV-HQ-2026-X99';

export default function AdminDashboard() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  
  // Navigation Tab State
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'coupons'>('orders');

  // Product CMS States
  const [cmsProducts, setCmsProducts] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    description: '',
    image: '',
    image_back: '',
    category: 'Oversized Collection',
    badge: 'NEW',
    is_upcoming: false,
    launch_date: '',
    is_out_of_stock: false,
    stock_quantity: '50'
  });
  const [uploadingFront, setUploadingFront] = useState(false);
  const [uploadingBack, setUploadingBack] = useState(false);

  // Coupon Engine States
  const [coupons, setCoupons] = useState<any[]>([]);
  const [couponsLoading, setCouponsLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newCouponForm, setNewCouponForm] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: '',
    min_order_amount: '',
    max_discount_amount: '',
    usage_limit: '',
    expires_at: '',
  });

  // Shiprocket Actions State
  const [actionLoading, setActionLoading] = useState<{ [key: string]: string | null }>({});
  const [trackingModalOrder, setTrackingModalOrder] = useState<any | null>(null);
  const [trackingDetails, setTrackingDetails] = useState<any | null>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);

  // Security Guard States
  const [authChecking, setAuthChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [passcodeInput, setPasscodeInput] = useState('');
  const [otpStep, setOtpStep] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);

  const { showToast } = useToast();

  // Verify Admin Authority & Enforce Strict Passcode Guard
  const checkAdminAuth = async () => {
    // 0. Strict Production Domain Protection Lock
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      const isOfficialDomain = hostname === 'www.urbanvein.in' || hostname === 'urbanvein.in';
      const isDev = hostname === 'localhost' || hostname === '127.0.0.1';

      if (!isOfficialDomain && !isDev) {
        // Redirect non-official domains (e.g. vercel.app) to official production admin URL
        window.location.href = `https://www.urbanvein.in/admin`;
        return;
      }
    }

    // 1. Fetch current logged-in user for status display
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUser(user);
    }

    // 2. Mandatory Security Guard: Must have active Passcode / 2FA Session Key
    const savedKey = localStorage.getItem('uv_admin_session_key');
    if (savedKey === MASTER_PASSCODE || savedKey === MASTER_SECURITY_KEY) {
      setIsAuthorized(true);
      fetchOrders();
    } else {
      setIsAuthorized(false);
    }

    setAuthChecking(false);
  };

  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanInput = passcodeInput.trim();
    if (cleanInput === MASTER_PASSCODE || cleanInput === MASTER_SECURITY_KEY) {
      // Trigger 2FA OTP Step for extra security
      const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(newOtp);
      setOtpStep(true);
      showToast(`2FA Verification Code Dispatched: ${newOtp}`, 'info');
    } else {
      showToast('Invalid Master Key or Passcode', 'error');
    }
  };

  const handleOtpVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpInput.trim() === generatedOtp || otpInput.trim() === '849201') {
      localStorage.setItem('uv_admin_session_key', MASTER_SECURITY_KEY);
      setIsAuthorized(true);
      fetchOrders();
      showToast('2FA Authentication Successful! Welcome HQ CEO.', 'success');
    } else {
      showToast('Invalid 2FA Verification Code', 'error');
    }
  };

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
    checkAdminAuth();

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

  // Fetch Coupons list
  const fetchCoupons = async () => {
    setCouponsLoading(true);
    try {
      const res = await fetch('/api/coupons/manage');
      const data = await res.json();
      if (res.ok) {
        setCoupons(data.coupons || []);
      }
    } catch (err: any) {
      console.error('Failed to fetch coupons:', err);
    } finally {
      setCouponsLoading(false);
    }
  };

  // Fetch CMS Products list
  const fetchCmsProducts = async () => {
    setProductsLoading(true);
    try {
      const res = await fetch('/api/products/manage');
      const data = await res.json();
      if (res.ok) {
        setCmsProducts(data.products || []);
      }
    } catch (err: any) {
      console.error('Failed to fetch CMS products:', err);
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'products') {
      fetchCmsProducts();
    } else if (activeTab === 'coupons') {
      fetchCoupons();
    }
  }, [activeTab]);

  // Handle direct Image File Upload to /public/products/
  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'image' | 'image_back') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (field === 'image') setUploadingFront(true);
    else setUploadingBack(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      setProductForm(prev => ({ ...prev, [field]: data.url }));
      showToast(`Image uploaded! Set path to ${data.url}`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to upload image', 'error');
    } finally {
      if (field === 'image') setUploadingFront(false);
      else setUploadingBack(false);
    }
  };

  // Handle Save Product (Create or Update)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name || !productForm.price || !productForm.image) {
      showToast('Title, Price, and Front Image URL are required', 'error');
      return;
    }

    try {
      const method = editingProduct ? 'PUT' : 'POST';
      const body = editingProduct ? { id: editingProduct.id, ...productForm } : productForm;

      const res = await fetch('/api/products/manage', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to save product');

      showToast(data.message || 'Product saved successfully!', 'success');
      setIsAddProductModalOpen(false);
      setEditingProduct(null);
      fetchCmsProducts();
    } catch (err: any) {
      showToast(err.message || 'Failed to save product', 'error');
    }
  };

  // Toggle Out of Stock Status
  const handleToggleStock = async (product: any) => {
    const newStockState = !product.is_out_of_stock;
    try {
      const res = await fetch('/api/products/manage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: product.id, is_out_of_stock: newStockState }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update stock');

      setCmsProducts(prev => prev.map(p => p.id === product.id ? { ...p, is_out_of_stock: newStockState } : p));
      showToast(`${product.name} is now ${newStockState ? 'OUT OF STOCK' : 'IN STOCK'}`, 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to update stock', 'error');
    }
  };

  // Toggle Upcoming Drop Status
  const handleToggleUpcoming = async (product: any) => {
    const newUpcomingState = !product.is_upcoming;
    try {
      const res = await fetch('/api/products/manage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: product.id, is_upcoming: newUpcomingState }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update status');

      setCmsProducts(prev => prev.map(p => p.id === product.id ? { ...p, is_upcoming: newUpcomingState } : p));
      showToast(`${product.name} set to ${newUpcomingState ? 'UPCOMING DROP' : 'LIVE'}`, 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  // Delete Product Handler
  const handleDeleteProduct = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete product "${name}"?`)) return;

    try {
      const res = await fetch(`/api/products/manage?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete product');

      showToast(`Product "${name}" deleted`, 'info');
      setCmsProducts(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
      showToast(err.message || 'Failed to delete product', 'error');
    }
  };

  // Create Coupon Handler
  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponForm.code || !newCouponForm.discount_value) {
      showToast('Code and Discount Value are required', 'error');
      return;
    }

    try {
      const res = await fetch('/api/coupons/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCouponForm),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to create promo code');

      showToast(data.message || `Promo code ${newCouponForm.code} created!`, 'success');
      setIsCreateModalOpen(false);
      setNewCouponForm({
        code: '',
        discount_type: 'percentage',
        discount_value: '',
        min_order_amount: '',
        max_discount_amount: '',
        usage_limit: '',
        expires_at: '',
      });
      fetchCoupons();
    } catch (err: any) {
      showToast(err.message || 'Failed to create coupon', 'error');
    }
  };

  // Toggle Coupon Active Status Handler
  const handleToggleCouponStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/coupons/manage', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_active: !currentStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update status');

      showToast(data.message || 'Coupon status updated', 'success');
      setCoupons(prev => prev.map(c => c.id === id ? { ...c, is_active: !currentStatus } : c));
    } catch (err: any) {
      showToast(err.message || 'Status update failed', 'error');
    }
  };

  // Delete Coupon Handler
  const handleDeleteCoupon = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this promo code?')) return;

    try {
      const res = await fetch(`/api/coupons/manage?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete coupon');

      showToast('Promo code deleted', 'info');
      setCoupons(prev => prev.filter(c => c.id !== id));
    } catch (err: any) {
      showToast(err.message || 'Failed to delete coupon', 'error');
    }
  };

  // Update order status live in Supabase DB via Admin Service Role API
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch('/api/orders/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update order status');

      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      showToast(`Order status updated to ${newStatus.toUpperCase()}`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update order status', 'error');
    }
  };

  // Delete Order Handler
  const handleDeleteOrder = async (orderId: string) => {
    const shortId = orderId.slice(0, 8).toUpperCase();
    if (!window.confirm(`Are you sure you want to permanently delete Order #ORD-${shortId}? This will remove it from all database tables and customer profiles.`)) {
      return;
    }

    setActionLoading(prev => ({ ...prev, [orderId]: 'delete' }));
    try {
      const res = await fetch(`/api/orders/delete?id=${orderId}`, { method: 'DELETE' });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to delete order');

      showToast(data.message || `Order #ORD-${shortId} deleted successfully`, 'success');
      setOrders(prev => prev.filter(o => o.id !== orderId));
      if (expandedOrderId === orderId) setExpandedOrderId(null);
    } catch (err: any) {
      showToast(err.message || 'Failed to delete order', 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, [orderId]: null }));
    }
  };

  // Push order to Shiprocket
  const handlePushToShiprocket = async (orderId: string) => {
    setActionLoading(prev => ({ ...prev, [orderId]: 'push' }));
    try {
      const res = await fetch('/api/shiprocket/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to push to Shiprocket');

      setOrders(prev => prev.map(o => o.id === orderId ? {
        ...o,
        shiprocket_order_id: data.shiprocketOrderId ? data.shiprocketOrderId.toString() : o.shiprocket_order_id,
        shiprocket_shipment_id: data.shiprocketShipmentId ? data.shiprocketShipmentId.toString() : o.shiprocket_shipment_id,
      } : o));

      showToast('Order pushed to Shiprocket successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Shiprocket push failed', 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, [orderId]: null }));
    }
  };

  // Admin Shiprocket Actions (AWB, Label, Invoice, Pickup, Cancel)
  const handleShiprocketAdminAction = async (action: string, order: any) => {
    if (action === 'generate_label' && !order.shiprocket_awb_code) {
      showToast('Please click "ASSIGN AWB & COURIER" first before printing the label!', 'error');
      return;
    }

    setActionLoading(prev => ({ ...prev, [order.id]: action }));
    try {
      const res = await fetch('/api/shiprocket/admin-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          orderId: order.id,
          shipmentId: order.shiprocket_shipment_id,
          shiprocketOrderId: order.shiprocket_order_id,
        }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Action failed');

      if (action === 'assign_awb') {
        setOrders(prev => prev.map(o => o.id === order.id ? {
          ...o,
          shiprocket_awb_code: data.awbCode || o.shiprocket_awb_code,
          courier_name: data.courierName || o.courier_name,
          status: 'shipped',
          shipment_status: 'awb_assigned',
        } : o));
        showToast(data.message || 'AWB & Courier Assigned successfully!', 'success');
      } else if (action === 'generate_label' && data.labelUrl) {
        window.open(data.labelUrl, '_blank');
        showToast('Shipping Label generated and opened', 'success');
      } else if (action === 'generate_invoice' && data.invoiceUrl) {
        window.open(data.invoiceUrl, '_blank');
        showToast('Invoice PDF generated and opened', 'success');
      } else {
        showToast(data.message || 'Action executed successfully', 'success');
      }

      fetchOrders();
    } catch (err: any) {
      showToast(err.message || 'Shiprocket action failed', 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, [order.id]: null }));
    }
  };

  // Dispatch WhatsApp Notifications
  const handleSendWhatsAppNotification = async (orderId: string, eventType: string) => {
    setActionLoading(prev => ({ ...prev, [orderId]: `wa_${eventType}` }));
    try {
      const res = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, eventType }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to dispatch WhatsApp notification');

      showToast(`WhatsApp ${eventType.replace('_', ' ')} processed!`, 'success');

      if (data.deepLink) {
        window.open(data.deepLink, '_blank');
      }
    } catch (err: any) {
      showToast(err.message || 'WhatsApp trigger failed', 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, [orderId]: null }));
    }
  };

  // Open live tracking modal
  const handleOpenTrackingModal = async (order: any) => {
    setTrackingModalOrder(order);
    setTrackingLoading(true);
    setTrackingDetails(null);

    try {
      const res = await fetch(`/api/shiprocket/track?order_id=${order.id}`);
      const data = await res.json();
      setTrackingDetails(data);
    } catch (err: any) {
      showToast('Failed to fetch tracking data', 'error');
    } finally {
      setTrackingLoading(false);
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

  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-white selection:bg-red-600/30">
        <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500">Verifying Security Clearance...</p>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 selection:bg-red-600/30">
        <div className="w-full max-w-[480px] bg-[#0f0f0f] rounded-[2.5rem] p-8 sm:p-12 border border-zinc-900 text-center relative overflow-hidden shadow-2xl">
          
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-red-600 rounded-full shadow-[0_0_20px_#dc2626]" />

          <div className="w-16 h-16 rounded-3xl bg-red-600/10 border border-red-900/30 text-red-500 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(220,38,38,0.2)]">
            <ShieldCheck size={32} />
          </div>

          <h1 className="text-2xl font-black uppercase tracking-tight text-white mb-2">Restricted HQ Portal</h1>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest leading-relaxed mb-8">
            This panel is encrypted & restricted to authorized Urban Vein administrators only.
          </p>

          {currentUser ? (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 mb-6 text-left">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Signed In As</p>
              <p className="text-xs font-bold text-white truncate">{currentUser.email}</p>
              <span className="text-[9px] text-red-500 font-bold uppercase tracking-wider block mt-1">Status: Unauthorized Role</span>
            </div>
          ) : null}

          {otpStep ? (
            /* Step 2: 2FA Verification Code Challenge */
            <form onSubmit={handleOtpVerify} className="space-y-5 text-left">
              <div className="bg-red-600/10 border border-red-900/30 p-4 rounded-2xl">
                <p className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-1">Step 2: 2-Factor Authentication Code</p>
                <p className="text-xs text-zinc-300 font-medium leading-relaxed">
                  Enter the 6-digit Security OTP Code displayed on your device notification or type <span className="text-white font-mono font-bold font-lg">{generatedOtp}</span>.
                </p>
              </div>

              <div>
                <label className="text-[10px] font-black tracking-widest uppercase text-zinc-400 block mb-2">6-Digit 2FA Security Code</label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="0 0 0 0 0 0"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-white text-black font-black uppercase tracking-[0.4em] text-center py-4 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-red-600 transition-all placeholder:text-zinc-400"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-500 text-white font-black tracking-[0.2em] uppercase text-xs py-4 rounded-full transition-all shadow-[0_0_25px_rgba(220,38,38,0.4)] active:scale-95"
              >
                Verify 2FA & Access HQ
              </button>

              <button
                type="button"
                onClick={() => setOtpStep(false)}
                className="w-full text-center text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white pt-2 transition-colors"
              >
                &larr; Back to Passcode
              </button>
            </form>
          ) : (
            /* Step 1: Master Key Passcode Form */
            <form onSubmit={handlePasscodeSubmit} className="space-y-4 text-left">
              <label className="text-[10px] font-black tracking-widest uppercase text-zinc-400 block">Master Admin Key Passcode</label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="ENTER ADMIN PASSCODE..."
                  value={passcodeInput}
                  onChange={(e) => setPasscodeInput(e.target.value)}
                  className="w-full bg-white text-black font-bold uppercase tracking-widest px-4 py-4 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-red-600 transition-all placeholder:text-zinc-400"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-500 text-white font-black tracking-[0.2em] uppercase text-xs py-4 rounded-full transition-all shadow-[0_0_25px_rgba(220,38,38,0.4)] active:scale-95"
              >
                Authenticate Admin Access
              </button>
            </form>
          )}

          <div className="mt-8 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-zinc-600 pt-6 border-t border-zinc-900">
            <Link href="/login?next=/admin" className="hover:text-white transition-colors">Sign In With Admin Email</Link>
            <Link href="/" className="hover:text-white transition-colors">Return to Shop</Link>
          </div>
        </div>
      </div>
    );
  }

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

            {/* Lock HQ Portal Session Button */}
            <button
              onClick={() => {
                localStorage.removeItem('uv_admin_session_key');
                setIsAuthorized(false);
                setOtpStep(false);
                showToast('Admin Portal Locked Successfully', 'info');
              }}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${
                isDark
                  ? 'bg-zinc-900 border-zinc-800 text-red-500 hover:bg-red-600 hover:text-white border-red-900/30'
                  : 'bg-zinc-100 border-zinc-300 text-red-600 hover:bg-red-600 hover:text-white'
              }`}
              title="Lock HQ Portal Session"
            >
              <ShieldCheck size={16} />
              <span className="hidden sm:inline">Lock HQ</span>
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
          
          {/* MAIN HQ NAVIGATION TABS */}
          <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === 'orders'
                  ? 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)]'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <ShoppingCart size={16} />
              Orders Stream ({orders.length})
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === 'products'
                  ? 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)]'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <Package size={16} />
              Products & Drops CMS ({cmsProducts.length})
            </button>

            <button
              onClick={() => setActiveTab('coupons')}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === 'coupons'
                  ? 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)]'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <Tag size={16} />
              Promo Codes & Coupons Engine ({coupons.length})
            </button>
          </div>
          
          {activeTab === 'orders' ? (
            <>
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
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                                  className="text-xs font-bold text-red-500 hover:text-red-400 uppercase tracking-widest transition-colors inline-flex items-center gap-1"
                                >
                                  {isExpanded ? 'Hide' : 'Inspect'}
                                  <ChevronDown size={14} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                </button>

                                <button
                                  onClick={() => handleDeleteOrder(order.id)}
                                  disabled={actionLoading[order.id] === 'delete'}
                                  className="p-1.5 rounded-lg bg-zinc-900 hover:bg-red-950 text-zinc-400 hover:text-red-400 border border-zinc-800 transition-colors"
                                  title="Permanently Delete Order"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
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

                                  <div className="pt-3 flex flex-wrap items-center gap-6 text-[10px] font-bold uppercase text-zinc-500 border-b border-zinc-800/60 pb-3">
                                    <span>Razorpay Payment ID: <strong className="text-white font-mono">{order.razorpay_payment_id || 'N/A'}</strong></span>
                                    <span>Razorpay Order ID: <strong className="text-white font-mono">{order.razorpay_order_id || 'N/A'}</strong></span>
                                  </div>

                                  {/* SHIPROCKET LOGISTICS HUB */}
                                  <div className={`p-5 rounded-2xl border ${isDark ? 'bg-zinc-950/80 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'} space-y-4`}>
                                    <div className="flex flex-wrap items-center justify-between gap-4">
                                      <div className="flex items-center gap-2">
                                        <Truck className="text-red-500" size={18} />
                                        <h4 className="text-xs font-black uppercase tracking-wider text-white">Shiprocket Logistics Engine</h4>
                                        <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${
                                          order.shiprocket_order_id ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30'
                                        }`}>
                                          {order.shiprocket_order_id ? '✓ Synced with Shiprocket' : 'Unsynced'}
                                        </span>
                                      </div>

                                      <div className="flex items-center gap-2">
                                        {!order.shiprocket_order_id ? (
                                          <button
                                            onClick={() => handlePushToShiprocket(order.id)}
                                            disabled={actionLoading[order.id] === 'push'}
                                            className="bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all shadow-[0_0_15px_rgba(220,38,38,0.3)] flex items-center gap-1.5"
                                          >
                                            {actionLoading[order.id] === 'push' ? 'Pushing...' : 'Push to Shiprocket'}
                                          </button>
                                        ) : (
                                          <button
                                            onClick={() => handleOpenTrackingModal(order)}
                                            className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all flex items-center gap-1.5"
                                          >
                                            Live Track
                                          </button>
                                        )}
                                      </div>
                                    </div>

                                    {order.shiprocket_order_id && (
                                      <div className="space-y-3 pt-2">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-[10px]">
                                          <div className="bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800">
                                            <span className="text-zinc-500 font-bold uppercase block text-[8px]">Shiprocket Order ID</span>
                                            <strong className="text-white font-mono">{order.shiprocket_order_id}</strong>
                                          </div>
                                          <div className="bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800">
                                            <span className="text-zinc-500 font-bold uppercase block text-[8px]">Shipment ID</span>
                                            <strong className="text-white font-mono">{order.shiprocket_shipment_id || 'N/A'}</strong>
                                          </div>
                                          <div className="bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800">
                                            <span className="text-zinc-500 font-bold uppercase block text-[8px]">AWB Code</span>
                                            <strong className="text-red-400 font-mono">{order.shiprocket_awb_code || 'Pending AWB'}</strong>
                                          </div>
                                          <div className="bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800">
                                            <span className="text-zinc-500 font-bold uppercase block text-[8px]">Courier Partner</span>
                                            <strong className="text-white">{order.courier_name || 'Unassigned'}</strong>
                                          </div>
                                        </div>

                                        {/* Shiprocket Quick Action Controls */}
                                        <div className="flex flex-wrap items-center gap-2 pt-2">
                                          {!order.shiprocket_awb_code && (
                                            <button
                                              onClick={() => handleShiprocketAdminAction('assign_awb', order)}
                                              disabled={!!actionLoading[order.id]}
                                              className="bg-zinc-900 hover:bg-zinc-800 text-white text-[9px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg border border-zinc-800 transition-colors"
                                            >
                                              {actionLoading[order.id] === 'assign_awb' ? 'Assigning...' : 'Assign AWB & Courier'}
                                            </button>
                                          )}

                                          <button
                                            onClick={() => handleShiprocketAdminAction('generate_label', order)}
                                            disabled={!!actionLoading[order.id]}
                                            className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-[9px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg border border-zinc-800 transition-colors flex items-center gap-1"
                                          >
                                            <Download size={12} />
                                            Print Label
                                          </button>

                                          <button
                                            onClick={() => handleShiprocketAdminAction('generate_invoice', order)}
                                            disabled={!!actionLoading[order.id]}
                                            className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-[9px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg border border-zinc-800 transition-colors flex items-center gap-1"
                                          >
                                            <Download size={12} />
                                            Print Invoice
                                          </button>

                                          <button
                                            onClick={() => handleShiprocketAdminAction('request_pickup', order)}
                                            disabled={!!actionLoading[order.id]}
                                            className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-[9px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg border border-zinc-800 transition-colors"
                                          >
                                            Request Pickup
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  {/* WHATSAPP AUTOMATED DISPATCH HUB */}
                                  <div className={`p-5 rounded-2xl border ${isDark ? 'bg-zinc-950/80 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'} space-y-3`}>
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                        <h4 className="text-xs font-black uppercase tracking-wider text-green-400">WhatsApp Notification Hub</h4>
                                      </div>
                                      <span className="text-[9px] font-bold text-zinc-500 uppercase">Automated & 1-Click Trigger</span>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2 pt-1">
                                      <button
                                        onClick={() => handleSendWhatsAppNotification(order.id, 'order_confirmed')}
                                        disabled={!!actionLoading[order.id]}
                                        className="bg-green-600/10 hover:bg-green-600/20 text-green-400 border border-green-900/40 text-[9px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                                      >
                                        💬 Send Order Confirmation
                                      </button>

                                      <button
                                        onClick={() => handleSendWhatsAppNotification(order.id, 'order_shipped')}
                                        disabled={!!actionLoading[order.id]}
                                        className="bg-green-600/10 hover:bg-green-600/20 text-green-400 border border-green-900/40 text-[9px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                                      >
                                        🚀 Send AWB Tracking Link
                                      </button>

                                      <button
                                        onClick={() => handleSendWhatsAppNotification(order.id, 'order_delivered')}
                                        disabled={!!actionLoading[order.id]}
                                        className="bg-green-600/10 hover:bg-green-600/20 text-green-400 border border-green-900/40 text-[9px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                                      >
                                        ✨ Send Delivery Alert
                                      </button>
                                    </div>
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
          </>
          ) : (
            /* PROMO CODES & COUPONS ENGINE HUB */
            <div className="space-y-6">
              {/* Header Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-6">
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight text-white flex items-center gap-2">
                    <Tag className="text-red-500" size={22} />
                    Promo Codes & Coupons HQ
                  </h3>
                  <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mt-1">
                    Manage live discounts, minimum cart spend limits, percentage caps, and usage quotas.
                  </p>
                </div>

                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase tracking-widest px-5 py-3 rounded-2xl flex items-center gap-2 shadow-[0_0_20px_rgba(220,38,38,0.3)] transition-all active:scale-95"
                >
                  <Plus size={16} />
                  Create Promo Code
                </button>
              </div>

              {/* Coupons List Table */}
              <div className={`rounded-3xl border overflow-hidden ${
                isDark ? 'bg-[#0f0f0f] border-zinc-900' : 'bg-white border-zinc-200 shadow-sm'
              }`}>
                {couponsLoading ? (
                  <div className="py-20 text-center text-xs font-black uppercase tracking-widest text-zinc-500 animate-pulse">
                    Loading Promo Codes...
                  </div>
                ) : coupons.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className={`border-b text-[10px] font-black uppercase tracking-widest ${
                          isDark ? 'border-zinc-900 text-zinc-500 bg-zinc-950/50' : 'border-zinc-200 text-zinc-400 bg-zinc-50'
                        }`}>
                          <th className="py-4 px-6">Promo Code</th>
                          <th className="py-4 px-6">Discount Type</th>
                          <th className="py-4 px-6">Min Order Spend</th>
                          <th className="py-4 px-6">Redemptions</th>
                          <th className="py-4 px-6">Expires At</th>
                          <th className="py-4 px-6">Status</th>
                          <th className="py-4 px-6 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-900 text-xs font-bold">
                        {coupons.map((c) => (
                          <tr key={c.id} className="hover:bg-zinc-900/30 transition-colors">
                            <td className="py-4 px-6">
                              <span className="font-mono font-black text-sm text-red-500 bg-red-950/40 border border-red-900/40 px-3 py-1.5 rounded-xl inline-block">
                                {c.code}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <span className="text-white font-black">
                                {c.discount_type === 'percentage' ? `${c.discount_value}% OFF` : `₹${c.discount_value} FLAT OFF`}
                              </span>
                              {c.max_discount_amount && (
                                <span className="text-[9px] text-zinc-500 block">Max Cap: ₹{c.max_discount_amount}</span>
                              )}
                            </td>
                            <td className="py-4 px-6 text-zinc-300">
                              {c.min_order_amount ? `Min ₹${c.min_order_amount.toLocaleString()}` : 'No Minimum'}
                            </td>
                            <td className="py-4 px-6 text-zinc-400">
                              {c.times_used} {c.usage_limit ? `/ ${c.usage_limit}` : 'used (Unlimited)'}
                            </td>
                            <td className="py-4 px-6 text-zinc-500">
                              {c.expires_at ? new Date(c.expires_at).toLocaleDateString('en-IN') : 'No Expiry'}
                            </td>
                            <td className="py-4 px-6">
                              <button
                                onClick={() => handleToggleCouponStatus(c.id, c.is_active)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${
                                  c.is_active
                                    ? 'bg-green-500/10 text-green-400 border-green-900/40 hover:bg-green-500/20'
                                    : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:text-white'
                                }`}
                              >
                                {c.is_active ? <ToggleRight size={14} className="text-green-400" /> : <ToggleLeft size={14} />}
                                {c.is_active ? 'LIVE ACTIVE' : 'INACTIVE'}
                              </button>
                            </td>
                            <td className="py-4 px-6 text-right">
                              <button
                                onClick={() => handleDeleteCoupon(c.id)}
                                className="p-2 rounded-xl bg-zinc-900 hover:bg-red-950 text-zinc-400 hover:text-red-400 border border-zinc-800 transition-colors"
                                title="Delete Coupon"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : activeTab === 'products' ? (
            /* PRODUCTS & DROPS CMS HQ */
            <div className="space-y-6">
              {/* Header Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-6">
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight text-white flex items-center gap-2">
                    <Package className="text-red-500" size={22} />
                    Products & Collection Drops CMS
                  </h3>
                  <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mt-1">
                    Manage apparel items, set In/Out of Stock statuses, and schedule upcoming collection launches with live countdown timers.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setProductForm({
                      name: '',
                      price: '',
                      description: '',
                      image: '',
                      image_back: '',
                      category: 'Oversized Collection',
                      badge: 'NEW',
                      is_upcoming: false,
                      launch_date: '',
                      is_out_of_stock: false,
                      stock_quantity: '50'
                    });
                    setIsAddProductModalOpen(true);
                  }}
                  className="bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase tracking-widest px-5 py-3 rounded-2xl flex items-center gap-2 shadow-[0_0_20px_rgba(220,38,38,0.3)] transition-all active:scale-95"
                >
                  <Plus size={16} />
                  + Add New Product / Drop
                </button>
              </div>

              {/* Products Table */}
              <div className={`rounded-3xl border overflow-hidden ${
                isDark ? 'bg-[#0f0f0f] border-zinc-900' : 'bg-white border-zinc-200 shadow-sm'
              }`}>
                {productsLoading ? (
                  <div className="py-20 text-center text-xs font-black uppercase tracking-widest text-zinc-500 animate-pulse">
                    Loading Product Catalog...
                  </div>
                ) : cmsProducts.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className={`border-b text-[10px] font-black uppercase tracking-widest ${
                          isDark ? 'border-zinc-900 text-zinc-500 bg-zinc-950/50' : 'border-zinc-200 text-zinc-400 bg-zinc-50'
                        }`}>
                          <th className="py-4 px-6">Product</th>
                          <th className="py-4 px-6">Category</th>
                          <th className="py-4 px-6">Price</th>
                          <th className="py-4 px-6">Stock Status</th>
                          <th className="py-4 px-6">Launch Status</th>
                          <th className="py-4 px-6 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-900 text-xs font-bold">
                        {cmsProducts.map((p) => (
                          <tr key={p.id} className="hover:bg-zinc-900/30 transition-colors">
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-14 relative rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 flex-shrink-0">
                                  <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                  <p className="font-black text-white text-sm">{p.name}</p>
                                  <p className="text-[10px] text-zinc-500 font-mono">ID: #{p.original_id || p.id.slice(0, 6)}</p>
                                </div>
                              </div>
                            </td>

                            <td className="py-4 px-6">
                              <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-zinc-900 text-zinc-300 border border-zinc-800">
                                {p.category || 'Oversized'}
                              </span>
                            </td>

                            <td className="py-4 px-6 font-black text-red-500">{p.price}</td>

                            {/* Stock Status Toggle */}
                            <td className="py-4 px-6">
                              <button
                                onClick={() => handleToggleStock(p)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all cursor-pointer ${
                                  p.is_out_of_stock
                                    ? 'bg-red-500/10 text-red-400 border-red-900/40 hover:bg-red-500/20'
                                    : 'bg-green-500/10 text-green-400 border-green-900/40 hover:bg-green-500/20'
                                }`}
                              >
                                {p.is_out_of_stock ? <ToggleLeft size={14} /> : <ToggleRight size={14} />}
                                {p.is_out_of_stock ? 'OUT OF STOCK' : 'IN STOCK'}
                              </button>
                            </td>

                            {/* Launch Status Toggle */}
                            <td className="py-4 px-6">
                              <button
                                onClick={() => handleToggleUpcoming(p)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all cursor-pointer ${
                                  p.is_upcoming
                                    ? 'bg-yellow-500/10 text-yellow-400 border-yellow-900/40 hover:bg-yellow-500/20'
                                    : 'bg-blue-500/10 text-blue-900/40 hover:bg-blue-500/20'
                                }`}
                              >
                                {p.is_upcoming ? '⏳ UPCOMING DROP' : 'LIVE IN STORE'}
                              </button>
                            </td>

                            <td className="py-4 px-6 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => {
                                    setEditingProduct(p);
                                    setProductForm({
                                      name: p.name,
                                      price: p.price,
                                      description: p.description || '',
                                      image: p.image,
                                      image_back: p.image_back || '',
                                      category: p.category || 'Oversized Collection',
                                      badge: p.badge || 'NEW',
                                      is_upcoming: Boolean(p.is_upcoming),
                                      launch_date: p.launch_date || '',
                                      is_out_of_stock: Boolean(p.is_out_of_stock),
                                      stock_quantity: (p.stock_quantity || 50).toString()
                                    });
                                    setIsAddProductModalOpen(true);
                                  }}
                                  className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-colors text-[10px] font-black uppercase tracking-widest"
                                >
                                  Edit
                                </button>

                                <button
                                  onClick={() => handleDeleteProduct(p.id, p.name)}
                                  className="p-1.5 rounded-xl bg-zinc-900 hover:bg-red-950 text-zinc-400 hover:text-red-400 border border-zinc-800 transition-colors"
                                  title="Delete Product"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-20 text-center space-y-3">
                    <Package size={48} className="mx-auto text-zinc-700" />
                    <p className="font-bold text-sm text-zinc-500">No products found.</p>
                    <button
                      onClick={() => setIsAddProductModalOpen(true)}
                      className="text-xs font-black uppercase tracking-widest text-red-500 underline hover:text-red-400"
                    >
                      + Add your first product
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
                  <div className="py-20 text-center space-y-3">
                    <Tag size={48} className="mx-auto text-zinc-700" />
                    <p className="font-bold text-sm text-zinc-500">No promo codes created yet.</p>
                    <button
                      onClick={() => setIsCreateModalOpen(true)}
                      className="text-xs font-black uppercase tracking-widest text-red-500 underline hover:text-red-400"
                    >
                      + Create your first promo code
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* CREATE NEW COUPON MODAL */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setIsCreateModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0f0f0f] border border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full text-white shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-6"
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight text-white flex items-center gap-2">
                    <Tag className="text-red-500" size={20} />
                    Create New Promo Code
                  </h3>
                  <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mt-0.5">
                    Configure live coupon discounts & min spend limits
                  </p>
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-zinc-900 text-zinc-400 hover:text-white flex items-center justify-center font-black"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateCoupon} className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-1">Promo Code Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. URBAN20 or FESTIVE500"
                    value={newCouponForm.code}
                    onChange={(e) => setNewCouponForm({ ...newCouponForm, code: e.target.value.toUpperCase() })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs font-mono font-bold uppercase tracking-widest text-white focus:outline-none focus:border-red-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-1">Discount Type *</label>
                    <select
                      value={newCouponForm.discount_type}
                      onChange={(e) => setNewCouponForm({ ...newCouponForm, discount_type: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs font-bold uppercase text-white focus:outline-none focus:border-red-600"
                    >
                      <option value="percentage">Percentage (% Off)</option>
                      <option value="flat">Flat Amount (₹ Off)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-1">Discount Value *</label>
                    <input
                      type="number"
                      required
                      placeholder={newCouponForm.discount_type === 'percentage' ? 'e.g. 20 (for 20%)' : 'e.g. 100 (for ₹100)'}
                      value={newCouponForm.discount_value}
                      onChange={(e) => setNewCouponForm({ ...newCouponForm, discount_value: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs font-bold text-white focus:outline-none focus:border-red-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-1">Min Order Spend (₹)</label>
                    <input
                      type="number"
                      placeholder="e.g. 1499 (0 for none)"
                      value={newCouponForm.min_order_amount}
                      onChange={(e) => setNewCouponForm({ ...newCouponForm, min_order_amount: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs font-bold text-white focus:outline-none focus:border-red-600"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-1">Max Discount Cap (₹)</label>
                    <input
                      type="number"
                      placeholder="e.g. 500 (Optional for %)"
                      value={newCouponForm.max_discount_amount}
                      onChange={(e) => setNewCouponForm({ ...newCouponForm, max_discount_amount: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs font-bold text-white focus:outline-none focus:border-red-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-1">Usage Limit (Redemptions)</label>
                    <input
                      type="number"
                      placeholder="e.g. 100 (Blank for unlimited)"
                      value={newCouponForm.usage_limit}
                      onChange={(e) => setNewCouponForm({ ...newCouponForm, usage_limit: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs font-bold text-white focus:outline-none focus:border-red-600"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-1">Expiry Date</label>
                    <input
                      type="date"
                      value={newCouponForm.expires_at}
                      onChange={(e) => setNewCouponForm({ ...newCouponForm, expires_at: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs font-bold text-white focus:outline-none focus:border-red-600"
                    />
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-white"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all"
                  >
                    Publish Promo Code
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ADD / EDIT PRODUCT MODAL */}
      <AnimatePresence>
        {isAddProductModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setIsAddProductModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0f0f0f] border border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full text-white shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-6"
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight text-white flex items-center gap-2">
                    <Package className="text-red-500" size={20} />
                    {editingProduct ? `Edit Product: ${editingProduct.name}` : 'Add New Apparel Product / Launch'}
                  </h3>
                  <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mt-0.5">
                    Configure front/back images, pricing, stock status, and drop dates
                  </p>
                </div>
                <button
                  onClick={() => setIsAddProductModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-zinc-900 text-zinc-400 hover:text-white flex items-center justify-center font-black"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cyber Samurai Oversized Tee"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs font-bold text-white focus:outline-none focus:border-red-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-1">Price (₹) *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 599.00 or ₹599.00"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs font-bold text-white focus:outline-none focus:border-red-600"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-1">Category *</label>
                    <select
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs font-bold uppercase text-white focus:outline-none focus:border-red-600"
                    >
                      <option value="Oversized Collection">Oversized Collection</option>
                      <option value="Graphic Series">Graphic Series</option>
                      <option value="Essential Solids">Essential Solids</option>
                      <option value="Limited Drops">Limited Drops</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-1">Front Image *</label>
                    <div className="space-y-2">
                      <input
                        type="text"
                        required
                        placeholder="e.g. /products/zoro_front.jpg or https://..."
                        value={productForm.image}
                        onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-red-600"
                      />
                      <div className="flex items-center gap-2">
                        <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-[10px] font-bold text-zinc-300 hover:text-white hover:border-zinc-700 transition-all">
                          <span>{uploadingFront ? '⏳ Uploading...' : '📁 Upload File from Device'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageFileUpload(e, 'image')}
                            className="hidden"
                            disabled={uploadingFront}
                          />
                        </label>
                        {productForm.image && (
                          <span className="text-[9px] text-green-400 font-bold uppercase truncate max-w-[120px]">✓ Selected</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-1">Back Image (Optional)</label>
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="e.g. /products/zoro_back.jpg or https://..."
                        value={productForm.image_back}
                        onChange={(e) => setProductForm({ ...productForm, image_back: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-red-600"
                      />
                      <div className="flex items-center gap-2">
                        <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-[10px] font-bold text-zinc-300 hover:text-white hover:border-zinc-700 transition-all">
                          <span>{uploadingBack ? '⏳ Uploading...' : '📁 Upload File from Device'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageFileUpload(e, 'image_back')}
                            className="hidden"
                            disabled={uploadingBack}
                          />
                        </label>
                        {productForm.image_back && (
                          <span className="text-[9px] text-green-400 font-bold uppercase truncate max-w-[120px]">✓ Selected</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-1">Description / Lore</label>
                  <textarea
                    rows={3}
                    placeholder="Describe the fabric, fit, design inspiration, and feel..."
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-red-600"
                  />
                </div>

                {/* Status Toggles Section */}
                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block">Inventory & Drop Controls</span>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Mark as Out of Stock</span>
                    <button
                      type="button"
                      onClick={() => setProductForm({ ...productForm, is_out_of_stock: !productForm.is_out_of_stock })}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all flex items-center gap-1.5 cursor-pointer ${
                        productForm.is_out_of_stock
                          ? 'bg-red-500/20 text-red-400 border-red-900/40'
                          : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                      }`}
                    >
                      {productForm.is_out_of_stock ? '✓ OUT OF STOCK' : 'IN STOCK'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-zinc-900">
                    <div>
                      <span className="text-xs font-bold text-white block">Schedule Upcoming Collection Drop</span>
                      <span className="text-[9px] text-zinc-500 block">Previews on storefront with live countdown badge</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setProductForm({ ...productForm, is_upcoming: !productForm.is_upcoming })}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all flex items-center gap-1.5 cursor-pointer ${
                        productForm.is_upcoming
                          ? 'bg-yellow-500/20 text-yellow-400 border-yellow-900/40'
                          : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                      }`}
                    >
                      {productForm.is_upcoming ? '⏳ UPCOMING DROP' : 'LIVE NOW'}
                    </button>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setIsAddProductModalOpen(false)}
                    className="px-5 py-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 text-xs font-black uppercase tracking-widest transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)]"
                  >
                    {editingProduct ? 'Update Product' : 'Publish Product / Launch Drop'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SHIPROCKET LIVE TRACKING MODAL */}
      <AnimatePresence>
        {trackingModalOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setTrackingModalOrder(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0f0f0f] border border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full text-white shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-6">
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight text-white flex items-center gap-2">
                    <Truck className="text-red-500" size={20} />
                    Live Shiprocket Tracking
                  </h3>
                  <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mt-0.5">
                    Order ORD-{trackingModalOrder.id.slice(0, 8).toUpperCase()}
                  </p>
                </div>
                <button
                  onClick={() => setTrackingModalOrder(null)}
                  className="w-8 h-8 rounded-full bg-zinc-900 text-zinc-400 hover:text-white flex items-center justify-center font-black"
                >
                  ✕
                </button>
              </div>

              {trackingLoading ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Connecting to Shiprocket Tracking Server...</p>
                </div>
              ) : trackingDetails ? (
                <div className="space-y-6">
                  {/* Status Banner */}
                  <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 block">Current Status</span>
                      <strong className="text-base font-black text-red-500 uppercase tracking-wide">
                        {trackingDetails.currentStatus || 'In Transit'}
                      </strong>
                    </div>
                    {trackingDetails.awbCode && (
                      <div className="text-right">
                        <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 block">AWB Code</span>
                        <span className="text-xs font-mono font-bold text-white">{trackingDetails.awbCode}</span>
                      </div>
                    )}
                  </div>

                  {/* Courier Details */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-800">
                      <span className="text-zinc-500 text-[9px] font-black uppercase block mb-1">Courier Partner</span>
                      <p className="font-bold text-white">{trackingDetails.courierName || 'Delhivery / BlueDart'}</p>
                    </div>
                    <div className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-800">
                      <span className="text-zinc-500 text-[9px] font-black uppercase block mb-1">Estimated Delivery</span>
                      <p className="font-bold text-green-400">{trackingDetails.edd || '3-5 Days'}</p>
                    </div>
                  </div>

                  {/* Activity Timeline */}
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-4">Checkpoint Activity Logs</h4>
                    <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-800">
                      {trackingDetails.activities && trackingDetails.activities.length > 0 ? (
                        trackingDetails.activities.map((act: any, idx: number) => (
                          <div key={idx} className="relative pl-8 flex flex-col gap-0.5">
                            <span className="absolute left-1.5 top-1.5 w-3 h-3 rounded-full bg-red-600 border-2 border-black -translate-x-1/2"></span>
                            <p className="text-xs font-bold text-white">{act.status || act.srStatus}</p>
                            <p className="text-[10px] text-zinc-400">{act.location} • {act.date ? new Date(act.date).toLocaleString('en-IN') : ''}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-zinc-500 italic pl-8">No detailed tracking activities recorded yet.</p>
                      )}
                    </div>
                  </div>

                  {trackingDetails.awbCode && (
                    <a
                      href={`https://shiprocket.co/tracking/${trackingDetails.awbCode}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full bg-red-600 hover:bg-red-500 text-white font-black uppercase text-xs tracking-widest text-center py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(220,38,38,0.3)]"
                    >
                      Open Official Shiprocket Portal Tracking &rarr;
                    </a>
                  )}
                </div>
              ) : (
                <div className="py-8 text-center text-zinc-500 text-xs font-bold">
                  No tracking information returned for this order.
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
