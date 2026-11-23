-- ============================================================================
-- Zidan Seftino Mutaqin Portfolio — Idempotent Seed Data
-- Run AFTER supabase/schema.sql in Supabase SQL Editor
-- ============================================================================

-- 1. Profile (insert only if empty so admin edits are preserved)
insert into public.profile (
  id,
  full_name,
  brand_name,
  role_en,
  role_id,
  location,
  timezone,
  availability_status_en,
  availability_status_id,
  is_available,
  headline_en,
  headline_id,
  bio_en,
  bio_id,
  email,
  github_url,
  linkedin_url,
  cv_url
)
select
  '00000000-0000-0000-0000-000000000001'::uuid,
  'Zidan Seftino Mutaqin',
  'ZIDAN.',
  'Fullstack Web Developer',
  'Fullstack Web Developer',
  'Bekasi, Jawa Barat, Indonesia',
  'WIB (UTC+7)',
  'OPEN TO FULL-TIME',
  'TERBUKA UNTUK FULL-TIME',
  true,
  'Building Structured Web Systems, Mobile Apps & Actionable Data Dashboards.',
  'Membangun Sistem Web Terstruktur, Aplikasi Mobile & Dashboard Data yang Informatif.',
  'Information Systems graduate from Universitas Bani Saleh (Faculty of Information and Digital Technology) with hands-on experience in web & mobile application development, operational system workflows, and Power BI data reporting. Focused on building reliable, maintainable software that supports real business operations.',
  'Lulusan S1 Sistem Informasi dari Fakultas Teknologi Informasi dan Digital, Universitas Bani Saleh. Berpengalaman dalam pengembangan website dan aplikasi, pemahaman proses operasional sistem, serta pengolahan data dan pembuatan laporan dashboard menggunakan Power BI. Berfokus membangun perangkat lunak yang rapi, andal, dan mendukung efisiensi operasional.',
  'zidanseftino18@gmail.com',
  'https://github.com/zidaansm',
  'https://www.linkedin.com/in/zidansm/',
  '/cv'
where not exists (select 1 from public.profile);

