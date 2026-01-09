# Stumart Dev Hub

A React application built with Vite, React Router, and Tailwind CSS.

## Prerequisites

- Node.js (version 18.x or higher)
- npm

## Installation

```bash
npm install
```

## Running the Project

### Development Mode

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Deployment to Vercel

### Option 1: Using Vercel CLI

1. Install Vercel CLI globally:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Follow the prompts to complete deployment.

### Option 2: Using Vercel Dashboard

1. Push your code to GitHub/GitLab/Bitbucket
2. Go to [vercel.com](https://vercel.com) and sign in
3. Click "Add New Project"
4. Import your repository
5. Vercel will auto-detect Vite settings:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
6. Click "Deploy"

The `vercel.json` file is already configured for React Router client-side routing.

## Database Setup (Supabase)

### 1. Run SQL Schemas

Run these SQL files in Supabase SQL Editor (in order):

1. **`supabase-schema.sql`** - Creates `students` table
2. **`supabase-products-schema.sql`** - Creates `products` table
3. **`supabase-storage-policies.sql`** - Sets up storage bucket policies

### 2. Create Storage Bucket

1. Go to Supabase Dashboard → Storage
2. Create bucket: `product-images`
3. Make it **PUBLIC**
4. Run `supabase-storage-policies.sql` to set policies

### 3. Environment Variables

Create `.env` file:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Features

- User authentication with email verification
- Student registration with PIN validation
- Post creation with image uploads
- Products linked to user profiles
- Branch and category filtering