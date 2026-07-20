import React, { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Hls from 'hls.js';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  Settings, 
  Tv, 
  Subtitles, 
  ExternalLink,
  Expand,
  Shrink,
  Volume1,
  RotateCcw
} from 'lucide-react';

const Player = ({ 
  videoUrl, 
  title, 
  onNext, 
  onPrev, 
  hasNext = false, 
  hasPrev = false,
  onTimeUpdate = () => {},
  initialProgress = 0,
  onVideoEnded = () => {}
}) => {
  const { t } = useTranslation();
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const hlsRef = useRef(null);

  // States
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  
  // Custom dropdowns
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState('1080p');
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(true);
  const [countdown, setCountdown] = useState(null);

  // Auto-hide controls timer
  const controlsTimeoutRef = useRef(null);



  const getYouTubeId = (url) => {
    if (!url || typeof url !== 'string') return null;
    
    let targetUrl = url;
    // Check if it is a full HTML iframe block and extract the src URL
    if (url.includes('<iframe') && url.includes('src=')) {
      const matchSrc = url.match(/src=["']([^"']+)["']/);
      if (matchSrc && matchSrc[1]) {
        targetUrl = matchSrc[1];
      }
    }
    
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = targetUrl.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const ytId = getYouTubeId(videoUrl);
  const startParam = (initialProgress > 0) ? `&start=${Math.floor(initialProgress)}` : '';
  const hasSeekedRef = useRef(false);

  // Initialize and load video streams
  useEffect(() => {
    if (ytId) return; // YouTube handles its own stream
    const video = videoRef.current;
    if (!video) return;

    // Reset player states and seek flag
    setIsPlaying(false);
    setDuration(0);
    setCurrentTime(0);
    setCountdown(null);
    hasSeekedRef.current = false;

    // Destroy existing HLS instances
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (videoUrl.endsWith('.m3u8')) {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS (Safari / iOS)
        video.src = videoUrl;
      } else if (Hls.isSupported()) {
        // Hls.js library for Chrome/Firefox/Edge/Windows
        const hls = new Hls({ maxBufferSize: 0, maxBufferLength: 5 });
        hls.loadSource(videoUrl);
        hls.attachMedia(video);
        hlsRef.current = hls;

        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                hls.recoverMediaError();
                break;
              default:
                break;
            }
          }
        });
      }
    } else {
      // Normal direct MP4/WebM URL
      video.src = videoUrl;
    }

    // Set initial progress once if provided
    const handleLoadedMetadata = () => {
      if (video.duration) setDuration(video.duration);
      if (!hasSeekedRef.current && initialProgress > 0 && video.duration && initialProgress < video.duration * 0.98) {
        hasSeekedRef.current = true;
        video.currentTime = initialProgress;
      }
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('loadeddata', handleLoadedMetadata);
    video.addEventListener('canplay', handleLoadedMetadata);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('loadeddata', handleLoadedMetadata);
      video.removeEventListener('canplay', handleLoadedMetadata);
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [videoUrl, ytId]);

  // Handle auto-next countdown when video ends
  useEffect(() => {
    let timer;
    if (countdown !== null) {
      if (countdown > 0) {
        timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      } else {
        setCountdown(null);
        onVideoEnded();
      }
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Video Events
  const handlePlayPause = () => {
    if (countdown !== null) {
      setCountdown(null);
    }
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play().catch(e => console.log("Play interrupted:", e));
    }
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
    if (hasNext) {
      setCountdown(5); // Start 5s timer for auto next
    } else {
      onVideoEnded(); // Just trigger ending routine
    }
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    setCurrentTime(video.currentTime);
    onTimeUpdate(video.currentTime, video.duration);
  };

  const handleSeekChange = (e) => {
    const video = videoRef.current;
    if (!video) return;
    const time = parseFloat(e.target.value);
    video.currentTime = time;
    setCurrentTime(time);
  };

  const handleVolumeChange = (e) => {
    const video = videoRef.current;
    if (!video) return;
    const val = parseFloat(e.target.value);
    video.volume = val;
    setVolume(val);
    setIsMuted(val === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    const nextMute = !isMuted;
    video.muted = nextMute;
    setIsMuted(nextMute);
  };

  const handleSpeedChange = (speed) => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = speed;
    setPlaybackSpeed(speed);
    setShowSpeedMenu(false);
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(err => console.error("Fullscreen error:", err));
    } else {
      document.exitFullscreen()
        .then(() => setIsFullscreen(false));
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleTheaterMode = () => {
    const nextVal = !isTheaterMode;
    setIsTheaterMode(nextVal);
    // Dispatch event so Watch page grid updates layout classes
    window.dispatchEvent(new CustomEvent('theaterModeChanged', { detail: nextVal }));
  };

  const triggerPictureInPicture = async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (video.requestPictureInPicture) {
        await video.requestPictureInPicture();
      }
    } catch (e) {
      console.warn("PiP not supported or failed:", e);
    }
  };

  // Auto-hide controls logic
  const handleMouseMove = () => {
    setShowControls(true);
    clearTimeout(controlsTimeoutRef.current);
    
    // Auto hide controls after 3 seconds of inactivity, unless paused
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
        setShowSpeedMenu(false);
        setShowQualityMenu(false);
      }, 3000);
    }
  };

  useEffect(() => {
    return () => clearTimeout(controlsTimeoutRef.current);
  }, [isPlaying]);

  // Utility to format seconds to MM:SS
  const formatTime = (secs) => {
    if (isNaN(secs) || secs === Infinity) return '00:00';
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Mock cartoon subtitle quotes corresponding to time
  const getSubtitles = (time) => {
    if (!subtitlesEnabled) return null;
    const cleanTime = Math.floor(time);
    
    // Fun cartoon quote triggers based on seconds
    if (cleanTime >= 5 && cleanTime < 10) return "[Music playing - Uplifting Whimsical Theme]";
    if (cleanTime >= 15 && cleanTime < 25) return "Penny: \"Don't press that shiny red button!\"";
    if (cleanTime >= 28 && cleanTime < 38) return "Dr. Hugo: \"But science demands it! Behold the power!\"";
    if (cleanTime >= 45 && cleanTime < 55) return "Timid: \"The things I do for love...\"";
    if (cleanTime >= 80 && cleanTime < 90) return "[Giant Hamster roaring in distance]";
    return null;
  };

  const activeSubtitle = getSubtitles(currentTime);

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      className={`relative w-full aspect-video select-none overflow-hidden bg-black transition-all duration-300 rounded-premium border-2 border-theme-coffee/15 dark:border-theme-darkBorder shadow-retro ${
        isFullscreen ? 'rounded-none border-none' : ''
      }`}
    >
      {/* -------------------------------------------------------------
          YOUTUBE EMBED HANDLER
         ------------------------------------------------------------- */}
      {ytId ? (
        <div className="w-full h-full relative">
          <iframe
            src={`https://www.youtube.com/embed/${ytId}?autoplay=1&controls=1&rel=0&modestbranding=1&enablejsapi=1${startParam}`}
            title={title}
            className="w-full h-full border-none"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
         </div>
      ) : (
        /* -------------------------------------------------------------
            HTML5 & HLS CUSTOM PLAYER
           ------------------------------------------------------------- */
        <div className="w-full h-full relative flex items-center justify-center group/player">
          
          <video
            ref={videoRef}
            onClick={handlePlayPause}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleVideoEnded}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            className="w-full h-full object-contain"
            playsInline
            autoPlay
          />

          {/* Subtitles Overlay */}
          {activeSubtitle && (
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30 px-4 py-1.5 bg-black/75 backdrop-blur-md rounded-lg border border-theme-cream/10 text-theme-cream text-xs sm:text-sm font-semibold tracking-wide text-center drop-shadow">
              {activeSubtitle}
            </div>
          )}



          {/* Auto-play next episode countdown banner overlay */}
          {countdown !== null && (
            <div className="absolute inset-0 z-30 flex flex-col justify-center items-center bg-black/85 text-theme-cream text-center p-6">
              <RotateCcw size={36} className="text-theme-orange animate-spin mb-4" style={{ animationDuration: '4s' }} />
              <h3 className="text-lg font-bold tracking-wide">
                {t('player.nextIn', { seconds: countdown })}
              </h3>
              <p className="text-xs text-theme-cream/60 mt-1 max-w-xs truncate font-medium">
                {title} finished. Prepare for the next cartoon!
              </p>
              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => setCountdown(null)}
                  className="px-5 py-2.5 rounded-xl bg-theme-cream text-theme-coffee font-extrabold text-xs cursor-pointer shadow hover:bg-theme-beige transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={onNext}
                  className="px-5 py-2.5 rounded-xl bg-theme-orange text-theme-cream font-extrabold text-xs cursor-pointer shadow hover:bg-theme-orange-light transition-colors"
                >
                  Play Now
                </button>
              </div>
            </div>
          )}

          {/* Centered big play/pause splash button (visible on hover) */}
          {!isPlaying && countdown === null && (
            <button
              onClick={handlePlayPause}
              className="absolute z-30 p-5 rounded-full bg-theme-orange hover:bg-theme-orange-light text-theme-cream shadow-2xl transform scale-110 hover:scale-120 transition-all duration-300 flex items-center justify-center cursor-pointer"
            >
              <Play size={24} className="fill-theme-cream ml-0.5" />
            </button>
          )}

          {/* -------------------------------------------------------------
              CUSTOM SKINNED CONTROL BAR
             ------------------------------------------------------------- */}
          <div 
            className={`absolute bottom-0 inset-x-0 z-30 bg-gradient-to-t from-black/90 via-black/55 to-transparent px-4 pt-10 pb-4 flex flex-col gap-3 transition-opacity duration-300 ${
              showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            {/* PROGRESS SCRUBBER ROW */}
            <div className="flex items-center gap-3 w-full">
              <span className="text-[11px] font-bold font-mono text-theme-cream/80">
                {formatTime(currentTime)}
              </span>
              <input
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                onChange={handleSeekChange}
                className="flex-grow h-1.5 rounded-full appearance-none bg-theme-cream/25 cursor-pointer accent-theme-orange outline-none"
              />
              <span className="text-[11px] font-bold font-mono text-theme-cream/80">
                {formatTime(duration)}
              </span>
            </div>

            {/* BUTTON CONTROLS ROW */}
            <div className="flex items-center justify-between">
              
              {/* Playback Controls (Play/Pause, Prev, Next, Volume) */}
              <div className="flex items-center gap-4">
                {/* Prev episode */}
                <button
                  onClick={onPrev}
                  disabled={!hasPrev}
                  className="text-theme-cream/70 hover:text-theme-cream transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  title={t('common.prev')}
                >
                  <SkipBack size={18} />
                </button>

                {/* Play/Pause */}
                <button
                  onClick={handlePlayPause}
                  className="text-theme-cream hover:text-theme-cream hover:scale-110 transition-all cursor-pointer"
                >
                  {isPlaying ? <Pause size={20} className="fill-theme-cream" /> : <Play size={20} className="fill-theme-cream" />}
                </button>

                {/* Next episode */}
                <button
                  onClick={onNext}
                  disabled={!hasNext}
                  className="text-theme-cream/70 hover:text-theme-cream transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  title={t('common.next')}
                >
                  <SkipForward size={18} />
                </button>

                {/* Volume icon */}
                <div className="flex items-center gap-2 group/volume ml-2">
                  <button
                    onClick={toggleMute}
                    className="text-theme-cream/80 hover:text-theme-cream transition-colors cursor-pointer"
                  >
                    {isMuted ? <VolumeX size={18} /> : volume < 0.5 ? <Volume1 size={18} /> : <Volume2 size={18} />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-16 h-1 appearance-none bg-theme-cream/20 cursor-pointer accent-theme-cream outline-none rounded-full"
                  />
                </div>
              </div>

              {/* Action Utilities (Speed, Subtitles, Quality, CRT, PiP, Theater, Fullscreen) */}
              <div className="flex items-center gap-3.5 relative">
                
                {/* Playback Speed selector */}
                <div className="relative">
                  <button
                    onClick={() => { setShowSpeedMenu(!showSpeedMenu); setShowQualityMenu(false); }}
                    className="text-xs font-extrabold text-theme-cream/80 hover:text-theme-cream hover:bg-theme-cream/10 px-2 py-1 rounded transition-colors cursor-pointer"
                    title={t('player.speed')}
                  >
                    {playbackSpeed}x
                  </button>
                  {showSpeedMenu && (
                    <div className="absolute bottom-full right-0 mb-2 w-24 rounded-lg bg-black/90 border border-theme-cream/20 overflow-hidden flex flex-col py-1 text-xs">
                      {[0.5, 1, 1.25, 1.5, 2].map((sp) => (
                        <button
                          key={sp}
                          onClick={() => handleSpeedChange(sp)}
                          className={`px-3 py-1.5 text-left text-theme-cream hover:bg-theme-orange transition-colors ${
                            playbackSpeed === sp ? 'text-theme-orange font-bold hover:text-theme-cream' : ''
                          }`}
                        >
                          {sp}x
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Subtitle Toggle */}
                <button
                  onClick={() => setSubtitlesEnabled(!subtitlesEnabled)}
                  className={`p-1.5 rounded transition-all cursor-pointer ${
                    subtitlesEnabled ? 'text-theme-orange hover:text-theme-orange-light' : 'text-theme-cream/65 hover:text-theme-cream'
                  }`}
                  title={t('player.subtitles')}
                >
                  <Subtitles size={16} />
                </button>

                {/* Quality selector */}
                <div className="relative">
                  <button
                    onClick={() => { setShowQualityMenu(!showQualityMenu); setShowSpeedMenu(false); }}
                    className="text-[10px] font-extrabold border border-theme-cream/35 text-theme-cream/80 hover:text-theme-cream hover:border-theme-cream px-1.5 py-0.5 rounded uppercase cursor-pointer"
                    title={t('player.quality')}
                  >
                    {selectedQuality}
                  </button>
                  {showQualityMenu && (
                    <div className="absolute bottom-full right-0 mb-2 w-24 rounded-lg bg-black/90 border border-theme-cream/20 overflow-hidden flex flex-col py-1 text-xs">
                      {['1080p', '720p', '480p'].map((q) => (
                        <button
                          key={q}
                          onClick={() => { setSelectedQuality(q); setShowQualityMenu(false); }}
                          className={`px-3 py-1.5 text-left text-theme-cream hover:bg-theme-orange transition-colors ${
                            selectedQuality === q ? 'text-theme-orange font-bold hover:text-theme-cream' : ''
                          }`}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  )}
                </div>



                {/* Picture in picture */}
                <button
                  onClick={triggerPictureInPicture}
                  className="text-theme-cream/70 hover:text-theme-cream transition-colors cursor-pointer"
                  title={t('player.pip')}
                >
                  <ExternalLink size={16} />
                </button>

                {/* Theater Mode */}
                {!isFullscreen && (
                  <button
                    onClick={toggleTheaterMode}
                    className="text-theme-cream/70 hover:text-theme-cream transition-colors cursor-pointer hidden md:inline"
                    title="Theater Mode"
                  >
                    {isTheaterMode ? <Shrink size={16} /> : <Expand size={16} />}
                  </button>
                )}

                {/* Fullscreen */}
                <button
                  onClick={toggleFullscreen}
                  className="text-theme-cream/70 hover:text-theme-cream transition-colors cursor-pointer"
                  title={t('player.fullscreen')}
                >
                  {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
                </button>
              </div>

            </div>

          </div>

        </div>
      )}
    </div>
  );
};

export default Player;
