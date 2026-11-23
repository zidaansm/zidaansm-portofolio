import type {
  Experience,
  PortfolioData,
  Profile,
  Project,
  TechCapability,
} from "@/types/portfolio";

export const FALLBACK_PROFILE: Profile = {
  id: "00000000-0000-0000-0000-000000000001",
  full_name: "Zidan Seftino Mutaqin",
  brand_name: "ZIDAN.",
  role_en: "Fullstack Web Developer",
  role_id: "Fullstack Web Developer",
  location: "Bekasi, Jawa Barat, Indonesia",
  timezone: "WIB (UTC+7)",
  availability_status_en: "OPEN TO FULL-TIME",
  availability_status_id: "TERBUKA UNTUK FULL-TIME",
  is_available: true,
  headline_en:
    "Building Structured Web Systems, Mobile Apps & Actionable Data Dashboards.",
  headline_id:
    "Membangun Sistem Web Terstruktur, Aplikasi Mobile & Dashboard Data yang Informatif.",
  bio_en:
    "Information Systems graduate from Universitas Bani Saleh (Faculty of Information and Digital Technology) with hands-on experience in web & mobile application development, operational system workflows, and Power BI data reporting. Focused on building reliable, maintainable software that supports real business operations.",
  bio_id:
    "Lulusan S1 Sistem Informasi dari Fakultas Teknologi Informasi dan Digital, Universitas Bani Saleh. Berpengalaman dalam pengembangan website dan aplikasi, pemahaman proses operasional sistem, serta pengolahan data dan pembuatan laporan dashboard menggunakan Power BI. Berfokus membangun perangkat lunak yang rapi, andal, dan mendukung efisiensi operasional.",
  email: "zidanseftino18@gmail.com",
  github_url: "https://github.com/zidaansm",
  linkedin_url: "https://www.linkedin.com/in/zidansm/",
  cv_url: "/cv",
  avatar_url: null,
};

