#!/bin/bash
# Quick deployment script for Balloon Privilege Game

echo "🎈 Balloon Privilege Game - Quick Deploy Script"
echo "================================================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the balloon-privilege-game directory"
    exit 1
fi

echo "📋 Step 1: Initialize Git repository..."
if [ ! -d ".git" ]; then
    git init
    echo "✅ Git initialized"
else
    echo "✅ Git already initialized"
fi

echo ""
echo "📝 Step 2: Create .gitignore additions..."
cat >> .gitignore << 'EOF'

# Deployment
.vercel
.netlify

# Local env files
.env*.local
EOF

echo "✅ .gitignore updated"

echo ""
echo "💾 Step 3: Staging all files..."
git add .

echo ""
echo "📦 Step 4: Creating initial commit..."
git commit -m "Initial commit: Balloon Privilege Game

- Next.js 15 with TypeScript
- Mobile-first balloon popping game
- Privilege system based on email
- Network privilege (M): knows purple=100pts
- Opportunity privilege (H): practice round
- Round 2+: Super Skills (score>500)
- Round 3+: Slow-Mo button (score>1500)
- Ready for Vercel deployment"

echo ""
echo "✅ Git repository ready!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Next Steps:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Create a new repository on GitHub:"
echo "   → Go to https://github.com/new"
echo "   → Name it: balloon-privilege-game"
echo "   → Keep it public or private"
echo "   → DON'T initialize with README (we have one)"
echo ""
echo "2. Connect and push to GitHub:"
echo "   → Run these commands (replace YOUR_USERNAME):"
echo ""
echo "   git remote add origin https://github.com/YOUR_USERNAME/balloon-privilege-game.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "3. Deploy to Vercel:"
echo "   → Go to https://vercel.com"
echo "   → Click 'New Project'"
echo "   → Import your GitHub repository"
echo "   → Click 'Deploy'"
echo "   → Done! Your game will be live in ~2 minutes"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 Test the game with these emails:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "No privilege:        test@example.com"
echo "Network (M):         mike@example.com"
echo "Opportunity (H):     hannah@example.org"
echo "Both privileges:     michael@example.com"
echo ""
echo "🎉 Setup complete! Follow the steps above to deploy."
