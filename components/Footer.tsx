import Link from 'next/link';
import { Sofa, Mail, Phone, MessageCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-6 sm:py-8">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-6">
          {/* About */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sofa className="w-5 h-5" />
              <h3 className="text-lg font-bold">Best Used Furniture</h3>
            </div>
            <p className="text-gray-400 text-sm">
              Quality second-hand furniture. 
              Sustainable, affordable, beautiful.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-3">Quick Links</h3>
            <div className="space-y-2">
              <Link href="/shop" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Shop All
              </Link>
              <Link href="/contact" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Contact Us
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold mb-3">Contact Us</h3>
            <div className="space-y-2 text-gray-400 text-sm">
              <a href="tel:2352001489" className="flex items-center gap-2 hover:text-white transition-colors">
                <Phone className="w-4 h-4" />
                <span>(235) 200-1489</span>
              </a>
              <a href="sms:2352001489" className="flex items-center gap-2 hover:text-white transition-colors">
                <MessageCircle className="w-4 h-4" />
                <span>Text: (235) 200-1489</span>
              </a>
              <a href="https://wa.me/12352001489" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white transition-colors">
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-6 pt-6 text-center text-gray-400 text-sm">
          <p>&copy; 2025 Best Used Furniture. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
