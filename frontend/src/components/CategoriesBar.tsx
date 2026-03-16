import { Link, useSearchParams } from 'react-router-dom';

const categories = [
  'Recommended', 'Gaming', 'Music', 'Live', 'Mixes', 'Podcasts', 'News', 'Sports', 'Learning', 'Fashion & Beauty', 'Recently uploaded', 'Watched', 'New to you',
];

export function CategoriesBar() {
  const [searchParams] = useSearchParams();
  const currentQ = searchParams.get('q');
  const isHome = !currentQ || currentQ === '';

  return (
    <div className="sticky top-0 bg-white z-40 py-3 px-4 flex-nowrap flex gap-3 overflow-x-auto scrollbar-hide border-b border-gray-200 min-w-0 shrink-0">
      {categories.map((category) => {
        const isActive = category === 'Recommended' ? isHome : currentQ === category;
        const href = category === 'Recommended' ? '/' : `/search?q=${encodeURIComponent(category)}`;
        return (
          <Link
            key={category}
            to={href}
            className={`shrink-0 whitespace-nowrap px-3 py-1.5 rounded-lg text-sm font-medium transition-colors no-underline ${
              isActive ? 'bg-black text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            {category}
          </Link>
        );
      })}
    </div>
  );
}
