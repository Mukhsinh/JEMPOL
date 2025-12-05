# 💳 JEMPOL - Jembatan Pembayaran Online

Platform web responsif yang lengkap untuk menampilkan inovasi JEMPOL (Jembatan Pembayaran Online) dari RSUD Bendan Kota Pekalongan, dengan fitur pendaftaran pengunjung, galeri multimedia, dan game interaktif "Innovation Catcher".

## ✨ Fitur Utama

### 📝 Daftar Pengunjung
- Form registrasi dengan validasi lengkap
- Validasi nomor handphone Indonesia
- Export data ke CSV
- Search & filter pengunjung

### 🎨 Galeri Inovasi JEMPOL
- Upload materi PowerPoint (PPT, PPTX) - dapat dibaca dan didownload
- Upload Video tutorial (MP4, WEBM, AVI) - dapat diputar langsung
- Preview & download konten
- Filter berdasarkan tipe
- View counter

### 🎮 Game "Innovation Catcher"
- Mode Single Player & Multiplayer
- Kontrol mouse & touch (mobile-friendly)
- Sistem scoring dengan level progression
- Leaderboard real-time
- Responsive di semua device

### 👨‍💼 Admin Panel
- Upload management untuk konten inovasi
- Visitor data management
- Export data pengunjung
- Dashboard analytics

### 📱 Responsive Design
- Mobile-first approach
- Tablet optimization
- Desktop full experience
- No horizontal overflow
- Touch-optimized controls

## 🛠 Tech Stack

### Frontend
- **React 18** + TypeScript
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **HTML5 Canvas** - Game engine
- **Axios** - HTTP client
- **React Router** - Navigation

### Backend
- **Node.js** + Express
- **TypeScript**
- **MongoDB** + Mongoose
- **Socket.io** - Real-time (multiplayer)
- **Multer** - File upload
- **CORS** - Cross-origin support

### Testing
- **Vitest** - Unit testing
- **fast-check** - Property-based testing
- **React Testing Library** - Component testing

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- MongoDB (local atau Atlas)
- npm atau yarn

### Quick Start

1. **Clone & Install**
```bash
git clone <repository-url>
cd innovation-landing-page
npm install
```

2. **Setup Environment**
```bash
# Backend environment
cp backend/.env.example backend/.env

# Edit backend/.env:
# PORT=5000
# MONGODB_URI=mongodb://localhost:27017/innovation-landing-page
# MAX_FILE_SIZE_MB=50

# Frontend environment (optional)
cp frontend/.env.example frontend/.env
# VITE_API_URL=http://localhost:5000/api
```

3. **Start MongoDB**
```bash
# If using local MongoDB
mongod
```

4. **Run Development Servers**
```bash
npm run dev
```

Aplikasi akan berjalan di:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000

## 🎯 Usage

### Untuk Pengunjung
1. Buka http://localhost:3000
2. Isi form pendaftaran
3. Jelajahi galeri inovasi
4. Main game "Innovation Catcher"
5. Lihat leaderboard

### Untuk Admin
1. Buka http://localhost:3000/admin
2. Upload konten inovasi (PowerPoint/Video)
3. Lihat & export data pengunjung
4. Monitor aktivitas

## 🧪 Testing

```bash
# Run all tests
npm test

# Frontend tests only
npm run test:frontend

# Backend tests only
npm run test:backend

# Watch mode
npm run test:watch
```

### Property-Based Tests
Aplikasi ini menggunakan property-based testing untuk memastikan correctness:
- Form validation properties
- Phone number format validation
- File upload validation
- Responsive layout properties
- Navigation behavior
- Leaderboard sorting

## 🏗 Build & Deploy

### Build for Production
```bash
npm run build
```

### Deploy Frontend
```bash
cd frontend
npm run build
# Deploy dist/ folder ke Vercel, Netlify, atau hosting lainnya
```

### Deploy Backend
```bash
cd backend
npm run build
# Deploy ke Railway, Render, Heroku, atau VPS
```

### Environment Variables (Production)
```bash
# Backend
PORT=5000
MONGODB_URI=<your-mongodb-atlas-uri>
NODE_ENV=production
MAX_FILE_SIZE_MB=50

# Frontend
VITE_API_URL=<your-backend-url>/api
```

## 📁 Project Structure

```
innovation-landing-page/
├── frontend/                    # React Frontend
│   ├── src/
│   │   ├── components/         # UI Components
│   │   │   ├── layout/        # Layout components
│   │   │   ├── ui/            # Reusable UI (Button, Input, etc)
│   │   │   ├── visitor/       # Visitor registration
│   │   │   ├── innovation/    # Gallery components
│   │   │   ├── game/          # Game components
│   │   │   └── admin/         # Admin panel
│   │   ├── pages/             # Page components
│   │   ├── services/          # API services
│   │   ├── game/              # Game engine logic
│   │   ├── utils/             # Utilities & validation
│   │   ├── types/             # TypeScript types
│   │   └── test/              # Test utilities
│   ├── public/                # Static assets
│   └── index.html
│
├── backend/                     # Express Backend
│   ├── src/
│   │   ├── models/            # MongoDB models
│   │   │   ├── Visitor.ts
│   │   │   ├── Innovation.ts
│   │   │   └── GameScore.ts
│   │   ├── controllers/       # Route controllers
│   │   ├── routes/            # API routes
│   │   ├── config/            # Configuration
│   │   │   ├── database.ts
│   │   │   └── multer.ts
│   │   ├── utils/             # Utilities
│   │   └── server.ts          # Entry point
│   └── uploads/               # Uploaded files
│
└── .kiro/specs/                # Project specifications
    └── innovation-landing-page/
        ├── requirements.md     # Requirements document
        ├── design.md          # Design document
        └── tasks.md           # Implementation tasks
```

## 🎮 Game Controls

### Desktop
- **Mouse**: Gerakkan mouse untuk mengontrol basket
- **Pause**: Klik tombol pause

### Mobile/Tablet
- **Touch**: Geser layar untuk menggerakkan basket
- **Pause**: Tap tombol pause

### Gameplay
- 🟢 **Item Hijau**: +10 poin
- 🔴 **Item Merah**: -5 poin, -1 nyawa
- 🟡 **Item Emas**: +50 poin (bonus)
- 📈 **Level Up**: Setiap 100 poin
- ⚡ **Speed**: Meningkat setiap level

## 🔒 Security Features

- Input sanitization
- File type validation
- File size limits
- CORS configuration
- MongoDB injection prevention
- XSS protection

## 🚀 Performance

- Code splitting
- Lazy loading
- Image optimization
- API response caching
- Database indexing
- Efficient game rendering (30+ FPS)

## 📝 API Endpoints

### Visitors
- `POST /api/visitors` - Register visitor
- `GET /api/visitors` - Get all visitors
- `GET /api/visitors/export` - Export to CSV

### Innovations
- `GET /api/innovations` - Get all innovations
- `POST /api/innovations` - Upload innovation
- `DELETE /api/innovations/:id` - Delete innovation
- `POST /api/innovations/:id/view` - Increment view

### Game
- `POST /api/game/score` - Submit score
- `GET /api/game/leaderboard` - Get leaderboard

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

MIT License - feel free to use this project for your needs!

## 👨‍💻 Development

Built with ❤️ using modern web technologies and best practices including:
- TypeScript for type safety
- Property-based testing for correctness
- Responsive design principles
- Clean architecture
- RESTful API design

---

**Happy Coding! 🎉**
