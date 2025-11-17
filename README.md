# FPGA Design Assistant

AI-powered VHDL code analysis tool for students and engineers.

### Installation

1. Install dependencies:

```bash
npm install
```

2. Create `.env` file:

```bash
cp .env.example .env
```

3. Add your API keys to `.env`:

```
ANTHROPIC_API_KEY=your_claude_api_key_here
GOOGLE_API_KEY=your_gemini_api_key_here
```

4. Run the development server:

```bash
npm run dev
```

## Development

```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

## License

MIT - Free to use, modify, and distribute.
