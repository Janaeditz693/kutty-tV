import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Layers } from 'lucide-react';

const CollectionCard = ({ collection }) => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language || 'en';

  const displayName = currentLang.startsWith('ta') && collection.nameTa ? collection.nameTa : collection.name;
  const displayDesc = currentLang.startsWith('ta') && collection.descriptionTa ? collection.descriptionTa : collection.description;

  return (
    <motion.div
      whileHover={{ scale: 1.04, y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="relative flex-none w-72 sm:w-80 h-44 rounded-premium overflow-hidden border border-theme-coffee/10 dark:border-theme-darkBorder shadow-retro cursor-pointer group"
    >
      <Link to={`/collections?id=${collection.id}`}>
        {/* Background Image */}
        <div className="absolute inset-0 bg-theme-coffee">
          <img
            src={collection.thumbnail}
            alt={displayName}
            className="w-full h-full object-cover opacity-60 group-hover:opacity-45 group-hover:scale-105 transition-all duration-500"
          />
          {/* Nostalgic TV scanlines overlay */}
          <div className="crt-screen-overlay opacity-15"></div>
        </div>

        {/* Vintage color overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

        {/* Text Details */}
        <div className="absolute bottom-0 inset-x-0 p-5 flex flex-col justify-end text-theme-cream">
          {/* Badge */}
          <div className="w-fit p-1 bg-theme-orange rounded-md text-[9px] font-extrabold uppercase tracking-widest mb-1.5 flex items-center gap-1 shadow-sm">
            <Layers size={10} />
            <span>Collection</span>
          </div>

          <h3 className="font-extrabold text-base sm:text-lg tracking-wide drop-shadow-sm group-hover:text-theme-orange transition-colors duration-200">
            {displayName}
          </h3>
          
          <p className="text-xs text-theme-cream/80 line-clamp-2 mt-1 leading-normal leading-relaxed">
            {displayDesc}
          </p>
        </div>
      </Link>
    </motion.div>
  );
};

export default CollectionCard;
