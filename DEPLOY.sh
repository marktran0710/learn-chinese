#!/bin/bash

# Learn Traditional Chinese - Deployment Script
# This script helps you deploy your application to Vercel

echo "🇹🇼 Learn Traditional Chinese - Deployment Assistant"
echo "=================================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "⚠️  Git not initialized. Initializing now..."
    git init
    git add .
    git commit -m "Initial commit: Learn Traditional Chinese"
fi

echo "📦 Dependencies status:"
if [ -d "node_modules" ]; then
    echo "✅ Dependencies installed"
else
    echo "📥 Installing dependencies..."
    npm install
fi

echo ""
echo "🔨 Building application..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "📝 Next steps to deploy:"
    echo "1. Create a GitHub repository at https://github.com/new"
    echo "2. Run these commands:"
    echo ""
    echo "   git remote add origin https://github.com/YOUR_USERNAME/learn-chinese.git"
    echo "   git branch -M main"
    echo "   git push -u origin main"
    echo ""
    echo "3. Go to https://vercel.com and import your GitHub repository"
    echo "4. Vercel will automatically deploy your app!"
    echo ""
    echo "🎉 That's it! Your site will be live in minutes!"
else
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi
