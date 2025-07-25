# Agentic Assistant

An intelligent 3D assistant app with AI chat capabilities, built with Vite, React, TypeScript, and React Three Fiber. Works as both a Progressive Web App (PWA) and Chrome Extension with optimized performance and modern features.

**Author:** Agentic Assistant Team  
**Version:** 1.0.0  
**License:** MIT

## ✨ Features

- 🤖 **3D Avatar**: Interactive React Three Fiber avatar with smooth animations and GLB model support
- 🗣️ **Voice Interaction**: Web Speech API for voice input and AI responses
- 💬 **AI Chat**: OpenAI integration for intelligent conversations
- 📱 **PWA Ready**: Installable as a Progressive Web App with offline support
- 🔌 **Chrome Extension**: Compact browser extension for cross-site access
- 🎨 **Modern UI**: Clean, responsive design with beautiful gradients and animations
- ⚡ **Optimized Performance**: Advanced code splitting and bundle optimization
- 🔧 **Developer Friendly**: Hot reload, TypeScript, and comprehensive tooling

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+**
- **npm** (comes with Node.js)
- **OpenAI API Key** (for AI chat features)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd agent-elyra
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   # Create .env file
   echo "VITE_OPENAI_API_KEY=your_openai_api_key_here" > .env
   ```

4. **Start development server (PWA)**
   ```bash
   npm run dev
   ```
   Open http://localhost:5173 in your browser

## 🛠️ Development

### Available Scripts

| Command                   | Description                  | Output                   |
| ------------------------- | ---------------------------- | ------------------------ |
| `npm run dev`             | Start PWA development server | `http://localhost:5173`  |
| `npm run build`           | Build PWA for production     | `dist/` folder           |
| `npm run build:extension` | Build Chrome extension       | `extension-dist/` folder |
| `npm run preview`         | Preview PWA production build | Local server             |
| `npm run type-check`      | TypeScript type checking     | Console output           |

## 📁 Project Structure

```
agent-elyra/
├── src/
│   ├── agent/                    # 3D Agent System (React Three Fiber)
│   │   ├── components/           # Reusable 3D components
│   │   │   ├── Avatar.tsx        # GLB model loader with fallback
│   │   │   ├── Camera.tsx        # Camera controls
│   │   │   ├── Lighting.tsx      # Scene lighting setup
│   │   │   ├── Scene.tsx         # Main scene orchestrator
│   │   │   └── index.ts          # Component exports
│   │   ├── Agent.tsx             # Main Agent component
│   │   ├── config.ts             # Agent configuration
│   │   ├── types.ts              # TypeScript type definitions
│   │   ├── index.ts              # Main exports
│   │   ├── openai-service.ts     # OpenAI API integration
│   │   └── utils.ts              # Voice and animation utilities
│   ├── components/
│   │   ├── ChatInterface/        # AI chat interface
│   │   ├── VoiceInput/           # Voice input component
│   │   └── VoiceSelector/        # Voice selection component
│   ├── views/
│   │   ├── App.tsx               # Main PWA UI
│   │   └── ExtensionUI.tsx       # Chrome Extension popup UI
│   ├── index.tsx                 # PWA entry point
│   └── style/
│       ├── extension.css         # Extension styles
│       └── globals.css           # Global styles
├── extension/
│   ├── index.html                # Extension popup HTML
│   ├── popup.tsx                 # Extension popup entry
│   ├── background.ts             # Extension background script
│   ├── content.ts                # Extension content script
│   ├── inject.ts                 # Agent injection script
│   └── manifest.json             # Extension manifest
├── public/
│   ├── models/characters/        # 3D model assets
│   │   └── fox_character.glb     # Main avatar model
│   └── foxicon.jpg               # App icon
├── vite.config.ts                # Main Vite config (PWA)
├── vite.extension.config.ts      # Extension build config
├── tsconfig.json                 # TypeScript config
├── package.json                  # Dependencies and scripts
└── README.md                     # This file
```

## 🎯 Key Components

### Agent System (`src/agent/`)

- **`Agent.tsx`**: Main React Three Fiber component with error boundaries and performance optimizations
- **`components/`**: Modular 3D components (Avatar, Camera, Lighting, Scene)
- **`config.ts`**: Centralized configuration with proper TypeScript types
- **`types.ts`**: Comprehensive type definitions for type safety
- **`openai-service.ts`**: OpenAI API integration for AI responses
- **`utils.ts`**: Voice synthesis and animation utilities

### Chat System (`src/components/`)

- **`ChatInterface.tsx`**: Full-featured AI chat with message history
- **`VoiceInput.tsx`**: Voice recording and transcription component
- **`VoiceSelector.tsx`**: Voice selection for text-to-speech

### Views (`src/views/`)

- **`App.tsx`**: Complete PWA interface with welcome section and extension install
- **`ExtensionUI.tsx`**: Compact extension popup interface

### Extension (`extension/`)

- **`background.ts`**: Extension background script for state management
- **`content.ts`**: Content script for webpage injection
- **`inject.ts`**: Agent injection utilities (compatibility layer)
- **`popup.tsx`**: Extension popup interface

## ⚡ Performance Optimizations

### React Three Fiber Optimizations

- **Suspense**: Proper loading states with fallback components
- **Error Boundaries**: Graceful error handling for 3D rendering failures
- **Memoization**: Optimized re-renders with useCallback and useMemo
- **Lazy Loading**: GLB models loaded with Suspense
- **WebGL Context Management**: Proper context loss handling

### Build Optimizations

- **Code Splitting**: Separate vendor chunks for React, Three.js, and other dependencies
- **Terser Minification**: Advanced compression with console.log removal
- **Source Map Disabled**: Reduced bundle sizes for production
- **Optimized Dependencies**: Pre-bundled common dependencies

