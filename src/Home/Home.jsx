
import React, { useEffect, useMemo, useRef, useState } from "react";
import SmallProduct from "./SmallProduct";
import videosData from "../data/videos.json";
import adsData from "../data/ads.json";
import styles from "./Home.module.css";

const INITIAL_COUNT = 12;
const LOAD_MORE_COUNT = 8;

export default function Home() {
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);
  const loadMoreRef = useRef(null);

  const videoItems = useMemo(() => {
    if (!Array.isArray(videosData) || videosData.length === 0) {
      return [];
    }

    return videosData.map((video, index) => {
      const ad =
        Array.isArray(adsData) && adsData.length > 0
          ? adsData[Math.floor(index / 5) % adsData.length]
          : null;

      return { video, ad };
    });
  }, []);

  const visibleItems = useMemo(
    () => videoItems.slice(0, visibleCount),
    [videoItems, visibleCount]
  );

  const hasMore = visibleCount < videoItems.length;

  useEffect(() => {
    const target = loadMoreRef.current;

    if (!target || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((current) =>
            Math.min(current + LOAD_MORE_COUNT, videoItems.length)
          );
        }
      },
      {
        root: null,
        rootMargin: "300px",
        threshold: 0,
      }
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, [hasMore, videoItems.length]);

  return (
    <main className={styles.home}>
      <section className={styles.videoGrid}>
        {visibleItems.map(({ video, ad }, index) => (
          <SmallProduct
            key={video.id ?? video.slug ?? index}
            video={video}
            ad={ad}
          />
        ))}
      </section>

      {hasMore && (
        <div
          ref={loadMoreRef}
          className={styles.loadMore}
          aria-label="Loading more videos"
        >
          <span className={styles.loader} />
          <span>Loading more videos...</span>
        </div>
      )}

      {!hasMore && videoItems.length > 0 && (
        <p className={styles.endMessage}>
          You have reached the end of the videos.
        </p>
      )}

      {videoItems.length === 0 && (
        <p className={styles.endMessage}>No videos available.</p>
      )}
    </main>
  );
}
