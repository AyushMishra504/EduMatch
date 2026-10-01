"""End-to-end backend tests for 'The Vault' mentor matching platform."""
import os
import io
import time
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    # fallback: read from frontend/.env
    with open("/app/frontend/.env") as f:
        for line in f:
            if line.startswith("REACT_APP_BACKEND_URL="):
                BASE_URL = line.split("=", 1)[1].strip().rstrip("/")

API = f"{BASE_URL}/api"

ADMIN = ("varunram2413@gmail.com", "Admin@12345")
ORG = ("hr@techuniversity.demo", "Password123!")
MENTOR = ("sarah.ml@demo.com", "Password123!")
MENTOR2 = ("raj.nlp@demo.com", "Password123!")

PRIVATE_FIELDS = ["full_name", "personal_email", "phone", "exact_location", "linkedin", "resume_file_id"]


def _login(email, pw):
    r = requests.post(f"{API}/auth/login", json={"email": email, "password": pw}, timeout=30)
    assert r.status_code == 200, f"login failed {email}: {r.status_code} {r.text}"
    return r.json()["token"]


def _hdr(token):
    return {"Authorization": f"Bearer {token}"}


# ------------- AUTH -------------
class TestAuth:
    def test_admin_login(self):
        t = _login(*ADMIN)
        r = requests.get(f"{API}/auth/me", headers=_hdr(t))
        assert r.status_code == 200
        assert r.json()["role"] == "admin"

    def test_org_login(self):
        t = _login(*ORG)
        r = requests.get(f"{API}/auth/me", headers=_hdr(t))
        assert r.json()["role"] == "organization"

    def test_mentor_login(self):
        t = _login(*MENTOR)
        r = requests.get(f"{API}/auth/me", headers=_hdr(t))
        assert r.json()["role"] == "mentor"

    def test_register_new_mentor(self):
        email = f"test_{uuid.uuid4().hex[:8]}@demo.com"
        r = requests.post(f"{API}/auth/register", json={
            "email": email, "password": "Password123!", "name": "Test Mentor", "role": "mentor"})
        assert r.status_code == 200, r.text
        assert r.json()["role"] == "mentor"
        assert "token" in r.json()

    def test_register_new_org(self):
        email = f"testorg_{uuid.uuid4().hex[:8]}@demo.com"
        r = requests.post(f"{API}/auth/register", json={
            "email": email, "password": "Password123!", "name": "Test Org", "role": "organization"})
        assert r.status_code == 200
        assert r.json()["role"] == "organization"

    def test_login_invalid(self):
        r = requests.post(f"{API}/auth/login", json={"email": "nope@x.com", "password": "wrong"})
        assert r.status_code in (401, 429)


# ------------- MENTOR PROFILE -------------
class TestMentorProfile:
    def test_get_and_update_profile(self):
        t = _login(*MENTOR)
        r = requests.get(f"{API}/mentor/profile", headers=_hdr(t))
        assert r.status_code == 200
        prof = r.json()
        assert prof.get("code", "").startswith("M-")

        update = {
            "headline": "Updated ML Engineer Headline",
            "phone": "+1-555-9999",
            "full_name": "Sarah Chen Updated",
            "engagement_types": ["Mentoring", "Workshops"],
            "availability": ["Weekends"],
            "searchable": True,
            "skills": [{"name": "Machine Learning", "category": "Technology"}],
        }
        r = requests.put(f"{API}/mentor/profile", headers=_hdr(t), json=update)
        assert r.status_code == 200, r.text
        prof2 = r.json()
        assert prof2["headline"] == "Updated ML Engineer Headline"
        assert prof2["phone"] == "+1-555-9999"
        assert prof2["searchable"] is True

    def test_resume_upload(self):
        t = _login(*MENTOR)
        content = (
            b"Sarah Chen\n8 years experience\n"
            b"Skills: Machine Learning, Python, TensorFlow, Deep Learning, NLP\n"
            b"Worked on production ML systems.\n"
        )
        files = {"file": ("resume.txt", io.BytesIO(content), "text/plain")}
        r = requests.post(f"{API}/mentor/resume", headers=_hdr(t), files=files, timeout=60)
        assert r.status_code == 200, r.text
        data = r.json()
        assert "file_id" in data
        assert "extracted" in data
        skills = data["extracted"].get("skills", [])
        assert len(skills) > 0, f"No skills extracted: {data}"
        # verify profile flag
        p = requests.get(f"{API}/mentor/profile", headers=_hdr(t)).json()
        assert p.get("resume_extracted") is True
        assert p.get("resume_file_id")


