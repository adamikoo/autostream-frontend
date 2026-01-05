
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase'; // Just in case, though we fetch from backend API
import { BarChart2, TrendingUp, Users, Video, Calendar } from 'lucide-react';

const TimeFrameSelector = ({ current, onChange }) => (
    <div className="flex bg-slate-100 p-1 rounded-lg">
        {['1d', '7d', '30d'].map((tf) => (
            <button
                key={tf}
                onClick={() => onChange(tf)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${current === tf ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
            >
                {tf.toUpperCase()}
            </button>
        ))}
    </div>
);

const StatCard = ({ label, value, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-start justify-between mb-4">
            <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{label}</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">{value}</h3>
            </div>
            <div className={`p-2 rounded-lg ${color} bg-opacity-10 text-opacity-100`}>
                <Icon size={20} className={color.replace('bg-', 'text-')} />
            </div>
        </div>
        <div className="flex items-center text-xs text-green-600 font-medium">
            <TrendingUp size={12} className="mr-1" />
            <span>+12% this week</span>
        </div>
    </div>
);

// Simple SVG Line Chart Component
const SimpleLineChart = ({ data }) => {
    if (!data || data.length === 0) return <div className="h-64 flex items-center justify-center text-slate-400">No Data</div>;

    // Normalize data for chart
    // Assuming data has 'views' and 'date'
    const values = data.map(d => d.views);
    const maxVal = Math.max(...values, 100); // Avoid div by zero
    const minVal = 0;

    const width = 800;
    const height = 200;
    const padding = 20;

    // Calculate points
    const points = values.map((val, index) => {
        const x = padding + (index / (values.length - 1)) * (width - 2 * padding);
        const y = height - padding - ((val - minVal) / (maxVal - minVal)) * (height - 2 * padding);
        return `${x},${y}`;
    }).join(' ');

    return (
        <div className="w-full overflow-hidden">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
                {/* Grid lines (optional) */}
                <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#e2e8f0" strokeWidth="1" />
                <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />

                {/* The Line */}
                <polyline
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="3"
                    points={points}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Area under curve (optional, needs path closing) */}
                <path
                    d={`M${padding},${height - padding} ${points.replace(/,/g, ' ')} L${width - padding},${height - padding} Z`}
                    fill="url(#gradient)"
                    opacity="0.2"
                    stroke="none"
                />

                <defs>
                    <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#ffffff" />
                    </linearGradient>
                </defs>

                {/* Dots */}
                {values.map((val, index) => {
                    const x = padding + (index / (values.length - 1)) * (width - 2 * padding);
                    const y = height - padding - ((val - minVal) / (maxVal - minVal)) * (height - 2 * padding);
                    return (
                        <circle key={index} cx={x} cy={y} r="4" fill="#3b82f6" stroke="white" strokeWidth="2" />
                    )
                })}
            </svg>
            {/* X Axis Labels */}
            <div className="flex justify-between mt-2 text-xs text-slate-400 px-2">
                {data.map((d, i) => (
                    // Show label only for some points to avoid crowding
                    (i === 0 || i === data.length - 1 || i === Math.floor(data.length / 2)) &&
                    <span key={i}>{d.date}</span>
                ))}
            </div>
        </div>
    );
};


export default function Overview() {
    const [timeFrame, setTimeFrame] = useState('7d');
    const [loading, setLoading] = useState(false); // Start true in real implementation
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchData();
    }, [timeFrame]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch from backend
            // Since we are frontend, we use relative path if proxied, or full URL
            const isLocal = window.location.hostname === 'localhost';
            const backendUrl = isLocal
                ? 'http://localhost:7860'
                : 'https://prismanotes-autostream-worker.hf.space';

            const res = await fetch(`${backendUrl}/analytics/summary?time_frame=${timeFrame}`);
            if (!res.ok) throw new Error("Failed to fetch analytics");
            const json = await res.json();
            setData(json);
        } catch (err) {
            console.error(err);
            setError("Could not load analytics data.");
        } finally {
            setLoading(false);
        }
    };

    if (loading && !data) return <div className="p-10 text-center text-slate-400">Loading Analytics...</div>;
    if (error) return <div className="p-10 text-center text-red-400">{error}</div>;

    const stats = data?.stats || { views: 0, subscribers: 0, videos: 0 };
    const history = data?.history || [];

    return (
        <div className="flex-1 bg-slate-50 p-8 overflow-y-auto h-full">
            <header className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Performance metrics for <span className="font-semibold text-blue-600">{data?.channel_title || 'Connected Channel'}</span>
                        {!data?.connected && <span className="ml-2 text-red-500 text-xs bg-red-100 px-2 py-0.5 rounded-full">Not Connected</span>}
                    </p>
                </div>
                <TimeFrameSelector current={timeFrame} onChange={setTimeFrame} />
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard label="Total Views" value={stats.views.toLocaleString()} icon={Users} color="bg-blue-500" />
                <StatCard label="Subscribers" value={stats.subscribers.toLocaleString()} icon={Users} color="bg-purple-500" />
                <StatCard label="Videos Published" value={stats.videos} icon={Video} color="bg-green-500" />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-6">Views Growth</h3>
                    <SimpleLineChart data={history} />
                </div>
            </div>
        </div>
    );
}
