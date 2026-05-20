import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Monitor, Sun, Moon, Plus, FileText, BarChart2, LogOut, X } from 'lucide-react';
import { ThemeContext } from '../../App.tsx';
import { useAuth } from '../../context/AuthContext';

interface CommandItem {
  id: string;
  title: string;
  category: string;
  icon: React.ReactNode;
  action: () => void;
  shortcut?: string;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLeadModal?: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onOpenLeadModal
}) => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = React.useContext(ThemeContext);
  const { logout } = useAuth();
  const [search, setSearch] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const items: CommandItem[] = [
    {
      id: 'dashboard',
      title: 'Go to Dashboard Overview',
      category: 'Navigation',
      icon: <BarChart2 className="w-4 h-4" />,
      action: () => {
        navigate('/dashboard');
        onClose();
      },
      shortcut: 'G D'
    },
    {
      id: 'leads',
      title: 'Go to Leads Management',
      category: 'Navigation',
      icon: <FileText className="w-4 h-4" />,
      action: () => {
        navigate('/leads');
        onClose();
      },
      shortcut: 'G L'
    },
    {
      id: 'add-lead',
      title: 'Create New Lead',
      category: 'Actions',
      icon: <Plus className="w-4 h-4" />,
      action: () => {
        onClose();
        if (onOpenLeadModal) onOpenLeadModal();
      },
      shortcut: 'N L'
    },
    {
      id: 'toggle-theme',
      title: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`,
      category: 'Preferences',
      icon: theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />,
      action: () => {
        toggleTheme();
        onClose();
      },
      shortcut: 'T T'
    },
    {
      id: 'logout',
      title: 'Sign Out Profile',
      category: 'System',
      icon: <LogOut className="w-4 h-4 text-rose-500" />,
      action: () => {
        logout();
        onClose();
      }
    }
  ];

  const filteredItems = items.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    item.category.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % filteredItems.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[activeIndex]) {
          filteredItems[activeIndex].action();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeIndex, filteredItems]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 shadow-2xl shadow-slate-950/20 backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search actions..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setActiveIndex(0);
            }}
            className="w-full text-slate-800 dark:text-slate-100 placeholder-slate-400 bg-transparent outline-none text-base border-none focus:ring-0"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[340px] overflow-y-auto py-2">
          {filteredItems.length === 0 ? (
            <div className="px-6 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
              No matching actions or commands found.
            </div>
          ) : (
            <div>
              {/* Group items by category */}
              {Array.from(new Set(filteredItems.map(item => item.category))).map(category => (
                <div key={category}>
                  <div className="px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-slate-950/30">
                    {category}
                  </div>
                  <div className="px-1 py-1">
                    {filteredItems
                      .filter(item => item.category === category)
                      .map((item, idx) => {
                        const itemIndex = filteredItems.indexOf(item);
                        const isActive = itemIndex === activeIndex;

                        return (
                          <div
                            key={item.id}
                            onClick={item.action}
                            onMouseEnter={() => setActiveIndex(itemIndex)}
                            className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer transition-all duration-150 ${
                              isActive
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10'
                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`p-1.5 rounded-lg shrink-0 ${
                                isActive ? 'bg-indigo-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                              }`}>
                                {item.icon}
                              </div>
                              <span className="font-medium text-sm">{item.title}</span>
                            </div>
                            {item.shortcut && (
                              <span className={`text-xs font-mono px-2 py-0.5 rounded-md border shrink-0 ${
                                isActive
                                  ? 'border-indigo-400 text-indigo-100 bg-indigo-500/20'
                                  : 'border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-950'
                              }`}>
                                {item.shortcut}
                              </span>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 text-xs text-slate-400 dark:text-slate-500 font-medium">
          <div className="flex gap-2">
            <span>↑↓ to navigate</span>
            <span>↵ to select</span>
            <span>esc to close</span>
          </div>
          <div>Smart Command Center</div>
        </div>
      </div>
    </div>
  );
};
