
import React, { useState } from 'react';
import { Category } from '../types';
import { ViewType } from '../App';

interface LayoutProps {
  categories: Category[];
  children: React.ReactNode;
  activeTab: ViewType;
  setActiveTab: (tab: ViewType) => void;
  cartCount: number;
  onCartClick: () => void;
  onSearch: (query: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ categories, children, activeTab, setActiveTab, cartCount, onCartClick, onSearch }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col pb-20 sm:pb-0">
      {/* Top Bar */}
      <div className="hidden sm:flex bg-black text-white text-[10px] sm:text-xs py-2 px-4 justify-between items-center z-[60]">
        <span>FREE SHIPPING ON ORDERS OVER 5000 BDT</span>
        <div className="flex gap-4">
          <button 
            onClick={() => setActiveTab('admin')} 
            className={`hover:underline font-bold uppercase tracking-tighter ${activeTab === 'admin' ? 'text-red-500' : ''}`}
          >
            Admin Panel
          </button>
          <span>Store Locator</span>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b">
        <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-4 sm:gap-8">
            <h1 
              className="text-xl sm:text-2xl font-black tracking-tighter text-red-600 cursor-pointer flex items-center gap-1" 
              onClick={() => setActiveTab('home')}
            >
              APEX<span className="text-black">PLUS</span>
            </h1>
            
            <nav className="hidden md:flex gap-8 font-black uppercase text-xs tracking-[0.1em]">
              <button onClick={() => setActiveTab('home')} className={`transition-colors ${activeTab === 'home' ? 'text-red-600 underline underline-offset-8' : 'hover:text-red-600'}`}>Home</button>
              {categories.map((cat) => (
                <button 
                  key={cat.id}
                  onClick={() => setActiveTab(cat.id)} 
                  className={`transition-colors ${activeTab === cat.id ? 'text-red-600 underline underline-offset-8' : 'hover:text-red-600'}`}
                >
                  {cat.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden sm:flex items-center border rounded-full px-4 py-1.5 bg-gray-50 focus-within:ring-2 ring-red-100 transition-all">
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-transparent outline-none text-xs w-32 lg:w-48 font-bold"
                onChange={(e) => onSearch(e.target.value)}
              />
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
            
            <button className="relative p-2 hover:bg-gray-100 rounded-full transition-colors active:scale-90" onClick={onCartClick}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-red-600 text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-black">
                  {cartCount}
                </span>
              )}
            </button>

            <button className="sm:hidden p-2 active:scale-90" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t bg-white px-4 py-6 space-y-6 animate-in slide-in-from-top absolute w-full shadow-xl">
             <div className="flex items-center border rounded-full px-4 py-2.5 bg-gray-50 mb-4">
              <input 
                type="text" 
                placeholder="Search catalog..." 
                className="bg-transparent outline-none text-sm w-full font-bold"
                onChange={(e) => onSearch(e.target.value)}
              />
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
            <nav className="flex flex-col gap-5 font-black uppercase text-sm tracking-widest">
              <button onClick={() => { setActiveTab('home'); setMobileMenuOpen(false); }}>Home</button>
              {categories.map((cat) => (
                <button 
                  key={cat.id}
                  onClick={() => { setActiveTab(cat.id); setMobileMenuOpen(false); }}
                >
                  {cat.name}
                </button>
              ))}
              <hr className="border-gray-100" />
              <button onClick={() => { setActiveTab('admin'); setMobileMenuOpen(false); }} className="text-red-600">Admin Control</button>
            </nav>
          </div>
        )}
      </header>

      {/* Sticky Mobile Nav Bar - Dynamic */}
      <nav className="sm:hidden fixed bottom-0 w-full bg-white/95 backdrop-blur-md border-t z-50 flex justify-around items-center py-3 px-2 shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
        <button 
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'home' ? 'text-red-600' : 'text-gray-400'}`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
          <span className="text-[10px] font-black uppercase tracking-tighter">Home</span>
        </button>
        {categories.slice(0, 3).map((cat) => (
          <button 
            key={cat.id}
            onClick={() => setActiveTab(cat.id)}
            className={`flex flex-col items-center gap-1 transition-all ${activeTab === cat.id ? 'text-red-600' : 'text-gray-400'}`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
            <span className="text-[10px] font-black uppercase tracking-tighter">{cat.name}</span>
          </button>
        ))}
      </nav>

      <main className="flex-grow">
        {children}
      </main>

      <footer className="bg-gray-950 text-gray-500 py-12 sm:py-16">
        <div className="container mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-12">
          <div className="space-y-4 sm:space-y-6">
            <h3 className="text-white font-black text-2xl tracking-tighter">APEX<span className="text-red-600">PLUS</span></h3>
            <p className="text-sm leading-relaxed max-w-xs">
              Experience the evolution of footwear. High performance meets heritage style in every step.
            </p>
          </div>
          <div>
            <h4 className="text-white font-black uppercase text-xs tracking-widest mb-4 sm:mb-6">Explore</h4>
            <ul className="space-y-3 sm:space-y-4 text-xs font-bold uppercase tracking-tight">
              {categories.map(cat => (
                <li key={cat.id}><button onClick={() => setActiveTab(cat.id)} className="hover:text-red-500">{cat.name} Collection</button></li>
              ))}
            </ul>
          </div>
          <div className="hidden lg:block">
            <h4 className="text-white font-black uppercase text-xs tracking-widest mb-6">Support</h4>
            <ul className="space-y-4 text-xs font-bold uppercase tracking-tight">
              <li><button className="hover:text-red-500">Store Finder</button></li>
              <li><button className="hover:text-red-500">Order Status</button></li>
              <li><button className="hover:text-red-500">Size Guide</button></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-black uppercase text-xs tracking-widest mb-4 sm:mb-6">Stay Updated</h4>
            <p className="text-xs mb-4">Get exclusive access to drops and sales.</p>
            <form onSubmit={(e) => e.preventDefault()} className="flex">
              <input type="email" required placeholder="Email address" className="bg-gray-900 border-none rounded-l-xl px-4 py-3 text-xs w-full outline-none text-white" />
              <button type="submit" className="bg-red-600 text-white px-6 py-3 rounded-r-xl text-xs font-black uppercase active:scale-95">Join</button>
            </form>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-12 sm:mt-16 pt-8 border-t border-gray-900 flex flex-col sm:flex-row justify-between items-center gap-4 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest">
          <p className="text-center sm:text-left">© 2024 ApexPlus Footwear. Designed for Excellence.</p>
          <div className="flex gap-4 sm:gap-6 opacity-40">
            <span>Visa</span>
            <span>bKash</span>
            <span>Nagad</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