-- 2. Projects
insert into public.projects (
  slug,
  title_en,
  title_id,
  summary_en,
  summary_id,
  category,
  year,
  role_en,
  role_id,
  tech_stack,
  problem_en,
  problem_id,
  architecture_en,
  architecture_id,
  challenges_en,
  challenges_id,
  impact_en,
  impact_id,
  live_url,
  repo_url,
  cover_image_url,
  featured,
  published,
  sort_order
)
values
(
  'sistem-informasi-perpustakaan',
  'Integrated Library Information System',
  'Sistem Informasi Perpustakaan Terintegrasi',
  'An integrated library circulation system built with Laravel, Filament, and MySQL to speed up book borrowing workflows, simplify catalog search, and automate operational reporting.',
  'Sistem sirkulasi perpustakaan terintegrasi menggunakan Laravel, Filament, dan MySQL untuk mempercepat pelayanan peminjaman buku, mempermudah pencarian katalog, serta mengotomatisasi laporan operasional.',
  'Fullstack Web',
  '2026',
  'Fullstack Web Developer',
  'Fullstack Web Developer',
  array['PHP', 'Laravel', 'Filament', 'MySQL', 'HTML/CSS', 'JavaScript'],
  'Manual or fragmented library operations slowed down daily book borrowing and return transactions, made catalog availability hard to track in real time, and required repetitive manual compilation for periodic library reports.',
  'Pengelolaan perpustakaan yang belum terintegrasi memperlambat proses transaksi peminjaman dan pengembalian buku harian, menyulitkan pencarian ketersediaan katalog secara cepat, serta menuntut rekapitulasi laporan perpustakaan secara manual.',
  'Built a structured monolithic web architecture using PHP & Laravel with a relational MySQL schema separating book catalog records, member data, and circulation transactions. Implemented an administrative back-office using Filament to handle circulation state transitions, search/filter indexing, and automated report generation.',
  'Membangun arsitektur web terstruktur menggunakan PHP & Laravel dengan skema relasional MySQL yang memisahkan entitas katalog buku, data anggota, dan transaksi sirkulasi. Panel administrasi dibangun dengan Filament untuk mengelola status peminjaman, pencarian serta filter katalog, hingga pembuatan laporan otomatis.',
  'Designing clean relational constraints so stock counts stay consistent during simultaneous borrow/return updates while keeping the librarian dashboard fast and intuitive for non-technical staff.',
  'Merancang relasi database yang konsisten agar ketersediaan stok buku selalu akurat saat transaksi peminjaman dan pengembalian berlangsung, sekaligus menjaga antarmuka admin tetap sederhana dan cepat digunakan staf perpustakaan.',
  'Delivered an integrated circulation workflow that accelerates borrowing and return service, streamlines catalog discovery, and automates library operational reporting.',
  'Menghasilkan sistem sirkulasi terintegrasi yang mempercepat pelayanan peminjaman buku, mempermudah pencarian katalog, dan mengotomatisasi pembuatan laporan perpustakaan.',
  null,
  null,
  null,
  true,
  true,
  1
),
(
  'replaste',
  'REPLASTE — Smart Plastic Classification App',
  'REPLASTE — Aplikasi Klasifikasi Jenis Plastik',
  'A cross-functional Bangkit Academy capstone mobile application combining Kotlin/Android, TensorFlow Lite plastic type classification, and a Node.js/Express REST API on Google Cloud Platform.',
  'Aplikasi mobile capstone Bangkit Academy lintas disiplin yang memadukan Android (Kotlin), model klasifikasi plastik TensorFlow Lite, dan REST API Node.js/Express di Google Cloud Platform.',
  'Mobile & Fullstack',
  'Bangkit Capstone',
  'Mobile Development (MSIB Bangkit Academy)',
  'Mobile Development (MSIB Bangkit Academy)',
  array['Kotlin', 'Android Studio', 'Figma', 'TensorFlow Lite', 'Node.js', 'Express', 'JWT', 'GCP'],
  'Three core problems motivated REPLASTE: (1) a public knowledge gap in distinguishing different types of plastic, (2) the technical need for an accessible system capable of identifying plastic types accurately, and (3) low public awareness regarding the importance of sorting waste properly.',
  'Tiga permasalahan utama yang melatarbelakangi REPLASTE: (1) kesenjangan pengetahuan masyarakat yang kesulitan mengidentifikasi berbagai jenis plastik, (2) kebutuhan teknis akan sistem yang mampu mengidentifikasi jenis plastik secara akurat, serta (3) rendahnya kesadaran masyarakat terhadap pentingnya memilah sampah.',
  'Collaborated across three engineering tracks: Mobile Development (Kotlin, Android Studio, Figma UI design), Machine Learning (TensorFlow, TensorFlow Lite, Scikit-learn, NumPy, Pandas, Matplotlib, Seaborn, Roboflow, Kaggle, Google Colab), and Cloud Computing (Node.js, Express, JWT authentication, Postman, GCP). On-device TFLite inference delivers responsive plastic recognition paired with cloud-backed user endpoints.',
  'Dikembangkan melalui kolaborasi tiga jalur teknik: Mobile Development (Kotlin, Android Studio, desain antarmuka Figma), Machine Learning (TensorFlow, TensorFlow Lite, Scikit-learn, NumPy, Pandas, Matplotlib, Seaborn, Roboflow, Kaggle, Google Colab), dan Cloud Computing (Node.js, Express, autentikasi JWT, Postman, GCP). Inferensi TensorFlow Lite berjalan responsif di perangkat dan terhubung ke layanan backend cloud.',
  'Coordinating data contracts between the Android Kotlin client, JWT-secured Express endpoints on GCP, and TensorFlow Lite model input/output shapes so camera-based classification remained fast and reliable on mobile devices.',
  'Menyelaraskan kontrak data antara aplikasi Android Kotlin, endpoint Express berautentikasi JWT di GCP, serta format input/output model TensorFlow Lite agar klasifikasi jenis plastik berjalan cepat dan konsisten di perangkat mobile.',
  'Provided an accessible Android tool that bridges the plastic identification knowledge gap, demonstrates practical ML classification on mobile, and encourages daily waste-sorting habits.',
  'Menghadirkan aplikasi Android yang membantu menjembatani kesenjangan informasi jenis plastik, menerapkan klasifikasi berbasis ML secara praktis di perangkat mobile, dan mendorong kebiasaan memilah sampah.',
  null,
  'https://github.com/REPLASTE',
  null,
  true,
  true,
  2
),
(
  'ldvarch',
  'LDV — Community Portal, Scoreboard & Admin CMS',
  'LDV — Portal Komunitas, Sistem Scoreboard & CMS Admin',
  'Official web portal for the La Dolce Vita (LDV) online gaming community featuring an interactive tournament scoreboard system, member & event showcases, and a custom Supabase-backed Admin CMS deployed on Vercel.',
  'Portal web resmi komunitas gaming La Dolce Vita (LDV) yang dilengkapi sistem scoreboard turnamen, etalase event serta member, dan dashboard CMS Admin berbasis Next.js & Supabase yang di-deploy di Vercel.',
  'Fullstack Web',
  '2026',
  'Fullstack Web Developer',
  'Fullstack Web Developer',
  array['Next.js', 'Supabase', 'PostgreSQL', 'Vercel'],
  'Active Discord gaming communities often struggle with scattered event announcements, manual tournament standings updates, and difficulty showcasing member stories and community activities in one structured public hub.',
  'Komunitas gaming Discord yang aktif sering mengalami kendala informasi event yang tersebar, pencatatan klasemen/scoreboard turnamen secara manual, serta belum adanya portal web terpusat untuk menampilkan cerita dan aktivitas komunitas.',
  'Built as a fullstack web application using Next.js and Supabase (PostgreSQL & Authentication) deployed on Vercel. Designed a structured database schema for events, live scoreboard standings, and community content managed through a dedicated Admin CMS panel, leveraging modern AI-assisted development workflows for rapid iteration.',
  'Dibangun sebagai aplikasi web fullstack menggunakan Next.js dan Supabase (PostgreSQL & Authentication) serta di-deploy ke Vercel. Merancang struktur database untuk event, klasemen scoreboard, dan konten komunitas yang dikelola melalui panel CMS Admin khusus, dengan memanfaatkan alur pengembangan modern berbantuan AI untuk iterasi yang cepat.',
  'Structuring the Admin CMS so community organizers can update match scores, event schedules, and content quickly without touching code, while keeping public scoreboard views accurate and responsive across desktop and mobile devices.',
  'Menyusun alur CMS Admin agar pengurus komunitas dapat memperbarui skor pertandingan, jadwal event, dan konten dengan cepat tanpa menyentuh kode, sambil menjaga tampilan scoreboard publik tetap akurat dan responsif di desktop maupun mobile.',
  'Launched live at ldvarch.com as a centralized public home for the LDV community, streamlining tournament scoreboard management and non-technical content updates through the built-in Admin CMS.',
  'Berhasil diluncurkan secara live di ldvarch.com sebagai pusat informasi resmi komunitas LDV, mempermudah pengelolaan scoreboard turnamen serta pembaruan konten operasional melalui CMS Admin terintegrasi.',
  'https://ldvarch.com',
  null,
  null,
  true,
  true,
  3
)
on conflict (slug) do nothing;

