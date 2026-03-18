import React, { useState } from 'react';
import './navbar.css';
import logo from '../../assets/logo.png';
import contact from '../../assets/contact.png';
import { Link } from 'react-scroll';
import menu from '../../assets/menu.png';

const Navbar = ({ theme, onToggleTheme }) => {
  const [showMenu, setShowMenu] = useState(false);

  // Close menu on link click helper
  const handleLinkClick = () => setShowMenu(false);

  // Scroll to contact section on button click
  const scrollToContact = () => {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="navbar" role="navigation" aria-label="Primary Navigation">
      <img src={logo} alt="Logo" className="logo" tabIndex={0} />

      <div className="desktopmenu" role="menubar">
        {['intro', 'skill', 'works', 'clients'].map((section, i) => (
          <Link
            key={section}
            activeClass="active"
            to={section}
            spy={true}
            smooth={true}
            offset={-100}
            duration={500}
            className="desktopmenuListItem"
            role="menuitem"
            tabIndex={0}
          >
            {section === 'intro' ? 'Home' : section.charAt(0).toUpperCase() + section.slice(1)}
          </Link>
        ))}
      </div>

      <button
        type="button"
        className="themeToggle"
        onClick={onToggleTheme}
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        {theme === 'dark' ? 'Light mode' : 'Dark mode'}
      </button>

      <button
        className="desktopMenuBtn"
        onClick={scrollToContact}
        aria-label="Scroll to Contact section"
      >
        <img src={contact} alt="Contact icon" className="desktopMenuImg" />
        Contact me
      </button>

      <img
        src={menu}
        alt="Toggle menu"
        className="mobMenu"
        onClick={() => setShowMenu(!showMenu)}
        role="button"
        aria-expanded={showMenu}
        aria-controls="mobile-menu"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            setShowMenu(!showMenu);
          }
        }}
      />

      <div
        id="mobile-menu"
        className="navMenu"
        style={{ display: showMenu ? 'flex' : 'none' }}
        role="menu"
      >
        {['intro', 'skill', 'works', 'contact'].map((section) => (
          <Link
            key={section}
            activeClass="active"
            to={section}
            spy={true}
            smooth={true}
            offset={-100}
            duration={500}
            className="listItem"
            role="menuitem"
            tabIndex={0}
            onClick={handleLinkClick}
          >
            {section === 'intro' ? 'Home' : section.charAt(0).toUpperCase() + section.slice(1)}
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;
