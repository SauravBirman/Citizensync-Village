# CitizenSync Village

**CitizenSync Village** is a rural governance platform developed for **HackVortex 2025**, designed to empower **Villagers**, **Sarpanch**, and **Tehsil Officers** to collaborate effectively on issue resolution, announcements, and community engagement.

🔗 **Live Demo**: [https://citizensync-village.web.app](https://citizensync-village.web.app)  
> _Note: If the app isn't working due to permissions, follow the local setup instructions below._

---

## 👥 Team Details

- **Team Name**: [Your Team Name]
- **Team Size**: ≤ 3 members
- **Hackathon**: HackVortex 2025

---

## 🚀 Features

### 🔐 Role-Based Access

| Role            | Features                                                                 |
|-----------------|--------------------------------------------------------------------------|
| **Villager**     | Report issues, vote on urgency, give satisfaction feedback, view announcements |
| **Sarpanch**     | Manage village-level issues, mark them solved, post announcements       |
| **Tehsil Officer** | Oversee escalated issues unresolved by Sarpanch for 5+ days             |

---

### 🛠️ Issue Management

- Report issues with descriptions, locations, and urgency.
- Villagers can vote on whether an issue is **urgent**.
- If unresolved for **5 days**, the issue escalates to the **Tehsil Officer**.
- After resolution, villagers vote on satisfaction.
- Low satisfaction triggers alerts for re-evaluation by the **Sarpanch**.

---

### 📢 Announcements

- Sarpanch can post important announcements visible to all villagers.

---

### 🔔 Notifications

- Real-time alerts for:
  - Issue updates
  - Escalations
  - Satisfaction voting results

---

### 📊 Analytics

- Role-based dashboards showing:
  - Open & resolved issues
  - Most urgent/voted issues
  - Satisfaction trends

---

## 🧰 Tech Stack

| Layer            | Technology                  |
|------------------|-----------------------------|
| **Frontend**      | React, Material-UI           |
| **Backend**       | Firebase Firestore           |
| **Authentication**| Firebase Authentication (Anonymous sign-in for demo) |
| **Hosting**       | Firebase Hosting             |
| **Build Tool**    | Vite                         |

---

## 📁 Project Structure

```
citizensync-village/
├── public/
│   ├── index.html
│   ├── favicon.ico
├── src/
│   ├── App.jsx
│   ├── Login.jsx
│   ├── Home.jsx
│   ├── firebase.js
│   ├── services/
│   │   ├── api.js
│   │   ├── auth.js
│   ├── components/
│   │   ├── VillageSelector.jsx
│   ├── styles/
│   ├── assets/
├── firebase.json
├── firestore.rules
├── .firebaserc
├── package.json
├── package-lock.json
├── vite.config.js
├── .gitignore
├── README.md
├── screenshots/
│   ├── login.png
│   ├── dashboard.png
```

---

## 🖥️ Local Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/citizensync-village.git
cd citizensync-village
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Firebase Setup

- Go to [Firebase Console](https://console.firebase.google.com) and create a new project.
- Enable the following:
  - **Firestore Database**
  - **Authentication > Anonymous Sign-In**

- Copy your Firebase config from:  
  `Project Settings > General > Your apps`

- Create a `.env` file in the root of your project:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### 4. Start Firebase Emulator (Optional)

```bash
npm install -g firebase-tools
firebase emulators:start
```

> The emulator runs:
> - Firestore at `localhost:8080`
> - Authentication at `localhost:9099`

### 5. Run the App

```bash
npm run dev
```

> Visit `http://localhost:5173` (check terminal output for the actual port).

---

## 🧪 Testing the App

1. Sign up using a test Aadhaar number (e.g., `123456789012`).
2. Choose a role: **Villager**, **Sarpanch**, or **Tehsil Officer**.
3. Complete the form with sample village and name.
4. Log in using the same Aadhaar and role to view your dashboard.

---

## 🔒 Security Notes

- **Authentication**: Anonymous Firebase Auth is used for demo purposes. Aadhaar-based verification should use custom token auth via a secure backend.
- **Access Control**: Firestore security rules enforce:
  - Users can read/write only their own data.
  - Only authenticated users can create/read issues.
  - Role-specific permissions for issue status updates and announcements.

---

## 📸 Screenshots

| Login Screen         | Dashboard View        |
|----------------------|-----------------------|
| ![Login](screenshots/login.png) | ![Dashboard](screenshots/dashboard.png) |

---

## 📄 License

MIT License – free to use, modify, and share.
