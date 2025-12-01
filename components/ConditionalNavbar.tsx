'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

export default function ConditionalNavbar() {
  const pathname = usePathname();
  
  // Hide navbar on user dashboard, admin routes, and reset-password page
  const hideNavbar = pathname?.startsWith('/user') || pathname?.startsWith('/admin') || pathname === '/reset-password';
  
  if (hideNavbar) {
    return null;
  }
  
  return <Navbar />;
}
