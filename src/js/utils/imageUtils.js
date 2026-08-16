/**
 * Image Fallback Utility & Default SVG Book Cover Generator
 */

const DEFAULT_BOOK_COVER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="420" viewBox="0 0 300 420"><rect width="300" height="420" fill="#1C1917" rx="8"/><rect x="12" y="12" width="276" height="396" fill="none" stroke="#44403C" stroke-width="2" rx="6"/><circle cx="150" cy="170" r="38" fill="#292524"/><text x="150" y="180" font-family="sans-serif" font-size="30" fill="#F5F4F0" text-anchor="middle">📖</text><text x="150" y="245" font-family="serif" font-size="17" font-weight="bold" fill="#F5F4F0" text-anchor="middle">문장수집가</text><text x="150" y="270" font-family="sans-serif" font-size="11" fill="#A8A29E" text-anchor="middle">BOOK COVER</text></svg>`;

export const DEFAULT_BOOK_COVER = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(DEFAULT_BOOK_COVER_SVG)}`;

export function handleImageError(imgEl) {
  if (imgEl && imgEl.src !== DEFAULT_BOOK_COVER) {
    imgEl.onerror = null;
    imgEl.src = DEFAULT_BOOK_COVER;
  }
}
