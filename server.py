import os
import json
import uuid
import shutil
import random
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
UPLOADS_DIR = os.path.join(BASE_DIR, "uploads")
STATIC_DIR = os.path.join(BASE_DIR, "static")

os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(UPLOADS_DIR, exist_ok=True)
os.makedirs(STATIC_DIR, exist_ok=True)

WARDROBE_FILE = os.path.join(DATA_DIR, "wardrobe.json")
STARTER_FILE = os.path.join(DATA_DIR, "starter_wardrobe.json")
STORE_FILE = os.path.join(DATA_DIR, "store_items.json")
SAVED_FILE = os.path.join(DATA_DIR, "saved_outfits.json")
PLANNER_FILE = os.path.join(DATA_DIR, "planner.json")

# Helper file loaders
def load_json(filepath: str, default_data: Any) -> Any:
    if os.path.exists(filepath):
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return default_data
    return default_data

def save_json(filepath: str, data: Any):
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def get_wardrobe() -> List[Dict[str, Any]]:
    if not os.path.exists(WARDROBE_FILE):
        starter = load_json(STARTER_FILE, [])
        save_json(WARDROBE_FILE, starter)
        return starter
    return load_json(WARDROBE_FILE, [])

def get_store_items() -> List[Dict[str, Any]]:
    return load_json(STORE_FILE, [])

