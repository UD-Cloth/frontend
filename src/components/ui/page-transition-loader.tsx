import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export function PageTransitionLoader() {
  const [stage, setStage] = useState<'hidden' | 'loading'>('hidden');
  const location = useLocation();

  useEffect(() => {
    // Do not show the loader if we are in the admin panel
    if (location.pathname.startsWith('/admin')) {
      return;
    }

    // When the route changes, instantly show the loader
    setStage('loading');

    // Simulate page load duration (500ms), then hide instantly
    const hideTimer = setTimeout(() => {
      setStage('hidden');
    }, 500); 

    return () => clearTimeout(hideTimer);
  }, [location.pathname]);

  if (stage === 'hidden') return null;

  return (
    <div className="preloader" style={{ zIndex: 999999 }}>
      <img src="/UD.png" alt="Brand Logo" className="logo" />
    </div>
  );
}
