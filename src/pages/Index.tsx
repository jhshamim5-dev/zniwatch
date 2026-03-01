import TopBar from '@/components/TopBar';
import HeroSlider from '@/components/HeroSlider';
import AnimeRow from '@/components/AnimeRow';
import BottomNav from '@/components/BottomNav';
import { useTrendingAnime, useLatestEpisodeAnime, useAiringAnime, useFavoriteAnime } from '@/hooks/useAnime';

const Index = () => {
  const { data: trendingAnime, isLoading: trendingLoading } = useTrendingAnime(5);
  const { data: latestEpisodeAnime, isLoading: latestLoading } = useLatestEpisodeAnime();
  const { data: airingAnime, isLoading: airingLoading } = useAiringAnime(15);
  const { data: favoriteAnime, isLoading: favoriteLoading } = useFavoriteAnime(15);

  return (
    <div className="min-h-screen bg-background pb-24 sm:pb-32">
      <TopBar />

      {/* Hero Section */}
      {trendingLoading ? (
        <div className="h-[55vh] sm:h-[60vh] md:h-[70vh] shimmer" />
      ) : (
        trendingAnime && <HeroSlider anime={trendingAnime} />
      )}

      {/* Content Rows */}
      <div className="relative z-10 px-0">
        <AnimeRow
          title="🔥 Currently Airing"
          anime={airingAnime || []}
          isLoading={airingLoading}
        />

          <AnimeRow
            title="🆕 Latest Episodes"
            anime={latestEpisodeAnime || []}
            isLoading={latestLoading}
          />


        <AnimeRow
          title="❤️ Most Favorite"
          anime={favoriteAnime || []}
          isLoading={favoriteLoading}
        />
      </div>

      <BottomNav />
    </div>
  );
};

export default Index;
