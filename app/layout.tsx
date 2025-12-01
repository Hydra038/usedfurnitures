import '@/app/globals.css';
import type { Metadata } from 'next';
import { Merriweather } from 'next/font/google';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import NavigationLoader from '@/components/NavigationLoader';

const merriweather = Merriweather({ 
  weight: ['300', '400', '700', '900'],
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Best Used Furniture - Quality Second-Hand Furniture',
  description: 'Browse our collection of quality second-hand furniture at Best Used Furniture. Contact us: 235-200-1489',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={merriweather.className}>
        <NavigationLoader />
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
