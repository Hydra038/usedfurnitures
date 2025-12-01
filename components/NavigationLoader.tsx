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
      // Simulate progress - faster updates
      progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + 15;
        });
      }, 100); // Faster interval: 100ms instead of 200ms
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
      {/* Top Loading Bar */}
      <div className="fixed top-0 left-0 right-0 z-[9999] h-1 bg-primary-100">
        <div 
          className="h-full bg-gradient-to-r from-primary-600 to-primary-400 transition-all duration-300 ease-out shadow-lg"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {/* Subtle Overlay with Spinner */}
      <div className="fixed inset-0 z-[9998] bg-white bg-opacity-20 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
        <div className="bg-white rounded-full shadow-lg p-3 animate-fade-in">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 border-4 border-primary-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-primary-600 rounded-full animate-spin border-t-transparent"></div>
          </div>
        </div>
      </div>
    </>
  );
}
