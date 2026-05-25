import { useState, useEffect, useCallback } from "react"
import { getContract } from "../utils/contract"
import { ethers } from "ethers"

// ─── Shared helpers (mirrors ClientDashboard) ─────────────────────────────────
const STATUS_MAP = {
  0: { label: "Open",       color: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
  1: { label: "Funded",     color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  2: { label: "Work Done",  color: "#a78bfa", bg: "rgba(167,139,250,0.12)" },
  3: { label: "Completed",  color: "#22c55e", bg: "rgba(34,197,94,0.12)"  },
  4: { label: "Disputed",   color: "#ef4444", bg: "rgba(239,68,68,0.12)"  },
  5: { label: "Refunded",   color: "#94a3b8", bg: "rgba(148,163,184,0.12)"},
}

const STEPS = ["Open", "Funded", "Work Done", "Completed"]

function ProgressStepper({ status }) {
  const currentStep = Math.min(Number(status), 3)
  const disputed    = Number(status) === 4
  return (
    <div style={ps.wrap}>
      {STEPS.map((label, i) => {
        const done   = i < currentStep
        const active = i === currentStep
        return (
          <div key={i} style={ps.item}>
            <div style={{
              ...ps.dot,
              background: disputed && i === currentStep ? "#ef4444"
                        : done    ? "#22c55e"
                        : active  ? "#f59e0b"
                        : "rgba(255,255,255,0.08)",
              border: (done || active) ? "none" : "1px solid rgba(255,255,255,0.1)",
              boxShadow: active ? `0 0 10px ${disputed?"#ef4444":"#f59e0b"}55` : "none",
            }}>
              {done ? "✓" : <span style={{color: active ? "#071c1f" : "#475569"}}>{i+1}</span>}
            </div>
            <div style={{...ps.stepLabel, color: active ? "#f1f5f9" : done ? "#22c55e" : "#475569"}}>
              {disputed && i === currentStep ? "Disputed" : label}
            </div>
            {i < STEPS.length - 1 && (
              <div style={{...ps.line, background: done ? "#22c55e" : "rgba(255,255,255,0.06)"}} />
            )}
          </div>
        )
      })}
    </div>
  )
}

const ps = {
  wrap:      { display:"flex", alignItems:"flex-start", gap:0, width:"100%", marginTop:12 },
  item:      { display:"flex", flexDirection:"column", alignItems:"center", flex:1, position:"relative" },
  dot:       { width:26, height:26, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontFamily:"'IBM Plex Mono',monospace", color:"#071c1f", fontWeight:700, zIndex:1, flexShrink:0, transition:"all 0.3s" },
  stepLabel: { fontSize:9, fontFamily:"'IBM Plex Mono',monospace", letterSpacing:0.8, marginTop:6, textAlign:"center", whiteSpace:"nowrap" },
  line:      { position:"absolute", top:13, left:"calc(50% + 13px)", width:"calc(100% - 26px)", height:2, transition:"background 0.3s" },
}

// ─── Job card for freelancer ──────────────────────────────────────────────────
function FreelancerJobCard({ job, onMarkDone, loading, mode }) {
  const st = STATUS_MAP[job.status] || STATUS_MAP[0]

  // mode: "mine" = already assigned | "browse" = open public listing (status 0, not mine)
  const canMarkDone = mode === "mine" && Number(job.status) === 1

  return (
    <div style={jc.card}>
      <div style={jc.top}>
        <div style={jc.idBadge}>JOB #{job.id}</div>
        <div style={{...jc.statusBadge, color: st.color, background: st.bg}}>{st.label}</div>
      </div>

      <div style={jc.desc}>{job.description || "No description"}</div>

      <div style={jc.meta}>
        <div style={jc.metaRow}>
          <span style={jc.metaKey}>Client</span>
          <span style={jc.metaVal}>{job.client?.slice(0,10)}...{job.client?.slice(-6)}</span>
        </div>
        {mode === "mine" && job.amount && Number(job.amount) > 0 && (
          <div style={jc.metaRow}>
            <span style={jc.metaKey}>Escrow Balance</span>
            <span style={{...jc.metaVal, color:"#22c55e"}}>{ethers.formatEther(job.amount)} ETH</span>
          </div>
        )}
        {mode === "browse" && (
          <div style={jc.metaRow}>
            <span style={jc.metaKey}>Assigned To</span>
            <span style={{...jc.metaVal, color:"#94a3b8"}}>{job.freelancer?.slice(0,10)}...{job.freelancer?.slice(-6)}</span>
          </div>
        )}
      </div>

      {mode === "mine" && <ProgressStepper status={job.status} />}

      {canMarkDone && (
        <button style={jc.btn} onClick={() => onMarkDone(job.id)} disabled={loading}>
          ✓ Mark Work Complete
        </button>
      )}

      {mode === "mine" && Number(job.status) === 3 && (
        <div style={jc.completedBadge}>🎉 Payment Released — Job Complete</div>
      )}

      {mode === "mine" && Number(job.status) === 4 && (
        <div style={{...jc.completedBadge, color:"#ef4444", background:"rgba(239,68,68,0.08)"}}>
          ⚠ Dispute Raised — Awaiting Resolution
        </div>
      )}

      {mode === "browse" && (
        <div style={jc.infoNote}>This job is assigned to another freelancer. You can view it for reference.</div>
      )}
    </div>
  )
}

const jc = {
  card:          { background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:10, padding:20, display:"flex", flexDirection:"column", gap:0 },
  top:           { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 },
  idBadge:       { fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:"#475569", letterSpacing:1 },
  statusBadge:   { fontFamily:"'IBM Plex Mono',monospace", fontSize:10, letterSpacing:1, padding:"3px 10px", borderRadius:20, fontWeight:600 },
  desc:          { fontSize:14, color:"#f1f5f9", fontWeight:500, marginBottom:10 },
  meta:          { display:"flex", flexDirection:"column", gap:4 },
  metaRow:       { display:"flex", justifyContent:"space-between" },
  metaKey:       { fontSize:11, color:"#475569" },
  metaVal:       { fontSize:11, color:"#94a3b8", fontFamily:"'IBM Plex Mono',monospace" },
  btn:           { marginTop:14, width:"100%", padding:"10px 0", borderRadius:6, background:"#a78bfa", color:"#071c1f", border:"none", fontFamily:"'IBM Plex Mono',monospace", fontSize:12, fontWeight:700, cursor:"pointer", letterSpacing:0.5, transition:"opacity 0.2s" },
  completedBadge:{ marginTop:12, background:"rgba(34,197,94,0.08)", color:"#22c55e", borderRadius:6, padding:"8px 12px", fontSize:12, fontFamily:"'IBM Plex Mono',monospace", textAlign:"center" },
  infoNote:      { marginTop:12, color:"#334155", fontSize:11, fontStyle:"italic", borderTop:"1px solid rgba(255,255,255,0.04)", paddingTop:10 },
}

// ─── Main Component ───────────────────────────────────────────────────────────
function FreelancerDashboard({ walletAddress, setPage }) {
  const [activeTab,   setActiveTab]   = useState("myjobs")
  const [myJobs,      setMyJobs]      = useState([])
  const [allJobs,     setAllJobs]     = useState([])
  const [loading,     setLoading]     = useState(false)
  const [jobsLoading, setJobsLoading] = useState(false)
  const [status,      setStatus]      = useState("")
  const [statusType,  setStatusType]  = useState("info")
  const [lookupId,    setLookupId]    = useState("")
  const [lookedUp,    setLookedUp]    = useState(null)

  const setMsg = (msg, type="info") => { setStatus(msg); setStatusType(type) }

  // ── Fetch jobs from contract ────────────────────────────────────────────────
  const fetchJobs = useCallback(async (mode) => {
    try {
      setJobsLoading(true)
      const contract = await getContract()
      const counter  = await contract.jobCounter()
      const total    = Number(counter)
      const mine  = []
      const all   = []

      for (let i = 1; i <= total; i++) {
        try {
          const job = await contract.jobs(i)
          const parsed = {
            id:          i,
            client:      job.client,
            freelancer:  job.freelancer,
            description: job.description,
            amount:      job.amount,
            status:      Number(job.status),
          }
          all.push(parsed)
          if (job.freelancer?.toLowerCase() === walletAddress?.toLowerCase()) {
            mine.push(parsed)
          }
        } catch {}
      }
      setMyJobs(mine)
      setAllJobs(all)
    } catch (err) {
      console.error(err)
    } finally {
      setJobsLoading(false)
    }
  }, [walletAddress])

  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  // ── Mark work complete ──────────────────────────────────────────────────────
  const markWorkComplete = async (id) => {
    try {
      setLoading(true); setMsg("Submitting work completion on-chain...", "info")
      const contract = await getContract()
      const tx = await contract.markWorkComplete(id)
      await tx.wait()
      setMsg(`✓ Work marked complete for Job #${id}. Awaiting client approval.`, "success")
      fetchJobs()
    } catch (err) { setMsg("✗ " + err.message, "error") }
    finally { setLoading(false) }
  }

  // ── Lookup by ID ────────────────────────────────────────────────────────────
  const lookupJob = async () => {
    try {
      setLoading(true)
      const contract = await getContract()
      const job = await contract.jobs(lookupId)
      setLookedUp({
        id:          Number(lookupId),
        client:      job.client,
        freelancer:  job.freelancer,
        description: job.description,
        amount:      job.amount,
        status:      Number(job.status),
      })
    } catch (err) { setMsg("✗ Job not found: " + err.message, "error") }
    finally { setLoading(false) }
  }

  const TABS = [
    { id:"myjobs", label:"My Accepted Jobs" },
    { id:"browse", label:"Job Board" },
    { id:"lookup", label:"Lookup by ID" },
  ]

  // Stats
  const activeCount    = myJobs.filter(j => j.status < 3).length
  const completedCount = myJobs.filter(j => j.status === 3).length
  const totalEarned    = myJobs
    .filter(j => j.status === 3 && j.amount)
    .reduce((acc, j) => acc + Number(ethers.formatEther(j.amount)), 0)
    .toFixed(4)

  return (
    <div style={s.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; }
        .grid-bg { position:fixed; inset:0; z-index:0; background-image: linear-gradient(rgba(167,139,250,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(167,139,250,0.025) 1px, transparent 1px); background-size: 40px 40px; pointer-events:none; }
        input { background:rgba(255,255,255,0.03) !important; border:1px solid rgba(255,255,255,0.08) !important; color:#f1f5f9 !important; border-radius:6px !important; padding:12px 16px !important; font-size:14px !important; width:100% !important; outline:none !important; font-family:'IBM Plex Mono',monospace !important; transition:border-color 0.2s !important; }
        input:focus { border-color:rgba(167,139,250,0.4) !important; }
        input::placeholder { color:#334155 !important; }
        .tab-btn { background:transparent; border:none; padding:10px 18px; font-size:12px; cursor:pointer; font-family:'IBM Plex Mono',monospace; border-bottom:2px solid transparent; transition:all 0.2s; white-space:nowrap; }
        .tab-btn.active { color:#a78bfa; border-bottom-color:#a78bfa; }
        .tab-btn:not(.active) { color:#475569; }
        .tab-btn:not(.active):hover { color:#94a3b8; }
        .action-btn { width:100%; padding:13px; border-radius:6px; font-size:14px; font-weight:600; cursor:pointer; font-family:'IBM Plex Mono',monospace; transition:all 0.2s; border:none; }
        .action-btn:disabled { opacity:0.5; cursor:not-allowed; }
        .action-btn.primary { background:#a78bfa; color:#0d0d1f; }
        .action-btn.primary:hover:not(:disabled) { background:#8b5cf6; }
        .jobs-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(300px, 1fr)); gap:16px; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .job-card-anim { animation: fadeIn 0.3s ease forwards; }
        .spinner { width:20px; height:20px; border:2px solid rgba(167,139,250,0.2); border-top-color:#a78bfa; border-radius:50%; animation:spin 0.8s linear infinite; margin:0 auto; }
      `}</style>

      <div className="grid-bg" />

      {/* NAV */}
      <nav style={s.nav}>
        <div style={s.navInner}>
          <div style={s.logo}><span style={s.logoDot} />SCROWCHAIN</div>
          <div style={s.navCenter}><span style={s.navTag}>FREELANCER DASHBOARD</span></div>
          <div style={s.navRight}>
            <div style={s.walletPill}><span style={s.purpleDot} />{walletAddress.slice(0,6)}...{walletAddress.slice(-4)}</div>
            <button style={s.backBtn} onClick={() => setPage("landing")}>← Exit</button>
          </div>
        </div>
      </nav>

      <div style={s.main}>

        {/* LEFT */}
        <div style={s.leftPanel}>

          {/* Stats bar */}
          <div style={s.statsBar}>
            <div style={s.statItem}>
              <div style={s.statNum}>{myJobs.length}</div>
              <div style={s.statLabel}>Total Jobs</div>
            </div>
            <div style={s.statDivider} />
            <div style={s.statItem}>
              <div style={{...s.statNum, color:"#f59e0b"}}>{activeCount}</div>
              <div style={s.statLabel}>Active</div>
            </div>
            <div style={s.statDivider} />
            <div style={s.statItem}>
              <div style={{...s.statNum, color:"#22c55e"}}>{completedCount}</div>
              <div style={s.statLabel}>Completed</div>
            </div>
            <div style={s.statDivider} />
            <div style={s.statItem}>
              <div style={{...s.statNum, color:"#a78bfa"}}>{totalEarned}</div>
              <div style={s.statLabel}>ETH Earned</div>
            </div>
          </div>

          <div style={s.panelHeader}>
            <div style={s.tabRow}>
              {TABS.map(tab => (
                <button key={tab.id} className={`tab-btn ${activeTab===tab.id?'active':''}`}
                  onClick={() => setActiveTab(tab.id)}>
                  {tab.label}
                  {tab.id === "myjobs" && myJobs.length > 0 && (
                    <span style={s.badge}>{myJobs.length}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div style={s.panelBody}>

            {/* ── My Jobs ── */}
            {activeTab === "myjobs" && (
              <div>
                <div style={s.jobsHeader}>
                  <span style={s.jobsTitle}>Jobs Assigned to Your Wallet</span>
                  <button style={s.refreshBtn} onClick={() => fetchJobs()} disabled={jobsLoading}>
                    {jobsLoading ? "..." : "↻ Refresh"}
                  </button>
                </div>

                {jobsLoading ? (
                  <div style={{padding:"40px 0", textAlign:"center"}}>
                    <div className="spinner" />
                    <div style={{marginTop:12, color:"#475569", fontSize:12, fontFamily:"'IBM Plex Mono',monospace"}}>
                      Scanning blockchain for your jobs...
                    </div>
                  </div>
                ) : myJobs.length === 0 ? (
                  <div style={s.emptyState}>
                    <div style={s.emptyIcon}>🔍</div>
                    <div style={s.emptyText}>No jobs assigned to your wallet</div>
                    <div style={s.emptySubtext}>Ask a client to create a job with your wallet address, or browse the job board.</div>
                  </div>
                ) : (
                  <div className="jobs-grid">
                    {myJobs.map((job, i) => (
                      <div key={job.id} className="job-card-anim" style={{animationDelay:`${i*60}ms`}}>
                        <FreelancerJobCard job={job} onMarkDone={markWorkComplete} loading={loading} mode="mine" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Browse ── */}
            {activeTab === "browse" && (
              <div>
                <div style={s.jobsHeader}>
                  <span style={s.jobsTitle}>All On-Chain Jobs</span>
                  <button style={s.refreshBtn} onClick={() => fetchJobs()} disabled={jobsLoading}>
                    {jobsLoading ? "..." : "↻ Refresh"}
                  </button>
                </div>
                <div style={s.browseNote}>
                  <span style={{color:"#a78bfa", marginRight:6}}>ℹ</span>
                  Jobs are created by clients with a specific freelancer address. To get assigned, share your wallet address{" "}
                  <span style={{color:"#a78bfa", fontFamily:"'IBM Plex Mono',monospace", fontSize:11}}>
                    {walletAddress.slice(0,8)}...{walletAddress.slice(-6)}
                  </span>{" "}
                  with a client so they can create a job for you.
                </div>
                {jobsLoading ? (
                  <div style={{padding:"40px 0", textAlign:"center"}}><div className="spinner" /></div>
                ) : allJobs.length === 0 ? (
                  <div style={s.emptyState}>
                    <div style={s.emptyIcon}>📋</div>
                    <div style={s.emptyText}>No jobs on-chain yet</div>
                  </div>
                ) : (
                  <div className="jobs-grid">
                    {allJobs.map((job, i) => {
                      const isMine = job.freelancer?.toLowerCase() === walletAddress?.toLowerCase()
                      return (
                        <div key={job.id} className="job-card-anim" style={{animationDelay:`${i*50}ms`}}>
                          <FreelancerJobCard
                            job={job}
                            onMarkDone={markWorkComplete}
                            loading={loading}
                            mode={isMine ? "mine" : "browse"}
                          />
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── Lookup ── */}
            {activeTab === "lookup" && (
              <div style={s.formSection}>
                <div style={s.formLabel}>ENTER JOB ID</div>
                <input placeholder="e.g. 1" value={lookupId} onChange={e => setLookupId(e.target.value)} />
                <button className="action-btn primary" style={{marginTop:8}} onClick={lookupJob} disabled={loading || !lookupId}>
                  {loading ? "Fetching..." : "Fetch Job →"}
                </button>

                {lookedUp && (
                  <div style={{marginTop:20}}>
                    <FreelancerJobCard
                      job={lookedUp}
                      onMarkDone={markWorkComplete}
                      loading={loading}
                      mode={lookedUp.freelancer?.toLowerCase() === walletAddress?.toLowerCase() ? "mine" : "browse"}
                    />
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

        {/* RIGHT */}
        <div style={s.rightPanel}>

          {status && (
            <div style={{...s.statusCard, borderColor: statusType==="success" ? "rgba(34,197,94,0.3)" : statusType==="error" ? "rgba(239,68,68,0.3)" : "rgba(167,139,250,0.3)"}}>
              <div style={{...s.statusDot, background: statusType==="success" ? "#22c55e" : statusType==="error" ? "#ef4444" : "#a78bfa"}} />
              <span style={{color: statusType==="success" ? "#22c55e" : statusType==="error" ? "#ef4444" : "#94a3b8", fontFamily:"'IBM Plex Mono',monospace", fontSize:13}}>
                {status}
              </span>
            </div>
          )}

          {/* How to get paid */}
          <div style={s.infoCard}>
            <div style={s.infoCardTitle}>HOW TO GET PAID</div>
            {[
              { label:"Get assigned",   desc:"Client creates a job with your wallet address" },
              { label:"Client funds",   desc:"Client deposits ETH into the escrow contract" },
              { label:"Do the work",    desc:"Complete the agreed deliverable" },
              { label:"Mark complete",  desc:"Click 'Mark Work Complete' to notify client" },
              { label:"Get paid",       desc:"Client approves → ETH automatically sent to you" },
            ].map((f, i) => (
              <div key={i} style={s.flowRow}>
                <div style={s.flowDot}><span style={{color:"#a78bfa"}}>{i+1}</span></div>
                <div>
                  <div style={s.flowLabel}>{f.label}</div>
                  <div style={s.flowDesc}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Your wallet */}
          <div style={s.infoCard}>
            <div style={s.infoCardTitle}>YOUR WALLET</div>
            <div style={s.walletDisplay}>{walletAddress}</div>
            <div style={{fontSize:11, color:"#334155", marginTop:8}}>
              Share this address with clients so they can assign jobs to you.
            </div>
          </div>

          {/* Status legend */}
          <div style={s.infoCard}>
            <div style={s.infoCardTitle}>STATUS GUIDE</div>
            {Object.values(STATUS_MAP).map(sm => (
              <div key={sm.label} style={{display:"flex", alignItems:"center", gap:8, marginBottom:8}}>
                <div style={{width:8, height:8, borderRadius:"50%", background:sm.color, flexShrink:0}} />
                <span style={{fontSize:12, color:"#94a3b8", fontFamily:"'IBM Plex Mono',monospace"}}>{sm.label}</span>
              </div>
            ))}
          </div>

          <div style={s.infoCard}>
            <div style={s.infoCardTitle}>CONTRACT INFO</div>
            <div style={s.contractRow}><span style={s.contractLabel}>Network</span><span style={s.contractValue}>Sepolia Testnet</span></div>
            <div style={s.contractRow}><span style={s.contractLabel}>Address</span><span style={{...s.contractValue, color:"#a78bfa", fontSize:11}}>0x90d7...73E7</span></div>
            <a href="https://sepolia.etherscan.io/address/0x90d77334ac12007771Ae08b36B49a9E9e89673E7" target="_blank" rel="noreferrer" style={{...s.etherscanLink, color:"#a78bfa"}}>
              View on Etherscan ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

const s = {
  root:          { minHeight:"100vh", background:"#0d0d1f", fontFamily:"'Space Grotesk',sans-serif", color:"#f1f5f9" },
  nav:           { position:"sticky", top:0, zIndex:100, borderBottom:"1px solid rgba(167,139,250,0.1)", background:"rgba(13,13,31,0.95)", backdropFilter:"blur(12px)" },
  navInner:      { maxWidth:1400, margin:"0 auto", padding:"14px 32px", display:"flex", alignItems:"center", justifyContent:"space-between" },
  logo:          { fontFamily:"'IBM Plex Mono',monospace", color:"#a78bfa", fontSize:16, fontWeight:600, letterSpacing:3, display:"flex", alignItems:"center", gap:8 },
  logoDot:       { width:6, height:6, borderRadius:"50%", background:"#a78bfa", animation:"pulse 2s infinite" },
  navCenter:     { flex:1, textAlign:"center" },
  navTag:        { fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:"#475569", letterSpacing:2 },
  navRight:      { display:"flex", alignItems:"center", gap:12 },
  walletPill:    { display:"flex", alignItems:"center", gap:6, background:"rgba(167,139,250,0.1)", border:"1px solid rgba(167,139,250,0.2)", padding:"6px 12px", borderRadius:4, color:"#a78bfa", fontFamily:"'IBM Plex Mono',monospace", fontSize:12 },
  purpleDot:     { width:5, height:5, borderRadius:"50%", background:"#a78bfa" },
  backBtn:       { background:"transparent", border:"1px solid rgba(255,255,255,0.1)", color:"#475569", padding:"6px 14px", borderRadius:4, fontFamily:"'IBM Plex Mono',monospace", fontSize:12, cursor:"pointer" },
  main:          { maxWidth:1400, margin:"0 auto", padding:"32px", display:"grid", gridTemplateColumns:"1fr 360px", gap:24, position:"relative", zIndex:1 },
  leftPanel:     { background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:12, overflow:"hidden" },
  statsBar:      { display:"flex", alignItems:"center", padding:"16px 24px", borderBottom:"1px solid rgba(255,255,255,0.06)", gap:0 },
  statItem:      { flex:1, textAlign:"center" },
  statNum:       { fontFamily:"'IBM Plex Mono',monospace", fontSize:22, fontWeight:600, color:"#f1f5f9" },
  statLabel:     { fontSize:10, color:"#475569", marginTop:2, letterSpacing:1 },
  statDivider:   { width:1, height:36, background:"rgba(255,255,255,0.06)" },
  panelHeader:   { borderBottom:"1px solid rgba(255,255,255,0.06)", padding:"0 24px" },
  tabRow:        { display:"flex", gap:0, overflowX:"auto" },
  panelBody:     { padding:24 },
  badge:         { marginLeft:6, background:"rgba(167,139,250,0.2)", color:"#a78bfa", borderRadius:10, padding:"1px 6px", fontSize:10, fontWeight:700 },
  jobsHeader:    { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 },
  jobsTitle:     { fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:"#475569", letterSpacing:1.5 },
  refreshBtn:    { background:"transparent", border:"1px solid rgba(255,255,255,0.08)", color:"#475569", padding:"5px 12px", borderRadius:4, fontFamily:"'IBM Plex Mono',monospace", fontSize:11, cursor:"pointer" },
  browseNote:    { background:"rgba(167,139,250,0.05)", border:"1px solid rgba(167,139,250,0.1)", borderRadius:6, padding:"10px 14px", fontSize:12, color:"#64748b", marginBottom:16, lineHeight:1.6 },
  emptyState:    { textAlign:"center", padding:"48px 0" },
  emptyIcon:     { fontSize:36, marginBottom:12 },
  emptyText:     { color:"#475569", fontFamily:"'IBM Plex Mono',monospace", fontSize:13 },
  emptySubtext:  { color:"#334155", fontSize:12, marginTop:6, lineHeight:1.6, maxWidth:300, margin:"6px auto 0" },
  formSection:   { display:"flex", flexDirection:"column", gap:8 },
  formLabel:     { fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:"#475569", letterSpacing:1.5 },
  rightPanel:    { display:"flex", flexDirection:"column", gap:16 },
  statusCard:    { background:"rgba(255,255,255,0.02)", border:"1px solid", borderRadius:8, padding:"14px 16px", display:"flex", alignItems:"flex-start", gap:10 },
  statusDot:     { width:6, height:6, borderRadius:"50%", flexShrink:0, marginTop:4 },
  infoCard:      { background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:8, padding:20 },
  infoCardTitle: { fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:"#475569", letterSpacing:2, marginBottom:16 },
  flowRow:       { display:"flex", alignItems:"flex-start", gap:12, marginBottom:14 },
  flowDot:       { width:24, height:24, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontFamily:"'IBM Plex Mono',monospace", background:"rgba(167,139,250,0.12)", border:"1px solid rgba(167,139,250,0.2)", flexShrink:0, fontWeight:600 },
  flowLabel:     { fontSize:13, fontWeight:600, color:"#f1f5f9" },
  flowDesc:      { fontSize:11, color:"#475569", marginTop:2 },
  walletDisplay: { fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:"#a78bfa", background:"rgba(167,139,250,0.08)", border:"1px solid rgba(167,139,250,0.15)", borderRadius:6, padding:"10px 12px", wordBreak:"break-all", letterSpacing:0.5 },
  contractRow:   { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:"1px solid rgba(255,255,255,0.04)" },
  contractLabel: { fontSize:12, color:"#475569" },
  contractValue: { fontSize:13, color:"#94a3b8", fontFamily:"'IBM Plex Mono',monospace" },
  etherscanLink: { display:"block", marginTop:12, fontSize:12, fontFamily:"'IBM Plex Mono',monospace", textDecoration:"none" },
}

export default FreelancerDashboard