export const FALLBACK_PROJECTS: Project[] = [
  {
    id: "00000000-0000-0000-0000-000000000011",
    slug: "sistem-informasi-perpustakaan",
    title_en: "Integrated Library Information System",
    title_id: "Sistem Informasi Perpustakaan Terintegrasi",
    summary_en:
      "An integrated library circulation system built with Laravel, Filament, and MySQL to speed up book borrowing workflows, simplify catalog search, and automate operational reporting.",
    summary_id:
      "Sistem sirkulasi perpustakaan terintegrasi menggunakan Laravel, Filament, dan MySQL untuk mempercepat pelayanan peminjaman buku, mempermudah pencarian katalog, serta mengotomatisasi laporan operasional.",
    category: "Fullstack Web",
    year: "2026",
    role_en: "Fullstack Web Developer",
    role_id: "Fullstack Web Developer",
    tech_stack: ["PHP", "Laravel", "Filament", "MySQL", "HTML/CSS", "JavaScript"],
    problem_en:
      "Manual or fragmented library operations slowed down daily book borrowing and return transactions, made catalog availability hard to track in real time, and required repetitive manual compilation for periodic library reports.",
    problem_id:
      "Pengelolaan perpustakaan yang belum terintegrasi memperlambat proses transaksi peminjaman dan pengembalian buku harian, menyulitkan pencarian ketersediaan katalog secara cepat, serta menuntut rekapitulasi laporan perpustakaan secara manual.",
    architecture_en:
      "Built a structured monolithic web architecture using PHP & Laravel with a relational MySQL schema separating book catalog records, member data, and circulation transactions. Implemented an administrative back-office using Filament to handle circulation state transitions, search/filter indexing, and automated report generation.",
    architecture_id:
      "Membangun arsitektur web terstruktur menggunakan PHP & Laravel dengan skema relasional MySQL yang memisahkan entitas katalog buku, data anggota, dan transaksi sirkulasi. Panel administrasi dibangun dengan Filament untuk mengelola status peminjaman, pencarian serta filter katalog, hingga pembuatan laporan otomatis.",
    challenges_en:
      "Designing clean relational constraints so stock counts stay consistent during simultaneous borrow/return updates while keeping the librarian dashboard fast and intuitive for non-technical staff.",
    challenges_id:
      "Merancang relasi database yang konsisten agar ketersediaan stok buku selalu akurat saat transaksi peminjaman dan pengembalian berlangsung, sekaligus menjaga antarmuka admin tetap sederhana dan cepat digunakan staf perpustakaan.",
    impact_en:
      "Delivered an integrated circulation workflow that accelerates borrowing and return service, streamlines catalog discovery, and automates library operational reporting.",
    impact_id:
      "Menghasilkan sistem sirkulasi terintegrasi yang mempercepat pelayanan peminjaman buku, mempermudah pencarian katalog, dan mengotomatisasi pembuatan laporan perpustakaan.",
    live_url: null,
    repo_url: null,
    cover_image_url: null,
    gallery_images: [],
    featured: true,
    published: true,
    sort_order: 1,
  },
  {
    id: "00000000-0000-0000-0000-000000000012",
    slug: "replaste",
    title_en: "REPLASTE — Smart Plastic Classification App",
    title_id: "REPLASTE — Aplikasi Klasifikasi Jenis Plastik",
    summary_en:
      "A cross-functional Bangkit Academy capstone mobile application combining Kotlin/Android, TensorFlow Lite plastic type classification, and a Node.js/Express REST API on Google Cloud Platform.",
    summary_id:
      "Aplikasi mobile capstone Bangkit Academy lintas disiplin yang memadukan Android (Kotlin), model klasifikasi plastik TensorFlow Lite, dan REST API Node.js/Express di Google Cloud Platform.",
    category: "Mobile & Fullstack",
    year: "Bangkit Capstone",
    role_en: "Mobile Development (MSIB Bangkit Academy)",
    role_id: "Mobile Development (MSIB Bangkit Academy)",
    tech_stack: [
      "Kotlin",
      "Android Studio",
      "Figma",
      "TensorFlow Lite",
      "Node.js",
      "Express",
      "JWT",
      "GCP",
    ],
    problem_en:
      "Three core problems motivated REPLASTE: (1) a public knowledge gap in distinguishing different types of plastic, (2) the technical need for an accessible system capable of identifying plastic types accurately, and (3) low public awareness regarding the importance of sorting waste properly.",
    problem_id:
      "Tiga permasalahan utama yang melatarbelakangi REPLASTE: (1) kesenjangan pengetahuan masyarakat yang kesulitan mengidentifikasi berbagai jenis plastik, (2) kebutuhan teknis akan sistem yang mampu mengidentifikasi jenis plastik secara akurat, serta (3) rendahnya kesadaran masyarakat terhadap pentingnya memilah sampah.",
    architecture_en:
      "Collaborated across three engineering tracks: Mobile Development (Kotlin, Android Studio, Figma UI design), Machine Learning (TensorFlow, TensorFlow Lite, Scikit-learn, NumPy, Pandas, Matplotlib, Seaborn, Roboflow, Kaggle, Google Colab), and Cloud Computing (Node.js, Express, JWT authentication, Postman, GCP). On-device TFLite inference delivers responsive plastic recognition paired with cloud-backed user endpoints.",
    architecture_id:
      "Dikembangkan melalui kolaborasi tiga jalur teknik: Mobile Development (Kotlin, Android Studio, desain antarmuka Figma), Machine Learning (TensorFlow, TensorFlow Lite, Scikit-learn, NumPy, Pandas, Matplotlib, Seaborn, Roboflow, Kaggle, Google Colab), dan Cloud Computing (Node.js, Express, autentikasi JWT, Postman, GCP). Inferensi TensorFlow Lite berjalan responsif di perangkat dan terhubung ke layanan backend cloud.",
    challenges_en:
      "Coordinating data contracts between the Android Kotlin client, JWT-secured Express endpoints on GCP, and TensorFlow Lite model input/output shapes so camera-based classification remained fast and reliable on mobile devices.",
    challenges_id:
      "Menyelaraskan kontrak data antara aplikasi Android Kotlin, endpoint Express berautentikasi JWT di GCP, serta format input/output model TensorFlow Lite agar klasifikasi jenis plastik berjalan cepat dan konsisten di perangkat mobile.",
    impact_en:
      "Provided an accessible Android tool that bridges the plastic identification knowledge gap, demonstrates practical ML classification on mobile, and encourages daily waste-sorting habits.",
    impact_id:
      "Menghadirkan aplikasi Android yang membantu menjembatani kesenjangan informasi jenis plastik, menerapkan klasifikasi berbasis ML secara praktis di perangkat mobile, dan mendorong kebiasaan memilah sampah.",
    live_url: null,
    repo_url: "https://github.com/REPLASTE",
    cover_image_url: null,
    gallery_images: [],
    featured: true,
    published: true,
    sort_order: 2,
  },
  {
    id: "00000000-0000-0000-0000-000000000013",
    slug: "ldvarch",
    title_en: "LDV — Community Portal, Scoreboard & Admin CMS",
    title_id: "LDV — Portal Komunitas, Sistem Scoreboard & CMS Admin",
    summary_en:
      "Official web portal for the La Dolce Vita (LDV) online gaming community featuring an interactive tournament scoreboard system, member & event showcases, and a custom Supabase-backed Admin CMS deployed on Vercel.",
    summary_id:
      "Portal web resmi komunitas gaming La Dolce Vita (LDV) yang dilengkapi sistem scoreboard turnamen, etalase event serta member, dan dashboard CMS Admin berbasis Next.js & Supabase yang di-deploy di Vercel.",
    category: "Fullstack Web",
    year: "2026",
    role_en: "Fullstack Web Developer",
    role_id: "Fullstack Web Developer",
    tech_stack: ["Next.js", "Supabase", "PostgreSQL", "Vercel"],
    problem_en:
      "Active Discord gaming communities often struggle with scattered event announcements, manual tournament standings updates, and difficulty showcasing member stories and community activities in one structured public hub.",
    problem_id:
      "Komunitas gaming Discord yang aktif sering mengalami kendala informasi event yang tersebar, pencatatan klasemen/scoreboard turnamen secara manual, serta belum adanya portal web terpusat untuk menampilkan cerita dan aktivitas komunitas.",
    architecture_en:
      "Built as a fullstack web application using Next.js and Supabase (PostgreSQL & Authentication) deployed on Vercel. Designed a structured database schema for events, live scoreboard standings, and community content managed through a dedicated Admin CMS panel, leveraging modern AI-assisted development workflows for rapid iteration.",
    architecture_id:
      "Dibangun sebagai aplikasi web fullstack menggunakan Next.js dan Supabase (PostgreSQL & Authentication) serta di-deploy ke Vercel. Merancang struktur database untuk event, klasemen scoreboard, dan konten komunitas yang dikelola melalui panel CMS Admin khusus, dengan memanfaatkan alur pengembangan modern berbantuan AI untuk iterasi yang cepat.",
    challenges_en:
      "Structuring the Admin CMS so community organizers can update match scores, event schedules, and content quickly without touching code, while keeping public scoreboard views accurate and responsive across desktop and mobile devices.",
    challenges_id:
      "Menyusun alur CMS Admin agar pengurus komunitas dapat memperbarui skor pertandingan, jadwal event, dan konten dengan cepat tanpa menyentuh kode, sambil menjaga tampilan scoreboard publik tetap akurat dan responsif di desktop maupun mobile.",
    impact_en:
      "Launched live at ldvarch.com as a centralized public home for the LDV community, streamlining tournament scoreboard management and non-technical content updates through the built-in Admin CMS.",
    impact_id:
      "Berhasil diluncurkan secara live di ldvarch.com sebagai pusat informasi resmi komunitas LDV, mempermudah pengelolaan scoreboard turnamen serta pembaruan konten operasional melalui CMS Admin terintegrasi.",
    live_url: "https://ldvarch.com",
    repo_url: null,
    cover_image_url: null,
    gallery_images: [],
    featured: true,
    published: true,
    sort_order: 3,
  },
];

