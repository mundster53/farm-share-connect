import { MapPin, Mail, Phone } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-bark text-cream py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <span className="text-xl">🥩</span>
              </div>
              <span className="font-serif text-2xl font-semibold">
                Farm Direct Meat
              </span>
            </div>
            <p className="text-cream/70 mb-6 leading-relaxed">
              Connecting families with local farmers for premium, 
              pasture-raised beef and pork at wholesale prices.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-cream/10 flex items-center justify-center hover:bg-cream/20 transition-colors">
                <span className="text-sm">𝕏</span>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-cream/10 flex items-center justify-center hover:bg-cream/20 transition-colors">
                <span className="text-sm">FB</span>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-cream/10 flex items-center justify-center hover:bg-cream/20 transition-colors">
                <span className="text-sm">IG</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-3">
              <li><a href="#how-it-works" className="text-cream/70 hover:text-cream transition-colors">How It Works</a></li>
              <li><a href="#browse" className="text-cream/70 hover:text-cream transition-colors">Browse Shares</a></li>
              <li><a href="#pricing" className="text-cream/70 hover:text-cream transition-colors">Pricing</a></li>
              <li><a href="#farmers" className="text-cream/70 hover:text-cream transition-colors">For Farmers</a></li>
              <li><a href="#" className="text-cream/70 hover:text-cream transition-colors">FAQ</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-serif text-lg font-semibold mb-4">Resources</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-cream/70 hover:text-cream transition-colors">Meat Cuts Guide</a></li>
              <li><a href="#" className="text-cream/70 hover:text-cream transition-colors">Storage Tips</a></li>
              <li><a href="#" className="text-cream/70 hover:text-cream transition-colors">Recipes</a></li>
              <li><a href="#" className="text-cream/70 hover:text-cream transition-colors">Blog</a></li>
              <li><a href="#" className="text-cream/70 hover:text-cream transition-colors">Partner Program</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-serif text-lg font-semibold mb-4">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-cream/50 mt-0.5" />
                <a href="mailto:hello@farmdirectmeat.com" className="text-cream/70 hover:text-cream transition-colors">
                  hello@farmdirectmeat.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-cream/50 mt-0.5" />
                <a href="tel:+18005551234" className="text-cream/70 hover:text-cream transition-colors">
                  1-800-555-1234
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-cream/50 mt-0.5" />
                <span className="text-cream/70">
                  Available in 38 states across the US
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-cream/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-cream/50 text-sm">
            © 2025 Farm Direct Meat. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <a href="#" className="text-cream/50 hover:text-cream transition-colors">Privacy Policy</a>
            <a href="#" className="text-cream/50 hover:text-cream transition-colors">Terms of Service</a>
            <a href="#" className="text-cream/50 hover:text-cream transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
