import { useEffect } from 'react';
import faviconImage from 'figma:asset/f6b8ecef8abd7cd606389a69d33b5fcecd5edc56.png';

export function FaviconHandler() {
  useEffect(() => {
    // Update favicon
    const setFavicon = (url: string) => {
      // Remove existing favicons
      const existingLinks = document.querySelectorAll("link[rel*='icon']");
      existingLinks.forEach(link => link.remove());

      // Add new favicon
      const link = document.createElement('link');
      link.rel = 'icon';
      link.type = 'image/png';
      link.href = url;
      document.head.appendChild(link);

      // Add apple touch icon
      const appleLink = document.createElement('link');
      appleLink.rel = 'apple-touch-icon';
      appleLink.href = url;
      document.head.appendChild(appleLink);

      // Add shortcut icon
      const shortcutLink = document.createElement('link');
      shortcutLink.rel = 'shortcut icon';
      shortcutLink.type = 'image/png';
      shortcutLink.href = url;
      document.head.appendChild(shortcutLink);
    };

    setFavicon(faviconImage);

    // Update document title
    document.title = 'Ediliano Designer - Design Gráfico Profissional';
  }, []);

  return null;
}
