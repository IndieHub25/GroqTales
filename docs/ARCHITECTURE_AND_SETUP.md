# GroqTales Architecture & Setup Guide

## 🌟 Introduction

Welcome to GroqTales! This guide is designed to explain how everything works in simple terms (ELI5)
and help you set up the project completely.

## 🏗️ Architecture Overview

### 1. Frontend (The Face)

- **Technology**: Next.js (React framework).
- **Role**: This is what users see and interact with. It handles the "Comic Style" UI, animations,
  and wallet connection.
- **Location**: The `app/`, `components/`, and `public/` folders.

### 2. Backend (The Brain)

- **Technology**: Express.js (Node.js server).
- **Role**: This handles the "heavy lifting" like saving stories, talking to the AI, and managing
  NFTs. It listens for requests from the Frontend.
- **Location**: The `server/` folder.

### 3. Database (The Memory)

- **Technology**: MongoDB.
- **Role**: This stores all the data (stories, user profiles, etc.) so it doesn't disappear when you
  refresh the page.
- **Location**: Hosted in the cloud (MongoDB Atlas) or locally.

---

## 🚀 Setup Instructions (The "Leftover Stuff")

### Step 1: Database Setup (MongoDB)

You need a place to store data. We use MongoDB.

1. **Create an Account**: Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign up
   (it's free).
2. **Create a Cluster**: Follow the prompts to create a free "Shared" cluster.
3. **Get Connection String**:
   - Click "Connect".
   - Choose "Drivers".
   - Copy the string that looks like:
     `mongodb+srv://<username>:<password>@cluster0.mongodb.net/?retryWrites=true&w=majority`.
4. **Update Environment**:
   - Open the `.env` file in the project root (create one if it doesn't exist, copy from
     `.env.example`).
   - Add/Update this line:

     ```env
     MONGODB_URI=your_copied_connection_string_here
     ```

   - **Important**: Replace `<password>` with your actual database user password.

### Step 2: Install Dependencies

We need to make sure all the tools are installed.

1. Open your terminal in the project folder.
2. Run:

   ```bash
   npm install
   ```

3. We also need `concurrently` to run both servers at once. I will install this for you
   automatically, but just so you know:

   ```bash
   npm install concurrently --save-dev
   ```

### Step 3: Running the App

Once everything is set up:

1. Run:

   ```bash
   npm start
   ```

2. This will start **BOTH** the Frontend (localhost:3000) and the Backend (localhost:3001).

---

## 📂 Folder Structure (Where things live)

- `app/`: The pages of your website (Home, Profile, etc.).
- `components/`: Reusable building blocks (Buttons, Headers, Cards).
- `server/`: The backend code.
  - `server/models/`: Defines what data looks like (e.g., a Story has a title and content).
  - `server/routes/`: Defines the API endpoints (e.g., /api/stories).
- `public/`: Images, fonts, and static files.

## 📝 What Remains to be Done

- **AI Integration**: The `server/routes/ai.js` file needs to be connected to the actual Groq API
  key.
- **Smart Contracts**: The NFT marketplace needs actual smart contract deployment details in
  `server/routes/nft.js`.
