'use client';
import React, { useState, useEffect } from 'react';
import { User, Package, MapPin, Settings, Mail, Phone, Shield, ExternalLink, Camera, LogOut } from 'lucide-react';
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
  const router = useRouter();
  const { showToast } = useToast();

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
  }, []);

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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    showToast('Signed out successfully', 'success');
    router.push('/');
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
                <div className="w-24 h-24 rounded-full bg-zinc-900 border-2 border-zinc-800 p-1 mb-4 relative cursor-pointer group/avatar">
                  <div className="w-full h-full rounded-full overflow-hidden relative">
                    <img 
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${fullName}&backgroundColor=b91c1c&fontFamily=Arial&fontWeight=700`} 
                      alt="User Avatar" 
                      className="w-full h-full object-cover"
                    />
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
                      orders.map(order => (
                        <div key={order.id} className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-colors">
                          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                            <div>
                              <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-1">
                                {new Date(order.created_at).toLocaleDateString('en-IN', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </p>
                              <p className="text-white font-bold tracking-wide">ORD-{order.id.slice(0, 8).toUpperCase()}</p>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-sm font-bold text-white">₹{order.total_amount.toLocaleString()} <span className="text-zinc-500 text-xs">({order.order_items?.length || 0} items)</span></span>
                              <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                                order.status === 'delivered' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                                order.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                                'bg-zinc-900 text-zinc-300 border-zinc-800'
                              }`}>
                                {order.status}
                              </span>
                            </div>
                          </div>
                          <div className="flex justify-end pt-4 border-t border-zinc-900">
                            <button className="flex items-center gap-2 text-xs font-semibold text-red-500 hover:text-red-400 uppercase tracking-widest transition-colors">
                              View Details <ExternalLink size={12} />
                            </button>
                          </div>
                        </div>
                      ))
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
                    <div className="text-center py-12 bg-zinc-950/50 rounded-3xl border border-zinc-900 border-dashed col-span-full">
                      <MapPin size={32} className="mx-auto text-zinc-800 mb-2" />
                      <p className="text-zinc-500 text-sm font-medium">Addresses are saved automatically during checkout.</p>
                    </div>
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
