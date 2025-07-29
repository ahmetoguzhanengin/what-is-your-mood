# What Is Your Mood? - Meme Bazlı Kart Oyunu

## 📱 Proje Özeti
"What Is Your Mood?" gerçek zamanlı çok oyunculu meme bazlı kart oyunu. Oyuncular belirli durumlara en uygun meme'i seçerek puan kazanır.

## 🎯 Tamamlanan Özellikler

### ✅ Authentication Sistemi
- **Supabase Auth entegrasyonu**
- **Kayıt/Giriş ekranları**
- **E-posta doğrulama**
- **JWT token yönetimi**
- **Otomatik session yenileme**

### ✅ Database & Backend (Supabase + Node.js)
- **Supabase PostgreSQL Database:**
  - Kapsamlı şema (users, games, players, meme_cards, prompts, votes, vb.)
  - Row Level Security (RLS) politikaları
  - Otomatik triggers ve functions
  - İstatistik tabloları
- **REST API Endpoints:**
  - Authentication endpoints (signup, signin, signout)
  - `POST /api/games` - Yeni oyun oluştur (auth required)
  - `POST /api/games/:gameCode/join` - Oyuna katıl (auth required)
- **Socket.io Events:**
  - `join_game` - Oyun odasına katıl
  - `start_game` - Oyunu başlat
  - `submit_card` - Kart gönder
  - `submit_vote` - Oy ver
- **Özellikler:**
  - Database-driven oyun yönetimi
  - Gerçek zamanlı skor takibi
  - Kullanıcı istatistikleri
  - Oyun geçmişi

### ✅ Frontend (React Native + TypeScript)
- **Authentication Ekranları:**
  - **AuthScreen** - Hoş geldin ekranı
  - **SignUpScreen** - Kayıt ekranı
  - **SignInScreen** - Giriş ekranı
- **Ana Oyun Ekranları:**
  - **HomeScreen** - Kullanıcı profili ve oyun başlatma
  - **LobbyScreen** - Oyuncu bekleme lobisi
  - **GameScreen** - Ana oyun ekranı
- **Özellikler:**
  - Dual context system (Auth + Game)
  - Kullanıcı istatistikleri görüntüleme
  - Modern authentication flow
  - Session yönetimi
  - Socket.io client entegrasyonu

### ✅ User Experience & UI/UX
- **Responsive tasarım**
- **Dark theme**
- **Modern UI komponenleri**
- **Loading states**
- **Error handling**
- **İstatistik dashboard'ı**
- **Kullanıcı profil yönetimi**

### ✅ Teknik Altyapı
- **State Management:** Dual React Context (Auth + Game)
- **Database:** Supabase PostgreSQL
- **Authentication:** Supabase Auth
- **Networking:** REST API + Socket.io
- **Navigation:** React Navigation v6
- **Styling:** React Native StyleSheet
- **Image Handling:** Expo Image
- **Real-time:** Socket.io + Supabase subscriptions

## 🗂️ Proje Yapısı

