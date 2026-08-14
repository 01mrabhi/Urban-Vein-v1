'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Navbar from '../../components/Navbar';
import { 
  Truck, 
  Search, 
  Copy, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Package, 
  ShieldCheck, 
  MessageSquare, 
  ArrowRight,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function TrackingContent() {
  const searchParams = useSearchParams();
  const initialAwb = searchParams.get('awb') || searchParams.get('order_id') || searchParams.get('id') || '';

  const [searchInput, setSearchInput] = useState(initialAwb);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trackingData, setTrackingData] = useState<any | null>(null);

  const fetchTracking = async (queryVal: string) => {
    if (!queryVal.trim()) return;

    setLoading(true);
    setError(null);

    try {
      let url = `/api/shiprocket/track?`;
      if (queryVal.toLowerCase().startsWith('ord-') || queryVal.length > 20) {
        url += `order_id=${encodeURIComponent(queryVal.replace(/^ord-/i, ''))}`;
      } else if (queryVal.match(/^\d+$/)) {
        url += `awb=${encodeURIComponent(queryVal)}`;
      } else {
        url += `order_id=${encodeURIComponent(queryVal)}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok && !data.currentStatus) {
        throw new Error(data.error || data.message || 'Tracking details not found for this reference');
      }

      setTrackingData(data);
    } catch (err: any) {
      console.error('Tracking fetch error:', err);
      setError(err.message || 'Unable to fetch shipment status');
      setTrackingData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialAwb) {
      fetchTracking(initialAwb);
    }
  }, [initialAwb]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTracking(searchInput);
  };

  const copyAwbToClipboard = (awbText: string) => {
    navigator.clipboard.writeText(awbText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Determine current stepper active index
  const currentStatus = (trackingData?.currentStatus || '').toLowerCase();
  let stepIndex = 0;
  if (currentStatus.includes('delivered')) {
    stepIndex = 3;
  } else if (currentStatus.includes('out for delivery')) {
    stepIndex = 2.5;
  } else if (currentStatus.includes('shipped') || currentStatus.includes('in transit') || currentStatus.includes('dispatched')) {
    stepIndex = 2;
  } else if (currentStatus.includes('manifested') || currentStatus.includes('created') || currentStatus.includes('processing')) {
    stepIndex = 1;
  }

  const steps = [
    { label: 'Order Confirmed', sub: 'Verified & Packed' },
    { label: 'Dispatched', sub: trackingData?.courierName || 'Courier Picked Up' },
    { label: 'In Transit', sub: 'Hub Movement' },
    { label: 'Delivered', sub: 'Doorstep Handover' }
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 lg:py-20 space-y-12">
      
      {/* Header */}
      <header className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 bg-red-600/10 border border-red-900/30 px-4 py-1.5 rounded-full">
          <Truck size={14} className="text-red-500" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-red-400">Live Package Intelligence</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tighter text-white italic">
          Track Shipment
        </h1>

        <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs max-w-md mx-auto">
          Enter your AWB tracking code or Order Reference (`ORD-XXXX`) for real-time status.
        </p>
      </header>

      {/* Search Bar Input Form */}
      <form onSubmit={handleSearchSubmit} className="max-w-xl mx-auto space-y-3">
        <div className="relative flex items-center">
          <Search className="absolute left-5 text-zinc-500" size={20} />
          <input
            type="text"
            placeholder="ENTER AWB OR ORDER ID (e.g. ORD-849201)"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full bg-zinc-900/80 text-white font-black uppercase tracking-widest pl-14 pr-32 py-5 rounded-3xl border border-zinc-800 focus:outline-none focus:border-red-600 transition-all text-xs placeholder:text-zinc-600 shadow-[0_0_30px_rgba(0,0,0,0.5)]"
          />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-2 bg-red-600 hover:bg-red-500 disabled:bg-zinc-800 text-white text-[10px] font-black uppercase tracking-widest px-6 py-3.5 rounded-2xl transition-all shadow-[0_0_20px_rgba(220,38,38,0.3)] active:scale-95 flex items-center gap-2"
          >
            {loading ? (
              <RefreshCw size={14} className="animate-spin" />
            ) : (
              <>
                Track <ArrowRight size={14} />
              </>
            )}
          </button>
        </div>

        <div className="flex items-center justify-between text-[9px] text-zinc-500 font-bold uppercase tracking-widest px-2">
          <span>Example: ORD-849201 or AWB 14920491028</span>
          <span>Powered by Shiprocket Intelligence</span>
        </div>
      </form>

      {/* Error Notice */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-950/40 border border-red-900/50 p-6 rounded-3xl text-center space-y-2 max-w-xl mx-auto"
        >
          <p className="text-xs font-bold uppercase tracking-widest text-red-400">{error}</p>
          <p className="text-[10px] text-zinc-500 font-medium">Please check the reference code or track via our WhatsApp support hotline.</p>
        </motion.div>
      )}

      {/* TRACKING RESULTS DISPLAY */}
      {trackingData && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-zinc-900/40 border border-zinc-900 rounded-[2.5rem] p-6 sm:p-10 space-y-10 shadow-2xl relative overflow-hidden backdrop-blur-md"
        >
          <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/5 blur-[120px] rounded-full pointer-events-none"></div>

          {/* Top Info Banner */}
          <div className="flex flex-wrap items-center justify-between gap-6 border-b border-zinc-800/80 pb-6">
            <div>
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 block mb-1">Package Status</span>
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-red-500 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></span>
                {trackingData.currentStatus || 'In Transit'}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              {trackingData.awbCode && (
                <div className="bg-zinc-950 px-4 py-2.5 rounded-2xl border border-zinc-800 flex items-center gap-3">
                  <div>
                    <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500 block">AWB Number</span>
                    <span className="text-xs font-mono font-bold text-white tracking-widest">{trackingData.awbCode}</span>
                  </div>
                  <button
                    onClick={() => copyAwbToClipboard(trackingData.awbCode)}
                    className="p-1.5 text-zinc-400 hover:text-white transition-colors"
                    title="Copy AWB Code"
                  >
                    {copied ? <CheckCircle2 size={16} className="text-green-400" /> : <Copy size={16} />}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* VISUAL STEPPER TRACKER */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-zinc-400">
              <span>Live Delivery Journey</span>
              <span className="text-green-400 font-bold">
                EDD: {trackingData.edd || '3-5 Business Days'}
              </span>
            </div>

            <div className="relative flex items-center justify-between pt-4 pb-2">
              {/* Stepper Line Background */}
              <div className="absolute top-1/2 left-4 right-4 h-1 bg-zinc-800 -translate-y-1/2 -z-0 rounded-full"></div>
              {/* Stepper Progress Line */}
              <div
                className="absolute top-1/2 left-4 h-1 bg-red-600 -translate-y-1/2 -z-0 rounded-full transition-all duration-700 shadow-[0_0_15px_#dc2626]"
                style={{
                  width: stepIndex >= 3 ? 'calc(100% - 32px)' : stepIndex >= 2 ? '66%' : stepIndex >= 1 ? '33%' : '10%'
                }}
              ></div>

              {steps.map((st, idx) => {
                const isCompleted = stepIndex >= idx + 1 || stepIndex === 3;
                const isCurrent = Math.floor(stepIndex) === idx;

                return (
                  <div key={idx} className="relative z-10 flex flex-col items-center gap-2">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                        isCompleted
                          ? 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.6)]'
                          : isCurrent
                          ? 'bg-zinc-900 text-red-400 border-2 border-red-600 animate-pulse shadow-[0_0_15px_rgba(220,38,38,0.3)]'
                          : 'bg-zinc-950 text-zinc-600 border border-zinc-800'
                      }`}
                    >
                      {isCompleted ? '✓' : idx + 1}
                    </div>
                    <div className="text-center">
                      <span className={`text-[10px] font-black uppercase tracking-wider block ${isCompleted || isCurrent ? 'text-white' : 'text-zinc-600'}`}>
                        {st.label}
                      </span>
                      <span className="text-[8px] text-zinc-500 font-bold uppercase block">{st.sub}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Courier Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800/80">
              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 block mb-1">Courier Partner</span>
              <p className="font-bold text-white text-sm">{trackingData.courierName || 'Delhivery / BlueDart Express'}</p>
            </div>

            <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800/80">
              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 block mb-1">Origin Hub</span>
              <p className="font-bold text-white text-sm">{trackingData.origin || 'Panchkula / Delhi HQ'}</p>
            </div>

            <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800/80">
              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 block mb-1">Destination</span>
              <p className="font-bold text-white text-sm">{trackingData.destination || 'Customer Address'}</p>
            </div>
          </div>

          {/* Checkpoint Timeline Activities */}
          <div className="space-y-4 pt-4 border-t border-zinc-800/80">
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
              <Clock size={14} className="text-red-500" />
              Checkpoint Activity Logs
            </h3>

            <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-800/80">
              {trackingData.activities && trackingData.activities.length > 0 ? (
                trackingData.activities.map((act: any, idx: number) => (
                  <div key={idx} className="relative pl-8 space-y-0.5">
                    <span className="absolute left-1.5 top-1.5 w-3 h-3 rounded-full bg-red-600 border-2 border-zinc-950 -translate-x-1/2"></span>
                    <p className="text-xs font-black uppercase tracking-wider text-white">
                      {act.status || act.srStatus}
                    </p>
                    <p className="text-[10px] font-medium text-zinc-400">
                      {act.location ? `${act.location} • ` : ''}
                      {act.date ? new Date(act.date).toLocaleString('en-IN') : ''}
                    </p>
                  </div>
                ))
              ) : (
                <div className="pl-8 py-3">
                  <p className="text-xs text-zinc-500 italic">Package manifested & waiting for courier hub scan.</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-6 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-4">
            <button
              onClick={() => {
                const msg = encodeURIComponent(`Hi Urban Vein, I need assistance with shipment tracking for AWB: ${trackingData.awbCode || searchInput}`);
                window.open(`https://wa.me/918264966094?text=${msg}`, '_blank');
              }}
              className="bg-zinc-950 hover:bg-zinc-900 text-zinc-300 hover:text-white px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-zinc-800 transition-all flex items-center gap-2"
            >
              <MessageSquare size={14} className="text-green-500" />
              Track via WhatsApp Support
            </button>

            {trackingData.awbCode && (
              <a
                href={`https://shiprocket.co/tracking/${trackingData.awbCode}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-400 inline-flex items-center gap-1.5 transition-colors"
              >
                Official Shiprocket Carrier Link <ExternalLink size={12} />
              </a>
            )}
          </div>
        </motion.div>
      )}

    </div>
  );
}

export default function TrackPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-red-600/30 pt-20 lg:pt-24">
      <Navbar />
      <Suspense fallback={
        <div className="py-20 text-center text-zinc-500 text-xs font-black uppercase tracking-widest animate-pulse">
          Loading Live Tracking Portal...
        </div>
      }>
        <TrackingContent />
      </Suspense>
    </main>
  );
}
