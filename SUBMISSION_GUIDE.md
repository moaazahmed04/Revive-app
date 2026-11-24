# REVIVE — Project Submission & Deployment Guide
**Faculty of Commerce — Cairo University**  
**Team 3 (Group I) — Supervised by: Dr. Sayed Kamal**

---

## 1. How to Run Locally (For Class Presentation)

1. Navigate to the project folder:
   `C:\Users\Moaaz\.gemini\antigravity\scratch\revive_app`
2. Double-click **`run_app.bat`** (or open terminal and run `python server.py`).
3. Open your browser to: **`http://localhost:8000`**
4. **Presentation Tip:** Click the **"📱 Mobile View"** toggle in the top-right header to showcase the app inside an authentic smartphone shell with a dynamic island and native mobile navigation during your presentation!

---

## 2. How to Make it an Online Web Page (Live URL for the Doctor)

To let Dr. Sayed Kamal open and test the app on his own phone or computer without installing anything:

### Option A: Free Permanent Cloud Hosting (Render.com) — *Recommended*
1. Create a free account at [render.com](https://render.com).
2. Click **New +** > **Web Service**.
3. Connect your GitHub repository containing the `revive_app` code.
4. Set the following settings:
   - **Environment:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `python -m uvicorn server:app --host 0.0.0.0 --port $PORT`
5. Click **Deploy**. In 2 minutes, you will get a permanent public link like:  
   👉 `https://revive-wardrobe.onrender.com`

### Option B: Instant Public Tunnel (Instant Demo)
If you want to instantly share a public link right from your PC right now:
- Install LocalTunnel: `npx localtunnel --port 8000`
- Or use Ngrok: `ngrok http 8000`  
This gives you an instant link you can open on any phone connected to the internet.

---

## 3. How to Make it an Android App (.apk)

The app is now configured as a **Progressive Web App (PWA)** with a `manifest.json`, service worker, and luxury high-res icons.

### Method 1: Instant "Add to Home Screen" (No APK download required)
1. Open the live web link in **Google Chrome on any Android phone**.
2. Tap the three dots (⋮) menu in Chrome > select **"Install App"** or **"Add to Home screen"**.
3. The **REVIVE** icon will appear on your Android home screen and open full-screen like a native Android app without any browser address bar!

### Method 2: Generate an Android APK file (.apk)
1. Go to Microsoft's free tool: **[PWABuilder](https://www.pwabuilder.com/)**.
2. Paste your live online URL (from Render/Cloud).
3. Click **Start** > then click **Package for Android**.
4. PWABuilder will automatically compile and download a signed **`.apk`** file.
5. You can upload this `.apk` to Google Drive and send the download link to Dr. Sayed Kamal!

---

## 4. Suggested Submission Email / Report Template

```text
Subject: Entrepreneurship Project Submission — Team 3 (Group I) — REVIVE

Dear Dr. Sayed Kamal,

We are pleased to submit our project "REVIVE (Your Wardrobe, Reimagined)" for the Faculty of Commerce, Cairo University.

Project Overview:
REVIVE is an AI-powered smart wardrobe and mix-and-match platform that enables users to maximize their existing clothes, receive weather- and occasion-aware outfit suggestions, and test how new items from partner stores (Zara, H&M, etc.) pair with their wardrobe before buying.

Project Team (Team 3 — Group I):
1. Menna Allah Ahmed Hassan Wafiq (Project Manager) — 01157735592
2. Nada Emad Helmy Abdelraouf (Technical Manager) — 01025760370
3. Moureen George Saeed Youssef (Marketing Manager) — 01281105501
4. Menna Magdy Mahmoud Mohamed (Finance Manager) — 01028846641
5. Nourhan Khaled Mohamed Saeed (Product & Market Research) — 01069996865
6. Mohanned Hossam Abdellateef (Business Strategy & Partnerships) — 01141967472

Access Links:
- Live Web Application: [Insert Your Live Link Here]
- Android App Download / Install: [Insert Link or attach APK]
- Source Code Repository: [Insert GitHub Link]

Thank you,
Team 3 (Group I)
Faculty of Commerce — Cairo University
```
