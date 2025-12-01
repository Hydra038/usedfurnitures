'use client';

import { useRouter, usePathname } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function BackButton() {
  const router = useRouter();
  const pathname = usePathname();

  const handleClick = () => {
    // If on dashboard, go back to home
    if (pathname === '/user') {
      router.push('/');
    } else {
      // For all other pages, go to dashboard
      router.push('/user');
    }
  };

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors mb-4"
    >
      <ArrowLeft className="h-5 w-5" />
      <span>Back</span>
    </button>
  );
}