# ------------- ORG REQUIREMENTS + MATCHING -------------
class TestOrgMatching:
    def test_create_requirement_and_matches(self):
        t = _login(*ORG)
        # Get existing (seeded) requirement first
        rlist = requests.get(f"{API}/org/requirements", headers=_hdr(t))
        assert rlist.status_code == 200
        reqs = rlist.json()
        assert len(reqs) >= 1
        req_id = reqs[0]["id"]

        # create a new requirement too
        r = requests.post(f"{API}/org/requirements", headers=_hdr(t), json={
            "title": "TEST_ requirement", "description": "ML workshop",
            "skills": ["Machine Learning", "Python"], "min_experience": 3,
            "industry": "Technology", "teaching_required": True,
            "engagement_type": "Workshops", "availability": "Part-time"})
        assert r.status_code == 200
        new_id = r.json()["id"]

        # matches must be ranked and NOT contain private fields
        for rid in (req_id, new_id):
            m = requests.get(f"{API}/org/requirements/{rid}/matches", headers=_hdr(t))
            assert m.status_code == 200, m.text
            matches = m.json()
            assert isinstance(matches, list)
            assert len(matches) > 0
            # sorted desc
            scores = [x["match"] for x in matches]
            assert scores == sorted(scores, reverse=True)
            for card in matches:
                assert "code" in card and card["code"].startswith("M-")
                assert "reasons" in card and isinstance(card["reasons"], list)
                for pf in PRIVATE_FIELDS:
                    assert pf not in card, f"LEAK: {pf} in match card {card}"


# ------------- PRIVACY ENFORCEMENT (CRITICAL) -------------
class TestPrivacy:
    def test_org_view_mentor_without_access(self):
        torg = _login(*ORG)
        # get any mentor via discover
        d = requests.get(f"{API}/org/discover", headers=_hdr(torg))
        assert d.status_code == 200
        mentors = d.json()
        assert len(mentors) > 0
        # pick one that org has NO access to
        mentor_id = None
        for m in mentors:
            if not m.get("has_access"):
                mentor_id = m["id"]
                break
        assert mentor_id, "no non-accessed mentor found"

        r = requests.get(f"{API}/org/mentors/{mentor_id}", headers=_hdr(torg))
        assert r.status_code == 200
        data = r.json()
        assert data["has_access"] is False
        for pf in PRIVATE_FIELDS:
            assert pf not in data, f"LEAK: private field {pf} in anon response: {data.keys()}"

    def test_discover_no_private_fields(self):
        torg = _login(*ORG)
        r = requests.get(f"{API}/org/discover", headers=_hdr(torg))
        assert r.status_code == 200
        for m in r.json():
            for pf in PRIVATE_FIELDS:
                if pf == "resume_file_id":
                    continue
                assert pf not in m, f"LEAK in discover: {pf}"


