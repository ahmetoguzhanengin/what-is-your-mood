# What Is Your Mood? – Meme Bazlı Kart Oyunu (Mobil Uygulama)

## 🎯 Amaç
“What Is Your Mood?” oyunu, arkadaş grubunun bir araya gelip kahkaha dolu bir şekilde meme'lerle (capslerle) ruh halini ifade ettiği eğlenceli bir kart oyunudur. Amaç, belirli bir senaryoya en komik veya en uygun meme’i seçerek o turu kazanmaktır.

## 📱 Oyun Formatı – Mobil Uygulama
Bu proje, fiziksel kart oyunu formatındaki “What is your mood?” oyununu mobil ortama taşıma fikrine dayanır. Uygulama, Tabu, Among Us veya Psych! gibi grup halinde oynanabilecek online bir oyun deneyimi sunar.

---

## 🔧 Temel Oyun Akışı

### 1. Lobi Oluşturma
- Bir oyuncu yeni bir oyun başlatır ve lobi oluşturur.
- Diğer oyuncular bu lobiye PIN veya bağlantı ile katılır.
- Minimum oyuncu sayısı: 3, Maksimum önerilen: 8

### 2. Kart Dağıtımı
- Her oyuncuya rastgele 7 adet **meme kartı** verilir.
- Kartlar, imgflip API ya da benzeri bir meme veritabanından çekilir.
- Türk ve yabancı popüler meme'ler karışık olarak sunulur.

### 3. Soru (Prompt) Gösterimi
- Ortak ekran (örneğin moderatör oyuncunun telefonu) ya da tüm oyuncuların ekranında bir **durum/soru** görünür.
  > Örnek: “Tuvalete gittiğimde benden önce birinin sifonu çekmediğini görmüşümdür.”

### 4. Kart Seçimi
- Oyuncular kendi ellerindeki 7 meme’den birini bu duruma en uygun gördüğü şekilde seçer ve gönderir.
- Gönderimler anonimdir.

### 5. Oylama
- Tüm seçilen kartlar rastgele sırayla gösterilir.
- Her oyuncu, en komik/best-fit gördüğü kartı oylayarak puan kazandırır (kendi kartına oy veremez).
- En çok oyu alan oyuncu puanı kazanır.

### 6. Tur Sonu ve Devam
- Tur bittiğinde herkesin kart sayısı 6’ya düşer.
- Yeni soru gösterilir ve döngü toplam 7 tur boyunca devam eder.

### 7. Oyun Sonu ve Skor
- 7 turun sonunda puanlar toplanır.
- En çok oyu alan oyuncu **kazanan** olur.
- Skorlar detaylı olarak listelenir.

---

## 📂 Özellikler

- ✅ Gerçek zamanlı çok oyunculu oyun
- ✅ Türkçe ve İngilizce destekli meme havuzu
- ✅ Mobil tarayıcı veya native uygulama desteği (React Native / Flutter önerilir)
- ✅ Sunucu tarafı kontrol (Node.js, Firebase, vb.)
- ✅ Realtime lobi, kart paylaşımı ve oylama
- ✅ Anonim kart gönderimi & açık oylama

---

## 💡 Gelecekte Eklenebilecek Özellikler

- 🔐 Kendi meme’ini yükleyebilme
- 📊 Oyuncu istatistikleri ve profil sayfası
- 🧠 "Yapay zeka önerisi": en uygun meme tahmini
- 🎨 Kendi kart destesini oluşturma
- 🕹️ Offline / tek oyunculu mod

---

## ⚙️ Teknik Yığın (Öneri)

| Katman | Teknoloji |
|--------|-----------|
| Frontend | React Native / Flutter |
| Backend | Node.js + Socket.io / Firebase Realtime Database |
| Database | Firebase / Supabase / MongoDB |
| Hosting | Vercel / Heroku / Firebase |
| Medya Kaynağı | Imgflip API / GIPHY API |
| Autentikasyon | Firebase Auth / Magic Link |

---

## 🎯 Kullanım Senaryoları

- Ev partilerinde, kamp yaparken ya da dijital oyun gecelerinde
- Zoom/Discord eşliğinde eğlenceli aktivitelerde
- Sosyal medya influencer’larının takipçileriyle etkileşimi için

---

## 📌 Notlar
- Oyun, “Cards Against Humanity” ve “What Do You Meme?” oyunlarının ruhunu taşır fakat dijital meme evreniyle güncellenmiş ve lokalize edilmiştir.
- Türkçe sorularla yerelleştirilmiş içerik hedeflenmektedir.

---

## 👤 Geliştirici
**Ahmet Oğuzhan Engin**  
[GitHub](https://github.com/ahmetoguzhanengin) | [LinkedIn](https://linkedin.com/in/ahmetoguzhanengin)

---

## 📞 İletişim
Bu projeyle ilgileniyor veya yatırım/destek olmak istiyorsanız lütfen iletişime geçin.

