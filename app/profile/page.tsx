'use client';
import React, { useState, useEffect } from 'react';
import { User, Package, MapPin, Settings, Mail, Shield, ExternalLink, Camera, LogOut, ChevronDown, ChevronUp, CreditCard, Truck, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import { useToast } from '../../context/ToastContext';

const TABS = [
  { id: 'personal', label: 'Personal Info', icon: User },
  { id: 'orders', label: 'Order History', icon: Package },
  { id: 'address', label: 'Addresses', icon: MapPin },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const router = useRouter();
  const { showToast } = useToast();

  const fetchOrders = async (userId: string) => {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setOrders(data);
    }
  };

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);
      fetchOrders(user.id);
      setLoading(false);
    };

    checkUser();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    showToast('Signed out successfully', 'success');
    router.push('/');
  };

  const toggleExpandOrder = (orderId: string) => {
    setExpandedOrderId(prev => prev === orderId ? null : orderId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const fullName = user?.user_metadata?.full_name || 'Urban Explorer';
  const email = user?.email;
  const initial = fullName ? fullName.charAt(0).toUpperCase() : 'U';

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-12 px-4 selection:bg-red-600/30">
      <div className="max-w-[1200px] mx-auto">
        
        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight mb-2 uppercase">My Profile</h1>
            <p className="text-zinc-500 font-medium tracking-wide">Manage your account details and order history.</p>
          </div>
          <Link 
            href="/#shop" 
            className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]"
          >
            Continue Shopping
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar */}
          <div className="w-full lg:w-72 flex-shrink-0">
            {/* User Card */}
            <div className="bg-[#0f0f0f] border border-zinc-900 rounded-3xl p-6 mb-6 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="relative z-10 flex flex-col items-center">
                <div 
                  onClick={(e) => {
                    e.preventDefault();
                    showToast('Avatar customization coming soon!', 'info');
                  }}
                  className="w-24 h-24 rounded-full bg-zinc-900 border-2 border-red-600/50 p-1 mb-4 relative cursor-pointer group/avatar shadow-[0_0_20px_rgba(220,38,38,0.2)]"
                >
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center text-white font-black text-3xl shadow-inner relative overflow-hidden">
                    {initial}
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                      <Camera className="text-white w-6 h-6" />
                    </div>
                  </div>
                </div>
                <h2 className="text-lg font-bold text-white tracking-wide">{fullName}</h2>
                <p className="text-zinc-500 text-sm font-medium">{email}</p>
                <div className="mt-4 inline-flex items-center gap-2 bg-red-600/10 px-3 py-1 rounded-full border border-red-600/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
                  <span className="text-xs font-bold text-red-500 uppercase tracking-widest">Active Member</span>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-[#0f0f0f] border border-zinc-900 rounded-3xl p-4 flex flex-col gap-2">
              {TABS.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all font-semibold tracking-wide text-sm ${
                      isActive 
                        ? 'bg-zinc-900 text-white' 
                        : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50'
                    }`}
                  >
                    <Icon size={18} className={isActive ? 'text-red-500' : ''} />
                    {tab.label}
                  </button>
                );
              })}
              
              <div className="h-px bg-zinc-900 my-2"></div>
              
              <button 
                onClick={handleSignOut}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all font-semibold tracking-wide text-sm text-red-500 hover:text-red-400 hover:bg-red-500/10"
              >
                <LogOut size={18} />
                Sign Out
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 bg-[#0f0f0f] border border-zinc-900 rounded-3xl p-6 md:p-10 relative overflow-hidden">
            {/* Background accents */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 blur-[100px] rounded-full pointer-events-none"></div>

            <AnimatePresence mode="wait">
              {activeTab === 'personal' && (
                <motion.div
                  key="personal"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-8"
                >
                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-white tracking-wide mb-1">Personal Information</h3>
                    <p className="text-zinc-500 text-sm">View and manage your account details.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold tracking-widest uppercase text-zinc-500">Full Name</label>
                      <input type="text" readOnly value={fullName} className="w-full bg-zinc-950 text-white border border-zinc-800 px-4 py-3 rounded-xl text-sm focus:outline-none opacity-80 font-medium cursor-not-allowed" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold tracking-widest uppercase text-zinc-500">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                        <input type="email" readOnly value={email} className="w-full bg-zinc-950 text-white border border-zinc-800 pl-11 pr-4 py-3 rounded-xl text-sm focus:outline-none opacity-80 font-medium cursor-not-allowed" />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 p-4 rounded-2xl bg-zinc-900/30 border border-zinc-800/50">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-red-600/10 flex items-center justify-center flex-shrink-0">
                        <Shield className="text-red-500" size={20} />
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-sm tracking-wide">Security Note</h4>
                        <p className="text-zinc-500 text-xs mt-1 leading-relaxed">Your account is secured with Supabase Authentication. Profile updates are currently disabled in the beta release.</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'orders' && (
                <motion.div
                  key="orders"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-white tracking-wide mb-1">Order History</h3>
                    <p className="text-zinc-500 text-sm">View and track your previous orders.</p>
                  </div>

                  <div className="space-y-4">
                    {orders.length > 0 ? (
                      orders.map(order => {
                        const isExpanded = expandedOrderId === order.id;
                        
                        // Calculate Stepper State
                        const currentStatus = (order.status || 'pending').toLowerCase();
                        const steps = [
                          { label: 'Order Placed', active: true, done: true },
                          { label: 'Processing', active: currentStatus === 'processing' || currentStatus === 'shipped' || currentStatus === 'delivered', done: currentStatus === 'shipped' || currentStatus === 'delivered' },
                          { label: 'Shipped', active: currentStatus === 'shipped' || currentStatus === 'delivered', done: currentStatus === 'delivered' },
                          { label: 'Delivered', active: currentStatus === 'delivered', done: currentStatus === 'delivered' }
                        ];

                        return (
                          <div key={order.id} className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-colors space-y-6">
                            
                            {/* Order Header Info */}
                            <div className="flex flex-wrap items-center justify-between gap-4">
                              <div>
                                <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-1">
                                  {new Date(order.created_at).toLocaleDateString('en-IN', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </p>
                                <p className="text-white font-bold tracking-wide text-lg">ORD-{order.id.slice(0, 8).toUpperCase()}</p>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className="text-base font-black text-white">₹{order.total_amount.toLocaleString()} <span className="text-zinc-500 text-xs font-normal">({order.order_items?.length || 0} items)</span></span>
                                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                                  order.status === 'delivered' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                                  order.status === 'shipped' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                  order.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                                  'bg-red-500/10 text-red-500 border-red-500/20'
                                }`}>
                                  {order.status || 'processing'}
                                </span>
                              </div>
                            </div>

                            {/* VISUAL 4-STEP LIVE ORDER TRACKER */}
                            <div className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-900 space-y-3">
                              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">
                                <span>Live Delivery Progress</span>
                                <span className="text-red-500 font-bold">Standard Delivery (3-5 Days)</span>
                              </div>
                              
                              <div className="relative flex items-center justify-between">
                                {/* Track Line */}
                                <div className="absolute top-1/2 left-0 right-0 h-1 bg-zinc-800 -translate-y-1/2 -z-0"></div>
                                <div 
                                  className="absolute top-1/2 left-0 h-1 bg-red-600 -translate-y-1/2 -z-0 transition-all duration-500"
                                  style={{
                                    width: currentStatus === 'delivered' ? '100%' : currentStatus === 'shipped' ? '66%' : currentStatus === 'processing' ? '33%' : '10%'
                                  }}
                                ></div>

                                {steps.map((step, sIdx) => (
                                  <div key={sIdx} className="relative z-10 flex flex-col items-center gap-1.5">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${
                                      step.done 
                                        ? 'bg-red-600 text-white shadow-[0_0_10px_#dc2626]' 
                                        : step.active 
                                          ? 'bg-zinc-800 text-red-400 border-2 border-red-600 animate-pulse' 
                                          : 'bg-zinc-900 text-zinc-600 border border-zinc-800'
                                    }`}>
                                      {step.done ? '✓' : sIdx + 1}
                                    </div>
                                    <span className={`text-[9px] font-bold uppercase tracking-wider ${step.active ? 'text-white' : 'text-zinc-600'}`}>
                                      {step.label}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* View Details & Support Action */}
                            <div className="flex flex-wrap justify-between items-center gap-3 pt-2 border-t border-zinc-900">
                              <div className="flex items-center gap-2">
                                <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded border ${
                                  order.payment_status === 'captured' 
                                    ? 'bg-green-950/60 text-green-400 border-green-900/50' 
                                    : 'bg-yellow-950/60 text-yellow-400 border-yellow-900/50'
                                }`}>
                                  {order.payment_status === 'captured' ? '✓ Paid via Razorpay' : 'Payment Pending'}
                                </span>
                              </div>

                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => {
                                    const msg = encodeURIComponent(`Hi Urban Vein, I need a tracking update on Order #ORD-${order.id.slice(0, 8).toUpperCase()}`);
                                    window.open(`https://wa.me/918264966094?text=${msg}`, '_blank');
                                  }}
                                  className="text-[10px] font-black uppercase tracking-widest bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white px-3 py-1.5 rounded-lg border border-zinc-800 transition-all flex items-center gap-1.5"
                                >
                                  Track via Support
                                </button>

                                <button 
                                  onClick={() => toggleExpandOrder(order.id)}
                                  className="flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-400 uppercase tracking-widest transition-colors cursor-pointer"
                                >
                                  {isExpanded ? 'Hide Details' : 'View Details'} 
                                  {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                </button>
                              </div>
                            </div>div>

                            {/* Expandable Order Details Drawer */}
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="mt-4 pt-4 border-t border-zinc-900/80 space-y-4"
                                >
                                  {/* Items List */}
                                  <div>
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3">Order Items</h4>
                                    <div className="space-y-2">
                                      {order.order_items && order.order_items.length > 0 ? (
                                        order.order_items.map((item: any, idx: number) => (
                                          <div key={idx} className="flex items-center justify-between bg-zinc-900/40 p-3 rounded-xl border border-zinc-900 text-xs">
                                            <div>
                                              <p className="font-bold text-white uppercase tracking-wider">Product #{item.product_id}</p>
                                              <p className="text-[10px] text-zinc-500 uppercase">Size: {item.size} • Qty: {item.quantity}</p>
                                            </div>
                                            <p className="font-bold text-red-500">₹{(item.price * item.quantity).toLocaleString()}</p>
                                          </div>
                                        ))
                                      ) : (
                                        <p className="text-xs text-zinc-600 italic">No item details available</p>
                                      )}
                                    </div>
                                  </div>

                                  {/* Shipping Address & Payment References */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                    <div className="bg-zinc-900/30 p-4 rounded-xl border border-zinc-900">
                                      <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1 flex items-center gap-1">
                                        <Truck size={12} className="text-red-500" /> Shipping Address
                                      </h4>
                                      <p className="text-xs text-zinc-300 font-medium leading-relaxed">
                                        {order.shipping_address || 'Address provided at checkout'}
                                      </p>
                                      {order.phone && (
                                        <p className="text-[10px] text-zinc-500 font-bold mt-2">Phone: {order.phone}</p>
                                      )}
                                    </div>

                                    <div className="bg-zinc-900/30 p-4 rounded-xl border border-zinc-900 space-y-2">
                                      <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1 flex items-center gap-1">
                                        <CreditCard size={12} className="text-red-500" /> Payment Audit Info
                                      </h4>
                                      {order.razorpay_payment_id && (
                                        <div>
                                          <p className="text-[9px] text-zinc-500 uppercase font-bold">Razorpay Payment ID</p>
                                          <p className="text-xs font-mono font-bold text-red-400">{order.razorpay_payment_id}</p>
                                        </div>
                                      )}
                                      {order.razorpay_order_id && (
                                        <div>
                                          <p className="text-[9px] text-zinc-500 uppercase font-bold">Razorpay Order ID</p>
                                          <p className="text-xs font-mono text-zinc-400">{order.razorpay_order_id}</p>
                                        </div>
                                      )}
                                      {!order.razorpay_payment_id && (
                                        <p className="text-xs text-zinc-400 italic">Method: {order.payment_method || 'WhatsApp Direct'}</p>
                                      )}
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-20 bg-zinc-950/50 rounded-3xl border border-zinc-900 border-dashed">
                        <Package size={48} className="mx-auto text-zinc-800 mb-4" />
                        <p className="text-zinc-500 font-bold tracking-wide">No orders found.</p>
                        <Link href="/#shop" className="text-red-500 text-sm font-black uppercase tracking-widest mt-4 inline-block hover:text-red-400">Start Shopping</Link>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'address' && (
                <motion.div
                  key="address"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="mb-8 flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-white tracking-wide mb-1">Saved Addresses</h3>
                      <p className="text-zinc-500 text-sm">Manage your shipping and billing addresses.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {user?.user_metadata?.address_details ? (
                      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-8 relative group hover:border-red-600/30 transition-all">
                        <div className="absolute top-6 right-6 w-8 h-8 rounded-full bg-red-600/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <MapPin size={14} className="text-red-500" />
                        </div>
                        
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 mb-4">
                            <span className="bg-red-600/10 text-red-500 text-[10px] font-black uppercase px-3 py-1 rounded-full border border-red-600/20 tracking-widest">
                              Primary Address
                            </span>
                          </div>

                          <div>
                            <h4 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Delivery Contact</h4>
                            <p className="text-white font-bold text-lg">{user.user_metadata.full_name}</p>
                            <p className="text-zinc-400 text-sm font-medium mt-1">{user.user_metadata.address_details.phone}</p>
                          </div>

                          <div className="pt-4 border-t border-zinc-900">
                            <h4 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Location</h4>
                            <p className="text-white font-medium leading-relaxed">
                              {user.user_metadata.address_details.houseNumber}, {user.user_metadata.address_details.streetName}
                              {user.user_metadata.address_details.landmark && <><br /><span className="text-zinc-500 italic">Near: {user.user_metadata.address_details.landmark}</span></>}
                              <br />
                              <span className="text-red-500 font-bold">PIN: {user.user_metadata.address_details.pinCode}</span>
                            </p>
                          </div>
                        </div>

                        <div className="mt-8 flex gap-3">
                          <Link 
                            href="/checkout"
                            className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-white text-[10px] font-black uppercase tracking-widest py-3 rounded-xl text-center transition-colors"
                          >
                            Update
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-20 bg-zinc-950/50 rounded-3xl border border-zinc-900 border-dashed col-span-full">
                        <MapPin size={48} className="mx-auto text-zinc-800 mb-4" />
                        <p className="text-zinc-500 font-bold tracking-wide">No saved addresses found.</p>
                        <p className="text-zinc-600 text-xs mt-2">Addresses are saved automatically during checkout.</p>
                        <Link href="/#shop" className="text-red-500 text-sm font-black uppercase tracking-widest mt-6 inline-block hover:text-red-400">Start Shopping</Link>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'settings' && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-8"
                >
                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-white tracking-wide mb-1">Account Settings</h3>
                    <p className="text-zinc-500 text-sm">Manage your preferences and security settings.</p>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between py-4 border-b border-zinc-800/50">
                      <div>
                        <h4 className="text-white font-semibold tracking-wide text-sm">Marketing Emails</h4>
                        <p className="text-zinc-500 text-xs mt-1">Receive updates about new drops and exclusive offers.</p>
                      </div>
                      <div className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  );
}
