'use client';

import { useState, useEffect } from 'react';

interface GameResult {
  username: string;
  totalScore: number;
  roundScores: number[];
  networkPrivilege: boolean;
  opportunityPrivilege: boolean;
  videoGameFrequency: string;
  timestamp: string;
}

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [results, setResults] = useState<GameResult[]>([]);
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    if (password === 'Eniola') {
      setIsAuthenticated(true);
      loadResults();
    } else {
      alert('Incorrect password');
    }
  };

  const loadResults = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/results');
      const data = await response.json();
      setResults(data.results || []);
    } catch (error) {
      console.error('Error loading results:', error);
    }
    setLoading(false);
  };

  const clearResults = async () => {
    if (confirm('Are you sure you want to clear all results?')) {
      try {
        await fetch('/api/results', { method: 'DELETE' });
        setResults([]);
      } catch (error) {
        console.error('Error clearing results:', error);
      }
    }
  };

  // Calculate statistics
  const stats = {
    total: results.length,
    withNetwork: results.filter(r => r.networkPrivilege).length,
    withOpportunity: results.filter(r => r.opportunityPrivilege).length,
    withBoth: results.filter(r => r.networkPrivilege && r.opportunityPrivilege).length,
    withNeither: results.filter(r => !r.networkPrivilege && !r.opportunityPrivilege).length,
  };

  const avgScores = {
    withNetwork: results.filter(r => r.networkPrivilege).reduce((sum, r) => sum + r.totalScore, 0) / (stats.withNetwork || 1),
    withOpportunity: results.filter(r => r.opportunityPrivilege).reduce((sum, r) => sum + r.totalScore, 0) / (stats.withOpportunity || 1),
    withBoth: results.filter(r => r.networkPrivilege && r.opportunityPrivilege).reduce((sum, r) => sum + r.totalScore, 0) / (stats.withBoth || 1),
    withNeither: results.filter(r => !r.networkPrivilege && !r.opportunityPrivilege).reduce((sum, r) => sum + r.totalScore, 0) / (stats.withNeither || 1),
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="backdrop-blur-xl bg-zinc-900/90 rounded-2xl border border-zinc-800 shadow-2xl p-8 max-w-md w-full">
          <h1 className="text-3xl font-bold text-white mb-6">Admin Login</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            placeholder="Enter password"
            className="w-full bg-zinc-800 border border-zinc-700 text-white px-4 py-3 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">Admin Dashboard</h1>
          <div className="flex gap-4">
            <button
              onClick={loadResults}
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Refresh
            </button>
            <button
              onClick={clearResults}
              className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-white text-center py-12">Loading...</div>
        ) : (
          <>
            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                <h3 className="text-zinc-400 text-sm mb-2">Total Players</h3>
                <p className="text-3xl font-bold text-white">{stats.total}</p>
              </div>
              
              <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-6">
                <h3 className="text-blue-300 text-sm mb-2">Network Privilege ('a')</h3>
                <p className="text-3xl font-bold text-white">{stats.withNetwork}</p>
                <p className="text-sm text-zinc-400 mt-2">Avg: {Math.round(avgScores.withNetwork)}</p>
              </div>

              <div className="bg-green-900/20 border border-green-700 rounded-lg p-6">
                <h3 className="text-green-300 text-sm mb-2">Opportunity Privilege (number)</h3>
                <p className="text-3xl font-bold text-white">{stats.withOpportunity}</p>
                <p className="text-sm text-zinc-400 mt-2">Avg: {Math.round(avgScores.withOpportunity)}</p>
              </div>

              <div className="bg-purple-900/20 border border-purple-700 rounded-lg p-6">
                <h3 className="text-purple-300 text-sm mb-2">Both Privileges</h3>
                <p className="text-3xl font-bold text-white">{stats.withBoth}</p>
                <p className="text-sm text-zinc-400 mt-2">Avg: {Math.round(avgScores.withBoth)}</p>
              </div>
            </div>

            <div className="bg-red-900/20 border border-red-700 rounded-lg p-6 mb-8">
              <h3 className="text-red-300 text-sm mb-2">No Privileges</h3>
              <p className="text-3xl font-bold text-white">{stats.withNeither}</p>
              <p className="text-sm text-zinc-400 mt-2">Avg: {Math.round(avgScores.withNeither)}</p>
            </div>

            {/* Results Table */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-zinc-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">Username</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">Total Score</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">Round Scores</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">Network ('a')</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">Opportunity (number)</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">Frequency</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {results.map((result, index) => (
                      <tr key={index} className="hover:bg-zinc-800/50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{result.username}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-white">{result.totalScore}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">{result.roundScores.join(', ')}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {result.networkPrivilege ? (
                            <span className="text-green-400">✓ Yes</span>
                          ) : (
                            <span className="text-red-400">✗ No</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {result.opportunityPrivilege ? (
                            <span className="text-green-400">✓ Yes</span>
                          ) : (
                            <span className="text-red-400">✗ No</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">{result.videoGameFrequency}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-400">{new Date(result.timestamp).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {results.length === 0 && (
              <div className="text-center text-zinc-400 py-12">
                No results yet. Players will appear here after completing the game.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
