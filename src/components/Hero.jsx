import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { optimizeImageUrl } from '../utils/image';

// Fan / coverflow carousel: centre card large, neighbours tilted and smaller.
const Hero = ({ items = [] }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = items.length;

  useEffect(() => { setIndex(0); }, [n]);
  useEffect(() => {
    if (n <= 1 || paused) return;
    const id = setInterval(() => setIndex((p) => (p + 1) % n), 5000);
    return () => clearInterval(id);
  }, [n, paused]);

  if (!n) return null;
  const isTamil = (i18n.language || 'en').startsWith('ta');
  const active = index % n;

  const offsetOf = (i) => {
    let d = i - active;
    if (d > n / 2) d -= n;
    if (d < -n / 2) d += n;
    return d;
  };

  return (
    <section
      className="relative w-full overflow-hidden pt-2 pb-3"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
    >
      <div className="relative mx-auto h-[360px] sm:h-[420px] w-full max-w-3xl">
        {items.map((item, i) => {
          const d = offsetOf(i);
          if (Math.abs(d) > 2) return null;
          const title = isTamil && item.titleTa ? item.titleTa : item.title;
          const ep = item.type === 'movie'
            ? t('common.movie', { defaultValue: 'Movie' })
            : `${t('common.episode', { defaultValue: 'Episode' })} ${item.episodes?.length || 1}`;
          const isCenter = d === 0;
          return (
            <motion.button
              key={item.id}
              type="button"
              onClick={() => (isCenter ? navigate(`/details/${item.id}`) : setIndex(i))}
              animate={{
                x: `${d * 62}%`,
                scale: isCenter ? 1 : 0.8,
                rotate: d * 6,
                y: Math.abs(d) * 18,
                opacity: Math.abs(d) > 1 ? 0.5 : 1,
              }}
              transition={{ type: 'spring', stiffness: 220, damping: 26 }}
              style={{ zIndex: 10 - Math.abs(d) }}
              className="absolute left-1/2 top-0 -ml-[110px] sm:-ml-[135px] w-[220px] sm:w-[270px] h-[330px] sm:h-[390px] rounded-[2rem] overflow-hidden bg-theme-beige shadow-2xl shadow-black/30 cursor-pointer text-left"
              aria-label={title}
            >
              <img src={optimizeImageUrl(item.thumbnail, 'hero')} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 to-transparent" />
              {isCenter && (
                <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-theme-accent text-theme-onaccent text-xs font-extrabold shadow">
                  {ep}
                </span>
              )}
              <div className="absolute inset-x-0 bottom-0 p-4">
                <h3 className="text-white font-extrabold text-lg leading-tight line-clamp-2">{title}</h3>
              </div>
            </motion.button>
          );
        })}
      </div>

      {n > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-2">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${i === active ? 'w-5 bg-theme-coffee dark:bg-theme-accent' : 'w-1.5 bg-theme-coffee/25 dark:bg-white/30'}`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default Hero;
