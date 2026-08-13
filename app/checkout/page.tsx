'use client';
import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { 
  PhoneIcon, 
  ChevronRight, 
  ShieldCheck, 
  User,
  CreditCard,
  MessageSquare,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { motion } from 'motion/react';
import { useCart } from '../../context/CartContext';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import { useToast } from '../../context/ToastContext';
import { useRazorpay } from '../../hooks/useRazorpay';
import LoginModal from '../../components/LoginModal';
import Link from 'next/link';
import Image from 'next/image';

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    houseNumber: '',
    streetName: '',
    landmark: '',
    pinCode: '',
    paymentMethod: 'razorpay'
  });

  const shipping = 69.00;
  const total = subtotal + shipping;

  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeDetails, setPincodeDetails] = useState<{ city: string; state: string; location: string } | null>(null);

  const handlePincodeChange = async (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 6);
    setFormData(prev => ({ ...prev, pinCode: cleaned }));

    if (cleaned.length === 6) {
      setPincodeLoading(true);
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${cleaned}`);
        const data = await res.json();
        if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice && data[0].PostOffice.length > 0) {
          const po = data[0].PostOffice[0];
          setPincodeDetails({
            city: po.District,
            state: po.State,
            location: po.Name
          });
        } else {
          setPincodeDetails(null);
        }
      } catch (e) {
        console.error('PIN code lookup error', e);
      } finally {
        setPincodeLoading(false);
      }
    } else {
      setPincodeDetails(null);
    }
  };

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      // Auto-fill from metadata if available
      if (user?.user_metadata?.address_details) {
        const addr = user.user_metadata.address_details;
        setFormData(prev => ({
          ...prev,
          fullName: user.user_metadata.full_name || '',
          phone: addr.phone || '',
          houseNumber: addr.houseNumber || '',
          streetName: addr.streetName || '',
          landmark: addr.landmark || '',
          pinCode: addr.pinCode || '',
        }));
      } else if (user?.user_metadata?.full_name) {
        setFormData(prev => ({ ...prev, fullName: user.user_metadata.full_name }));
      }
    };
    checkUser();
  }, [router]);

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }

    if (items.length === 0) {
      showToast('Your cart is empty', 'error');
      return;
    }

    const { fullName, phone, houseNumber, streetName, landmark, pinCode } = formData;
    if (!fullName || !phone || !houseNumber || !streetName || !landmark || !pinCode) {
      showToast('Please fill in all shipping details', 'error');
      return;
    }

    setLoading(true);

    try {
      const formattedAddress = `${houseNumber}, ${streetName}${landmark ? `, Near ${landmark}` : ''}, PIN: ${pinCode}`;

      // 1. Create the order in Supabase DB
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total_amount: total,
          shipping_address: formattedAddress,
          phone: phone,
          payment_method: formData.paymentMethod,
          status: 'pending',
          payment_status: 'pending'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
        size: item.size,
        color: item.color
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // 3. Save address to user metadata
      await supabase.auth.updateUser({
        data: {
          address_details: {
            houseNumber,
            streetName,
            landmark,
            pinCode,
            phone
          }
        }
      });

      // 4. Handle Selected Payment Method
      if (formData.paymentMethod === 'razorpay') {
        if (!isRazorpayLoaded) {
          showToast('Razorpay payment gateway loading... Please try again in a moment.', 'info');
          setLoading(false);
          return;
        }

        // Call backend API to create Razorpay Order
        const apiRes = await fetch('/api/razorpay/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: order.id,
            amount: total
          })
        });

        const resData = await apiRes.json();

        if (!apiRes.ok || !resData.razorpayOrderId) {
          throw new Error(resData.error || 'Failed to initialize Razorpay payment');
        }

        // Open Razorpay Checkout Modal
        const options = {
          key: resData.keyId,
          amount: resData.amount,
          currency: resData.currency,
          name: "URBAN VEIN",
          description: `Order #${order.id.slice(0, 8).toUpperCase()}`,
          image: "/icon.png",
          order_id: resData.razorpayOrderId,
          prefill: {
            name: fullName,
            email: user.email,
            contact: phone
          },
          notes: {
            order_id: order.id
          },
          theme: {
            color: "#dc2626"
          },
          handler: async function (response: any) {
            try {
              // Verify Cryptographic Signature on Server
              const verifyRes = await fetch('/api/razorpay/verify-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  order_id: order.id
                })
              });

              const verifyData = await verifyRes.json();

              if (verifyRes.ok && verifyData.success) {
                clearCart();
                showToast('Payment successful! Order placed.', 'success');
                router.push(`/success?order_id=${order.id}&payment_id=${response.razorpay_payment_id}`);
              } else {
                showToast(verifyData.error || 'Payment verification failed', 'error');
                setLoading(false);
              }
            } catch (err: any) {
              console.error('Verification error:', err);
              showToast('Error verifying payment. Please contact support.', 'error');
              setLoading(false);
            }
          },
          modal: {
            ondismiss: function () {
              showToast('Payment process was cancelled', 'info');
              setLoading(false);
            }
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', function (response: any) {
          console.error('Payment failed:', response.error);
          showToast(`Payment failed: ${response.error.description || 'Transaction declined'}`, 'error');
          setLoading(false);
        });
        rzp.open();

      } else if (formData.paymentMethod === 'whatsapp') {
        const adminPhone = "918264966094";
        let message = `*NEW ORDER: ORD-${order.id.slice(0, 8).toUpperCase()}*\n\n`;
        
        message += `*CLIENT DETAILS:*\n`;
        message += `Name: ${fullName}\n`;
        message += `Phone: ${phone}\n\n`;
        
        message += `*SHIPPING ADDRESS:*\n`;
        message += `${houseNumber}, ${streetName}\n`;
        if (landmark) message += `Landmark: ${landmark}\n`;
        message += `PIN Code: ${pinCode}\n\n`;
        
        message += `*ITEMS:*\n`;
        items.forEach((item, index) => {
          message += `${index + 1}. ${item.name} (${item.size}/${item.color}) x${item.quantity} - ₹${(item.price * item.quantity).toLocaleString()}\n`;
        });
        
        message += `\n*TOTAL: ₹${total.toLocaleString()}*\n\n`;
        message += `_Please share payment details to confirm._`;

        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/${adminPhone}?text=${encodedMessage}`, '_blank');

        clearCart();
        showToast('Order submitted via WhatsApp!', 'success');
        router.push('/success');
      }

    } catch (error: any) {
      showToast(error.message || 'Failed to place order', 'error');
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-red-600/30 pt-20 lg:pt-24">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-6 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          
          {/* Left Column: Payment Details */}
          <div className="lg:col-span-7 space-y-12">
            <header>
              <div className="flex items-center gap-3 text-zinc-500 mb-4">
                <ShieldCheck size={14} className="text-red-600" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Encrypted Checkout</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-black uppercase tracking-tighter mb-4">Secure Payment</h1>
              <p className="text-red-500 font-bold uppercase tracking-[0.2em] text-xs">Complete your digital identity</p>
            </header>

            {/* Checkout Form */}
            <form className="space-y-8" onSubmit={handlePurchase}>
              
              {/* Shipping Details */}
              <div className="space-y-6">
                <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Shipping Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3">Client Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700" size={18} />
                      <input 
                        required
                        type="text" 
                        placeholder="Alex Mercer"
                        className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl px-12 py-5 text-sm focus:outline-none focus:border-red-600 transition-colors"
                        value={formData.fullName}
                        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3">Phone Number</label>
                    <div className="relative">
                      <PhoneIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700" size={18} />
                      <input 
                        required
                        type="tel" 
                        placeholder="+91 00000 00000"
                        className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl px-12 py-5 text-sm focus:outline-none focus:border-red-600 transition-colors"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3">House / Flat / Block No.</label>
                    <input 
                      required
                      type="text" 
                      placeholder="e.g. A-123, 4th Floor"
                      className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl px-6 py-5 text-sm focus:outline-none focus:border-red-600 transition-colors"
                      value={formData.houseNumber}
                      onChange={(e) => setFormData({...formData, houseNumber: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3">Street Name / Area</label>
                    <input 
                      required
                      type="text" 
                      placeholder="e.g. Cyber City, Sector 24"
                      className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl px-6 py-5 text-sm focus:outline-none focus:border-red-600 transition-colors"
                      value={formData.streetName}
                      onChange={(e) => setFormData({...formData, streetName: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3">Nearby Landmark</label>
                    <input 
                      required
                      type="text" 
                      placeholder="e.g. Near Metro Station"
                      className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl px-6 py-5 text-sm focus:outline-none focus:border-red-600 transition-colors"
                      value={formData.landmark}
                      onChange={(e) => setFormData({...formData, landmark: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3 flex items-center justify-between">
                      <span>PIN Code</span>
                      {pincodeLoading && <span className="text-[9px] text-red-500 animate-pulse font-bold">Checking Postal Coverage...</span>}
                    </label>
                    <div className="relative">
                      <input 
                        required
                        type="text" 
                        maxLength={6}
                        placeholder="e.g. 110001"
                        className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl px-6 py-5 text-sm focus:outline-none focus:border-red-600 transition-colors tracking-widest font-bold"
                        value={formData.pinCode}
                        onChange={(e) => handlePincodeChange(e.target.value)}
                      />
                    </div>

                    {pincodeDetails && (
                      <div className="mt-2 text-[10px] font-bold text-green-400 bg-green-950/40 border border-green-900/50 rounded-xl p-3 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                          Verified: {pincodeDetails.city}, {pincodeDetails.state}
                        </span>
                        <span className="text-[9px] text-zinc-400 font-normal">Express Shipping Available</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-4 pt-4">
                <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Select Payment Method</h2>
                
                {/* Razorpay Option */}
                <div 
                  onClick={() => setFormData({ ...formData, paymentMethod: 'razorpay' })}
                  className={`cursor-pointer p-6 rounded-3xl border transition-all duration-300 ${
                    formData.paymentMethod === 'razorpay' 
                      ? 'bg-zinc-900/80 border-red-600 shadow-[0_0_30px_rgba(220,38,38,0.15)]' 
                      : 'bg-zinc-950/40 border-zinc-900 hover:border-zinc-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-2xl ${formData.paymentMethod === 'razorpay' ? 'bg-red-600 text-white' : 'bg-zinc-900 text-zinc-400'}`}>
                        <CreditCard size={22} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-black text-sm uppercase tracking-wider">Online Payment (Razorpay)</h3>
                          <span className="bg-red-950/80 text-red-400 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider border border-red-900/50">Fast & Secure</span>
                        </div>
                        <p className="text-xs text-zinc-500 font-medium mt-1">UPI (GPay, PhonePe, Paytm), Credit/Debit Cards, NetBanking, Wallets</p>
                      </div>
                    </div>
                    {formData.paymentMethod === 'razorpay' && (
                      <CheckCircle2 size={22} className="text-red-600 flex-shrink-0" />
                    )}
                  </div>
                </div>

                {/* WhatsApp Option */}
                <div 
                  onClick={() => setFormData({ ...formData, paymentMethod: 'whatsapp' })}
                  className={`cursor-pointer p-6 rounded-3xl border transition-all duration-300 ${
                    formData.paymentMethod === 'whatsapp' 
                      ? 'bg-zinc-900/80 border-green-600 shadow-[0_0_30px_rgba(22,163,74,0.15)]' 
                      : 'bg-zinc-950/40 border-zinc-900 hover:border-zinc-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-2xl ${formData.paymentMethod === 'whatsapp' ? 'bg-green-600 text-white' : 'bg-zinc-900 text-zinc-400'}`}>
                        <MessageSquare size={22} />
                      </div>
                      <div>
                        <h3 className="font-black text-sm uppercase tracking-wider">Checkout via WhatsApp</h3>
                        <p className="text-xs text-zinc-500 font-medium mt-1">Place order directly with support & receive manual payment options</p>
                      </div>
                    </div>
                    {formData.paymentMethod === 'whatsapp' && (
                      <CheckCircle2 size={22} className="text-green-600 flex-shrink-0" />
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input type="checkbox" id="save-address" className="w-5 h-5 accent-red-600 rounded-md bg-zinc-900 border-zinc-800" defaultChecked />
                <label htmlFor="save-address" className="text-xs text-zinc-500 font-bold tracking-tight">Save this address to my profile for future orders</label>
              </div>

              <button 
                disabled={loading}
                type="submit" 
                className={`w-full ${formData.paymentMethod === 'whatsapp' ? 'bg-green-600 shadow-[0_20px_50px_rgba(22,163,74,0.3)]' : 'bg-red-600 shadow-[0_20px_50px_rgba(220,38,38,0.3)]'} disabled:bg-zinc-800 disabled:cursor-not-allowed text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-95 transition-all group`}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                    Processing...
                  </span>
                ) : (
                  <>
                    {formData.paymentMethod === 'whatsapp' ? 'Checkout via WhatsApp' : `Pay ₹${total.toLocaleString()} with Razorpay`} 
                    <ChevronRight size={20} className="group-hover:translate-x-2 transition-transform" />
                  </>
                )}
              </button>
              
              <div className="flex items-center justify-center gap-2 text-zinc-600 text-[10px] font-bold uppercase tracking-widest">
                <Lock size={12} className="text-red-600" />
                Encrypted & Secure 256-bit SSL Connection
              </div>
            </form>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-5">
            <motion.section 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-zinc-900/20 border border-zinc-900 p-8 lg:p-12 rounded-[3.5rem] sticky top-8"
            >
              <h2 className="text-2xl font-black uppercase tracking-tight mb-10 italic">Order Summary</h2>
              
              {/* Product Preview List */}
              <div className="space-y-4 mb-10 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {items.map((item) => (
                  <div key={item.cartItemId} className="flex items-center gap-6 p-4 rounded-2xl bg-zinc-950/50 border border-zinc-900">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 flex-shrink-0">
                      <Image 
                        src={item.image} 
                        alt={item.name} 
                        fill
                        sizes="64px"
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[11px] font-black uppercase tracking-widest mb-0.5 truncate">{item.name}</h3>
                      <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Size: {item.size} • Qty: {item.quantity}</p>
                      <p className="text-[10px] text-red-600 font-bold mt-1">₹{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
                {items.length === 0 && (
                  <div className="text-center py-10">
                    <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest">Your cart is empty</p>
                  </div>
                )}
              </div>

              {/* Price Table */}
              <div className="space-y-6 mb-10 pt-6 border-t border-zinc-900">
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-zinc-400">
                  <span>Subtotal</span>
                  <span className="text-white">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-zinc-400">
                  <span>Shipping (Express)</span>
                  <span className="text-white">₹{shipping.toLocaleString()}</span>
                </div>
              </div>

              {/* Total */}
              <div className="flex items-end justify-between mb-10">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 mb-2">Total Amount</span>
                <span className="text-5xl lg:text-6xl font-black tracking-tighter text-red-600">₹{total.toLocaleString()}</span>
              </div>

              {/* Promo Code */}
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="PROMO CODE"
                  className="w-full bg-zinc-950/50 border border-zinc-900 rounded-2xl px-6 py-5 text-[10px] font-black uppercase tracking-[0.3em] focus:outline-none focus:border-red-600 transition-colors pr-24"
                />
                <button className="absolute right-3 top-1/2 -translate-y-1/2 bg-zinc-900 text-white px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-red-600 transition-colors">
                  Apply
                </button>
              </div>
            </motion.section>
          </div>
        </div>
      </div>

      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />

      <footer className="border-t border-zinc-900 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-10">
             <Link href="/help" className="text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:text-white transition-colors">No Returns Policy</Link>
             <a href="#" className="text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:text-white transition-colors">Shipping Info</a>
             <a href="#" className="text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:text-white transition-colors">Contact Support</a>
          </div>
          <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-zinc-700">
             Securely Handcrafted Checkout
          </div>
        </div>
        <div className="text-center mt-12 text-[8px] font-bold text-zinc-700 uppercase tracking-[0.5em]">
          © 2024 URBANVEIN INDUSTRIES. BUILT FOR THE MODERN NOMAD.
        </div>
      </footer>
    </main>
  );
}
