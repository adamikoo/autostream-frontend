import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { Calendar, Clock, CheckCircle, AlertCircle, Loader } from 'lucide-react';

export default function Schedule() {
    const [queue, setQueue] = useState([]);
    const [bots, setBots] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSchedule();
    }, []);

    const fetchSchedule = async () => {
        try {
            // Fetch Queue
            const { data: qData, error: qError } = await supabase
                .from('content_queue')
                .select('*, niche_profiles(topic)')
                .order('created_at', { ascending: false })
                .limit(20);

            if (qData) setQueue(qData);

            // Fetch Active Bots
            const { data: bData, error: bError } = await supabase
                .from('niche_profiles')
                .select('*')
                .eq('is_active', true);

            if (bData) setBots(bData);

        } catch (error) {
            console.error("Error fetching schedule:", error);
        } finally {
            setLoading(false);
        }
    };

    const generateProjectedSchedule = (activeBots) => {
        const projection = [];
        const days = 7;
        const now = new Date();

        activeBots.forEach(bot => {
            const count = bot.schedule_config?.videos_per_day || 1;
            // Simple logic: distribute evenly or use fixed times if we had them
            // For now, let's assume 18:00 daily + others if count > 1
            for (let d = 0; d < days; d++) {
                const date = new Date(now);
                date.setDate(date.getDate() + d);

                for (let i = 0; i < count; i++) {
                    // Offset hours to spread them out (e.g. 10am, 2pm, 6pm)
                    // Base at 10am
                    const hour = 10 + (Math.floor(12 / Math.max(count, 1)) * i);
                    date.setHours(hour, 0, 0, 0);

                    // Skip past times today
                    if (date < now) continue;

                    projection.push({
                        id: `proj-${bot.id}-${d}-${i}`,
                        title: `(Scheduled) ${bot.topic} Video #${i + 1}`,
                        niche_profiles: { topic: bot.topic },
                        status: 'scheduled_future',
                        platforms_destinations: bot.target_platforms || ['tiktok'],
                        created_at: date.toISOString(), // treating created_at as scheduled_time for sorting
                        is_projection: true
                    });
                }
            }
        });
        return projection;
    };

    const combinedQueue = [...queue, ...generateProjectedSchedule(bots)].sort((a, b) =>
        new Date(b.created_at) - new Date(a.created_at) // Actually we want Future first? 
        // User wants "scheduled for a week forward", implying a timeline.
        // Let's sort Descending (newest/furthest future at top)? Or Ascending (soonest next)?
        // Usually schedule is "What's coming next". 
        // Let's stick to Descending (Standard for feeds) but maybe "Agenda" style is better?
        // Let's keep existing order (created_at desc) which means Future items are at the TOP.
    ).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); // Future dates > Past dates.

    const getStatusColor = (status) => {
        switch (status) {
            case 'done': return 'text-green-400 border-green-400/30 bg-green-400/10';
            case 'item_posted': return 'text-purple-400 border-purple-400/30 bg-purple-400/10';
            case 'scripting': return 'text-blue-400 border-blue-400/30 bg-blue-400/10';
            case 'generating_video': return 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10';
            case 'failed': return 'text-red-400 border-red-400/30 bg-red-400/10';
            case 'scheduled_future': return 'text-slate-500 border-slate-700 bg-slate-800/50 border-dashed';
            default: return 'text-slate-400 border-slate-700 bg-slate-800';
        }
    };

    return (
        <div className="h-full overflow-y-auto p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <header>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                        Content Schedule
                    </h1>
                    <p className="text-slate-400">Monitor your automated publishing timeline.</p>
                </header>

                {/* Active Bots Section */}
                <section className="space-y-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Clock size={20} className="text-blue-400" /> Auto-Pilot Bots
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {bots.map(bot => (
                            <div key={bot.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative overflow-hidden text-white">
                                <div className="absolute top-0 right-0 p-3 opacity-10">
                                    <Clock size={60} />
                                </div>
                                <h3 className="font-bold text-lg mb-1 text-white">{bot.topic}</h3>
                                <div className="text-sm text-slate-400 mb-4">
                                    {(bot.schedule_config?.videos_per_day || 1)} uploads / day
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <span>Total Run: {bot.last_run_at ? new Date(bot.last_run_at).toLocaleString() : 'Never'}</span>
                                </div>
                                <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-green-500 animate-pulse box-shadow-green"></div>
                            </div>
                        ))}
                        {bots.length === 0 && !loading && (
                            <div className="p-8 border border-slate-800 border-dashed rounded-xl text-center text-slate-500">
                                No active bots found. Go to Dashboard to activate one.
                            </div>
                        )}
                    </div>
                </section>

                {/* Queue List */}
                <section className="space-y-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Calendar size={20} className="text-purple-400" /> Production Queue & Forecast
                    </h2>

                    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-950/50 border-b border-slate-800 text-xs uppercase tracking-wider text-slate-500">
                                    <th className="p-4">Topic / Title</th>
                                    <th className="p-4">Niche</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Platform</th>
                                    <th className="p-4">Scheduled / Created</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {combinedQueue.map(item => (
                                    <tr key={item.id} className={`hover:bg-slate-800/50 transition-colors ${item.is_projection ? 'opacity-60' : ''}`}>
                                        <td className="p-4 font-medium text-slate-200">
                                            {item.title || "Untitled Video"}
                                            {item.video_url && (
                                                <a href={item.video_url} target="_blank" rel="noreferrer" className="ml-2 text-xs text-blue-400 hover:underline">
                                                    (View)
                                                </a>
                                            )}
                                        </td>
                                        <td className="p-4 text-slate-400 text-sm">
                                            {item.niche_profiles?.topic || "Unknown"}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                                                {item.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="p-4 flex gap-2">
                                            {item.platforms_destinations?.map(p => (
                                                <span key={p} className="text-xs uppercase bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">{p[0]}</span>
                                            ))}
                                        </td>
                                        <td className="p-4 text-sm text-slate-500">
                                            {item.is_projection ? 'Approx: ' : ''}{new Date(item.created_at).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                                {combinedQueue.length === 0 && !loading && (
                                    <tr>
                                        <td colSpan="5" className="p-8 text-center text-slate-500">Queue is empty.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </div>
    );
}
