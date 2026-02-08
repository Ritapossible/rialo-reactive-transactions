# Rialo Sandbox

## Project Overview

**Rialo Sandbox** is a gamified testnet environment that allows users to safely explore how Rialo blockchain automated reactive transactions work. It provides an interactive platform to simulate automated workflow transactions, experiment with strategies, and learn Rialo blockchain mechanics without real financial risk.

**Live Demo:** [https://rialo-sandbox.vercel.app](https://rialo-sandbox.vercel.app)

---

## Features

- Automated onchain reactive transactions.
- Balance triggers.
- Interactive blockchain simulation with gamified mechanics.
- Testnet token transactions.
- Real-time feedback and analytics.
- Smart contracts deployment for staking and minting tokens. 

- 🧪 **Simulated market data**
  - Token prices
  - Network activity
  - User onboarding metrics

- 🏆 **Gamified rewards**
  - Earn points based on workflow actions
  - Execution tracking & statistics

- 🔐 **Supabase-powered backend**
  - Edge Functions (workflow engine)
  - Secure server-side logic

- ⚡ **Modern frontend stack**
  - Fast, responsive, and developer-friendly

---

## 🧱 Tech Stack

### Frontend
- Vite
- React
- TypeScript
- Tailwind CSS
- shadcn/ui

### Backend
- Supabase
  - PostgreSQL
  - Edge Functions (Deno)
- Server-side workflow engine

---


## Getting Started

### Prerequisites

- Node.js & npm ([install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating))

## Installation

### Step 1: Clone the repository
git clone <YOUR_GIT_URL>

### Step 2: Navigate to the project directory
cd <YOUR_PROJECT_NAME>

### Step 3: Install dependencies
npm install

### Step 4: Start the development server
npm run dev

The development server will run locally with live reloading, so you can preview changes instantly.

---

## Editing Options

### Use your preferred IDE

Clone the repository and edit locally. Push changes to GitHub; deployments will reflect updates automatically if connected to Vercel.

### Edit directly on GitHub

- Navigate to the desired file
- Click the pencil icon ✏️ to edit
- Commit your changes

### Use GitHub Codespaces

- Open your repository on GitHub
- Click **Code → Codespaces → New codespace**
- Edit files directly and commit your changes from the Codespace

---

## Deployment

This project is deployed on **Vercel**. To deploy locally:

```bash
npm run build
npm run preview

```
---

## Configure environment variables

Create a `.env` file from the example:

```bash
cp .env.example .env

```

### Fill in your Supabase values:

VITE_SUPABASE_PROJECT_ID=your_project_id
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
VITE_SUPABASE_URL=https://your_project_id.supabase.co

---

# Deployment

The project is deployed on Vercel:

🔗 [https://rialo-sandbox.vercel.app](https://rialo-sandbox.vercel.app)


You can deploy your own instance using:

Vercel

Netlify

Any static host compatible with Vite

Supabase Edge Functions should be deployed using the Supabase CLI.

# 🧠 Purpose & Vision

## Mini-Rialo Simulator is designed to:

Teach how Rialo automation interactive transactions works.

Enable safe experimentation with workflows.

Serve as a foundation for future on-chain integrations.

Provide a sandbox for learning, testing, and gamification.