### Bundle Structure

```
Extension Build Output:
├── react-vendor-[hash].js     # React & ReactDOM (294 KB)
├── three-vendor-[hash].js     # Three.js & React Three Fiber (745 KB)
├── vendor-[hash].js           # Other dependencies (111 KB)
├── popup.js                   # Main extension logic (18 KB)
├── content.js                 # Content script (0.07 KB)
├── background.js              # Background service worker (0.29 KB)
└── manifest.json              # Extension manifest
```

## 🎨 UI Features

### Welcome Section

- **Extension Install Button**: One-click Chrome extension installation
- **Feature Highlights**: Showcases 3D avatar, voice response, and PWA capabilities
- **Modern Design**: Gradient backgrounds and smooth animations

### Chat Interface

- **Real-time AI Responses**: OpenAI integration for intelligent conversations
- **Voice Input/Output**: Speech-to-text and text-to-speech capabilities
- **Message History**: Persistent conversation tracking
- **Loading States**: Smooth typing indicators and error handling

### 3D Avatar (React Three Fiber)

- **GLB Model Support**: Loads custom 3D models with proper error handling
- **Smooth Animations**: Continuous rotation and interactive movements
- **Responsive Design**: Adapts to different screen sizes
- **WebGL Optimized**: 60fps performance with efficient rendering
- **Error Recovery**: Graceful fallback to geometric avatar on model failure
- **Performance Monitoring**: WebGL context loss detection and recovery

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

### Agent Configuration

The 3D agent is configured in `src/agent/config.ts`:

```typescript
export const AGENT_CONFIG: AgentConfig = {
  camera: {
    fov: 75,
    near: 0.1,
    far: 1000,
    initialPosition: new Vector3(0, 0, 3),
    target: new Vector3(0, 0, 0),
  },
  // ... more configuration
};
```

### PWA Configuration

Configured in `vite.config.ts`:

- Service worker for offline support
- Web app manifest for installation
- Auto-update registration
- Optimized build settings

### Extension Configuration

Uses Manifest V3 with:

- Background service worker
- Content script injection
- Popup interface
- Storage permissions
- Web accessible resources

## 🗣️ Voice Features

### Web Speech API Integration

```typescript
import { startVoiceResponse } from "./src/agent/utils";

// Trigger voice response
startVoiceResponse("Hello! I'm your 3D assistant.");
```

### Voice Input Component

- **Speech Recognition**: Real-time voice-to-text conversion
- **Visual Feedback**: Recording indicators and status messages
- **Error Handling**: Graceful fallbacks for unsupported browsers

## 🎭 Animation System

The 3D avatar features:

- **GLB Model Loading**: Support for custom 3D models with Suspense
- **Smooth Animations**: Continuous rotation and movement
- **Interactive Controls**: Mouse and touch interactions
- **Responsive Scaling**: Adapts to container size
- **Performance Optimized**: Efficient rendering pipeline
- **Error Recovery**: Automatic fallback to geometric avatar

## 🌐 Browser Support

- **PWA**: Modern browsers with PWA support (Chrome, Firefox, Safari, Edge)
- **Extension**: Chrome/Chromium-based browsers
- **Voice**: Browsers with Web Speech API support
- **3D**: WebGL-enabled browsers with React Three Fiber support

## 🚀 Building for Production

### PWA Build

```bash
npm run build
```

Creates `dist/` folder with:

- Optimized JavaScript bundles with code splitting
- Service worker for offline support
- Web app manifest
- Static assets and 3D models

### Extension Build

```bash
npm run build:extension
```

Creates `extension-dist/` folder with:

- Compiled extension scripts
- Optimized manifest file
- HTML popup with proper paths
- All necessary assets

## 🔍 Troubleshooting

### Common Issues

1. **Extension won't load**:

   - Ensure `manifest.json` is in the root of `extension-dist/`
   - Check that all referenced files exist
   - Verify Chrome developer mode is enabled

2. **Voice not working**:

   - Ensure browser supports Web Speech API
   - Check microphone permissions
   - Test on HTTPS (required for voice features)

3. **AI chat not responding**:

   - Verify OpenAI API key is set in `.env`
   - Check network connectivity
   - Review browser console for errors

4. **3D not rendering**:
   - Verify WebGL support in browser
   - Check for graphics driver updates
   - Ensure 3D model files are accessible
   - Check for React Three Fiber compatibility

### Development Tips

- Use React DevTools to debug React Three Fiber components
- Check extension background page for errors
- Monitor service worker in Application tab
- Test PWA installation on HTTPS
- Use `npm run type-check` for TypeScript validation
- Monitor WebGL context in browser dev tools

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test both PWA and extension modes
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔮 Future Enhancements

- [ ] **Advanced AI Features**: Multi-turn conversations and context awareness
- [ ] **Custom 3D Models**: User-uploadable GLB/GLTF models
- [ ] **Advanced Animations**: Gesture recognition and facial expressions
- [ ] **Multi-language Support**: Internationalization and localization
- [ ] **Extension Settings**: Configurable preferences and themes
- [ ] **Offline AI**: Local AI models for privacy-focused usage
- [ ] **Advanced PWA Features**: Background sync and push notifications
- [ ] **Mobile Optimization**: Touch gestures and mobile-specific UI
- [ ] **Plugin System**: Extensible architecture for custom features
- [ ] **Analytics Dashboard**: Usage statistics and performance metrics

## 🙏 Acknowledgments

- **React Three Fiber** for declarative 3D graphics
- **Three.js** for 3D graphics capabilities
- **OpenAI** for AI chat integration
- **Vite** for fast build tooling
- **React** for component architecture
- **TypeScript** for type safety
