'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { PlayerData, Balloon, GameState } from '../types';
import {
  createBalloon,
  checkCollision,
  getBalloonColor,
  getBalloonPoints,
  getSpawnRate,
  shouldUnlockSuperSkills,
  shouldUnlockSlowButton,
} from '../utils';

interface GameProps {
  playerData: PlayerData;
  setPlayerData: (data: PlayerData) => void;
}

export default function Game({ playerData, setPlayerData }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>({
    balloons: [],
    score: 0,
    lives: 5,
    round: playerData.privileges.opportunityPrivilege && !playerData.privileges.hasPracticed ? 0 : 1,
    gameOver: false,
    isPaused: false,
    totalScore: playerData.scores.reduce((a, b) => a + b, 0),
    difficulty: 0,
  });
  const [showGameOver, setShowGameOver] = useState(false);
  const [isSlowMo, setIsSlowMo] = useState(false);
  const [showFinalResults, setShowFinalResults] = useState(false);
  const [roundTimeRemaining, setRoundTimeRemaining] = useState(90); // 90 seconds per round
  const [popAnimations, setPopAnimations] = useState<Array<{id: string, x: number, y: number, points: number}>>([]);
  const [showLifeLostMessage, setShowLifeLostMessage] = useState(false);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const lastSpawnRef = useRef<number>(Date.now());
  const roundTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastClickTimeRef = useRef<number>(0); // Prevent double-click

  const isPracticeRound = gameState.round === 0;
  const roundTimeLimit = isPracticeRound ? 60 : 90; // 60s for practice, 90s for real rounds

  // Round timer (works for both practice and real rounds)
  useEffect(() => {
    if (gameState.gameOver) {
      if (roundTimerRef.current) {
        clearInterval(roundTimerRef.current);
        roundTimerRef.current = null;
      }
      return;
    }

    // Reset timer when round changes
    setRoundTimeRemaining(roundTimeLimit);

    roundTimerRef.current = setInterval(() => {
      setRoundTimeRemaining(prev => {
        if (prev <= 1) {
          setGameState(prevState => ({ ...prevState, gameOver: true }));
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (roundTimerRef.current) {
        clearInterval(roundTimerRef.current);
        roundTimerRef.current = null;
      }
    };
  }, [gameState.round, gameState.gameOver, roundTimeLimit]);

  // Update privileges based on score
  useEffect(() => {
    const updatedPrivileges = { ...playerData.privileges };
    let updated = false;

    if (!updatedPrivileges.superSkills && shouldUnlockSuperSkills(gameState.totalScore)) {
      updatedPrivileges.superSkills = true;
      updated = true;
    }

    if (!updatedPrivileges.hasSlowButton && shouldUnlockSlowButton(gameState.totalScore)) {
      updatedPrivileges.hasSlowButton = true;
      updated = true;
    }

    if (updated) {
      setPlayerData({ ...playerData, privileges: updatedPrivileges });
    }
  }, [gameState.totalScore, playerData, setPlayerData]);

  const popBalloon = useCallback((balloon: Balloon, removeBalloon: boolean = true) => {
    const points = getBalloonPoints(balloon.type);
    
    // Show pop animation with points
    const animationId = Math.random().toString(36);
    setPopAnimations(prev => [...prev, { id: animationId, x: balloon.x, y: balloon.y, points }]);
    setTimeout(() => {
      setPopAnimations(prev => prev.filter(anim => anim.id !== animationId));
    }, 1000); // Remove after 1 second
    
    if (balloon.type === 'white') {
      // White balloon - lose a life and slow down
      // Show "You've lost a life!" message
      setShowLifeLostMessage(true);
      setTimeout(() => setShowLifeLostMessage(false), 2000); // Hide after 2 seconds

      setGameState(prev => {
        const newLives = prev.lives - 1;
        const newBalloons = removeBalloon ? prev.balloons.filter(b => b.id !== balloon.id) : prev.balloons;
        if (newLives <= 0) {
          return { ...prev, balloons: newBalloons, lives: 0, gameOver: true };
        }
        return {
          ...prev,
          balloons: newBalloons,
          lives: newLives,
          difficulty: Math.max(0, prev.difficulty - 1), // Slow down
        };
      });
    } else {
      // For non-white balloons, update score and handle super skills in ONE state update
      setGameState(prev => {
        let remainingBalloons = removeBalloon ? prev.balloons.filter(b => b.id !== balloon.id) : prev.balloons;
        let bonusPoints = 0;
        let livesLost = 0;

        // Super skills: pop nearby balloons (only if removeBalloon is true)
        if (playerData.privileges.superSkills && !isPracticeRound && removeBalloon) {
          const popRadius = 100;
          const finalBalloons: Balloon[] = [];

          remainingBalloons.forEach(b => {
            const distance = Math.sqrt(
              Math.pow(b.x - balloon.x, 2) + Math.pow(b.y - balloon.y, 2)
            );
            if (distance < popRadius && b.type !== 'orange') {
              const balloonPoints = getBalloonPoints(b.type);
              bonusPoints += balloonPoints;
              
              // If nearby balloon is white, lose a life!
              if (b.type === 'white') {
                livesLost++;
                // Show "You've lost a life!" message for super skills white balloon
                setShowLifeLostMessage(true);
                setTimeout(() => setShowLifeLostMessage(false), 2000);
              }
              
              // Show pop animation for bonus balloons
              const bonusAnimId = Math.random().toString(36);
              setPopAnimations(prev => [...prev, { id: bonusAnimId, x: b.x, y: b.y, points: balloonPoints }]);
              setTimeout(() => {
                setPopAnimations(prev => prev.filter(anim => anim.id !== bonusAnimId));
              }, 1000);
            } else {
              finalBalloons.push(b);
            }
          });

          remainingBalloons = finalBalloons;
        }

        const newLives = prev.lives - livesLost;
        const isGameOver = newLives <= 0;

        return {
          ...prev,
          balloons: remainingBalloons,
          score: prev.score + points + bonusPoints,
          totalScore: Math.max(0, prev.totalScore + points + bonusPoints),
          lives: Math.max(0, newLives),
          gameOver: prev.gameOver || isGameOver,
        };
      });
    }
  }, [playerData.privileges.superSkills, isPracticeRound]);

  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    event.stopPropagation();
    
    // Prevent double-firing (touch + click on mobile)
    const now = Date.now();
    if (now - lastClickTimeRef.current < 100) return;
    lastClickTimeRef.current = now;
    
    if (gameState.gameOver || gameState.isPaused) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    // Check if clicked on any balloon (check from front to back for overlapping balloons)
    for (let i = gameState.balloons.length - 1; i >= 0; i--) {
      const balloon = gameState.balloons[i];
      if (checkCollision(x, y, balloon)) {
        popBalloon(balloon, true); // Pass true to remove balloon
        return; // Exit immediately after popping one balloon
      }
    }
  }, [gameState.balloons, gameState.gameOver, gameState.isPaused, popBalloon]);

  const handleSlowMo = () => {
    if (playerData.privileges.hasSlowButton && !playerData.privileges.slowButtonUsed && !isPracticeRound) {
      setIsSlowMo(true);
      setPlayerData({
        ...playerData,
        privileges: { ...playerData.privileges, slowButtonUsed: true },
      });
      setTimeout(() => setIsSlowMo(false), 10000);
    }
  };

  const handleNextRound = () => {
    if (isPracticeRound) {
      // End practice, start real game
      setPlayerData({
        ...playerData,
        privileges: { ...playerData.privileges, hasPracticed: true },
      });
      setGameState({
        balloons: [],
        score: 0,
        lives: 5,
        round: 1,
        gameOver: false,
        isPaused: false,
        totalScore: 0,
        difficulty: 0,
      });
      setShowGameOver(false);
    } else if (gameState.round < 3) {
      // Continue to next round (max 3 rounds)
      const newScores = [...playerData.scores, gameState.score];
      setPlayerData({ ...playerData, scores: newScores });
      
      setGameState(prev => ({
        balloons: [],
        score: 0,
        lives: 5,
        round: prev.round + 1,
        gameOver: false,
        isPaused: false,
        totalScore: prev.totalScore,
        difficulty: 0,
      }));
      setShowGameOver(false);
    } else {
      // After round 3, show final results and save to database
      const newScores = [...playerData.scores, gameState.score];
      const totalScore = newScores.reduce((a, b) => a + b, 0);
      
      // Save results to admin dashboard
      fetch('/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: playerData.username,
          totalScore,
          roundScores: newScores,
          networkPrivilege: playerData.privileges.networkPrivilege,
          opportunityPrivilege: playerData.privileges.opportunityPrivilege,
          videoGameFrequency: playerData.videoGameFrequency,
        }),
      })
      .then(response => response.json())
      .then(data => console.log('Result saved:', data))
      .catch(err => console.error('Failed to save result:', err));
      
      setPlayerData({ ...playerData, scores: newScores });
      setShowFinalResults(true);
    }
  };

  // Game loop
  useEffect(() => {
    if (gameState.gameOver || gameState.isPaused) {
      if (gameState.gameOver && !showGameOver) {
        setShowGameOver(true);
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const speedMultiplier = isSlowMo ? 0.3 : 1;

    const animate = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw balloons
      setGameState(prev => {
        const updatedBalloons = prev.balloons
          .map(balloon => ({
            ...balloon,
            y: balloon.y - balloon.speed * speedMultiplier,
          }))
          .filter(balloon => balloon.y > -100);

        // Increase difficulty over time
        const newDifficulty = Math.floor(prev.score / 100);

        return {
          ...prev,
          balloons: updatedBalloons,
          difficulty: newDifficulty,
        };
      });

      // Draw balloons
      gameState.balloons.forEach(balloon => {
        ctx.fillStyle = getBalloonColor(balloon.type);
        ctx.beginPath();
        ctx.ellipse(balloon.x, balloon.y, balloon.radius * 0.8, balloon.radius, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Balloon string
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(balloon.x, balloon.y + balloon.radius);
        ctx.lineTo(balloon.x, balloon.y + balloon.radius + 20);
        ctx.stroke();

        // Highlight shine
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.ellipse(
          balloon.x - balloon.radius * 0.3,
          balloon.y - balloon.radius * 0.3,
          balloon.radius * 0.3,
          balloon.radius * 0.5,
          -Math.PI / 4,
          0,
          Math.PI * 2
        );
        ctx.fill();
      });

      // Spawn new balloons - higher density for more challenge
      const now = Date.now();
      const spawnRate = getSpawnRate(gameState.difficulty);
      if (now - lastSpawnRef.current > spawnRate) {
        // Spawn 2-4 balloons at once for better density
        const rand = Math.random();
        const balloonsToSpawn = rand < 0.3 ? 2 : rand < 0.7 ? 3 : 4;
        const newBalloons: Balloon[] = [];
        for (let i = 0; i < balloonsToSpawn; i++) {
          newBalloons.push(createBalloon(canvas.width, gameState.difficulty, gameState.round));
        }
        setGameState(prev => ({
          ...prev,
          balloons: [...prev.balloons, ...newBalloons],
        }));
        lastSpawnRef.current = now;
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameState, isSlowMo, showGameOver]);

  // Resize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener('resize', resize);
    
    // Trigger resize on round change to ensure canvas is properly sized
    const timer = setTimeout(resize, 100);
    
    return () => {
      window.removeEventListener('resize', resize);
      clearTimeout(timer);
    };
  }, [gameState.round]);

  if (showGameOver) {
    return (
      <div className="fixed inset-0 bg-black/95 flex items-center justify-center p-6 z-50">
        <div className="relative max-w-md w-full">
          <div className="backdrop-blur-xl bg-zinc-900/90 rounded-2xl border border-zinc-800 shadow-2xl p-8">
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-white">
                  {isPracticeRound ? 'Practice Complete' : gameState.lives === 0 ? 'Out of Lives!' : 'Round Complete'}
                </h1>
              </div>

              <div className="space-y-4">
                {!isPracticeRound && (
                  <>
                    <div className="bg-zinc-800/50 border border-zinc-700 p-6 rounded-lg">
                      <p className="text-center">
                        <span className="text-4xl font-bold text-white">{gameState.score}</span>
                        <br />
                        <span className="text-sm text-zinc-400 uppercase tracking-wide mt-2 inline-block">Points This Round</span>
                      </p>
                    </div>
                    <div className="bg-zinc-800/50 border border-zinc-700 p-6 rounded-lg">
                      <p className="text-center">
                        <span className="text-3xl font-bold text-blue-400">{gameState.totalScore}</span>
                        <br />
                        <span className="text-sm text-zinc-400 uppercase tracking-wide mt-2 inline-block">Total Score</span>
                      </p>
                    </div>
                  </>
                )}

                {isPracticeRound && (
                  <div className="bg-green-500/10 border border-green-500/30 p-5 rounded-lg">
                    <p className="text-center text-zinc-300 leading-relaxed">
                      Practice complete! You scored <span className="font-medium text-white">{gameState.score}</span> points. Now let&apos;s play for real. You have <span className="font-medium text-white">60 seconds</span> per round!
                    </p>
                  </div>
                )}

                {!isPracticeRound && playerData.privileges.superSkills && gameState.round >= 2 && (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-lg text-center">
                    <p className="text-sm font-medium text-yellow-300">
                      Super Skills Active
                    </p>
                  </div>
                )}

                {!isPracticeRound && playerData.privileges.hasSlowButton && gameState.round >= 3 && (
                  <div className="bg-indigo-500/10 border border-indigo-500/30 p-4 rounded-lg text-center">
                    <p className="text-sm font-medium text-indigo-300">
                      Slow-Mo Button Available
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={handleNextRound}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
              >
                {isPracticeRound ? 'Start Real Game' : gameState.round < 3 ? `Continue to Round ${gameState.round + 1}` : 'View Final Results'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showFinalResults) {
    const totalScore = playerData.scores.reduce((a, b) => a + b, 0);
    return (
      <div className="fixed inset-0 bg-black/95 flex items-center justify-center p-6 z-50">
        <div className="relative max-w-md w-full">
          <div className="backdrop-blur-xl bg-zinc-900/90 rounded-2xl border border-zinc-800 shadow-2xl p-8">
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h1 className="text-4xl font-bold text-white">Game Complete!</h1>
                <p className="text-zinc-400">You finished all 3 rounds</p>
              </div>

              <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 p-6 rounded-lg">
                <p className="text-center">
                  <span className="text-5xl font-bold text-white">{totalScore}</span>
                  <br />
                  <span className="text-sm text-zinc-300 uppercase tracking-wide mt-2 inline-block">Total Score</span>
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wide text-center">Round Scores</h3>
                {playerData.scores.map((score, index) => (
                  <div key={index} className="bg-zinc-800/50 border border-zinc-700 p-4 rounded-lg flex justify-between items-center">
                    <span className="text-zinc-300">Round {index + 1}</span>
                    <span className="text-xl font-bold text-white">{score}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => window.location.reload()}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
              >
                Play Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Subtle Cloud Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-300 via-sky-200 to-blue-100">
        <div className="absolute inset-0 overflow-hidden opacity-60">
          {/* Fewer, slower clouds for subtlety */}
          <div className="absolute w-full h-full animate-cloud-slow">
            <div className="cloud cloud-2" style={{ top: '15%', left: '-15%' }}></div>
            <div className="cloud cloud-1" style={{ top: '45%', left: '-10%' }}></div>
          </div>
          <div className="absolute w-full h-full animate-cloud-medium">
            <div className="cloud cloud-3" style={{ top: '25%', left: '30%' }}></div>
            <div className="cloud cloud-2" style={{ top: '60%', left: '50%' }}></div>
          </div>
          <div className="absolute w-full h-full animate-cloud-fast">
            <div className="cloud cloud-1" style={{ top: '35%', left: '70%' }}></div>
            <div className="cloud cloud-3" style={{ top: '70%', left: '80%' }}></div>
          </div>
        </div>
      </div>
      
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        onTouchStart={(e) => {
          e.preventDefault();
          e.stopPropagation();
          
          // Prevent double-firing (touch + click on mobile)
          const now = Date.now();
          if (now - lastClickTimeRef.current < 100) return;
          lastClickTimeRef.current = now;
          
          if (gameState.gameOver || gameState.isPaused) return;
          
          const touch = e.touches[0];
          const canvas = canvasRef.current;
          if (!canvas) return;
          const rect = canvas.getBoundingClientRect();
          const scaleX = canvas.width / rect.width;
          const scaleY = canvas.height / rect.height;
          const x = (touch.clientX - rect.left) * scaleX;
          const y = (touch.clientY - rect.top) * scaleY;
          
          for (let i = gameState.balloons.length - 1; i >= 0; i--) {
            const balloon = gameState.balloons[i];
            if (checkCollision(x, y, balloon)) {
              popBalloon(balloon, true); // Pass true to remove balloon
              return;
            }
          }
        }}
        className="absolute inset-0 cursor-crosshair active:cursor-crosshair"
        style={{ background: 'transparent', touchAction: 'none', userSelect: 'none' }}
      />

      {/* HUD - Score and Lives */}
      <div className="absolute top-0 left-0 right-0 bg-black/60 pointer-events-none z-10">
        <div className="max-w-full px-4 py-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-baseline gap-1.5">
                <span className="text-xs text-white/60 uppercase tracking-wide">Score:</span>
                <span className="text-lg font-semibold text-white">{isPracticeRound ? gameState.score : gameState.totalScore}</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xs text-white/60 uppercase tracking-wide">Time:</span>
                <span className={`text-lg font-semibold ${roundTimeRemaining <= 10 ? 'text-red-400' : isPracticeRound ? 'text-yellow-300' : 'text-blue-300'}`}>
                  {roundTimeRemaining}s
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-xs text-white/60 uppercase tracking-wide">
                {isPracticeRound ? 'Practice' : `Round ${gameState.round}/3`}
              </span>
              {!isPracticeRound && (
                <div className="flex items-center gap-1 text-xl">
                  {Array.from({ length: gameState.lives }).map((_, i) => (
                    <span key={i}>🎈</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Pop Animations */}
      {popAnimations.map(anim => (
        <div
          key={anim.id}
          className="absolute pointer-events-none z-20 animate-bounce"
          style={{
            left: `${anim.x}px`,
            top: `${anim.y}px`,
            transform: 'translate(-50%, -50%)',
            animation: 'fadeOutUp 1s ease-out forwards',
          }}
        >
          <span className={`text-3xl font-bold ${
            anim.points > 0 ? 'text-green-400' : anim.points < 0 ? 'text-red-400' : 'text-white'
          }`}>
            {anim.points > 0 ? '+' : ''}{anim.points}
          </span>
        </div>
      ))}

      {/* Slow Mo Button */}
      {playerData.privileges.hasSlowButton && !playerData.privileges.slowButtonUsed && !isPracticeRound && (
        <div className="absolute bottom-8 left-0 right-0 flex justify-center pointer-events-auto z-10">
          <button
            onClick={handleSlowMo}
            disabled={isSlowMo}
            className={`px-8 py-3 rounded-lg font-medium shadow-2xl transition-all backdrop-blur-xl border-2 ${
              isSlowMo
                ? 'bg-gray-400/80 text-gray-600 cursor-not-allowed border-gray-500'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-400 hover:scale-105 active:scale-95'
            }`}
          >
            {isSlowMo ? '⏰ Slow-Mo Active' : '⏰ Use Slow-Mo (10s)'}
          </button>
        </div>
      )}

      {isSlowMo && (
        <div className="absolute top-24 left-0 right-0 flex justify-center pointer-events-none z-10">
          <div className="backdrop-blur-xl bg-indigo-600 border-2 border-indigo-400 text-white px-6 py-2 rounded-lg font-medium shadow-2xl">
            ⏰ SLOW MOTION ACTIVE
          </div>
        </div>
      )}

      {showLifeLostMessage && (
        <div className="absolute top-24 left-0 right-0 flex justify-center pointer-events-none z-10">
          <div className="backdrop-blur-xl bg-red-600 border-2 border-red-400 text-white px-6 py-3 rounded-lg font-bold shadow-2xl animate-pulse">
            💀 YOU&apos;VE LOST A LIFE!
          </div>
        </div>
      )}

      {isPracticeRound && (
        <div className="absolute top-24 left-0 right-0 flex justify-center pointer-events-none z-10">
          <div className="backdrop-blur-xl bg-green-600 border-2 border-green-400 text-white px-6 py-2 rounded-lg font-medium shadow-2xl">
            🎯 PRACTICE ROUND
          </div>
        </div>
      )}
    </div>
  );
}