-- 3. Tech Capabilities Matrix (4 Quadrants)
insert into public.tech_capabilities (
  category_key,
  title_en,
  title_id,
  description_en,
  description_id,
  items,
  sort_order
)
values
(
  'frontend',
  'Frontend & Mobile',
  'Frontend & Mobile',
  'Clean, accessible web interfaces and native Android mobile applications.',
  'Antarmuka web yang bersih, responsif, serta pengembangan aplikasi mobile Android.',
  array['HTML5', 'CSS3', 'JavaScript', 'Kotlin', 'Android Studio', 'Figma'],
  1
),
(
  'backend',
  'Backend & APIs',
  'Backend & API',
  'Structured server-side applications, admin panels, and RESTful authentication.',
  'Aplikasi server-side terstruktur, panel administrasi, dan layanan REST API.',
  array['PHP', 'Laravel', 'Filament', 'Node.js', 'Express', 'JWT Auth'],
  2
),
(
  'database',
  'Database & Data Reporting',
  'Database & Pelaporan Data',
  'Relational data modeling, operational workflows, and business intelligence dashboards.',
  'Pemodelan data relasional, proses operasional sistem, dan dashboard pelaporan.',
  array['MySQL', 'PostgreSQL / Supabase', 'Power BI', 'Dashboard Reporting', 'Operational Systems'],
  3
),
(
  'tools',
  'Tools & Engineering Workflow',
  'Tools & Alur Kerja',
  'Daily development environment, version control, API testing, and cloud basics.',
  'Lingkungan pengembangan harian, kontrol versi, pengujian API, dan fondasi cloud.',
  array['Git', 'GitHub', 'VS Code', 'Antigravity', 'Postman', 'GCP'],
  4
)
on conflict (category_key) do nothing;

