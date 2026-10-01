from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import io
import uuid
import logging
import secrets
import re
from datetime import datetime, timezone, timedelta
from typing import List, Optional

import jwt
import bcrypt
import requests
from bson import ObjectId
from fastapi import FastAPI, APIRouter, Request, Response, HTTPException, Depends, UploadFile, File, Header, Query, WebSocket, WebSocketDisconnect
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr, Field

# ------------------------------------------------------------------ setup
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALGORITHM = "HS256"
FRONTEND_URL = os.environ.get('FRONTEND_URL', 'http://localhost:3000')
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')
APP_NAME = os.environ.get('APP_NAME', 'mentormatch')

STORAGE_BASE = (os.environ.get("INTEGRATION_PROXY_URL") or "").strip() or "https://integrations.emergentagent.com"
STORAGE_URL = STORAGE_BASE.rstrip("/") + "/objstore/api/v1/storage"

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("mentormatch")

app = FastAPI()
api = APIRouter(prefix="/api")

# ------------------------------------------------------------------ taxonomy
TAXONOMY = {
    "Technology": ["Machine Learning", "Artificial Intelligence", "Python", "Java", "JavaScript",
                   "Cloud Computing", "Cybersecurity", "Data Science", "DevOps", "Blockchain",
                   "TensorFlow", "PyTorch", "NLP", "Computer Vision", "Deep Learning", "React",
                   "Node.js", "SQL", "AWS", "Docker", "Kubernetes", "Data Analytics"],
    "Business": ["Product Management", "Business Strategy", "Entrepreneurship", "Marketing",
                 "Sales", "Finance", "Operations"],
    "Academic": ["Research", "Academic Mentoring", "Project Guidance", "Thesis Guidance",
                 "Curriculum Development"],
    "Industry": ["FinTech", "Healthcare", "EdTech", "E-commerce", "Manufacturing", "Automotive", "SaaS"],
}
ALL_SKILLS = {s.lower(): (s, cat) for cat, arr in TAXONOMY.items() for s in arr}
INDUSTRIES = ["Technology", "Finance", "Healthcare", "Education", "Manufacturing",
              "Retail", "Consulting", "Automotive", "Energy", "Media"]
ENGAGEMENT_TYPES = ["Mentoring", "Teaching", "Training", "Workshops", "Consulting",
                    "Career Guidance", "Project Guidance"]
AVAILABILITY_OPTS = ["Part-time", "Full-time", "Weekends", "Evenings", "Project-based"]

DEFAULT_WEIGHTS = {"skill": 0.35, "experience": 0.20, "teaching": 0.15,
                   "industry": 0.10, "availability": 0.10, "engagement": 0.10}

# ------------------------------------------------------------------ helpers: auth
def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(pw: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(pw.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False

def create_access_token(uid: str, email: str, role: str) -> str:
    payload = {"sub": uid, "email": email, "role": role,
               "exp": datetime.now(timezone.utc) + timedelta(days=7), "type": "access"}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def set_auth_cookie(response: Response, token: str):
    response.set_cookie(key="access_token", value=token, httponly=True, secure=True,
                        samesite="none", max_age=604800, path="/")

async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        if user.get("suspended"):
            raise HTTPException(status_code=403, detail="Account suspended")
        user["id"] = str(user["_id"])
        user.pop("_id", None)
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def require_role(*roles):
    async def dep(user: dict = Depends(get_current_user)):
        if user["role"] not in roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return user
    return dep

# ------------------------------------------------------------------ helpers: storage
storage_key = None

def init_storage(force: bool = False):
    global storage_key
    if storage_key and not force:
        return storage_key
    resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_LLM_KEY}, timeout=30)
    resp.raise_for_status()
    storage_key = resp.json()["storage_key"]
    return storage_key

def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    resp = requests.put(f"{STORAGE_URL}/objects/{path}",
                        headers={"X-Storage-Key": key, "Content-Type": content_type},
                        data=data, timeout=120)
    if resp.status_code == 404:
        key = init_storage(force=True)
        resp = requests.put(f"{STORAGE_URL}/objects/{path}",
                            headers={"X-Storage-Key": key, "Content-Type": content_type},
                            data=data, timeout=120)
    resp.raise_for_status()
    return resp.json()

def get_object(path: str):
    key = init_storage()
    resp = requests.get(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key}, timeout=60)
    if resp.status_code == 404:
        key = init_storage(force=True)
        resp = requests.get(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key}, timeout=60)
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")

# ------------------------------------------------------------------ helpers: resume parsing
def extract_text(data: bytes, filename: str) -> str:
    ext = filename.lower().rsplit(".", 1)[-1] if "." in filename else ""
    try:
        if ext == "pdf":
            from pypdf import PdfReader
            reader = PdfReader(io.BytesIO(data))
            return "\n".join((p.extract_text() or "") for p in reader.pages)
        if ext in ("docx", "doc"):
            import docx
            doc = docx.Document(io.BytesIO(data))
            return "\n".join(p.text for p in doc.paragraphs)
        return data.decode("utf-8", errors="ignore")
    except Exception as e:
        logger.warning(f"text extract failed: {e}")
        return ""

def keyword_extract(text: str):
    low = text.lower()
    found = []
    for k, (name, cat) in ALL_SKILLS.items():
        if re.search(r"\b" + re.escape(k) + r"\b", low):
            found.append({"name": name, "category": cat})
    years = 0
    m = re.findall(r"(\d{1,2})\+?\s*(?:years|yrs)", low)
    if m:
        years = max(int(x) for x in m)
    return found, years

async def ai_extract_resume(text: str) -> dict:
    kw_skills, kw_years = keyword_extract(text)
    result = {
        "headline": "", "summary": "",
        "skills": kw_skills, "years_experience": kw_years,
        "industries": [], "expertise": [], "teaching_experience": False,
    }
    if not EMERGENT_LLM_KEY or not text.strip():
        return result
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        skill_list = ", ".join(s for s in ALL_SKILLS_ORDERED)
        sys_msg = (
            "You are a resume intelligence engine. Extract structured professional data. "
            "Return ONLY valid JSON, no markdown. Schema: {\"headline\": string, \"summary\": string (2 sentences), "
            "\"skills\": [{\"name\": string, \"category\": one of [Technology,Business,Academic,Industry]}], "
            "\"years_experience\": number, \"industries\": [string], \"expertise\": [string], "
            "\"teaching_experience\": boolean}. "
            f"Prefer skill names from this taxonomy when applicable: {skill_list}."
        )
        chat = LlmChat(api_key=EMERGENT_LLM_KEY, session_id=f"resume-{uuid.uuid4()}",
                       system_message=sys_msg).with_model("gemini", "gemini-3-flash-preview")
        resp = await chat.send_message(UserMessage(text=f"Resume text:\n{text[:12000]}"))
        raw = resp if isinstance(resp, str) else str(resp)
        raw = raw.strip()
        if raw.startswith("```"):
            raw = raw.split("```", 2)[1]
            if raw.startswith("json"):
                raw = raw[4:]
        import json
        data = json.loads(raw[raw.find("{"): raw.rfind("}") + 1])
        # merge / sanitize
        if data.get("skills"):
            result["skills"] = [{"name": s.get("name"), "category": s.get("category", "Technology")}
                                for s in data["skills"] if s.get("name")]
        result["headline"] = data.get("headline") or result["headline"]
        result["summary"] = data.get("summary") or ""
        result["years_experience"] = int(data.get("years_experience") or kw_years or 0)
        result["industries"] = data.get("industries") or []
        result["expertise"] = data.get("expertise") or []
        result["teaching_experience"] = bool(data.get("teaching_experience"))
    except Exception as e:
        logger.warning(f"AI extract failed, using keyword fallback: {e}")
    return result

