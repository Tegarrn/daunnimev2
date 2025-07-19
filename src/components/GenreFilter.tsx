// src/components/GenreFilter.tsx

'use client';

interface GenreFilterProps {
  categories: { [key: string]: string[] };
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export default function GenreFilter({ categories, selectedCategory, onSelectCategory }: GenreFilterProps) {
  return (
    <div className="mb-8">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onSelectCategory('Semua')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            selectedCategory === 'Semua'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Semua
        </button>
        {Object.keys(categories).map((categoryName) => (
          <button
            key={categoryName}
            onClick={() => onSelectCategory(categoryName)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              selectedCategory === categoryName
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {categoryName}
          </button>
        ))}
      </div>
    </div>
  );
}