# Agentic Assistant

An intelligent 3D assistant app with AI chat capabilities, built with Vite, React, TypeScript, and Three.js. Works as both a Progressive Web App (PWA) and Chrome Extension with optimized performance and modern features.

**Author:** Agentic Assistant Team  
**Version:** 1.0.0  
**License:** MIT

## ✨ Features

- 🤖 **3D Avatar**: Interactive Three.js avatar with smooth animations and GLB model support
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

| Command | Description | Output |
|---------|-------------|---------|
| `npm run dev` | Start PWA development server | `http://localhost:5173` |
| `npm run build` | Build PWA for production | `dist/` folder |
| `npm run build:extension` | Build Chrome extension | `extension-dist/` folder |
| `npm run preview` | Preview PWA production build | Local server |
| `npm run type-check` | Run TypeScript type checking | Console output |

### PWA Development

The main app runs as a Progressive Web App:

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Chrome Extension Development

Build and load the Chrome Extension:

```bash
# Build extension
npm run build:extension
```

## 🔌 Chrome Extension Setup

### Step-by-Step Loading Instructions

1. **Build the extension**
   ```bash
   npm run build:extension
   ```

2. **Open Chrome Extensions**
   - Go to `chrome://extensions/`
   - Or: **Chrome Menu** → **More Tools** → **Extensions**

3. **Enable Developer Mode**
   - Toggle **"Developer mode"** to **ON** (top-right corner)

4. **Load the Extension**
   - Click **"Load unpacked"**
   - Navigate to: `C:\Users\khamu\Repos\Agentic\agent-elyra\extension-dist`
   - Select the `extension-dist` folder
   - Click **"Select Folder"**

5. **Verify Installation**
   - **"Agentic Assistant"** should appear in your extensions list
   - The **fox icon** should appear in your Chrome toolbar
   - Click the icon to open the popup

### Extension Features

- **Compact 3D Assistant**: Available in a popup from any webpage
- **Voice Interaction**: Click the speak button for voice responses
- **Cross-Site Functionality**: Works on any website you visit
- **Persistent Access**: Available across all your browsing sessions

## 📁 Project Structure

```
agentic-assistant/
├── public/
│   ├── manifest.web.json             # PWA manifest
│   ├── manifest.extension.json       # Chrome Extension manifest
│   ├── foxicon.jpg                   # App icon
│   ├── sw.js                         # Service worker
│   ├── models/                       # 3D models
│   └── textures/                     # Texture files
├── src/
│   ├── agent/
│   │   ├── index.ts                  # Three.js agent initialization
│   │   ├── openai-service.ts         # OpenAI API integration
│   │   ├── utils.ts                  # Voice and animation utilities
│   │   └── avatar.glb                # 3D model
│   ├── components/
│   │   ├── ChatInterface.tsx         # AI chat interface
│   │   └── VoiceInput.tsx            # Voice input component
│   ├── views/
│   │   ├── App.tsx                   # Main PWA UI
│   │   └── ExtensionUI.tsx           # Chrome Extension popup UI
│   ├── index.tsx                     # PWA entry point
│   └── style/
│       └── globals.css               # Global styles
├── extension/
│   ├── index.html                    # Extension popup HTML
│   ├── popup.tsx                     # Extension popup entry
│   ├── background.ts                 # Extension background script
│   ├── content.ts                    # Extension content script
│   └── inject.ts                     # Agent injection script
├── vite.config.ts                    # Main Vite config (PWA)
├── vite.extension.config.ts          # Extension build config
├── tsconfig.json                     # TypeScript config
├── package.json                      # Dependencies and scripts
└── README.md                         # This file
```

## 🎯 Key Components

### Agent System (`src/agent/`)

- **`index.ts`**: Three.js scene setup with GLB model loading
- **`openai-service.ts`**: OpenAI API integration for AI responses
- **`utils.ts`**: Voice synthesis and animation utilities
- **`avatar.glb`**: 3D model for the assistant

### Chat System (`src/components/`)

- **`ChatInterface.tsx`**: Full-featured AI chat with message history
- **`VoiceInput.tsx`**: Voice recording and transcription component

### Views (`src/views/`)

- **`App.tsx`**: Complete PWA interface with welcome section and extension install
- **`ExtensionUI.tsx`**: Compact extension popup interface

### Extension (`extension/`)

- **`background.ts`**: Extension background script for state management
- **`content.ts`**: Content script for webpage injection
- **`inject.ts`**: Agent injection utilities
- **`popup.tsx`**: Extension popup interface

## ⚡ Performance Optimizations

### Build Optimizations

- **Code Splitting**: Separate vendor chunks for React, Three.js, and other dependencies
- **Terser Minification**: Advanced compression with console.log removal
- **Source Map Disabled**: Reduced bundle sizes for production
- **Optimized Dependencies**: Pre-bundled common dependencies

### Bundle Structure

```
Extension Build Output:
├── react-vendor-[hash].js     # React & ReactDOM (133 KB)
├── three-vendor-[hash].js     # Three.js library (548 KB)
├── vendor-[hash].js           # Other dependencies (3.9 KB)
├── popup.js                   # Main extension logic (1.9 KB)
├── content.js                 # Content script (2.6 KB)
├── background.js              # Background service worker (621 B)
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

### 3D Avatar
- **GLB Model Support**: Loads custom 3D models
- **Smooth Animations**: Continuous rotation and interactive movements
- **Responsive Design**: Adapts to different screen sizes
- **WebGL Optimized**: 60fps performance with efficient rendering

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_OPENAI_API_KEY=your_openai_api_key_here
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
import { startVoiceResponse } from './src/agent/utils';

// Trigger voice response
startVoiceResponse("Hello! I'm your 3D assistant.");
```

### Voice Input Component

- **Speech Recognition**: Real-time voice-to-text conversion
- **Visual Feedback**: Recording indicators and status messages
- **Error Handling**: Graceful fallbacks for unsupported browsers

## 🎭 Animation System

The 3D avatar features:
- **GLB Model Loading**: Support for custom 3D models
- **Smooth Animations**: Continuous rotation and movement
- **Interactive Controls**: Mouse and touch interactions
- **Responsive Scaling**: Adapts to container size
- **Performance Optimized**: Efficient rendering pipeline

## 🌐 Browser Support

- **PWA**: Modern browsers with PWA support (Chrome, Firefox, Safari, Edge)
- **Extension**: Chrome/Chromium-based browsers
- **Voice**: Browsers with Web Speech API support
- **3D**: WebGL-enabled browsers

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

### Development Tips

- Use browser dev tools to debug Three.js scenes
- Check extension background page for errors
- Monitor service worker in Application tab
- Test PWA installation on HTTPS
- Use `npm run type-check` for TypeScript validation

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

- **Three.js** for 3D graphics capabilities
- **OpenAI** for AI chat integration
- **Vite** for fast build tooling
- **React** for component architecture
- **TypeScript** for type safety 