```
mood-meme-game/
├── backend/                          # Node.js Backend
│   ├── server.js                     # Ana server dosyası
│   ├── package.json                  # Backend bağımlılıkları
│   ├── env.example                   # Environment template
│   └── .env                          # Environment variables (local)
│
├── database/                         # Supabase Database
│   ├── schema.sql                    # Database şeması ve tablolar
│   └── sample-data.sql               # Başlangıç verileri (meme'ler, prompts)
│
├── src/                              # React Native Frontend
│   ├── components/                   # Reusable components
│   │   ├── common/                   # Genel bileşenler
│   │   └── game/                     # Oyun spesifik bileşenler
│   ├── screens/                      # Ekranlar
│   │   ├── auth/                     # Authentication ekranları
│   │   │   ├── AuthScreen.tsx        # Hoş geldin ekranı
│   │   │   ├── SignUpScreen.tsx      # Kayıt ekranı
│   │   │   └── SignInScreen.tsx      # Giriş ekranı
│   │   ├── home/
│   │   │   └── HomeScreen.tsx        # Ana sayfa + istatistikler
│   │   ├── lobby/
│   │   │   └── LobbyScreen.tsx       # Lobi ekranı
│   │   ├── game/
│   │   │   └── GameScreen.tsx        # Oyun ekranı
│   │   └── results/                  # Sonuç ekranları
│   ├── services/                     # API ve Servisler
│   │   ├── supabase.ts               # Supabase client ve types
│   │   └── socket.ts                 # Socket.io client
│   ├── context/
│   │   ├── AuthContext.tsx           # Authentication state management
│   │   └── GameContext.tsx           # Game state management
│   ├── types/                        # TypeScript types
│   └── utils/                        # Utility functions
│
├── App.tsx                           # Ana uygulama komponenti
├── app.json                          # Expo configuration
├── package.json                      # Frontend bağımlılıkları
├── env.example                       # Frontend environment template
├── .env                              # Frontend environment variables (local)
├── README.MD                         # Orijinal proje açıklaması
├── PROJE-DOKUMANI.md                 # Detaylı proje dokümantasyonu
└── SETUP.md                          # Kurulum rehberi
```

## 🚀 Kurulum ve Çalıştırma

### Gereksinimler
- Node.js (v16+)
- npm veya yarn
- Expo CLI
- Expo Go mobil uygulaması

### 1. Projeyi İndir
```bash
git clone [proje-repo-url]
cd what-is-your-mood/mood-meme-game
```

### 2. Backend Kurulumu
```bash
# Backend klasörüne git
cd backend

# Paketleri yükle
npm install

# Environment dosyasını ayarla
cp .env.example .env  # gerekirse

# Sunucuyu başlat
npm run dev
```

Backend şu portta çalışacak: `http://localhost:3000`

### 3. Frontend Kurulumu
```bash
# Ana proje klasörüne dön
cd ..

# Paketleri yükle  
npm install

# IP adresini güncelle (gerekirse)
# src/context/GameContext.tsx ve src/services/socket.ts dosyalarında
# localhost yerine bilgisayarın IP adresini yaz

# Uygulamayı başlat
npm start
```

### 4. Mobil Test
1. Telefonda **Expo Go** uygulamasını indir
2. QR kodu tara
3. Uygulama telefonunda açılacak

## 🎮 Oyun Akışı

### 1. Ana Sayfa
- Kullanıcı adı gir
- "Yeni Oyun Oluştur" veya "Oyuna Katıl" seç

### 2. Lobi
- Oyun kodu gösterilir
- Diğer oyuncular katılabilir
- Host oyunu başlatır (min 3 oyuncu)

### 3. Oyun
- Her turda bir durum/soru gösterilir
- Oyuncular ellerindeki meme'lerden birini seçer
- Oylama: En komik kartı seç
- 7 tur sonunda oyun biter

## 🛠️ Kullanılan Teknolojiler

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Socket.io** - Real-time communication
- **uuid** - Unique ID generation
- **cors** - Cross-origin resource sharing
- **dotenv** - Environment variables

### Frontend
- **React Native** - Mobile framework
- **Expo** - Development platform
- **TypeScript** - Type safety
- **React Navigation** - Navigation
- **Socket.io Client** - Real-time client
- **Expo Image** - Optimized images

## 🔧 Yapılandırma

### Backend Environment (.env)
```env
PORT=3000
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
NODE_ENV=development
```

### Network Configuration
- Backend IP: `192.168.1.103:3000` (yerel ağ)
- Frontend bu IP'ye bağlanır
- Socket.io aynı portu kullanır

## 📊 API Endpoints

### POST /api/games
Yeni oyun oluşturur
```json
{
  "username": "string"
}
```

**Response:**
```json
{
  "success": true,
  "gameCode": "ABC123",
  "playerId": "uuid",
  "game": { ... },
  "player": { ... }
}
```

### POST /api/games/:gameCode/join
Mevcut oyuna katılır
```json
{
  "username": "string"
}
```

## 🎯 Socket.io Events

