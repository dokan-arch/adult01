import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiSearch,
  FiX,
  FiMenu,
  FiArrowRight,
  FiPlay,
} from "react-icons/fi";

import videosData from "../data/videos.json";
import styles from "./Header.module.css";

export default function Header() {
  const [search, setSearch] = useState("");
  const [mobileSearch, setMobileSearch] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const navigate = useNavigate();
  const searchRef = useRef(null);

  const query = search.trim().toLowerCase();

  // Match video title, slug and ID using partial text.
  const filteredVideos = query
    ? videosData
        .filter((video) => {
          const title = (video.title || "").toLowerCase();
          const slug = (video.slug || "").toLowerCase();
          const id = String(video.id || "").toLowerCase();

          return (
            title.includes(query) ||
            slug.includes(query) ||
            id.includes(query)
          );
        })
        .slice(0, 6)
    : [];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const openVideo = (video) => {
    setShowSuggestions(false);
    setMobileSearch(false);
    setMenuOpen(false);

    // Navigate to the video details page.
    navigate(`/video/${video.slug || video.id}`, {
      state: { video },
    });
  };

  const handleSearch = (event) => {
    event.preventDefault();

    if (!query) return;

    // If the search exactly or partially matches a video,
    // open the best matching result.
    if (filteredVideos.length > 0) {
      openVideo(filteredVideos[0]);
      return;
    }

    // If nothing matches, open the search results page.
    setShowSuggestions(false);
    setMobileSearch(false);
    setMenuOpen(false);

    navigate(`/search?q=${encodeURIComponent(search.trim())}`);
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* Brand */}
        <a
          href="/"
          className={styles.brand}
          aria-label="Viral Adult home"
        >
          <div className={styles.logo}>
            <span>V</span>
            <span>A</span>
          </div>

          <div className={styles.brandText}>
            <h2>
              Viral <span>Adult</span>
            </h2>
            <p>Watch. Enjoy. Explore.</p>
          </div>
        </a>

        {/* Desktop Navigation */}
        <nav className={styles.desktopNav} aria-label="Main navigation">
          <a href="/" className={styles.navLink}>
            Home
          </a>

          <a href="/categories" className={styles.navLink}>
            Categories
          </a>

          <a href="/trending" className={styles.navLink}>
            Trending
          </a>
        </nav>

        {/* Search */}
        <div className={styles.searchArea} ref={searchRef}>
          <form
            className={`${styles.searchForm} ${
              mobileSearch ? styles.mobileSearchOpen : ""
            }`}
            onSubmit={handleSearch}
            role="search"
          >
            <FiSearch className={styles.searchIcon} />

            <input
              type="search"
              placeholder="Search videos..."
              value={search}
              onFocus={() => setShowSuggestions(true)}
              onChange={(event) => {
                setSearch(event.target.value);
                setShowSuggestions(true);
              }}
              aria-label="Search videos"
              aria-expanded={showSuggestions && Boolean(query)}
              autoComplete="off"
            />

            {search && (
              <button
                type="button"
                className={styles.clearButton}
                onClick={() => {
                  setSearch("");
                  setShowSuggestions(false);
                }}
                aria-label="Clear search"
              >
                <FiX />
              </button>
            )}

            <button
              type="submit"
              className={styles.searchButton}
              aria-label="Submit search"
            >
              <FiSearch />
              <span>Search</span>
            </button>
          </form>

          {/* Live Search Suggestions */}
          {showSuggestions && query && (
            <div className={styles.suggestions}>
              {filteredVideos.length > 0 ? (
                <>
                  <div className={styles.suggestionHeading}>
                    Videos ({filteredVideos.length})
                  </div>

                  {filteredVideos.map((video) => (
                    <button
                      key={video.id}
                      type="button"
                      className={styles.suggestionItem}
                      onClick={() => openVideo(video)}
                    >
                      <img
                        src={video.thumbnail}
                        alt=""
                        className={styles.suggestionThumbnail}
                        loading="lazy"
                      />

                      <span className={styles.suggestionInfo}>
                        <span className={styles.suggestionTitle}>
                          {video.title}
                        </span>

                        <span className={styles.suggestionMeta}>
                          <FiPlay />
                          Watch video
                        </span>
                      </span>

                      <FiArrowRight className={styles.suggestionArrow} />
                    </button>
                  ))}

                  {filteredVideos.length === 6 && (
                    <button
                      type="button"
                      className={styles.viewAllButton}
                      onClick={() => {
                        setShowSuggestions(false);
                        setMobileSearch(false);
                        navigate(
                          `/search?q=${encodeURIComponent(search.trim())}`
                        );
                      }}
                    >
                      View all results <FiArrowRight />
                    </button>
                  )}
                </>
              ) : (
                <div className={styles.noResults}>
                  <FiSearch />
                  <span>
                    No videos found for <strong>"{search.trim()}"</strong>
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Actions */}
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.mobileSearchButton}
            onClick={() => {
              setMobileSearch((previous) => !previous);
              setMenuOpen(false);
              setShowSuggestions(false);
            }}
            aria-label={mobileSearch ? "Close search" : "Open search"}
          >
            {mobileSearch ? <FiX /> : <FiSearch />}
          </button>

          <button
            type="button"
            className={styles.menuButton}
            onClick={() => {
              setMenuOpen((previous) => !previous);
              setMobileSearch(false);
              setShowSuggestions(false);
            }}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <nav className={styles.mobileMenu} aria-label="Mobile navigation">
          <a href="/" onClick={closeMenu}>
            Home <FiArrowRight />
          </a>

          <a href="/categories" onClick={closeMenu}>
            Categories <FiArrowRight />
          </a>

          <a href="/trending" onClick={closeMenu}>
            Trending <FiArrowRight />
          </a>
        </nav>
      )}
    </header>
  );
}
