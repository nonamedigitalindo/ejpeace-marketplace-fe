import { IMAGE_BASE_URL } from "../api/apiClient";

// Vite API base for fallbacks when IMAGE_BASE_URL is not set
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

export const PLACEHOLDER_BASE64 =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAQAAAAAYLlVAAAAHklEQVR4Ae3BAQ0AAADCIPunNsN+YAAAAAAAAAAA4D0FqQAAcVt7FgAAAABJRU5ErkJggg==";

/**
 * Resolve image source into a usable URL.
 * - Returns placeholders when value falsy
 * - Leaves data:, blob:, or full http(s) URLs unchanged
 * - Safely joins IMAGE_BASE_URL with relative/leading slash paths
 */
export function resolveImageSrc(img) {
  if (!img) return PLACEHOLDER_BASE64;

  // Handle object/array input (e.g. backend returning {id, image_url} or [img1, img2])
  if (typeof img === 'object' && img !== null) {
    if (Array.isArray(img)) {
      return img.length > 0 ? resolveImageSrc(img[0]) : PLACEHOLDER_BASE64;
    }
    if (img.image_url) return resolveImageSrc(img.image_url);
    if (img.url) return resolveImageSrc(img.url);
  }

  // normalize to string and guard against accidental double-URLs
  let str = String(img);
  // if the string contains more than one 'http' substring, it likely has been
  // concatenated erroneously (e.g. '/api/v1/uploads/https://api...'). Use the
  // last occurrence, which is most likely the real URL.
  const httpMatches = str.match(/https?:\/\//gi) || [];
  if (httpMatches.length > 1) {
    const lastHttpIndex = Math.max(str.lastIndexOf("https://"), str.lastIndexOf("http://"));
    if (lastHttpIndex > 0) str = str.substring(lastHttpIndex);
  }
  img = str;

  if (
    typeof img === "string" &&
    (img.startsWith("data:") || img.startsWith("blob:") || /^(https?:)?\/\//i.test(img))
  ) {
    // If this is a fully-qualified URL (http(s)://...), and it points to the
    // current origin or a dev host (like localhost:3000) *but* the path looks like
    // an API upload (e.g. /api/v1/uploads), prefer the configured API_BASE_URL so
    // we don't accidentally load images from the frontend origin.
    try {
      if (/^https?:\/\//i.test(img)) {
        const url = new URL(img);
        const pathname = url.pathname + (url.search || "");

        const isLocalHost = /(^localhost$)|(^127\.0\.0\.1$)/i.test(url.hostname);
        const isSameOrigin = typeof window !== "undefined" && url.hostname === window.location.hostname;
        const looksLikeApi = /\/api\/v1\/(uploads|uploads\/images|uploads\/.*)/i.test(pathname) || /^\/?api(\/|$)/i.test(pathname);

        // If this absolute URL already points to the configured API host (API_BASE_URL),
        // return it unchanged — no rewriting/concatenation is necessary.
        try {
          if (API_BASE_URL) {
            const apiHost = new URL(API_BASE_URL).hostname;
            if (url.hostname === apiHost) return img; // already correct host
          }
        } catch {
          // ignore if API_BASE_URL isn't a valid URL
        }

        if ((isLocalHost || isSameOrigin || looksLikeApi) && API_BASE_URL && looksLikeApi) {
          const base = API_BASE_URL.replace(/\/+$/, "");
          return `${base}${pathname}`;
        }
      }
    } catch {
      // fall back to returning the raw string if URL parsing fails
    }

    return img;
  }

  // If the server sent back a relative path that starts with /api or contains '/uploads'
  // it's common for the browser to resolve that relative to the current origin (localhost).
  // Prefer IMAGE_BASE_URL when provided; otherwise fall back to VITE_API_BASE_URL so
  // we build an absolute URL that points to the backend host.

  // detect several common shapes returned by server:
  // - 'api/...', '/api/...', '/api/v1/uploads/...'
  // - 'uploads/...' or '/uploads/...'
  const looksLikeApiPath =
    /^\/?api(\/|$)/i.test(String(img)) ||
    /^\/?uploads(\/|$)/i.test(String(img)) ||
    /\/(uploads|uploads\/images)/i.test(String(img));

  // prefer explicit IMAGE_BASE_URL when present
  if (IMAGE_BASE_URL) {
    // If the configured IMAGE_BASE_URL already contains an /api path, use it
    const baseNoSlash = IMAGE_BASE_URL.replace(/\/+$/, "");

    // If the image path already looks like an API path (/api/v1/...) just join
    if (/^\/?api/i.test(String(img))) {
      return `${baseNoSlash}${String(img).startsWith("/") ? String(img) : `/${String(img)}`}`;
    }

    // If IMAGE_BASE_URL does not include /api and the image looks like an upload
    // resource (uploads/ or /uploads/ or similar), add /api/v1 prefix so the
    // final URL becomes <IMAGE_BASE_URL>/api/v1/uploads/...
    if (!/\/api\//i.test(baseNoSlash) && (/^\/?uploads(\/|$)/i.test(String(img)) || /\/(uploads|uploads\/images)/i.test(String(img)))) {
      const trimmed = String(img).replace(/^\/+/, "");
      return `${baseNoSlash}/api/v1/${trimmed}`;
    }

    // Fallback: simply join base and path
    return `${baseNoSlash}/${String(img).replace(/^\/+/, "")}`;
  }

  if (looksLikeApiPath && API_BASE_URL) {
    // API_BASE_URL usually is like https://api.example.com
    const base = API_BASE_URL.replace(/\/+$/, "");

    let path = String(img);

    // Ensure we include /api/v1 prefix if not already present.
    if (!/^\/?api\/v1/i.test(path)) {
      // add leading slash + api/v1 if needed
      path = path.startsWith("/") ? `/api/v1${path}` : `/api/v1/${path}`;
    } else {
      // normalize leading slash
      path = path.startsWith("/") ? path : `/${path}`;
    }

    return `${base}${path}`;
  }

  // fallback: join with IMAGE_BASE_URL semantics (empty base -> relative path)
  const base = IMAGE_BASE_URL ? IMAGE_BASE_URL.replace(/\/+$/, "") + "/" : "";
  return `${base}${String(img).replace(/^\/+/, "")}`;
}

export default resolveImageSrc;
