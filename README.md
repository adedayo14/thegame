# Balloon Pop - Privilege Game

A mobile-first web game built with Next.js that demonstrates the effects of privilege through an engaging balloon-popping experience.

## 🎮 Game Concept

Students play a seemingly simple hand-eye-coordination game where they pop balloons to score points. However, different players receive different levels of privilege based on their email address, which affects their ability to succeed.

### Game Mechanics

- **Red, Blue, Green Balloons**: 10 points each
- **Purple Balloons**: 100 points each (valuable!)
- **Black Balloons**: Lose a life and restart the round
- **5 Lives Total**: Points are banked after each round
- **Progressive Difficulty**: Speed and balloon spawn rate increase over time

### Privilege System

The game assigns privileges based on email addresses to demonstrate how advantages compound:

1. **Network Privilege** (email contains 'M' or 'm'):
   - Player is told that purple balloons = 100 points
   - Can focus strategy on high-value targets

2. **Opportunity Privilege** (email contains 'H' or 'h'):
   - Receives a FREE practice round before the real game
   - Can learn mechanics without consequences

3. **Round 2+ Super Skills** (if total score > 500):
   - Popping a balloon also pops nearby balloons within a radius
   - Privilege compounds - early advantages make it easier to unlock this

4. **Round 3+ Slow Motion** (if total score > 1500):
   - One-time button to slow all balloons for 10 seconds
   - Further compounding of early privileges

### Educational Purpose

The game demonstrates how:
- Small initial advantages (knowing purple = 100pts, or getting practice) compound over time
- Those with privileges can unlock additional advantages more easily
- The end result shows significant score differences despite "equal rules"

## 🚀 Getting Started

### Prerequisites

- Node.js 18.18+ or 20+ (if you have Node 19.4.0, update to 20+)
- npm, yarn, pnpm, or bun

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to play the game.

### For Deployment

This app is optimized for:
- **Vercel**: Zero-config deployment (recommended)
- **GitHub**: Push to any branch and deploy via Vercel
- Mobile devices with touch support

## 📱 Mobile-First Design

- Responsive layout for all screen sizes
- Touch-optimized balloon popping
- Prevented scrolling and zooming for immersive gameplay
- Canvas-based rendering for smooth performance

## 🎯 Testing the Privilege System

To test different privilege levels:

1. **Network + Opportunity**: Use email like `hannah@mail.com` (has both H and M)
2. **Network Only**: Use email like `mark@test.com` (has M)
3. **Opportunity Only**: Use email like `hannah@test.org` (has H, but no M in domain)
4. **No Privilege**: Use email like `jane@test.com` (no H or M)

## 🛠️ Technology Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **HTML Canvas** - Game rendering
- **React Hooks** - State management

## 🐛 Troubleshooting

### Node Version Error

If you see "Node.js version ... is required", update Node.js:

```bash
# Using nvm
nvm install 20
nvm use 20

# Or download from nodejs.org
```

## 📝 Next.js Resources

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
