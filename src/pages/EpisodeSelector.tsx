import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Volume2, VolumeX, ChevronRight, Play, ChevronLeft, ChevronDown } from 'lucide-react';
import { useAnimeDetails, useAnimeEpisodes } from '@/hooks/useAnime';
import { useWatchHistory } from '@/hooks/useWatchHistory';
import { WatchHistoryEntry } from '@/lib/db';
import { getDisplayTitle } from '@/lib/anilist';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const EpisodeSelector = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: anime, isLoading: detailsLoading } = useAnimeDetails(id!);
  const { data: episodesData, isLoading: episodesLoading } = useAnimeEpisodes(id!);
  const { getAnimeProgress, getEpisodeProgress, formatProgress } = useWatchHistory();
  const [selectedEpisode, setSelectedEpisode] = useState<number | null>(null);
  const [showAudioDialog, setShowAudioDialog] = useState(false);
  const [animeProgress, setAnimeProgress] = useState<WatchHistoryEntry | null>(null);
  const [episodeProgressMap, setEpisodeProgressMap] = useState<Map<number, WatchHistoryEntry>>(new Map());
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [selectedRange, setSelectedRange] = useState(0);

  const RANGE_SIZE = 100;

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate(`/anime/${id}`);
    }
  };

  const getGalleryImages = useCallback(() => {
    if (!anime) return [];
    
    const images: { url: string; title?: string }[] = [];
    
    if (anime.bannerImage) {
      images.push({ url: anime.bannerImage, title: 'Banner' });
    }
    
    if (anime.coverImage.extraLarge) {
      images.push({ url: anime.coverImage.extraLarge, title: 'Cover' });
    }
    
    if (anime.streamingEpisodes && anime.streamingEpisodes.length > 0) {
      anime.streamingEpisodes.slice(0, 6).forEach((ep) => {
        if (ep.thumbnail) {
          images.push({ url: ep.thumbnail, title: ep.title });
        }
      });
    }
    
    if (anime.characters?.nodes) {
      anime.characters.nodes.slice(0, 4).forEach((char) => {
        if (char.image.large) {
          images.push({ url: char.image.large, title: char.name.full });
        }
      });
    }
    
    return images.length > 0 ? images : [{ url: anime.coverImage.extraLarge || anime.coverImage.large }];
  }, [anime]);

  const galleryImages = getGalleryImages();

  useEffect(() => {
    if (!isAutoPlaying || galleryImages.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % galleryImages.length);
    }, 4000);
    
    return () => clearInterval(interval);
  }, [isAutoPlaying, galleryImages.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 8000);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % galleryImages.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 8000);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 8000);
  };

    useEffect(() => {
      const loadProgress = async () => {
        if (!id) return;
        const progress = await getAnimeProgress(id);
        setAnimeProgress(progress);
  
        if (episodesData) {
          const progressMap = new Map<number, WatchHistoryEntry>();
          for (const ep of episodesData.episodes) {
            const epProgress = await getEpisodeProgress(id, ep.episode_no);
            if (epProgress) {
              progressMap.set(ep.episode_no, epProgress);
            }
          }
          setEpisodeProgressMap(progressMap);
        }
      };
      loadProgress();
    }, [id, episodesData, getAnimeProgress, getEpisodeProgress]);

  const dubCount = anime?.dubCount || 0;

  const episodes = useMemo(() => {
    if (!episodesData) return [];
    return episodesData.episodes.map((ep) => {
      const epProgress = episodeProgressMap.get(ep.episode_no);
      const watchedPercent = epProgress ? formatProgress(epProgress.timestamp, epProgress.duration) : 0;
      return {
        number: ep.episode_no,
        id: ep.id,
        title: ep.title,
        isWatched: watchedPercent >= 90,
        isInProgress: watchedPercent > 0 && watchedPercent < 90,
        watchedPercent,
        savedProgress: epProgress,
        hasDub: ep.episode_no <= dubCount,
        isFiller: ep.filler,
      };
    });
  }, [episodesData, episodeProgressMap, dubCount, formatProgress]);

  const episodeRanges = useMemo(() => {
    if (!episodes || episodes.length <= RANGE_SIZE) return null;
    const ranges = [];
    for (let i = 0; i < episodes.length; i += RANGE_SIZE) {
      const start = i + 1;
      const end = Math.min(i + RANGE_SIZE, episodes.length);
      ranges.push({ start, end });
    }
    return ranges;
  }, [episodes]);

  const displayedEpisodes = useMemo(() => {
    if (!episodeRanges) return episodes;
    const range = episodeRanges[selectedRange];
    if (!range) return episodes;
    return episodes.filter(ep => ep.number >= range.start && ep.number <= range.end);
  }, [episodes, episodeRanges, selectedRange]);

  if (detailsLoading || episodesLoading || !anime || !episodesData) {
    return (
      <div className="min-h-screen bg-background">
        <div className="h-40 sm:h-48 shimmer" />
        <div className="container py-4 sm:py-6">
          <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-2 sm:gap-3">
            {[...Array(15)].map((_, i) => (
              <div key={i} className="h-10 sm:h-14 shimmer rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const title = getDisplayTitle(anime.title);

  const handleEpisodeClick = (episodeNum: number, hasDub: boolean, savedProgress?: WatchHistoryEntry) => {
    setSelectedEpisode(episodeNum);
    
    if (savedProgress && savedProgress.timestamp > 30) {
      const episode = episodesData.episodes.find(ep => ep.episode_no === episodeNum);
      if (episode) {
        enterFullscreenLandscape();
        navigate(`/watch/${anime.id}?epId=${episode.id}&ep=${episodeNum}&audio=${savedProgress.audioType}`);
        return;
      }
    }
    
    if (hasDub) {
      setShowAudioDialog(true);
    } else {
      handlePlay(episodeNum, 'sub');
    }
  };

  const enterFullscreenLandscape = async () => {
    try {
      await document.documentElement.requestFullscreen();
      if (screen.orientation && 'lock' in screen.orientation) {
        await screen.orientation.lock('landscape').catch(() => {});
      }
    } catch {
      try {
        const elem = document.documentElement as HTMLElement & {
          webkitRequestFullscreen?: () => Promise<void>;
          mozRequestFullScreen?: () => Promise<void>;
          msRequestFullscreen?: () => Promise<void>;
        };
        if (elem.webkitRequestFullscreen) {
          await elem.webkitRequestFullscreen();
        } else if (elem.mozRequestFullScreen) {
          await elem.mozRequestFullScreen();
        } else if (elem.msRequestFullscreen) {
          await elem.msRequestFullscreen();
        }
      } catch (error) {
        console.error('Fullscreen error:', error);
      }
    }
  };

  const handlePlay = async (episodeNum: number, audioType: 'sub' | 'dub') => {
    setShowAudioDialog(false);
    const episode = episodesData.episodes.find(ep => ep.episode_no === episodeNum);
    if (episode) {
      await enterFullscreenLandscape();
      const malId = anime.idMal;
      navigate(`/watch/${anime.id}?epId=${episode.id}&ep=${episodeNum}&audio=${audioType}${malId ? `&malId=${malId}` : ''}`);
    }
  };

  const handleContinueWatching = async () => {
    if (!animeProgress) return;
    await enterFullscreenLandscape();
    navigate(`/watch/${anime.id}?epId=${animeProgress.epId}&ep=${animeProgress.episode}&audio=${animeProgress.audioType}`);
  };

    return (
      <div className="min-h-screen bg-background">
        {/* Auto-sliding Image Gallery */}
        <div className="relative h-44 sm:h-56 md:h-64 overflow-hidden group">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="absolute inset-0"
            >
              <img
                src={galleryImages[currentSlide]?.url}
                alt={galleryImages[currentSlide]?.title || title}
                className="w-full h-full object-cover"
              />
            </motion.div>
          </AnimatePresence>
          
          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/30 via-transparent to-background/30" />

          {/* Navigation Arrows */}
          {galleryImages.length > 1 && (
            <>
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={prevSlide}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </motion.button>
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={nextSlide}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </motion.button>
            </>
          )}

          {/* Slide Indicators */}
          {galleryImages.length > 1 && (
            <div className="absolute bottom-16 sm:bottom-20 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2 z-20">
              {galleryImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-1 sm:h-1.5 rounded-full transition-all duration-300 ${
                    index === currentSlide 
                      ? 'w-6 sm:w-8 bg-primary' 
                      : 'w-1.5 sm:w-2 bg-white/50 hover:bg-white/70'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Progress Bar for auto-slide */}
          {galleryImages.length > 1 && isAutoPlaying && (
            <div className="absolute bottom-14 sm:bottom-18 left-1/2 -translate-x-1/2 w-32 sm:w-40 h-0.5 bg-white/20 rounded-full overflow-hidden z-20">
              <motion.div
                key={currentSlide}
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 4, ease: 'linear' }}
                className="h-full bg-primary/70"
              />
            </div>
          )}

          {/* Top Navigation */}
          <div className="absolute top-0 left-0 right-0 z-20">
            <div className="container py-3 sm:py-4">
              <motion.button
                  onClick={handleBack}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full glass flex items-center justify-center"
                >
                  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </motion.button>
            </div>
          </div>

          {/* Title Section */}
          <div className="absolute bottom-0 left-0 right-0 z-10">
            <div className="container pb-3 sm:pb-4">
              <h1 className="text-lg sm:text-xl font-bold line-clamp-1">{title}</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {episodesData.totalEpisodes} episodes available
              </p>
            </div>
          </div>
        </div>
  
        <div className="container py-4 sm:py-6 pb-24 sm:pb-32">
          {animeProgress && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 sm:mb-6"
            >
              <button
                onClick={handleContinueWatching}
                className="w-full flex items-center gap-3 p-3 sm:p-4 rounded-xl bg-primary/10 border border-primary/30 hover:bg-primary/20 transition-colors"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                  <Play className="w-6 h-6 sm:w-7 sm:h-7 text-primary-foreground fill-primary-foreground" />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="font-semibold text-sm sm:text-base">Continue Episode {animeProgress.episode}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {animeProgress.audioType.toUpperCase()} • {formatProgress(animeProgress.timestamp, animeProgress.duration)}% watched
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              </button>
            </motion.div>
          )}
  
          <div className="flex flex-col gap-4 mb-4 sm:mb-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-bold">Episodes</h2>
              {animeProgress && (
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Last: Ep {animeProgress.episode}
                </p>
              )}
            </div>

              {episodeRanges && (
                <div className="flex items-center gap-2 mt-6">
                  <span className="text-xs sm:text-sm font-medium text-muted-foreground">Range:</span>
                  <Select
                    value={selectedRange.toString()}
                    onValueChange={(value) => setSelectedRange(parseInt(value))}
                  >
                    <SelectTrigger className="w-[160px] sm:w-[220px] h-10 sm:h-11 glass-strong border-primary/20">
                      <SelectValue placeholder="Select Range" />
                    </SelectTrigger>
                      <SelectContent 
                        className="glass-strong border-primary/20 max-h-[320px] sm:max-h-[480px]" 
                        side="bottom" 
                        align="start" 
                        sideOffset={15}
                        position="popper"
                      >
                      {episodeRanges.map((range, index) => (
                        <SelectItem key={index} value={index.toString()} className="py-2 sm:py-2.5">
                          {range.start} - {range.end}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

          </div>
  
          <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 sm:gap-3">
            {displayedEpisodes.map((ep, index) => (

            <motion.button
              key={ep.number}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.02 }}
              onClick={() => handleEpisodeClick(ep.number, ep.hasDub, ep.savedProgress)}
              className={`relative p-2.5 sm:p-4 rounded-lg sm:rounded-xl text-center font-semibold text-sm sm:text-base transition-all overflow-hidden ${
                ep.isWatched
                  ? 'bg-primary/20 text-primary ring-1 ring-primary/50'
                  : ep.isFiller
                  ? 'bg-orange-500/20 text-orange-400 ring-1 ring-orange-500/50'
                  : 'bg-secondary hover:bg-secondary/80'
              }`}
              title={ep.title}
            >
              {ep.number}
              {ep.hasDub && (
                <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-primary text-[6px] sm:text-[8px] text-primary-foreground flex items-center justify-center font-bold">
                  D
                </span>
              )}
              {ep.isInProgress && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${ep.watchedPercent}%` }}
                  />
                </div>
              )}
            </motion.button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-4 sm:mt-6 text-xs sm:text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-primary/20 ring-1 ring-primary/50" />
            <span>Watched</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="relative w-3 h-3 sm:w-4 sm:h-4 rounded bg-secondary overflow-hidden">
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            </div>
            <span>In Progress</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="relative w-3 h-3 sm:w-4 sm:h-4 rounded bg-secondary">
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary text-[6px]" />
            </div>
            <span>Dub Available</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-orange-500/20 ring-1 ring-orange-500/50" />
            <span>Filler</span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showAudioDialog && selectedEpisode !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowAudioDialog(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="w-full max-w-lg mx-4 mb-4 sm:mb-0 glass-strong rounded-xl sm:rounded-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-bold mb-1.5 sm:mb-2">Episode {selectedEpisode}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">
                  Choose your preferred audio
                </p>

                <div className="space-y-2 sm:space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handlePlay(selectedEpisode, 'sub')}
                    className="w-full flex items-center justify-between p-3 sm:p-4 rounded-lg sm:rounded-xl bg-secondary hover:bg-secondary/80 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 sm:gap-3">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-sm sm:text-base">Japanese (Sub)</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">Original audio with subtitles</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handlePlay(selectedEpisode, 'dub')}
                    className="w-full flex items-center justify-between p-3 sm:p-4 rounded-lg sm:rounded-xl bg-secondary hover:bg-secondary/80 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 sm:gap-3">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-accent/20 flex items-center justify-center">
                        <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-sm sm:text-base">English (Dub)</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">English voice over</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
        </AnimatePresence>
    </div>
  );
};

export default EpisodeSelector;
