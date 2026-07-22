# Master Chef AI Cooking App

An AI-powered Smart Recipe & Fridge Chef app specializing in authentic Telugu (Andhra & Telangana), South Indian, North Indian, and Global cuisines. It crafts diet-conscious home-cooked recipes, smart ingredient substitutions, and kid-friendly variations using Gemini AI with friendly Tanglish explanations.

---

## 🚀 Quick Start for Local Testing

Follow these step-by-step instructions to clone, configure, and run the app locally on your machine.

### 📋 Prerequisites

Before running the project locally, ensure you have the following installed:
- **Node.js**: v18.0.0 or higher (v20+ recommended). Check with `node -v`.
- **npm**: v9.0.0 or higher. Check with `npm -v`.
- **Git**: Installed on your system.

---

### 🛠️ Step-by-Step Setup

#### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd <repository-directory>
```

#### 2. Install Dependencies
Install all required node packages using `npm`:
```bash
npm install
```

#### 3. Create `.env` Environment File
Copy the example environment file to create your local `.env`:
```bash
cp .env.example .env
```

#### 4. Configure Your Gemini API Key
1. Get a free Gemini API Key from Google AI Studio: [https://aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Open `.env` in your text editor.
3. Replace the placeholder values with your credentials:

```env
# Required for real-time Gemini AI recipe generation
GEMINI_API_KEY="AIzaSyYourActualKeyHere"

# Set DEBUG=true for testing so detailed server errors surface directly in network responses instead of falling back to sample recipes
DEBUG="true"

# Local app URL
APP_URL="http://localhost:3000"
```

> 💡 **Why set `DEBUG=true`?**
> When testing locally, setting `DEBUG="true"` ensures that if Gemini API returns an error or rate limit, you will see a detailed error response in your console/network tools rather than a silent fallback to sample data.

---

### 🏃 Running the Application

#### Development Mode
Start the development server with hot-reloading (Vite + Express):
```bash
npm run dev
```

Once started, open your browser and navigate to:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 📜 NPM Scripts Reference

| Script | Command | Description |
| :--- | :--- | :--- |
| `npm run dev` | `tsx server.ts` | Launches the Express server on port 3000 with embedded Vite dev middleware |
| `npm run build` | `vite build && esbuild ...` | Compiles frontend assets to `dist/` and bundles `server.ts` into `dist/server.cjs` |
| `npm run start` | `node dist/server.cjs` | Runs the compiled production server build |
| `npm run lint` | `tsc --noEmit` | Validates TypeScript types across the project |
| `npm run clean` | `rm -rf dist server.js` | Cleans up build artifacts |

---

## 🔍 Pre-Flight Check & Troubleshooting

#### 1. Port 3000 Already in Use (`EADDRINUSE`)
- **Symptom**: `Error: listen EADDRINUSE: address already in use :::3000`
- **Fix**: Free up port 3000 by stopping the process using it:
  - **macOS/Linux**: `lsof -i :3000` then `kill -9 <PID>`
  - **Windows**: `netstat -ano | findstr :3000` then `taskkill /PID <PID> /F`

#### 2. Gemini API Key Error or 429 Quota Exceeded
- **Symptom**: Server logs show `Missing API key` or `429 Too Many Requests`.
- **Fix**: Check that `GEMINI_API_KEY` is set correctly in `.env` without surrounding quotes or whitespace. If quota is exceeded, generate a new free key at [Google AI Studio](https://aistudio.google.com/apikey).

#### 3. Module Import / TypeScript Errors
- **Symptom**: `Cannot find module` or build failures.
- **Fix**: Run `npm install` to ensure all packages are installed properly, then verify types with `npm run lint`.

---

## 🎨 Architecture Overview
- **Backend**: Express.js server (`server.ts`) powered by `@google/genai` SDK using `gemini-2.5-flash`.
- **Frontend**: React 19 + TypeScript + Vite with Tailwind CSS v4 and Framer Motion.
- **Environment**: Reads variables via `dotenv/config` at server startup.
