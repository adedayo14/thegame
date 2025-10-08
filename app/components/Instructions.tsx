'use client';

import { PlayerData } from '../types';

interface InstructionsProps {
  playerData: PlayerData;
  onComplete: () => void;
}

export default function Instructions({ playerData, onComplete }: InstructionsProps) {
  const { privileges } = playerData;
  const isPracticeRound = privileges.opportunityPrivilege && !privileges.hasPracticed;

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black"></div>
      <div className="relative max-w-2xl w-full">
        <div className="backdrop-blur-xl bg-zinc-900/80 rounded-2xl border border-zinc-800 shadow-2xl p-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight text-white">
                How to Play
              </h1>
              <p className="text-zinc-400">Learn the rules before you start</p>
            </div>

            <div className="space-y-4">
              <div className="bg-zinc-800/50 border border-zinc-700 p-6 rounded-lg">
                <h2 className="font-semibold text-lg mb-4 text-white">Game Rules</h2>
                <ul className="space-y-3 text-zinc-300">
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>Balloons rise from the bottom - click or tap to pop them</span>
                  </li>
                  {!privileges.networkPrivilege && (
                    <li className="flex items-start gap-3">
                      <span className="text-white mt-1">•</span>
                      <span><span className="text-white font-medium">White balloons</span> - lose a life!</span>
                    </li>
                  )}
                  <li className="flex items-start gap-3">
                    <span className="text-green-400 mt-1">•</span>
                    <span>You have <span className="text-white font-medium">5 lives and 3 rounds</span> to play</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-400 mt-1">•</span>
                    <span>Speed increases during play - stay alert!</span>
                  </li>
                </ul>
              </div>

              {privileges.networkPrivilege && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 p-5 rounded-lg">
                  <h2 className="font-semibold text-lg mb-2 text-yellow-300">Special Information</h2>
                  <ul className="space-y-2 text-zinc-300">
                    <li className="flex items-start gap-3">
                      <span className="text-white mt-1">•</span>
                      <span><span className="text-white font-medium">White balloons</span> - lose a life and slow down</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-yellow-400 mt-1">•</span>
                      <span><span className="text-yellow-400 font-medium">Yellow balloons</span> - worth 100 points</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-blue-400 mt-1">•</span>
                      <span><span className="text-blue-400 font-medium">Blue balloons</span> - lose 50 points</span>
                    </li>
                  </ul>
                </div>
              )}

              {isPracticeRound && (
                <div className="bg-green-500/10 border border-green-500/30 p-5 rounded-lg">
                  <h2 className="font-semibold text-lg mb-2 text-green-300">Practice Round</h2>
                  <p className="text-zinc-300">
                    You get a <span className="text-white font-medium">free practice round</span> first. This won&apos;t count towards your score.
                  </p>
                </div>
              )}

              {!isPracticeRound && privileges.superSkills && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 p-5 rounded-lg">
                  <h2 className="font-semibold text-lg mb-2 text-yellow-300">Super Skills Unlocked</h2>
                  <p className="text-zinc-300">
                    When you pop a balloon, nearby balloons will also pop!
                  </p>
                </div>
              )}

              {!isPracticeRound && privileges.hasSlowButton && !privileges.slowButtonUsed && (
                <div className="bg-indigo-500/10 border border-indigo-500/30 p-5 rounded-lg">
                  <h2 className="font-semibold text-lg mb-2 text-indigo-300">Slow-Mo Power</h2>
                  <p className="text-zinc-300">
                    Use the <span className="text-white font-medium">Slow Button</span> once to slow down all balloons for 10 seconds.
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={onComplete}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
            >
              {isPracticeRound ? 'Start Practice Round' : 'Start Playing'}
            </button>

            <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-lg">
              <p className="text-sm text-amber-200 text-center">
                You won&apos;t be able to see these instructions again during the game
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
