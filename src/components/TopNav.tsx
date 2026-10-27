import React, { useState } from 'react';
import { AuthUser } from '../lib/firebase.js';
import { ShieldCheck, Calendar, BookOpen, Layers, Wrench, Menu, X } from 'lucide-react';

interface TopNavProps {
  user: AuthUser | null;
  isAdmin?: boolean;
  currentProduct: string;
  onSelectProduct: (product: string) => void;
  availableProducts: Array<{ id: string; name?: string; title?: string }>;
  onOpenKnowledge: () => void;
  onOpenApps: () => void;
  onOpenTools: () => void;
  onOpenNotes: () => void;
  onOpenEscalation: () => void;
  onOpenAdmin: () => void;
  onSignOut: () => void;
  onSignIn: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  user,
  isAdmin = false,
  currentProduct,
  onSelectProduct,
  availableProducts,
  onOpenKnowledge,
  onOpenApps,
  onOpenTools,
  onOpenNotes,
  onOpenEscalation,
  onOpenAdmin,
  onSignOut,
  onSignIn,
}) => {
  // Mobile menu only: on md+ the existing nav bar is unchanged. This restores
  // the nav actions that were previously hidden entirely on phones.
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const closeMobileMenu = (fn?: () => void) => () => {
    setMobileMenuOpen(false);
    fn?.();
  };
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 sm:gap-8 px-4 sm:px-6 py-4 border-b border-[#E6DFD3] bg-[#FBF9F5] sticky top-0 z-40">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-4 shrink-0">
        <a
          href="/"
          className="text-lg sm:text-xl font-editorial font-medium tracking-wide text-[#1C1917] whitespace-nowrap shrink-0 hover:opacity-85 transition-opacity"
        >
          Calm Guide
        </a>

        {/* Product selector (hidden when only one product is enabled) */}
        {availableProducts.length > 1 && (
          <div className="hidden sm:flex items-center text-xs text-[#78716C] border-l border-[#E6DFD3] pl-4">
            <span className="mr-2">Product:</span>
            <select
              value={currentProduct}
              onChange={(e) => onSelectProduct(e.target.value)}
              className="bg-[#F4F0E8] border border-[#E6DFD3] rounded px-2.5 py-1 text-xs text-[#1C1917] font-medium focus:outline-none focus:ring-1 focus:ring-[#9A3412]"
            >
              {availableProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name || p.title || p.id}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Zone 2: Clean single-line text navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-normal text-[#57534E]">
        <button
          onClick={onOpenKnowledge}
          className="flex items-center gap-1.5 hover:text-[#1C1917] transition-colors whitespace-nowrap shrink-0 text-left"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Knowledge & Sources</span>
        </button>

        <button
          onClick={onOpenApps}
          className="flex items-center gap-1.5 hover:text-[#1C1917] transition-colors whitespace-nowrap shrink-0 text-left"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Guided Apps</span>
        </button>

        <button
          onClick={onOpenTools}
          className="flex items-center gap-1.5 hover:text-[#1C1917] transition-colors whitespace-nowrap shrink-0 text-left"
        >
          <Wrench className="w-3.5 h-3.5" />
          <span>Your tools</span>
        </button>

        <button
          onClick={onOpenNotes}
          className="flex items-center gap-1.5 hover:text-[#1C1917] transition-colors whitespace-nowrap shrink-0 text-left"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Session Notes</span>
        </button>

        {isAdmin && (
          <button
            onClick={onOpenAdmin}
            className="hover:text-[#1C1917] transition-colors whitespace-nowrap shrink-0 text-xs text-[#78716C]"
          >
            Admin Console
          </button>
        )}
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-3 shrink-0">
        {user ? (
          <div className="flex items-center gap-3">
            <span className="hidden lg:inline text-xs text-[#78716C] truncate max-w-[140px]">
              {user.displayName || user.email}
            </span>
            <button
              onClick={onOpenEscalation}
              className="px-3.5 py-2.5 md:py-1.5 text-xs font-medium text-white bg-[#1C1917] rounded-md hover:bg-[#292524] transition-colors whitespace-nowrap shrink-0 shadow-xs flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Talk to Nic</span>
            </button>
            <button
              onClick={onSignOut}
              className="text-xs text-[#78716C] hover:text-[#1C1917] transition-colors underline ml-1"
            >
              Sign out
            </button>
          </div>
        ) : (
          <button
            onClick={onSignIn}
            className="px-4 py-2.5 md:py-1.5 text-xs font-medium text-[#1C1917] bg-[#F4F0E8] border border-[#E6DFD3] rounded-md hover:bg-[#EAE4D7] transition-colors whitespace-nowrap shrink-0"
          >
            Sign in
          </button>
        )}
      </div>

      {/* Mobile menu button: md+ keeps the existing nav, phones get this menu. */}
      <button
        type="button"
        onClick={() => setMobileMenuOpen((prev) => !prev)}
        aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={mobileMenuOpen}
        className="md:hidden p-2.5 -mr-2 text-[#1C1917] hover:bg-[#F4F0E8] rounded-lg transition-colors shrink-0"
      >
        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile menu panel: same actions as the desktop nav, stacked, tap-sized. */}
      {mobileMenuOpen && (
        <nav className="md:hidden basis-full flex flex-col gap-1 pt-3 mt-1 border-t border-[#E6DFD3] text-sm text-[#57534E]">
          <button type="button" onClick={closeMobileMenu(onOpenKnowledge)} className="flex items-center gap-2 py-2.5 text-left hover:text-[#1C1917]">
            <BookOpen className="w-4 h-4" /><span>Knowledge &amp; Sources</span>
          </button>
          <button type="button" onClick={closeMobileMenu(onOpenApps)} className="flex items-center gap-2 py-2.5 text-left hover:text-[#1C1917]">
            <Layers className="w-4 h-4" /><span>Guided Apps</span>
          </button>
          <button type="button" onClick={closeMobileMenu(onOpenTools)} className="flex items-center gap-2 py-2.5 text-left hover:text-[#1C1917]">
            <Wrench className="w-4 h-4" /><span>Your tools</span>
          </button>
          <button type="button" onClick={closeMobileMenu(onOpenNotes)} className="flex items-center gap-2 py-2.5 text-left hover:text-[#1C1917]">
            <ShieldCheck className="w-4 h-4" /><span>Session Notes</span>
          </button>
          {isAdmin && (
            <button type="button" onClick={closeMobileMenu(onOpenAdmin)} className="py-2.5 text-left text-xs text-[#78716C] hover:text-[#1C1917]">
              Admin Console
            </button>
          )}
        </nav>
      )}
    </header>
  );
};
