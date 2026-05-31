import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import logo from '../../imports/logo_ediliano_designer_branco_e_verde.png';

interface HeaderProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

export function Header({ activeSection, setActiveSection }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'home', label: 'Início' },
    { id: 'store', label: 'Creator' },
    { id: 'portfolio', label: 'Portfólio' },
    { id: 'services', label: 'Serviços' },
    { id: 'quote', label: 'Orçamento' },
    { id: 'blog', label: 'Blog' },
    { id: 'contact', label: 'Contato' },
  ];

  const handleNavClick = (id: string) => {
    setActiveSection(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-sm border-b border-lime-500/20">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <button 
            onClick={() => handleNavClick('home')}
            className="hover:opacity-80 transition-opacity"
          >
            <img src={logo} alt="Ediliano Designer" className="h-6 md:h-7" />
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`text-sm font-medium transition-colors relative group ${
                  activeSection === item.id ? 'text-lime-400' : 'text-white hover:text-lime-400'
                }`}
              >
                {item.label}
                <span
                  className={`absolute -bottom-1 left-0 h-0.5 bg-lime-400 transition-all ${
                    activeSection === item.id ? 'w-full' : 'w-0 group-hover:w-full'
                  }`}
                />
              </button>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-lime-400 hover:text-lime-300 transition-colors"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 flex flex-col gap-4 border-t border-lime-500/20 pt-4">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`text-left text-sm font-medium transition-colors ${
                  activeSection === item.id ? 'text-lime-400' : 'text-white hover:text-lime-400'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}