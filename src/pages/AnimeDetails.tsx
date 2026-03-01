import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Heart,
  Play,
  Star,
  Clock,
  Calendar,
  Users,
  Captions,
  Mic,
} from 'lucide-react';
import { useAnimeDetails } from '@/hooks/useAnime';
import { useLibrary } from '@/hooks/useLibrary';
import { getDisplayTitle, AnimeMedia } from '@/lib/anilist';
import AnimeCard from '@/components/AnimeCard';

const AnimeDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: anime, isLoading } = useAnimeDetails(id!);
  const { isInLibrary, toggleLibrary } = useLibrary();
  const [inLibrary, setInLibrary] = useState(false);
  const [countdown, setCountdown] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const checkLibrary = async () => {
      if (anime) {
        const exists = await isInLibrary(String(anime.id));
        setInLibrary(exists);
      }
    };
    checkLibrary();
  }, [anime, isInLibrary]);

  useEffect(() => {
    if (!anime?.nextAiringEpisode) return;

    const updateCountdown = () => {
      const timeLeft = anime.nextAiringEpisode!.airingAt * 1000 - Date.now();
      if (timeLeft <= 0) {
        setCountdown(null);
        return;
      }

      const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

      setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [anime?.nextAiringEpisode]);

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  if (isLoading || !anime) {
    return (
      <div className="min-h-screen bg-background">
        <div className="h-[40vh] sm:h-[50vh] shimmer" />
        <div className="container -mt-16 sm:-mt-20 relative z-10">
          <div className="h-6 sm:h-8 w-48 sm:w-64 shimmer rounded mb-3 sm:mb-4" />
          <div className="h-3 sm:h-4 w-full shimmer rounded mb-2" />
          <div className="h-3 sm:h-4 w-3/4 shimmer rounded" />
        </div>
      </div>
    );
  }

  const title = getDisplayTitle(anime.title);

  return (
    <div className="min-h-screen bg-background pb-24 sm:pb-32">
      {/* Banner Section */}
      <div className="relative h-[40vh] sm:h-[45vh] md:h-[50vh]">
        {!imageLoaded && <div className="absolute inset-0 shimmer" />}
        <motion.img
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8 }}
          src={anime.bannerImage || anime.coverImage.extraLarge}
          alt={title}
          className={`w-full h-full object-cover ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImageLoaded(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />

        {/* Top Navigation */}
        <div className="absolute top-0 left-0 right-0 z-20">
          <div className="container py-3 sm:py-4 flex items-center justify-between">
            <motion.button
              onClick={handleBack}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full glass flex items-center justify-center"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </motion.button>

            <motion.button
              onClick={async () => {
                await toggleLibrary(anime);
                setInLibrary(!inLibrary);
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full glass flex items-center justify-center transition-colors ${
                inLibrary ? 'bg-primary/30' : ''
              }`}
            >
              <Heart
                className={`w-4 h-4 sm:w-5 sm:h-5 transition-all ${
                  inLibrary ? 'fill-primary text-primary' : ''
                }`}
              />
            </motion.button>
          </div>
        </div>

        {/* Airing Countdown Badge */}
        {countdown && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="absolute top-16 sm:top-20 right-4 sm:right-6"
          >
            <div className="glass-strong rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-center">
              <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5 sm:mb-1">
                Episode {anime.nextAiringEpisode?.episode} in
              </p>
              <p className="text-sm sm:text-lg font-bold text-primary glow-text">{countdown}</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Content */}
      <div className="container -mt-20 sm:-mt-24 relative z-10">
        {/* Title & Rating */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-end gap-3 sm:gap-4 mb-4 sm:mb-6"
        >
            <img
              src={anime.coverImage.extraLarge}
              alt={title}
              className="w-24 sm:w-28 md:w-36 rounded-lg sm:rounded-xl shadow-card"
            />
          <div className="flex-1 pb-1 sm:pb-2">
            <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
              {anime.averageScore && (
                <span className="rating-badge px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-bold flex items-center gap-0.5 sm:gap-1">
                  <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current" />
                  {(anime.averageScore / 10).toFixed(1)}
                </span>
              )}
              <span className="glass px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-medium">
                {anime.status}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold leading-tight line-clamp-2">{title}</h1>
            {anime.title.native && (
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1 line-clamp-1">{anime.title.native}</p>
            )}
          </div>
        </motion.div>

        {/* Trailer */}
        {anime.trailer?.site === 'youtube' && (
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-6 sm:mb-8"
          >
            <div className="relative aspect-video rounded-lg sm:rounded-xl overflow-hidden shadow-card">
              <iframe
                src={`https://www.youtube.com/embed/${anime.trailer.id}`}
                title="Trailer"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          </motion.div>
        )}

        {/* Description */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-6 sm:mb-8"
        >
          <h2 className="text-base sm:text-lg font-bold mb-2 sm:mb-3">Synopsis</h2>
          <p
            className="text-sm sm:text-base text-muted-foreground leading-relaxed"
            dangerouslySetInnerHTML={{ __html: anime.description || '' }}
          />
        </motion.div>

          {/* Info Grid */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-3 md:grid-cols-6 gap-2 sm:gap-4 mb-6 sm:mb-8"
            >
              {(anime.subCount != null && anime.subCount > 0) && (
              <div className="glass rounded-lg sm:rounded-xl p-3 sm:p-4">
                <div className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground mb-0.5 sm:mb-1">
                  <Captions className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-[10px] sm:text-xs">Sub</span>
                </div>
                <p className="font-semibold text-sm sm:text-base">{anime.subCount}</p>
              </div>
            )}
            {(anime.dubCount != null && anime.dubCount > 0) && (
              <div className="glass rounded-lg sm:rounded-xl p-3 sm:p-4">
                <div className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground mb-0.5 sm:mb-1">
                  <Mic className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-[10px] sm:text-xs">Dub</span>
                </div>
                <p className="font-semibold text-sm sm:text-base">{anime.dubCount}</p>
              </div>
            )}
            <div className="glass rounded-lg sm:rounded-xl p-3 sm:p-4">
              <div className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground mb-0.5 sm:mb-1">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-[10px] sm:text-xs">Duration</span>
              </div>
              <p className="font-semibold text-sm sm:text-base">{anime.duration ? `${anime.duration} min` : 'TBA'}</p>
            </div>
            <div className="glass rounded-lg sm:rounded-xl p-3 sm:p-4">
              <div className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground mb-0.5 sm:mb-1">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-[10px] sm:text-xs">Aired</span>
              </div>
              <p className="font-semibold text-xs sm:text-sm">{anime.status}</p>
            </div>
            <div className="glass rounded-lg sm:rounded-xl p-3 sm:p-4">
              <div className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground mb-0.5 sm:mb-1">
                <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-[10px] sm:text-xs">Studio</span>
              </div>
              <p className="font-semibold text-xs sm:text-sm truncate">
                {anime.studios?.nodes[0]?.name || 'Unknown'}
              </p>
            </div>
          </motion.div>

        {/* Genres */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="mb-8 sm:mb-12"
        >
          <h2 className="text-base sm:text-lg font-bold mb-2 sm:mb-3">Genres</h2>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {anime.genres.map((genre) => (
              <span
                key={genre}
                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-secondary text-secondary-foreground text-xs sm:text-sm font-medium"
              >
                {genre}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Characters */}
        {anime.characters?.nodes && anime.characters.nodes.length > 0 && (
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mb-8 sm:mb-12"
          >
            <h2 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">Characters</h2>
            <div className="flex gap-3 sm:gap-4 overflow-x-auto hide-scrollbar pb-3 sm:pb-4">
              {anime.characters.nodes.map((character) => (
                <div key={character.id} className="flex-shrink-0 text-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden ring-2 ring-primary/30 mb-1.5 sm:mb-2">
                      <img
                        src={character.image.large}
                        alt={character.name.full}
                        className="w-full h-full object-cover"
                      />
                  </div>
                  <p className="text-[10px] sm:text-xs font-medium w-16 sm:w-20 truncate">{character.name.full}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Staff */}
        {anime.staff?.edges && anime.staff.edges.length > 0 && (
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.65 }}
            className="mb-8 sm:mb-12"
          >
            <h2 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">Staff</h2>
            <div className="flex gap-3 sm:gap-4 overflow-x-auto hide-scrollbar pb-3 sm:pb-4">
              {anime.staff.edges.map((edge) => (
                <div key={edge.node.id} className="flex-shrink-0 text-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden ring-2 ring-accent/30 mb-1.5 sm:mb-2">
                      <img
                        src={edge.node.image.large}
                        alt={edge.node.name.full}
                        className="w-full h-full object-cover"
                      />
                  </div>
                  <p className="text-[10px] sm:text-xs font-medium w-16 sm:w-20 truncate">{edge.node.name.full}</p>
                  <p className="text-[8px] sm:text-[10px] text-muted-foreground w-16 sm:w-20 truncate">
                    {edge.role}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

          <div className="h-px bg-white/5 mb-8 sm:mb-12" />

            {/* Seasons */}
            {(() => {
              const seasons = (anime.relations?.nodes || []).filter((m: any) => m && m.id && m.type === 'Season');
              if (seasons.length === 0) return null;
              return (
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="mb-10 sm:mb-16"
                >
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h2 className="text-lg sm:text-xl font-black tracking-tight flex items-center gap-2">
                      <span className="w-1 h-6 bg-primary rounded-full" />
                      Seasons
                    </h2>
                  </div>
                  <div className="flex gap-4 sm:gap-6 overflow-x-auto hide-scrollbar pb-4 sm:pb-6 -mx-4 px-4">
                    {seasons
                      .filter((media: any, index: number, self: any[]) => self.findIndex(m => m?.id === media?.id) === index)
                      .map((media: any, index: number) => {
                        const img = media.coverImage?.extraLarge || media.coverImage?.large || '';
                        const mapped: AnimeMedia = {
                          id: media.id,
                          title: { romaji: media.title?.romaji || '', english: media.title?.english || media.title?.romaji || '' },
                          coverImage: { extraLarge: img, large: media.coverImage?.large || img, color: null },
                          bannerImage: null, description: null, episodes: media.episodes || null,
                          averageScore: media.averageScore || null, status: media.status || 'FINISHED',
                          format: media.format, genres: [], nextAiringEpisode: null,
                        };
                        return <AnimeCard key={media.id} anime={mapped} index={index} />;
                      })}
                  </div>
                </motion.div>
              );
            })()}



            {/* Recommended Anime */}
            {(() => {
                const recommended = (anime.recommendations?.nodes || []).filter((m: any) => m && m.id);
              if (recommended.length === 0) return null;
              return (
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="mb-10 sm:mb-16"
                >
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h2 className="text-lg sm:text-xl font-black tracking-tight flex items-center gap-2">
                      <span className="w-1 h-6 bg-primary rounded-full" />
                      Related
                    </h2>
                  </div>
                  <div className="flex gap-4 sm:gap-6 overflow-x-auto hide-scrollbar pb-4 sm:pb-6 -mx-4 px-4">
                    {recommended
                      .filter((media: any, index: number, self: any[]) => self.findIndex(m => m?.id === media?.id) === index)
                      .map((media: any, index: number) => {
                        const img = media.coverImage?.extraLarge || media.coverImage?.large || '';
                        const mapped: AnimeMedia = {
                          id: media.id,
                          title: { romaji: media.title?.romaji || '', english: media.title?.english || media.title?.romaji || '' },
                          coverImage: { extraLarge: img, large: media.coverImage?.large || img, color: null },
                          bannerImage: null, description: null, episodes: media.episodes || null,
                          averageScore: media.averageScore || null, status: media.status || 'FINISHED',
                          format: media.format, genres: [], nextAiringEpisode: null,
                        };
                        return <AnimeCard key={media.id} anime={mapped} index={index} />;
                      })}
                  </div>
                </motion.div>
              );
            })()}
      </div>

      {/* Floating Watch Button */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9, type: 'spring' }}
          className="fixed bottom-4 sm:bottom-6 left-4 right-4 z-50"
      >
        <motion.button
          onClick={() => navigate(`/anime/${anime.id}/episodes`)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full max-w-lg mx-auto flex items-center justify-center gap-2 sm:gap-3 bg-primary text-primary-foreground py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg shadow-glow pulse-glow"
        >
          <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
          Watch Now
        </motion.button>
      </motion.div>
    </div>
  );
};

export default AnimeDetails;
