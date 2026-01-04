import { Outlet } from 'react-router-dom';
import { AppNavbar } from '../components/layout/AppNavbar';
import { Sidebar } from '../components/layout/Sidebar';
import { useAppStore } from '../store/appStore';

export default function AppLayout() {
    const { mode } = useAppStore();

    return (
        <div className="min-h-screen bg-[#0A0A0A]">
            <AppNavbar />

            {mode === 'rwa' ? (
                <div className="flex items-center justify-center h-[calc(100vh-65px)]">
                    <div className="text-center">
                        <h1 className="text-4xl font-light tracking-tight text-white mb-4">
                            RWA Module
                        </h1>
                        <p className="text-lg text-zinc-400 font-light">
                            Coming Soon
                        </p>
                    </div>
                </div>
            ) : (
                <div className="flex">
                    <Sidebar />
                    <main className="flex-1 p-8">
                        <Outlet />
                    </main>
                </div>
            )}
        </div>
    );
}
