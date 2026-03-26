import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-20">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">

          {/* BRAND */}
          <div>
            <div className="text-2xl font-black text-white mb-3">
              Compar<span className="text-blue-400">IO</span>
            </div>
            <p className="text-sm leading-relaxed">
              India's smartest phone price comparison platform. Find the best deal across Amazon & Flipkart instantly — before you buy.
            </p>
          </div>

          {/* LINKS */}
          <div>
            <div className="text-white font-black text-sm uppercase tracking-wide mb-4">Browse</div>
            <ul className="space-y-2 text-sm">
              <li><Link href="/phones" className="hover:text-white transition">All Phones</Link></li>
              <li><Link href="/phones?brand=Apple" className="hover:text-white transition">Apple iPhones</Link></li>
              <li><Link href="/phones?brand=Samsung" className="hover:text-white transition">Samsung Galaxy</Link></li>
              <li><Link href="/phones?brand=OnePlus" className="hover:text-white transition">OnePlus</Link></li>
              <li><Link href="/phones?brand=Xiaomi" className="hover:text-white transition">Xiaomi</Link></li>
            </ul>
          </div>

          {/* ABOUT */}
          <div>
            <div className="text-white font-black text-sm uppercase tracking-wide mb-4">About</div>
            <ul className="space-y-2 text-sm">
              <li><span className="text-gray-500">How it works</span></li>
              <li><span className="text-gray-500">Affiliate Disclosure</span></li>
              <li><span className="text-gray-500">Contact Us</span></li>
            </ul>
            <div className="mt-6 p-3 bg-gray-800 rounded-xl text-xs leading-relaxed">
              💡 <strong className="text-white">Affiliate Disclosure:</strong> When you click buy links and make a purchase, ComparIO earns a small commission at no extra cost to you.
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-3 text-xs">
          <span>© 2025 ComparIO. All rights reserved.</span>
          <span>Prices updated regularly. Always verify before purchasing.</span>
        </div>
      </div>
    </footer>
  );
}