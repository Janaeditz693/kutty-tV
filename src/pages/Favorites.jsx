import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Heart, PlusCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import CartoonCard from '../components/CartoonCard';

const Favorites = () => {
  const { t } = useTranslation();
  const { favorites } = useApp();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 min-h-[85vh] flex flex-col gap-6">
      
      {/* Header Info */}
      <div className="flex flex-col gap-1.5 mt-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-theme-coffee dark:text-theme-darkText flex items-center gap-2.5">
          <Heart size={24} className="fill-theme-orange stroke-theme-orange" />
          <span>{t('profile.myFavorites')}</span>
        </h1>
        <p className="text-sm text-theme-coffee/60 dark:text-theme-darkText/50 font-medium">
          {t('profile.loginToSave')}
        </p>
      </div>

      {/* Grid Content */}
      <div className="flex-grow">
        {favorites.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {favorites.map((item) => (
              <CartoonCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          // Empty State
          <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-theme-coffee/10 dark:border-theme-darkBorder rounded-premium bg-theme-beige/5 px-4">
            <div className="p-4 rounded-full bg-theme-orange/10 text-theme-orange animate-pulse mb-4">
              <Heart size={36} className="stroke-[2]" />
            </div>
            <h3 className="text-xl font-bold text-theme-coffee dark:text-theme-darkText">
              {t('profile.favoritesEmpty')}
            </h3>
            <p className="text-xs text-theme-coffee/50 dark:text-theme-darkText/40 mt-1.5 max-w-sm leading-relaxed">
              Find your favorite shows on the homepage and click the heart button or "Add to List" to bookmark them here.
            </p>
            <Link
              to="/"
              className="mt-6 flex items-center gap-2 px-5 py-2.5 bg-theme-orange hover:bg-theme-orange-light text-theme-cream font-bold text-sm rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <PlusCircle size={15} />
              <span>Browse Cartoons</span>
            </Link>
          </div>
        )}
      </div>

    </div>
  );
};

export default Favorites;
