'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function LoadingBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    const handleStart = () => setLoading(true);
    const handleComplete = () => setLoading(false);

    // Listen for route changes
    window.addEventListener('beforeunload', handleStart);
    
    return () => {
      window.removeEventListener('beforeunload', handleStart);
    };
  }, []);

  if (!loading) return null;

  return (
    <>
      {/* Top Loading Bar */}
      <div className="fixed top-0 left-0 right-0 z-[9999] h-1 bg-gradient-to-r from-primary-600 via-primary-400 to-primary-600 animate-shimmer" 
           style={{
             backgroundSize: '200% 100%',
           }}>
      </div>
      
      {/* Center Loading Spinner */}
      <div className="fixed inset-0 z-[9998] bg-black bg-opacity-20 flex items-center justify-center backdrop-blur-sm">
        <div className="bg-white rounded-lg shadow-2xl p-6 flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary-200 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-primary-600 rounded-full animate-spin border-t-transparent absolute top-0 left-0"></div>
          </div>
          <p className="text-gray-700 font-semibold">Loading...</p>
        </div>
      </div>
    </>
  );
}
