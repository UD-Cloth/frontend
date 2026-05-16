import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import SEO from "@/components/SEO";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    // Only log 404 errors in development mode to avoid exposing route structure
    if (import.meta.env.DEV) {
      console.warn('404:', location.pathname);
    }
  }, [location.pathname]);

  return (
    <>
      <SEO title="Page not found" description="The page you're looking for doesn't exist." noindex />
      {/* Bug #65: friendlier 404 with simple SVG illustration */}
      <div className="flex min-h-screen items-center justify-center bg-muted px-4">
        <div className="max-w-md text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 200 120"
            className="mx-auto mb-6 h-32 w-auto text-primary"
            aria-hidden="true"
          >
            <circle cx="60" cy="60" r="34" fill="none" stroke="currentColor" strokeWidth="6" />
            <line x1="86" y1="86" x2="110" y2="110" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
            <text x="125" y="72" fontSize="42" fontWeight="700" fill="currentColor">?</text>
          </svg>
          <h1 className="mb-2 text-5xl font-bold">404</h1>
          <p className="mb-2 text-xl font-semibold">We can't find that page</p>
          <p className="mb-6 text-sm text-muted-foreground">
            The link may be broken, or the page may have been moved. Let's get you back on track.
          </p>
          <a
            href="/"
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Return to Home
          </a>
        </div>
      </div>
    </>
  );
};

export default NotFound;
