import Link from 'next/link';
import { useState } from 'react';
import Image from 'next/image';
import logo from '../../../public/Logo-green.png';
// import { CgCloseR } from 'react-icons/cg';
// import { FaHamburger } from 'react-icons/fa';
// import { PiHamburgerBold } from 'react-icons/pi';
import { MenuIcon, X } from 'lucide-react';

function Header() {
  const [navbar, setNavbar] = useState(false);
  return (
    <div>
      <nav className="w-full z-10 py-[20px]">
        <div className="lg:justify-between px-2 mx-auto md:items-center md:flex md:px-[22px]">
          <div className="flex items-center justify-between">
            {/* LOGO */}
            <Image
              src={logo}
              alt="Logo"
              className="lg:w-[95px] w-[85px] h-auto lg:h-[95px] object-contain"
            />
            {/* HAMBURGER BUTTON FOR MOBILE */}
            <div className="md:hidden">
              <button
                className="p-2 text-gray-700 rounded-md outline-none focus:border-gray-400 focus:border"
                onClick={() => setNavbar(!navbar)}
              >
                {navbar ? (
                  <X />
                ) : (
                  <MenuIcon />
                )}
              </button>
            </div>
          </div>
          {/* LINKS */}
          <div
            className={`flex-1 items-center justify-center lg:justify-between lg:ml-16 ${
              navbar ? 'flex h-screen' : 'hidden md:flex'
            }`}
          >
            <ul className="flex flex-col md:flex-row items-center justify-center lg:space-x-6 gap-6 text-center  font-custom text-[#031603]">
              <li className="text-xl py-2 hover:text-[#EF5B13]">
                <Link href="#about" onClick={() => setNavbar(false)}>
                  About
                </Link>
              </li>
              <li className="text-xl py-2 hover:text-[#EF5B13]">
                <Link href="#blog" onClick={() => setNavbar(false)}>
                  Blogs
                </Link>
              </li>
              <li className="text-xl py-2 hover:text-[#EF5B13]">
                <Link href="#contact" onClick={() => setNavbar(false)}>
                  Contact
                </Link>
              </li>
              <li className="text-xl py-2 hover:text-[#EF5B13]">
                <Link href="#projects" onClick={() => setNavbar(false)}>
                  Projects
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </div>
  );
}

export default Header;