# ------------- ACCESS REQUEST + APPROVAL + CHAT -------------
class TestAccessFlow:
    """Sequential flow: request → admin approve → conversation → chat."""

    @pytest.fixture(scope="class")
    def flow_state(self):
        return {}

    def test_1_org_creates_access_request(self, flow_state):
        torg = _login(*ORG)
        flow_state["torg"] = torg
        # find a mentor with no existing approved/pending status
        d = requests.get(f"{API}/org/discover", headers=_hdr(torg)).json()
        mentor_id = None
        for m in d:
            if not m.get("request_status"):
                mentor_id = m["id"]
                flow_state["mentor_code"] = m["code"]
                break
        if not mentor_id:
            # already have all pending; use first
            mentor_id = d[0]["id"]
            flow_state["mentor_code"] = d[0]["code"]
        flow_state["mentor_id"] = mentor_id

        r = requests.post(f"{API}/org/access-requests", headers=_hdr(torg), json={
            "mentor_id": mentor_id, "reason": "TEST_ need ML mentor for workshop",
            "message": "hi", "requested_info": ["email"]})
        # allow either 200 or 400 (already requested)
        if r.status_code == 400 and "already exists" in r.text:
            # find existing pending req
            existing = requests.get(f"{API}/org/access-requests", headers=_hdr(torg)).json()
            match = next((x for x in existing if x["mentor_id"] == mentor_id
                          and x["status"] in ("pending", "flagged")), None)
            assert match, "existing request not found"
            flow_state["req_id"] = match["id"]
        else:
            assert r.status_code == 200, r.text
            flow_state["req_id"] = r.json()["id"]
            assert r.json()["status"] == "pending"

    def test_2_admin_sees_request(self, flow_state):
        tadmin = _login(*ADMIN)
        flow_state["tadmin"] = tadmin
        r = requests.get(f"{API}/admin/access-requests", headers=_hdr(tadmin))
        assert r.status_code == 200
        ids = [x["id"] for x in r.json()]
        assert flow_state["req_id"] in ids

    def test_3_admin_approves(self, flow_state):
        r = requests.post(f"{API}/admin/access-requests/{flow_state['req_id']}/decide",
                          headers=_hdr(flow_state["tadmin"]),
                          json={"action": "approve", "note": "ok"})
        assert r.status_code == 200, r.text
        assert r.json()["status"] == "approved"

    def test_4_org_now_sees_full_mentor(self, flow_state):
        r = requests.get(f"{API}/org/mentors/{flow_state['mentor_id']}",
                         headers=_hdr(flow_state["torg"]))
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["has_access"] is True
        assert data.get("full_name"), f"full_name missing after approval: {data}"
        assert data.get("personal_email"), "personal_email missing after approval"
        assert "phone" in data

    def test_5_conversation_created_for_both(self, flow_state):
        # org side
        r = requests.get(f"{API}/conversations", headers=_hdr(flow_state["torg"]))
        assert r.status_code == 200
        convs = r.json()
        conv = next((c for c in convs if c["mentor_id"] == flow_state["mentor_id"]), None)
        assert conv, f"conv not found for org: {convs}"
        flow_state["conv_id"] = conv["id"]

        # mentor side - login as the specific mentor
        # find mentor's email
        tadmin = flow_state["tadmin"]
        mentors = requests.get(f"{API}/admin/mentors", headers=_hdr(tadmin)).json()
        m = next((x for x in mentors if x["id"] == flow_state["mentor_id"]), None)
        assert m
        mentor_email = m["personal_email"]
        tmentor = _login(mentor_email, "Password123!")
        flow_state["tmentor"] = tmentor
        flow_state["mentor_email"] = mentor_email

        mconvs = requests.get(f"{API}/conversations", headers=_hdr(tmentor)).json()
        assert any(c["id"] == flow_state["conv_id"] for c in mconvs), \
            f"conv not visible to mentor: {mconvs}"

    def test_6_chat_send_and_receive(self, flow_state):
        conv_id = flow_state["conv_id"]
        # org sends
        r = requests.post(f"{API}/conversations/{conv_id}/messages",
                          headers=_hdr(flow_state["torg"]),
                          json={"text": "Hello mentor, welcome!"})
        assert r.status_code == 200, r.text
        assert r.json()["flagged"] is False

        # mentor reads
        r2 = requests.get(f"{API}/conversations/{conv_id}/messages",
                          headers=_hdr(flow_state["tmentor"]))
        assert r2.status_code == 200
        msgs = r2.json()["messages"]
        assert any("Hello mentor" in m["text"] for m in msgs)

        # mentor sends with contact info -> should be flagged
        r3 = requests.post(f"{API}/conversations/{conv_id}/messages",
                           headers=_hdr(flow_state["tmentor"]),
                           json={"text": "contact me at foo@bar.com"})
        assert r3.status_code == 200
        assert r3.json()["flagged"] is True

    def test_7_non_participant_forbidden(self, flow_state):
        # login as a different mentor
        t_other = _login(*MENTOR2)
        r = requests.get(f"{API}/conversations/{flow_state['conv_id']}/messages",
                         headers=_hdr(t_other))
        assert r.status_code == 403, f"expected 403, got {r.status_code}"

    def test_8_admin_cannot_post(self, flow_state):
        r = requests.post(f"{API}/conversations/{flow_state['conv_id']}/messages",
                          headers=_hdr(flow_state["tadmin"]),
                          json={"text": "admin msg"})
        assert r.status_code == 403


# ------------- ADMIN -------------
class TestAdmin:
    def test_stats(self):
        t = _login(*ADMIN)
        r = requests.get(f"{API}/admin/stats", headers=_hdr(t))
        assert r.status_code == 200
        s = r.json()
        for k in ("mentors", "organizations", "verified_mentors", "pending_requests"):
            assert k in s

    def test_settings_get_and_update(self):
        t = _login(*ADMIN)
        r = requests.get(f"{API}/admin/settings", headers=_hdr(t))
        assert r.status_code == 200
        weights = r.json()
        assert "skill" in weights
        # update
        new_w = {"skill": 0.4, "experience": 0.2, "teaching": 0.1,
                 "industry": 0.1, "availability": 0.1, "engagement": 0.1}
        r2 = requests.put(f"{API}/admin/settings", headers=_hdr(t), json=new_w)
        assert r2.status_code == 200
        assert abs(r2.json()["skill"] - 0.4) < 0.001
        # restore
        requests.put(f"{API}/admin/settings", headers=_hdr(t), json={
            "skill": 0.35, "experience": 0.20, "teaching": 0.15,
            "industry": 0.10, "availability": 0.10, "engagement": 0.10})

    def test_verify_and_suspend(self):
        t = _login(*ADMIN)
        # create a test user
        email = f"suspend_{uuid.uuid4().hex[:6]}@demo.com"
        reg = requests.post(f"{API}/auth/register", json={
            "email": email, "password": "Password123!", "name": "S U", "role": "mentor"}).json()
        uid = reg["id"]
        # verify
        r = requests.post(f"{API}/admin/users/{uid}/verify", headers=_hdr(t))
        assert r.status_code == 200
        # suspend
        r = requests.post(f"{API}/admin/users/{uid}/suspend", headers=_hdr(t))
        assert r.status_code == 200
        assert r.json()["suspended"] is True


# ------------- NOTIFICATIONS -------------
class TestNotifications:
    def test_org_notifications(self):
        t = _login(*ORG)
        r = requests.get(f"{API}/notifications", headers=_hdr(t))
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_mentor_notifications(self):
        t = _login(*MENTOR)
        r = requests.get(f"{API}/notifications", headers=_hdr(t))
        assert r.status_code == 200
