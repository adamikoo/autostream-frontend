# 🎨 AutoStream Frontend (Dashboard)

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Firebase](https://img.shields.io/badge/firebase-a08021?style=for-the-badge&logo=firebase&logoColor=ffcd34)

**AutoStream Frontend** is the command center for the AutoStream platform. It provides a sleek, modern dashboard for users to configure niche bots, schedule content, and monitor the performance of their viral video empire.

---

## ✨ Features

*   **Bot Management**: Create, edit, and configure "Niche Bots" with specific topics, tones, and schedules.
*   **Video Overview**: Monitor the status of video generation (Scripting -> Generating -> Uploading).
*   **Analytics Dashboard**: Visual representations of bot performance and engagement metrics.
*   **Prompt Engineering**: Fine-tune the AI personas and creative directives.
*   **Modern UI**: Built with React + Vite + TailwindCSS for a responsive and premium feel.

---

## 🛠️ Tech Stack

*   **Framework**: React 18+ (Vite)
*   **Styling**: TailwindCSS
*   **Icons**: Lucide React
*   **Database**: Supabase (Client-side integration)
*   **Auth**: Firebase Auth / Supabase Auth
*   **Deployment**: Vercel / Netlify / Static Hosting

---

## 🚀 Getting Started

### Prerequisites

*   **Node.js 18+**
*   **npm** or **yarn**

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/adamikoo/autostream-frontend.git
    cd autostream-frontend
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Configuration**:
    Create a `.env` file in the root directory:
    ```ini
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    VITE_FIREBASE_API_KEY=your_firebase_key
    # Add other Vite env vars as needed
    ```

### Usage

Run the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or the port shown in your terminal).

---

## 📦 Build for Production

To create a production build:

```bash
npm run build
```

The output will be in the `dist/` directory, ready to be deployed to any static hosting provider.

---

## 🛡️ License

This project is licensed under the MIT License.
