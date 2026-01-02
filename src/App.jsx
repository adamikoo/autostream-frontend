import React, { useState, useEffect } from 'react';
import BotConfig from './BotConfig';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Schedule from './pages/Schedule';
import Overview from './pages/Overview';
import Login from './pages/Login';
import { supabase } from './supabase';
import {
  Plus,
  Play,
  FileText,
  Video,
  Type,
  UploadCloud,
  Trash2,
  RefreshCw,
  CheckCircle,
  Layout,
  Terminal,
  Youtube,
  Instagram,
  Search,
  MoreVertical,
  Activity,
  Layers,
  ChevronRight,
  Clock,
  Calendar,
  TrendingUp
} from 'lucide-react';

// --- Constants ---
const STATUS_STEPS = {
  DRAFT: { id: 'draft', label: 'Idea', icon: Layout, color: 'bg-slate-100 text-slate-600 border-slate-200' },
  SCRIPTING: { id: 'scripting', label: 'Scripting', icon: FileText, color: 'bg-blue-50 text-blue-600 border-blue-200' },
  GENERATING_VIDEO: { id: 'generating_video', label: 'Generating', icon: Video, color: 'bg-purple-50 text-purple-600 border-purple-200' },
  DONE: { id: 'done', label: 'Published', icon: CheckCircle, color: 'bg-green-50 text-green-600 border-green-200' },
  FAILED: { id: 'failed', label: 'Failed', icon: Activity, color: 'bg-red-50 text-red-600 border-red-200' },
};

const NICHES = [
  { id: 'tech', label: 'Tech News', color: 'bg-blue-500' },
  { id: 'motivation', label: 'Motivation', color: 'bg-yellow-500' },
  { id: 'finance', label: 'Finance', color: 'bg-green-500' },
  { id: 'facts', label: 'Fun Facts', color: 'bg-purple-500' },
];

