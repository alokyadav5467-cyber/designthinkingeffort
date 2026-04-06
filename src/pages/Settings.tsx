import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { AllowedSite, UserSettings } from '../types';

export function Settings() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [allowedSites, setAllowedSites] = useState<AllowedSite[]>([]);
  const [newDomain, setNewDomain] = useState('');
  const [newCategory, setNewCategory] = useState('general');

  useEffect(() => {
    loadSettings();
    loadAllowedSites();
  }, []);

  const loadSettings = async () => {
    const { data } = await supabase
      .from('user_settings')
      .select('*')
      .maybeSingle();

    if (data) {
      setSettings(data);
    }
  };

  const loadAllowedSites = async () => {
    const { data } = await supabase
      .from('allowed_sites')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setAllowedSites(data);
    }
  };

  const updateSettings = async (updates: Partial<UserSettings>) => {
    if (!settings) return;

    const { data } = await supabase
      .from('user_settings')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', settings.id)
      .select()
      .single();

    if (data) {
      setSettings(data);
    }
  };

  const addAllowedSite = async () => {
    if (!newDomain.trim()) return;

    const { data } = await supabase
      .from('allowed_sites')
      .insert({
        domain: newDomain.trim(),
        category: newCategory,
      })
      .select()
      .single();

    if (data) {
      setAllowedSites([data, ...allowedSites]);
      setNewDomain('');
      setNewCategory('general');
    }
  };

  const removeAllowedSite = async (id: string) => {
    await supabase
      .from('allowed_sites')
      .delete()
      .eq('id', id);

    setAllowedSites(allowedSites.filter(site => site.id !== id));
  };

  if (!settings) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-400">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Settings</h1>
        <p className="text-gray-400">Configure your tracking preferences</p>
      </div>

      <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700 rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-white mb-6">Detection Thresholds</h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Idle Threshold (seconds)
            </label>
            <input
              type="number"
              value={settings.idle_threshold_seconds}
              onChange={(e) => updateSettings({ idle_threshold_seconds: parseInt(e.target.value) || 60 })}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
            <p className="text-xs text-gray-500 mt-1">
              Time without activity before marking as idle
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Distraction Threshold (tab switches)
            </label>
            <input
              type="number"
              value={settings.distraction_threshold}
              onChange={(e) => updateSettings({ distraction_threshold: parseInt(e.target.value) || 4 })}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
            <p className="text-xs text-gray-500 mt-1">
              Number of tab switches before triggering interruption modal
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Focus Block Duration (minutes)
            </label>
            <input
              type="number"
              value={settings.focus_block_minutes}
              onChange={(e) => updateSettings({ focus_block_minutes: parseInt(e.target.value) || 3 })}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
            <p className="text-xs text-gray-500 mt-1">
              Minimum continuous time to classify as focused work
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700 rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-white mb-6">Allowed Study Sites</h2>
        <p className="text-gray-400 text-sm mb-6">
          Add domains that should be considered productive. When visiting these sites during a session,
          they'll be marked as focus time rather than distraction.
        </p>

        <div className="flex gap-3 mb-6">
          <input
            type="text"
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value)}
            placeholder="e.g., github.com"
            className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
          >
            <option value="general">General</option>
            <option value="coding">Coding</option>
            <option value="research">Research</option>
            <option value="learning">Learning</option>
            <option value="productivity">Productivity</option>
          </select>
          <button
            onClick={addAllowedSite}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-xl transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add
          </button>
        </div>

        <div className="space-y-2">
          {allowedSites.map((site) => (
            <div
              key={site.id}
              className="flex items-center justify-between p-4 bg-gray-800/50 border border-gray-700 rounded-xl hover:bg-gray-800/70 transition-colors"
            >
              <div>
                <p className="text-white font-medium">{site.domain}</p>
                <p className="text-sm text-gray-400">{site.category}</p>
              </div>
              <button
                onClick={() => removeAllowedSite(site.id)}
                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-600/20 rounded-lg transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>

        {allowedSites.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No allowed sites configured yet
          </div>
        )}
      </div>

      <div className="bg-gradient-to-br from-blue-600/10 to-cyan-600/10 border border-blue-500/20 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-2">About Data Storage</h3>
        <p className="text-gray-400 text-sm leading-relaxed">
          All session data is stored securely in your Supabase database. Your behavioral tracking data
          never leaves your control and is only used to generate insights for your own productivity analysis.
        </p>
      </div>
    </div>
  );
}
