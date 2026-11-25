import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Play } from 'lucide-react';
import { getAllCatalogItems } from '../services/db';
import { optimizeImageUrl } from '../utils/image';

export const WELCOME_KEY = 'kuttytv_welcomed';

const Welcome = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [art, setArt] = useState([]);

  useEffect(() => {
    getAllCatalogItems().then((all) => setArt((all || []).slice(0, 3))).catch(() => {});
  }, []);

  const start = () => {
    try { localStorage.setItem(WELCOME_KEY, '1'); } catch { /* private mode */ }
    navigate('/', { replace: true });
  };

  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-theme-accent overflow-hidden">
      {/* Art */}
      <div className="relative flex-1 min-h-0 flex items-end justify-center pb-10">
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-white/40" />
        <div className="absolute top-16 -right-16 w-52 h-52 rounded-full bg-theme-coffee/10" />
        <div className="relative flex items-end justify-center gap-3 px-6">
          {art.map((it, i) => (
            <img
              key={it.id}
              src={optimizeImageUrl(it.thumbnail, 'card')}
              alt=""
              className={`object-cover rounded-[1.75rem] shadow-2xl shadow-black/30 ${i === 1 ? 'w-40 h-56 sm:w-52 sm:h-72 z-10' : 'w-28 h-40 sm:w-40 sm:h-56 opacity-90'}`}
              style={{ transform: i === 0 ? 'rotate(-7deg)' : i === 2 ? 'rotate(7deg)' : 'none' }}
            />
          ))}
        </div>
      </div>

      {/* Bottom sheet */}
      <div className="rounded-t-[2.5rem] bg-theme-coffee text-white px-6 pt-7 pb-8 text-center">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-xs font-bold">
          <Play size={12} className="fill-theme-accent text-theme-accent" />
          {t('welcome.pill', { defaultValue: 'See Your Favorite Videos' })}
        </span>
        <h1 className="mt-4 text-3xl sm:text-4xl font-black leading-tight">
          {t('welcome.title', { defaultValue: 'Your Cartoon World Starts Here' })}
        </h1>
        <p className="mt-2 text-sm text-white/70 max-w-sm mx-auto">
          {t('welcome.sub', { defaultValue: 'Tamil and English cartoons, shows and movies, all in one place.' })}
        </p>
        <button
          onClick={start}
          className="mt-6 w-full max-w-sm py-4 rounded-full bg-theme-accent text-theme-onaccent font-extrabold text-base shadow-lg active:scale-95 transition-transform cursor-pointer"
        >
          {t('welcome.cta', { defaultValue: 'Started Streaming' })}
        </button>
      </div>
    </div>
  );
};

export default Welcome;
