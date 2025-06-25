# RedTrack Dashboard

A dashboard application for managing RedTrack campaigns with Firebase integration.

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Firebase Configuration

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Firestore Database
3. Get your Firebase configuration from Project Settings > General > Your apps
4. Create a `.env.local` file in the root directory with the following variables:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 3. Firestore Rules

Update your Firestore security rules to allow read/write access:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if true; // For development only
    }
  }
}
```

### 4. Run the Application
```bash
npm run dev
```

## Features

- Campaign management with RedTrack API
- Firebase integration for data persistence
- Real-time status updates
- Sorting and filtering capabilities
- Responsive design

## Data Structure

The application stores data in Firebase Firestore with the following structure:

```
users/
  {userId}/
    apiKey: string
    siteStatus: {
      {campaignId}: {
        {key}: 1 | 0
      }
    }
```

## API Routes

- `/api/campaigns` - Fetch campaign list
- `/api/report` - Fetch campaign details

## Components

- `ApiKeyModal` - Modal for entering RedTrack API key
- `TopBar` - Navigation bar with logout functionality
- `DetailTable` - Campaign detail table with sorting and status management

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.