export const FALLBACK_CAPABILITIES: TechCapability[] = [
  {
    id: "00000000-0000-0000-0000-000000000021",
    category_key: "frontend",
    title_en: "Frontend & Mobile",
    title_id: "Frontend & Mobile",
    description_en:
      "Clean, accessible web interfaces and native Android mobile applications.",
    description_id:
      "Antarmuka web yang bersih, responsif, serta pengembangan aplikasi mobile Android.",
    items: ["HTML5", "CSS3", "JavaScript", "Kotlin", "Android Studio", "Figma"],
    sort_order: 1,
  },
  {
    id: "00000000-0000-0000-0000-000000000022",
    category_key: "backend",
    title_en: "Backend & APIs",
    title_id: "Backend & API",
    description_en:
      "Structured server-side applications, admin panels, and RESTful authentication.",
    description_id:
      "Aplikasi server-side terstruktur, panel administrasi, dan layanan REST API.",
    items: ["PHP", "Laravel", "Filament", "Node.js", "Express", "JWT Auth"],
    sort_order: 2,
  },
  {
    id: "00000000-0000-0000-0000-000000000023",
    category_key: "database",
    title_en: "Database & Data Reporting",
    title_id: "Database & Pelaporan Data",
    description_en:
      "Relational data modeling, operational workflows, and business intelligence dashboards.",
    description_id:
      "Pemodelan data relasional, proses operasional sistem, dan dashboard pelaporan.",
    items: [
      "MySQL",
      "PostgreSQL / Supabase",
      "Power BI",
      "Dashboard Reporting",
      "Operational Systems",
    ],
    sort_order: 3,
  },
  {
    id: "00000000-0000-0000-0000-000000000024",
    category_key: "tools",
    title_en: "Tools & Engineering Workflow",
    title_id: "Tools & Alur Kerja",
    description_en:
      "Daily development environment, version control, API testing, and cloud basics.",
    description_id:
      "Lingkungan pengembangan harian, kontrol versi, pengujian API, dan fondasi cloud.",
    items: ["Git", "GitHub", "VS Code", "Antigravity", "Postman", "GCP"],
    sort_order: 4,
  },
];

