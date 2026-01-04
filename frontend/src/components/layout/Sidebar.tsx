import { NavLink } from 'react-router-dom';

export function Sidebar() {
    const linkClass = ({ isActive }: { isActive: boolean }) =>
        `block px-6 py-3 text-sm font-light tracking-wide transition-colors ${isActive
            ? 'text-gold bg-zinc-900/50 border-l-2 border-gold'
            : 'text-zinc-400 hover:text-white hover:bg-zinc-900/30'
        }`;

    return (
        <aside className="w-64 border-r border-zinc-800 bg-[#0A0A0A] min-h-[calc(100vh-65px)]">
            <nav className="py-6">
                <NavLink to="/app/account" className={linkClass}>
                    My Account
                </NavLink>
                <NavLink to="/app/vaults" className={linkClass}>
                    Vaults
                </NavLink>
                <NavLink to="/app/transmuter" className={linkClass}>
                    Transmuter
                </NavLink>
                <NavLink to="/app/farms" className={linkClass}>
                    Farms
                </NavLink>
            </nav>
        </aside>
    );
}