### Client → Server
- `join_game` - Oyun odasına katıl
- `start_game` - Oyunu başlat
- `submit_card` - Kart seç
- `submit_vote` - Oy ver

### Server → Client
- `player_joined` - Yeni oyuncu katıldı
- `player_left` - Oyuncu ayrıldı
- `game_started` - Oyun başladı
- `voting_started` - Oylama başladı
- `round_ended` - Tur bitti
- `game_ended` - Oyun bitti

## 🗄️ Veri Modelleri

### Game
```typescript
type Game = {
  id: string;
  code: string;
  host_id: string;
  status: 'waiting' | 'in_progress' | 'finished';
  current_round: number;
  max_rounds: number;
  created_at: string;
}
```

### Player
```typescript
type Player = {
  id: string;
  game_id: string;
  username: string;
  score: number;
  is_host: boolean;
  is_connected: boolean;
}
```

### MemeCard
```typescript
type MemeCard = {
  id: string;
  image_url: string;
  title: string;
  tags: string[];
  is_turkish: boolean;
}
```

## 🎨 UI/UX Özellikleri

### Tasarım Sistemi
- **Renkler:** Dark theme (#1F2937 base)
- **Accent:** Purple (#8B5CF6)
- **Typography:** System fonts
- **Layout:** Mobile-first, responsive

### Ekran Özellikleri
- **HomeScreen:** Giriş ve oyun seçenekleri
- **LobbyScreen:** Oyuncu listesi, oyun kodu paylaşımı
- **GameScreen:** Kart seçimi, oylama, sonuçlar

## 🔜 Gelecek Özellikler

### Kısa Vadeli
- [ ] Gerçek meme API entegrasyonu (Imgflip/GIPHY)
- [ ] Oyun sonuçları detay ekranı
- [ ] Ses efektleri ve animasyonlar
- [ ] Push notifications
- [ ] Production deployment

### Orta Vadeli
- [ ] Kendi meme yükleme özelliği
- [ ] Gelişmiş oyuncu profilleri
- [ ] Arkadaş sistemi
- [ ] Liderlik tabloları
- [ ] Türkçe/İngilizce dil değiştirme

### Uzun Vadeli
- [ ] Offline mod
- [ ] Yapay zeka meme önerileri
- [ ] Klan/grup sistemi
- [ ] Tournament modu
- [ ] Video meme desteği

## ✅ Çözülen Sorunlar
- ~~Backend localhost ile çalışıyor~~ → ✅ Environment-based configuration
- ~~Supabase henüz yapılandırılmadı~~ → ✅ Tam Supabase entegrasyonu
- ~~Real-time oyun akışı tamamlanmadı~~ → ✅ Socket.io + Database entegrasyonu
- ~~Kullanıcı yönetimi yoktu~~ → ✅ Authentication sistemi
- ~~İstatistik sistemi yoktu~~ → ✅ Kullanıcı stats dashboard'ı

## 🤝 Katkıda Bulunma
1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📝 Lisans
Bu proje MIT lisansı altında lisanslanmıştır.

## 👨‍💻 Geliştirici
**Ahmet Oğuzhan Engin**
- GitHub: [@ahmetoguzhanengin](https://github.com/ahmetoguzhanengin)
- LinkedIn: [ahmetoguzhanengin](https://linkedin.com/in/ahmetoguzhanengin)

---

**Son Güncelleme:** 28 Temmuz 2025
**Proje Durumu:** ✅ Full-Stack MVP Tamamlandı - Production Ready 🚀

### 📊 Tamamlama Oranı
- **Backend:** 100% ✅ (Supabase + Node.js + Socket.io)
- **Authentication:** 100% ✅ (Kayıt/Giriş + JWT + RLS)
- **Database:** 100% ✅ (PostgreSQL + triggers + sample data)
- **Frontend:** 95% ✅ (Auth ekranları + Game flow + Stats)
- **Real-time:** 100% ✅ (Socket.io + Database sync)
- **User Experience:** 90% ✅ (Modern UI + Error handling)

**Toplam:** ~96% Tamamlandı 🎉 