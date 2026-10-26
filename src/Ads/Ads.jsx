import ads from "../data/ads.json";
import styles from "./Ads.module.css";

export default function Ads() {
  return (
    <section className={styles.adsGrid}>
      {ads.map((ad) => (
        <article key={ad.id} className={styles.adCard}>
          <span className={styles.adLabel}>
            {ad.label}
          </span>

          <img src={ad.thumbnail} alt={ad.title} />

          <div className={styles.adContent}>
            <h3>{ad.title}</h3>
            <p>{ad.description}</p>

            <a
              href={ad.affiliateUrl}
              target="_blank"
              rel="sponsored nofollow noopener noreferrer"
            >
              {ad.buttonText}
            </a>
          </div>
        </article>
      ))}
    </section>
  );
}