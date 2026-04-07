# Learn Traditional Chinese - Website

A modern, interactive platform for learning Traditional Chinese through 4 essential skills:

- 📖 **Reading** - Recognize and read Traditional Chinese characters
- ✍️ **Writing** - Master character writing and stroke order
- 👂 **Listening** - Develop comprehension skills
- 🗣️ **Speaking** - Practice pronunciation and conversation

## Features

✨ **Interactive Lessons** - Engaging content for all proficiency levels
📊 **Progress Tracking** - Monitor your learning journey
🏆 **Achievements** - Unlock badges and rewards
🎯 **Personalized Learning** - Adaptive difficulty levels
📱 **Responsive Design** - Learn on any device

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Deployment**: Vercel
- **Database**: MongoDB (configured for future implementation)
- **API**: RESTful API with Next.js Route Handlers

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm run start
```

## Project Structure

```
src/
├── app/              # Next.js App Router pages
│   ├── layout.tsx    # Root layout
│   ├── page.tsx      # Home page
│   ├── lessons/      # Lesson pages
│   ├── progress/     # Progress tracking
│   └── settings/     # User settings
├── components/       # Reusable React components
├── styles/           # Global CSS and Tailwind
└── lib/              # Utility functions
```

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Vercel will automatically detect Next.js and configure the build settings
4. Click "Deploy"

The website will be live at your Vercel URL!

```bash
# Or deploy directly:
npm i -g vercel
vercel
```

## Lessons

### Reading (讀)

- Basic characters
- Numbers and common phrases
- Compound characters

### Writing (寫)

- Stroke order basics
- Radical recognition
- Complex character composition

### Listening (聽)

- Tone introduction
- Tone practice
- Word recognition

### Speaking (說)

- Pronunciation basics
- Conversation starters
- Daily phrases

## Learning Path

1. Start with **Reading** basics to learn characters
2. Move to **Writing** to understand stroke order
3. Practice **Listening** for tone recognition
4. Develop **Speaking** skills for conversation

## Features (Planned)

- [ ] User authentication
- [ ] MongoDB backend for progress storage
- [ ] Audio pronunciation guides
- [ ] Interactive character writing practice
- [ ] Spaced repetition system
- [ ] Vocabulary flashcards
- [ ] Community forum
- [ ] Mobile app

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues, questions, or suggestions, please open an issue on GitHub.

---

Happy learning! 🇹🇼 加油！
