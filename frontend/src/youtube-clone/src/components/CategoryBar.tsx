import { categories } from '../data/mockData';

interface CategoryBarProps {
  activeCategory: string;
  setActiveCategory: (category: string) => void;
}

export function CategoryBar({ activeCategory, setActiveCategory }: CategoryBarProps) {
  return (
    <div className="sticky top-0 bg-white z-40 py-3 px-4 flex gap-3 overflow-x-auto scrollbar-hide border-b border-gray-200">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => setActiveCategory(category)}
          className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            activeCategory === category 
              ? 'bg-black text-white' 
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