ALL_SKILLS_ORDERED = [s for cat, arr in TAXONOMY.items() for s in arr]

async def ai_parse_requirement(text: str) -> dict:
    kw_skills, kw_years = keyword_extract(text)
    result = {"skills": [s["name"] for s in kw_skills], "min_experience": kw_years,
              "industry": "", "teaching_required": "teach" in text.lower() or "workshop" in text.lower(),
              "engagement_type": "", "summary": ""}
    if not EMERGENT_LLM_KEY or not text.strip():
        return result
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        sys_msg = (
            "Extract hiring requirements from an organization's description. Return ONLY JSON: "
            "{\"skills\":[string],\"min_experience\":number,\"industry\":string,"
            "\"teaching_required\":boolean,\"engagement_type\":string,\"summary\":string}. "
            f"engagement_type one of {ENGAGEMENT_TYPES}."
        )
        chat = LlmChat(api_key=EMERGENT_LLM_KEY, session_id=f"req-{uuid.uuid4()}",
                       system_message=sys_msg).with_model("gemini", "gemini-3-flash-preview")
        resp = await chat.send_message(UserMessage(text=text[:6000]))
        raw = (resp if isinstance(resp, str) else str(resp)).strip()
        if raw.startswith("```"):
            raw = raw.split("```", 2)[1]
            if raw.startswith("json"):
                raw = raw[4:]
        import json
        data = json.loads(raw[raw.find("{"): raw.rfind("}") + 1])
        result.update({k: data.get(k, result[k]) for k in result})
        result["min_experience"] = int(result.get("min_experience") or 0)
    except Exception as e:
        logger.warning(f"AI parse requirement failed: {e}")
    return result

# ------------------------------------------------------------------ matching engine
async def get_weights():
    s = await db.settings.find_one({"_id": "match_weights"})
    if s:
        return {k: s.get(k, DEFAULT_WEIGHTS[k]) for k in DEFAULT_WEIGHTS}
    return dict(DEFAULT_WEIGHTS)

def score_mentor(req: dict, mentor: dict, weights: dict):
    m_skills = [s["name"] for s in mentor.get("skills", [])]
    m_skills_low = set(x.lower() for x in m_skills)
    req_skills = req.get("skills", []) or []
    reasons = []

    if req_skills:
        matched = [s for s in req_skills if s.lower() in m_skills_low]
        skill_score = len(matched) / len(req_skills)
        if matched:
            reasons.append(f"Matches {len(matched)}/{len(req_skills)} required skills: {', '.join(matched)}")
        else:
            reasons.append("No direct skill overlap")
    else:
        skill_score, matched = 0.5, []

    min_exp = req.get("min_experience") or 0
    m_years = mentor.get("years_experience") or 0
    if min_exp <= 0:
        exp_score = 1.0
    elif m_years >= min_exp:
        exp_score = 1.0
        reasons.append(f"{m_years} yrs experience (meets {min_exp}+ yr requirement)")
    else:
        exp_score = max(0.0, m_years / min_exp)
        reasons.append(f"{m_years} yrs experience (below {min_exp}+ yr requirement)")

    if req.get("teaching_required"):
        teaching_score = 1.0 if mentor.get("teaching_experience") else 0.0
        reasons.append("Has teaching experience" if mentor.get("teaching_experience") else "No teaching experience")
    else:
        teaching_score = 1.0

    req_ind = (req.get("industry") or "").lower()
    m_inds = [i.lower() for i in mentor.get("industries", [])]
    if not req_ind:
        industry_score = 1.0
    elif req_ind in m_inds:
        industry_score = 1.0
        reasons.append(f"Industry match: {req.get('industry')}")
    else:
        industry_score = 0.3

    req_avail = req.get("availability") or ""
    if not req_avail or req_avail in mentor.get("availability", []):
        avail_score = 1.0
    else:
        avail_score = 0.5

    req_eng = req.get("engagement_type") or ""
    if not req_eng:
        eng_score = 1.0
    elif req_eng in mentor.get("engagement_types", []):
        eng_score = 1.0
        reasons.append(f"Offers {req_eng}")
    else:
        eng_score = 0.4

    total = (weights["skill"] * skill_score + weights["experience"] * exp_score +
             weights["teaching"] * teaching_score + weights["industry"] * industry_score +
             weights["availability"] * avail_score + weights["engagement"] * eng_score)
    breakdown = {
        "skill": round(weights["skill"] * skill_score * 100),
        "experience": round(weights["experience"] * exp_score * 100),
        "teaching": round(weights["teaching"] * teaching_score * 100),
        "industry": round(weights["industry"] * industry_score * 100),
        "availability": round(weights["availability"] * avail_score * 100),
        "engagement": round(weights["engagement"] * eng_score * 100),
    }
    return round(total * 100), reasons, breakdown

# ------------------------------------------------------------------ serializers
def anon_mentor(m: dict) -> dict:
    return {
        "id": m["id"], "code": m["code"], "headline": m.get("headline", ""),
        "summary": m.get("summary", ""), "skills": m.get("skills", []),
        "expertise": m.get("expertise", []), "industries": m.get("industries", []),
        "years_experience": m.get("years_experience", 0),
        "education_category": m.get("education_category", ""),
        "certifications": m.get("certifications", []),
        "mentoring_areas": m.get("mentoring_areas", []),
        "consulting_areas": m.get("consulting_areas", []),
        "teaching_subjects": m.get("teaching_subjects", []),
        "engagement_types": m.get("engagement_types", []),
        "availability": m.get("availability", []),
        "broad_location": m.get("broad_location", ""),
        "teaching_experience": m.get("teaching_experience", False),
        "verification_status": m.get("verification_status", "pending"),
    }

