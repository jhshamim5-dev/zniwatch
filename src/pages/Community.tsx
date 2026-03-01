import { motion } from 'framer-motion';
import { Users, MessageCircle, TrendingUp, Star, ExternalLink, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import BottomNav from '@/components/BottomNav';


interface TopTenAnime {
  id: string;
  data_id: string;
  number: string;
  title: string;
  japanese_title: string;
  poster: string;
  tvInfo: { sub?: string; dub?: string };
}

const Community = () => {
  const navigate = useNavigate();
  const [trendingAnime, setTrendingAnime] = useState<TopTenAnime[]>([]);
  const [loading, setLoading] = useState(true);
  const [visitCount, setVisitCount] = useState(0);

  useEffect(() => {
    const storedCount = localStorage.getItem('zniwatch_visit_count');
    const currentCount = storedCount ? parseInt(storedCount) + 1 : 1;
    localStorage.setItem('zniwatch_visit_count', currentCount.toString());
    setVisitCount(currentCount);

    const fetchTrending = async () => {
        try {
          const res = await fetch('https://animeapi-sage.vercel.app/api/top-ten');
          const json = await res.json();
          const today: TopTenAnime[] = json.results?.today?.slice(0, 5) || [];
          setTrendingAnime(today);
        } catch (error) {
          console.error('Failed to fetch trending:', error);
        } finally {
          setLoading(false);
        }
      };

    fetchTrending();
  }, []);

    return (
    <div className="min-h-screen bg-background pb-24 sm:pb-32">
      <div className="container pt-6 sm:pt-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
          <Users className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
          Community
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-2xl p-5 sm:p-6"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-base sm:text-lg">ZniWatch Official</span>
                    <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">
                      Announcement
                    </span>
                  </div>
                  <p className="text-sm sm:text-base text-foreground/90 leading-relaxed mb-4">
                    Please Join Our Telegram Discussion Group if you want to give reviews or want to discuss your Favorite anime - Join Here And Support Us
                  </p>
                    <a
                      href="https://t.me/ZniWatch"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium text-sm hover:opacity-90 transition-opacity"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Join Telegram Group
                    </a>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass rounded-2xl p-4 sm:p-5"
            >
              <h3 className="font-bold text-base sm:text-lg mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Trending Now
              </h3>
              <div className="space-y-3">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl animate-pulse">
                      <div className="w-6 h-6 bg-muted rounded" />
                      <div className="flex-1 h-4 bg-muted rounded" />
                    </div>
                  ))
                ) : (
                    trendingAnime.map((anime, index) => (
                      <div
                        key={anime.data_id}
                        onClick={() => navigate(`/anime/${anime.id}`)}
                        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/50 cursor-pointer transition-colors"
                      >
                        <span className="text-lg font-bold text-muted-foreground w-6">#{index + 1}</span>
                        <img
                          src={anime.poster}
                          alt={anime.title}
                          className="w-10 h-14 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="font-medium text-sm line-clamp-1">
                            {anime.title}
                          </span>
                          <span className="text-xs text-muted-foreground block">
                            {[anime.tvInfo?.sub && `Sub: ${anime.tvInfo.sub}`, anime.tvInfo?.dub && `Dub: ${anime.tvInfo.dub}`].filter(Boolean).join(' • ')}
                          </span>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="glass rounded-2xl p-4 sm:p-5"
            >
              <h3 className="font-bold text-base sm:text-lg mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400" />
                Site Stats
              </h3>
              <div className="grid grid-cols-1 gap-3">
                <div className="bg-muted/30 rounded-xl p-4 flex items-center gap-3">
                  <Eye className="w-8 h-8 text-primary" />
                  <div>
                    <div className="text-xl sm:text-2xl font-bold text-primary">{visitCount.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">Your Page Visits</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Community;
