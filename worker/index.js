
import videosData from "../src/data/videos.json";

const videos = Array.isArray(videosData) ? videosData : [];

const esc = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

function buildMeta(url) {
  const path = url.pathname.replace(/\/+$/, "") || "/";

  if (!path.startsWith("/video/")) return null;

  let slug;

  try {
    slug = decodeURIComponent(path.slice("/video/".length));
  } catch {
    return { notFound: true };
  }

  const video = videos.find(
    (item) => String(item.slug || "") === slug
  );

  if (!video) return { notFound: true };

  const title = video.title || "Video";
  const description =
    video.description ||
    `Watch ${title} online on Ishwardi Dokan.`;

  const thumbnail = video.thumbnail || `${url.origin}/og-image.jpg`;
  const canonical = `${url.origin}/video/${encodeURIComponent(video.slug)}`;

  return { title, description, thumbnail, canonical };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method !== "GET" && request.method !== "HEAD") {
      return env.ASSETS.fetch(request);
    }

    const meta = buildMeta(url);

    if (!meta) {
      return env.ASSETS.fetch(request);
    }

    const response = await env.ASSETS.fetch(request);

    const contentType = response.headers.get("content-type") || "";

    if (!contentType.includes("text/html")) {
      return response;
    }

    if (meta.notFound) {
      return new Response(response.body, {
        status: 404,
        statusText: "Not Found",
        headers: response.headers,
      });
    }

    const tags = `
<meta name="description" content="${esc(meta.description)}">
<link rel="canonical" href="${esc(meta.canonical)}">

<meta property="og:type" content="video.other">
<meta property="og:title" content="${esc(meta.title)}">
<meta property="og:description" content="${esc(meta.description)}">
<meta property="og:url" content="${esc(meta.canonical)}">
<meta property="og:image" content="${esc(meta.thumbnail)}">
<meta property="og:image:secure_url" content="${esc(meta.thumbnail)}">
<meta property="og:image:alt" content="${esc(meta.title)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(meta.title)}">
<meta name="twitter:description" content="${esc(meta.description)}">
<meta name="twitter:image" content="${esc(meta.thumbnail)}">
`;

    return new HTMLRewriter()
      .on('meta[property^="og:"]', {
        element(element) {
          element.remove();
        },
      })
      .on('meta[name^="twitter:"]', {
        element(element) {
          element.remove();
        },
      })
      .on('meta[name="description"]', {
        element(element) {
          element.remove();
        },
      })
      .on('link[rel="canonical"]', {
        element(element) {
          element.remove();
        },
      })
      .on("title", {
        element(element) {
          element.setInnerContent(meta.title);
        },
      })
      .on("head", {
        element(element) {
          element.append(tags, { html: true });
        },
      })
      .transform(response);
  },
};
