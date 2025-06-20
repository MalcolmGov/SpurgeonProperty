import { useEffect } from 'react';
import { updateSEO, type SEOConfig } from '../utils/seo';

export function useSEO(config: SEOConfig) {
  useEffect(() => {
    updateSEO(config);
  }, [config.title, config.description, config.ogImage, config.canonical]);
}