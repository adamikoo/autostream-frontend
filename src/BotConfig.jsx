import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { Settings, Play, Pause, Clock, Share2, Youtube, Instagram } from 'lucide-react';

const TikTokIcon = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" /></svg>
);

export default function BotConfig({ nicheId, onClose }) {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [connections, setConnections] = useState({});

    // Config State
    const [isActive, setIsActive] = useState(false);
    const [postsPerDay, setPostsPerDay] = useState(1);
    const [targetPlatforms, setTargetPlatforms] = useState(['tiktok']);

    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://prismanotes-autostream-worker.hf.space";
    // Use user's Space URL or localhost fallback. 
    // Ideally this should be dynamic or set in Vercel env.
    // We can also fetch it from `supabase` if we stored it, but env is better.
    // For now, hardcode the one we know or use a default.

    useEffect(() => {
        fetchProfile();
        fetchConnections();
    }, [nicheId]);

    const fetchProfile = async () => {
        if (!nicheId) return;
        const { data } = await supabase.from('niche_profiles').select('*').eq('id', nicheId).single();
        if (data) {
            setProfile(data);
            setIsActive(data.is_active || false);
            setPostsPerDay(data.schedule_config?.videos_per_day || 1);
            setTargetPlatforms(data.target_platforms || ['tiktok']);
        }
        setLoading(false);
    };

    const fetchConnections = async () => {
        // In a real app with auth, we filter by user_id
        // Here we grab all connections for the demo user
        // Assuming single tenant for MVP
        const { data } = await supabase.from('social_connections').select('platform, account_name');
        if (data) {
            const map = {};
            data.forEach(c => map[c.platform] = c.account_name || 'Connected');
            setConnections(map);
        }
    };

    const saveConfig = async () => {
        await supabase.from('niche_profiles').update({
            is_active: isActive,
            schedule_config: { videos_per_day: postsPerDay, post_times: ["18:00"] }, // Simplified
            target_platforms: targetPlatforms
        }).eq('id', nicheId);
        onClose();
    };

    const handleAuth = (platform) => {
        // Redirect to Backend Auth
        const url = `${BACKEND_URL}/auth/${platform}/login`;
        window.open(url, '_blank', 'width=600,height=700');
    };

    if (loading) return <div className="p-6 text-center">Loading Config...</div>;

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden flex flex-col h-full">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isActive ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-500'}`}>
                        {isActive ? <Play size={20} fill="currentColor" /> : <Pause size={20} fill="currentColor" />}
                    </div>
                    <div>
                        <h2 className="font-bold text-lg text-slate-800">Bot Automation</h2>
                        <p className="text-xs text-slate-500 font-mono uppercase">{profile?.topic}</p>
                    </div>
                </div>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-800">Close</button>
            </div>

            <div className="p-6 space-y-8 overflow-y-auto flex-1">

                {/* Switch */}
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div>
                        <h3 className="font-bold text-slate-700">Auto-Pilot Mode</h3>
                        <p className="text-sm text-slate-500">Automatically generate and post unique videos.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="sr-only peer" />
                        <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>

                {/* Schedule */}
                <div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                        <Clock size={16} /> Schedule
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 border rounded-lg hover:border-blue-400 transition-colors cursor-pointer bg-white">
                            <span className="block text-xs text-slate-500">Frequency</span>
                            <select
                                value={postsPerDay}
                                onChange={(e) => setPostsPerDay(parseInt(e.target.value))}
                                className="w-full mt-1 font-bold text-lg bg-transparent outline-none"
                            >
                                <option value={1}>1 Video / Day</option>
                                <option value={2}>2 Videos / Day</option>
                                <option value={3}>3 Videos / Day</option>
                            </select>
                        </div>
                        {/* Visualizer (Mock) */}
                        <div className="p-3 border rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 text-sm">
                            Next post: Today 18:00
                        </div>
                    </div>
                </div>

                {/* Connections */}
                <div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                        <Share2 size={16} /> Connected Accounts
                    </h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-black text-white rounded-lg"><TikTokIcon className="w-5 h-5" /></div>
                                <span className="font-medium">TikTok</span>
                            </div>
                            {connections.tiktok ? (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold">Connected</span>
                            ) : (
                                <button onClick={() => handleAuth('tiktok')} className="text-sm bg-black text-white px-3 py-1.5 rounded-lg hover:opacity-80">Connect</button>
                            )}
                        </div>

                        <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-600 text-white rounded-lg"><Youtube size={20} /></div>
                                <span className="font-medium">YouTube Shorts</span>
                            </div>
                            {connections.youtube ? (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold">Connected</span>
                            ) : (
                                <button onClick={() => handleAuth('youtube')} className="text-sm bg-red-600 text-white px-3 py-1.5 rounded-lg hover:opacity-80">Connect</button>
                            )}
                        </div>
                    </div>
                </div>

            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-200">
                <button onClick={saveConfig} className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold shadow-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                    Save Configuration
                </button>
            </div>
        </div>
    );
}
