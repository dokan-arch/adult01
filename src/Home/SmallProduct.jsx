import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./SmallProduct.module.css";

export default function SmallProduct({ video, ad }) {
  const navigate = useNavigate();

  const storageKey = video?.id
    ? `clicked-ad-video-${video.id}`
    : null;

  const [adClicked, setAdClicked] = useState(() => {
    if (!storageKey) return false;

    try {
      return localStorage.getItem(storageKey) === "true";
    } catch {
      return false;
    }
  });

  if (!video) return null;

  const openDetails = () => {
    if (!adClicked && ad?.affiliateUrl) {
      window.open(
        ad.affiliateUrl,
        "_blank",
        "noopener,noreferrer"
      );

      try {
        if (storageKey) {
          localStorage.setItem(storageKey, "true");
        }
      } catch {
        // Continue if localStorage is unavailable.
      }

      setAdClicked(true);
    }

    navigate(`/video/${video.slug || video.id}`, {
      state: { video },
    });
  };

  return (
    <article
      className={styles.videoCard}
      onClick={openDetails}
      role="link"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openDetails();
        }
      }}
    >
      <div className={styles.thumbnailWrapper}>
        <img
          className={styles.video}
          src={video.thumbnail}
          alt={video.title || "Video thumbnail"}
          loading="lazy"
        />

        {!adClicked && ad?.affiliateUrl && (
          <span className={styles.adLabel}>Ad</span>
        )}

        <span className={styles.playIcon}>▶</span>
      </div>

      <div className={styles.videoContent}>
        <h3 title={video.title}>{video.title}</h3>

        <p>
          {video.upload || "Recently uploaded"}
          <span className={styles.dot}>·</span>
          {Number(video.views || 0).toLocaleString()} views
        </p>
      </div>
    </article>
  );
}