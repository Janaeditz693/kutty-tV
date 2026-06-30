// Fictional nostalgic cartoon database for Kutty TV
export const MOCK_CATEGORIES = [
  { id: 'shows', name: 'Shows' },
  { id: 'movies', name: 'Movies' },
];

export const MOCK_COLLECTIONS = [
  {
    id: 'kids90s',
    name: '90s Golden Era',
    nameTa: '90களின் பொற்காலம்',
    description: 'Nostalgic after-school classics that ruled our childhood afternoons.',
    descriptionTa: 'நமது குழந்தை பருவ பள்ளி மதியங்களை ஆண்ட உன்னத படைப்புகள்.',
    thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
    banner: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1600&q=80',
  },
  {
    id: 'kids2000s',
    name: '2000s Morning Cartoons',
    nameTa: '2000களின் காலை கார்ட்டூன்கள்',
    description: 'Saturday morning cartoons that made waking up early totally worth it.',
    descriptionTa: 'சீக்கிரம் விழித்திருப்பதை அர்த்தமுள்ளதாக்கிய சனிக்கிழமை காலை கார்ட்டூன்கள்.',
    thumbnail: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
    banner: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1600&q=80',
  },
  {
    id: 'superheroes',
    name: 'Retro Super Heroes',
    nameTa: 'சூப்பர் ஹீரோக்கள்',
    description: 'Spandex capes, retro theme songs, and saving the universe before bedtime.',
    descriptionTa: 'தூங்குவதற்கு முன் பிரபஞ்சத்தை காப்பாற்றும் ரெட்ரோ சூப்பர் ஹீரோக்கள்.',
    thumbnail: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80',
    banner: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1600&q=80',
  },
  {
    id: 'comedy',
    name: 'Slapstick & Laughs',
    nameTa: 'நகைச்சுவை & சிரிப்பு',
    description: 'Bouncing off walls, slipping on banana peels, and endless giggles.',
    descriptionTa: 'வாழைப்பழத் தோலில் வழுக்கி விழும் வேடிக்கையான கார்ட்டூன்கள்.',
    thumbnail: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
    banner: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1600&q=80',
  }
];

export const MOCK_SHOWS = [];

// Helper to query all shows/movies
export const getShows = () => MOCK_SHOWS;

export const getShowById = (id) => MOCK_SHOWS.find(s => s.id === id);

export const getFeaturedShows = () => MOCK_SHOWS.filter(s => s.featured);

export const getShowsByCollection = (colId) => MOCK_SHOWS.filter(s => s.collections.includes(colId));
