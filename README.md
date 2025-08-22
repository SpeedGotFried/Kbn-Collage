# QuantumChat - Quantum-Safe Secure Messaging Platform

[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110.0-green.svg)](https://fastapi.tiangolo.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.17-38B2AC.svg)](https://tailwindcss.com/)
[![Three.js](https://img.shields.io/badge/Three.js-0.179.1-000000.svg)](https://threejs.org/)

A next-generation secure messaging platform featuring quantum-safe encryption, immersive 3D visual effects, and advanced privacy features. Built with React, TypeScript, FastAPI, and cutting-edge web technologies.

## 🌟 Features

### 🔐 Security & Privacy
- **Quantum-Safe Encryption**: Post-quantum cryptography for future-proof security
- **End-to-End Encryption**: Messages encrypted client-side before transmission
- **Incognito Mode**: Password-protected private conversations with auto-delete
- **OTP Authentication**: Secure phone-based verification with Twilio SMS
- **JWT Tokens**: Stateless authentication with secure token management

### 🎨 Immersive 3D Experience
- **Quantum Avatars**: Mood-reactive 3D avatars that glow based on status
- **Teleport Messages**: Animated message delivery with comet-like effects
- **Floating Particles**: Dynamic 3D particle systems using Three.js
- **Wave Backgrounds**: Animated wave effects for immersive atmosphere
- **File Cubes**: 3D encrypted cubes that unfold to reveal files

### 💬 Advanced Messaging
- **Real-time Chat**: Instant message delivery with WebSocket support
- **File Sharing**: Secure encrypted file transfer with 3D visualizations
- **Mood Detection**: AI-powered sentiment analysis for dynamic UI
- **Contact Management**: QR code-based friend discovery and management
- **Message Animations**: Smooth transitions and micro-interactions

### 🎯 User Experience
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Dark/Light Themes**: Dynamic theme switching with CSS variables
- **Accessibility**: ARIA-compliant components with keyboard navigation
- **Performance**: Optimized rendering with React Query and lazy loading
- **Modern UI**: Built with shadcn/ui components and Tailwind CSS

## 🏗️ Architecture

### Frontend (React + TypeScript)
```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── 3d/             # Three.js 3D components
│   │   ├── chat/           # Chat-related components
│   │   ├── profile/        # User profile components
│   │   ├── qr/             # QR code components
│   │   └── ui/             # Base UI components (shadcn/ui)
│   ├── pages/              # Route components
│   ├── hooks/              # Custom React hooks
│   ├── types/              # TypeScript type definitions
│   ├── lib/                # Utility functions
│   └── integrations/       # External service integrations
├── public/                 # Static assets
└── package.json            # Dependencies and scripts
```

### Backend (FastAPI + Python)
```
backend/
├── main.py                 # FastAPI application entry point
├── auth.py                 # Authentication and user management
├── chat.py                 # Chat functionality and encryption
├── friends.py              # Friend management and QR generation
├── crypto.py               # Cryptographic operations
├── otp_sender.py           # OTP SMS delivery via Twilio
├── schema.sql              # Database schema
└── requirements.txt        # Python dependencies
```

### Database Schema
- **Users**: User accounts with public/private key pairs
- **Friends**: Friend relationships and requests
- **Messages**: Encrypted message storage
- **Signup Users**: User registration data
- **OTP Verifications**: One-time password management

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Python 3.8+
- PostgreSQL database
- Twilio account (for SMS)
- Supabase account (for backend)

### Frontend Setup

1. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Environment configuration**
   Create `.env.local` file:
   ```env
   VITE_API_URL=http://localhost:8000
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

### Backend Setup

1. **Install dependencies**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Environment configuration**
   Create `.env` file:
   ```env
   # Supabase Configuration
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   
   # JWT Configuration
   JWT_SECRET=your_jwt_secret
   
   # Twilio SMS Configuration
   TWILIO_ACCOUNT_SID=your_twilio_account_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   TWILIO_PHONE_NUMBER=your_twilio_phone_number
   
   # Server Configuration
   PORT=8000
   ```

3. **Database setup**
   ```bash
   python setup_database.py
   ```

4. **Start server**
   ```bash
   python main.py
   ```

## 📱 Usage

### Authentication Flow
1. **Phone Verification**: Enter phone number to receive OTP
2. **OTP Verification**: Enter received OTP for authentication
3. **User Creation**: Complete profile setup with name and email
4. **Login**: Use phone number for subsequent logins

### Adding Friends
1. **QR Code Scan**: Scan friend's QR code using camera
2. **Manual Entry**: Enter friend's 16-digit user ID
3. **Friend Request**: Send and manage friend requests
4. **Accept/Decline**: Handle incoming friend requests

### Chat Features
1. **Secure Messaging**: End-to-end encrypted conversations
2. **File Sharing**: Drag-and-drop file sharing with encryption
3. **Incognito Mode**: Password-protected private conversations
4. **Mood Detection**: AI-powered sentiment analysis
5. **3D Effects**: Immersive visual feedback and animations

## 🔧 API Endpoints

### Authentication
- `POST /v1/auth/send-otp` - Send OTP to phone number
- `POST /v1/auth/verify-otp` - Verify OTP and authenticate
- `POST /v1/auth/signup` - Complete user registration
- `POST /v1/auth/incognito/set` - Set incognito mode password
- `POST /v1/auth/incognito/verify` - Verify incognito password

### Profile Management
- `GET /v1/profile/me` - Get current user profile
- `GET /v1/profile/qr` - Generate QR code for friend discovery

### Friends
- `POST /v1/friends/request` - Send friend request
- `GET /v1/friends/requests` - Get pending friend requests
- `POST /v1/friends/respond` - Accept/decline friend request
- `GET /v1/friends/list` - Get list of friends

### Chat
- `POST /v1/chat/send` - Send encrypted message
- `GET /v1/chat/messages/{friend_id}` - Get conversation history
- `GET /v1/chat/conversations` - Get all conversations

## 🎨 UI Components

### 3D Components
- **FloatingParticles**: Dynamic particle system with Three.js
- **WaveBackground**: Animated wave effects
- **UnlockAnimation**: 3D unlock sequence
- **FileCube**: 3D file representation

### Chat Components
- **ChatWindow**: Main chat interface
- **ContactSidebar**: Contact list and management
- **ChatBubble**: Individual message display
- **QuantumAvatar**: Status-aware user avatars
- **TeleportOrb**: Message delivery animations

### UI Components
Built with shadcn/ui for consistent design:
- Buttons, inputs, modals, and form components
- Responsive layouts and accessibility features
- Theme switching and dark mode support

## 🔒 Security Features

### Encryption
- **Post-Quantum Cryptography**: Future-proof encryption algorithms
- **End-to-End Encryption**: Client-side encryption before transmission
- **Key Management**: Secure key generation and storage
- **File Encryption**: Encrypted file transfer and storage

### Privacy
- **Incognito Mode**: Password-protected private conversations
- **Auto-Delete**: Configurable message expiration
- **No Message Logging**: Server doesn't store decrypted content
- **Anonymous IDs**: 16-digit user identifiers for privacy

### Authentication
- **Phone Verification**: SMS-based OTP authentication
- **JWT Tokens**: Secure stateless authentication
- **Session Management**: Automatic token refresh
- **Access Control**: Route protection and authorization

## 🚀 Performance Optimizations

### Frontend
- **React Query**: Efficient data fetching and caching
- **Lazy Loading**: Component and route lazy loading
- **Memoization**: Optimized re-rendering with useMemo/useCallback
- **Bundle Splitting**: Code splitting for faster initial load

### Backend
- **Async/Await**: Non-blocking I/O operations
- **Database Indexing**: Optimized query performance
- **Connection Pooling**: Efficient database connections
- **Caching**: Response caching for static data

## 🧪 Testing

### Frontend Testing
```bash
npm run test          # Run test suite
npm run test:watch    # Watch mode for development
npm run test:coverage # Generate coverage report
```

### Backend Testing
```bash
pytest               # Run all tests
pytest -v            # Verbose output
pytest --cov         # Coverage report
```

## 📦 Deployment

### Frontend Deployment
```bash
npm run build        # Build for production
npm run preview      # Preview production build
```

### Backend Deployment
```bash
# Using uvicorn
uvicorn main:app --host 0.0.0.0 --port 8000

# Using Docker
docker build -t quantumchat-backend .
docker run -p 8000:8000 quantumchat-backend
```

### Environment Variables
Ensure all required environment variables are set in production:
- Database connection strings
- API keys and secrets
- CORS origins
- SSL certificates

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open pull request**

### Development Guidelines
- Follow TypeScript best practices
- Use conventional commit messages
- Maintain test coverage above 80%
- Follow the existing code style
- Add documentation for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **shadcn/ui** for beautiful UI components
- **Three.js** for 3D graphics capabilities
- **Framer Motion** for smooth animations
- **Tailwind CSS** for utility-first styling
- **FastAPI** for high-performance backend
- **Supabase** for backend-as-a-service

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-repo/discussions)
- **Documentation**: [Wiki](https://github.com/your-repo/wiki)

---

**QuantumChat** - Experience the future of secure messaging with immersive 3D effects and quantum-safe encryption. 🚀✨
