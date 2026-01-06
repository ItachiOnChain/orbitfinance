import { useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { AppNavbar } from '../../components/layout/AppNavbar';
import { RWASidebar } from '../../components/rwa/RWASidebar';
import { useKYCStatus } from '../../hooks/rwa/useKYC';

// Route protection component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { address } = useAccount();
    const { data: isVerified, isLoading } = useKYCStatus();
    const location = useLocation();

    // Public paths that don't require KYC
    const publicPaths = ['/app', '/app/kyc', '/app/admin/spv'];
    const isPublicPath = publicPaths.some(path => location.pathname === path || location.pathname.startsWith(path));

    // Allow access to public paths
    if (isPublicPath) {
        return <>{children}</>;
    }

    // Show loading state while checking KYC status
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#00D4FF]"></div>
            </div>
        );
    }

    // Redirect to KYC page if not verified
    if (!isVerified && address) {
        return <Navigate to="/rwa/kyc" replace />;
    }

    return <>{children}</>;
}

export default function RWALayout() {
    const { isConnected } = useAccount();
    const navigate = useNavigate();
    const location = useLocation();

    // Redirect to home if not connected (except for home page)
    useEffect(() => {
        if (!isConnected && location.pathname !== '/app') {
            navigate('/app');
        }
    }, [isConnected, location.pathname, navigate]);

    return (
        <div className="min-h-screen bg-[#1A1D29] flex flex-col">
            {/* Top Navbar */}
            <AppNavbar />

            {/* Main Layout */}
            <div className="flex flex-1">
                {/* Sidebar */}
                <RWASidebar />

                {/* Main Content with Route Protection */}
                <main className="flex-1 ml-60 p-8">
                    <div className="max-w-7xl mx-auto">
                        <ProtectedRoute>
                            <Outlet />
                        </ProtectedRoute>
                    </div>
                </main>
            </div>
        </div>
    );
}
