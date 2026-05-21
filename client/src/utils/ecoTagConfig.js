// Color and icon mapping for ecoTags — single source of truth across all product cards
export const ECO_TAG_CONFIG = {
  'Biodegradable':  { bg: 'bg-green-100',   text: 'text-green-800',   border: 'border-green-200',   dot: 'bg-green-500',   emoji: '🌿' },
  'Recycled':       { bg: 'bg-blue-100',    text: 'text-blue-800',    border: 'border-blue-200',    dot: 'bg-blue-500',    emoji: '♻️' },
  'Organic':        { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200', dot: 'bg-emerald-500', emoji: '🌱' },
  'Zero Waste':     { bg: 'bg-teal-100',    text: 'text-teal-800',    border: 'border-teal-200',    dot: 'bg-teal-500',    emoji: '🔄' },
  'Plastic Free':   { bg: 'bg-cyan-100',    text: 'text-cyan-800',    border: 'border-cyan-200',    dot: 'bg-cyan-500',    emoji: '🌊' },
  'Vegan':          { bg: 'bg-purple-100',  text: 'text-purple-800',  border: 'border-purple-200',  dot: 'bg-purple-500',  emoji: '🐾' },
  'Fair Trade':     { bg: 'bg-orange-100',  text: 'text-orange-800',  border: 'border-orange-200',  dot: 'bg-orange-500',  emoji: '🤝' },
  'Solar Powered':  { bg: 'bg-yellow-100',  text: 'text-yellow-800',  border: 'border-yellow-200',  dot: 'bg-yellow-500',  emoji: '☀️' },
  'Sustainable':    { bg: 'bg-lime-100',    text: 'text-lime-800',    border: 'border-lime-200',    dot: 'bg-lime-500',    emoji: '🌍' },
  'Compostable':    { bg: 'bg-amber-100',   text: 'text-amber-800',   border: 'border-amber-200',   dot: 'bg-amber-500',   emoji: '🍂' },
};

export const getTagConfig = (tag) =>
  ECO_TAG_CONFIG[tag] ?? { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200', dot: 'bg-green-500', emoji: '🌿' };
