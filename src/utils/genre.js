// Stable colour for a genre chip (same genre -> same colour)
const COLORS = ['bg-orange-500', 'bg-sky-600', 'bg-rose-500', 'bg-purple-600', 'bg-emerald-600', 'bg-amber-600'];

export const genreColor = (genre = '') => {
  let sum = 0;
  for (let i = 0; i < genre.length; i += 1) sum += genre.charCodeAt(i);
  return COLORS[sum % COLORS.length];
};

export const formatRuntime = (seconds = 0) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  return h > 0 ? `${h}H ${String(m).padStart(2, '0')}M` : `${m}M`;
};
