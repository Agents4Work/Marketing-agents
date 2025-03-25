import React from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Send,
  Youtube,
  Mail,
  MapPin,
  Phone,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react";
import { 
  SHADOWS, 
  BORDERS, 
  BORDERS_RADIUS, 
  ANIMATIONS, 
  BUTTON_3D_STYLES, 
  CARD_3D_STYLES 
} from "@/styles/modern-3d-design-system";

const Footer = () => {
  const [, setLocation] = useLocation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`relative ${BORDERS.md} border-b-0 border-l-0 border-r-0 border-t-blue-800/80 bg-gradient-to-b from-gray-900 to-black text-white overflow-hidden`}>
      {/* Background effects */}
      <div className="absolute top-0 left-0 w-full h-96 overflow-hidden opacity-30 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute top-20 right-20 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/3 w-1/3 h-40 bg-gradient-to-t from-blue-500/10 to-transparent blur-2xl"></div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true, amount: 0.1 }}
        className="container mx-auto px-4 py-20 relative z-10"
      >
        {/* Main Footer Grid */}
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: About & Newsletter */}
          <div className="relative">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className={`flex items-center gap-3 mb-6 p-3 bg-gradient-to-br from-blue-950 to-gray-900 ${BORDERS.md} ${BORDERS_RADIUS.lg} ${SHADOWS.md} w-fit`}
            >
              <div className={`p-2.5 ${BORDERS_RADIUS.full} bg-gradient-to-br from-blue-600 to-blue-800 ${SHADOWS.sm} flex items-center justify-center`}>
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-200 bg-clip-text text-transparent">AI Marketing</h2>
            </motion.div>
            
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className={`mb-8 text-gray-400 ${BORDERS.light.sm} ${BORDERS_RADIUS.lg} p-4 bg-gray-900/50 backdrop-blur-sm`}
            >
              Transforming marketing with AI-powered automation. Replace your entire marketing 
              team with intelligent agents that work 24/7.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative"
            >
              <form className={`mb-6 p-4 ${BORDERS.md} ${BORDERS_RADIUS.lg} ${SHADOWS.md} bg-gradient-to-br from-gray-900 to-gray-800`}>
                <h3 className="text-lg font-bold mb-3 bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">Stay Updated</h3>
                <div className="relative flex items-center">
                  <Input
                    type="email"
                    placeholder="Your email address"
                    className={`pr-12 ${BORDERS.sm} bg-gray-800/80 text-white placeholder:text-gray-500 ${SHADOWS.inner}`}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className={`absolute right-1 top-1 h-8 w-8 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 text-white ${BORDERS.sm} ${SHADOWS.sm} ${ANIMATIONS.transition.default} hover:-translate-y-1`}
                  >
                    <Send className="h-4 w-4" />
                    <span className="sr-only">Subscribe</span>
                  </Button>
                </div>
              </form>
            </motion.div>
            
            {/* Glowing orb effect */}
            <div className="absolute -right-10 top-10 h-32 w-32 rounded-full bg-blue-500/20 blur-3xl opacity-70" />
            <div className="absolute -left-10 bottom-0 h-24 w-24 rounded-full bg-purple-500/20 blur-3xl opacity-50" />
          </div>

          {/* Column 2: Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className={`${BORDERS.md} ${BORDERS_RADIUS.xl} ${SHADOWS.md} p-6 bg-gradient-to-br from-gray-900 to-gray-950`}>
              <h3 className={`text-lg font-bold mb-6 inline-block relative`}>
                <span className="bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">Quick Links</span>
                <span className="absolute -bottom-1 left-0 w-1/2 h-0.5 bg-gradient-to-r from-blue-500 to-transparent"></span>
              </h3>
              
              <nav className="space-y-3">
                {[
                  { label: "Home", href: "/", isExternal: false },
                  { label: "Features", href: "#features", isExternal: false },
                  { label: "Pricing", href: "/pricing", isExternal: false },
                  { label: "FAQ", href: "#faq", isExternal: false },
                  { label: "Contact", href: "/contact", isExternal: false }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -5 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 + (index * 0.05) }}
                    whileHover={{ x: 3 }}
                    className="flex items-center"
                  >
                    <ChevronRight className="h-3 w-3 text-blue-500 mr-2" />
                    <a 
                      href={item.href} 
                      onClick={(e) => {
                        if (!item.isExternal && !item.href.startsWith('#')) {
                          e.preventDefault();
                          setLocation(item.href);
                        }
                      }}
                      className={`group flex items-center ${ANIMATIONS.transition.default}`}
                    >
                      <span className="text-gray-300 group-hover:text-blue-400">
                        {item.label}
                      </span>
                    </a>
                  </motion.div>
                ))}
              </nav>
            </div>
          </motion.div>

          {/* Column 3: Resources */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className={`${BORDERS.md} ${BORDERS_RADIUS.xl} ${SHADOWS.md} p-6 bg-gradient-to-br from-gray-900 to-gray-950`}>
              <h3 className={`text-lg font-bold mb-6 inline-block relative`}>
                <span className="bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">Resources</span>
                <span className="absolute -bottom-1 left-0 w-1/2 h-0.5 bg-gradient-to-r from-blue-500 to-transparent"></span>
              </h3>
              
              <nav className="space-y-3">
                {[
                  { label: "Blog", href: "/blog", isExternal: false },
                  { label: "Case Studies", href: "/case-studies", isExternal: false },
                  { label: "AI Content Guides", href: "/guides", isExternal: false },
                  { label: "Help Center", href: "/help", isExternal: false },
                  { label: "API Documentation", href: "/api", isExternal: false }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -5 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 + (index * 0.05) }}
                    whileHover={{ x: 3 }}
                    className="flex items-center"
                  >
                    <ChevronRight className="h-3 w-3 text-blue-500 mr-2" />
                    <a 
                      href={item.href} 
                      onClick={(e) => {
                        if (!item.isExternal) {
                          e.preventDefault();
                          setLocation(item.href);
                        }
                      }}
                      className={`group flex items-center ${ANIMATIONS.transition.default}`}
                    >
                      <span className="text-gray-300 group-hover:text-blue-400">
                        {item.label}
                      </span>
                      {item.isExternal && (
                        <ArrowUpRight className="h-3 w-3 ml-1 text-gray-500 group-hover:text-blue-400" />
                      )}
                    </a>
                  </motion.div>
                ))}
              </nav>
            </div>
          </motion.div>

          {/* Column 4: Contact & Social */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className={`${BORDERS.md} ${BORDERS_RADIUS.xl} ${SHADOWS.md} p-6 bg-gradient-to-br from-gray-900 to-gray-950 relative overflow-hidden`}>
              {/* Decorative corner shape */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/5 rounded-bl-full"></div>
              
              <h3 className={`text-lg font-bold mb-6 inline-block relative`}>
                <span className="bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">Contact Us</span>
                <span className="absolute -bottom-1 left-0 w-1/2 h-0.5 bg-gradient-to-r from-blue-500 to-transparent"></span>
              </h3>
              
              <address className="not-italic mb-6">
                {[
                  { icon: <Mail className="h-4 w-4" />, text: "contact@aimarketing.com" },
                  { icon: <Phone className="h-4 w-4" />, text: "(123) 456-7890" },
                  { icon: <MapPin className="h-4 w-4" />, text: "123 AI Avenue, Suite 500\nSan Francisco, CA 94105" }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -5 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 + (index * 0.05) }}
                    className={`flex items-start gap-3 mb-3 p-2.5 ${BORDERS.light.sm} ${BORDERS_RADIUS.md} bg-gray-900/50 hover:bg-gray-800/50 transition-colors`}
                  >
                    <div className={`mt-0.5 p-1.5 ${BORDERS_RADIUS.full} bg-blue-900/20 ${BORDERS.light.sm} flex items-center justify-center text-blue-500`}>
                      {item.icon}
                    </div>
                    <p className="text-gray-300">
                      {item.text.split('\n').map((line, i) => (
                        <span key={i}>
                          {line}
                          {i < item.text.split('\n').length - 1 && <br />}
                        </span>
                      ))}
                    </p>
                  </motion.div>
                ))}
              </address>
              
              <div className={`mb-3`}>
                <h3 className={`text-lg font-bold mb-3 inline-block relative`}>
                  <span className="bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">Follow Us</span>
                  <span className="absolute -bottom-1 left-0 w-1/2 h-0.5 bg-gradient-to-r from-blue-500 to-transparent"></span>
                </h3>
                
                <div className="flex flex-wrap gap-2 mt-3">
                  {[
                    { icon: <Facebook className="h-4 w-4" />, label: "Facebook" },
                    { icon: <Twitter className="h-4 w-4" />, label: "Twitter" },
                    { icon: <Instagram className="h-4 w-4" />, label: "Instagram" },
                    { icon: <Linkedin className="h-4 w-4" />, label: "LinkedIn" },
                    { icon: <Youtube className="h-4 w-4" />, label: "YouTube" }
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.2 + (index * 0.05) }}
                      whileHover={{ y: -3, scale: 1.05 }}
                    >
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className={`rounded-full bg-gradient-to-br from-gray-800 to-gray-900 ${BORDERS.md} ${SHADOWS.sm} text-gray-400 ${ANIMATIONS.transition.default} hover:text-blue-400 hover:shadow-md`}
                      >
                        {item.icon}
                        <span className="sr-only">{item.label}</span>
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Legal Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className={`mt-16 pt-8 border-t border-blue-900/30 flex flex-col md:flex-row justify-between items-center gap-4 ${BORDERS_RADIUS.xl} p-4 bg-gradient-to-r from-gray-900/50 to-gray-950/50 backdrop-blur-sm`}
        >
          <div className={`flex items-center`}>
            <div className={`w-5 h-5 ${BORDERS_RADIUS.full} ${BORDERS.sm} bg-gradient-to-br from-blue-900 to-blue-950 flex items-center justify-center mr-2`}>
              <span className="text-blue-400 text-xs font-bold">©</span>
            </div>
            <p className="text-sm text-gray-400">
              <span className="font-medium">{currentYear} AI Marketing.</span> All rights reserved.
            </p>
          </div>
          
          <nav className="flex gap-6 text-sm">
            {["Terms of Service", "Privacy Policy", "Cookie Settings"].map((text, index) => (
              <motion.a 
                key={index}
                href="#" 
                initial={{ opacity: 0, y: 5 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.5 + (index * 0.1) }}
                className={`text-gray-500 hover:text-blue-400 ${ANIMATIONS.transition.default} relative group overflow-hidden`}
              >
                {text}
                <span className="absolute left-0 bottom-0 w-0 h-px bg-blue-500 group-hover:w-full transition-all duration-300"></span>
              </motion.a>
            ))}
          </nav>
        </motion.div>
      </motion.div>
      
      {/* Background Gradient Effect */}
      <div className="absolute bottom-0 left-1/4 w-1/2 h-1/2 bg-gradient-to-t from-primary/5 to-transparent blur-3xl opacity-30 pointer-events-none" />
    </footer>
  );
};

export default Footer;