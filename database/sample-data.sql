-- Sample Data for What Is Your Mood? Game
-- Meme Cards and Prompts

-- Insert Meme Cards (Turkish and International)
INSERT INTO public.meme_cards (title, image_url, tags, is_turkish, category) VALUES

-- Turkish Memes
('Türk Usulü Kahve', 'https://i.imgflip.com/2fm6x.jpg', ARRAY['kahve', 'türk', 'sabah'], true, 'daily_life'),
('Annem Diyerek', 'https://i.imgflip.com/1g8my.jpg', ARRAY['anne', 'aile', 'türk'], true, 'family'),
('Ne Diyebilirim', 'https://i.imgflip.com/4t0m5.jpg', ARRAY['şaşkınlık', 'tepki'], true, 'reaction'),
('Türk Mimarisi', 'https://i.imgflip.com/30b1gx.jpg', ARRAY['türkiye', 'mimari'], true, 'culture'),
('Başka Dertlerim Var', 'https://i.imgflip.com/1bij.jpg', ARRAY['dert', 'yaşam'], true, 'life'),

-- International Popular Memes
('Distracted Boyfriend', 'https://i.imgflip.com/1ur9b0.jpg', ARRAY['choice', 'distraction', 'relationship'], false, 'relationships'),
('Woman Yelling at Cat', 'https://i.imgflip.com/3g8j.jpg', ARRAY['argument', 'anger', 'cat'], false, 'reaction'),
('Drake Pointing', 'https://i.imgflip.com/30b1gx.jpg', ARRAY['choice', 'preference', 'drake'], false, 'choice'),
('Surprised Pikachu', 'https://i.imgflip.com/2ka.jpg', ARRAY['surprise', 'shock', 'pokemon'], false, 'reaction'),
('This Is Fine', 'https://i.imgflip.com/26am.jpg', ARRAY['calm', 'disaster', 'fire'], false, 'life'),
('Success Kid', 'https://i.imgflip.com/1bij.jpg', ARRAY['success', 'achievement', 'baby'], false, 'success'),
('Hide the Pain Harold', 'https://i.imgflip.com/1nb.jpg', ARRAY['pain', 'smile', 'fake'], false, 'emotion'),
('Expanding Brain', 'https://i.imgflip.com/1jhl.jpg', ARRAY['intelligence', 'evolution', 'brain'], false, 'smart'),
('Bernie Sanders', 'https://i.imgflip.com/4t0m5.jpg', ARRAY['politics', 'asking', 'bernie'], false, 'politics'),
('Philosoraptor', 'https://i.imgflip.com/s9w.jpg', ARRAY['philosophy', 'thinking', 'dinosaur'], false, 'philosophy'),

-- Classic Reaction Memes
('Crying Jordan', 'https://i.imgflip.com/1tgg.jpg', ARRAY['crying', 'sadness', 'jordan'], false, 'emotion'),
('Roll Safe', 'https://i.imgflip.com/1h7s.jpg', ARRAY['smart', 'thinking', 'clever'], false, 'smart'),
('Mocking SpongeBob', 'https://i.imgflip.com/1otw9.jpg', ARRAY['mocking', 'spongebob', 'sarcasm'], false, 'sarcasm'),
('Arthur Fist', 'https://i.imgflip.com/1e0j.jpg', ARRAY['anger', 'fist', 'arthur'], false, 'anger'),
('Confused Nick Young', 'https://i.imgflip.com/1g3a.jpg', ARRAY['confusion', 'question', 'nick'], false, 'confusion'),

-- Work/School Related
('Office Space Milton', 'https://i.imgflip.com/16j.jpg', ARRAY['office', 'work', 'stapler'], false, 'work'),
('Stressed Office Worker', 'https://i.imgflip.com/2fx.jpg', ARRAY['stress', 'work', 'computer'], false, 'work'),
('Student Life', 'https://i.imgflip.com/1kx.jpg', ARRAY['student', 'study', 'exam'], false, 'school'),

-- Food Related  
('Food Coma', 'https://i.imgflip.com/2gu.jpg', ARRAY['food', 'tired', 'eating'], false, 'food'),
('Cooking Disaster', 'https://i.imgflip.com/2hv.jpg', ARRAY['cooking', 'disaster', 'kitchen'], false, 'food'),

-- Technology
('Internet Explorer', 'https://i.imgflip.com/1n2.jpg', ARRAY['technology', 'slow', 'browser'], false, 'technology'),
('WiFi Problems', 'https://i.imgflip.com/2kl.jpg', ARRAY['wifi', 'internet', 'connection'], false, 'technology'),

-- Weekend/Party
('Friday Feeling', 'https://i.imgflip.com/1mx.jpg', ARRAY['friday', 'weekend', 'happy'], false, 'weekend'),
('Monday Blues', 'https://i.imgflip.com/1ny.jpg', ARRAY['monday', 'tired', 'sad'], false, 'weekend'),
('Party Time', 'https://i.imgflip.com/2pz.jpg', ARRAY['party', 'fun', 'celebration'], false, 'party');