def full_mentor(m: dict) -> dict:
    d = anon_mentor(m)
    d.update({
        "full_name": m.get("full_name", ""), "personal_email": m.get("personal_email", ""),
        "phone": m.get("phone", ""), "exact_location": m.get("exact_location", ""),
        "linkedin": m.get("linkedin", ""), "portfolio": m.get("portfolio", ""),
        "resume_file_id": m.get("resume_file_id"),
    })
    return d

def clean(doc: dict) -> dict:
    doc.pop("_id", None)
    return doc

async def notify(user_id: str, ntype: str, title: str, body: str = "", link: str = ""):
    await db.notifications.insert_one({
        "id": str(uuid.uuid4()), "user_id": user_id, "type": ntype, "title": title,
        "body": body, "link": link, "read": False,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })

async def audit(actor: str, action: str, target: str = "", meta: dict = None):
    await db.audit_logs.insert_one({
        "id": str(uuid.uuid4()), "actor_id": actor, "action": action, "target": target,
        "meta": meta or {}, "created_at": datetime.now(timezone.utc).isoformat(),
    })

async def org_has_access(org_id: str, mentor_id: str) -> bool:
    r = await db.access_requests.find_one({"org_id": org_id, "mentor_id": mentor_id, "status": "approved"})
    return r is not None

def now_iso():
    return datetime.now(timezone.utc).isoformat()

# ------------------------------------------------------------------ models
class RegisterIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    name: str
    role: str  # mentor | organization

class LoginIn(BaseModel):
    email: EmailStr
    password: str

# =================================================================== AUTH
@api.post("/auth/register")
async def register(body: RegisterIn, response: Response):
    if body.role not in ("mentor", "organization"):
        raise HTTPException(status_code=400, detail="Invalid role")
    email = body.email.lower()
    if await db.users.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    doc = {"email": email, "password_hash": hash_password(body.password), "name": body.name,
           "role": body.role, "is_verified": False, "suspended": False, "created_at": now_iso()}
    res = await db.users.insert_one(doc)
    uid = str(res.inserted_id)
    if body.role == "mentor":
        count = await db.counters.find_one_and_update(
            {"_id": "mentor"}, {"$inc": {"seq": 1}}, upsert=True, return_document=True)
        code = f"M-{1000 + (count['seq'] if count else 1)}"
        await db.mentor_profiles.insert_one({
            "id": str(uuid.uuid4()), "user_id": uid, "code": code, "headline": "",
            "summary": "", "skills": [], "expertise": [], "industries": [], "years_experience": 0,
            "education_category": "", "certifications": [], "mentoring_areas": [],
            "consulting_areas": [], "teaching_subjects": [], "engagement_types": [],
            "availability": [], "broad_location": "", "teaching_experience": False,
            "full_name": body.name, "personal_email": email, "phone": "", "exact_location": "",
            "linkedin": "", "portfolio": "", "resume_file_id": None, "resume_extracted": False,
            "verification_status": "pending", "searchable": False, "created_at": now_iso()})
    else:
        await db.organizations.insert_one({
            "id": str(uuid.uuid4()), "user_id": uid, "name": body.name, "org_type": "Company",
            "industry": "", "location": "", "website": "", "description": "",
            "contact_person": body.name, "official_email": email,
            "verification_status": "pending", "created_at": now_iso()})
    token = create_access_token(uid, email, body.role)
    set_auth_cookie(response, token)
    return {"id": uid, "email": email, "name": body.name, "role": body.role, "token": token}

@api.post("/auth/login")
async def login(body: LoginIn, response: Response, request: Request):
    email = body.email.lower()
    ip = request.client.host if request.client else "?"
    ident = f"{ip}:{email}"
    att = await db.login_attempts.find_one({"identifier": ident})
    if att and att.get("count", 0) >= 5 and att.get("until") and att["until"] > now_iso():
        raise HTTPException(status_code=429, detail="Too many attempts. Try again later.")
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(body.password, user["password_hash"]):
        newcount = (att.get("count", 0) if att else 0) + 1
        await db.login_attempts.update_one({"identifier": ident}, {"$set": {
            "identifier": ident, "count": newcount,
            "until": (datetime.now(timezone.utc) + timedelta(minutes=15)).isoformat() if newcount >= 5 else None}},
            upsert=True)
        raise HTTPException(status_code=401, detail="Invalid email or password")
    await db.login_attempts.delete_one({"identifier": ident})
    uid = str(user["_id"])
    token = create_access_token(uid, email, user["role"])
    set_auth_cookie(response, token)
    return {"id": uid, "email": email, "name": user["name"], "role": user["role"], "token": token}

@api.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    return {"ok": True}

@api.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return user

# =================================================================== SKILLS
@api.get("/skills")
async def skills():
    return {"taxonomy": TAXONOMY, "industries": INDUSTRIES,
            "engagement_types": ENGAGEMENT_TYPES, "availability": AVAILABILITY_OPTS}

# =================================================================== MENTOR
async def get_mentor_profile(uid: str):
    p = await db.mentor_profiles.find_one({"user_id": uid})
    if not p:
        raise HTTPException(status_code=404, detail="Profile not found")
    return p

@api.get("/mentor/profile")
async def mentor_get_profile(user: dict = Depends(require_role("mentor"))):
    p = await get_mentor_profile(user["id"])
    return clean(p)

class MentorProfileIn(BaseModel):
    headline: Optional[str] = None
    summary: Optional[str] = None
    skills: Optional[list] = None
    expertise: Optional[list] = None
    industries: Optional[list] = None
    years_experience: Optional[int] = None
    education_category: Optional[str] = None
    certifications: Optional[list] = None
    mentoring_areas: Optional[list] = None
    consulting_areas: Optional[list] = None
    teaching_subjects: Optional[list] = None
    engagement_types: Optional[list] = None
    availability: Optional[list] = None
    broad_location: Optional[str] = None
    teaching_experience: Optional[bool] = None
    full_name: Optional[str] = None
    phone: Optional[str] = None
    exact_location: Optional[str] = None
    linkedin: Optional[str] = None
    portfolio: Optional[str] = None
    searchable: Optional[bool] = None

@api.put("/mentor/profile")
async def mentor_update_profile(body: MentorProfileIn, user: dict = Depends(require_role("mentor"))):
    p = await get_mentor_profile(user["id"])
    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    await db.mentor_profiles.update_one({"user_id": user["id"]}, {"$set": updates})
    p = await get_mentor_profile(user["id"])
    return clean(p)

