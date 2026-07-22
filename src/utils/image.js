/**
 * Dynamic Image URL Optimization utility for Kutty TV.
 * Optimizes network load and formats images on the fly.
 */
export const optimizeImageUrl = (url, type = 'card') => {
  if (!url || typeof url !== 'string') return url;

  // Unsplash Image optimization
  if (url.includes('images.unsplash.com')) {
    const baseUrl = url.split('?')[0];
    if (type === 'hero') {
      return `${baseUrl}?auto=format&fit=crop&w=1200&q=70`;
    }
    if (type === 'thumbnail' || type === 'avatar') {
      return `${baseUrl}?auto=format&fit=crop&w=150&h=150&q=65`;
    }
    return `${baseUrl}?auto=format&fit=crop&w=350&q=65`;
  }

  // Cloudinary Image optimization
  if (url.includes('res.cloudinary.com')) {
    const parts = url.split('/upload/');
    if (parts.length === 2) {
      let transformation = 'q_auto:eco,f_auto'; // eco compression mode + auto webp format conversion
      if (type === 'hero') {
        transformation += ',w_1200,c_scale';
      } else if (type === 'thumbnail' || type === 'avatar') {
        transformation += ',w_150,h_150,c_thumb';
      } else {
        transformation += ',w_350,c_scale';
      }
      return `${parts[0]}/upload/${transformation}/${parts[1]}`;
    }
  }

  return url;
};
