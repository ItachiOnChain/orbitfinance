import { PackageOpen } from 'lucide-react';

export function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <PackageOpen className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">No Active Pools Available</h3>
            <p className="text-gray-600 text-center max-w-md">
                There are currently no active investment pools. Check back later for new opportunities.
            </p>
        </div>
    );
}
