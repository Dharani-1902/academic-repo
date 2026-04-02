# 🚀 Production Deployment Master Guide

Follow these steps to deploy your **Student Academic History Repository** to the web.

---

## 1. Database Setup (MongoDB Atlas)
1.  **Create Account**: Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2.  **Create Cluster**: Follow the prompts to create a New Project and a **Free Tier (Shared)** Cluster.
3.  **Network Access**: 
    - Go to "Network Access" in the sidebar.
    - Click "Add IP Address" and select **Allow Access from Anywhere** (0.0.0.0/0) for initial setup.
4.  **Database Access**: 
    - Create a user (e.g., `admin`) and a password. **Save these.**
5.  **Get Connection String**:
    - Click "Connect" on your Cluster.
    - Choose "Drivers" and copy the `mongodb+srv://...` URL.
    - Replace `<password>` with your database user password.

---

## 2. Backend Deployment (Render.com)
1.  **Sign Up**: Create an account at [Render](https://render.com).
2.  **New Web Service**:
    - Connect your GitHub repository.
    - Select the repository for this project.
3.  **Configure Service**:
    - **Name**: `academic-repo-backend`
    - **Root Directory**: `backend`
    - **Build Command**: `npm install`
    - **Start Command**: `node server.js`
4.  **Advanced (Environment Variables)**:
    - `MONGO_URI`: (Your Atlas Connection String)
    - `JWT_SECRET`: `your_random_secret_string`
    - `FRONTEND_URL`: (You will update this after Step 3)
5.  **Copy the URL**: Once deployed, Render will give you a URL (e.g., `https://academic-repo-backend.onrender.com`).

---

## 3. Frontend Deployment (Vercel)
1.  **Sign Up**: Create an account at [Vercel](https://vercel.com).
2.  **Import Project**:
    - Select your GitHub repository.
3.  **Configure Project**:
    - **Root Directory**: `frontend`
    - **Framework Preset**: `Vite`
4.  **Environment Variables**:
    - Add `VITE_API_URL`: `https://your-backend-url.onrender.com/api`
5.  **Deploy**: Click Deploy.
6.  **Copy the URL**: Once deployed, Vercel will give you a URL (e.g., `https://academic-repo.vercel.app`).

---

## 4. Final Sync
1.  Go back to your **Render (Backend)** settings.
2.  Update the `FRONTEND_URL` environment variable with your **Vercel URL**.
3.  Redeploy the backend.

---

## 5. Seed the Production Database
Once the backend is live on Render:
1.  Open your local terminal.
2.  In the `backend` folder, temporarily update your `.env` `MONGO_URI` to the **Atlas String**.
3.  Run `npm run seed`.
4.  Your production database now has the `admin` account!

> [!TIP]
> Always use `https://` for production URLs in your environment variables.
