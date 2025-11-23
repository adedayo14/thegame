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

  // Score ranges for distribution
  const scoreRanges = [
    { label: '0-200', min: 0, max: 200, count: 0 },
    { label: '201-500', min: 201, max: 500, count: 0 },
    { label: '501-1000', min: 501, max: 1000, count: 0 },
    { label: '1001-1500', min: 1001, max: 1500, count: 0 },
    { label: '1501+', min: 1501, max: Infinity, count: 0 },
  ];
  results.forEach(r => {
    const range = scoreRanges.find(range => r.totalScore >= range.min && r.totalScore <= range.max);
    if (range) range.count++;
  });

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

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Privilege Distribution Pie Chart */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4">Privilege Distribution</h3>
                <div className="flex items-center justify-center mb-4">
                  <svg viewBox="0 0 200 200" className="w-64 h-64">
                    {(() => {
                      let currentAngle = -90;
                      const colors = ['#3b82f6', '#10b981', '#a855f7', '#ef4444'];
                      const data = [
                        { label: 'Both', value: stats.withBoth, color: colors[2] },
                        { label: 'Network Only', value: stats.withNetwork - stats.withBoth, color: colors[0] },
                        { label: 'Opportunity Only', value: stats.withOpportunity - stats.withBoth, color: colors[1] },
                        { label: 'Neither', value: stats.withNeither, color: colors[3] },
                      ];
                      const total = stats.total || 1;

                      return data.map((item, index) => {
                        const percentage = (item.value / total) * 100;
                        const angle = (percentage / 100) * 360;
                        const x1 = 100 + 80 * Math.cos((currentAngle * Math.PI) / 180);
                        const y1 = 100 + 80 * Math.sin((currentAngle * Math.PI) / 180);
                        currentAngle += angle;
                        const x2 = 100 + 80 * Math.cos((currentAngle * Math.PI) / 180);
                        const y2 = 100 + 80 * Math.sin((currentAngle * Math.PI) / 180);
                        const largeArc = angle > 180 ? 1 : 0;

                        if (item.value === 0) return null;

                        return (
                          <path
                            key={index}
                            d={`M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArc} 1 ${x2} ${y2} Z`}
                            fill={item.color}
                            stroke="#18181b"
                            strokeWidth="2"
                          />
                        );
                      });
                    })()}
                  </svg>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-purple-600"></div>
                    <span className="text-zinc-300">Both: {stats.withBoth}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-blue-600"></div>
                    <span className="text-zinc-300">Network: {stats.withNetwork - stats.withBoth}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-green-600"></div>
                    <span className="text-zinc-300">Opportunity: {stats.withOpportunity - stats.withBoth}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-red-600"></div>
                    <span className="text-zinc-300">Neither: {stats.withNeither}</span>
                  </div>
                </div>
              </div>

              {/* Average Score Comparison */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4">Average Scores by Privilege</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Both Privileges', score: avgScores.withBoth, color: 'bg-purple-600', count: stats.withBoth },
                    { label: 'Network Only', score: avgScores.withNetwork - (stats.withBoth > 0 ? avgScores.withBoth : 0), color: 'bg-blue-600', count: stats.withNetwork - stats.withBoth },
                    { label: 'Opportunity Only', score: avgScores.withOpportunity - (stats.withBoth > 0 ? avgScores.withBoth : 0), color: 'bg-green-600', count: stats.withOpportunity - stats.withBoth },
                    { label: 'No Privileges', score: avgScores.withNeither, color: 'bg-red-600', count: stats.withNeither },
                  ].map((item, index) => {
                    const maxScore = Math.max(avgScores.withBoth, avgScores.withNetwork, avgScores.withOpportunity, avgScores.withNeither, 1);
                    const actualScore = item.label === 'Both Privileges' ? avgScores.withBoth :
                                      item.label === 'Network Only' ? (stats.withNetwork - stats.withBoth > 0 ? avgScores.withNetwork : 0) :
                                      item.label === 'Opportunity Only' ? (stats.withOpportunity - stats.withBoth > 0 ? avgScores.withOpportunity : 0) :
                                      avgScores.withNeither;
                    const width = item.count > 0 ? (actualScore / maxScore) * 100 : 0;

                    return (
                      <div key={index}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-zinc-300">{item.label}</span>
                          <span className="text-white font-bold">{item.count > 0 ? Math.round(actualScore) : 0}</span>
                        </div>
                        <div className="w-full bg-zinc-800 rounded-full h-6 overflow-hidden">
                          <div
                            className={`${item.color} h-full transition-all duration-500 flex items-center justify-end pr-2`}
                            style={{ width: `${width}%` }}
                          >
                            {width > 15 && <span className="text-xs text-white font-medium">{item.count > 0 ? Math.round(actualScore) : 0}</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Score Distribution */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4">Score Distribution</h3>
                <div className="space-y-3">
                  {scoreRanges.map((range, index) => {
                    const maxCount = Math.max(...scoreRanges.map(r => r.count), 1);
                    const width = (range.count / maxCount) * 100;
                    const percentage = stats.total > 0 ? ((range.count / stats.total) * 100).toFixed(1) : 0;

                    return (
                      <div key={index}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-zinc-300">{range.label}</span>
                          <span className="text-zinc-400">{range.count} ({percentage}%)</span>
                        </div>
                        <div className="w-full bg-zinc-800 rounded-full h-5 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full transition-all duration-500"
                            style={{ width: `${width}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Top Scores */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4">Top 10 Scores</h3>
                <div className="space-y-2">
                  {results
                    .sort((a, b) => b.totalScore - a.totalScore)
                    .slice(0, 10)
                    .map((result, index) => (
                      <div key={result.id} className="flex items-center justify-between py-2 border-b border-zinc-800 last:border-0">
                        <div className="flex items-center gap-3">
                          <span className={`text-lg font-bold ${index === 0 ? 'text-yellow-400' : index === 1 ? 'text-gray-400' : index === 2 ? 'text-orange-400' : 'text-zinc-500'}`}>
                            #{index + 1}
                          </span>
                          <div>
                            <div className="text-white font-medium">{result.username}</div>
                            <div className="text-xs text-zinc-500 flex gap-2">
                              {result.networkPrivilege && <span className="text-blue-400">Network</span>}
                              {result.opportunityPrivilege && <span className="text-green-400">Opportunity</span>}
                              {!result.networkPrivilege && !result.opportunityPrivilege && <span className="text-red-400">No Privilege</span>}
                            </div>
                          </div>
                        </div>
                        <div className="text-xl font-bold text-white">{result.totalScore}</div>
                      </div>
                    ))}
                  {results.length === 0 && (
                    <div className="text-center text-zinc-500 py-8">No scores yet</div>
                  )}
                </div>
              </div>
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
