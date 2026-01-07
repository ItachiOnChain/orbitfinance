import { useState, useRef, useEffect } from 'react';
import { Copy, LogOut, Check } from 'lucide-react';

interface WalletDropdownProps {
  address: string;
  onDisconnect: () => void;
  theme: 'light' | 'dark';
}

export function WalletDropdown({ address, onDisconnect }: WalletDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const copyAddress = async () => {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDisconnect = () => {
    onDisconnect();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative z-10 inline-flex h-14 cursor-pointer items-center justify-center rounded-xl border-0 px-12 py-4 font-outfit text-[13px] font-bold tracking-[0.3em] uppercase text-gold bg-[length:200%] [background-clip:padding-box,border-box,border-box] [background-origin:border-box] [border:calc(0.08*1rem)_solid_transparent] bg-[linear-gradient(#0a0d11,#0a0d11),linear-gradient(#d4af37,#d4af37),linear-gradient(90deg,#d4af37,#d4af37,#d4af37,#d4af37,#d4af37)] blur-0 opacity-100 before:animate-[buttonMovingGradientBg_3s_linear_infinite] before:absolute before:bottom-[-10%] before:left-0 before:z-0 before:h-[30%] before:w-full before:bg-[linear-gradient(90deg,#0a0d11,#d4af37,#0a0d11,#d4af37,#0a0d11)] before:bg-[length:200%] before:opacity-15 before:[filter:blur(1rem)] before:transition-opacity hover:before:animate-[buttonMovingGradientBg_3s_linear_infinite] hover:before:opacity-70 shadow-[0_0_40px_rgba(212,175,55,0.25)] hover:scale-105"
        style={{ transition: 'opacity 2s cubic-bezier(0.4, 0, 0.2, 1), color 0.15s cubic-bezier(0.4, 0, 0.2, 1), transform 0.15s cubic-bezier(0.4, 0, 0.2, 1)' }}
      >
        <span className="relative z-10 font-mono">
          {address.slice(0, 6)}...{address.slice(-4)}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-xl bg-zinc-950 border border-gold/30 shadow-[0_0_30px_rgba(212,175,55,0.2)] overflow-hidden z-50">
          <button
            onClick={copyAddress}
            className="w-full px-6 py-4 flex items-center gap-3 hover:bg-zinc-900 transition-colors text-left group"
          >
            {copied ? (
              <Check className="w-5 h-5 text-gold" />
            ) : (
              <Copy className="w-5 h-5 text-gold/60 group-hover:text-gold transition-colors" />
            )}
            <div className="flex flex-col">
              <span className="text-sm font-medium text-white font-outfit">
                {copied ? 'Copied!' : 'Copy Address'}
              </span>
              <span className="text-xs text-zinc-500 font-mono">
                {address.slice(0, 10)}...{address.slice(-8)}
              </span>
            </div>
          </button>

          <div className="h-px bg-gold/20" />

          <button
            onClick={handleDisconnect}
            className="w-full px-6 py-4 flex items-center gap-3 hover:bg-zinc-900 transition-colors text-left group"
          >
            <LogOut className="w-5 h-5 text-gold/60 group-hover:text-gold transition-colors" />
            <span className="text-sm font-medium text-white font-outfit">Disconnect</span>
          </button>
        </div>
      )}
    </div>
  );
}
