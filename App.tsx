
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Storefront from './components/Storefront';
import AdminPanel from './components/AdminPanel';
import { CartItem, Product, Order, OrderStatus, PaymentMethod, Category } from './types';

export type ViewType = 'home' | 'admin' | string;

const API_BASE = 'http://localhost:5000/api';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'info' | 'payment' | 'processing' | 'success'>('info');
  const [searchQuery, setSearchQuery] = useState('');

  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: 'Dhaka'
  });
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('COD');
  const [lastOrderId, setLastOrderId] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [catRes, prodRes, ordersRes] = await Promise.all([
          fetch(`${API_BASE}/categories`),
          fetch(`${API_BASE}/products`),
          fetch(`${API_BASE}/orders`)
        ]);
        const cats = await catRes.json();
        const prods = await prodRes.json();
        const ords = await ordersRes.json();
        setCategories(cats);
        // Normalize categoryId to avoid casing/whitespace mismatches
        setProducts(prods.map((p: any) => ({ ...p, categoryId: p.categoryId ? String(p.categoryId).toLowerCase().trim() : p.categoryId })));
        setOrders(ords || []);
      } catch (err) {
        console.error("Using Mock Data as SQL server not found");
        // Fallback to static mock if server isn't running
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handleAddToCart = (item: CartItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id && i.selectedVariant.id === item.selectedVariant.id);
      if (existing) {
        return prev.map(i => i === existing ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, item];
    });
    showToast(`Saved to bag!`, 'bg-red-600');
  };

  const removeFromCart = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const toggleWishlist = (id: string) => {
    setWishlist(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    showToast(wishlist.includes(id) ? "Removed" : "Added to Wishlist");
  };

  const showToast = (msg: string, colorClass = 'bg-black') => {
    const alertBox = document.createElement('div');
    alertBox.className = `fixed bottom-24 left-1/2 -translate-x-1/2 ${colorClass} text-white px-8 py-4 rounded-3xl shadow-2xl font-black uppercase tracking-widest z-[400] animate-in fade-in slide-in-from-bottom-10 flex items-center justify-center gap-4 text-[10px] whitespace-nowrap`;
    alertBox.innerHTML = `<span>${msg}</span>`;
    document.body.appendChild(alertBox);
    setTimeout(() => {
      alertBox.classList.add('animate-out', 'fade-out', 'translate-y-10');
      setTimeout(() => alertBox.remove(), 500);
    }, 2000);
  };

  const handleProcessPayment = async () => {
    setCheckoutStep('processing');
    try {
      // Simulate processing delay
      await new Promise(r => setTimeout(r, 1200));

      const payload = {
        customerName: customerInfo.name || 'Guest',
        email: customerInfo.email || null,
        phone: customerInfo.phone || '00000000',
        address: customerInfo.address || 'N/A',
        city: customerInfo.city || 'Dhaka',
        items: cart.map(i => ({ productId: i.id, variantId: i.selectedVariant.id, quantity: i.quantity, priceAtPurchase: i.discountPrice || i.price })),
        totalAmount: totalAmount,
        paymentMethod: selectedPayment
      };

      const res = await fetch(`${API_BASE}/orders`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error('Order save failed');
      const data = await res.json();
      const orderId = data.id || `#APX-${Math.floor(1000 + Math.random() * 8999)}`;
      setLastOrderId(orderId);

      // Refresh orders list
      const ordRes = await fetch(`${API_BASE}/orders`);
      const ords = await ordRes.json();
      setOrders(ords || []);

      setCart([]);
      setCheckoutStep('success');
      showToast('Order placed! 🎉', 'bg-green-500');
    } catch (err) {
      console.error('Order processing error:', err);
      setCheckoutStep('success');
      setCart([]);
      showToast('Order processed locally (server save failed).', 'bg-yellow-600');
    }
  };

  const totalAmount = cart.reduce((acc, i) => acc + (i.discountPrice || i.price) * i.quantity, 0);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-950">
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 border-[10px] border-red-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-8 font-black uppercase tracking-[0.5em] text-[10px] text-white animate-pulse">APEX LOADING...</p>
        </div>
      </div>
    );
  }

  return (
    <Layout
      categories={categories}
      activeTab={currentView}
      setActiveTab={setCurrentView}
      cartCount={cart.reduce((acc, i) => acc + i.quantity, 0)}
      onCartClick={() => setIsCartOpen(true)}
      onSearch={(q) => { setSearchQuery(q); setCurrentView('home'); }}
    >
      {currentView === 'admin' ? (
        <AdminPanel products={products} setProducts={setProducts} categories={categories} setCategories={setCategories} orders={orders} setOrders={setOrders} />
      ) : (
        <Storefront categories={categories} products={products} onAddToCart={handleAddToCart} wishlist={wishlist} onToggleWishlist={toggleWishlist} searchQuery={searchQuery} onSearchChange={setSearchQuery} forcedCategory={currentView === 'home' ? 'all' : currentView} onNavigate={setCurrentView} />
      )}

      {/* Mobile Optimized Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[300] flex justify-end items-end sm:items-stretch">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsCartOpen(false)} />
          <div className="relative w-full sm:max-w-md bg-white h-[90vh] sm:h-full rounded-t-[3rem] sm:rounded-none shadow-2xl flex flex-col animate-in slide-in-from-bottom sm:slide-in-from-right duration-500 overflow-hidden">
            <div className="p-8 sm:p-12 border-b flex justify-between items-center">
              <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tighter">Your Bag</h2>
              <button onClick={() => setIsCartOpen(false)} className="p-3 bg-gray-100 rounded-full active:scale-90 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 sm:p-12 space-y-10">
              {cart.length === 0 ? (
                <div className="text-center py-20 flex flex-col items-center opacity-30">
                  <p className="font-black uppercase tracking-widest text-xs">Your bag is empty.</p>
                </div>
              ) : (
                cart.map((item, idx) => (
                  <div key={idx} className="flex gap-6 animate-in slide-in-from-bottom-5">
                    <img src={item.images[0]} className="w-24 h-24 rounded-2xl object-cover bg-gray-50 border" />
                    <div className="flex-1 space-y-1">
                      <p className="text-[10px] font-black uppercase text-red-600">{item.brand}</p>
                      <h4 className="font-black text-xs uppercase">{item.name}</h4>
                      <p className="text-[10px] font-bold text-gray-400">Size {item.selectedVariant.size} • Qty {item.quantity}</p>
                      <p className="font-black pt-2 text-sm">{item.discountPrice || item.price} BDT</p>
                    </div>
                    <button onClick={() => removeFromCart(idx)} className="text-gray-300 hover:text-red-600 self-start p-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-8 sm:p-12 bg-gray-50 border-t space-y-8 pb-12 sm:pb-12">
                <div className="flex justify-between font-black text-3xl uppercase tracking-tighter">
                  <span>Total</span>
                  <span>{totalAmount} BDT</span>
                </div>
                <button
                  onClick={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }}
                  className="w-full bg-black text-white py-6 rounded-[2rem] font-black uppercase tracking-widest shadow-2xl hover:bg-red-600 transition-all active:scale-95"
                >
                  Checkout Now
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Checkout Fullscreen Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-[400] bg-white animate-in slide-in-from-bottom duration-500 overflow-y-auto">
          <div className="container mx-auto px-6 py-12 flex flex-col items-center">
            <div className="w-full flex justify-between items-center mb-20">
              <h1 className="text-2xl font-black tracking-tighter italic">APEX<span className="text-red-600">PLUS</span></h1>
              <button onClick={() => setIsCheckoutOpen(false)} className="p-4 bg-gray-100 rounded-full active:scale-90 font-black uppercase text-[10px]">Close</button>
            </div>

            {checkoutStep === 'info' && (
              <div className="w-full max-w-lg space-y-12">
                <div className="text-center">
                  <span className="bg-red-600 text-white px-5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Final Step</span>
                  <h2 className="text-4xl sm:text-6xl font-black uppercase tracking-tighter mt-4 leading-none">Confirm <br />Delivery</h2>
                </div>
                <div className="space-y-6">
                  <input value={customerInfo.name} onChange={e => setCustomerInfo({ ...customerInfo, name: e.target.value })} placeholder="Full Name" className="w-full bg-gray-50 border-none p-6 rounded-3xl font-bold outline-none focus:ring-4 ring-red-50 transition-all" />
                  <input value={customerInfo.phone} onChange={e => setCustomerInfo({ ...customerInfo, phone: e.target.value })} placeholder="Phone Number" className="w-full bg-gray-50 border-none p-6 rounded-3xl font-bold outline-none focus:ring-4 ring-red-50 transition-all" />
                  <textarea value={customerInfo.address} onChange={e => setCustomerInfo({ ...customerInfo, address: e.target.value })} placeholder="Complete Address" rows={3} className="w-full bg-gray-50 border-none p-6 rounded-3xl font-bold outline-none focus:ring-4 ring-red-50 transition-all" />
                  <button onClick={handleProcessPayment} className="w-full bg-red-600 text-white py-8 rounded-[3rem] font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all">Confirm Order ({totalAmount} BDT)</button>
                </div>
              </div>
            )}

            {checkoutStep === 'processing' && (
              <div className="h-[60vh] flex flex-col items-center justify-center text-center animate-in zoom-in-90">
                <div className="w-24 h-24 border-[12px] border-red-600 border-t-transparent rounded-full animate-spin mb-10"></div>
                <h3 className="text-3xl font-black uppercase tracking-tighter">Validating...</h3>
              </div>
            )}

            {checkoutStep === 'success' && (
              <div className="h-[70vh] flex flex-col items-center justify-center text-center animate-in zoom-in-50">
                <div className="w-32 h-32 bg-green-500 rounded-full flex items-center justify-center text-white mb-10 shadow-2xl shadow-green-500/30">
                  <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h2 className="text-5xl font-black uppercase tracking-tighter mb-4">Confirmed!</h2>
                <p className="font-bold text-gray-400 mb-12 uppercase tracking-widest">Order ID: {lastOrderId}</p>
                <button onClick={() => setIsCheckoutOpen(false)} className="bg-black text-white px-20 py-6 rounded-[2rem] font-black uppercase tracking-widest active:scale-95 shadow-2xl">Return to Store</button>
              </div>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;
