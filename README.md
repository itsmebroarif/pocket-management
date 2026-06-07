# 🚀 Pocket Management

🌍 **Choose your language / Pilih bahasa / 言語を選択:**
[🇮🇩 Bahasa Indonesia](#-bahasa-indonesia) | [🇬🇧 English](#-english) | [🇯🇵 日本語 (Japanese)](#-日本語-japanese)

---

## 🇮🇩 Bahasa Indonesia

Sebuah aplikasi *desktop* ringan, luring (*offline-first*), dan multifungsi untuk menata keseharianmu. Dibangun dengan fokus pada kecepatan, desain antarmuka yang enerjik, dan fungsionalitas yang solid. Aplikasi ini menggabungkan pelacak kebiasaan, manajemen tugas, pencatatan keuangan, hingga *mini-games* bergaya retro di dalam satu *dashboard* yang *fresh*.

### ✨ Fitur Utama
*   **🎯 Habit Tracker:** Bangun kebiasaan positif dengan sistem *check-in* harian yang dilengkapi animasi selebrasi lucu setiap kali target tercapai.
*   **⚡ Todo & Task Management:** Atur tugas berdasarkan prioritas. Pindahkan status tugas dengan mudah dari *Todo*, *In Progress*, hingga *Done*.
*   **💵 Finance Management:** Pantau arus kas, catat pengeluaran dan pemasukan, serta kelola dompet (Cash, Bank, E-Wallet) dalam antarmuka yang bersih.
*   **📓 Quick Notes:** Catat ide dadakan dengan fitur *sticky notes* yang selalu siap diakses.
*   **🕹️ Retro Mini-Games:** Butuh istirahat dari rutinitas? Mainkan 3 *mini-games* kasual dengan estetika piksel RPG klasik (Memory Match, Monster Tapper, Tic-Tac-Toe) langsung dari *sidebar*.
*   **📜 Local Logging System:** Seluruh aktivitas dicatat secara lokal dan dapat diekspor menjadi file `log.txt` kapan saja.

### 🛠️ Teknologi & Arsitektur
| Komponen | Teknologi yang Digunakan |
| :--- | :--- |
| **Frontend Framework** | React (via Vite) |
| **Desktop Wrapper** | Tauri |
| **Styling** | Tailwind CSS |
| **Ikon & Grafik** | Phosphor Icons / FontAwesome & Chart.js |
| **Interaksi UI** | SweetAlert2 & JS-Confetti |

### 💻 Dukungan Sistem Operasi
*   **Windows:** `.exe` atau `.msi`
*   **Linux:** `.AppImage` atau `.deb`
*   **macOS:** `.app` atau `.dmg`

### 🚀 Cara Menjalankan & Build
```bash
# Kloning repository
git clone [https://github.com/username/pocket-management.git](https://github.com/username/pocket-management.git)
cd pocket-management

# Instal dependensi
npm install

# Jalankan mode pengembangan
npm run tauri dev

# Build aplikasi (production)
npm run tauri build