@api.post("/mentor/resume")
async def mentor_upload_resume(file: UploadFile = File(...), user: dict = Depends(require_role("mentor"))):
    ext = (file.filename or "").lower().rsplit(".", 1)[-1] if "." in (file.filename or "") else "bin"
    if ext not in ("pdf", "doc", "docx", "txt"):
        raise HTTPException(status_code=400, detail="Only PDF, DOC, DOCX allowed")
    data = await file.read()
    if len(data) > 8 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 8MB)")
    path = f"{APP_NAME}/resumes/{user['id']}/{uuid.uuid4()}.{ext}"
    ct = file.content_type or "application/octet-stream"
    try:
        result = put_object(path, data, ct)
    except Exception as e:
        logger.error(f"storage put failed: {e}")
        raise HTTPException(status_code=502, detail="Resume storage failed")
    file_id = str(uuid.uuid4())
    await db.resumes.insert_one({
        "id": file_id, "user_id": user["id"], "storage_path": result["path"],
        "original_filename": file.filename, "content_type": ct, "is_deleted": False,
        "created_at": now_iso()})
    text = extract_text(data, file.filename or "resume")
    extracted = await ai_extract_resume(text)
    await db.mentor_profiles.update_one({"user_id": user["id"]}, {"$set": {
        "resume_file_id": file_id, "resume_extracted": True}})
    await notify(user["id"], "resume", "Resume processed",
                 "AI extracted your skills. Review and edit before publishing.")
    return {"file_id": file_id, "extracted": extracted}

@api.get("/mentor/resume/download")
async def mentor_download_own_resume(user: dict = Depends(require_role("mentor"))):
    r = await db.resumes.find_one({"user_id": user["id"], "is_deleted": False}, sort=[("created_at", -1)])
    if not r:
        raise HTTPException(status_code=404, detail="No resume")
    data, ct = get_object(r["storage_path"])
    return Response(content=data, media_type=r.get("content_type", ct),
                    headers={"Content-Disposition": f'inline; filename="{r["original_filename"]}"'})

@api.get("/mentor/requests")
async def mentor_requests(user: dict = Depends(require_role("mentor"))):
    p = await get_mentor_profile(user["id"])
    reqs = await db.access_requests.find({"mentor_id": p["id"]}).sort("created_at", -1).to_list(200)
    out = []
    for r in reqs:
        org = await db.organizations.find_one({"id": r["org_id"]})
        out.append({**clean(r), "org_name": org["name"] if org else "Organization",
                    "org_type": org.get("org_type") if org else ""})
    return out

@api.get("/mentor/conversations")
async def mentor_conversations(user: dict = Depends(require_role("mentor"))):
    return await list_conversations(user)

# =================================================================== ORGANIZATION
async def get_org(uid: str):
    o = await db.organizations.find_one({"user_id": uid})
    if not o:
        raise HTTPException(status_code=404, detail="Organization not found")
    return o

@api.get("/org/profile")
async def org_get_profile(user: dict = Depends(require_role("organization"))):
    return clean(await get_org(user["id"]))

class OrgProfileIn(BaseModel):
    name: Optional[str] = None
    org_type: Optional[str] = None
    industry: Optional[str] = None
    location: Optional[str] = None
    website: Optional[str] = None
    description: Optional[str] = None
    contact_person: Optional[str] = None

@api.put("/org/profile")
async def org_update_profile(body: OrgProfileIn, user: dict = Depends(require_role("organization"))):
    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    await db.organizations.update_one({"user_id": user["id"]}, {"$set": updates})
    return clean(await get_org(user["id"]))

class RequirementIn(BaseModel):
    title: str
    description: Optional[str] = ""
    skills: list = []
    min_experience: int = 0
    industry: Optional[str] = ""
    teaching_required: bool = False
    engagement_type: Optional[str] = ""
    duration: Optional[str] = ""
    remote_onsite: Optional[str] = ""
    location: Optional[str] = ""
    availability: Optional[str] = ""

@api.post("/org/requirements")
async def create_requirement(body: RequirementIn, user: dict = Depends(require_role("organization"))):
    org = await get_org(user["id"])
    doc = {"id": str(uuid.uuid4()), "org_id": org["id"], **body.model_dump(), "created_at": now_iso()}
    await db.requirements.insert_one(doc)
    return clean(doc)

@api.get("/org/requirements")
async def list_requirements(user: dict = Depends(require_role("organization"))):
    org = await get_org(user["id"])
    reqs = await db.requirements.find({"org_id": org["id"]}).sort("created_at", -1).to_list(200)
    return [clean(r) for r in reqs]

class ParseIn(BaseModel):
    text: str

@api.post("/org/requirements/parse")
async def parse_requirement(body: ParseIn, user: dict = Depends(require_role("organization"))):
    return await ai_parse_requirement(body.text)

@api.get("/org/requirements/{req_id}/matches")
async def requirement_matches(req_id: str, user: dict = Depends(require_role("organization"))):
    org = await get_org(user["id"])
    req = await db.requirements.find_one({"id": req_id, "org_id": org["id"]})
    if not req:
        raise HTTPException(status_code=404, detail="Requirement not found")
    weights = await get_weights()
    mentors = await db.mentor_profiles.find({"searchable": True, "verification_status": "verified"}).to_list(500)
    results = []
    for m in mentors:
        score, reasons, breakdown = score_mentor(req, m, weights)
        has = await org_has_access(org["id"], m["id"])
        card = anon_mentor(m)
        card.update({"match": score, "reasons": reasons, "breakdown": breakdown, "has_access": has})
        pending = await db.access_requests.find_one(
            {"org_id": org["id"], "mentor_id": m["id"], "status": {"$in": ["pending", "flagged"]}})
        card["request_status"] = "pending" if pending else ("approved" if has else None)
        results.append(card)
    results.sort(key=lambda x: x["match"], reverse=True)
    return results

@api.get("/org/discover")
async def discover(skill: Optional[str] = None, industry: Optional[str] = None,
                   min_experience: int = 0, engagement_type: Optional[str] = None,
                   user: dict = Depends(require_role("organization"))):
    org = await get_org(user["id"])
    q = {"searchable": True, "verification_status": "verified"}
    mentors = await db.mentor_profiles.find(q).to_list(500)
    out = []
    for m in mentors:
        if skill and skill.lower() not in [s["name"].lower() for s in m.get("skills", [])]:
            continue
        if industry and industry.lower() not in [i.lower() for i in m.get("industries", [])]:
            continue
        if min_experience and (m.get("years_experience", 0) < min_experience):
            continue
        if engagement_type and engagement_type not in m.get("engagement_types", []):
            continue
        card = anon_mentor(m)
        card["has_access"] = await org_has_access(org["id"], m["id"])
        pending = await db.access_requests.find_one(
            {"org_id": org["id"], "mentor_id": m["id"], "status": {"$in": ["pending", "flagged"]}})
        card["request_status"] = "pending" if pending else ("approved" if card["has_access"] else None)
        out.append(card)
    return out

