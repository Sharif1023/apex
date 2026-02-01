
import React, { useState, useMemo, useEffect } from 'react';
import { Product, CartItem, ProductVariant, Category } from '../types';
import { generateProductDescription, getProductAdvice } from '../services/geminiService';
import { ViewType } from '../App';

interface StorefrontProps {
  categories: Category[];
  products: Product[];
  onAddToCart: (item: CartItem) => void;
  wishlist: string[];
  onToggleWishlist: (id: string) => void;
  searchQuery: string;
  onSearchChange: (val: string) => void;
  forcedCategory: string; // 'all' or category ID
  onNavigate: (view: ViewType) => void;
}

const Storefront: React.FC<StorefrontProps> = ({ 
  categories, products, onAddToCart, wishlist, onToggleWishlist, 
  searchQuery, onSearchChange, forcedCategory, onNavigate 
}) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [activeImage, setActiveImage] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>(forcedCategory);
  const [priceRange, setPriceRange] = useState<number>(10000);
  const [sortBy, setSortBy] = useState<string>('newest');
  const [aiAdvice, setAiAdvice] = useState<string>('');
  const [isAskingAi, setIsAskingAi] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Sync internal category filter with external prop (page changes)
  useEffect(() => {
    setFilterCategory(forcedCategory);
  }, [forcedCategory]);

  const filteredProducts = useMemo<Product[]>(() => {
    let result = products.filter(p => {
      const matchesCat = filterCategory === 'all' || p.categoryId === filterCategory;
      const matchesSearch = searchQuery === '' || 
                           p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           p.brand.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPrice = (p.discountPrice || p.price) <= priceRange;
      return matchesCat && matchesSearch && matchesPrice;
    });

    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
        break;
      case 'price-high':
        result.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
        break;
      case 'popularity':
        result.sort((a, b) => b.reviewsCount - a.reviewsCount);
        break;
      default: // newest
        result.sort((a, b) => (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0));
    }
    return result;
  }, [products, filterCategory, searchQuery, priceRange, sortBy]);

  const handleAskAi = async () => {
    if (!searchQuery) return;
    setIsAskingAi(true);
    const catalogStr = products.map(p => `${p.name} by ${p.brand}`).join(', ');
    const advice = await getProductAdvice(searchQuery, catalogStr);
    setAiAdvice(advice);
    setIsAskingAi(false);
  };

  const openProduct = (product: Product) => {
    setSelectedProduct(product);
    setSelectedVariant(product.variants[0]);
    setActiveImage(product.images[0]);
  };

  const getPageInfo = () => {
    const activeCat = categories.find(c => c.id === filterCategory);
    
    if (filterCategory === 'men') {
      return {
        title: "Men's Collection",
        subtitle: "Performance meets poise",
        hero: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=1600"
      };
    } else if (filterCategory === 'women') {
      return {
        title: "Women's Collection",
        subtitle: "Elegant versatility",
        hero: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=1600"
      };
    } else if (filterCategory === 'kids') {
      return {
        title: "Kids' Collection",
        subtitle: "Play without limits",
        hero: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&q=80&w=1600"
      };
    } else if (activeCat) {
       return {
          title: `${activeCat.name} Collection`,
          subtitle: "Explore our latest curation",
          hero: "https://images.unsplash.com/photo-1512374382149-4332c6c75d61?auto=format&fit=crop&q=80&w=1600"
       };
    } else {
      return {
        title: "Apex Seasonal Drop",
        subtitle: "Steer the Future",
        hero: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=1600"
      };
    }
  };

  const info = getPageInfo();

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      {/* Dynamic Hero Section */}
      <div className="relative rounded-2xl sm:rounded-[2rem] overflow-hidden mb-8 sm:mb-16 h-[300px] sm:h-[550px] bg-gray-900 group shadow-xl">
        <img 
          src={info.hero} 
          className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000"
          alt="Hero"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6 sm:p-12 text-white">
          <span className="text-red-600 font-black tracking-[0.2em] sm:tracking-[0.4em] text-[8px] sm:text-[10px] mb-2 sm:mb-4 uppercase">Premium Series 2024</span>
          <h2 className="text-3xl sm:text-8xl font-black mb-4 sm:mb-8 uppercase tracking-tighter leading-none">
            {info.title.split(' ')[0]} <br/>
            <span className="text-red-600">{info.title.split(' ').slice(1).join(' ') || 'Edition'}</span>
          </h2>
          <p className="text-sm sm:text-lg font-bold text-gray-300 mb-6 sm:mb-10 tracking-wide uppercase italic hidden sm:block">{info.subtitle}</p>
          {filterCategory === 'all' && (
            <div className="flex gap-2 sm:gap-4">
              <button onClick={() => onNavigate('men')} className="bg-white text-black font-black px-6 sm:px-10 py-3 sm:py-4 rounded-full text-[10px] sm:text-xs uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all active:scale-95">Men</button>
              <button onClick={() => onNavigate('women')} className="bg-transparent border-2 border-white text-white font-black px-6 sm:px-10 py-3 sm:py-4 rounded-full text-[10px] sm:text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-all active:scale-95">Women</button>
            </div>
          )}
        </div>
      </div>

      {/* Categories Cards */}
      {filterCategory === 'all' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8 mb-12 sm:mb-20">
          {categories.slice(0, 3).map((item) => (
            <div 
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="group relative h-48 sm:h-80 rounded-2xl sm:rounded-3xl overflow-hidden cursor-pointer shadow-lg active:scale-95 transition-all"
            >
              <img src="https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=600" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80" />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-red-600/40 transition-colors flex flex-col justify-center items-center text-white">
                <h3 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter">{item.name}</h3>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">Explore</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* AI Assistant Section */}
      <div className="bg-white border-2 border-red-50 shadow-lg rounded-2xl sm:rounded-3xl p-6 sm:p-10 mb-8 sm:mb-16 flex flex-col lg:flex-row items-center gap-6 sm:gap-8 relative overflow-hidden group">
         <div className="bg-red-600 text-white p-4 sm:p-6 rounded-2xl shadow-xl flex-shrink-0">
            <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          </div>
          <div className="flex-1 text-center lg:text-left">
            <h3 className="text-xl sm:text-3xl font-black uppercase tracking-tighter text-gray-900 mb-1 leading-none">AI Shopping Consultant</h3>
            <p className="text-[10px] sm:text-sm text-gray-500 font-bold uppercase tracking-widest opacity-60 italic">Find your match via reasoning.</p>
          </div>
          <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-3">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Ask: 'Red party shoes'..."
              className="flex-1 lg:w-80 bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-3 sm:py-4 outline-none focus:border-red-600 transition-all font-bold text-sm"
            />
            <button 
              onClick={handleAskAi}
              disabled={isAskingAi}
              className="bg-black text-white font-black px-8 py-3 sm:py-4 rounded-2xl hover:bg-red-600 transition-all shadow-xl disabled:opacity-50 text-xs sm:text-sm uppercase tracking-widest active:scale-95"
            >
              {isAskingAi ? 'Wait...' : 'Ask AI'}
            </button>
          </div>
          {aiAdvice && (
            <div className="absolute inset-0 bg-red-600 text-white p-6 sm:p-8 animate-in fade-in flex items-center justify-between text-xs sm:text-base">
              <p className="text-sm sm:text-lg font-black italic pr-4">"{aiAdvice}"</p>
              <button onClick={() => setAiAdvice('')} className="bg-white text-black px-4 sm:px-6 py-1 sm:py-2 rounded-full font-black text-[10px] sm:text-xs flex-shrink-0">Dismiss</button>
            </div>
          )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12" id="catalog">
        {/* Mobile Filter Toggle */}
        <button 
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="lg:hidden w-full flex items-center justify-center gap-2 bg-white border-2 border-gray-100 p-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-sm active:bg-gray-50"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
          {showMobileFilters ? 'Hide Filters' : 'Filters & Price'}
        </button>

        <aside className={`${showMobileFilters ? 'block' : 'hidden'} lg:block w-full lg:w-72 space-y-8 sm:space-y-12 animate-in slide-in-from-top-4 lg:animate-none`}>
          {filterCategory === 'all' && (
             <div>
              <h4 className="font-black text-[10px] uppercase tracking-[0.3em] mb-4 sm:mb-6 text-gray-400">Department</h4>
              <div className="grid grid-cols-2 lg:flex lg:flex-col gap-2 sm:gap-3">
                {categories.map(cat => (
                  <button 
                    key={cat.id} 
                    onClick={() => setFilterCategory(cat.id)}
                    className={`flex items-center justify-center lg:justify-between w-full text-center lg:text-left py-2 sm:py-3 px-2 sm:px-4 rounded-xl transition-all text-[9px] sm:text-[10px] font-black uppercase tracking-widest ${filterCategory === cat.id ? 'bg-black text-white' : 'bg-gray-50 lg:bg-transparent text-gray-500 hover:bg-gray-100'}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <h4 className="font-black text-[10px] uppercase tracking-[0.3em] mb-6 text-gray-400">Budget: {priceRange} BDT</h4>
            <div className="space-y-4">
              <input 
                type="range" min="0" max="10000" step="500" value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600" 
              />
              <div className="flex justify-between text-[9px] font-black text-gray-400 uppercase">
                <span>0 BDT</span>
                <span>10,000+ BDT</span>
              </div>
            </div>
          </div>

          <button 
            onClick={() => { setFilterCategory(forcedCategory); setPriceRange(10000); setShowMobileFilters(false); }}
            className="w-full py-3 sm:py-4 text-[10px] font-black uppercase tracking-widest text-red-600 border-2 border-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-lg active:scale-95"
          >
            Clear Filters
          </button>
        </aside>

        <div className="flex-1">
          <div className="flex justify-between items-center mb-6 sm:mb-10 pb-4 sm:pb-6 border-b border-gray-100">
            <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tighter text-gray-900">{filterCategory === 'all' ? 'Featured' : (categories.find(c => c.id === filterCategory)?.name || 'Items')}</h3>
            <div className="flex items-center gap-2">
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent font-black text-[10px] sm:text-xs uppercase tracking-widest outline-none border-b-2 border-black py-1"
              >
                <option value="newest">Latest</option>
                <option value="price-low">Low Price</option>
                <option value="price-high">High Price</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-10">
            {filteredProducts.map(p => (
              <div 
                key={p.id} 
                className="group flex flex-col h-full bg-white rounded-2xl sm:rounded-[2rem] overflow-hidden border border-gray-50 hover:border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer p-1 sm:p-0"
                onClick={() => openProduct(p)}
              >
                <div className="relative aspect-square overflow-hidden bg-gray-50 sm:rounded-none rounded-xl">
                  <img src={p.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute top-2 right-2 sm:top-4 sm:right-4">
                    <button 
                      onClick={(e) => { e.stopPropagation(); onToggleWishlist(p.id); }}
                      className={`p-2 sm:p-3 rounded-full transition-all active:scale-90 ${wishlist.includes(p.id) ? 'bg-red-600 text-white' : 'bg-white/80 text-black'}`}
                    >
                      <svg className="w-3 h-3 sm:w-5 sm:h-5" fill={wishlist.includes(p.id) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                    </button>
                  </div>
                  {p.discountPrice && (
                    <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 bg-red-600 text-white text-[8px] sm:text-[10px] font-black px-2 sm:px-3 py-0.5 sm:py-1 rounded-full uppercase">Sale</div>
                  )}
                </div>
                <div className="p-3 sm:p-8 flex-1 flex flex-col">
                  <p className="text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 sm:mb-2">{p.brand}</p>
                  <h4 className="text-xs sm:text-xl font-black uppercase tracking-tighter text-gray-900 group-hover:text-red-600 transition-colors mb-2 sm:mb-4 line-clamp-1 sm:line-clamp-none">{p.name}</h4>
                  <div className="mt-auto flex items-baseline justify-between">
                    <span className="text-sm sm:text-2xl font-black">{p.discountPrice || p.price} BDT</span>
                    {p.discountPrice && <span className="hidden sm:inline text-xs text-gray-400 line-through font-bold ml-2">{p.price}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Product Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-2 sm:p-4 backdrop-blur-md transition-all animate-in fade-in">
          <div className="bg-white w-full max-w-6xl rounded-2xl sm:rounded-[3rem] overflow-hidden flex flex-col lg:flex-row relative shadow-2xl h-[90vh] lg:h-auto max-h-[90vh]">
            <button 
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 sm:top-8 sm:right-8 z-30 bg-gray-100/50 backdrop-blur hover:bg-black text-black hover:text-white p-2 sm:p-3 rounded-full transition-all active:scale-90"
            >
              <svg className="w-5 h-5 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>

            <div className="w-full lg:w-1/2 bg-gray-50 p-4 sm:p-10 flex flex-col justify-center overflow-hidden h-[40%] lg:h-auto">
              <div className="aspect-square rounded-xl sm:rounded-[2rem] overflow-hidden bg-white shadow-lg p-2 sm:p-6 flex flex-col items-center justify-center h-full">
                <div className="flex-1 w-full overflow-hidden flex items-center justify-center">
                  <img src={activeImage} className="max-w-full max-h-full object-contain sm:object-cover rounded-xl" alt={selectedProduct.name} />
                </div>
                {/* Image Thumbnails Strip */}
                {selectedProduct.images.length > 1 && (
                  <div className="flex gap-2 mt-4 overflow-x-auto w-full justify-center pb-2">
                    {selectedProduct.images.map((img, i) => (
                      <button 
                        key={i} 
                        onClick={() => setActiveImage(img)}
                        className={`w-12 h-12 sm:w-16 sm:h-16 rounded-lg border-2 flex-shrink-0 overflow-hidden transition-all ${activeImage === img ? 'border-red-600' : 'border-transparent opacity-60 hover:opacity-100'}`}
                      >
                        <img src={img} className="w-full h-full object-cover" alt={`${selectedProduct.name} ${i}`} />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="w-full lg:w-1/2 p-6 sm:p-12 overflow-y-auto flex flex-col bg-white h-[60%] lg:h-auto">
              <span className="text-red-600 font-black text-[9px] sm:text-[10px] uppercase tracking-widest mb-2 sm:mb-4">{selectedProduct.brand} Premium</span>
              <h2 className="text-2xl sm:text-5xl font-black uppercase tracking-tighter text-gray-900 mb-2 sm:mb-8 leading-none">{selectedProduct.name}</h2>
              <p className="text-xl sm:text-3xl font-black text-red-600 mb-4 sm:mb-10">{selectedProduct.discountPrice || selectedProduct.price} BDT</p>

              <div className="mb-6 sm:mb-10">
                <h4 className="font-black text-[9px] sm:text-[10px] uppercase mb-2 sm:mb-4 text-gray-400 tracking-widest">Select Size</h4>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {selectedProduct.variants.map(v => (
                    <button 
                      key={v.id} 
                      onClick={() => setSelectedVariant(v)}
                      className={`w-10 h-10 sm:w-14 sm:h-14 rounded-lg sm:rounded-2xl border-2 font-black transition-all text-xs sm:text-base ${selectedVariant?.id === v.id ? 'bg-black border-black text-white scale-110 shadow-xl' : 'border-gray-100 hover:border-black'}`}
                    >
                      {v.size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Details Section */}
              <div className="mb-6 sm:mb-12 p-4 sm:p-8 bg-gray-50 rounded-2xl sm:rounded-[2rem] border-l-4 sm:border-l-8 border-gray-900">
                <h4 className="font-black text-[8px] sm:text-[10px] uppercase text-gray-400 mb-2 tracking-widest">Product Details</h4>
                <p className="text-xs sm:text-sm font-bold text-gray-700 leading-relaxed">
                  {selectedProduct.description}
                </p>
              </div>

              <button 
                onClick={() => {
                  if (selectedVariant) {
                    onAddToCart({ ...selectedProduct, selectedVariant, quantity: 1 });
                    setSelectedProduct(null);
                  }
                }}
                className="w-full bg-black text-white font-black py-4 sm:py-6 rounded-2xl sm:rounded-[2rem] uppercase tracking-widest text-xs sm:text-sm hover:bg-red-600 transition-all shadow-xl active:scale-95 mt-auto sm:mt-0"
              >
                Add to Bag
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Storefront;
