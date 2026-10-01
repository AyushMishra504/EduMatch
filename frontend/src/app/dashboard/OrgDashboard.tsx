"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Sparkles, Check, X } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { DashboardShell } from "@/components/DashboardShell";

const TABS = [
  { key: "requirements", label: "Requirements & Matches" },
  { key: "requests", label: "My Requests" },
  { key: "chats", label: "Conversations" },
];

export function OrgDashboard() {
  const [tab, setTab] = useState("requirements");
  const [meta, setMeta] = useState<any>({ industries: [], engagement_types: [] });
  const [requirements, setRequirements] = useState<any[]>([]);
  const [selectedReq, setSelectedReq] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [convs, setConvs] = useState<any[]>([]);
  
  const [form, setForm] = useState({ 
    title: "", description: "", skills: [] as string[], 
    min_experience: 0, industry: "", teaching_required: false, 
    engagement_type: "", duration: "", availability: "" 
  });
  
  const [open, setOpen] = useState(false);
  const [parsing, setParsing] = useState(false);

  const loadReqs = async () => { 
    try {
      const data = await fetchApi("/org/requirements");
      setRequirements(data);
    } catch {}
  };
  
  const loadRequests = async () => { 
    try {
      const data = await fetchApi("/org/access-requests");
      setRequests(data);
    } catch {}
  };

  useEffect(() => {
    fetchApi("/skills").then(setMeta).catch(() => {});
    loadReqs();
    loadRequests();
    fetchApi("/org/conversations").then(setConvs).catch(() => {});
  }, []);

  const loadMatches = async (req: any) => {
    setSelectedReq(req);
    try {
      const data = await fetchApi(`/org/requirements/${req.id}/matches`);
      setMatches(data);
    } catch (e: any) {
      toast.error(e.message || "Failed to load matches");
    }
  };

  const aiParse = async () => {
    if (!form.description.trim()) { 
      toast.error("Add a description first"); 
      return; 
    }
    setParsing(true);
    try {
      const data = await fetchApi("/org/requirements/parse", {
        method: "POST",
        body: JSON.stringify({ text: form.description })
      });
      setForm((prev) => ({ ...prev, ...data }));
      toast.success("AI parsed requirements from description");
    } catch (e: any) {
      toast.error(e.message || "Parse failed");
    } finally {
      setParsing(false);
    }
  };

  const createReq = async () => {
    try {
      const data = await fetchApi("/org/requirements", {
        method: "POST",
        body: JSON.stringify(form)
      });
      setRequirements([data, ...requirements]);
      setOpen(false);
      setForm({ title: "", description: "", skills: [], min_experience: 0, industry: "", teaching_required: false, engagement_type: "", duration: "", availability: "" });
      toast.success("Requirement posted");
      loadMatches(data);
    } catch (e: any) {
      toast.error(e.message || "Failed to create requirement");
    }
  };

  const requestAccess = async (mentorId: string, reason: string) => {
    try {
      await fetchApi("/org/access-requests", {
        method: "POST",
        body: JSON.stringify({ mentor_id: mentorId, requirement_id: selectedReq?.id, reason })
      });
      toast.success("Access requested. The educator will be notified.");
      loadMatches(selectedReq);
      loadRequests();
    } catch (e: any) {
      toast.error(e.message || "Failed to request access");
    }
  };

  return (
    <DashboardShell title="Institution Workspace" tabs={TABS} active={tab} onTab={setTab}>
      {tab === "requirements" && (
        <div className="grid md:grid-cols-3 gap-8 items-start">
          <div className="space-y-4">
            <button 
              onClick={() => setOpen(true)}
              className="w-full flex items-center justify-center gap-2 bg-ink hover:bg-ink-muted text-paper px-4 py-3 font-medium transition-colors"
            >
              <Plus className="w-4 h-4" /> Post new requirement
            </button>
            
            {requirements.length === 0 && (
              <div className="p-6 bg-paper border border-rule text-center">
                <p className="text-small text-ink-muted">No requirements posted yet.</p>
              </div>
            )}
            
            <div className="space-y-3">
              {requirements.map(r => (
                <button 
                  key={r.id} 
                  onClick={() => loadMatches(r)}
                  className={`w-full text-left p-4 border transition-colors ${
                    selectedReq?.id === r.id 
                      ? "border-accent bg-accent-tint text-accent" 
                      : "border-rule bg-paper hover:border-ink-muted text-ink"
                  }`}
                >
                  <p className="font-serif font-medium">{r.title}</p>
                  <p className="text-tiny opacity-70 truncate mt-1">{r.description || "No description"}</p>
                  <div className="flex gap-2 mt-3">
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-paper-deep border border-rule text-ink-muted rounded-full">
                      {r.skills.length} skills
                    </span>
                    {r.min_experience > 0 && (
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-paper-deep border border-rule text-ink-muted rounded-full">
                        {r.min_experience}+ yrs
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-2 space-y-4">
            {!selectedReq ? (
              <div className="p-12 border border-rule bg-paper flex flex-col items-center justify-center text-center h-[50vh]">
                <Sparkles className="w-8 h-8 text-ink-muted mb-4" />
                <h3 className="font-serif text-h4 text-ink">AI Matching Engine</h3>
                <p className="text-small text-ink-muted mt-2 max-w-sm">
                  Select a requirement on the left to instantly find the best educators based on our multi-factor matching algorithm.
                </p>
              </div>
            ) : (
              <div>
                <h3 className="font-serif text-h4 text-ink mb-4">Top Matches for "{selectedReq.title}"</h3>
                {matches.length === 0 && (
                  <div className="p-8 border border-rule bg-paper text-center">
                    <p className="text-small text-ink-muted">No matches found. Try relaxing the requirements.</p>
                  </div>
                )}
                <div className="space-y-4">
                  {matches.map(m => (
                    <div key={m.id} className="border border-rule bg-paper p-5 flex flex-col gap-4 relative overflow-hidden">
                      <div className="absolute top-0 right-0 bg-accent text-paper px-3 py-1 font-mono text-tiny font-bold flex flex-col items-center shadow-sm">
                        <span>MATCH</span>
                        <span className="text-base leading-none mt-1">{m.match}%</span>
                      </div>
                      
                      <div>
                        <p className="font-serif text-lg font-medium text-ink pr-16">{m.headline || m.code}</p>
                        <p className="text-small text-ink-muted mt-1">{m.years_experience} yrs experience • {m.broad_location || "Remote"}</p>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {m.skills?.slice(0, 5).map((s: any, i: number) => (
                          <span key={i} className="px-2 py-1 bg-paper-deep border border-rule text-[11px] font-medium text-ink rounded-full">
                            {s}
                          </span>
                        ))}
                        {m.skills?.length > 5 && (
                          <span className="px-2 py-1 text-[11px] text-ink-muted">+{m.skills.length - 5} more</span>
                        )}
                      </div>
                      
                      <div className="p-3 bg-accent-tint border border-accent/20 rounded-sm">
                        <p className="text-tiny font-semibold text-accent mb-1 uppercase tracking-wider">Why they match</p>
                        <ul className="text-small text-ink-muted space-y-1 list-disc list-inside">
                          {m.reasons.map((r: string, i: number) => <li key={i}>{r}</li>)}
                        </ul>
                      </div>

                      <div className="pt-4 border-t border-rule flex items-center justify-between">
                        {m.has_access ? (
                          <span className="text-small font-medium text-green-600 flex items-center gap-1">
                            <Check className="w-4 h-4" /> Access granted
                          </span>
                        ) : m.request_status === "pending" ? (
                          <span className="text-small font-medium text-amber-600">Access requested (Pending)</span>
                        ) : (
                          <button 
                            onClick={() => requestAccess(m.id, `Matched ${m.match}% for ${selectedReq.title}`)}
                            className="bg-paper-deep hover:bg-rule border border-rule text-ink px-4 py-2 text-small font-medium transition-colors"
                          >
                            Request full profile access
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "requests" && (
        <div className="space-y-4 max-w-4xl">
          {requests.length === 0 && (
            <div className="text-center py-12 bg-paper border border-rule">
              <h3 className="font-serif text-lg text-ink">No requests made</h3>
            </div>
          )}
          {requests.map(r => (
            <div key={r.id} className="bg-paper border border-rule p-5 shadow-card flex items-start justify-between">
              <div>
                <span className="font-medium text-small text-ink">Educator {r.mentor_code}</span>
                <p className="text-small text-ink-muted mt-2">Reason: {r.reason}</p>
                <p className="text-tiny text-ink-muted mt-1 opacity-70">
                  Requested on {new Date(r.created_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <span className={`text-tiny font-semibold px-2 py-0.5 rounded-full border uppercase ${
                  r.status === 'approved' ? 'text-green-600 border-green-200 bg-green-50' :
                  r.status === 'rejected' ? 'text-red-600 border-red-200 bg-red-50' :
                  'text-amber-600 border-amber-200 bg-amber-50'
                }`}>
                  {r.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "chats" && (
        <div className="text-center py-12 bg-paper border border-rule">
          <p className="text-ink-muted text-small">Conversations module coming soon...</p>
        </div>
      )}

      {open && (
        <>
          <div className="fixed inset-0 bg-ink/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
            <div className="bg-paper w-full max-w-2xl shadow-card border border-rule p-6 sm:p-8 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-serif text-h4 text-ink">Post Requirement</h2>
                <button onClick={() => setOpen(false)} className="text-ink-muted hover:text-ink"><X className="w-5 h-5" /></button>
              </div>
              
              <div className="space-y-5">
                <div>
                  <label className="text-tiny font-semibold uppercase tracking-widest text-ink-muted block mb-2">Job Description</label>
                  <textarea 
                    className="w-full bg-paper border border-rule px-4 py-3 text-ink outline-none focus:ring-1 focus:ring-accent focus:border-accent text-small transition-colors"
                    rows={4} 
                    value={form.description} 
                    onChange={e => setForm({...form, description: e.target.value})} 
                    placeholder="Paste job description here..."
                  />
                  <div className="mt-2 flex justify-end">
                    <button 
                      type="button"
                      onClick={aiParse} 
                      disabled={parsing || !form.description}
                      className="flex items-center gap-2 bg-accent-tint text-accent border border-accent/30 hover:bg-accent/10 px-4 py-2 text-tiny font-semibold transition-colors disabled:opacity-50"
                    >
                      <Sparkles className="w-3 h-3" /> {parsing ? "Parsing..." : "Extract with AI"}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-tiny font-semibold uppercase tracking-widest text-ink-muted block mb-2">Title</label>
                  <input 
                    className="w-full bg-paper border border-rule px-4 py-2.5 text-ink outline-none focus:ring-1 focus:ring-accent focus:border-accent text-small transition-colors"
                    value={form.title} 
                    onChange={e => setForm({...form, title: e.target.value})} 
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-tiny font-semibold uppercase tracking-widest text-ink-muted block mb-2">Min Experience (yrs)</label>
                    <input 
                      type="number" 
                      className="w-full bg-paper border border-rule px-4 py-2.5 text-ink outline-none focus:ring-1 focus:ring-accent focus:border-accent text-small transition-colors"
                      value={form.min_experience} 
                      onChange={e => setForm({...form, min_experience: parseInt(e.target.value)||0})} 
                    />
                  </div>
                  <div>
                    <label className="text-tiny font-semibold uppercase tracking-widest text-ink-muted block mb-2">Engagement Type</label>
                    <select 
                      className="w-full bg-paper border border-rule px-4 py-2.5 text-ink outline-none focus:ring-1 focus:ring-accent focus:border-accent text-small transition-colors"
                      value={form.engagement_type} 
                      onChange={e => setForm({...form, engagement_type: e.target.value})}
                    >
                      <option value="">Any</option>
                      {meta.engagement_types.map((e: string) => <option key={e} value={e}>{e}</option>)}
                    </select>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <input type="checkbox" checked={form.teaching_required} onChange={e => setForm({...form, teaching_required: e.target.checked})} className="w-4 h-4 accent-accent" />
                  <span className="text-small text-ink">Teaching experience required</span>
                </div>
                
                <div className="pt-6 border-t border-rule flex justify-end gap-3">
                  <button onClick={() => setOpen(false)} className="px-5 py-2.5 text-small font-medium text-ink hover:bg-paper-deep transition-colors">Cancel</button>
                  <button onClick={createReq} disabled={!form.title} className="bg-ink hover:bg-ink-muted text-paper px-6 py-2.5 font-medium text-small transition-colors disabled:opacity-50">Post Requirement</button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </DashboardShell>
  );
}
