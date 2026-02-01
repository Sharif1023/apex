
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { OrderStatus, Product, Order, Category } from '../types';

const chartData = [
  { name: 'Mon', revenue: 4000 },
  { name: 'Tue', revenue: 3000 },
  { name: 'Wed', revenue: 5500 },
  { name: 'Thu', revenue: 2780 },
  { name: 'Fri', revenue: 1890 },
  { name: 'Sat', revenue: 2390 },
  { name: 'Sun', revenue: 3490 },
];

interface AdminPanelProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ products, setProducts, categories, setCategories, orders, setOrders }) => {
  const [activeTab, setActiveTab] = useState<'dash' | 'products' | 'categories' | 'orders'>('dash');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [managingOrder, setManagingOrder] = useState<Order | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  const deleteProduct = (id: string) => {
    if (confirm("Permanently delete this style from catalog?")) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const deleteCategory = (id: string) => {
    if (confirm("Delete this category? This will affect product filters.")) {
      setCategories(prev => prev.filter(c => c.id !== id));
    }
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    setManagingOrder(null);
  };

  const handleProductSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const images = [
      formData.get('image1') as string,
      formData.get('image2') as string,
      formData.get('image3') as string,
      formData.get('image4') as string,
    ].filter(url => url && url.trim() !== '');

    if (images.length === 0) images.push('https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600');

    const newProd: Product = {
      id: editingProduct?.id || Math.random().toString(36).substr(2, 9),
      name: formData.get('name') as string,
      brand: formData.get('brand') as string,
      price: Number(formData.get('price')),
      categoryId: formData.get('category') as string,
      subcategoryId: 'dynamic',
      description: formData.get('description') as string,
      rating: editingProduct?.rating || 4.5,
      reviewsCount: editingProduct?.reviewsCount || 1,
      images: images,
      variants: editingProduct?.variants || [
        { id: 'v1', size: '40', color: 'Black', stock: 10, sku: 'SKU-' + Date.now() },
        { id: 'v2', size: '42', color: 'Black', stock: 10, sku: 'SKU-' + Date.now() + 1 }
      ]
    };

    if (editingProduct) {
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? newProd : p));
    } else {
      setProducts(prev => [newProd, ...prev]);
    }
    setEditingProduct(null);
    setIsAddingProduct(false);
  };

  const handleCategorySubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const id = name.toLowerCase().replace(/\s+/g, '-');

    const newCat: Category = {
      id: editingCategory?.id || id,
      name: name,
      subcategories: []
    };

    if (editingCategory) {
      setCategories(prev => prev.map(c => c.id === editingCategory.id ? newCat : c));
    } else {
      setCategories(prev => [...prev, newCat]);
    }
    setEditingCategory(null);
    setIsAddingCategory(false);
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-140px)] bg-gray-50">
      {/* Sidebar - Desktop Only */}
      <aside className="w-72 bg-gray-900 text-white hidden lg:block border-r border-gray-800">
        <div className="p-10 border-b border-gray-800">
           <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-red-600 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.5)]"></div>
            <h1 className="text-xl font-black uppercase tracking-tighter">Admin Core</h1>
           </div>
        </div>
        <nav className="mt-10 px-6 space-y-2">
          <button onClick={() => setActiveTab('dash')} className={`w-full text-left px-6 py-4 rounded-2xl flex items-center gap-4 transition-all uppercase text-[10px] font-black tracking-widest ${activeTab === 'dash' ? 'bg-red-600' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>Performance</button>
          <button onClick={() => setActiveTab('products')} className={`w-full text-left px-6 py-4 rounded-2xl flex items-center gap-4 transition-all uppercase text-[10px] font-black tracking-widest ${activeTab === 'products' ? 'bg-red-600' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>Catalog</button>
          <button onClick={() => setActiveTab('categories')} className={`w-full text-left px-6 py-4 rounded-2xl flex items-center gap-4 transition-all uppercase text-[10px] font-black tracking-widest ${activeTab === 'categories' ? 'bg-red-600' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>Categories</button>
          <button onClick={() => setActiveTab('orders')} className={`w-full text-left px-6 py-4 rounded-2xl flex items-center gap-4 transition-all uppercase text-[10px] font-black tracking-widest ${activeTab === 'orders' ? 'bg-red-600' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>Sales</button>
        </nav>
      </aside>

      {/* Mobile Tab Nav */}
      <div className="lg:hidden bg-gray-900 text-white p-4 flex justify-around border-b border-gray-800 sticky top-14 z-40">
        <button onClick={() => setActiveTab('dash')} className={`text-[9px] font-black uppercase tracking-widest py-2 px-3 rounded-lg ${activeTab === 'dash' ? 'bg-red-600' : 'text-gray-400'}`}>Stats</button>
        <button onClick={() => setActiveTab('products')} className={`text-[9px] font-black uppercase tracking-widest py-2 px-3 rounded-lg ${activeTab === 'products' ? 'bg-red-600' : 'text-gray-400'}`}>Catalog</button>
        <button onClick={() => setActiveTab('categories')} className={`text-[9px] font-black uppercase tracking-widest py-2 px-3 rounded-lg ${activeTab === 'categories' ? 'bg-red-600' : 'text-gray-400'}`}>Categories</button>
        <button onClick={() => setActiveTab('orders')} className={`text-[9px] font-black uppercase tracking-widest py-2 px-3 rounded-lg ${activeTab === 'orders' ? 'bg-red-600' : 'text-gray-400'}`}>Sales</button>
      </div>

      <main className="flex-1 p-4 sm:p-12 overflow-y-auto">
        {activeTab === 'dash' && (
          <div className="space-y-8 sm:space-y-12 animate-in fade-in duration-700">
            <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tighter text-gray-900">Retail Overview</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8">
              {[
                { label: 'Revenue', value: 'BDT 450,230', color: 'border-red-600' },
                { label: 'Orders', value: orders.length, color: 'border-black' },
                { label: 'Catalog', value: products.length, color: 'border-gray-300' },
              ].map((stat, i) => (
                <div key={i} className={`bg-white p-6 sm:p-10 rounded-2xl sm:rounded-[2rem] shadow-sm border-l-8 ${stat.color} hover:shadow-lg transition-all`}>
                  <p className="text-[9px] sm:text-[10px] text-gray-500 mb-2 font-black uppercase tracking-widest">{stat.label}</p>
                  <p className="text-2xl sm:text-4xl font-black text-gray-900 leading-none">{stat.value}</p>
                </div>
              ))}
            </div>
            {/* ... charts from previous version ... */}
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10">
              <div className="bg-white p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] shadow-sm border h-80 sm:h-96">
                <h3 className="font-black uppercase text-[10px] mb-6 sm:mb-10 text-gray-400 tracking-widest">Revenue Flow</h3>
                <ResponsiveContainer width="100%" height="80%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                    <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }} />
                    <Line type="monotone" dataKey="revenue" stroke="#ef4444" strokeWidth={5} dot={{ r: 4, fill: '#ef4444', strokeWidth: 2, stroke: '#fff' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] shadow-sm border h-80 sm:h-96">
                <h3 className="font-black uppercase text-[10px] mb-6 sm:mb-10 text-gray-400 tracking-widest">Volume</h3>
                <ResponsiveContainer width="100%" height="80%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                    <Tooltip contentStyle={{ borderRadius: '20px' }} />
                    <Bar dataKey="revenue" fill="#111827" radius={[10, 10, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="space-y-6 sm:space-y-10 animate-in slide-in-from-bottom-8 duration-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
              <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tighter text-gray-900 leading-none">Catalog</h2>
              <button onClick={() => setIsAddingProduct(true)} className="w-full sm:w-auto bg-red-600 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg">Add Product</button>
            </div>
            <div className="bg-white rounded-2xl border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[600px]">
                    <thead className="bg-gray-50 border-b font-black uppercase text-[9px] tracking-widest text-gray-400">
                        <tr><th className="px-8 py-6">Article</th><th className="px-8 py-6">Category</th><th className="px-8 py-6">Price</th><th className="px-8 py-6 text-right">Actions</th></tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {products.map(p => (
                        <tr key={p.id} className="hover:bg-gray-50/50">
                            <td className="px-8 py-6 flex items-center gap-4">
                                <img src={p.images[0]} className="w-12 h-12 rounded-xl object-cover" />
                                <span className="font-black uppercase text-xs">{p.name}</span>
                            </td>
                            <td className="px-8 py-6 text-xs font-black text-gray-400 uppercase">{categories.find(c => c.id === p.categoryId)?.name || p.categoryId}</td>
                            <td className="px-8 py-6 font-black">{p.price} BDT</td>
                            <td className="px-8 py-6 text-right space-x-4">
                                <button onClick={() => setEditingProduct(p)} className="text-blue-600 text-[10px] font-black uppercase">Edit</button>
                                <button onClick={() => deleteProduct(p.id)} className="text-red-600 text-[10px] font-black uppercase">Delete</button>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
           <div className="space-y-6 sm:space-y-10 animate-in slide-in-from-bottom-8 duration-700">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tighter text-gray-900 leading-none">Departments</h2>
                <button onClick={() => setIsAddingCategory(true)} className="w-full sm:w-auto bg-black text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg">Create Category</button>
              </div>
              <div className="bg-white rounded-2xl border overflow-hidden">
                 <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b font-black uppercase text-[9px] tracking-widest text-gray-400">
                       <tr><th className="px-8 py-6">Name</th><th className="px-8 py-6">System ID</th><th className="px-8 py-6 text-right">Actions</th></tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                       {categories.map(cat => (
                          <tr key={cat.id} className="hover:bg-gray-50">
                             <td className="px-8 py-6 font-black uppercase text-xs">{cat.name}</td>
                             <td className="px-8 py-6 text-[10px] font-mono text-gray-400">{cat.id}</td>
                             <td className="px-8 py-6 text-right space-x-4">
                                <button onClick={() => setEditingCategory(cat)} className="text-blue-600 text-[10px] font-black uppercase">Edit</button>
                                <button onClick={() => deleteCategory(cat.id)} className="text-red-600 text-[10px] font-black uppercase">Delete</button>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        )}

        {activeTab === 'orders' && (
           /* ... existing order management from previous version ... */
           <div className="space-y-6 sm:space-y-10">
             <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tighter text-gray-900 leading-none">Order Fulfillment</h2>
             <div className="bg-white rounded-2xl border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[800px]">
                    <thead className="bg-gray-50 border-b text-[9px] font-black uppercase tracking-widest text-gray-400">
                        <tr><th className="px-8 py-6">ID</th><th className="px-8 py-6">Client</th><th className="px-8 py-6">Total</th><th className="px-8 py-6">Status</th><th className="px-8 py-6 text-right">Actions</th></tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {orders.map(order => (
                        <tr key={order.id}>
                            <td className="px-8 py-6 font-black text-red-600">{order.id}</td>
                            <td className="px-8 py-6"><span className="font-black uppercase text-xs">{order.customerName}</span></td>
                            <td className="px-8 py-6 font-black">{order.totalAmount} BDT</td>
                            <td className="px-8 py-6">
                                <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${order.status === OrderStatus.PENDING ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>{order.status}</span>
                            </td>
                            <td className="px-8 py-6 text-right">
                                <button onClick={() => setManagingOrder(order)} className="bg-black text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase">Manage</button>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
             </div>
           </div>
        )}
      </main>

      {/* Category Editor Modal */}
      {(isAddingCategory || editingCategory) && (
        <div className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-white w-full max-w-sm rounded-[2rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
             <div className="p-8 bg-black text-white flex justify-between items-center">
                <h3 className="font-black uppercase tracking-widest text-sm">{editingCategory ? 'Edit Category' : 'New Department'}</h3>
                <button onClick={() => { setIsAddingCategory(false); setEditingCategory(null); }} className="text-gray-400 hover:text-white">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
             </div>
             <form onSubmit={handleCategorySubmit} className="p-10 space-y-8">
                <div>
                   <label className="text-[9px] font-black uppercase text-gray-400 block mb-2 tracking-widest">Category Name</label>
                   <input name="name" defaultValue={editingCategory?.name} required placeholder="Ex: Summer Collection" className="w-full border-2 border-gray-100 p-4 rounded-2xl text-sm font-bold outline-none focus:border-red-600 transition-colors" />
                </div>
                <button type="submit" className="w-full bg-red-600 text-white py-5 rounded-3xl font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl active:scale-95 text-xs">
                   {editingCategory ? 'Save Changes' : 'Launch Department'}
                </button>
             </form>
          </div>
        </div>
      )}

      {/* Product Editor Modal - Dynamic Category Selection */}
      {(isAddingProduct || editingProduct) && (
        <div className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-2 sm:p-4 backdrop-blur-md transition-all overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-2xl sm:rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 border border-gray-100 my-auto">
            <div className="p-6 sm:p-8 bg-gray-900 text-white flex justify-between items-center">
              <h3 className="font-black uppercase tracking-widest text-xs sm:text-sm">{editingProduct ? 'Edit Style' : 'New Entry'}</h3>
              <button onClick={() => { setIsAddingProduct(false); setEditingProduct(null); }} className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <form onSubmit={handleProductSubmit} className="p-6 sm:p-12 space-y-6 sm:space-y-8 max-h-[80vh] overflow-y-auto scrollbar-hide">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="sm:col-span-2">
                  <label className="text-[9px] font-black uppercase text-gray-400 block mb-2 tracking-widest">Article Name</label>
                  <input name="name" defaultValue={editingProduct?.name} required className="w-full border-2 border-gray-100 p-3 sm:p-4 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold outline-none focus:border-red-600 transition-colors" />
                </div>
                <div>
                   <label className="text-[9px] font-black uppercase text-gray-400 block mb-2 tracking-widest">Department (Page)</label>
                   <select name="category" defaultValue={editingProduct?.categoryId || categories[0]?.id} className="w-full border-2 border-gray-100 p-3 sm:p-4 rounded-xl sm:rounded-2xl text-xs font-black outline-none uppercase focus:border-red-600 transition-colors">
                    {categories.map(cat => (
                       <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase text-gray-400 block mb-2 tracking-widest">Price (BDT)</label>
                  <input name="price" type="number" defaultValue={editingProduct?.price} required className="w-full border-2 border-gray-100 p-3 sm:p-4 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold outline-none focus:border-red-600 transition-colors" />
                </div>

                <div className="sm:col-span-2 space-y-3">
                  <label className="text-[9px] font-black uppercase text-gray-400 block tracking-widest">Gallery URLs</label>
                  <input name="image1" placeholder="Primary Image" defaultValue={editingProduct?.images[0]} className="w-full border-2 border-gray-100 p-3 rounded-xl text-xs outline-none focus:border-red-600 transition-colors" />
                  <input name="image2" placeholder="Angle 2" defaultValue={editingProduct?.images[1]} className="w-full border-2 border-gray-100 p-3 rounded-xl text-xs outline-none focus:border-red-600 transition-colors" />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[9px] font-black uppercase text-gray-400 block mb-2 tracking-widest">Specifications</label>
                  <textarea name="description" defaultValue={editingProduct?.description} className="w-full border-2 border-gray-100 p-3 sm:p-4 rounded-xl sm:rounded-2xl text-xs font-bold outline-none focus:border-red-600 transition-colors" rows={3} />
                </div>
              </div>
              <button type="submit" className="w-full bg-red-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl active:scale-95 text-xs">
                {editingProduct ? 'Update Style' : 'Launch Style'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Order Status Modal */}
      {managingOrder && (
        <div className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-white w-full max-w-sm rounded-[2rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-6 bg-red-600 text-white font-black uppercase tracking-widest text-center text-xs">Update Status</div>
            <div className="p-8 space-y-4">
               {[OrderStatus.PENDING, OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.DELIVERED, OrderStatus.CANCELLED].map(status => (
                  <button key={status} onClick={() => updateOrderStatus(managingOrder.id, status)} className={`w-full py-3 rounded-xl text-[9px] font-black uppercase transition-all ${managingOrder.status === status ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'}`}>{status}</button>
               ))}
               <button onClick={() => setManagingOrder(null)} className="w-full text-center text-[9px] font-black uppercase text-gray-400 pt-4">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
