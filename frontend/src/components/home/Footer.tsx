
import { Link } from "react-router-dom"

export default function Footer() {
  return (
    <footer className="relative text-white overflow-hidden">
      {/* Subtle light rays effect */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-cyan-400/40 via-transparent to-transparent transform rotate-12"></div>
        <div className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-blue-400/30 via-transparent to-transparent transform -rotate-6"></div>
        <div className="absolute top-0 left-2/3 w-px h-full bg-gradient-to-b from-teal-400/25 via-transparent to-transparent transform rotate-3"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
                <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm"></div>
              </div>
              <h3 className="text-2xl font-bold text-white">FloatChat</h3>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed mb-6">
              Democratizing access to ARGO oceanographic data through AI-powered conversational interfaces and
              intelligent data visualization.
            </p>
            <div className="flex gap-4">
              <Link
                to="#"
                className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <span className="sr-only">GitHub</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </Link>
              <Link
                to="#"
                className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <span className="sr-only">Twitter</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </Link>
              <Link
                to="#"
                className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <span className="sr-only">LinkedIn</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-6">Platform</h4>
            <ul className="space-y-4">
              <li>
                <Link to="#" className="text-slate-300 hover:text-cyan-400 transition-colors text-sm">
                  Ocean Data Explorer
                </Link>
              </li>
              <li>
                <Link to="#" className="text-slate-300 hover:text-cyan-400 transition-colors text-sm">
                  AI Chat Interface
                </Link>
              </li>
              <li>
                <Link to="#" className="text-slate-300 hover:text-cyan-400 transition-colors text-sm">
                  Data Visualization
                </Link>
              </li>
              <li>
                <Link to="#" className="text-slate-300 hover:text-cyan-400 transition-colors text-sm">
                  Admin Panel
                </Link>
              </li>
              <li>
                <Link to="#" className="text-slate-300 hover:text-cyan-400 transition-colors text-sm">
                  API Access
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-6">Resources</h4>
            <ul className="space-y-4">
              <li>
                <Link to="#" className="text-slate-300 hover:text-cyan-400 transition-colors text-sm">
                  Documentation
                </Link>
              </li>
              <li>
                <Link to="#" className="text-slate-300 hover:text-cyan-400 transition-colors text-sm">
                  ARGO Data Guide
                </Link>
              </li>
              <li>
                <Link to="#" className="text-slate-300 hover:text-cyan-400 transition-colors text-sm">
                  Research Papers
                </Link>
              </li>
              <li>
                <Link to="#" className="text-slate-300 hover:text-cyan-400 transition-colors text-sm">
                  Tutorials
                </Link>
              </li>
              <li>
                <Link to="#" className="text-slate-300 hover:text-cyan-400 transition-colors text-sm">
                  Community Forum
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-6">Company</h4>
            <ul className="space-y-4">
              <li>
                <Link to="#" className="text-slate-300 hover:text-cyan-400 transition-colors text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="#" className="text-slate-300 hover:text-cyan-400 transition-colors text-sm">
                  Research Team
                </Link>
              </li>
              <li>
                <Link to="#" className="text-slate-300 hover:text-cyan-400 transition-colors text-sm">
                  Partnerships
                </Link>
              </li>
              <li>
                <Link to="#" className="text-slate-300 hover:text-cyan-400 transition-colors text-sm">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="#" className="text-slate-300 hover:text-cyan-400 transition-colors text-sm">
                  Careers
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/10 mt-16 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-col md:flex-row items-center gap-6 text-sm text-slate-400">
              <p>&copy; 2025 FloatChat. All rights reserved.</p>
              <div className="flex gap-6">
                <Link to="#" className="hover:text-cyan-400 transition-colors">
                  Privacy Policy
                </Link>
                <Link to="#" className="hover:text-cyan-400 transition-colors">
                  Terms of Service
                </Link>
                <Link to="#" className="hover:text-cyan-400 transition-colors">
                  Cookie Policy
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <span>Powered by</span>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600"></div>
                <span className="text-cyan-400 font-medium">ARGO Network</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent"></div>
    </footer>
  )
}
