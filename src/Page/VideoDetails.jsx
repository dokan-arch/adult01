
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useParams, Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiPlay,
  FiEye,
  FiClock,
  FiSkipForward,
  FiVideo,
  FiArrowRight,
  FiLoader,
} from "react-icons/fi";

import videosData from "../data/videos.json";
import adVideos from "../data/adsvideo.json";
import adsData from "../data/ads.json";

import styles from "./VideoDetails.module.css";
import SmallProduct from "../Home/SmallProduct";

const INITIAL_VIDEO_COUNT = 10;
const LOAD_MORE_COUNT = 10;
const RECOMMENDED_VIDEO_LIMIT = 12;

export default function VideoDetails() {
  const { slug } = useParams();
  const location = useLocation();

  const [phase, setPhase] = useState("thumbnail");
  const [currentAd, setCurrentAd] = useState(null);
  const [canSkip, setCanSkip] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [visibleMoreCount, setVisibleMoreCount] =
    useState(INITIAL_VIDEO_COUNT);

  const loadMoreRef = useRef(null);

  const video =
    location.state?.video ||
    videosData.find(
      (item) => String(item.slug || item.id) === String(slug)
    );

  // Reset the bottom video list when changing videos.
  useEffect(() => {
    setVisibleMoreCount(INITIAL_VIDEO_COUNT);
  }, [slug]);

  // Select an advertisement.
  useEffect(() => {
    if (!video) return;

    const validAds = Array.isArray(adVideos)
      ? adVideos.filter((item) => item?.videoUrl)
      : [];

    setCanSkip(false);
    setCountdown(3);

    if (validAds.length > 0) {
      const selectedAd =
        validAds[Math.floor(Math.random() * validAds.length)];

      setCurrentAd(selectedAd);
      setPhase("ad");
    } else {
      setCurrentAd(null);
      setPhase("thumbnail");
    }
  }, [video?.id, slug]);

  // Advertisement countdown.
  useEffect(() => {
    if (phase !== "ad" || !currentAd) return;

    setCanSkip(false);
    setCountdown(3);

    const countdownTimer = window.setInterval(() => {
      setCountdown((previous) => Math.max(1, previous - 1));
    }, 1000);

    const skipTimer = window.setTimeout(() => {
      setCanSkip(true);
    }, 3500);

    return () => {
      window.clearInterval(countdownTimer);
      window.clearTimeout(skipTimer);
    };
  }, [phase, currentAd]);

  const openAdWebsite = () => {
    if (!currentAd?.siteurl) return;

    window.open(
      currentAd.siteurl,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const startMainVideo = () => {
    setCurrentAd(null);
    setCanSkip(false);
    setPhase("video");
  };

  const skipAd = () => {
    if (!canSkip) return;
    startMainVideo();
  };

  // Exclude the currently playing video.
  const currentVideoId = String(video?.id ?? video?.slug ?? "");

  const relatedVideos = videosData.filter((item) => {
    const itemId = String(item.id ?? item.slug ?? "");
    return itemId !== currentVideoId;
  });

  // Show up to 12 recommended videos.
  const recommendedVideos = relatedVideos.slice(
    0,
    RECOMMENDED_VIDEO_LIMIT
  );

  // Put all other videos in the bottom section.
  const moreVideos = relatedVideos.slice(
    RECOMMENDED_VIDEO_LIMIT
  );

  const visibleMoreVideos = moreVideos.slice(
    0,
    visibleMoreCount
  );

  const hasMoreVideos =
    visibleMoreCount < moreVideos.length;

  // Load more bottom videos when the user scrolls near the end.
  useEffect(() => {
    const target = loadMoreRef.current;

    if (!target || !hasMoreVideos) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleMoreCount((previous) =>
            Math.min(
              previous + LOAD_MORE_COUNT,
              moreVideos.length
            )
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
  }, [hasMoreVideos, moreVideos.length]);

  const getAdForVideo = (item, index) => {
    if (!Array.isArray(adsData) || adsData.length === 0) {
      return null;
    }

    return adsData[index % adsData.length];
  };

  if (!video) {
    return (
      <main className={styles.notFound}>
        <div className={styles.notFoundIcon}>
          <FiVideo />
        </div>

        <span className={styles.sectionEyebrow}>404 ERROR</span>

        <h2>Video not found</h2>

        <p>
          This video may have been removed or the link is incorrect.
        </p>

        <Link to="/" className={styles.backHome}>
          <FiArrowLeft />
          Back to Home
        </Link>
      </main>
    );
  }

  return (
    <main className={styles.details}>
      <header className={styles.pageHeader}>
        <Link to="/" className={styles.back}>
          <FiArrowLeft />
          <span>Back to Home</span>
        </Link>

        <span className={styles.pageLabel}>
          <FiVideo />
          Video player
        </span>
      </header>

      <div className={styles.contentLayout}>
        <section className={styles.mainColumn}>
          {/* Main video player */}
          <div className={styles.playerWrapper}>
            {phase === "thumbnail" && (
              <button
                type="button"
                className={styles.thumbnailButton}
                aria-label={`Play ${video.title}`}
                onClick={startMainVideo}
              >
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className={styles.posterImage}
                />

                <span className={styles.posterOverlay} />

                <span className={styles.bigPlay}>
                  <FiPlay />
                </span>

                <span className={styles.posterHint}>
                  Click to start watching
                </span>
              </button>
            )}

            {/* Advertisement player */}
            {phase === "ad" && currentAd && (
              <div className={styles.adPlayer}>
                <video
                  key={currentAd.id || currentAd.videoUrl}
                  className={styles.player}
                  src={currentAd.videoUrl}
                  poster={currentAd.thumbnail}
                  autoPlay
                  muted
                  controls={false}
                  playsInline
                  onClick={openAdWebsite}
                  onEnded={startMainVideo}
                  onError={startMainVideo}
                  aria-label="Advertisement video. Click to visit advertiser website."
                  title="Click to visit advertiser website"
                  style={{
                    cursor: currentAd.siteurl
                      ? "pointer"
                      : "default",
                  }}
                />

                <span className={styles.adIndicator}>
                  <span className={styles.adDot} />
                  Advertisement
                </span>

                {currentAd.siteurl && (
                  <a
                    href={currentAd.siteurl}
                    className={styles.adVisitLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Visit Website
                    <FiArrowRight />
                  </a>
                )}

                <div className={styles.adControls}>
                  <div className={styles.adMeta}>
                    <span className={styles.adTitle}>
                      {currentAd.title || "Advertisement"}
                    </span>

                    <span className={styles.adSubtext}>
                      Your video will start shortly
                    </span>
                  </div>

                  {canSkip ? (
                    <button
                      type="button"
                      className={styles.skipButton}
                      onClick={skipAd}
                    >
                      Skip Ad
                      <FiSkipForward />
                    </button>
                  ) : (
                    <span className={styles.skipCountdown}>
                      Skip in
                      <span className={styles.countdownNumber}>
                        {countdown}
                      </span>
                      <span>s</span>
                    </span>
                  )}
                </div>

                {!canSkip && (
                  <div className={styles.adProgressTrack}>
                    <div
                      key={currentAd.id || currentAd.videoUrl}
                      className={styles.adProgressBar}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Main video */}
            {phase === "video" && (
              <video
                key={video.videoUrl}
                className={styles.player}
                src={video.videoUrl}
                controls
                autoPlay
                playsInline
                poster={video.thumbnail}
                onEnded={() => setPhase("thumbnail")}
                onError={() => setPhase("thumbnail")}
              />
            )}
          </div>

          {/* Current video information */}
          <section className={styles.info}>
            <div className={styles.titleContent}>
              <span className={styles.eyebrow}>NOW PLAYING</span>
              <h1>{video.title}</h1>
            </div>

            <div className={styles.metadata}>
              <span>
                <FiClock />
                {video.upload || "Recently uploaded"}
              </span>

              <span className={styles.metaDivider} />

              <span>
                <FiEye />
                {Number(video.views || 0).toLocaleString()} views
              </span>
            </div>
          </section>

          {/* Remaining videos: 10 per scroll batch */}
          {moreVideos.length > 0 && (
            <section className={styles.belowSection}>
              <div className={styles.sectionHeading}>
                <div>
                  <span className={styles.sectionEyebrow}>
                    KEEP WATCHING
                  </span>
                  <h2>More videos</h2>
                </div>

                <span className={styles.videoCount}>
                  {visibleMoreVideos.length} of {moreVideos.length}
                </span>
              </div>

              <div className={styles.bottomGrid}>
                {visibleMoreVideos.map((item, index) => (
                  <SmallProduct
                    key={item.id ?? item.slug}
                    video={item}
                    ad={getAdForVideo(item, index)}
                  />
                ))}
              </div>

              {hasMoreVideos && (
                <div
                  ref={loadMoreRef}
                  className={styles.loadMoreTrigger}
                  aria-live="polite"
                >
                  <FiLoader className={styles.loadMoreIcon} />
                  <span>Loading more videos...</span>
                </div>
              )}

              {!hasMoreVideos && (
                <p className={styles.endOfVideos}>
                  You have reached the end of the videos.
                </p>
              )}
            </section>
          )}
        </section>

        {/* Recommended videos sidebar */}
        {recommendedVideos.length > 0 && (
          <aside className={styles.sidebar}>
            <div className={styles.sidebarHeading}>
              <div>
                <span className={styles.sectionEyebrow}>
                  RECOMMENDED FOR YOU
                </span>

                <h2>Related videos</h2>
              </div>

              <span className={styles.sidebarCount}>
                {recommendedVideos.length}
              </span>
            </div>

            <div className={styles.sideList}>
              {recommendedVideos.map((item, index) => (
                <SmallProduct
                  key={item.id ?? item.slug}
                  video={item}
                  ad={getAdForVideo(item, index)}
                />
              ))}
            </div>
          </aside>
        )}
      </div>
    </main>
  );
}
