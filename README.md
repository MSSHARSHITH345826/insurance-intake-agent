# SunLife Digital Intake Portal

A bilingual (English/French) digital intake portal for processing SunLife insurance claims using an agentic system.

## Features

- 🔐 Login page with authentication
- 🇨🇦 Bilingual support (English/French) for Canadian market
- 🎠 Image carousel with automatic rotation
- 📱 Responsive design
- ⚡ Built with React and Vite

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server (runs on port 3030):
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:3030`

### Building for Production

```bash
npm run build
```

The production build will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
sunlife/
├── assets/
│   ├── logo.png          # SunLife logo
│   └── carousel/          # Carousel images
│       ├── 1.jpg
│       ├── 2.jpg
│       ├── 3.jpg
│       ├── 4.jpg
│       └── 5.jpg
├── src/
│   ├── pages/
│   │   ├── Login.jsx      # Login page component
│   │   └── Login.css      # Login page styles
│   ├── locales/
│   │   ├── en.json        # English translations
│   │   └── fr.json        # French translations
│   ├── App.jsx            # Main app component
│   ├── App.css            # App styles
│   ├── main.jsx           # Entry point
│   ├── i18n.js            # i18n configuration
│   └── index.css          # Global styles
├── package.json
├── vite.config.js         # Vite configuration
└── index.html
```

## Language Support

The application supports both English and French. Users can switch languages using the language selector buttons in the top-right corner of the login page.

## Port Configuration

The application is configured to run on port 3030. This is set in `vite.config.js` and can be changed if needed.

## License

Private - SunLife Internal Use