const PLATFORMS = [
  { id: 'youtube', label: 'YouTube', icon: Youtube, color: 'text-red-600' },
  { id: 'tiktok', label: 'TikTok', icon: ({ className }) => <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" /></svg>, color: 'text-black' },
  { id: 'instagram', label: 'Reels', icon: Instagram, color: 'text-pink-600' },
];

// --- Components ---
const StatusBadge = ({ status }) => {
  const s = status ? status.toUpperCase() : 'DRAFT';
  const config = STATUS_STEPS[s] || STATUS_STEPS.DRAFT;
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold border ${config.color}`}>
      <Icon size={12} className="mr-1.5" />
      {config.label}
    </span>
  );
};

// --- Main Application ---
export default function App() {
  // Simple Router
  const path = window.location.pathname;
  if (path === '/privacy') return <Privacy />;
  if (path === '/terms') return <Terms />;
  // For V1 Free Tier, we skip Auth logic and just use a hardcoded "Demo User"
  // In a real app, use supabase.auth.signUp()
  const [userId] = useState('demo-user-123');

  // --- Password Protection ---
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('app_authenticated') === 'true';
  });

  const handleLogin = () => {
    localStorage.setItem('app_authenticated', 'true');
    setIsAuthenticated(true);
  };

  // If not authenticated, show Login (and prevent access to rest)
  // Privacy/Terms are already handled above by checking "path"
  // MOVED CHECK DOWN to prevent "Rendered more hooks" error

  const [projects, setProjects] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' or 'logs'
  const [selectedProject, setSelectedProject] = useState(null);
  const [inspectorTab, setInspectorTab] = useState('overview'); // 'overview', 'script', 'simulate'
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [newTopic, setNewTopic] = useState('');
  const [newNiche, setNewNiche] = useState(NICHES[0].id);

  // Logs
  const [logs, setLogs] = useState([]);

  // --- Data Loading & Realtime ---
  useEffect(() => {
    // 1. Initial Load
    const fetchProjects = async () => {
      const { data, error } = await supabase
        .from('content_queue')
        .select(`
  *,
  niche_profiles(topic, visual_style)
    `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching projects:", error);
        // Do not clear projects on error to prevent UI flickering/disappearing
      } else {
        setProjects(data || []);
      }
    };
    fetchProjects();

    // 2. Realtime Subscription
    const channel = supabase
      .channel('public:content_queue')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'content_queue' }, (payload) => {
        console.log('Change received!', payload);
        // Simple refresh strategy for now
        fetchProjects();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // --- Backend Health Check ---
  const [isBackendOnline, setIsBackendOnline] = useState(false);
  useEffect(() => {
    const checkHealth = async () => {
      try {
        // Try local if needed, but per request checking HF Space
        const res = await fetch('https://prismanotes-autostream-worker.hf.space/health');
        if (res.ok) setIsBackendOnline(true);
        else setIsBackendOnline(false);
      } catch (e) {
        setIsBackendOnline(false);
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  // --- Actions ---
  const addLog = (source, message, type = 'info') => {
    setLogs(prev => [{ id: Date.now(), timestamp: new Date().toLocaleTimeString(), source, message, type }, ...prev].slice(0, 50));
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newTopic.trim()) return;

    try {
      // 1. Create User if not exists (Lazy init)
      // In real app, this happens at signup.
      // check user
      const { data: userCheck } = await supabase.from('users').select('id').eq('email', 'demo@example.com').single();
      let realUserId = userCheck?.id;

      if (!realUserId) {
        const { data: newUser } = await supabase.from('users').insert({ email: 'demo@example.com' }).select().single();
        realUserId = newUser.id;
      }

      // 2. Create Niche Profile
      const { data: niche } = await supabase.from('niche_profiles').insert({
        user_id: realUserId,
        topic: NICHES.find(n => n.id === newNiche)?.label || 'General',
        tone: 'Hype'
      }).select().single();

      // 3. Create Queue Item
      const { data: project, error } = await supabase.from('content_queue').insert({
        user_id: realUserId,
        niche_id: niche.id,
        title: newTopic, // Stored as title in our schema
        status: 'draft',
        platforms_destinations: ['tiktok', 'youtube']
      }).select().single();

      if (error) throw error;

      addLog("User", `Created project: ${newTopic} `);
      setNewTopic('');
      setIsNewProjectModalOpen(false);

      // Auto select
      const fullProject = { ...project, niche_profiles: niche };
      setSelectedProject(fullProject);
      setProjects(prev => [fullProject, ...prev]);

    } catch (error) {
      console.error(error);
      alert("Error: " + error.message);
    }
  };

  const updateProject = async (updates) => {
    if (!selectedProject) return;
    try {
      await supabase.from('content_queue').update(updates).eq('id', selectedProject.id);
      // Local update (optimistic)
      setSelectedProject(prev => ({ ...prev, ...updates }));
    } catch (error) {
      console.error(error);
    }
  };

  const deleteProject = async (id) => {
    if (!confirm("Are you sure?")) return;
    try {
      await supabase.from('content_queue').delete().eq('id', id);
      if (selectedProject?.id === id) setSelectedProject(null);
    } catch (error) {
      console.error(error);
    }
  };

  const runSimulation = async () => {
    if (!selectedProject) return;
    // Trigger backend
    await updateProject({ status: 'scripting' });
    addLog("System", "Job sent to Viral Engine...");
  };

  // --- Filtering ---
  const filteredProjects = projects.filter(p =>
    (p.title || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderContent = () => {
    if (activeTab === 'overview') return <Overview />;
    if (activeTab === 'schedule') return <Schedule />;
    if (activeTab === 'logs') return (
      <div className="flex-1 bg-slate-900 p-8 overflow-auto font-mono text-sm">
        <div className="space-y-3">
          {logs.map(log => (
            <div key={log.id} className="flex gap-4 p-3 rounded hover:bg-white/5 transition-colors">
              <span className="text-slate-500">{log.timestamp}</span>
              <span className="font-bold text-purple-400">{log.source}</span>
              <span className="text-slate-300">{log.message}</span>
            </div>
          ))}
        </div>
      </div>
    );
    // Default: Dashboard
    return (
      <div className="flex h-full">

        {/* List Panel */}
        <div className="w-80 lg:w-96 border-r border-slate-200 bg-slate-50 flex flex-col h-full">
          <div className="p-4 border-b border-slate-200 bg-white sticky top-0 z-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-800">Projects</h2>
              <button onClick={() => setIsNewProjectModalOpen(true)} className="p-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors">
                <Plus size={18} />
              </button>
            </div>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm outline-none" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {filteredProjects.map(project => (
              <div key={project.id} onClick={() => { setSelectedProject(project); setInspectorTab('overview'); }} className={`group relative p-4 rounded-xl border transition-all cursor-pointer ${selectedProject?.id === project.id ? 'bg-white border-blue-500 shadow-md' : 'bg-white border-slate-200 hover:border-blue-300'}`}>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded text-white bg-blue-500">
                    {project.niche_profiles?.topic || 'General'}
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date(project.created_at).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-slate-800 mb-3 line-clamp-2">{project.title}</h3>
                <div className="flex items-center justify-between">
                  <StatusBadge status={project.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex-1 bg-white flex flex-col h-full overflow-hidden relative">
          {selectedProject ? (
            <>
              <header className="h-16 border-b border-slate-100 flex items-center justify-between px-6 bg-white shrink-0">
                <h2 className="text-lg font-bold text-slate-800 truncate">{selectedProject.title}</h2>
                <button onClick={() => deleteProject(selectedProject.id)} className="p-2 text-slate-400 hover:text-red-600">
                  <Trash2 size={18} />
                </button>
              </header>

              {/* Internal Tabs */}
              <div className="px-6 border-b border-slate-100 flex gap-6 text-sm font-medium text-slate-500 shrink-0">
                <button onClick={() => setInspectorTab('overview')} className={`py-3 border-b-2 transition-colors ${inspectorTab === 'overview' ? 'text-blue-600 border-blue-600' : 'border-transparent'}`}>Overview</button>
                <button onClick={() => setInspectorTab('script')} className={`py-3 border-b-2 transition-colors ${inspectorTab === 'script' ? 'text-blue-600 border-blue-600' : 'border-transparent'}`}>Script</button>
                <button onClick={() => setInspectorTab('simulate')} className={`py-3 border-b-2 transition-colors ${inspectorTab === 'simulate' ? 'text-purple-600 border-purple-600' : 'border-transparent'}`}>Auto-Runner</button>
                <button onClick={() => setInspectorTab('bot')} className={`py-3 border-b-2 transition-colors ${inspectorTab === 'bot' ? 'text-green-600 border-green-600' : 'border-transparent'}`}>Bot Config</button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                {inspectorTab === 'overview' && (
                  <div className="grid grid-cols-1 gap-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Current Status</h4>
                      <div className="flex items-center gap-4">
                        <StatusBadge status={selectedProject.status} />
                        {selectedProject.video_url && (
                          <a href={selectedProject.video_url} target="_blank" className="text-blue-600 underline text-sm">Download Video</a>
                        )}
                      </div>
                      {selectedProject.error_log && (
                        <div className="mt-4 p-3 bg-red-50 text-red-600 text-xs font-mono rounded-lg">
                          {selectedProject.error_log}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {inspectorTab === 'script' && (
                  <div className="h-full flex flex-col">
                    <div className="flex-1 bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col">
                      <textarea
                        value={selectedProject.script_body || ''}
                        onChange={(e) => updateProject({ script_body: e.target.value })}
                        placeholder="Generated script..."
                        className="flex-1 p-6 w-full resize-none outline-none font-mono text-sm leading-relaxed"
                      />
                    </div>
                  </div>
                )}

                {inspectorTab === 'simulate' && (
                  <div className="flex flex-col items-center justify-center py-10">
                    <div className="text-center max-w-sm mb-8">
                      <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4"><Activity size={32} /></div>
                      <h3 className="text-lg font-bold text-slate-800 mb-2">Autonomous Agent Runner</h3>
                      <p className="text-sm text-slate-500">Click start to trigger the backend engine.</p>
                    </div>
                    <button
                      onClick={runSimulation}
                      className="group relative flex items-center gap-3 bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-xl text-lg font-bold shadow-xl active:scale-95 transition-all"
                    >
                      {selectedProject.status === 'draft' ? 'Start Automation' : 'Restart Automation'}
                    </button>
                  </div>
                )}

                {inspectorTab === 'bot' && (
                  <div className="h-full">
                    <BotConfig nicheId={selectedProject.niche_id} onClose={() => setInspectorTab('overview')} />
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
              <div className="w-24 h-24 bg-slate-100 rounded-3xl flex items-center justify-center mb-6"><Layers size={48} className="text-slate-200" /></div>
              <h3 className="text-lg font-medium text-slate-500">No Project Selected</h3>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">

      {/* Sidebar Navigation */}
      <aside className="w-20 lg:w-64 bg-slate-900 flex flex-col border-r border-slate-800 transition-all duration-300">
        <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-slate-800">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <RefreshCw size={18} />
          </div>
          <span className="ml-3 font-bold text-white hidden lg:block tracking-tight">AutoStream <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded text-white/80 font-mono">v2.0</span></span>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center justify-center lg:justify-start gap-3 px-3 py-3 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-blue-600/10 text-blue-400' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
          >
            <Layout size={20} />
            <span className="hidden lg:block font-medium">Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center justify-center lg:justify-start gap-3 px-3 py-3 rounded-xl transition-all ${activeTab === 'overview' ? 'bg-blue-600/10 text-blue-400' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
          >
            <TrendingUp size={20} />
            <span className="hidden lg:block font-medium">Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('schedule')}
            className={`w-full flex items-center justify-center lg:justify-start gap-3 px-3 py-3 rounded-xl transition-all ${activeTab === 'schedule' ? 'bg-blue-600/10 text-blue-400' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
          >
            <Calendar size={20} />
            <span className="hidden lg:block font-medium">Schedule</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`w-full flex items-center justify-center lg:justify-start gap-3 px-3 py-3 rounded-xl transition-all ${activeTab === 'logs' ? 'bg-blue-600/10 text-blue-400' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
          >
            <Terminal size={20} />
            <span className="hidden lg:block font-medium">System Logs</span>
          </button>

          <div className="pt-4 mt-4 border-t border-slate-800">
            <a href="/privacy" className="w-full flex items-center justify-center lg:justify-start gap-3 px-3 py-2 rounded-xl text-slate-500 hover:bg-slate-800 hover:text-slate-300 transition-all text-xs">
              <FileText size={16} />
              <span className="hidden lg:block font-medium">Privacy Policy</span>
            </a>
            <a href="/terms" className="w-full flex items-center justify-center lg:justify-start gap-3 px-3 py-2 rounded-xl text-slate-500 hover:bg-slate-800 hover:text-slate-300 transition-all text-xs">
              <FileText size={16} />
              <span className="hidden lg:block font-medium">Terms of Service</span>
            </a>

            {/* Status Diode */}
            <div className="hidden lg:flex items-center gap-3 px-3 py-3 mt-2 text-xs text-slate-500">
              <div className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${isBackendOnline ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-slate-600'}`}></div>
              <span className="font-mono">{isBackendOnline ? 'SYSTEM ONLINE' : 'OFFLINE'}</span>
            </div>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-white">
        {!isAuthenticated ? (
          <Login onLogin={handleLogin} />
        ) : (
          <>
            {renderContent()}

            {/* Create Modal */}
            {isNewProjectModalOpen && (
              <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                  <form onSubmit={handleCreateProject} className="p-6 space-y-5">
                    <h3 className="text-xl font-bold">New Project</h3>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Topic</label>
                      <input autoFocus type="text" value={newTopic} onChange={(e) => setNewTopic(e.target.value)} className="w-full p-3 rounded-xl bg-slate-50 border-slate-200" />
                    </div>
                    <div className="flex gap-3 mt-8 pt-2">
                      <button type="button" onClick={() => setIsNewProjectModalOpen(false)} className="flex-1 py-3 text-slate-600 hover:bg-slate-100 rounded-xl">Cancel</button>
                      <button type="submit" className="flex-1 py-3 bg-slate-900 text-white font-bold rounded-xl">Create</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
