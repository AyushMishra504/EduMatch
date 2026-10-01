"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Upload, Plus, X, FileText, Check } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { DashboardShell } from "@/components/DashboardShell";
// import Chat from "@/components/Chat"; // TODO: Implement Chat

const TABS = [
  { key: "profile", label: "Profile" },
  { key: "resume", label: "Resume & Skills" },
  { key: "requests", label: "Requests" },
  { key: "chats", label: "Conversations" },
];

function ChipSelect({ options, value, onChange }: { options: string[], value: string[], onChange: (v: string[]) => void }) {
  const toggle = (o: string) => onChange(value.includes(o) ? value.filter((x) => x !== o) : [...value, o]);
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button key={o} type="button" onClick={() => toggle(o)}
          className={`px-3 py-1.5 text-tiny font-semibold rounded-full border transition-colors ${
            value.includes(o)
              ? "bg-accent border-accent text-paper"
              : "bg-paper border-rule text-ink hover:border-ink-muted"
          }`}>
          {o}
        </button>
      ))}
    </div>
  );
}

export function MentorDashboard() {
  const [tab, setTab] = useState("profile");
  const [profile, setProfile] = useState<any>(null);
  const [meta, setMeta] = useState<any>({ engagement_types: [], availability: [], industries: [], taxonomy: {} });
  const [requests, setRequests] = useState([]);
  const [convs, setConvs] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [extracted, setExtracted] = useState<any>(null);
  const [newSkill, setNewSkill] = useState("");

  const loadProfile = async () => {
    try {
      const data = await fetchApi("/mentor/profile");
      setProfile(data);
    } catch (e: any) {
      toast.error(e.message || "Failed to load profile");
    }
  };

  useEffect(() => {
    loadProfile();
    fetchApi("/skills").then(setMeta).catch(() => {});
    fetchApi("/mentor/requests").then(setRequests).catch(() => {});
    fetchApi("/mentor/conversations").then(setConvs).catch(() => {});
  }, []);

  const save = async () => {
    try {
      const data = await fetchApi("/mentor/profile", {
        method: "PUT",
        body: JSON.stringify(profile),
      });
      setProfile(data);
      toast.success("Profile saved");
    } catch (e: any) {
      toast.error(e.message || "Failed to save profile");
    }
  };

  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setExtracted(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      
      const token = localStorage.getItem("auth_token");
      const res = await fetch("http://localhost:4000/api/mentor/resume", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: fd
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Upload failed");
      
      setExtracted(data.extracted);
      toast.success("Resume processed by AI — review below");
      loadProfile();
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const applyExtracted = async () => {
    const payload = {
      headline: extracted.headline || profile.headline,
      summary: extracted.summary || profile.summary,
      years_experience: extracted.years_experience || profile.years_experience,
      skills: extracted.skills || profile.skills,
      industries: extracted.industries?.length ? extracted.industries : profile.industries,
      expertise: extracted.expertise?.length ? extracted.expertise : profile.expertise,
      teaching_experience: extracted.teaching_experience,
    };
    try {
      const data = await fetchApi("/mentor/profile", {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      setProfile(data);
      setExtracted(null);
      toast.success("Applied to your profile");
    } catch (e: any) {
      toast.error(e.message || "Failed to apply");
    }
  };

  const addSkill = () => {
    if (!newSkill.trim()) return;
    const skills = [...(profile.skills || []), { name: newSkill.trim(), category: "Technology" }];
    setProfile({ ...profile, skills });
    setNewSkill("");
  };
  const removeSkill = (i: number) => setProfile({ ...profile, skills: profile.skills.filter((_: any, x: number) => x !== i) });

  if (!profile) return <DashboardShell title="Educator Workspace"><p className="text-ink-muted">Loading...</p></DashboardShell>;

  return (
    <DashboardShell title="Educator Workspace" tabs={TABS} active={tab} onTab={setTab}>
      {tab === "profile" && (
        <div className="max-w-3xl space-y-8">
          <div className="flex items-center justify-between bg-paper p-5 border border-rule shadow-card">
            <div>
              <p className="font-serif text-lg font-medium text-ink">{profile.code}</p>
              <p className="text-small text-ink-muted">
                Status: <span className={profile.verification_status === "verified" ? "text-green-600" : "text-amber-500"}>{profile.verification_status}</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-small font-medium text-ink">Searchable</span>
              <input 
                type="checkbox" 
                checked={!!profile.searchable} 
                onChange={(e) => setProfile({ ...profile, searchable: e.target.checked })} 
                className="w-5 h-5 accent-accent"
              />
            </div>
          </div>

          <Section title="Public / Anonymized">
            <Field label="Professional headline">
              <input className={inputCls} value={profile.headline || ""} onChange={(e) => setProfile({ ...profile, headline: e.target.value })} />
            </Field>
            <Field label="Profile summary">
              <textarea className={inputCls} rows={3} value={profile.summary || ""} onChange={(e) => setProfile({ ...profile, summary: e.target.value })} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Years of experience">
                <input type="number" className={inputCls} value={profile.years_experience || 0} onChange={(e) => setProfile({ ...profile, years_experience: parseInt(e.target.value) || 0 })} />
              </Field>
              <Field label="Education category">
                <input className={inputCls} value={profile.education_category || ""} onChange={(e) => setProfile({ ...profile, education_category: e.target.value })} />
              </Field>
            </div>
            <Field label="Industries">
              <ChipSelect options={meta.industries} value={profile.industries || []} onChange={(v) => setProfile({ ...profile, industries: v })} />
            </Field>
            <Field label="Engagement types">
              <ChipSelect options={meta.engagement_types} value={profile.engagement_types || []} onChange={(v) => setProfile({ ...profile, engagement_types: v })} />
            </Field>
            <Field label="Availability">
              <ChipSelect options={meta.availability} value={profile.availability || []} onChange={(v) => setProfile({ ...profile, availability: v })} />
            </Field>
            <div className="flex items-center gap-3">
              <input type="checkbox" checked={!!profile.teaching_experience} onChange={(e) => setProfile({ ...profile, teaching_experience: e.target.checked })} className="w-4 h-4 accent-accent" />
              <span className="text-small text-ink">I have teaching experience</span>
            </div>
          </Section>

          <Section title="Private (revealed only after admin approval)">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Full name"><input className={inputCls} value={profile.full_name || ""} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} /></Field>
              <Field label="Phone"><input className={inputCls} value={profile.phone || ""} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} /></Field>
              <Field label="Exact location"><input className={inputCls} value={profile.exact_location || ""} onChange={(e) => setProfile({ ...profile, exact_location: e.target.value })} /></Field>
              <Field label="LinkedIn"><input className={inputCls} value={profile.linkedin || ""} onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })} /></Field>
            </div>
          </Section>

          <button onClick={save} className="bg-ink hover:bg-ink-muted text-paper px-6 py-3 font-medium transition-colors w-full sm:w-auto">
            Save profile
          </button>
        </div>
      )}

      {tab === "resume" && (
        <div className="max-w-3xl space-y-6">
          <div className="bg-paper border border-rule p-6 shadow-card">
            <h3 className="font-serif font-bold text-lg mb-2 text-ink">Resume intelligence</h3>
            <p className="text-small text-ink-muted mb-4">Upload your resume (PDF, DOC, DOCX). Our AI extracts skills and experience for you to review. Your file stays private until you approve access.</p>
            <label className="inline-flex items-center gap-2 bg-paper-deep border border-rule hover:border-accent px-5 py-3 cursor-pointer transition-colors text-small font-medium text-ink">
              <Upload className="w-4 h-4" /> {uploading ? "Processing..." : "Upload resume"}
              <input type="file" accept=".pdf,.doc,.docx,.txt" hidden onChange={upload} disabled={uploading} />
            </label>
            {profile.resume_file_id && <p className="mt-3 text-tiny text-green-600 flex items-center gap-1"><FileText className="w-3 h-3" /> Resume on file (stored securely)</p>}
          </div>

          {extracted && (
            <div className="bg-accent-tint border border-accent/40 p-6">
              <h4 className="font-serif font-bold mb-3 text-ink">AI-extracted (review before applying)</h4>
              <p className="text-small text-ink-muted mb-1">Headline: <span className="text-ink font-medium">{extracted.headline || "?"}</span></p>
              <p className="text-small text-ink-muted mb-1">Experience: <span className="text-ink font-medium">{extracted.years_experience} yrs</span> • Teaching: <span className="text-ink font-medium">{extracted.teaching_experience ? "Yes" : "No"}</span></p>
              <div className="flex flex-wrap gap-2 my-3">
                {(extracted.skills || []).map((s: any, i: number) => (
                  <span key={i} className="px-2 py-1 bg-paper border border-rule text-tiny text-ink rounded-full">{s.name}</span>
                ))}
              </div>
              <button onClick={applyExtracted} className="flex items-center gap-2 bg-accent hover:bg-accent/90 text-paper px-5 py-2 text-small font-medium transition-colors">
                <Check className="w-4 h-4" /> Apply to profile
              </button>
            </div>
          )}

          <Section title="Skills / Tags">
            <div className="flex gap-2 mb-3">
              <input className={inputCls} placeholder="Add a skill" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())} />
              <button onClick={addSkill} className="bg-paper border border-rule px-4 hover:border-ink transition-colors"><Plus className="w-4 h-4 text-ink" /></button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(profile.skills || []).map((s: any, i: number) => (
                <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-paper-deep border border-rule text-small font-medium text-ink rounded-full">
                  {s.name}<button onClick={() => removeSkill(i)}><X className="w-3 h-3 text-ink-muted hover:text-red-500 transition-colors" /></button>
                </span>
              ))}
            </div>
            <button onClick={save} className="mt-6 bg-ink hover:bg-ink-muted text-paper px-5 py-2 text-small font-medium transition-colors">Save skills</button>
          </Section>
        </div>
      )}

      {tab === "requests" && (
        <div className="space-y-4 max-w-3xl">
          {requests.length === 0 && (
            <div className="text-center py-12 bg-paper border border-rule">
              <h3 className="font-serif text-lg text-ink">No requests yet</h3>
              <p className="text-small text-ink-muted mt-1">Organizations that request access to your profile will appear here.</p>
            </div>
          )}
          {requests.map((r: any) => (
            <div key={r.id} className="bg-paper border border-rule p-5 shadow-card">
              <div className="flex items-center justify-between">
                <span className="font-medium text-small text-ink">{r.code} • {r.org_name}</span>
                <StatusBadge status={r.status} />
              </div>
              <p className="text-small text-ink-muted mt-2">Reason: {r.reason}</p>
              {r.message && <p className="text-small text-ink-muted mt-1 italic">"{r.message}"</p>}
              {r.status === "approved" && <p className="text-tiny font-medium text-green-600 mt-3">Access granted — a private chat is now open in Conversations.</p>}
            </div>
          ))}
        </div>
      )}

      {tab === "chats" && (
        <div className="text-center py-12 bg-paper border border-rule">
          <p className="text-ink-muted text-small">Conversations module coming soon...</p>
        </div>
      )}
    </DashboardShell>
  );
}

const inputCls = "w-full bg-paper border border-rule px-4 py-2.5 text-ink outline-none focus:ring-1 focus:ring-accent focus:border-accent text-small transition-colors";
const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="text-tiny font-semibold uppercase tracking-widest text-ink-muted block mb-2">{label}</label>
    {children}
  </div>
);
const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-paper border border-rule p-6 space-y-5 shadow-sm">
    <h3 className="font-serif font-medium text-lg text-ink">{title}</h3>
    {children}
  </div>
);
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = { pending: "text-amber-600 bg-amber-50 border-amber-200", approved: "text-green-600 bg-green-50 border-green-200", rejected: "text-red-600 bg-red-50 border-red-200", flagged: "text-orange-600 bg-orange-50 border-orange-200" };
  const cls = map[status] || "text-ink-muted bg-paper-deep border-rule";
  return <span className={`text-tiny font-semibold px-2 py-0.5 rounded-full border uppercase ${cls}`}>{status}</span>;
}
