/**
 * Preloads a single image URL.
 * Resolves with the URL if it loads; rejects if it 404s or errors.
 */
export const validateImageUrl = (url) =>
  new Promise((resolve, reject) => {
    if (!url || typeof url !== 'string') return reject(new Error('No URL'));
    const img = new Image();
    img.onload  = () => resolve(url);
    img.onerror = () => reject(new Error(`Image failed: ${url}`));
    img.src = url;
  });

/**
 * Accepts an array of products.
 * Returns a new array containing only products whose images successfully load.
 * Runs all checks in parallel — no serial waterfall.
 */
export const filterValidProducts = async (products) => {
  const results = await Promise.allSettled(
    products.map(p =>
      p?.image && p?.name
        ? validateImageUrl(p.image).then(() => p)
        : Promise.reject(new Error('Missing image or name'))
    )
  );
  return results
    .filter(r => r.status === 'fulfilled')
    .map(r => r.value);
};
