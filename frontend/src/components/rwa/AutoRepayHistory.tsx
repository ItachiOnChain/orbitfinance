import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { AutoRepayEvent } from '../../services/rwa/portfolioService';

interface AutoRepayHistoryProps {
    events: AutoRepayEvent[];
}

export function AutoRepayHistory({ events }: AutoRepayHistoryProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const totalPages = Math.ceil(events.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentEvents = events.slice(startIndex, endIndex);

    return (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="px-6 py-4 bg-zinc-900/80 border-b border-zinc-800">
                <h3 className="text-lg font-bold text-white">Auto-Repayment History</h3>
            </div>

            {events.length > 0 ? (
                <>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-zinc-900/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Asset</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Amount Repaid</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Debt After</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800">
                                {currentEvents.map((event, index) => (
                                    <tr key={index} className="hover:bg-zinc-900/30 transition-colors">
                                        <td className="px-6 py-4 text-zinc-300 text-sm">
                                            {new Date(event.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-white font-medium">{event.asset}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[#00F5A0]">✓</span>
                                                <span className="text-[#00F5A0] font-mono font-semibold">
                                                    ${event.amountRepaid.toLocaleString()}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-zinc-400 font-mono">
                                            ${event.debtAfter.toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="px-6 py-4 bg-zinc-900/50 border-t border-zinc-800 flex items-center justify-between">
                            <span className="text-sm text-zinc-400">
                                Page {currentPage} of {totalPages}
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <button
                                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className="px-6 py-12 text-center text-zinc-500">
                    No auto-repayments yet
                </div>
            )}
        </div>
    );
}