@api.get("/org/mentors/{mentor_id}")
async def org_view_mentor(mentor_id: str, user: dict = Depends(require_role("organization"))):
    org = await get_org(user["id"])
    m = await db.mentor_profiles.find_one({"id": mentor_id})
    if not m:
        raise HTTPException(status_code=404, detail="Mentor not found")
    if await org_has_access(org["id"], mentor_id):
        return {**full_mentor(m), "has_access": True}
    return {**anon_mentor(m), "has_access": False}

class AccessRequestIn(BaseModel):
    mentor_id: str
    requirement_id: Optional[str] = None
    reason: str
    message: Optional[str] = ""
    requested_info: list = []

@api.post("/org/access-requests")
async def create_access_request(body: AccessRequestIn, user: dict = Depends(require_role("organization"))):
    org = await get_org(user["id"])
    m = await db.mentor_profiles.find_one({"id": body.mentor_id})
    if not m:
        raise HTTPException(status_code=404, detail="Mentor not found")
    existing = await db.access_requests.find_one(
        {"org_id": org["id"], "mentor_id": body.mentor_id, "status": {"$in": ["pending", "approved", "flagged"]}})
    if existing:
        raise HTTPException(status_code=400, detail="Request already exists for this mentor")
    doc = {"id": str(uuid.uuid4()), "code": f"REQ-{secrets.randbelow(9000) + 1000}",
           "org_id": org["id"], "org_name": org["name"], "mentor_id": body.mentor_id,
           "mentor_code": m["code"], "requirement_id": body.requirement_id, "reason": body.reason,
           "message": body.message, "requested_info": body.requested_info, "status": "pending",
           "admin_note": "", "created_at": now_iso(), "decided_at": None}
    await db.access_requests.insert_one(doc)
    admin = await db.users.find_one({"role": "admin"})
    if admin:
        await notify(str(admin["_id"]), "request", "New access request",
                     f"{org['name']} requests access to {m['code']}")
    await notify(m["user_id"], "request", "New interest",
                 f"An organization requested access to your profile ({m['code']}).")
    await audit(user["id"], "access_request.create", doc["id"])
    return clean(doc)

@api.get("/org/access-requests")
async def org_access_requests(user: dict = Depends(require_role("organization"))):
    org = await get_org(user["id"])
    reqs = await db.access_requests.find({"org_id": org["id"]}).sort("created_at", -1).to_list(200)
    return [clean(r) for r in reqs]

@api.get("/org/conversations")
async def org_conversations(user: dict = Depends(require_role("organization"))):
    return await list_conversations(user)

# =================================================================== ADMIN
@api.get("/admin/stats")
async def admin_stats(user: dict = Depends(require_role("admin"))):
    return {
        "mentors": await db.mentor_profiles.count_documents({}),
        "organizations": await db.organizations.count_documents({}),
        "verified_mentors": await db.mentor_profiles.count_documents({"verification_status": "verified"}),
        "pending_requests": await db.access_requests.count_documents({"status": "pending"}),
        "approved_requests": await db.access_requests.count_documents({"status": "approved"}),
        "rejected_requests": await db.access_requests.count_documents({"status": "rejected"}),
        "conversations": await db.conversations.count_documents({}),
        "reports": await db.reports.count_documents({"status": "open"}),
        "total_requests": await db.access_requests.count_documents({}),
    }

@api.get("/admin/users")
async def admin_users(role: Optional[str] = None, user: dict = Depends(require_role("admin"))):
    q = {} if not role else {"role": role}
    users = await db.users.find(q).sort("created_at", -1).to_list(500)
    out = []
    for u in users:
        out.append({"id": str(u["_id"]), "email": u["email"], "name": u["name"],
                    "role": u["role"], "is_verified": u.get("is_verified", False),
                    "suspended": u.get("suspended", False), "created_at": u.get("created_at")})
    return out

@api.get("/admin/mentors")
async def admin_mentors(user: dict = Depends(require_role("admin"))):
    ms = await db.mentor_profiles.find({}).sort("created_at", -1).to_list(500)
    return [clean(m) for m in ms]  # admin sees full incl private

@api.get("/admin/organizations")
async def admin_orgs(user: dict = Depends(require_role("admin"))):
    os_ = await db.organizations.find({}).sort("created_at", -1).to_list(500)
    return [clean(o) for o in os_]

@api.get("/admin/access-requests")
async def admin_access_requests(status: Optional[str] = None, user: dict = Depends(require_role("admin"))):
    q = {} if not status else {"status": status}
    reqs = await db.access_requests.find(q).sort("created_at", -1).to_list(300)
    out = []
    for r in reqs:
        m = await db.mentor_profiles.find_one({"id": r["mentor_id"]})
        out.append({**clean(r), "mentor_summary": {
            "headline": m.get("headline") if m else "", "skills": m.get("skills", []) if m else []}})
    return out

class DecideIn(BaseModel):
    action: str  # approve | reject | flag
    note: Optional[str] = ""

@api.post("/admin/access-requests/{req_id}/decide")
async def admin_decide(req_id: str, body: DecideIn, user: dict = Depends(require_role("admin"))):
    r = await db.access_requests.find_one({"id": req_id})
    if not r:
        raise HTTPException(status_code=404, detail="Request not found")
    status_map = {"approve": "approved", "reject": "rejected", "flag": "flagged"}
    if body.action not in status_map:
        raise HTTPException(status_code=400, detail="Invalid action")
    new_status = status_map[body.action]
    await db.access_requests.update_one({"id": req_id}, {"$set": {
        "status": new_status, "admin_note": body.note, "decided_at": now_iso()}})
    org = await db.organizations.find_one({"id": r["org_id"]})
    m = await db.mentor_profiles.find_one({"id": r["mentor_id"]})
    if new_status == "approved" and org and m:
        conv = await db.conversations.find_one({"mentor_id": m["id"], "org_id": org["id"]})
        if not conv:
            conv = {"id": str(uuid.uuid4()), "mentor_id": m["id"], "org_id": org["id"],
                    "mentor_user_id": m["user_id"], "org_user_id": org["user_id"],
                    "mentor_code": m["code"], "org_name": org["name"],
                    "access_request_id": req_id, "status": "active", "created_at": now_iso()}
            await db.conversations.insert_one(conv)
        await notify(org["user_id"], "approval", "Access approved",
                     f"You can now view {m['code']} and start a conversation.")
        await notify(m["user_id"], "approval", "Access approved",
                     f"{org['name']} was granted access. A private chat is now open.")
    elif new_status == "rejected" and org:
        await notify(org["user_id"], "rejection", "Access rejected",
                     f"Your request for {r['mentor_code']} was rejected.")
    await audit(user["id"], f"access_request.{body.action}", req_id, {"note": body.note})
    return {"ok": True, "status": new_status}

