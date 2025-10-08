'use client';

import { useState } from 'react';
import { PlayerData } from './types';
import { detectPrivileges } from './utils';
import Instructions from './components/Instructions';
import Game from './components/Game';

export default function Home() {
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [username, setUsername] = useState('');
  const [frequency, setFrequency] = useState<'often' | 'sometimes' | 'rarely'>('sometimes');

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    const privileges = detectPrivileges(username);
    const newPlayerData: PlayerData = {
      username,
      videoGameFrequency: frequency,
      privileges: {
        ...privileges,
        hasPracticed: false,
        superSkills: false,
        hasSlowButton: false,
        slowButtonUsed: false,
      },
      scores: [],
    };

    setPlayerData(newPlayerData);
    setShowInstructions(true);
  };

  const handleInstructionsComplete = () => {
    setShowInstructions(false);
  };

  if (!playerData) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black"></div>
        <div className="relative max-w-md w-full">
          <div className="backdrop-blur-xl bg-zinc-900/80 rounded-2xl border border-zinc-800 shadow-2xl p-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tight text-white">
                  Balloon Pop
                </h1>
                <p className="text-zinc-400 text-base">
                  Test your reflexes in this fast-paced game
                </p>
              </div>

              <form onSubmit={handleStart} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="username" className="block text-sm font-medium text-zinc-200">
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-zinc-500 transition-all"
                    placeholder="Enter your username"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-zinc-200">
                    How often do you play video games?
                  </label>
                  <div className="space-y-2">
                    {(['often', 'sometimes', 'rarely'] as const).map((option) => (
                      <label key={option} className="flex items-center space-x-3 cursor-pointer group p-3 rounded-lg hover:bg-zinc-800/50 transition-colors">
                        <input
                          type="radio"
                          name="frequency"
                          value={option}
                          checked={frequency === option}
                          onChange={(e) => setFrequency(e.target.value as typeof option)}
                          className="w-4 h-4 text-blue-500 bg-zinc-700 border-zinc-600 focus:ring-blue-500 focus:ring-offset-zinc-900"
                        />
                        <span className="text-zinc-300 capitalize group-hover:text-white transition-colors">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
                >
                  Start Game
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (showInstructions) {
    return <Instructions playerData={playerData} onComplete={handleInstructionsComplete} />;
  }

  return <Game playerData={playerData} setPlayerData={setPlayerData} />;
}

