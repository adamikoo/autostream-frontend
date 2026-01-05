
import React, { useState } from 'react';
import { Lock } from 'lucide-react';

export default function Login({ onLogin }) {
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        const correctPassword = import.meta.env.VITE_APP_PASSWORD;

        // Fallback if env not set for some reason to avoid locking everyone out forever in dev
        // But in prod it should be set.
        if (!correctPassword) {
            console.warn("VITE_APP_PASSWORD not set!");
        }

        if (password === correctPassword) {
            onLogin();
        } else {
            setError(true);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-900 px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-100 p-8 flex flex-col items-center">
                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                        <Lock size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">Restricted Access</h2>
                    <p className="text-slate-500 text-sm mt-2">Please enter the access code to continue.</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-4">
                    <div>
                        <input
                            autoFocus
                            type="password"
                            value={password}
                            onChange={(e) => { setPassword(e.target.value); setError(false); }}
                            placeholder="Enter Password..."
                            className={`w-full p-4 rounded-xl bg-slate-50 border outline-none transition-all ${error ? 'border-red-300 bg-red-50 text-red-900 placeholder-red-300' : 'border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'}`}
                        />
                        {error && <p className="text-red-500 text-xs mt-2 ml-1">Incorrect password. Please try again.</p>}
                    </div>

                    <button
                        type="submit"
                        className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl active:scale-[0.98] transition-all hover:bg-slate-800"
                    >
                        Unlock Dashboard
                    </button>
                </form>

                <div className="bg-slate-50 p-4 text-center text-xs text-slate-400 border-t border-slate-100">
                    Protected System • AutoStream v2.0
                </div>
            </div>
        </div>
    );
}