@api.post("/admin/users/{uid}/verify")
async def admin_verify_user(uid: str, user: dict = Depends(require_role("admin"))):
    target = await db.users.find_one({"_id": ObjectId(uid)})
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    await db.users.update_one({"_id": ObjectId(uid)}, {"$set": {"is_verified": True}})
    if target["role"] == "mentor":
        await db.mentor_profiles.update_one({"user_id": uid}, {"$set": {"verification_status": "verified"}})
    elif target["role"] == "organization":
        await db.organizations.update_one({"user_id": uid}, {"$set": {"verification_status": "verified"}})
    await notify(uid, "verification", "Account verified", "Your account has been verified by the admin.")
    await audit(user["id"], "user.verify", uid)
    return {"ok": True}

@api.post("/admin/users/{uid}/suspend")
async def admin_suspend_user(uid: str, user: dict = Depends(require_role("admin"))):
    target = await db.users.find_one({"_id": ObjectId(uid)})
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    new_val = not target.get("suspended", False)
    await db.users.update_one({"_id": ObjectId(uid)}, {"$set": {"suspended": new_val}})
    await audit(user["id"], "user.suspend", uid, {"suspended": new_val})
    return {"ok": True, "suspended": new_val}

@api.get("/admin/reports")
async def admin_reports(user: dict = Depends(require_role("admin"))):
    reps = await db.reports.find({}).sort("created_at", -1).to_list(200)
    return [clean(r) for r in reps]

@api.get("/admin/settings")
async def admin_get_settings(user: dict = Depends(require_role("admin"))):
    return await get_weights()

@api.put("/admin/settings")
async def admin_set_settings(body: dict, user: dict = Depends(require_role("admin"))):
    weights = {k: float(body.get(k, DEFAULT_WEIGHTS[k])) for k in DEFAULT_WEIGHTS}
    await db.settings.update_one({"_id": "match_weights"}, {"$set": weights}, upsert=True)
    return weights

# =================================================================== CHAT
async def list_conversations(user: dict):
    role = user["role"]
    if role == "mentor":
        p = await db.mentor_profiles.find_one({"user_id": user["id"]})
        convs = await db.conversations.find({"mentor_id": p["id"]}).sort("created_at", -1).to_list(200) if p else []
    elif role == "organization":
        o = await db.organizations.find_one({"user_id": user["id"]})
        convs = await db.conversations.find({"org_id": o["id"]}).sort("created_at", -1).to_list(200) if o else []
    else:
        convs = await db.conversations.find({}).sort("created_at", -1).to_list(200)
    out = []
    for c in convs:
        last = await db.messages.find_one({"conversation_id": c["id"]}, sort=[("created_at", -1)])
        unread = await db.messages.count_documents(
            {"conversation_id": c["id"], "sender_id": {"$ne": user["id"]}, "read": False})
        title = c["mentor_code"] if role != "mentor" else c["org_name"]
        out.append({**clean(c), "title": title,
                    "last_message": (last["text"] or ("📎 " + last["attachment"]["name"] if last.get("attachment") else "")) if last else None,
                    "online": hub.online(c["id"]),
                    "last_at": last["created_at"] if last else c["created_at"], "unread": unread})
    return out

async def check_conv_access(conv: dict, user: dict):
    if user["role"] == "admin":
        return
    if user["id"] not in (conv.get("mentor_user_id"), conv.get("org_user_id")):
        raise HTTPException(status_code=403, detail="Not a participant")

CONTACT_RE = re.compile(r"(\b[\w.+-]+@[\w-]+\.[\w.-]+\b)|(\b\d{10}\b)|(\+\d{7,15})|(https?://\S+)")

ATTACH_EXT = {"pdf", "doc", "docx", "ppt", "pptx", "xls", "xlsx", "txt", "csv", "png", "jpg", "jpeg", "gif", "webp"}
ATTACH_MAX = 10 * 1024 * 1024

# ---- realtime hub
class ChatHub:
    def __init__(self):
        self.rooms: dict = {}  # conv_id -> {user_id: set(ws)}

    def online(self, conv_id: str):
        return [uid for uid, s in self.rooms.get(conv_id, {}).items() if s]

    def connect(self, conv_id: str, uid: str, ws: WebSocket):
        self.rooms.setdefault(conv_id, {}).setdefault(uid, set()).add(ws)

    def disconnect(self, conv_id: str, uid: str, ws: WebSocket):
        room = self.rooms.get(conv_id, {})
        room.get(uid, set()).discard(ws)
        if uid in room and not room[uid]:
            del room[uid]

    async def broadcast(self, conv_id: str, payload: dict, exclude: Optional[str] = None):
        for uid, socks in list(self.rooms.get(conv_id, {}).items()):
            if uid == exclude:
                continue
            for ws in list(socks):
                try:
                    await ws.send_json(payload)
                except Exception:
                    socks.discard(ws)

hub = ChatHub()

async def user_from_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user or user.get("suspended"):
            return None
        user["id"] = str(user["_id"])
        user.pop("_id", None)
        user.pop("password_hash", None)
        return user
    except Exception:
        return None

async def mark_conv_read(conv_id: str, user: dict):
    res = await db.messages.update_many(
        {"conversation_id": conv_id, "sender_id": {"$ne": user["id"]}, "read": False},
        {"$set": {"read": True, "read_at": now_iso()}})
    if res.modified_count:
        await hub.broadcast(conv_id, {"type": "read", "reader_id": user["id"], "at": now_iso()}, exclude=user["id"])

@app.websocket("/api/ws/conversations/{conv_id}")
async def ws_conversation(ws: WebSocket, conv_id: str, token: str = Query("")):
    user = await user_from_token(token)
    conv = await db.conversations.find_one({"id": conv_id})
    if not user or not conv or (user["role"] != "admin" and user["id"] not in (conv.get("mentor_user_id"), conv.get("org_user_id"))):
        await ws.close(code=4401)
        return
    await ws.accept()
    hub.connect(conv_id, user["id"], ws)
    await ws.send_json({"type": "presence", "online": hub.online(conv_id)})
    await hub.broadcast(conv_id, {"type": "presence", "online": hub.online(conv_id)}, exclude=user["id"])
    try:
        while True:
            data = await ws.receive_json()
            t = data.get("type")
            if t == "typing" and user["role"] != "admin":
                await hub.broadcast(conv_id, {"type": "typing", "user_id": user["id"],
                                              "typing": bool(data.get("typing"))}, exclude=user["id"])
            elif t == "read" and user["role"] != "admin":
                await mark_conv_read(conv_id, user)
            elif t == "ping":
                await ws.send_json({"type": "pong"})
    except (WebSocketDisconnect, Exception):
        pass
    finally:
        hub.disconnect(conv_id, user["id"], ws)
        await hub.broadcast(conv_id, {"type": "presence", "online": hub.online(conv_id)})

@api.get("/conversations")
async def get_conversations(user: dict = Depends(get_current_user)):
    return await list_conversations(user)

