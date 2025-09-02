import React from "react";
import { Link } from "wouter";
import { Instagram, Mail, Star, Film } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 border-t border-gray-700 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Film className="h-6 w-6 text-yellow-400" />
              <span className="text-xl font-bold text-white">CineRate</span>
            </div>
            <p className="text-gray-400 text-sm">
              Your ultimate destination for movie reviews and ratings. 
              Discover, rate, and share your favorite films with the community.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-yellow-400 transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="mailto:contact@cinerate.com"
                className="text-gray-400 hover:text-yellow-400 transition-colors"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/">
                  <a className="text-gray-400 hover:text-yellow-400 transition-colors text-sm">
                    Home
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/profile">
                  <a className="text-gray-400 hover:text-yellow-400 transition-colors text-sm">
                    My Profile
                  </a>
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors text-sm">
                  Popular Movies
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors text-sm">
                  Top Rated
                </a>
              </li>
            </ul>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold">Features</h3>
            <ul className="space-y-2">
              <li className="text-gray-400 text-sm flex items-center">
                <Star className="h-3 w-3 mr-2 text-yellow-400" />
                Rate Movies
              </li>
              <li className="text-gray-400 text-sm flex items-center">
                <Star className="h-3 w-3 mr-2 text-yellow-400" />
                Write Reviews
              </li>
              <li className="text-gray-400 text-sm flex items-center">
                <Star className="h-3 w-3 mr-2 text-yellow-400" />
                Real-time Updates
              </li>
              <li className="text-gray-400 text-sm flex items-center">
                <Star className="h-3 w-3 mr-2 text-yellow-400" />
                Profile Management
              </li>
            </ul>
          </div>

          {/* About */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold">About</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors text-sm">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors text-sm">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors text-sm">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors text-sm">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="text-center">
            <div className="text-gray-400 text-sm">
              © {currentYear} CineRate. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
