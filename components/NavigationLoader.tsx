'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function NavigationLoader() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Reset loading when pathname changes (navigation complete)
    setLoading(false);
    setProgress(0);
  }, [pathname]);

  useEffect(() => {
    let progressInterval: NodeJS.Timeout;

    if (loading) {
      // Much faster progress - completes quickly
      progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + 30; // Jump 30% at a time instead of 15%
        });
      }, 50); // Even faster: 50ms instead of 100ms
    }

    return () => {
      if (progressInterval) clearInterval(progressInterval);
    };
  }, [loading]);

  useEffect(() => {
    // Intercept link clicks
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      
      if (link && link.href && !link.target && link.origin === window.location.origin) {
        const href = link.getAttribute('href');
        // Only show loader for different pages
        if (href && !href.startsWith('#') && href !== pathname) {
          setLoading(true);
          setProgress(10);
        }
      }
    };

    document.addEventListener('click', handleClick, true);

    return () => {
      document.removeEventListener('click', handleClick, true);
    };
  }, [pathname]);

  if (!loading) return null;

  return (
    <>
      {/* Top Loading Bar - Minimal and Fast */}
      <div className="fixed top-0 left-0 right-0 z-[9999] h-1 bg-primary-100">
        <div 
          className="h-full bg-gradient-to-r from-primary-600 to-primary-400 transition-all duration-200 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {/* No overlay - just the progress bar for minimal distraction */}
    </>
  );
}
