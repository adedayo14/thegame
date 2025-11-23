'use client';

import { useState } from 'react';

interface GameResult {
  id: number;
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
        loadResults();
      } catch (error) {
        console.error('Error clearing results:', error);
      }
    }
  };

  const deleteEntry = async (id: number) => {
    if (confirm('Delete this entry?')) {
      try {
        await fetch(`/api/results?id=${id}`, { method: 'DELETE' });
        loadResults();
      } catch (error) {
        console.error('Error deleting entry:', error);
      }
    }
  };

  const downloadCSV = () => {
    // Create CSV header
    const headers = ['Username', 'Total Score', 'Round 1', 'Round 2', 'Round 3', 'Privileges', 'Network Privilege (m)', 'Opportunity Privilege (h)', 'Video Game Frequency', 'Timestamp'];

    // Create CSV rows
    const rows = results.map(result => {
      const privilegeType = result.networkPrivilege && result.opportunityPrivilege ? 'Both'
        : result.networkPrivilege ? 'Network (m)'
        : result.opportunityPrivilege ? 'Opportunity (h)'
        : 'None';

      return [
        result.username,
        result.totalScore,
        result.roundScores[0] || 0,
        result.roundScores[1] || 0,
        result.roundScores[2] || 0,
        privilegeType,
        result.networkPrivilege ? 'Yes' : 'No',
        result.opportunityPrivilege ? 'Yes' : 'No',
        result.videoGameFrequency,
        new Date(result.timestamp).toLocaleString()
      ];
    });
    
    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `balloon-game-results-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
              onClick={downloadCSV}
              className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded transition-colors flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Download CSV
            </button>
            <button
              onClick={loadResults}
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded transition-colors"
            >
              Refresh
            </button>
            <button
              onClick={clearResults}
              className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded transition-colors"
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
                <h3 className="text-blue-300 text-sm mb-2">Network Privilege (&apos;m&apos;)</h3>
                <p className="text-3xl font-bold text-white">{stats.withNetwork}</p>
                <p className="text-sm text-zinc-400 mt-2">Avg: {Math.round(avgScores.withNetwork)}</p>
              </div>

              <div className="bg-green-900/20 border border-green-700 rounded-lg p-6">
                <h3 className="text-green-300 text-sm mb-2">Opportunity Privilege (&apos;h&apos;)</h3>
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">Privileges</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">Frequency</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">Timestamp</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {results.map((result) => (
                      <tr key={result.id} className="hover:bg-zinc-800/50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{result.username}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-white">{result.totalScore}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">{result.roundScores.join(', ')}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {result.networkPrivilege && result.opportunityPrivilege ? (
                            <span className="text-purple-400 font-medium">Both (m+h)</span>
                          ) : result.networkPrivilege ? (
                            <span className="text-blue-400">Network (m)</span>
                          ) : result.opportunityPrivilege ? (
                            <span className="text-green-400">Opportunity (h)</span>
                          ) : (
                            <span className="text-red-400">None</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">{result.videoGameFrequency}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-400">{new Date(result.timestamp).toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => deleteEntry(result.id)}
                            className="text-red-400 hover:text-red-300 font-medium"
                          >
                            Delete
                          </button>
                        </td>
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
