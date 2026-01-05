import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// GUIDE: How to get a CoinGecko API Key
// 1. Go to https://www.coingecko.com/en/api/pricing
// 2. Sign up for a free Demo account (or Pro if needed).
// 3. Generate an API key in your developer dashboard.
// 4. Replace 'YOUR_API_KEY_HERE' below with your actual key.
// Note: The free API has rate limits. If you see 429 errors, you are being rate limited.

const API_KEY = 'CG-ny4JroFUE4dDL9mubBxz5nEo';
const API_URL = 'https://api.coingecko.com/api/v3';

interface VaultStatsProps {
    vaultAddress?: string;
    assetAddress?: string;
}

// Generate realistic APR data with more volatility
const generateAprData = () => {
  const data = [];
  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - 1);
  
  for (let i = 0; i < 365; i += 3) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    // Create volatility spikes similar to the image
    let value;
    if (i < 30) {
      value = 2 + Math.random() * 6; // Initial high volatility (2-8%)
    } else if (i < 60) {
      value = 4 + Math.random() * 3; // Peak period (4-7%)
    } else {
      value = 0.5 + Math.random() * 1.5; // Stable period (0.5-2%)
    }
    
    data.push({
      name: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: parseFloat(value.toFixed(2))
    });
  }
  return data;
};

const mockAprData = generateAprData();

const mockHarvestData = [
  { name: 'Jan 1', value: 0.5 },
  { name: 'Feb 1', value: 0.8 },
  { name: 'Mar 1', value: 0.6 },
  { name: 'Apr 1', value: 1.2 },
  { name: 'May 1', value: 0.9 },
  { name: 'Jun 1', value: 1.5 },
];

export function VaultStats({ assetAddress }: VaultStatsProps) {
    const [activeTab, setActiveTab] = useState<'apr' | 'harvests'>('apr');
    const [data, setData] = useState(mockAprData);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!assetAddress || activeTab === 'harvests') {
                // For Harvests, we currently use mock data as it requires a specific subgraph or contract events
                setData(mockHarvestData);
                return;
            }

            setIsLoading(true);
            try {
                // Example: Fetching Ethereum price history as a proxy for demonstration
                // In a real app, you'd fetch the specific vault's historical APY from your backend or subgraph
                const coinId = 'ethereum'; // You would map assetAddress to coinId
                const response = await fetch(
                    `${API_URL}/coins/${coinId}/market_chart?vs_currency=usd&days=30&interval=daily&x_cg_demo_api_key=${API_KEY}`
                );
                
                if (!response.ok) throw new Error('Network response was not ok');
                
                const json = await response.json();
                
                // Transform CoinGecko [timestamp, price] array to our format
                const formattedData = json.prices.map((item: [number, number]) => ({
                    name: new Date(item[0]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    value: item[1] // This is price, for APY you'd need a different source
                }));

                // Slice to keep it clean if too many data points
                setData(formattedData.slice(-10)); 
            } catch (error) {
                console.error('Failed to fetch chart data:', error);
                // Fallback to mock data on error
                setData(mockAprData);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [assetAddress, activeTab]);

    return (
        <div className="flex w-full flex-col rounded-sm border border-zinc-800 bg-zinc-950/50">
            <div className="rounded-t border-b border-zinc-800 bg-zinc-900/30 p-2">
                <div className="flex items-center gap-2">
                    {['APR', 'Harvests'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab.toLowerCase() as any)}
                            className={`flex-1 inline-flex items-center justify-center rounded-sm px-3 py-1 text-xs font-medium transition-all ${
                                activeTab === tab.toLowerCase()
                                    ? 'bg-zinc-800 text-white'
                                    : 'bg-zinc-900/30 text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-300'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            <div className="relative h-48 w-full p-4">
                <div className="absolute top-4 left-4 z-10">
                    <div className="bg-zinc-800/80 backdrop-blur-sm px-2 py-1 rounded-full border border-zinc-700">
                        <p className="text-[10px] text-zinc-400 font-medium">
                            {activeTab === 'apr' ? 'Avg 2.55%' : 'Total 4.5 ETH'}
                        </p>
                    </div>
                </div>
                
                {isLoading ? (
                    <div className="h-full w-full flex items-center justify-center text-zinc-500 text-xs">
                        Loading...
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                            <XAxis 
                                dataKey="name" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: '#71717a', fontSize: 10 }} 
                                interval="preserveStartEnd"
                                dy={10}
                            />
                            <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: '#71717a', fontSize: 10 }} 
                                tickFormatter={(value) => activeTab === 'apr' ? `${value.toFixed(1)}%` : `${value.toFixed(2)}`}
                                dx={-10}
                            />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }}
                                itemStyle={{ color: '#fbbf24' }}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="value" 
                                stroke="#fbbf24" 
                                fillOpacity={1} 
                                fill="url(#colorValue)" 
                                strokeWidth={2}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}
