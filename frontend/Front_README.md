# Interview Buddy AI - Frontend

This is the frontend for the Interview Buddy AI application, built with React, TypeScript, and Tailwind CSS. It provides a modern, interactive user interface for candidates to practice mock interviews, receive AI-driven feedback, and follow personalized learning paths.

## 🚀 Tech Stack

- **Framework:** [React 18](https://react.dev/) (Vite)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [Shadcn UI](https://ui.shadcn.com/) (based on Radix UI)
- **State Management:** [Zustand](https://zustand-demo.pmnd.rs/)
- **Routing:** [React Router DOM](https://reactrouter.com/)
- **Data Fetching:** [TanStack Query](https://tanstack.com/query/latest) & [Axios](https://axios-http.com/)
- **Forms & Validation:** [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
- **Charts:** [Recharts](https://recharts.org/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Testing:** [Vitest](https://vitest.dev/), [Playwright](https://playwright.dev/), and [Testing Library](https://testing-library.com/)

## ✨ Key Features

- **Intuitive Onboarding:** Easy resume upload and interview customization (role, difficulty, duration).
- **Interactive Interview Interface:** A real-time chat experience with:
  - AI-driven dynamic questioning.
  - Live timer and progress tracking.
  - Topic tracker to visualize covered domains.
- **Comprehensive Results Dashboard:**
  - Overall performance scores visualized via Radar Charts.
  - Detailed breakdown of technical skills, communication, and clarity.
  - Specific feedback on answers and actionable suggestions.
- **Personalized Learning Roadmap:** A week-by-week study plan generated based on the interview results.
- **Responsive Design:** Fully optimized for both desktop and mobile devices.

## 📁 Project Structure

```text
frontend/
├── src/
│   ├── api/           # API client and service definitions
│   ├── components/    # Reusable UI components (shadcn + custom)
│   │   ├── interview/ # Interview-specific components
│   │   ├── onboarding/# Onboarding and setup components
│   │   ├── results/   # Evaluation and feedback components
│   │   ├── roadmap/   # Learning plan components
│   │   └── ui/        # Base shadcn components
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Utility functions and configurations
│   ├── pages/         # Main page views (Landing, Interview, Results, etc.)
│   ├── store/         # Global state management (Zustand)
│   ├── types/         # TypeScript type definitions
│   └── App.tsx        # Main application component
├── public/            # Static assets
└── package.json       # Dependencies and scripts
```

## 🛠️ Setup & Installation

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Bun](https://bun.sh/) or [npm](https://www.npmjs.com/)

### 2. Clone the repository
```bash
git clone <repository-url>
cd interview-buddy-ai/frontend
```

### 3. Install dependencies
Using Bun (recommended):
```bash
bun install
```
Using npm:
```bash
npm install
```

### 4. Configure Environment Variables
Create a `.env` file in the `frontend/` directory:

```env
VITE_API_URL=http://localhost:8000/api
```

### 5. Start the development server
```bash
bun run dev
# or
npm run dev
```

The application will be available at `http://localhost:8080` (or the port specified by Vite).

## 🧪 Testing

Run unit and integration tests with Vitest:
```bash
bun run test
```

Run E2E tests with Playwright:
```bash
bun run test:e2e
```

## 🏗️ Building for Production

To create a production build:
```bash
bun run build
```
The optimized build will be generated in the `dist/` directory.
