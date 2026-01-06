export default function SPVDashboard() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">SPV Simulator</h1>
                <p className="text-gray-400">Manage protocol operations and yield distribution</p>
            </div>

            <div className="bg-[#0A2342] border border-gray-800 rounded-xl p-12 text-center">
                <div className="text-6xl mb-4">⚙️</div>
                <h2 className="text-2xl font-bold text-white mb-4">Admin Panel</h2>
                <p className="text-gray-400 max-w-md mx-auto mb-6">
                    Manage auto-repayments, yield distribution, and protocol settings
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#FFB800]/10 text-[#FFB800] rounded-lg">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Admin Access Required
                </div>
            </div>
        </div>
    );
}
