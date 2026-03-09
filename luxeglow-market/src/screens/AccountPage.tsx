import React, { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Button } from '../primitives/Button';
import { User, MapPin, Package, Beaker, Crown, Settings, LogOut, Edit2, Plus, Trash2, ClipboardList, Sparkles } from 'lucide-react';
import { cn } from '../primitives/Button';
import { useCart } from '../context/CartContext';
import { Product } from '../components/ProductCard';

interface AccountPageProps {
  onNavigate?: (screen: 'home' | 'shop') => void;
  onLogout?: () => void;
}

type Tab = 'overview' | 'info' | 'addresses' | 'orders' | 'tests' | 'loyalty' | 'settings';

export const AccountPage = ({ onNavigate, onLogout }: AccountPageProps) => {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const { addToCart } = useCart();

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'info', label: 'User Information', icon: Edit2 },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
    { id: 'orders', label: 'Orders', icon: Package },
    { id: 'tests', label: 'Beauty Tests', icon: Beaker },
    { id: 'loyalty', label: 'Loyalty Program', icon: Crown },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="bg-black text-white p-8 rounded-lg flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-display font-bold mb-2">Welcome back, Sarah!</h2>
                <p className="text-gray-400">Member since 2023</p>
              </div>
              <div className="text-right">
                <p className="text-sm uppercase tracking-wide text-gray-400 mb-1">Loyalty Points</p>
                <p className="text-4xl font-bold text-secondary">1,250</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                <h3 className="font-bold uppercase tracking-wide mb-4 flex items-center gap-2">
                  <Package size={18} /> Recent Order
                </h3>
                <div className="bg-white p-4 rounded border border-gray-200 mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-bold">#ORD-88291</span>
                    <span className="text-green-600 font-medium">Delivered</span>
                  </div>
                  <p className="text-sm text-gray-500">Placed on Oct 12, 2023</p>
                </div>
                <button onClick={() => setActiveTab('orders')} className="text-sm font-bold underline hover:text-secondary">View All Orders</button>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                <h3 className="font-bold uppercase tracking-wide mb-4 flex items-center gap-2">
                  <MapPin size={18} /> Default Address
                </h3>
                <div className="bg-white p-4 rounded border border-gray-200 mb-4 text-sm text-gray-600">
                  <p className="font-bold text-black mb-1">Sarah Miller</p>
                  <p>123 Beauty Lane, Suite 100</p>
                  <p>New York, NY 10012</p>
                  <p>United States</p>
                </div>
                <button onClick={() => setActiveTab('addresses')} className="text-sm font-bold underline hover:text-secondary">Manage Addresses</button>
              </div>
            </div>
          </div>
        );

      case 'info':
        return (
          <div className="max-w-2xl animate-in fade-in duration-300">
            <h2 className="text-2xl font-display font-bold uppercase tracking-wide mb-8">User Information</h2>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input type="text" defaultValue="Sarah" className="w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black px-4 py-2 border" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input type="text" defaultValue="Miller" className="w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black px-4 py-2 border" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input type="email" defaultValue="sarah.miller@example.com" className="w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black px-4 py-2 border" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input type="tel" defaultValue="+1 (555) 123-4567" className="w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black px-4 py-2 border" />
              </div>
              <div className="pt-4">
                <Button>Save Changes</Button>
              </div>
            </form>
          </div>
        );

      case 'addresses':
        return (
          <div className="animate-in fade-in duration-300">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-display font-bold uppercase tracking-wide">Addresses</h2>
              <Button size="sm" className="flex items-center gap-2"><Plus size={16} /> Add New</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-black rounded-lg p-6 relative">
                <span className="absolute top-4 right-4 bg-black text-white text-xs px-2 py-1 rounded">Default</span>
                <p className="font-bold mb-2">Home</p>
                <div className="text-sm text-gray-600 space-y-1 mb-4">
                  <p className="font-medium text-black">Sarah Miller</p>
                  <p>123 Beauty Lane, Suite 100</p>
                  <p>New York, NY 10012</p>
                  <p>United States</p>
                </div>
                <div className="flex gap-4 text-sm font-medium">
                  <button className="text-gray-600 hover:text-black">Edit</button>
                  <button className="text-red-500 hover:text-red-700">Remove</button>
                </div>
              </div>
              <div className="border border-gray-200 rounded-lg p-6">
                <p className="font-bold mb-2">Office</p>
                <div className="text-sm text-gray-600 space-y-1 mb-4">
                  <p className="font-medium text-black">Sarah Miller</p>
                  <p>456 Corporate Blvd, Floor 12</p>
                  <p>San Francisco, CA 94105</p>
                  <p>United States</p>
                </div>
                <div className="flex gap-4 text-sm font-medium">
                  <button className="text-gray-600 hover:text-black">Edit</button>
                  <button className="text-red-500 hover:text-red-700">Remove</button>
                  <button className="text-gray-400 hover:text-black">Set as Default</button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'orders':
        const orders = [
          { 
            id: 'ORD-88291', 
            date: 'Oct 12, 2023', 
            status: 'Delivered', 
            total: 145.00, 
            subtotal: 135.00,
            tax: 10.00,
            shipping: 0,
            items: [
              {
                id: '1',
                name: 'Luminous Silk Foundation',
                brand: 'Giorgio Armani',
                price: 45.00,
                quantity: 1,
                image: 'https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?q=80&w=2070&auto=format&fit=crop'
              },
              {
                id: '2',
                name: 'Lip Glow Oil',
                brand: 'Dior',
                price: 40.00,
                quantity: 2,
                image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?q=80&w=2030&auto=format&fit=crop'
              }
            ]
          },
          { 
            id: 'ORD-88102', 
            date: 'Sep 28, 2023', 
            status: 'Delivered', 
            total: 82.50, 
            subtotal: 75.00,
            tax: 7.50,
            shipping: 0,
            items: [
              {
                id: '3',
                name: 'Soft Pinch Liquid Blush',
                brand: 'Rare Beauty',
                price: 23.00,
                quantity: 1,
                image: 'https://images.unsplash.com/photo-1596462502278-27bfdd403348?q=80&w=1887&auto=format&fit=crop'
              }
            ]
          },
          { 
            id: 'ORD-87554', 
            date: 'Aug 15, 2023', 
            status: 'Delivered', 
            total: 210.00, 
            subtotal: 195.00,
            tax: 15.00,
            shipping: 0,
            items: [
              {
                id: '4',
                name: 'Airbrush Flawless Finish',
                brand: 'Charlotte Tilbury',
                price: 48.00,
                quantity: 2,
                image: 'https://images.unsplash.com/photo-1599305090598-fe179d501227?q=80&w=1888&auto=format&fit=crop'
              }
            ]
          },
        ];

        const selectedOrder = orders.find(o => o.id === selectedOrderId);

        const handleReorder = (items: any[]) => {
          items.forEach(item => {
            addToCart({
              id: item.id,
              name: item.name,
              brand: item.brand,
              price: item.price,
              image: item.image,
              rating: 5, // Mock
              reviews: 100 // Mock
            } as Product, item.quantity);
          });
        };

        if (selectedOrder) {
          return (
            <div className="animate-in fade-in duration-300">
              <button 
                onClick={() => setSelectedOrderId(null)}
                className="flex items-center text-sm text-gray-500 hover:text-black mb-6 transition-colors group"
              >
                <span className="mr-2 group-hover:-translate-x-1 transition-transform">&larr;</span>
                Back to Orders
              </button>

              <div className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Header */}
                <div className="bg-gray-50 p-6 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4">
                  <div>
                    <h4 className="font-bold text-xl mb-1">Order {selectedOrder.id}</h4>
                    <p className="text-sm text-gray-500">Placed on {selectedOrder.date}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wide">
                      {selectedOrder.status}
                    </span>
                    <Button size="sm" onClick={() => handleReorder(selectedOrder.items)}>
                      Order Again
                    </Button>
                  </div>
                </div>

                {/* Items */}
                <div className="p-6 border-b border-gray-100">
                  <h5 className="font-bold uppercase tracking-wide text-sm mb-4">Items</h5>
                  <div className="space-y-6">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex gap-4">
                        <div className="w-16 h-20 bg-gray-100 rounded shrink-0 overflow-hidden">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h6 className="font-bold text-sm">{item.name}</h6>
                              <p className="text-xs text-gray-500">{item.brand}</p>
                            </div>
                            <p className="font-medium text-sm">${(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Qty: {item.quantity} x ${item.price.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Receipt */}
                <div className="p-6 bg-gray-50/50">
                  <h5 className="font-bold uppercase tracking-wide text-sm mb-4">Order Summary</h5>
                  <div className="space-y-2 text-sm max-w-xs ml-auto">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span>${selectedOrder.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Shipping</span>
                      <span>{selectedOrder.shipping === 0 ? 'Free' : `$${selectedOrder.shipping.toFixed(2)}`}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Tax</span>
                      <span>${selectedOrder.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200 mt-2">
                      <span>Total</span>
                      <span>${selectedOrder.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        }

        return (
          <div className="animate-in fade-in duration-300">
            <h2 className="text-2xl font-display font-bold uppercase tracking-wide mb-8">Order History</h2>
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order.id} className="border border-gray-200 rounded-lg p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-black transition-colors cursor-pointer group" onClick={() => setSelectedOrderId(order.id)}>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-bold text-lg group-hover:text-secondary transition-colors">{order.id}</span>
                      <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">{order.status}</span>
                    </div>
                    <p className="text-sm text-gray-500">{order.date} • {order.items.reduce((acc, item) => acc + item.quantity, 0)} Items</p>
                  </div>
                  <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                    <span className="font-bold text-lg">${order.total.toFixed(2)}</span>
                    <Button variant="outline" size="sm">View Details</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'tests':
        const takenTests = [
          {
            id: 'TEST-2023-001',
            date: 'Oct 15, 2023',
            type: 'Advanced Skin Analysis',
            pharmacist: 'Dr. Emily Chen',
            notes: 'Patient shows signs of dehydration in the T-zone area. Sensitivity redness observed on cheeks. Recommended focusing on barrier repair and hydration.',
            results: ['Dehydrated', 'Sensitive', 'Combination'],
            recommendations: [
              {
                id: '1',
                name: 'Luminous Silk Foundation',
                brand: 'Giorgio Armani',
                price: 45.00,
                image: 'https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?q=80&w=2070&auto=format&fit=crop',
                rating: 4.8,
                reviews: 1240
              },
              {
                id: '3',
                name: 'Soft Pinch Liquid Blush',
                brand: 'Rare Beauty',
                price: 23.00,
                image: 'https://images.unsplash.com/photo-1596462502278-27bfdd403348?q=80&w=1887&auto=format&fit=crop',
                rating: 4.7,
                reviews: 890
              }
            ]
          },
          {
            id: 'TEST-2023-002',
            date: 'Jul 22, 2023',
            type: 'Hair Health Consultation',
            pharmacist: 'Sarah Johnson',
            notes: 'Scalp is healthy but ends are dry. Recommended a hydrating mask and heat protectant.',
            results: ['Dry Ends', 'Healthy Scalp'],
            recommendations: []
          }
        ];

        const selectedTest = takenTests.find(t => t.id === selectedTestId);

        if (selectedTest) {
          return (
            <div className="animate-in fade-in duration-300">
              <button 
                onClick={() => setSelectedTestId(null)}
                className="flex items-center text-sm text-gray-500 hover:text-black mb-6 transition-colors group"
              >
                <span className="mr-2 group-hover:-translate-x-1 transition-transform">&larr;</span>
                Back to Tests
              </button>

              <div className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Header */}
                <div className="bg-gray-50 p-6 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4">
                  <div>
                    <h4 className="font-bold text-xl mb-1">{selectedTest.type}</h4>
                    <p className="text-sm text-gray-500">Conducted by {selectedTest.pharmacist} • {selectedTest.date}</p>
                  </div>
                  <div className="flex gap-2">
                    {selectedTest.results.map(tag => (
                      <span key={tag} className="bg-white border border-gray-200 px-3 py-1 text-xs font-bold uppercase tracking-wide rounded-full text-gray-700">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="mb-8">
                    <h5 className="font-bold uppercase tracking-wide text-sm mb-3 text-gray-900 flex items-center gap-2">
                      <ClipboardList size={16} /> Pharmacist Notes
                    </h5>
                    <div className="bg-blue-50/50 p-5 rounded-md border border-blue-100">
                      <p className="text-gray-700 text-sm leading-relaxed italic">
                        "{selectedTest.notes}"
                      </p>
                    </div>
                  </div>

                  {selectedTest.recommendations.length > 0 && (
                    <div>
                      <h5 className="font-bold uppercase tracking-wide text-sm mb-4 text-gray-900 flex items-center gap-2">
                        <Sparkles size={16} /> Recommended Products
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedTest.recommendations.map(product => (
                          <div key={product.id} className="flex gap-4 p-4 border border-gray-100 rounded-lg hover:border-black transition-colors group bg-white">
                            <div className="w-16 h-20 bg-gray-100 rounded shrink-0 overflow-hidden">
                              <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            </div>
                            <div className="flex-1 flex flex-col justify-between">
                              <div>
                                <p className="text-xs text-gray-500 mb-1">{product.brand}</p>
                                <h6 className="font-bold text-sm line-clamp-1">{product.name}</h6>
                              </div>
                              <div className="flex justify-between items-end mt-2">
                                <span className="font-medium text-sm">${product.price.toFixed(2)}</span>
                                <button 
                                  onClick={() => addToCart(product as Product)}
                                  className="text-xs font-bold uppercase tracking-wide underline hover:text-secondary"
                                >
                                  Add to Bag
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        }

        return (
          <div className="animate-in fade-in duration-300 space-y-12">
            {/* QR Code Section */}
            <div className="bg-white border border-gray-200 p-8 rounded-lg flex flex-col md:flex-row items-center gap-8 shadow-sm">
              <div className="shrink-0 bg-white p-2 border border-gray-100 rounded-lg shadow-sm">
                 <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=LuxeGlow-User-123" alt="Your Beauty ID" className="w-32 h-32" />
              </div>
              <div>
                <h3 className="text-xl font-display font-bold uppercase tracking-wide mb-2">In-Store Beauty Pass</h3>
                <p className="text-gray-600 mb-4 max-w-lg">
                  Scan this QR code at any LuxeGlow store to start a new consultation with our pharmacists.
                  Your results will instantly appear here.
                </p>
                <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Member ID: 882910</p>
              </div>
            </div>

            {/* Past Tests List */}
            <div>
              <h3 className="text-xl font-display font-bold uppercase tracking-wide mb-6">Past Consultations</h3>
              <div className="space-y-4">
                {takenTests.map(test => (
                  <div 
                    key={test.id} 
                    onClick={() => setSelectedTestId(test.id)}
                    className="border border-gray-200 rounded-lg p-6 hover:border-black transition-all cursor-pointer group bg-white hover:shadow-md"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-lg group-hover:text-secondary transition-colors">{test.type}</h4>
                        <p className="text-sm text-gray-500">{test.date} • {test.pharmacist}</p>
                      </div>
                      <span className="text-gray-400 group-hover:translate-x-1 transition-transform">&rarr;</span>
                    </div>
                    <div className="flex gap-2 mt-3">
                      {test.results.map(tag => (
                        <span key={tag} className="bg-gray-50 border border-gray-100 px-2 py-1 text-xs font-medium uppercase tracking-wide rounded text-gray-600">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'loyalty':
        const tier = 'Gold'; // Mock tier
        const points = 750;
        const nextTierPoints = 1000;
        const progress = (points / nextTierPoints) * 100;
        
        const getTierColor = (tier: string) => {
          switch(tier) {
            case 'Silver': return 'bg-gray-400';
            case 'Gold': return 'bg-yellow-500';
            case 'Platinum': return 'bg-gray-900';
            default: return 'bg-gray-800';
          }
        };

        const tierColor = getTierColor(tier);

        return (
          <div className="animate-in fade-in duration-300">
            <div className={cn("text-white rounded-xl p-8 mb-8 relative overflow-hidden", tierColor)}>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h2 className="text-3xl font-display font-bold mb-1">{tier} Member</h2>
                    <p className="text-white/80">Valid until Dec 2024</p>
                  </div>
                  <Crown size={48} className="text-white/90" />
                </div>
                <div className="w-full bg-black/20 h-2 rounded-full mb-2">
                  <div className="bg-white h-2 rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
                <p className="text-sm text-white/80">{points} points to Platinum Status</p>
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            </div>

            <h3 className="font-bold uppercase tracking-wide mb-4">Points History</h3>
            <div className="space-y-4">
              {[
                { date: 'Oct 12, 2023', action: 'Order #ORD-88291', points: '+145' },
                { date: 'Sep 28, 2023', action: 'Order #ORD-88102', points: '+82' },
                { date: 'Aug 15, 2023', action: 'Order #ORD-87554', points: '+210' },
                { date: 'Jul 01, 2023', action: 'Birthday Bonus', points: '+50' },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center border-b border-gray-100 pb-4 last:border-0">
                  <div>
                    <p className="font-bold text-sm">{item.action}</p>
                    <p className="text-xs text-gray-500">{item.date}</p>
                  </div>
                  <span className="font-bold text-green-600">{item.points}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="max-w-2xl animate-in fade-in duration-300">
            <h2 className="text-2xl font-display font-bold uppercase tracking-wide mb-8">Account Settings</h2>
            <div className="space-y-8">
              <div>
                <h3 className="font-bold mb-4">Notifications</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded text-black focus:ring-black" />
                    <span className="text-gray-700">Email me about new arrivals and sales</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded text-black focus:ring-black" />
                    <span className="text-gray-700">Order status updates via SMS</span>
                  </label>
                </div>
              </div>

              <div className="pt-8 border-t border-gray-100">
                <h3 className="font-bold mb-4 text-red-600">Danger Zone</h3>
                <button className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center gap-2">
                  <Trash2 size={16} /> Delete Account
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      <Navbar onNavigate={onNavigate} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar Navigation */}
          <aside className="lg:w-64 shrink-0">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as Tab)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-colors",
                    activeTab === tab.id 
                      ? "bg-black text-white" 
                      : "text-gray-600 hover:bg-gray-50 hover:text-black"
                  )}
                >
                  <tab.icon size={18} />
                  {tab.label}
                </button>
              ))}
              <div className="pt-4 mt-4 border-t border-gray-100">
                <button 
                  onClick={onLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
                >
                  <LogOut size={18} />
                  Log Out
                </button>
              </div>
            </nav>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 min-h-[500px]">
            {renderContent()}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
