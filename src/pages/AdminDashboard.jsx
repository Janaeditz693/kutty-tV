import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ShieldAlert, 
  Tv, 
  Film, 
  Layers, 
  Users, 
  PlaySquare, 
  Plus, 
  Trash2, 
  Edit, 
  Check, 
  PlusCircle, 
  X,
  FileText
} from 'lucide-react';
import { getAllCatalogItems, saveCatalogItem, deleteCatalogItem, getAllUsers, updateUserRole } from '../services/db';
import Skeleton from '../components/Skeleton';

const AdminDashboard = () => {
  const { t } = useTranslation();
  
  // Tab control
  const [activeTab, setActiveTab] = useState('overview');

  // Loading & Database state
  const [loading, setLoading] = useState(true);
  const [catalogItems, setCatalogItems] = useState([]);
  const [selectedShowForEpisodes, setSelectedShowForEpisodes] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [usersList, setUsersList] = useState([]);

  // CRUD Show/Movie form state
  const [showFormOpen, setShowFormOpen] = useState(false);
  const [editShowId, setEditShowId] = useState(null); // null means adding new
  const [showTitle, setShowTitle] = useState('');
  const [showTitleTa, setShowTitleTa] = useState('');
  const [showType, setShowType] = useState('show');
  const [showDesc, setShowDesc] = useState('');
  const [showDescTa, setShowDescTa] = useState('');
  const [showThumbnail, setShowThumbnail] = useState('');
  const [showBanner, setShowBanner] = useState('');
  const [showRating, setShowRating] = useState('8.5');
  const [showYear, setShowYear] = useState('2000');
  const [showLanguages, setShowLanguages] = useState('English, தமிழ்');
  const [showGenres, setShowGenres] = useState('Comedy, Adventure');
  const [showCollections, setShowCollections] = useState('kids2000s');
  const [showFeatured, setShowFeatured] = useState(false);

  // CRUD Episode form state
  const [epFormOpen, setEpFormOpen] = useState(false);
  const [epNumber, setEpNumber] = useState('');
  const [epTitle, setEpTitle] = useState('');
  const [epTitleTa, setEpTitleTa] = useState('');
  const [epDesc, setEpDesc] = useState('');
  const [epDescTa, setEpDescTa] = useState('');
  const [epThumbnail, setEpThumbnail] = useState('');
  const [epVideoUrl, setEpVideoUrl] = useState('');
  const [epDuration, setEpDuration] = useState('600');

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getAllCatalogItems();
      setCatalogItems(data);
      if (data.length > 0 && !selectedShowForEpisodes) {
        // Find first show type to select by default
        const firstShow = data.find(i => i.type === 'show');
        if (firstShow) setSelectedShowForEpisodes(firstShow.id);
      }
      const users = await getAllUsers();
      setUsersList(users);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleToggle = async (uid, email, currentRole) => {
    if (email === 'vjana0640@gmail.com') {
      alert("Cannot modify the role of the primary owner account.");
      return;
    }
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    const msg = newRole === 'admin' 
      ? `Promote ${email} to Admin?` 
      : `Demote ${email} to standard User?`;
      
    if (window.confirm(msg)) {
      const ok = await updateUserRole(uid, newRole);
      if (ok) {
        triggerToast("User role updated successfully.");
        loadData();
      } else {
        alert("Failed to update user role.");
      }
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const triggerToast = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // -------------------------------------------------------------
  // SHOW/MOVIE CRUD SUBMISSIONS
  // -------------------------------------------------------------
  const handleShowSubmit = async (e) => {
    e.preventDefault();
    if (!showTitle || !showDesc || !showThumbnail || !showBanner) {
      alert("Please fill in all required fields");
      return;
    }

    const itemObj = {
      id: editShowId || `show-${Date.now()}`,
      title: showTitle.trim(),
      titleTa: showTitleTa.trim() || showTitle.trim(),
      type: showType,
      description: showDesc.trim(),
      descriptionTa: showDescTa.trim() || showDesc.trim(),
      thumbnail: showThumbnail.trim(),
      banner: showBanner.trim(),
      rating: showRating.trim(),
      year: showYear.trim(),
      languages: showLanguages.split(',').map(s => s.trim()),
      genres: showGenres.split(',').map(s => s.trim()),
      collections: showCollections.split(',').map(s => s.trim()),
      featured: showFeatured,
    };

    // If it's an edit, preserve its existing episodes array
    if (editShowId) {
      const existing = catalogItems.find(c => c.id === editShowId);
      if (existing) {
        itemObj.episodes = existing.episodes || [];
        if (showType === 'movie') {
          // If changed to movie, it has a video url directly
          itemObj.videoUrl = existing.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
        }
      }
    } else {
      // New item
      itemObj.episodes = [];
      if (showType === 'movie') {
        itemObj.videoUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
      }
    }

    await saveCatalogItem(itemObj);
    triggerToast(editShowId ? "Show updated successfully!" : "Show created successfully!");
    
    // Reset Show Form
    setShowFormOpen(false);
    setEditShowId(null);
    setShowTitle('');
    setShowTitleTa('');
    setShowDesc('');
    setShowDescTa('');
    setShowThumbnail('');
    setShowBanner('');
    setShowFeatured(false);

    loadData();
  };

  const handleEditShowClick = (item) => {
    setEditShowId(item.id);
    setShowTitle(item.title);
    setShowTitleTa(item.titleTa || '');
    setShowType(item.type);
    setShowDesc(item.description);
    setShowDescTa(item.descriptionTa || '');
    setShowThumbnail(item.thumbnail);
    setShowBanner(item.banner);
    setShowRating(item.rating);
    setShowYear(item.year);
    setShowLanguages(item.languages?.join(', ') || 'English, தமிழ்');
    setShowGenres(item.genres?.join(', ') || 'Comedy, Adventure');
    setShowCollections(item.collections?.join(', ') || 'kids2000s');
    setShowFeatured(item.featured || false);
    
    setShowFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteShowClick = async (id) => {
    if (window.confirm("Are you sure you want to delete this catalog item? This will remove all associated episode links.")) {
      await deleteCatalogItem(id);
      triggerToast("Item deleted from catalog.");
      loadData();
    }
  };

  // -------------------------------------------------------------
  // EPISODE CRUD SUBMISSIONS
  // -------------------------------------------------------------
  const handleEpisodeSubmit = async (e) => {
    e.preventDefault();
    if (!epNumber || !epTitle || !epThumbnail || !epVideoUrl) {
      alert("Please fill in all required fields for this episode");
      return;
    }

    const showObj = catalogItems.find(s => s.id === selectedShowForEpisodes);
    if (!showObj) return;

    const newEpObj = {
      id: `ep-${Date.now()}`,
      number: parseInt(epNumber),
      title: epTitle.trim(),
      titleTa: epTitleTa.trim() || epTitle.trim(),
      description: epDesc.trim(),
      descriptionTa: epDescTa.trim() || epDesc.trim(),
      thumbnail: epThumbnail.trim(),
      videoUrl: epVideoUrl.trim(),
      duration: parseInt(epDuration)
    };

    const updatedEpisodes = [...(showObj.episodes || [])];
    // Check if episode number already exists
    const existingIdx = updatedEpisodes.findIndex(e => e.number === newEpObj.number);
    if (existingIdx !== -1) {
      updatedEpisodes[existingIdx] = newEpObj;
    } else {
      updatedEpisodes.push(newEpObj);
    }
    // Sort episodes by number ascending
    updatedEpisodes.sort((a, b) => a.number - b.number);

    const updatedShowObj = {
      ...showObj,
      episodes: updatedEpisodes
    };

    await saveCatalogItem(updatedShowObj);
    triggerToast(`Added Episode ${epNumber} to ${showObj.title}!`);

    // Reset Episode Form
    setEpFormOpen(false);
    setEpNumber('');
    setEpTitle('');
    setEpTitleTa('');
    setEpDesc('');
    setEpDescTa('');
    setEpThumbnail('');
    setEpVideoUrl('');
    setEpDuration('600');

    loadData();
  };

  const handleDeleteEpisode = async (epId) => {
    if (window.confirm("Delete this episode?")) {
      const showObj = catalogItems.find(s => s.id === selectedShowForEpisodes);
      if (!showObj) return;

      const updatedEpisodes = showObj.episodes.filter(e => e.id !== epId);
      const updatedShowObj = {
        ...showObj,
        episodes: updatedEpisodes
      };

      await saveCatalogItem(updatedShowObj);
      triggerToast("Episode removed.");
      loadData();
    }
  };

  // Calculations for stats
  const showCount = catalogItems.filter(i => i.type === 'show').length;
  const movieCount = catalogItems.filter(i => i.type === 'movie').length;
  const episodeCount = catalogItems.reduce((acc, item) => acc + (item.episodes?.length || 0), 0);
  const activeShowForEps = catalogItems.find(s => s.id === selectedShowForEpisodes);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 min-h-[85vh] flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-2">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-theme-coffee dark:text-theme-darkText flex items-center gap-2.5">
            <ShieldAlert size={28} className="text-red-550 dark:text-theme-orange animate-pulse" />
            <span>Kutty TV Admin Board</span>
          </h1>
          <p className="text-xs sm:text-sm text-theme-coffee/60 dark:text-theme-darkText/50 font-medium">
            Authorized management tools for featured categories, shows, movies, and episodes.
          </p>
        </div>

        {/* Global Save Indicator Alert */}
        {successMsg && (
          <div className="px-4 py-2 bg-green-550/15 border border-green-550/30 text-green-700 dark:text-green-500 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm">
            <Check size={14} className="stroke-[2.5]" />
            <span>{successMsg}</span>
          </div>
        )}
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-theme-coffee/15 dark:border-theme-darkBorder gap-1 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider shrink-0 transition-colors border-b-2 cursor-pointer ${
            activeTab === 'overview'
              ? 'border-theme-orange text-theme-orange'
              : 'border-transparent text-theme-coffee/50 dark:text-theme-darkText/50 hover:text-theme-coffee dark:hover:text-theme-darkText'
          }`}
        >
          Overview Statistics
        </button>
        <button
          onClick={() => setActiveTab('catalog')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider shrink-0 transition-colors border-b-2 cursor-pointer ${
            activeTab === 'catalog'
              ? 'border-theme-orange text-theme-orange'
              : 'border-transparent text-theme-coffee/50 dark:text-theme-darkText/50 hover:text-theme-coffee dark:hover:text-theme-darkText'
          }`}
        >
          Catalog Manager
        </button>
        <button
          onClick={() => setActiveTab('episodes')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider shrink-0 transition-colors border-b-2 cursor-pointer ${
            activeTab === 'episodes'
              ? 'border-theme-orange text-theme-orange'
              : 'border-transparent text-theme-coffee/50 dark:text-theme-darkText/50 hover:text-theme-coffee dark:hover:text-theme-darkText'
          }`}
        >
          Episode Manager
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider shrink-0 transition-colors border-b-2 cursor-pointer ${
            activeTab === 'users'
              ? 'border-theme-orange text-theme-orange'
              : 'border-transparent text-theme-coffee/50 dark:text-theme-darkText/50 hover:text-theme-coffee dark:hover:text-theme-darkText'
          }`}
        >
          Manage Users
        </button>
      </div>

      {/* Content panes */}
      <div className="flex-grow">
        {loading ? (
          <div className="flex flex-col gap-6">
            <Skeleton variant="text" className="w-1/3" />
            <Skeleton variant="hero" className="w-full" />
          </div>
        ) : (
          <>
            {/* TAB 1: OVERVIEW STATISTICS */}
            {activeTab === 'overview' && (
              <div className="flex flex-col gap-6">
                
                {/* Stats Counters */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Shows */}
                  <div className="p-5 rounded-premium bg-theme-cream border border-theme-coffee/15 dark:bg-theme-darkCard dark:border-theme-darkBorder shadow-retro flex items-center gap-4">
                    <div className="p-3.5 rounded-xl bg-theme-orange/10 text-theme-orange">
                      <Tv size={22} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-theme-coffee/50 dark:text-theme-darkText/40">Shows</p>
                      <h3 className="text-2xl font-extrabold text-theme-coffee dark:text-theme-darkText">{showCount}</h3>
                    </div>
                  </div>
                  {/* Movies */}
                  <div className="p-5 rounded-premium bg-theme-cream border border-theme-coffee/15 dark:bg-theme-darkCard dark:border-theme-darkBorder shadow-retro flex items-center gap-4">
                    <div className="p-3.5 rounded-xl bg-amber-550/10 text-amber-600 dark:text-amber-550">
                      <Film size={22} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-theme-coffee/50 dark:text-theme-darkText/40">Movies</p>
                      <h3 className="text-2xl font-extrabold text-theme-coffee dark:text-theme-darkText">{movieCount}</h3>
                    </div>
                  </div>
                  {/* Episodes */}
                  <div className="p-5 rounded-premium bg-theme-cream border border-theme-coffee/15 dark:bg-theme-darkCard dark:border-theme-darkBorder shadow-retro flex items-center gap-4">
                    <div className="p-3.5 rounded-xl bg-purple-550/10 text-purple-600 dark:text-purple-550">
                      <PlaySquare size={22} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-theme-coffee/50 dark:text-theme-darkText/40">Episodes</p>
                      <h3 className="text-2xl font-extrabold text-theme-coffee dark:text-theme-darkText">{episodeCount}</h3>
                    </div>
                  </div>
                  {/* Active Users */}
                  <div className="p-5 rounded-premium bg-theme-cream border border-theme-coffee/15 dark:bg-theme-darkCard dark:border-theme-darkBorder shadow-retro flex items-center gap-4">
                    <div className="p-3.5 rounded-xl bg-green-550/10 text-green-700 dark:text-green-550">
                      <Users size={22} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-theme-coffee/50 dark:text-theme-darkText/40">Kids Club</p>
                      <h3 className="text-2xl font-extrabold text-theme-coffee dark:text-theme-darkText">184</h3>
                    </div>
                  </div>
                </div>

                {/* Analytical charts / placeholder log lists */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Popular plays widget */}
                  <div className="lg:col-span-2 p-6 rounded-premium bg-theme-cream border border-theme-coffee/15 dark:bg-theme-darkCard dark:border-theme-darkBorder shadow-retro flex flex-col gap-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-theme-coffee dark:text-theme-darkText border-b border-theme-coffee/10 dark:border-theme-darkBorder pb-2">
                      Trending Playback Ratings (Simulated views)
                    </h3>
                    
                    <div className="flex flex-col gap-3">
                      {catalogItems.slice(0, 4).map((item, idx) => (
                        <div key={item.id} className="flex items-center gap-3">
                          <img src={item.thumbnail} className="w-12 aspect-[16/10] object-cover rounded-lg" />
                          <div className="flex-grow min-w-0">
                            <h4 className="text-xs font-bold text-theme-coffee dark:text-theme-darkText truncate">{item.title}</h4>
                            <span className="text-[9px] text-theme-orange font-bold uppercase tracking-widest">{item.type}</span>
                          </div>
                          <div className="w-24 bg-theme-coffee/10 dark:bg-theme-darkBg h-2 rounded-full overflow-hidden">
                            <div className="h-full bg-theme-orange" style={{ width: `${parseFloat(item.rating) * 10}%` }}></div>
                          </div>
                          <span className="text-xs font-bold text-theme-coffee/60 dark:text-theme-darkText/60">{item.rating} Rating</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Curated list */}
                  <div className="p-6 rounded-premium bg-theme-cream border border-theme-coffee/15 dark:bg-theme-darkCard dark:border-theme-darkBorder shadow-retro flex flex-col gap-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-theme-coffee dark:text-theme-darkText border-b border-theme-coffee/10 dark:border-theme-darkBorder pb-2">
                      Recent Admin Logs
                    </h3>
                    <div className="flex flex-col gap-2.5 text-xs text-theme-coffee/70 dark:text-theme-darkText/70">
                      <div className="py-1.5 border-b border-theme-coffee/5 dark:border-theme-darkBorder flex gap-2">
                        <span className="text-theme-orange font-bold">10:48</span>
                        <span>Seeded mock data in localStorage</span>
                      </div>
                      <div className="py-1.5 border-b border-theme-coffee/5 dark:border-theme-darkBorder flex gap-2">
                        <span className="text-theme-orange font-bold">11:09</span>
                        <span>Added quick authentication controls</span>
                      </div>
                      <div className="py-1.5 border-b border-theme-coffee/5 dark:border-theme-darkBorder flex gap-2">
                        <span className="text-theme-orange font-bold">11:50</span>
                        <span>Synchronized admin databases</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: CATALOG CRUD MANAGER */}
            {activeTab === 'catalog' && (
              <div className="flex flex-col gap-6">
                
                {/* Form Trigger Header */}
                <div className="flex justify-between items-center">
                  <h3 className="text-base font-bold text-theme-coffee dark:text-theme-darkText">
                    Catalog Items Directory
                  </h3>
                  <button
                    onClick={() => {
                      setEditShowId(null);
                      setShowTitle('');
                      setShowTitleTa('');
                      setShowDesc('');
                      setShowDescTa('');
                      setShowThumbnail('');
                      setShowBanner('');
                      setShowFeatured(false);
                      setShowFormOpen(!showFormOpen);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-theme-orange hover:bg-theme-orange-light text-theme-cream rounded-xl text-xs font-bold shadow-md cursor-pointer transition-transform active:scale-95"
                  >
                    {showFormOpen ? <X size={14} /> : <Plus size={14} />}
                    <span>{showFormOpen ? 'Close Form' : 'Add Show or Movie'}</span>
                  </button>
                </div>

                {/* CRUD Form (Add or Edit) */}
                {showFormOpen && (
                  <form onSubmit={handleShowSubmit} className="p-6 rounded-premium bg-theme-beige/20 border border-theme-coffee/15 dark:bg-theme-darkCard dark:border-theme-darkBorder flex flex-col gap-4">
                    <h4 className="text-sm font-extrabold text-theme-coffee dark:text-theme-darkText border-b border-theme-coffee/10 dark:border-theme-darkBorder pb-2">
                      {editShowId ? 'Edit Show or Movie' : 'Create Show or Movie'}
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Title */}
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-theme-coffee/60 dark:text-theme-darkText/50">English Title *</label>
                        <input
                          type="text"
                          required
                          value={showTitle}
                          onChange={(e) => setShowTitle(e.target.value)}
                          placeholder="e.g. Robot Adventures"
                          className="px-3 py-2 rounded-xl text-sm bg-theme-cream border border-theme-coffee/15 dark:bg-theme-darkBg dark:border-theme-darkBorder text-theme-coffee dark:text-theme-darkText focus:outline-none"
                        />
                      </div>
                      
                      {/* Title Tamil */}
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-theme-coffee/60 dark:text-theme-darkText/50">Tamil Title (optional)</label>
                        <input
                          type="text"
                          value={showTitleTa}
                          onChange={(e) => setShowTitleTa(e.target.value)}
                          placeholder="எ.கா. ரோபோ சாகசங்கள்"
                          className="px-3 py-2 rounded-xl text-sm bg-theme-cream border border-theme-coffee/15 dark:bg-theme-darkBg dark:border-theme-darkBorder text-theme-coffee dark:text-theme-darkText focus:outline-none"
                        />
                      </div>

                      {/* Type */}
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-theme-coffee/60 dark:text-theme-darkText/50">Type *</label>
                        <select
                          value={showType}
                          onChange={(e) => setShowType(e.target.value)}
                          className="px-3 py-2 rounded-xl text-sm bg-theme-cream border border-theme-coffee/15 dark:bg-theme-darkBg dark:border-theme-darkBorder text-theme-coffee dark:text-theme-darkText focus:outline-none font-bold"
                        >
                          <option value="show">Cartoon Series (Show)</option>
                          <option value="movie">Cartoon Movie</option>
                        </select>
                      </div>

                      {/* Featured */}
                      <div className="flex items-center gap-2.5 mt-6 px-1">
                        <input
                          type="checkbox"
                          id="feat"
                          checked={showFeatured}
                          onChange={(e) => setShowFeatured(e.target.checked)}
                          className="w-4.5 h-4.5 accent-theme-orange cursor-pointer"
                        />
                        <label htmlFor="feat" className="text-xs font-bold uppercase tracking-wider text-theme-coffee/80 dark:text-theme-darkText/80 cursor-pointer">
                          Feature in Hero Carousel Banner
                        </label>
                      </div>

                      {/* Description */}
                      <div className="flex flex-col gap-1 md:col-span-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-theme-coffee/60 dark:text-theme-darkText/50">English Description *</label>
                        <textarea
                          rows="3"
                          required
                          value={showDesc}
                          onChange={(e) => setShowDesc(e.target.value)}
                          placeholder="Detailed plot explanation..."
                          className="px-3 py-2 rounded-xl text-sm bg-theme-cream border border-theme-coffee/15 dark:bg-theme-darkBg dark:border-theme-darkBorder text-theme-coffee dark:text-theme-darkText focus:outline-none"
                        />
                      </div>

                      {/* Description Tamil */}
                      <div className="flex flex-col gap-1 md:col-span-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-theme-coffee/60 dark:text-theme-darkText/50">Tamil Description (optional)</label>
                        <textarea
                          rows="3"
                          value={showDescTa}
                          onChange={(e) => setShowDescTa(e.target.value)}
                          placeholder="தமிழ் விளக்கம்..."
                          className="px-3 py-2 rounded-xl text-sm bg-theme-cream border border-theme-coffee/15 dark:bg-theme-darkBg dark:border-theme-darkBorder text-theme-coffee dark:text-theme-darkText focus:outline-none"
                        />
                      </div>

                      {/* Thumbnail URL */}
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-theme-coffee/60 dark:text-theme-darkText/50">Thumbnail URL *</label>
                        <input
                          type="text"
                          required
                          value={showThumbnail}
                          onChange={(e) => setShowThumbnail(e.target.value)}
                          placeholder="https://images.unsplash.com/photo-..."
                          className="px-3 py-2 rounded-xl text-sm bg-theme-cream border border-theme-coffee/15 dark:bg-theme-darkBg dark:border-theme-darkBorder text-theme-coffee dark:text-theme-darkText focus:outline-none"
                        />
                      </div>

                      {/* Banner URL */}
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-theme-coffee/60 dark:text-theme-darkText/50">Widescreen Banner URL *</label>
                        <input
                          type="text"
                          required
                          value={showBanner}
                          onChange={(e) => setShowBanner(e.target.value)}
                          placeholder="https://images.unsplash.com/photo-..."
                          className="px-3 py-2 rounded-xl text-sm bg-theme-cream border border-theme-coffee/15 dark:bg-theme-darkBg dark:border-theme-darkBorder text-theme-coffee dark:text-theme-darkText focus:outline-none"
                        />
                      </div>

                      {/* Rating */}
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-theme-coffee/60 dark:text-theme-darkText/50">IMDb / Stars Rating *</label>
                        <input
                          type="text"
                          required
                          value={showRating}
                          onChange={(e) => setShowRating(e.target.value)}
                          placeholder="e.g. 8.8"
                          className="px-3 py-2 rounded-xl text-sm bg-theme-cream border border-theme-coffee/15 dark:bg-theme-darkBg dark:border-theme-darkBorder text-theme-coffee dark:text-theme-darkText focus:outline-none"
                        />
                      </div>

                      {/* Release year */}
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-theme-coffee/60 dark:text-theme-darkText/50">Release Year *</label>
                        <input
                          type="text"
                          required
                          value={showYear}
                          onChange={(e) => setShowYear(e.target.value)}
                          placeholder="e.g. 2001"
                          className="px-3 py-2 rounded-xl text-sm bg-theme-cream border border-theme-coffee/15 dark:bg-theme-darkBg dark:border-theme-darkBorder text-theme-coffee dark:text-theme-darkText focus:outline-none"
                        />
                      </div>

                      {/* Languages */}
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-theme-coffee/60 dark:text-theme-darkText/50">Languages (comma separated) *</label>
                        <input
                          type="text"
                          required
                          value={showLanguages}
                          onChange={(e) => setShowLanguages(e.target.value)}
                          placeholder="English, தமிழ்"
                          className="px-3 py-2 rounded-xl text-sm bg-theme-cream border border-theme-coffee/15 dark:bg-theme-darkBg dark:border-theme-darkBorder text-theme-coffee dark:text-theme-darkText focus:outline-none"
                        />
                      </div>

                      {/* Genres */}
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-theme-coffee/60 dark:text-theme-darkText/50">Genres (comma separated) *</label>
                        <input
                          type="text"
                          required
                          value={showGenres}
                          onChange={(e) => setShowGenres(e.target.value)}
                          placeholder="Comedy, Sci-Fi"
                          className="px-3 py-2 rounded-xl text-sm bg-theme-cream border border-theme-coffee/15 dark:bg-theme-darkBg dark:border-theme-darkBorder text-theme-coffee dark:text-theme-darkText focus:outline-none"
                        />
                      </div>

                      {/* Collections */}
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-theme-coffee/60 dark:text-theme-darkText/50">Collection IDs (comma separated)</label>
                        <input
                          type="text"
                          value={showCollections}
                          onChange={(e) => setShowCollections(e.target.value)}
                          placeholder="kids90s, comedy"
                          className="px-3 py-2 rounded-xl text-sm bg-theme-cream border border-theme-coffee/15 dark:bg-theme-darkBg dark:border-theme-darkBorder text-theme-coffee dark:text-theme-darkText focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 justify-end mt-4">
                      <button
                        type="button"
                        onClick={() => setShowFormOpen(false)}
                        className="px-5 py-2.5 rounded-xl border border-theme-coffee/20 text-theme-coffee dark:border-theme-darkBorder dark:text-theme-darkText text-xs font-bold cursor-pointer hover:bg-theme-coffee/5 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl bg-theme-orange hover:bg-theme-orange-light text-theme-cream text-xs font-bold cursor-pointer shadow"
                      >
                        {editShowId ? 'Save Changes' : 'Create Entry'}
                      </button>
                    </div>
                  </form>
                )}

                {/* Tabular Lists of catalog items */}
                <div className="overflow-x-auto rounded-premium border border-theme-coffee/15 dark:border-theme-darkBorder shadow-retro">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-theme-coffee/10 dark:bg-theme-darkBg border-b border-theme-coffee/15 dark:border-theme-darkBorder text-xs font-extrabold uppercase tracking-wider text-theme-coffee dark:text-theme-darkText">
                        <th className="p-4">Thumbnail</th>
                        <th className="p-4">Title</th>
                        <th className="p-4">Type</th>
                        <th className="p-4">Year</th>
                        <th className="p-4">Rating</th>
                        <th className="p-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {catalogItems.map((item) => (
                        <tr key={item.id} className="border-b border-theme-coffee/10 dark:border-theme-darkBorder hover:bg-theme-coffee/5 dark:hover:bg-theme-darkBg transition-colors font-medium">
                          <td className="p-4">
                            <img src={item.thumbnail} alt={item.title} className="w-14 aspect-[16/10] object-cover rounded-lg border border-theme-coffee/10 dark:border-theme-darkBorder" />
                          </td>
                          <td className="p-4 font-bold text-theme-coffee dark:text-theme-darkText truncate max-w-[150px]">
                            {item.title}
                          </td>
                          <td className="p-4 capitalize text-xs">
                            <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase ${
                              item.type === 'movie' ? 'bg-amber-550/15 text-amber-700 dark:text-amber-550' : 'bg-theme-orange/15 text-theme-orange'
                            }`}>
                              {item.type}
                            </span>
                          </td>
                          <td className="p-4 text-xs font-mono">{item.year}</td>
                          <td className="p-4 text-xs font-bold">★ {item.rating}</td>
                          <td className="p-4">
                            <div className="flex gap-2 justify-center">
                              <button
                                onClick={() => handleEditShowClick(item)}
                                className="p-2 bg-theme-coffee/10 hover:bg-theme-coffee/15 dark:bg-theme-darkBg text-theme-coffee dark:text-theme-darkText rounded-lg transition-transform active:scale-90 cursor-pointer"
                                title="Edit"
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteShowClick(item.id)}
                                className="p-2 bg-red-550/10 hover:bg-red-550/20 text-red-650 dark:text-red-500 rounded-lg transition-transform active:scale-90 cursor-pointer"
                                title="Delete"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

              </div>
            )}

            {/* TAB 3: EPISODE CRUD MANAGER */}
            {activeTab === 'episodes' && (
              <div className="flex flex-col gap-6">
                
                {/* Selector */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-theme-coffee dark:text-theme-darkText">Select Cartoon Show:</span>
                    <select
                      value={selectedShowForEpisodes}
                      onChange={(e) => setSelectedShowForEpisodes(e.target.value)}
                      className="px-3 py-2 rounded-xl border border-theme-coffee/15 bg-theme-cream text-theme-coffee dark:bg-theme-darkCard dark:border-theme-darkBorder dark:text-theme-darkText text-sm font-bold focus:outline-none"
                    >
                      {catalogItems.filter(i => i.type === 'show').map(s => (
                        <option key={s.id} value={s.id}>{s.title}</option>
                      ))}
                    </select>
                  </div>

                  {activeShowForEps && (
                    <button
                      onClick={() => {
                        setEpNumber((activeShowForEps.episodes?.length || 0) + 1);
                        setEpFormOpen(!epFormOpen);
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 bg-theme-orange hover:bg-theme-orange-light text-theme-cream rounded-xl text-xs font-bold shadow-md cursor-pointer transition-transform active:scale-95"
                    >
                      {epFormOpen ? <X size={14} /> : <Plus size={14} />}
                      <span>Add Episode</span>
                    </button>
                  )}
                </div>

                {/* Add Episode Form overlay */}
                {epFormOpen && activeShowForEps && (
                  <form onSubmit={handleEpisodeSubmit} className="p-6 rounded-premium bg-theme-beige/20 border border-theme-coffee/15 dark:bg-theme-darkCard dark:border-theme-darkBorder flex flex-col gap-4">
                    <h4 className="text-sm font-extrabold text-theme-coffee dark:text-theme-darkText border-b border-theme-coffee/10 dark:border-theme-darkBorder pb-2">
                      Add Episode to: {activeShowForEps.title}
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Number */}
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-theme-coffee/60 dark:text-theme-darkText/50">Episode Number *</label>
                        <input
                          type="number"
                          required
                          value={epNumber}
                          onChange={(e) => setEpNumber(e.target.value)}
                          placeholder="e.g. 4"
                          className="px-3 py-2 rounded-xl text-sm bg-theme-cream border border-theme-coffee/15 dark:bg-theme-darkBg dark:border-theme-darkBorder text-theme-coffee dark:text-theme-darkText focus:outline-none"
                        />
                      </div>

                      {/* Duration */}
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-theme-coffee/60 dark:text-theme-darkText/50">Duration (seconds) *</label>
                        <input
                          type="number"
                          required
                          value={epDuration}
                          onChange={(e) => setEpDuration(e.target.value)}
                          placeholder="e.g. 1320"
                          className="px-3 py-2 rounded-xl text-sm bg-theme-cream border border-theme-coffee/15 dark:bg-theme-darkBg dark:border-theme-darkBorder text-theme-coffee dark:text-theme-darkText focus:outline-none"
                        />
                      </div>

                      {/* Title */}
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-theme-coffee/60 dark:text-theme-darkText/50">English Episode Title *</label>
                        <input
                          type="text"
                          required
                          value={epTitle}
                          onChange={(e) => setEpTitle(e.target.value)}
                          placeholder="e.g. The Haunted Attic"
                          className="px-3 py-2 rounded-xl text-sm bg-theme-cream border border-theme-coffee/15 dark:bg-theme-darkBg dark:border-theme-darkBorder text-theme-coffee dark:text-theme-darkText focus:outline-none"
                        />
                      </div>

                      {/* Title Tamil */}
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-theme-coffee/60 dark:text-theme-darkText/50">Tamil Episode Title (optional)</label>
                        <input
                          type="text"
                          value={epTitleTa}
                          onChange={(e) => setEpTitleTa(e.target.value)}
                          placeholder="எ.கா. பேய் அட்டிக்"
                          className="px-3 py-2 rounded-xl text-sm bg-theme-cream border border-theme-coffee/15 dark:bg-theme-darkBg dark:border-theme-darkBorder text-theme-coffee dark:text-theme-darkText focus:outline-none"
                        />
                      </div>

                      {/* Description */}
                      <div className="flex flex-col gap-1 md:col-span-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-theme-coffee/60 dark:text-theme-darkText/50">Episode Description</label>
                        <textarea
                          rows="2"
                          value={epDesc}
                          onChange={(e) => setEpDesc(e.target.value)}
                          placeholder="Brief summary..."
                          className="px-3 py-2 rounded-xl text-sm bg-theme-cream border border-theme-coffee/15 dark:bg-theme-darkBg dark:border-theme-darkBorder text-theme-coffee dark:text-theme-darkText focus:outline-none"
                        />
                      </div>

                      {/* Thumbnail URL */}
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-theme-coffee/60 dark:text-theme-darkText/50">Thumbnail URL *</label>
                        <input
                          type="text"
                          required
                          value={epThumbnail}
                          onChange={(e) => setEpThumbnail(e.target.value)}
                          placeholder="https://images.unsplash.com/photo-..."
                          className="px-3 py-2 rounded-xl text-sm bg-theme-cream border border-theme-coffee/15 dark:bg-theme-darkBg dark:border-theme-darkBorder text-theme-coffee dark:text-theme-darkText focus:outline-none"
                        />
                      </div>

                      {/* Video URL */}
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-theme-coffee/60 dark:text-theme-darkText/50">Video Stream URL (MP4 / HLS / YouTube) *</label>
                        <input
                          type="text"
                          required
                          value={epVideoUrl}
                          onChange={(e) => setEpVideoUrl(e.target.value)}
                          placeholder="https://...mp4 or https://...m3u8"
                          className="px-3 py-2 rounded-xl text-sm bg-theme-cream border border-theme-coffee/15 dark:bg-theme-darkBg dark:border-theme-darkBorder text-theme-coffee dark:text-theme-darkText focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 justify-end mt-4">
                      <button
                        type="button"
                        onClick={() => setEpFormOpen(false)}
                        className="px-5 py-2.5 rounded-xl border border-theme-coffee/20 text-theme-coffee dark:border-theme-darkBorder dark:text-theme-darkText text-xs font-bold cursor-pointer hover:bg-theme-coffee/5 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl bg-theme-orange hover:bg-theme-orange-light text-theme-cream text-xs font-bold cursor-pointer shadow"
                      >
                        Save Episode
                      </button>
                    </div>
                  </form>
                )}

                {/* Episode listing table */}
                {activeShowForEps ? (
                  activeShowForEps.episodes && activeShowForEps.episodes.length > 0 ? (
                    <div className="overflow-x-auto rounded-premium border border-theme-coffee/15 dark:border-theme-darkBorder shadow-retro">
                      <table className="w-full text-left border-collapse text-sm">
                        <thead>
                          <tr className="bg-theme-coffee/10 dark:bg-theme-darkBg border-b border-theme-coffee/15 dark:border-theme-darkBorder text-xs font-extrabold uppercase tracking-wider text-theme-coffee dark:text-theme-darkText">
                            <th className="p-4">No.</th>
                            <th className="p-4">Thumbnail</th>
                            <th className="p-4">Title</th>
                            <th className="p-4">Stream URL</th>
                            <th className="p-4">Duration</th>
                            <th className="p-4 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {activeShowForEps.episodes.map((ep) => (
                            <tr key={ep.id} className="border-b border-theme-coffee/10 dark:border-theme-darkBorder hover:bg-theme-coffee/5 dark:hover:bg-theme-darkBg transition-colors font-medium">
                              <td className="p-4 font-mono font-bold text-theme-orange">#{ep.number}</td>
                              <td className="p-4">
                                <img src={ep.thumbnail} alt={ep.title} className="w-14 aspect-[16/10] object-cover rounded-lg border border-theme-coffee/10 dark:border-theme-darkBorder" />
                              </td>
                              <td className="p-4 font-bold text-theme-coffee dark:text-theme-darkText truncate max-w-[150px]">
                                {ep.title}
                              </td>
                              <td className="p-4 text-xs font-mono truncate max-w-[200px] text-theme-coffee/60 dark:text-theme-darkText/50">
                                {ep.videoUrl}
                              </td>
                              <td className="p-4 text-xs">{Math.round(ep.duration / 60)} mins</td>
                              <td className="p-4">
                                <div className="flex gap-2 justify-center">
                                  <button
                                    onClick={() => handleDeleteEpisode(ep.id)}
                                    className="p-2 bg-red-550/10 hover:bg-red-550/20 text-red-650 dark:text-red-500 rounded-lg transition-transform active:scale-90 cursor-pointer"
                                    title="Delete Episode"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-20 border border-dashed border-theme-coffee/15 rounded-premium bg-theme-beige/5">
                      <PlaySquare size={36} className="mx-auto text-theme-coffee/30 dark:text-theme-darkText/30 mb-2 animate-bounce" />
                      <p className="text-sm font-bold text-theme-coffee/70 dark:text-theme-darkText/70">No episodes added to this show yet.</p>
                    </div>
                  )
                ) : null}

              </div>
            )}

            {/* TAB 4: MANAGE USERS & ROLES */}
            {activeTab === 'users' && (
              <div className="flex flex-col gap-6">
                <div className="flex justify-between items-center border-b border-theme-coffee/10 dark:border-theme-darkBorder pb-3">
                  <h3 className="text-lg font-extrabold text-theme-coffee dark:text-theme-darkText flex items-center gap-2">
                    <Users size={20} className="text-theme-orange" />
                    <span>Registered User Directory</span>
                  </h3>
                  <span className="px-3 py-1 bg-theme-orange/10 text-theme-orange text-xs font-bold rounded-lg font-sans">
                    Total Registered: {usersList.length}
                  </span>
                </div>

                <div className="overflow-x-auto rounded-premium border border-theme-coffee/15 dark:border-theme-darkBorder shadow-retro">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-theme-coffee/10 dark:bg-theme-darkBg border-b border-theme-coffee/15 dark:border-theme-darkBorder text-xs font-extrabold uppercase tracking-wider text-theme-coffee dark:text-theme-darkText">
                        <th className="p-4">Name</th>
                        <th className="p-4">Email Address</th>
                        <th className="p-4">Current Role</th>
                        <th className="p-4 text-center">Status / Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersList.length > 0 ? (
                        usersList.map((user) => (
                          <tr key={user.uid} className="border-b border-theme-coffee/10 dark:border-theme-darkBorder hover:bg-theme-coffee/5 dark:hover:bg-theme-darkBg transition-colors font-medium">
                            <td className="p-4 font-bold text-theme-coffee dark:text-theme-darkText">{user.displayName || 'Viewer'}</td>
                            <td className="p-4 text-xs font-mono text-theme-coffee/70 dark:text-theme-darkText/60">{user.email}</td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase ${
                                user.role === 'admin' ? 'bg-theme-orange/15 text-theme-orange' : 'bg-theme-coffee/10 text-theme-coffee/60 dark:bg-theme-darkCard dark:text-theme-darkText/50'
                              }`}>
                                {user.role || 'user'}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex justify-center">
                                {user.email === 'vjana0640@gmail.com' ? (
                                  <span className="text-[10px] font-extrabold uppercase text-theme-orange flex items-center gap-1">
                                    Primary Owner
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => handleRoleToggle(user.uid, user.email, user.role)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95 flex items-center gap-1.5 ${
                                      user.role === 'admin'
                                        ? 'bg-red-550/15 hover:bg-red-550/25 text-red-650 dark:text-red-550'
                                        : 'bg-theme-orange text-theme-cream hover:bg-theme-orange-light'
                                    }`}
                                  >
                                    {user.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="text-center py-10 font-bold text-theme-coffee/50 dark:text-theme-darkText/50">
                            No registered users found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>

    </div>
  );
};

export default AdminDashboard;
