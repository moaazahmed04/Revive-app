# REVIVE — (Your Wardrobe, Reimagined)

> **Faculty of Commerce — Cairo University**  
> **Team 3 (Group I)**  
> **Supervised by:** Doctor / Sayed Kamal

---

## 👥 Management Team
1. **Menna Allah Ahmed Hassan Wafiq** (`01157735592`) — Project Manager
2. **Nada Emad Helmy Abdelraouf** (`01025760370`) — Technical Manager
3. **Moureen George Saeed Youssef** (`01281105501`) — Marketing Manager
4. **Menna Magdy Mahmoud Mohamed** (`01028846641`) — Finance Manager
5. **Nourhan Khaled Mohamed Saeed** (`01069996865`) — Product & Market Research
6. **Mohanned Hossam Abdellateef** (`01141967472`) — Business Strategy & Partnerships

---

## 🌟 Executive Summary & Value Proposition
Many people struggle daily with *"I have nothing to wear"* despite having closets full of clothes. **REVIVE** solves this daily frustration by digitizing users' wardrobes and applying AI styling algorithms to maximize existing clothing before buying new ones. 

Unlike traditional apps that only organize clothes or only sell items, **REVIVE** combines:
1. **Digital Wardrobe**: Upload photos, organize by category, color, season, and occasion.
2. **Smart Outfit Suggestions**: Real-time outfit suggestions calibrated to local weather (temperature & conditions), occasion (work, casual, university, date night, party), and color harmony theory.
3. **AI Style Generator & Chat**: Prompt-based styling ("vibe generator") and interactive AI Stylist chatbot.
4. **Mix & Match Canvas**: Interactive visual canvas to drag, swap, and harmonize outfits with live compatibility scoring.
5. **Partner Store & Shopping Links**: Browse trending pieces from partner retailers (Zara, H&M, Mango, Bershka, Concrete, Town Team) and use the **"Try with My Wardrobe"** engine to see how a new store item pairs with your existing clothes *before* spending money.
6. **Weekly Outfit Planner**: Schedule outfits from Monday through Sunday to eliminate morning decision fatigue.
7. **Mobile App & Web View**: Instant toggle between high-fidelity smartphone device view and full-width responsive desktop view.

---

## 🚀 How to Run the Application

### Option A: Double-Click
Double-click `run_app.bat` inside this folder.

### Option B: Terminal Command
```bash
cd "C:\Users\Moaaz\.gemini\antigravity\scratch\revive_app"
python server.py
```

Then open your browser to:
👉 **`http://localhost:8000`** (or `http://127.0.0.1:8000`)

---

## 📁 Project Architecture
```
revive_app/
├── server.py              # FastAPI backend & AI Outfit Engine
├── run_app.bat            # Quick launcher for Windows
├── data/
│   ├── starter_wardrobe.json # High-res preloaded closet dataset
│   ├── store_items.json      # Partner store catalog (Zara, H&M, etc.)
│   ├── wardrobe.json         # Active wardrobe data (persisted)
│   ├── saved_outfits.json    # Bookmarked user outfits
│   └── planner.json          # Weekly schedule
├── static/
│   ├── index.html         # Responsive web & mobile UI shell
│   ├── styles.css         # Luxury fashion design system
│   └── app.js             # Client controller, state & animations
└── uploads/               # User-uploaded clothing photos
```