-- Insert Turkish Game Prompts
INSERT INTO public.prompts (text, category, is_turkish, difficulty_level) VALUES

-- Daily Life Situations
('Pazartesi sabahı alarm çaldığında ruh halim:', 'daily_life', true, 1),
('Tuvalete gittiğimde benden önce birinin sifonu çekmediğini görmüşümdür:', 'daily_life', true, 2),
('Markette alışveriş yaparken kartım çekmediğinde:', 'daily_life', true, 2),
('Otobüste yerimi yaşlı birine verdiğimde kendimi böyle hissederim:', 'daily_life', true, 1),
('Evde yalnızken garip bir ses duyduğumda:', 'daily_life', true, 2),
('Telefon şarjım %1''de iken:', 'daily_life', true, 1),
('İnternette dolaşırken 3 saat sonra nerede olduğumu anladığımda:', 'daily_life', true, 2),

-- Social Situations  
('Arkadaşım bana "Sadece bir bira içeceğiz" dediğinde:', 'social', true, 3),
('Grupta tek ben anlamadığım bir şakadan sonra:', 'social', true, 2),
('Yanlışlıkla eski mesajıma cevap yazdığımda:', 'social', true, 2),
('WhatsApp''ta "Konuşmamız lazım" mesajı aldığımda:', 'social', true, 3),
('Sesli mesaj dinlerken yanlışlıkla hoparlöre bastığımda:', 'social', true, 2),
('Instagram''da eski sevgilimin mutlu fotoğrafını gördüğümde:', 'social', true, 3),

-- Family Relations
('Annem beni övdüğünde ben:', 'family', true, 1),
('Babama para istediğimde onun yüz ifadesi:', 'family', true, 2),
('Akrabalar "Ne zaman evleneceksin?" diye sorduğunda:', 'family', true, 3),
('Annem telefondan "Oğlum" diye seslendiğinde:', 'family', true, 1),
('Ailem yanında arkadaşlarımla konuştuğum gibi davranmaya çalıştığımda:', 'family', true, 2),

-- Work/School
('Sınavdan bir gün önce derse başladığımda:', 'work_school', true, 2),
('İşte patron yanımdan geçerken:', 'work_school', true, 2),
('Toplantıda "Sen ne düşünüyorsun?" diye sorduklarında:', 'work_school', true, 3),
('Ödevimi son dakikada yaparken:', 'work_school', true, 2),
('Tatil dönüşü işe gittiğimde:', 'work_school', true, 2),

-- Food/Eating
('Diyet yapacağım derken buzdolabını açtığımda:', 'food', true, 2),
('Yemek yapmaya üşendiğimde 3. kez hazır yemek sipariş ederken:', 'food', true, 2),
('Aç olduğumda buzdolabında sadece soğan ve ketçap gördüğümde:', 'food', true, 3),
('Restoranda garson "Nasıl?" diye sorduğunda (kötü olmasına rağmen):', 'food', true, 2),

-- Technology
('İnternetsiz kaldığımda:', 'technology', true, 1),
('Bilgisayarım donduğunda ve kaydetmediğimi hatırladığımda:', 'technology', true, 3),
('Telefonumu bulamadığımda telefonumla arattığımda:', 'technology', true, 2),
('Zoom toplantısında sesim açık kaldığını fark ettiğimde:', 'technology', true, 3),

-- Weekend/Entertainment
('Cuma akşamı evde Netflix izleyeceğim derken:', 'weekend', true, 1),
('Hafta sonu hiçbir şey yapmadığımı fark ettiğimde:', 'weekend', true, 2),
('Tatil planı yaparken bütçeme baktığımda:', 'weekend', true, 3),

-- Emotions/Reactions
('Birisi "Sakin ol" dediğinde:', 'emotion', true, 2),
('Komik olmayan şakaya güldüğümde:', 'emotion', true, 2),
('Birinin sırrını yanlışlıkla başkasına anlattığımı hatırladığımı hatırladığımda:', 'emotion', true, 3),
('İçimden geçeni söylemek istediğimde ama söyleyemediğimde:', 'emotion', true, 2),

-- Awkward Situations
('Birini selamladığımda beni görmezden geldiğinde:', 'awkward', true, 2),
('Yanlış numarayı aradığımı fark ettiğimde:', 'awkward', true, 1),
('Tuvaletten çıkarken birini beklediğini görünce:', 'awkward', true, 2),
('Asansörde yabancılarla kaldığımda:', 'awkward', true, 1),

-- Money/Shopping
('Hesabıma maaş yattığında:', 'money', true, 1),
('Ay sonunu getirmeye çalışırken:', 'money', true, 2),
('Online alışverişte sepeti doldurduktan sonra toplamı gördüğümde:', 'money', true, 3),
('Kredi kartı ekstresini açtığımda:', 'money', true, 3);

-- Note: User stats will be created automatically when users sign up through the application 