@api.get("/conversations/{conv_id}/messages")
async def get_messages(conv_id: str, user: dict = Depends(get_current_user)):
    conv = await db.conversations.find_one({"id": conv_id})
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    await check_conv_access(conv, user)
    if user["role"] != "admin":
        await mark_conv_read(conv_id, user)
    msgs = await db.messages.find({"conversation_id": conv_id}).sort("created_at", 1).to_list(1000)
    return {"conversation": clean(conv), "messages": [clean(m) for m in msgs],
            "online": hub.online(conv_id)}

class MessageIn(BaseModel):
    text: str

async def store_message(conv: dict, user: dict, text: str, attachment: Optional[dict] = None):
    flagged = bool(CONTACT_RE.search(text)) if text else False
    doc = {"id": str(uuid.uuid4()), "conversation_id": conv["id"], "sender_id": user["id"],
           "sender_role": user["role"], "text": text, "flagged": flagged, "read": False,
           "attachment": attachment, "created_at": now_iso()}
    await db.messages.insert_one(doc)
    doc = clean(doc)
    other = conv["org_user_id"] if user["id"] == conv["mentor_user_id"] else conv["mentor_user_id"]
    preview = text[:60] if text else f"Sent a file: {attachment['name']}"
    await notify(other, "message", "New message", preview, link=f"/chat/{conv['id']}")
    await hub.broadcast(conv["id"], {"type": "message", "message": doc})
    return doc

async def get_postable_conv(conv_id: str, user: dict):
    if user["role"] == "admin":
        raise HTTPException(status_code=403, detail="Admins cannot post in conversations")
    conv = await db.conversations.find_one({"id": conv_id})
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    await check_conv_access(conv, user)
    return conv

@api.post("/conversations/{conv_id}/messages")
async def send_message(conv_id: str, body: MessageIn, user: dict = Depends(get_current_user)):
    conv = await get_postable_conv(conv_id, user)
    text = body.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Empty message")
    return await store_message(conv, user, text)

@api.post("/conversations/{conv_id}/attachments")
async def send_attachment(conv_id: str, file: UploadFile = File(...), text: str = "",
                          user: dict = Depends(get_current_user)):
    conv = await get_postable_conv(conv_id, user)
    name = file.filename or "file"
    ext = name.lower().rsplit(".", 1)[-1] if "." in name else ""
    if ext not in ATTACH_EXT:
        raise HTTPException(status_code=400, detail="File type not allowed")
    data = await file.read()
    if len(data) > ATTACH_MAX:
        raise HTTPException(status_code=400, detail="File too large (max 10MB)")
    ct = file.content_type or "application/octet-stream"
    path = f"{APP_NAME}/chat/{conv_id}/{uuid.uuid4()}.{ext}"
    try:
        result = put_object(path, data, ct)
    except Exception as e:
        logger.error(f"attachment put failed: {e}")
        raise HTTPException(status_code=502, detail="Attachment storage failed")
    file_id = str(uuid.uuid4())
    await db.attachments.insert_one({
        "id": file_id, "conversation_id": conv_id, "user_id": user["id"], "storage_path": result["path"],
        "name": name, "content_type": ct, "size": len(data), "created_at": now_iso()})
    att = {"file_id": file_id, "name": name, "content_type": ct, "size": len(data),
           "is_image": ct.startswith("image/")}
    return await store_message(conv, user, text.strip(), att)

@api.get("/conversations/{conv_id}/attachments/{file_id}")
async def download_attachment(conv_id: str, file_id: str, user: dict = Depends(get_current_user)):
    conv = await db.conversations.find_one({"id": conv_id})
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    await check_conv_access(conv, user)
    a = await db.attachments.find_one({"id": file_id, "conversation_id": conv_id})
    if not a:
        raise HTTPException(status_code=404, detail="Attachment not found")
    data, ct = get_object(a["storage_path"])
    return Response(content=data, media_type=a.get("content_type", ct),
                    headers={"Content-Disposition": f'inline; filename="{a["name"]}"'})

@api.post("/conversations/{conv_id}/read")
async def mark_read(conv_id: str, user: dict = Depends(get_current_user)):
    await mark_conv_read(conv_id, user)
    return {"ok": True}

# =================================================================== NOTIFICATIONS
@api.get("/notifications")
async def get_notifications(user: dict = Depends(get_current_user)):
    ns = await db.notifications.find({"user_id": user["id"]}).sort("created_at", -1).to_list(100)
    return [clean(n) for n in ns]

@api.post("/notifications/{nid}/read")
async def read_notification(nid: str, user: dict = Depends(get_current_user)):
    await db.notifications.update_one({"id": nid, "user_id": user["id"]}, {"$set": {"read": True}})
    return {"ok": True}

@api.post("/notifications/read-all")
async def read_all_notifications(user: dict = Depends(get_current_user)):
    await db.notifications.update_many({"user_id": user["id"]}, {"$set": {"read": True}})
    return {"ok": True}

# =================================================================== REPORTS
class ReportIn(BaseModel):
    target_type: str
    target_id: str
    reason: str

@api.post("/reports")
async def create_report(body: ReportIn, user: dict = Depends(get_current_user)):
    doc = {"id": str(uuid.uuid4()), "reporter_id": user["id"], "reporter_role": user["role"],
           "target_type": body.target_type, "target_id": body.target_id, "reason": body.reason,
           "status": "open", "created_at": now_iso()}
    await db.reports.insert_one(doc)
    return clean(doc)

# =================================================================== bootstrap
app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.mentor_profiles.create_index("user_id")
    await db.organizations.create_index("user_id")
    await db.access_requests.create_index("mentor_id")
    await db.messages.create_index("conversation_id")
    await db.notifications.create_index("user_id")
    try:
        init_storage()
        logger.info("Storage initialized")
    except Exception as e:
        logger.error(f"Storage init failed: {e}")
    await seed()

@app.on_event("shutdown")
async def shutdown():
    client.close()

