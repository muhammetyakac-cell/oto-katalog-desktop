🛠️ Kurulum Adımları (Installation)
Projeyi yerel ortamında çalıştırmak için aşağıdaki adımları izleyin.

1. Projeyi Klonlayın ve Bağımlılıkları Kurun
Bash
# Bağımlılıkları yükle
npm install
2. Çevre Değişkenlerini (Environment Variables) Ayarlayın
Ana dizinde bir .env dosyası oluşturun ve aşağıdaki değerleri kendi Supabase ve Admin bilgilerinizle doldurun:

Kod snippet'i
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_ADMIN_USER=CANBERK
VITE_ADMIN_PASS=sifreniz123
3. Supabase Veritabanı Kurulumu
Supabase panelinizde SQL Editor'ü açıp şu sorguyu çalıştırarak tabloları oluşturun ve RLS'i devre dışı bırakın:

SQL
create table projects (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table products (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references projects(id) on delete cascade,
  stok_kodu text,
  urun_adi text,
  fiyat numeric,
  resim_url text,
  kategori text
);

alter table projects disable row level security;
alter table products disable row level security;
4. Geliştirme Sunucusunu Başlatın
Bash
npm run dev
📂 Klasör Yapısı (Folder Structure)
Uygulama, ölçeklenebilir olması için modüler bir yapıda kurgulanmıştır:

src/components/

CatalogPDF.jsx: Sayfalandırma mantığı (Chunking) ve PDF tasarım kodlarının bulunduğu çekirdek dosya.

src/pages/

Login.jsx: Çevre değişkenleriyle çalışan güvenlik bariyeri.

Dashboard.jsx: Supabase'den çekilen taslakların listelendiği ana kontrol paneli.

Editor.jsx: Excel okuma, sütun eşleştirme, çoklu seçim, fiyat güncelleme ve Supabase kayıt işlemlerini yöneten ana iş motoru.

src/lib/

supabase.js: Veritabanı bağlantı konfigürasyonu.

src/index.css: Tailwind v4'ün direktiflerini barındıran global stil dosyası.

🌐 Canlıya Alma (Vercel Deployment)
Projeyi Vercel'e yüklerken dikkat edilmesi gereken iki kritik nokta vardır:

Vercel Settings > Environment Variables menüsüne giderek .env dosyanızdaki 4 değişkeni (VITE_...) eklemeyi unutmayın.

React Router'ın Vercel'de düzgün çalışması (sayfa yenilendiğinde 404 vermemesi) için public klasörü içinde _redirects isimli bir dosya oluşturup içine şunu yazın:

Plaintext
/* /index.html 200
Bu sistem, DZY Yazılım güvencesiyle yüksek performanslı katalog yönetimi sağlamak için tasarlanmıştır.