-- 4. Experiences & Education
insert into public.experiences (
  id,
  organization,
  role_en,
  role_id,
  period,
  location,
  summary_en,
  summary_id,
  highlights_en,
  highlights_id,
  published,
  sort_order
)
values
(
  '00000000-0000-0000-0000-000000000101'::uuid,
  'Bangkit Academy (MSIB — Studi Independen)',
  'Mobile Development Cohort',
  'Peserta Mobile Development (MSIB)',
  'MSIB Program',
  'Indonesia (Remote)',
  'Completed the Kampus Merdeka MSIB Independent Study track in Mobile Development, collaborating cross-functionally with Machine Learning and Cloud Computing peers to build REPLASTE.',
  'Mengikuti program Studi Independen Bersertifikat (MSIB) Bangkit Academy pada jalur Mobile Development, berkolaborasi lintas tim bersama Machine Learning dan Cloud Computing membangun REPLASTE.',
  array[
    'Built Android interfaces and application flows in Kotlin using Android Studio and Figma.',
    'Integrated TensorFlow Lite plastic classification and JWT-authenticated Node.js/Express APIs on GCP.'
  ],
  array[
    'Membangun antarmuka dan alur aplikasi Android menggunakan Kotlin, Android Studio, dan Figma.',
    'Mengintegrasikan model klasifikasi plastik TensorFlow Lite serta API Node.js/Express berautentikasi JWT di GCP.'
  ],
  true,
  1
),
(
  '00000000-0000-0000-0000-000000000102'::uuid,
  'Universitas Bani Saleh',
  'B.Sc. in Information Systems (S1 Sistem Informasi)',
  'S1 Sistem Informasi — Fakultas Teknologi Informasi dan Digital',
  'Bachelor Degree',
  'Bekasi, Jawa Barat',
  'Studied Information Systems at the Faculty of Information and Digital Technology, combining software engineering with operational system analysis and Power BI data reporting.',
  'Menempuh pendidikan S1 Program Studi Sistem Informasi di Fakultas Teknologi Informasi dan Digital, memadukan pengembangan perangkat lunak dengan pemahaman proses operasional sistem dan pelaporan Power BI.',
  array[
    'Developed web and application projects including an integrated Laravel & Filament library system.',
    'Processed operational datasets and created structured analytical dashboard reports with Power BI.'
  ],
  array[
    'Mengembangkan proyek website dan aplikasi termasuk sistem informasi perpustakaan berbasis Laravel & Filament.',
    'Mengolah data dan menyusun laporan dashboard analitik terstruktur menggunakan Power BI.'
  ],
  true,
  2
)
on conflict (id) do nothing;
