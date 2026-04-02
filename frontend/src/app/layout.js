import { Geist } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import FAB from '@/components/FAB';
import Smarty from '@/components/Smarty';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { ToastProvider } from '@/components/Toast';

const geist = Geist({ subsets: ['latin'] });

export const metadata = {
  title: { default: 'ComparIO — Best Prices in India', template: '%s | ComparIO' },
  description: 'Compare phone and laptop prices across Amazon & Flipkart.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geist.className} t-bg t-text min-h-screen`}>
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              <Navbar />
              {children}
              <Smarty />
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}