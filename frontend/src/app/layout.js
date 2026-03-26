import { Geist } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const geist = Geist({ subsets: ['latin'] });

export const metadata = {
  title: {
    default: 'ComparIO — Best Phone Prices in India',
    template: '%s | ComparIO',
  },
  description:
    'Compare mobile phone prices across Amazon and Flipkart. Find the best deal on iPhones, Samsung, OnePlus, Xiaomi and more.',
  keywords: ['phone price comparison', 'best mobile price India', 'Amazon vs Flipkart', 'cheapest iPhone India'],
  openGraph: {
    title: 'ComparIO — Best Phone Prices in India',
    description: 'Compare phone prices across Amazon & Flipkart instantly.',
    url: 'https://compario.in',
    siteName: 'ComparIO',
    locale: 'en_IN',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={geist.className}>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}