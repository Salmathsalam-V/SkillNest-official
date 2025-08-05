import React from "react";

const Footer = () => {
  return (
    <footer className="bg-[#1E1E2F] text-white py-8 mt-12">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Logo & About */}
        <div>
          <h2 className="text-2xl font-bold text-[#4ECDC4]">SkillNest</h2>
          <p className="mt-2 text-sm text-gray-300">
            Empowering creators and learners through vibrant communities.
          </p>
        </div>

        {/* Links */}
        <div>
          <h3 className="text-lg font-semibold mb-2 text-[#4ECDC4]">Quick Links</h3>
          <ul className="text-sm space-y-1 text-gray-300">
            <li><a href="" className="hover:text-white transition">Home</a></li>
            <li><a href="" className="hover:text-white transition">Dashboard</a></li>
            <li><a href="/communities" className="hover:text-white transition">Communities</a></li>
            <li><a href="/contact" className="hover:text-white transition">Contact</a></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-lg font-semibold mb-2 text-[#4ECDC4]">Get in Touch</h3>
          <p className="text-sm text-gray-300">Email: support@skillnest.com</p>
          <p className="text-sm text-gray-300 mt-1">Phone: +91 98765 43210</p>
          <div className="flex mt-3 gap-3">
            <a href="#" className="text-[#4ECDC4] hover:text-white">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="#" className="text-[#4ECDC4] hover:text-white">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="#" className="text-[#4ECDC4] hover:text-white">
              <i className="fab fa-instagram"></i>
            </a>
          </div>
        </div>
      </div>

      <div className="mt-8 border-t border-gray-700 pt-4 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} SkillNest. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
