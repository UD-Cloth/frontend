import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description?: string;
}

export const useSEO = ({ title, description }: SEOProps) => {
  useEffect(() => {
    // Update Document Title
    const fullTitle = `${title} | Urban Drape`;
    document.title = fullTitle;

    // Update Meta Description
    if (description) {
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute('content', description);
    }

    return () => {
      // Optional: Restore to default on unmount
      document.title = "Urban Drape | Handcrafted Menswear";
    };
  }, [title, description]);
};
