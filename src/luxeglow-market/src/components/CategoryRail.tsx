import React from 'react';

const CATEGORIES = [
  { name: 'Makeup', image: 'https://images.unsplash.com/photo-1596462502278-27bfdd403348?q=80&w=1887&auto=format&fit=crop' },
  { name: 'Skincare', image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=2070&auto=format&fit=crop' },
  { name: 'Hair', image: 'https://images.unsplash.com/photo-1562324626-70f18e34b6c6?q=80&w=2070&auto=format&fit=crop' },
  { name: 'Fragrance', image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=1904&auto=format&fit=crop' },
  { name: 'Tools', image: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=2069&auto=format&fit=crop' },
  { name: 'Bath', image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=2070&auto=format&fit=crop' },
  { name: 'Gifts', image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=2040&auto=format&fit=crop' },
  { name: 'Men', image: 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?q=80&w=1780&auto=format&fit=crop' },
];

export const CategoryRail = () => {
  return (
    <div className="py-8 border-b border-gray-100 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <div key={cat.name} className="flex flex-col items-center gap-3 min-w-[80px] cursor-pointer group">
              <div className="w-20 h-20 rounded-full p-[2px] bg-gradient-to-tr from-gray-200 to-gray-100 group-hover:from-secondary group-hover:to-primary transition-all duration-300">
                <div className="w-full h-full rounded-full border-2 border-white overflow-hidden">
                  <img 
                    src={cat.image} 
                    alt={cat.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
              </div>
              <span className="text-xs font-bold uppercase tracking-wide text-gray-900 group-hover:text-secondary transition-colors">
                {cat.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
