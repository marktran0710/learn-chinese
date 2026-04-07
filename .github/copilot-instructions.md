# Learn Traditional Chinese - Development Guide

## Project Overview
A modern, interactive platform for learning Traditional Chinese through 4 essential skills: Reading, Writing, Listening, and Speaking.

## Tech Stack
- **Framework**: Next.js 16.2.2 with TypeScript
- **Styling**: Tailwind CSS v3
- **Deployment**: Vercel
- **Frontend**: React 19

## Development Setup

### Prerequisites
- Node.js 18.x or higher
- npm or yarn

### Installation
```bash
npm install
```

### Running Locally
```bash
npm run dev
```
Visit `http://localhost:3000`

### Building for Production
```bash
npm run build
npm start
```

## Project Structure
```
src/
├── app/              # Next.js App Router pages
│   ├── layout.tsx    # Root layout component
│   ├── page.tsx      # Home page
│   ├── lessons/      # Lesson pages for each skill
│   ├── progress/     # Progress tracking page
│   └── settings/     # User settings page
├── components/       # Reusable React components
├── styles/           # Global CSS and Tailwind configuration
└── lib/              # Utility functions and helpers
```

## Available Commands
- `npm run dev` - Start development server
- `npm run build` - Create production build
- `npm start` - Run production server
- `npm run lint` - Run ESLint

## Features Implemented
✅ Home page with 4 skill cards (Reading, Writing, Listening, Speaking)
✅ Interactive lesson pages for each skill
✅ Progress tracking dashboard
✅ User settings page
✅ Responsive design with Tailwind CSS
✅ Component-based architecture

## Deployment to Vercel

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit: Learn Traditional Chinese platform"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/learn-chinese.git
git push -u origin main
```

### Step 2: Connect to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Vercel automatically detects Next.js configuration
5. Click "Deploy"

### Step 3: Configure Environment
- No environment variables required for basic deployment
- For future backend integration, add `NEXT_PUBLIC_API_URL`

### Your Live URL
Once deployed, your site will be available at: `https://learn-chinese.vercel.app`

## Future Enhancements
- [ ] User authentication system
- [ ] MongoDB database integration
- [ ] Audio pronunciation guides
- [ ] Interactive character writing practice
- [ ] Spaced repetition system
- [ ] Vocabulary flashcards
- [ ] Community forum
- [ ] Mobile app

## Performance Optimization
- Next.js Turbopack for fast builds
- Tailwind CSS for optimized styling
- Static site generation where possible
- Image optimization

## Troubleshooting

### Build Fails
- Clear `.next` directory: `rm -rf .next`
- Reinstall dependencies: `npm install`
- Run `npm run build` again

### Port 3000 Already in Use
```bash
npm run dev -- -p 3001
```

## Support & Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