async def seed():
    admin_email = os.environ["ADMIN_EMAIL"].lower()
    admin_pw = os.environ["ADMIN_PASSWORD"]
    existing = await db.users.find_one({"email": admin_email})
    if not existing:
        await db.users.insert_one({"email": admin_email, "password_hash": hash_password(admin_pw),
                                   "name": "Platform Admin", "role": "admin", "is_verified": True,
                                   "suspended": False, "created_at": now_iso()})
    elif not verify_password(admin_pw, existing["password_hash"]):
        await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": hash_password(admin_pw)}})

    if await db.mentor_profiles.count_documents({}) > 0:
        return  # already seeded demo

    demo_pw = "Password123!"
    seeds = [
        {"email": "sarah.ml@demo.com", "name": "Sarah Chen", "headline": "Senior ML Engineer & Educator",
         "summary": "8+ years building production ML systems and teaching data science bootcamps.",
         "skills": [("Machine Learning", "Technology"), ("Python", "Technology"), ("Deep Learning", "Technology"),
                    ("TensorFlow", "Technology"), ("Data Science", "Technology")],
         "years": 8, "industries": ["Technology"], "expertise": ["Artificial Intelligence", "Machine Learning"],
         "engagements": ["Mentoring", "Teaching", "Workshops"], "availability": ["Part-time", "Weekends"],
         "teaching": True, "loc": "West Coast, USA", "edu": "M.S. Computer Science",
         "mentoring": ["ML career guidance"], "consulting": ["ML systems design"], "subjects": ["Machine Learning"]},
        {"email": "raj.nlp@demo.com", "name": "Raj Patel", "headline": "NLP Specialist & AI Consultant",
         "summary": "6 years focused on NLP, LLMs and computer vision for enterprise clients.",
         "skills": [("Machine Learning", "Technology"), ("Python", "Technology"), ("NLP", "Technology"),
                    ("PyTorch", "Technology"), ("Computer Vision", "Technology")],
         "years": 6, "industries": ["Technology", "Finance"], "expertise": ["NLP", "Deep Learning"],
         "engagements": ["Consulting", "Training", "Mentoring"], "availability": ["Project-based", "Evenings"],
         "teaching": True, "loc": "London, UK", "edu": "Ph.D. Computer Science",
         "mentoring": ["Research guidance"], "consulting": ["NLP strategy"], "subjects": ["NLP", "Deep Learning"]},
        {"email": "maria.cloud@demo.com", "name": "Maria Gomez", "headline": "Cloud & DevOps Architect",
         "summary": "12 years architecting scalable cloud platforms and mentoring engineering teams.",
         "skills": [("Cloud Computing", "Technology"), ("DevOps", "Technology"), ("AWS", "Technology"),
                    ("Docker", "Technology"), ("Kubernetes", "Technology")],
         "years": 12, "industries": ["Technology", "Retail"], "expertise": ["Cloud Architecture"],
         "engagements": ["Consulting", "Workshops", "Mentoring"], "availability": ["Part-time"],
         "teaching": False, "loc": "Berlin, Germany", "edu": "B.S. Software Engineering",
         "mentoring": ["Cloud migration"], "consulting": ["DevOps transformation"], "subjects": []},
        {"email": "david.pm@demo.com", "name": "David Okoro", "headline": "Product Leader & Startup Mentor",
         "summary": "10 years in product management and entrepreneurship across SaaS startups.",
         "skills": [("Product Management", "Business"), ("Business Strategy", "Business"),
                    ("Entrepreneurship", "Business"), ("Marketing", "Business")],
         "years": 10, "industries": ["Technology", "Consulting"], "expertise": ["Product Strategy"],
         "engagements": ["Mentoring", "Career Guidance", "Consulting"], "availability": ["Weekends", "Evenings"],
         "teaching": True, "loc": "Lagos, Nigeria", "edu": "MBA",
         "mentoring": ["Startup mentoring"], "consulting": ["Go-to-market"], "subjects": ["Product Management"]},
        {"email": "aisha.research@demo.com", "name": "Aisha Khan", "headline": "Academic Researcher & Thesis Advisor",
         "summary": "9 years in academic research, curriculum development and thesis supervision.",
         "skills": [("Research", "Academic"), ("Academic Mentoring", "Academic"),
                    ("Thesis Guidance", "Academic"), ("Curriculum Development", "Academic"),
                    ("Data Analytics", "Technology")],
         "years": 9, "industries": ["Education"], "expertise": ["Research Methods"],
         "engagements": ["Teaching", "Mentoring", "Project Guidance"], "availability": ["Part-time", "Full-time"],
         "teaching": True, "loc": "Toronto, Canada", "edu": "Ph.D. Education",
         "mentoring": ["Thesis guidance"], "consulting": ["Curriculum design"], "subjects": ["Research Methods"]},
    ]
    seq = 0
    for s in seeds:
        seq += 1
        res = await db.users.insert_one({"email": s["email"], "password_hash": hash_password(demo_pw),
                                         "name": s["name"], "role": "mentor", "is_verified": True,
                                         "suspended": False, "created_at": now_iso()})
        uid = str(res.inserted_id)
        code = f"M-{1000 + seq}"
        await db.mentor_profiles.insert_one({
            "id": str(uuid.uuid4()), "user_id": uid, "code": code, "headline": s["headline"],
            "summary": s["summary"], "skills": [{"name": n, "category": c} for n, c in s["skills"]],
            "expertise": s["expertise"], "industries": s["industries"], "years_experience": s["years"],
            "education_category": s["edu"], "certifications": [], "mentoring_areas": s["mentoring"],
            "consulting_areas": s["consulting"], "teaching_subjects": s["subjects"],
            "engagement_types": s["engagements"], "availability": s["availability"],
            "broad_location": s["loc"].split(",")[-1].strip(), "teaching_experience": s["teaching"],
            "full_name": s["name"], "personal_email": s["email"], "phone": "+1-555-0" + str(100 + seq),
            "exact_location": s["loc"], "linkedin": f"linkedin.com/in/{s['name'].lower().replace(' ', '')}",
            "portfolio": "", "resume_file_id": None, "resume_extracted": False,
            "verification_status": "verified", "searchable": True, "created_at": now_iso()})
    await db.counters.update_one({"_id": "mentor"}, {"$set": {"seq": seq}}, upsert=True)

    res = await db.users.insert_one({"email": "hr@techuniversity.demo", "password_hash": hash_password(demo_pw),
                                     "name": "Tech University", "role": "organization", "is_verified": True,
                                     "suspended": False, "created_at": now_iso()})
    oid = str(res.inserted_id)
    org_id = str(uuid.uuid4())
    await db.organizations.insert_one({
        "id": org_id, "user_id": oid, "name": "Tech University", "org_type": "University",
        "industry": "Education", "location": "Boston, USA", "website": "techuniversity.edu",
        "description": "A leading engineering university seeking industry mentors for students.",
        "contact_person": "Dr. Emily Ross", "official_email": "hr@techuniversity.demo",
        "verification_status": "verified", "created_at": now_iso()})
    await db.requirements.insert_one({
        "id": str(uuid.uuid4()), "org_id": org_id,
        "title": "6-week Machine Learning program for final-year students",
        "description": "We need a mentor to run a 6-week ML workshop for engineering students.",
        "skills": ["Machine Learning", "Python", "Deep Learning"], "min_experience": 5,
        "industry": "Technology", "teaching_required": True, "engagement_type": "Workshops",
        "duration": "6 weeks", "remote_onsite": "Remote", "location": "", "availability": "Part-time",
        "created_at": now_iso()})
    logger.info("Demo data seeded")
