/**
 * Dynamic Image URL Optimization utility for Kutty TV.
 * Optimizes network load and formats images on the fly.
 */
export const optimizeImageUrl = (url, type = 'card') => {
  if (!url || typeof url !== 'string') return url;

  // Unsplash Image optimization (High-Quality, crisp dimensions)
  if (url.includes('images.unsplash.com')) {
    const baseUrl = url.split('?')[0];
    if (type === 'hero') {
      return `${baseUrl}?auto=format&fit=crop&w=1600&q=85`;
    }
    if (type === 'thumbnail' || type === 'avatar') {
      return `${baseUrl}?auto=format&fit=crop&w=300&h=300&q=80`;
    }
    return `${baseUrl}?auto=format&fit=crop&w=600&q=82`;
  }

  // Cloudinary Image optimization (Vibrant and crisp transformation parameters)
  if (url.includes('res.cloudinary.com')) {
    const parts = url.split('/upload/');
    if (parts.length === 2) {
      let transformation = 'q_auto:good,f_auto'; // High-fidelity auto compression and format mapping
      if (type === 'hero') {
        transformation += ',w_1600,c_scale';
      } else if (type === 'thumbnail' || type === 'avatar') {
        transformation += ',w_300,h_300,c_thumb';
      } else {
        transformation += ',w_600,c_scale';
      }
      return `${parts[0]}/upload/${transformation}/${parts[1]}`;
    }
  }

  return url;
};
