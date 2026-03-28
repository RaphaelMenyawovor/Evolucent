/** Thematic fallbacks when RSS has no image (Unsplash, stable URLs). */
export const CIVIC_CONCERN_FALLBACK_IMAGES = {
  infrastructure:
    "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1200&auto=format&fit=crop",
  health:
    "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=1200&auto=format&fit=crop",
  education:
    "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1200&auto=format&fit=crop",
  economy:
    "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=1200&auto=format&fit=crop",
  governance:
    "https://images.unsplash.com/photo-1575505586569-646b2c898ebf?q=80&w=1200&auto=format&fit=crop",
  environment:
    "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1200&auto=format&fit=crop",
  safety:
    "https://images.unsplash.com/photo-1584433144859-1fc3ab64a728?q=80&w=1200&auto=format&fit=crop",
  other:
    "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=1200&auto=format&fit=crop",
} as const;

export type CivicFallbackKey = keyof typeof CIVIC_CONCERN_FALLBACK_IMAGES;
