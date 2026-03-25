'use client';

import { useState } from 'react';

export default function InviteSection({ goatId, t }: { goatId: string, t: any }) {
  const [hours, setHours] = useState(1);
  const [gens, setGens] = useState(2);
  const [link, setLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/goats/${goatId}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hours, gens })
      });
      const data = await res.json();
      if (data.url) {
        setLink(data.url);
      }
    } catch (error) {
      console.error('Failed to generate link:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!link) return;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-gray-100 mt-8">
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">
            {t.goats.shareInvite}
          </label>
          <input
            type="number"
            min="1"
            max="720"
            value={hours}
            onChange={(e) => setHours(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full h-[42px] bg-white border border-gray-100 rounded-lg px-4 text-[11px] font-black text-[#491907] focus:ring-2 focus:ring-[#491907]/5 outline-none transition-all"
          />
        </div>
        <div className="flex-1">
          <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">
            {t.goats.generations}
          </label>
          <input
            type="number"
            min="1"
            max="8"
            value={gens}
            onChange={(e) => setGens(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full h-[42px] bg-white border border-gray-100 rounded-lg px-4 text-[11px] font-black text-[#491907] focus:ring-2 focus:ring-[#491907]/5 outline-none transition-all"
          />
        </div>
      </div>

      <div className="relative">
        <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">
          {t.goats.inviteLink}
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1 group">
            <input
              type="text"
              readOnly
              value={link}
              placeholder={t.goats.linkPlaceholder}
              className="w-full h-[42px] bg-gray-50/50 border border-gray-100 rounded-lg px-4 text-[10px] font-bold text-[#491907]/60 outline-none pr-10 overflow-hidden"
            />
            {link && (
              <button 
                onClick={copyToClipboard}
                title="Copy link"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-white rounded-md transition-colors text-gray-400 hover:text-[#491907]"
              >
                {copied ? (
                   <svg className="w-3.5 h-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                ) : (
                   <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                )}
              </button>
            )}
          </div>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="h-[42px] px-8 bg-[#491907] text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {loading ? '...' : t.goats.generate}
          </button>
        </div>
      </div>
    </div>
  );
}
