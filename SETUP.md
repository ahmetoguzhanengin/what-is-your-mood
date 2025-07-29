# What Is Your Mood? - Kurulum Rehberi

Bu rehber, Supabase entegrasyonlu meme kart oyununu kurmak ve çalıştırmak için adım adım talimatları içerir.

## 📋 Gereksinimler

- **Node.js** (v16 veya üzeri)
- **npm** veya **yarn**
- **Expo CLI** (`npm install -g expo-cli`)
- **Expo Go** mobil uygulaması (test için)
- **Supabase Hesabı** (ücretsiz)

## 🚀 Kurulum Adımları

### 1. Projeyi İndirin

```bash
git clone [proje-repo-url]
cd what-is-your-mood/mood-meme-game
```

### 2. Supabase Projesi Oluşturun

1. [Supabase](https://supabase.com) sitesine gidin ve hesap oluşturun
2. "New Project" ile yeni proje oluşturun
3. Proje ayarlarından şu bilgileri alın:
   - **Project URL** (Settings → API → URL)
   - **Anon Key** (Settings → API → anon public)
   - **Service Role Key** (Settings → API → service_role) 

### 3. Supabase Database Kurulumu

1. Supabase dashboard'unda **SQL Editor**'e gidin
2. `database/schema.sql` dosyasının içeriğini kopyalayın
3. SQL Editor'de çalıştırın (Execute)
4. `database/sample-data.sql` dosyasının içeriğini kopyalayın
5. SQL Editor'de çalıştırın (başlangıç verilerini ekler)

### 4. Environment Dosyalarını Ayarlayın

#### Backend Environment
```bash
cd backend
cp env.example .env
```

`.env` dosyasını düzenleyin:
```env
PORT=3000
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_role_key

# Game Configuration
MAX_PLAYERS_PER_GAME=8
GAME_ROUND_COUNT=7
VOTE_TIME_LIMIT=60
```

#### Frontend Environment
```bash
cd .. # ana dizine dön
cp env.example .env
```

`.env` dosyasını düzenleyin:
```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Backend API Configuration  
EXPO_PUBLIC_API_URL=http://YOUR_LOCAL_IP:3000
```

**Önemli:** `YOUR_LOCAL_IP` yerine bilgisayarınızın yerel IP adresini yazın (örn: 192.168.1.103)

### 5. IP Adresini Güncelleyin

Aşağıdaki dosyalarda `192.168.1.103` olan IP adreslerini kendi bilgisayarınızın IP adresiyle değiştirin:

- `src/context/AuthContext.tsx`
- `src/context/GameContext.tsx`
- `src/services/socket.ts`

IP adresinizi öğrenmek için:
- **macOS/Linux:** `ifconfig | grep inet`
- **Windows:** `ipconfig`

### 6. Backend Kurulumu

```bash
cd backend

# Paketleri yükle
npm install

# Sunucuyu başlat
npm run dev
```

Backend şu adreste çalışacak: `http://localhost:3000`

### 7. Frontend Kurulumu

```bash
# Ana proje klasörüne dön
cd ..

# Paketleri yükle
npm install

# Uygulamayı başlat
npm start
```

### 8. Mobil Test

1. Telefonda **Expo Go** uygulamasını indirin
2. Terminal'de görünen QR kodu tarayın
3. Uygulama telefonunuzda açılacak

## 🎮 Kullanım

### İlk Kullanım
1. Uygulamayı açın
2. "Yeni Hesap Oluştur" ile kayıt olun
3. E-posta doğrulamasını tamamlayın
4. Giriş yapın

### Oyun Oynama
1. "Yeni Oyun Oluştur" veya "Oyuna Katıl"
2. Arkadaşlarınızı oyun kodunu paylaşarak davet edin
3. En az 3 oyuncu olduğunda oyunu başlatın
4. Eğlenin! 🎉

## 🔧 Sorun Giderme

### Backend Bağlantı Sorunu
- Backend'in çalıştığından emin olun (`npm run dev`)
- IP adresinin doğru olduğunu kontrol edin
- Firewall ayarlarını kontrol edin

### Supabase Bağlantı Sorunu
- URL ve anahtarların doğru olduğunu kontrol edin
- Supabase projenizin aktif olduğunu doğrulayın
- Database tablolarının oluşturulduğunu kontrol edin

### Expo Sorunu
- Expo CLI'ın güncel olduğunu kontrol edin
- `expo r -c` ile cache'i temizleyin
- Node modules'u yeniden yükleyin: `rm -rf node_modules && npm install`

### Socket.io Bağlantı Sorunu
- Backend ve frontend'in aynı ağda olduğunu kontrol edin
- IP adresinin mobil cihazdan erişilebilir olduğunu doğrulayın

## 🏗️ Proje Yapısı

```
mood-meme-game/
├── backend/                    # Node.js Backend
│   ├── server.js              # Ana server dosyası
│   ├── package.json           # Backend bağımlılıkları
│   └── .env                   # Backend environment
├── database/                  # Supabase Database
│   ├── schema.sql            # Database şeması
│   └── sample-data.sql       # Başlangıç verileri
├── src/                      # React Native Frontend
│   ├── screens/              # Uygulama ekranları
│   │   ├── auth/            # Authentication ekranları
│   │   ├── home/            # Ana sayfa
│   │   ├── lobby/           # Oyun lobisi
│   │   └── game/            # Oyun ekranı
│   ├── context/             # State management
│   │   ├── AuthContext.tsx  # Authentication state
│   │   └── GameContext.tsx  # Oyun state
│   └── services/            # API ve Socket servisleri
├── App.tsx                   # Ana uygulama
├── package.json             # Frontend bağımlılıkları
└── .env                     # Frontend environment
```

## 🔒 Güvenlik

- **Production'da:** Environment değişkenlerini güvenli tutun
- **Database:** Row Level Security (RLS) politikaları aktif
- **Authentication:** Supabase Auth ile güvenli kimlik doğrulama

## 📱 Desteklenen Platformlar

- **iOS** (Expo Go veya native build)
- **Android** (Expo Go veya native build)
- **Web** (geliştirme amaçlı)

## 🤝 Destek

Sorun yaşıyorsanız:
1. Bu rehberi tekrar kontrol edin
2. Terminal'deki hata mesajlarını inceleyin
3. Supabase dashboard'unda logları kontrol edin
4. GitHub issues'da sorun bildirin

## 📈 Sonraki Adımlar

- Production deployment için Vercel/Railway kullanın
- Native build için `expo build` kullanın
- App Store/Play Store'a yayın için Expo Application Services (EAS) kullanın

---

**🎯 İyi Oyunlar!** Herhangi bir sorunuz varsa lütfen iletişime geçin. 