export const FALLBACK_EXPERIENCES: Experience[] = [
  {
    id: "00000000-0000-0000-0000-000000000101",
    organization: "Bangkit Academy (MSIB — Studi Independen)",
    role_en: "Mobile Development Cohort",
    role_id: "Peserta Mobile Development (MSIB)",
    period: "MSIB Program",
    location: "Indonesia (Remote)",
    summary_en:
      "Completed the Kampus Merdeka MSIB Independent Study track in Mobile Development, collaborating cross-functionally with Machine Learning and Cloud Computing peers to build REPLASTE.",
    summary_id:
      "Mengikuti program Studi Independen Bersertifikat (MSIB) Bangkit Academy pada jalur Mobile Development, berkolaborasi lintas tim bersama Machine Learning dan Cloud Computing membangun REPLASTE.",
    highlights_en: [
      "Built Android interfaces and application flows in Kotlin using Android Studio and Figma.",
      "Integrated TensorFlow Lite plastic classification and JWT-authenticated Node.js/Express APIs on GCP.",
    ],
    highlights_id: [
      "Membangun antarmuka dan alur aplikasi Android menggunakan Kotlin, Android Studio, dan Figma.",
      "Mengintegrasikan model klasifikasi plastik TensorFlow Lite serta API Node.js/Express berautentikasi JWT di GCP.",
    ],
    published: true,
    sort_order: 1,
  },
  {
    id: "00000000-0000-0000-0000-000000000102",
    organization: "Universitas Bani Saleh",
    role_en: "B.Sc. in Information Systems (S1 Sistem Informasi)",
    role_id: "S1 Sistem Informasi — Fakultas Teknologi Informasi dan Digital",
    period: "Bachelor Degree",
    location: "Bekasi, Jawa Barat",
    summary_en:
      "Studied Information Systems at the Faculty of Information and Digital Technology, combining software engineering with operational system analysis and Power BI data reporting.",
    summary_id:
      "Menempuh pendidikan S1 Program Studi Sistem Informasi di Fakultas Teknologi Informasi dan Digital, memadukan pengembangan perangkat lunak dengan pemahaman proses operasional sistem dan pelaporan Power BI.",
    highlights_en: [
      "Developed web and application projects including an integrated Laravel & Filament library system.",
      "Processed operational datasets and created structured analytical dashboard reports with Power BI.",
    ],
    highlights_id: [
      "Mengembangkan proyek website dan aplikasi termasuk sistem informasi perpustakaan berbasis Laravel & Filament.",
      "Mengolah data dan menyusun laporan dashboard analitik terstruktur menggunakan Power BI.",
    ],
    published: true,
    sort_order: 2,
  },
];

export const FALLBACK_PORTFOLIO_DATA: PortfolioData = {
  profile: FALLBACK_PROFILE,
  projects: FALLBACK_PROJECTS,
  capabilities: FALLBACK_CAPABILITIES,
  experiences: FALLBACK_EXPERIENCES,
  source: "fallback",
};