# FastAPI Application
app = FastAPI(
    title="REVIVE - Your Wardrobe, Reimagined",
    description="AI-Powered Smart Wardrobe, Outfit Stylist & Mix-and-Match Platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class WardrobeItemCreate(BaseModel):
    name: str
    category: str
    subCategory: Optional[str] = "General"
    color: str
    colorHex: Optional[str] = "#333333"
    season: List[str] = ["All Season"]
    occasions: List[str] = ["Casual"]
    style: Optional[str] = "Smart Casual"
    warmthLevel: Optional[int] = 3
    imageUrl: Optional[str] = None
    favorite: Optional[bool] = False

class SuggestionRequest(BaseModel):
    weatherCondition: Optional[str] = "Sunny" # Sunny, Rainy, Chilly, Mild, Hot
    temperature: Optional[int] = 22 # in Celsius
    occasion: Optional[str] = "Casual" # Casual, Work, University, Party, Date
    stylePreference: Optional[str] = "All" # Minimalist, Streetwear, Smart Casual, Chic, Athleisure, All
    mustIncludeItemId: Optional[str] = None

class AIStylePromptRequest(BaseModel):
    prompt: str
    weatherCondition: Optional[str] = "Sunny"
    temperature: Optional[int] = 22

class ChatMessage(BaseModel):
    message: str
    history: Optional[List[Dict[str, str]]] = []

class PlanEntry(BaseModel):
    day: str # Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday
    outfitId: str
    outfitTitle: str
    itemIds: List[str]
    notes: Optional[str] = ""

class SaveOutfitRequest(BaseModel):
    title: str
    occasion: str
    weatherNote: Optional[str] = ""
    itemIds: List[str]
    storeAddonId: Optional[str] = None
    aiRationale: Optional[str] = ""

# Color harmony groups
NEUTRALS = {"White", "Black", "Grey", "Charcoal", "Beige", "Cream", "Nude"}
EARTH_TONES = {"Camel", "Brown", "Olive", "Emerald", "Amber", "Khaki", "Mocha Brown"}
COOL_TONES = {"Blue", "Navy", "Slate", "Pastel Blue", "Charcoal", "Black"}

def evaluate_color_harmony(colors: List[str]) -> int:
    clean_colors = [c.capitalize() for c in colors if c]
    if not clean_colors:
        return 85
    neutral_count = sum(1 for c in clean_colors if any(n.lower() in c.lower() for n in NEUTRALS))
    # If mostly neutrals, very safe and harmonious (90-98%)
    if neutral_count >= len(clean_colors) - 1:
        return random.randint(93, 98)
    # Earth tone mix
    earth_count = sum(1 for c in clean_colors if any(e.lower() in c.lower() for e in EARTH_TONES))
    if earth_count >= 2:
        return random.randint(90, 96)
    return random.randint(86, 94)

# Endpoints
@app.get("/api/about")
def get_about_info():
    return {
        "appName": "REVIVE",
        "tagline": "Your Wardrobe, Reimagined",
        "institution": "Cairo University",
        "faculty": "Faculty of Commerce",
        "team": "Team 3 (Group I)",
        "supervisor": "Doctor / Sayed Kamal",
        "members": [
            {"name": "Menna Allah Ahmed Hassan Wafiq", "phone": "01157735592", "role": "Project Manager"},
            {"name": "Nada Emad Helmy Abdelraouf", "phone": "01025760370", "role": "Technical Manager"},
            {"name": "Moureen George Saeed Youssef", "phone": "01281105501", "role": "Marketing Manager"},
            {"name": "Menna Magdy Mahmoud Mohamed", "phone": "01028846641", "role": "Finance Manager"},
            {"name": "Nourhan Khaled Mohamed Saeed", "phone": "01069996865", "role": "Product & Market Research"},
            {"name": "Mohanned Hossam Abdellateef", "phone": "01141967472", "role": "Business Strategy & Partnerships"}
        ],
        "valueProposition": "REVIVE helps users save time by making outfit choices easier and saves money by maximizing existing clothes before buying new items.",
        "competitiveAdvantage": "Combines personal wardrobe digitalization, weather/occasion-aware AI styling, and smart partner store mix-and-match in one seamless application."
    }

@app.get("/api/wardrobe")
def list_wardrobe(category: Optional[str] = None, occasion: Optional[str] = None, favorite_only: bool = False):
    items = get_wardrobe()
    if category and category.lower() != "all":
        items = [i for i in items if i.get("category", "").lower() == category.lower()]
    if occasion and occasion.lower() != "all":
        items = [i for i in items if any(occasion.lower() in o.lower() for o in i.get("occasions", []))]
    if favorite_only:
        items = [i for i in items if i.get("favorite")]
    return items

@app.post("/api/wardrobe")
def add_wardrobe_item(item: WardrobeItemCreate):
    items = get_wardrobe()
    new_id = f"item_{uuid.uuid4().hex[:8]}"
    item_dict = item.model_dump()
    item_dict["id"] = new_id
    if not item_dict.get("imageUrl"):
        item_dict["imageUrl"] = "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=600&q=80"
    item_dict["wearCount"] = 0
    item_dict["lastWorn"] = None
    items.insert(0, item_dict)
    save_json(WARDROBE_FILE, items)
    return item_dict

@app.post("/api/wardrobe/upload")
async def upload_clothing_image(
    file: UploadFile = File(...),
    name: str = Form(...),
    category: str = Form(...),
    subCategory: Optional[str] = Form("General"),
    color: str = Form("Black"),
    colorHex: Optional[str] = Form("#333333"),
    occasions: str = Form("Casual"),
    season: str = Form("All Season"),
    style: Optional[str] = Form("Smart Casual"),
    warmthLevel: Optional[int] = Form(3)
):
    ext = os.path.splitext(file.filename)[1] or ".jpg"
    filename = f"{uuid.uuid4().hex[:12]}{ext}"
    filepath = os.path.join(UPLOADS_DIR, filename)
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    image_url = f"/uploads/{filename}"
    occasion_list = [o.strip() for o in occasions.split(",") if o.strip()]
    season_list = [s.strip() for s in season.split(",") if s.strip()]
    
    new_item = {
        "id": f"item_{uuid.uuid4().hex[:8]}",
        "name": name,
        "category": category,
        "subCategory": subCategory,
        "color": color,
        "colorHex": colorHex,
        "occasions": occasion_list if occasion_list else ["Casual"],
        "season": season_list if season_list else ["All Season"],
        "style": style or "Smart Casual",
        "warmthLevel": warmthLevel or 3,
        "imageUrl": image_url,
        "favorite": False,
        "wearCount": 0,
        "lastWorn": None
    }
    
    items = get_wardrobe()
    items.insert(0, new_item)
    save_json(WARDROBE_FILE, items)
    return new_item

@app.delete("/api/wardrobe/{item_id}")
def delete_wardrobe_item(item_id: str):
    items = get_wardrobe()
    filtered = [i for i in items if i["id"] != item_id]
    if len(filtered) == len(items):
        raise HTTPException(status_code=404, detail="Item not found")
    save_json(WARDROBE_FILE, filtered)
    return {"success": True, "message": "Item deleted"}

@app.patch("/api/wardrobe/{item_id}/favorite")
def toggle_favorite(item_id: str):
    items = get_wardrobe()
    target = None
    for i in items:
        if i["id"] == item_id:
            i["favorite"] = not i.get("favorite", False)
            target = i
            break
    if not target:
        raise HTTPException(status_code=404, detail="Item not found")
    save_json(WARDROBE_FILE, items)
    return target

@app.post("/api/wardrobe/reset")
def reset_to_starter():
    starter = load_json(STARTER_FILE, [])
    save_json(WARDROBE_FILE, starter)
    return {"success": True, "items": starter}

@app.get("/api/store")
def list_store_items(category: Optional[str] = None):
    items = get_store_items()
    if category and category.lower() != "all":
        items = [i for i in items if i.get("category", "").lower() == category.lower()]
    return items

# Smart Outfit Suggestion Engine
@app.post("/api/outfits/suggest")
def generate_smart_suggestions(req: SuggestionRequest):
    wardrobe = get_wardrobe()
    if not wardrobe:
        return {"outfits": []}

    temp = req.temperature if req.temperature is not None else 22
    weather = req.weatherCondition or "Sunny"
    occasion = req.occasion or "Casual"
    style_pref = req.stylePreference or "All"

    is_cold = temp <= 18 or weather.lower() in ["rainy", "chilly", "cold"]
    is_hot = temp >= 26

    # Group items by category
    tops = [i for i in wardrobe if i.get("category") == "Tops"]
    bottoms = [i for i in wardrobe if i.get("category") == "Bottoms"]
    outerwear = [i for i in wardrobe if i.get("category") == "Outerwear"]
    shoes = [i for i in wardrobe if i.get("category") == "Shoes"]
    accessories = [i for i in wardrobe if i.get("category") == "Accessories"]
    dresses = [i for i in wardrobe if i.get("category") == "Dresses"]

    # Filter items matching occasion if applicable
    def filter_by_occasion(item_list):
        if occasion.lower() == "all":
            return item_list
        matched = [i for i in item_list if any(occasion.lower() in o.lower() for o in i.get("occasions", []))]
        return matched if len(matched) >= 1 else item_list

    f_tops = filter_by_occasion(tops)
    f_bottoms = filter_by_occasion(bottoms)
    f_outerwear = filter_by_occasion(outerwear)
    f_shoes = filter_by_occasion(shoes)
    f_accessories = filter_by_occasion(accessories)
    f_dresses = filter_by_occasion(dresses)

    outfits = []
    store_items = get_store_items()

    # Generate Combination 1: Signature Balanced Look
    if f_tops and f_bottoms and f_shoes:
        top1 = random.choice(f_tops)
        bottom1 = random.choice([b for b in f_bottoms if b["color"] != top1.get("color")] or f_bottoms)
        shoe1 = random.choice(f_shoes)
        outfit1_items = [top1, bottom1, shoe1]
        
        if (is_cold or occasion in ["Work", "Date"]) and f_outerwear:
            coat = random.choice(f_outerwear)
            outfit1_items.append(coat)
        
        if f_accessories:
            outfit1_items.append(random.choice(f_accessories))

        harmony = evaluate_color_harmony([i.get("color", "") for i in outfit1_items])
        
        outfits.append({
            "id": f"outfit_{uuid.uuid4().hex[:6]}",
            "title": f"{occasion} Silhouette & Tone",
            "vibe": "Effortless Tailoring & Everyday Comfort",
            "score": harmony,
            "weatherSummary": f"Calibrated for {temp}°C • {weather}",
            "occasion": occasion,
            "items": outfit1_items,
            "rationale": f"Combines {top1['name']} with {bottom1['name']} creating a balanced proportion. The {shoe1['name']} grounds the look with intentional comfort, suitable for {occasion.lower()} settings.",
            "storeAddon": random.choice(store_items) if store_items else None
        })

    # Generate Combination 2: Modern Contrast / Minimalist Vibe
    if len(tops) >= 1 and len(bottoms) >= 1 and shoes:
        top2 = tops[(len(tops) - 1) % len(tops)]
        bottom2 = bottoms[0]
        shoe2 = shoes[(len(shoes) - 1) % len(shoes)]
        outfit2_items = [top2, bottom2, shoe2]
        
        if outerwear:
            outfit2_items.append(outerwear[0])
        if len(accessories) > 1:
            outfit2_items.append(accessories[1])

        harmony2 = evaluate_color_harmony([i.get("color", "") for i in outfit2_items])
        outfits.append({
            "id": f"outfit_{uuid.uuid4().hex[:6]}",
            "title": f"Clean Minimalist {occasion} Edit",
            "vibe": "Monochrome Foundation with Architectural Layering",
            "score": harmony2,
            "weatherSummary": f"Optimal for {weather} conditions",
            "occasion": occasion,
            "items": outfit2_items,
            "rationale": f"High versatility formula pairing clean neutrals with functional layering. Designed to adapt seamlessly between indoor temperatures and outdoor commute.",
            "storeAddon": store_items[0] if store_items else None
        })

    # Generate Combination 3: Elevated Chic / Statement Look
    if f_dresses and shoes:
        dress = f_dresses[0]
        shoe3 = shoes[0]
        outfit3_items = [dress, shoe3]
        if outerwear:
            outfit3_items.append(outerwear[-1])
        if accessories:
            outfit3_items.append(accessories[0])
        
        outfits.append({
            "id": f"outfit_{uuid.uuid4().hex[:6]}",
            "title": f"Fluid {dress['name'].split()[0]} Elegance",
            "vibe": "Seamless One-Piece Statement with Layered Texture",
            "score": 97,
            "weatherSummary": f"Refined for {temp}°C weather",
            "occasion": occasion,
            "items": outfit3_items,
            "rationale": f"The {dress['name']} offers a sophisticated, uninterrupted line. Adding structured outerwear creates an appealing interplay of soft fabric and crisp tailoring.",
            "storeAddon": store_items[1] if len(store_items) > 1 else None
        })
    elif len(tops) > 1 and len(bottoms) > 1 and len(shoes) > 1:
        # Fallback 3rd combination with distinct style
        top3 = tops[1]
        bottom3 = bottoms[1]
        shoe3 = shoes[0]
        outfit3_items = [top3, bottom3, shoe3]
        if len(outerwear) > 1:
            outfit3_items.append(outerwear[1])
        outfits.append({
            "id": f"outfit_{uuid.uuid4().hex[:6]}",
            "title": f"Relaxed Weekend & Street Edit",
            "vibe": "Casual Sophistication with Modern Textures",
            "score": 94,
            "weatherSummary": f"Comfortably suited for {temp}°C",
            "occasion": occasion,
            "items": outfit3_items,
            "rationale": f"Effortless layering with {top3['name']} and {bottom3['name']}. Versatile enough to transition from daytime campus coffee to evening dinner.",
            "storeAddon": store_items[2] if len(store_items) > 2 else None
        })

    return {"outfits": outfits, "weather": {"condition": weather, "temperature": temp}, "occasion": occasion}

# AI Style Generator Endpoint (Natural Language Styling)
@app.post("/api/ai/generate-style")
def ai_generate_style(req: AIStylePromptRequest):
    wardrobe = get_wardrobe()
    store_items = get_store_items()
    prompt_lower = req.prompt.lower()
    
    # Analyze prompt intent
    detected_occasion = "Casual"
    if any(w in prompt_lower for w in ["work", "meeting", "office", "interview", "formal", "corporate", "presentation"]):
        detected_occasion = "Work"
    elif any(w in prompt_lower for w in ["party", "night", "club", "dinner", "evening", "celebration", "wedding"]):
        detected_occasion = "Party"
    elif any(w in prompt_lower for w in ["date", "romantic", "coffee"]):
        detected_occasion = "Date"
    elif any(w in prompt_lower for w in ["college", "university", "campus", "class", "lecture"]):
        detected_occasion = "University"

    # Style detection
    detected_style = "Smart Casual"
    if any(w in prompt_lower for w in ["streetwear", "street", "hoodie", "chunky", "urban", "relaxed", "oversized"]):
        detected_style = "Streetwear"
    elif any(w in prompt_lower for w in ["minimalist", "clean", "simple", "neutral", "quiet luxury"]):
        detected_style = "Minimalist"
    elif any(w in prompt_lower for w in ["chic", "elegant", "sophisticated", "glam"]):
        detected_style = "Chic"

    # Select pieces matching the vibe
    tops = [i for i in wardrobe if i.get("category") == "Tops"]
    bottoms = [i for i in wardrobe if i.get("category") == "Bottoms"]
    outerwear = [i for i in wardrobe if i.get("category") == "Outerwear"]
    shoes = [i for i in wardrobe if i.get("category") == "Shoes"]
    accessories = [i for i in wardrobe if i.get("category") == "Accessories"]
    dresses = [i for i in wardrobe if i.get("category") == "Dresses"]

    selected_items = []
    
    # If user mentioned dress or evening
    if "dress" in prompt_lower and dresses:
        selected_items.append(dresses[0])
        if shoes: selected_items.append(shoes[-1])
        if outerwear: selected_items.append(outerwear[0])
    else:
        # Match top by style/occasion
        chosen_top = None
        for t in tops:
            if detected_style.lower() in t.get("style", "").lower() or detected_occasion.lower() in [o.lower() for o in t.get("occasions", [])]:
                chosen_top = t
                break
        if not chosen_top and tops: chosen_top = tops[0]
        if chosen_top: selected_items.append(chosen_top)

        # Match bottom
        chosen_bottom = None
        for b in bottoms:
            if detected_occasion == "Work" and "trouser" in b.get("name", "").lower():
                chosen_bottom = b; break
            elif detected_style == "Streetwear" and "denim" in b.get("name", "").lower():
                chosen_bottom = b; break
        if not chosen_bottom and bottoms: chosen_bottom = bottoms[0]
        if chosen_bottom: selected_items.append(chosen_bottom)

        # Match shoes
        chosen_shoe = None
        for s in shoes:
            if (detected_style == "Streetwear" or detected_occasion == "University") and "sneaker" in s.get("name", "").lower():
                chosen_shoe = s; break
            elif detected_occasion in ["Work", "Party"] and ("heels" in s.get("name", "").lower() or "boot" in s.get("name", "").lower()):
                chosen_shoe = s; break
        if not chosen_shoe and shoes: chosen_shoe = shoes[0]
        if chosen_shoe: selected_items.append(chosen_shoe)

        # Add outer layer if chilly or prompt asks for coat/jacket/layering
        needs_layer = req.temperature <= 19 or any(w in prompt_lower for w in ["layer", "chilly", "cold", "coat", "jacket", "blazer", "evening"])
        if needs_layer and outerwear:
            chosen_outer = None
            if detected_occasion == "Work":
                chosen_outer = next((o for o in outerwear if "blazer" in o.get("name", "").lower()), outerwear[0])
            elif "leather" in prompt_lower or detected_style == "Streetwear":
                chosen_outer = next((o for o in outerwear if "leather" in o.get("name", "").lower()), outerwear[0])
            else:
                chosen_outer = outerwear[0]
            selected_items.append(chosen_outer)

        if accessories:
            selected_items.append(accessories[0])

    # Find partner store recommendation to elevate the prompt
    matched_store_item = None
    if store_items:
        if detected_occasion == "Work":
            matched_store_item = next((s for s in store_items if s.get("category") == "Outerwear"), store_items[0])
        elif detected_style == "Streetwear":
            matched_store_item = next((s for s in store_items if s.get("category") == "Bottoms"), store_items[0])
        else:
            matched_store_item = random.choice(store_items)

    styling_tips = [
        f"Silhouette Balance: Balance the relaxed volume on top with clean structure on the lower half.",
        f"Color Cohesion: The selected color palette creates harmony while keeping the focus on subtle texture.",
        f"Finishing Detail: Roll sleeves slightly to expose watch or bracelets for an effortless, curated feel.",
        f"Footwear Pairing: The chosen shoes provide both comfort and grounding suitable for {detected_occasion.lower()} settings."
    ]

    return {
        "prompt": req.prompt,
        "aesthetic": f"{detected_style} • {detected_occasion}",
        "score": 96,
        "aiExplanation": f"Curated for your request '{req.prompt}'. This ensemble balances personal comfort with high-fashion intentionality, ensuring you look put-together without feeling overdressed.",
        "items": selected_items,
        "storeAddon": matched_store_item,
        "stylingTips": styling_tips
    }

# Conversational AI Stylist Chat
@app.post("/api/stylist/chat")
def stylist_chat(chat: ChatMessage):
    user_msg = chat.message.strip().lower()
    wardrobe = get_wardrobe()
    store_items = get_store_items()

    total_items = len(wardrobe)
    tops_count = len([i for i in wardrobe if i.get("category") == "Tops"])
    bottoms_count = len([i for i in wardrobe if i.get("category") == "Bottoms"])
    outerwear_count = len([i for i in wardrobe if i.get("category") == "Outerwear"])
    shoes_count = len([i for i in wardrobe if i.get("category") == "Shoes"])

    # Responsive rule-based AI fashion assistant
    if any(w in user_msg for w in ["hello", "hi", "hey"]):
        reply = (
            f"Hello! I am your **Revive AI Stylist**. I currently have access to your **{total_items} wardrobe pieces** "
            f"({tops_count} tops, {bottoms_count} bottoms, {outerwear_count} outerwear, {shoes_count} shoes).\n\n"
            "Tell me: Where are you heading today, what is the weather like, or what specific piece do you want to build an outfit around?"
        )
    elif any(w in user_msg for w in ["what to wear", "suggest", "outfit today", "today"]):
        reply = (
            "For an effortlessly sharp everyday outfit, I recommend pairing your **Classic White Linen Button-Down** "
            "with the **Tailored High-Waist Beige Trousers** and **Minimalist White Leather Sneakers**. "
            "If it gets breezy later, throw on the **Structured Slate Grey Blazer**.\n\n"
            "Would you like me to tailor this for a specific occasion like work, college, or a dinner?"
        )
    elif any(w in user_msg for w in ["color", "match", "colors", "palette"]):
        reply = (
            "A foolproof fashion rule for your closet is the **60-30-10 Rule**:\n"
            "• **60% Dominant Neutral**: Beige, Charcoal, or White (e.g. trousers & shirt)\n"
            "• **30% Secondary Texture/Tone**: Navy, Camel, or Denim (e.g. wool coat or denim)\n"
            "• **10% Accent**: Emerald Silk or Amber Sunglasses for visual interest!\n\n"
            "Your existing wardrobe has exceptional earth-tone and neutral harmony."
        )
    elif any(w in user_msg for w in ["buy", "missing", "gap", "shop", "partner", "store"]):
        best_store = store_items[0] if store_items else None
        store_hint = f" For example, the **{best_store['name']} from {best_store['brand']}** ({best_store['price']}) would integrate with 8+ items in your closet." if best_store else ""
        reply = (
            f"Based on your closet analysis, your wardrobe has strong core basics! To maximize your outfit variety, your highest-value additions are:\n\n"
            f"1. **Structured Oversized Blazer** in oatmeal or check pattern (pairs with both jeans and dresses).\n"
            f"2. **Chunky Lug-Sole Loafers** (instantly elevates linen shirts and pleated trousers).\n\n"
            f"You can explore these directly in the **Partner Store** tab!{store_hint}"
        )
    elif any(w in user_msg for w in ["team", "who built", "cairo university", "revive"]):
        reply = (
            "REVIVE was conceptualized by **Team 3 (Group I)** at **Cairo University** under the supervision of **Dr. Sayed Kamal**.\n\n"
            "Team members: Menna Allah Ahmed, Nada Emad, Moureen George, Menna Magdy, Nourhan Khaled, and Mohanned Hossam.\n"
            "The mission: Help people rediscover the potential of their existing wardrobe while seamlessly blending smart shopping and AI recommendations!"
        )
    else:
        reply = (
            f"That's a fantastic styling question! In your current wardrobe, we can create multiple high-impact silhouettes. "
            f"Try combining high-contrast neutrals—like pairing your darker bottoms with a lighter crisp top, grounded by clean footwear. "
            f"Check the **Mix & Match** or **AI Stylist** tab to see visual previews generated in real time!"
        )

    return {"response": reply}

# Mix and Match: Try with Partner Store Item
@app.post("/api/mix-match/try-store-item/{store_item_id}")
def try_store_item_with_wardrobe(store_item_id: str):
    store_items = get_store_items()
    target_store_item = next((s for s in store_items if s["id"] == store_item_id), None)
    if not target_store_item:
        raise HTTPException(status_code=404, detail="Store item not found")

    wardrobe = get_wardrobe()
    category = target_store_item.get("category", "")
    
    # Generate 3 synergistic outfits combining this store item with user's wardrobe
    synergies = []
    
    tops = [i for i in wardrobe if i.get("category") == "Tops"]
    bottoms = [i for i in wardrobe if i.get("category") == "Bottoms"]
    outerwear = [i for i in wardrobe if i.get("category") == "Outerwear"]
    shoes = [i for i in wardrobe if i.get("category") == "Shoes"]
    accessories = [i for i in wardrobe if i.get("category") == "Accessories"]
    
    # Outfit 1
    combo1_items = []
    if category == "Outerwear":
        combo1_items = [tops[0] if tops else None, bottoms[0] if bottoms else None, shoes[0] if shoes else None]
    elif category == "Tops":
        combo1_items = [bottoms[0] if bottoms else None, outerwear[0] if outerwear else None, shoes[0] if shoes else None]
    elif category == "Bottoms":
        combo1_items = [tops[0] if tops else None, outerwear[0] if outerwear else None, shoes[0] if shoes else None]
    elif category == "Shoes":
        combo1_items = [tops[0] if tops else None, bottoms[0] if bottoms else None, outerwear[0] if outerwear else None]
    else:
        combo1_items = [tops[0] if tops else None, bottoms[0] if bottoms else None, shoes[0] if shoes else None]

    combo1_clean = [i for i in combo1_items if i]
    synergies.append({
        "title": f"Look 1: Polished Everyday Edit",
        "storeItem": target_store_item,
        "wardrobeItems": combo1_clean,
        "compatibilityScore": 95,
        "notes": f"The {target_store_item['name']} pairs naturally with your existing {', '.join(i['name'] for i in combo1_clean)}."
    })

    # Outfit 2
    combo2_items = []
    if category == "Outerwear":
        combo2_items = [tops[1] if len(tops) > 1 else tops[0], bottoms[1] if len(bottoms) > 1 else bottoms[0], shoes[-1] if shoes else None]
    else:
        combo2_items = [tops[-1] if tops else None, bottoms[-1] if bottoms else None, shoes[1] if len(shoes) > 1 else shoes[0]]
    combo2_clean = [i for i in combo2_items if i]
    synergies.append({
        "title": f"Look 2: Weekend & Social Contrast",
        "storeItem": target_store_item,
        "wardrobeItems": combo2_clean,
        "compatibilityScore": 92,
        "notes": f"Creates a distinct fashion-forward contrast with different textures and silhouettes from your closet."
    })

    return {
        "storeItem": target_store_item,
        "wardrobeUtilityScore": 94,
        "unlockedOutfitsCount": 6,
        "summary": f"Adding this {target_store_item['brand']} piece unlocks 6 new outfit formulas with your current {len(wardrobe)} wardrobe items!",
        "synergies": synergies
    }

# Saved Outfits Endpoints
@app.get("/api/saved-outfits")
def list_saved_outfits():
    return load_json(SAVED_FILE, [])

@app.post("/api/saved-outfits")
def save_outfit(req: SaveOutfitRequest):
    saved = load_json(SAVED_FILE, [])
    wardrobe = get_wardrobe()
    store_items = get_store_items()

    resolved_items = [i for i in wardrobe if i["id"] in req.itemIds]
    resolved_addon = next((s for s in store_items if s["id"] == req.storeAddonId), None)

    new_outfit = {
        "id": f"saved_{uuid.uuid4().hex[:8]}",
        "title": req.title,
        "occasion": req.occasion,
        "weatherNote": req.weatherNote,
        "items": resolved_items,
        "storeAddon": resolved_addon,
        "aiRationale": req.aiRationale or "Custom curated look saved by user.",
        "createdAt": "2026-11-23"
    }
    saved.insert(0, new_outfit)
    save_json(SAVED_FILE, saved)
    return new_outfit

@app.delete("/api/saved-outfits/{outfit_id}")
def delete_saved_outfit(outfit_id: str):
    saved = load_json(SAVED_FILE, [])
    filtered = [s for s in saved if s["id"] != outfit_id]
    save_json(SAVED_FILE, filtered)
    return {"success": True}

# Weekly Planner Endpoints
@app.get("/api/planner")
def get_planner():
    default_planner = {
        "Monday": None,
        "Tuesday": None,
        "Wednesday": None,
        "Thursday": None,
        "Friday": None,
        "Saturday": None,
        "Sunday": None
    }
    return load_json(PLANNER_FILE, default_planner)

@app.post("/api/planner")
def set_planner_day(entry: PlanEntry):
    planner = get_planner()
    wardrobe = get_wardrobe()
    resolved_items = [i for i in wardrobe if i["id"] in entry.itemIds]
    
    planner[entry.day] = {
        "outfitId": entry.outfitId,
        "outfitTitle": entry.outfitTitle,
        "items": resolved_items,
        "notes": entry.notes
    }
    save_json(PLANNER_FILE, planner)
    return planner

# Mount static files and uploads
app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

@app.get("/")
def serve_index():
    return FileResponse(os.path.join(STATIC_DIR, "index.html"))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="127.0.0.1", port=8000, reload=True)
