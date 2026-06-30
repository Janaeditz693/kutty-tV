import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Grid, Layers, ArrowLeft } from 'lucide-react';
import { getCollections, getAllCatalogItems } from '../services/db';
import CollectionCard from '../components/CollectionCard';
import CartoonCard from '../components/CartoonCard';
import Skeleton from '../components/Skeleton';

const Collections = () => {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const collectionId = searchParams.get('id');

  const [loading, setLoading] = useState(true);
  const [collections, setCollections] = useState([]);
  const [catalogItems, setCatalogItems] = useState([]);
  const [activeCollection, setActiveCollection] = useState(null);
  const [filteredItems, setFilteredItems] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [collectionsData, itemsData] = await Promise.all([
          getCollections(),
          getAllCatalogItems()
        ]);
        
        setCollections(collectionsData);
        setCatalogItems(itemsData);
      } catch (err) {
        console.error("Error loading collections view:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Update active collection items when id, collections or catalog changes
  useEffect(() => {
    if (collectionId && collections.length > 0) {
      const active = collections.find(c => c.id === collectionId);
      setActiveCollection(active || null);

      if (active) {
        const matchingItems = catalogItems.filter(item => 
          item.collections?.includes(collectionId)
        );
        setFilteredItems(matchingItems);
      }
    } else {
      setActiveCollection(null);
      setFilteredItems([]);
    }
  }, [collectionId, collections, catalogItems]);

  const currentLang = i18n.language || 'en';

  // Render specific collection detail page
  if (activeCollection) {
    const colName = currentLang.startsWith('ta') && activeCollection.nameTa ? activeCollection.nameTa : activeCollection.name;
    const colDesc = currentLang.startsWith('ta') && activeCollection.descriptionTa ? activeCollection.descriptionTa : activeCollection.description;

    return (
      <div className="w-full pb-16">
        {/* Widescreen Custom Header Banner */}
        <div className="relative w-full h-[250px] sm:h-[350px] overflow-hidden bg-theme-coffee">
          <img 
            src={activeCollection.banner} 
            alt={colName} 
            className="w-full h-full object-cover object-center opacity-65"
          />
          {/* CRT Overlay */}
          <div className="crt-screen-overlay opacity-5 pointer-events-none"></div>

          {/* Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-theme-cream via-theme-cream/30 to-black/35 dark:from-theme-darkBg dark:via-theme-darkBg/30 dark:to-black/35" />

          {/* Back button */}
          <Link
            to="/collections"
            className="absolute top-6 left-6 z-30 px-3.5 py-2 bg-black/45 hover:bg-black/65 backdrop-blur-md text-theme-cream text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer transition-transform hover:scale-105 active:scale-95 shadow-lg border border-theme-cream/10"
          >
            <ArrowLeft size={14} />
            <span>All Collections</span>
          </Link>

          {/* Text Overlay */}
          <div className="absolute inset-x-0 bottom-0 px-4 pb-6 sm:px-8 sm:pb-8 max-w-7xl mx-auto flex flex-col justify-end h-full">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-theme-orange w-fit p-1 bg-black/45 rounded-md mb-2 flex items-center gap-1 shadow-sm">
              <Layers size={10} />
              <span>Curated Playlist</span>
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-theme-coffee dark:text-theme-darkText tracking-wide drop-shadow-md">
              {colName}
            </h1>
            <p className="text-xs sm:text-sm text-theme-coffee/80 dark:text-theme-cream/80 max-w-xl font-medium mt-1 leading-normal leading-relaxed drop-shadow-sm">
              {colDesc}
            </p>
          </div>
        </div>

        {/* Collection items grid */}
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} variant="card" />
              ))}
            </div>
          ) : filteredItems.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {filteredItems.map((item) => (
                <CartoonCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 border border-dashed border-theme-coffee/15 rounded-premium bg-theme-beige/5">
              <Grid size={36} className="mx-auto text-theme-coffee/30 dark:text-theme-darkText/30 mb-2 animate-pulse" />
              <p className="text-sm font-bold text-theme-coffee/70 dark:text-theme-darkText/70">No shows added to this collection yet.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render directory grid of all collections
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 min-h-[85vh] flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex flex-col gap-1.5 mt-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-theme-coffee dark:text-theme-darkText flex items-center gap-2.5">
          <Layers size={24} className="text-theme-orange" />
          <span>{t('common.collections')}</span>
        </h1>
        <p className="text-sm text-theme-coffee/60 dark:text-theme-darkText/50 font-medium">
          {t('collections.tagline')}
        </p>
      </div>

      {/* Grid of collections */}
      <div className="flex-grow">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-44 w-full" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {collections.map((col) => (
              <CollectionCard key={col.id} collection={col} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default Collections;
