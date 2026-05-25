import { useState, useEffect, useCallback } from "react"
import { getContract } from "../utils/contract"
import { ethers } from "ethers"

// ─── Status helpers ───────────────────────────────────────────────────────────
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
  const currentStep = Math.min(status, 3)
  return (
    <div style={ps.wrap}>
      {STEPS.map((label, i) => {
        const done    = i < currentStep
        const active  = i === currentStep
        const disputed = status === 4
        return (
          <div key={i} style={ps.item}>
            <div style={{
              ...ps.dot,
              background: disputed && i === currentStep ? "#ef4444"
                        : done    ? "#22c55e"
                        : active  ? "#f59e0b"
                        : "rgba(255,255,255,0.08)",
              border: (done || active) ? "none" : "1px solid rgba(255,255,255,0.1)",
              boxShadow: active ? `0 0 12px ${disputed?"#ef4444":"#f59e0b"}55` : "none",
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
  dot:       { width:28, height:28, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontFamily:"'IBM Plex Mono',monospace", color:"#071c1f", fontWeight:700, zIndex:1, flexShrink:0, transition:"all 0.3s" },
  stepLabel: { fontSize:9, fontFamily:"'IBM Plex Mono',monospace", letterSpacing:0.8, marginTop:6, textAlign:"center", whiteSpace:"nowrap" },
  line:      { position:"absolute", top:14, left:"calc(50% + 14px)", width:"calc(100% - 28px)", height:2, transition:"background 0.3s" },
}

// ─── Job Card ─────────────────────────────────────────────────────────────────
function JobCard({ job, onAction, loading }) {
  const s = STATUS_MAP[job.status] || STATUS_MAP[0]
  return (
    <div style={jc.card}>
      <div style={jc.top}>
        <div style={jc.idBadge}>JOB #{job.id}</div>
        <div style={{...jc.statusBadge, color: s.color, background: s.bg}}>{s.label}</div>
      </div>
      <div style={jc.desc}>{job.description || "No description"}</div>
      <div style={jc.meta}>
        <div style={jc.metaRow}>
          <span style={jc.metaKey}>Freelancer</span>
          <span style={jc.metaVal}>{job.freelancer?.slice(0,10)}...{job.freelancer?.slice(-6)}</span>
        </div>
        {job.amount && Number(job.amount) > 0 && (
          <div style={jc.metaRow}>
            <span style={jc.metaKey}>Locked</span>
            <span style={{...jc.metaVal, color:"#22c55e"}}>{ethers.formatEther(job.amount)} ETH</span>
          </div>
        )}
      </div>
      <ProgressStepper status={job.status} />
      {/* Action buttons per status */}
      {job.status === 0 && (
        <button style={jc.btn} onClick={() => onAction("deposit", job.id)} disabled={loading}>
          Fund Escrow →
        </button>
      )}
      {job.status === 2 && (
        <div style={{display:"flex", gap:8, marginTop:12}}>
          <button style={{...jc.btn, flex:1}} onClick={() => onAction("release", job.id)} disabled={loading}>
            ✓ Release Payment
          </button>
          <button style={{...jc.btn, flex:1, background:"transparent", color:"#ef4444", border:"1px solid rgba(239,68,68,0.3)"}}
            onClick={() => onAction("dispute", job.id)} disabled={loading}>
            ⚠ Dispute
          </button>
        </div>
      )}
    </div>
  )
}

const jc = {
  card:        { background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:10, padding:20, display:"flex", flexDirection:"column", gap:0 },
  top:         { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 },
  idBadge:     { fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:"#475569", letterSpacing:1 },
  statusBadge: { fontFamily:"'IBM Plex Mono',monospace", fontSize:10, letterSpacing:1, padding:"3px 10px", borderRadius:20, fontWeight:600 },
  desc:        { fontSize:14, color:"#f1f5f9", fontWeight:500, marginBottom:10 },
  meta:        { display:"flex", flexDirection:"column", gap:4 },
  metaRow:     { display:"flex", justifyContent:"space-between" },
  metaKey:     { fontSize:11, color:"#475569" },
  metaVal:     { fontSize:11, color:"#94a3b8", fontFamily:"'IBM Plex Mono',monospace" },
  btn:         { marginTop:12, width:"100%", padding:"10px 0", borderRadius:6, background:"#22c55e", color:"#071c1f", border:"none", fontFamily:"'IBM Plex Mono',monospace", fontSize:12, fontWeight:700, cursor:"pointer", letterSpacing:0.5, transition:"opacity 0.2s" },
}

// ─── Main Component ───────────────────────────────────────────────────────────
function ClientDashboard({ walletAddress, setPage }) {
  const [freelancerAddress, setFreelancerAddress] = useState("")
  const [description,       setDescription]       = useState("")
  const [amount,            setAmount]             = useState("")
  const [jobId,             setJobId]              = useState("")
  const [status,            setStatus]             = useState("")
  const [statusType,        setStatusType]         = useState("info")
  const [loading,           setLoading]            = useState(false)
  const [activeTab,         setActiveTab]          = useState("create")
  const [myJobs,            setMyJobs]             = useState([])
  const [jobsLoading,       setJobsLoading]        = useState(false)
  const [depositJobId,      setDepositJobId]       = useState("")
  const [depositAmount,     setDepositAmount]      = useState("")

  const setMsg = (msg, type="info") => { setStatus(msg); setStatusType(type) }

  // ── Fetch jobs ──────────────────────────────────────────────────────────────
  const fetchMyJobs = useCallback(async () => {
    try {
      setJobsLoading(true)
      const contract = await getContract()
      const counter = await contract.jobCounter()
      const total = Number(counter)
      const jobs = []
      for (let i = 1; i <= total; i++) {
        try {
          const job = await contract.jobs(i)
          if (job.client?.toLowerCase() === walletAddress?.toLowerCase()) {
            jobs.push({
              id:          i,
              client:      job.client,
              freelancer:  job.freelancer,
              description: job.description,
              amount:      job.amount,
              status:      Number(job.status),
            })
          }
        } catch {}
      }
      setMyJobs(jobs)
    } catch (err) {
      console.error(err)
    } finally {
      setJobsLoading(false)
    }
  }, [walletAddress])

  useEffect(() => {
    if (activeTab === "myjobs") fetchMyJobs()
  }, [activeTab, fetchMyJobs])

  // ── Contract actions ────────────────────────────────────────────────────────
  const createJob = async () => {
    try {
      setLoading(true); setMsg("Broadcasting transaction to Sepolia...", "info")
      const contract = await getContract()
      const tx = await contract.createJob(freelancerAddress, description)
      setMsg("Transaction sent. Waiting for confirmation...", "info")
      const receipt = await tx.wait()
      setMsg(`✓ Job created on-chain. TX: ${receipt.hash.slice(0,20)}...`, "success")
      setFreelancerAddress(""); setDescription("")
    } catch (err) { setMsg("✗ " + err.message, "error") }
    finally { setLoading(false) }
  }

  const depositFunds = async (id, amt) => {
    const jid = id || jobId
    const eth  = amt || amount
    try {
      setLoading(true); setMsg("Locking funds in escrow contract...", "info")
      const contract = await getContract()
      const tx = await contract.depositFunds(jid, { value: ethers.parseEther(eth) })
      await tx.wait()
      setMsg(`✓ ${eth} ETH locked in escrow for Job #${jid}`, "success")
      if (activeTab === "myjobs") fetchMyJobs()
    } catch (err) { setMsg("✗ " + err.message, "error") }
    finally { setLoading(false) }
  }

  const releasePayment = async (id) => {
    const jid = id || jobId
    try {
      setLoading(true); setMsg("Releasing payment to freelancer...", "info")
      const contract = await getContract()
      const tx = await contract.releasePayment(jid)
      await tx.wait()
      setMsg(`✓ Payment released for Job #${jid}.`, "success")
      if (activeTab === "myjobs") fetchMyJobs()
    } catch (err) { setMsg("✗ " + err.message, "error") }
    finally { setLoading(false) }
  }

  const raiseDispute = async (id) => {
    const jid = id || jobId
    try {
      setLoading(true); setMsg("Raising dispute on-chain...", "info")
      const contract = await getContract()
      const tx = await contract.raiseDispute(jid)
      await tx.wait()
      setMsg(`✓ Dispute raised for Job #${jid}.`, "success")
      if (activeTab === "myjobs") fetchMyJobs()
    } catch (err) { setMsg("✗ " + err.message, "error") }
    finally { setLoading(false) }
  }

  // Card action dispatcher (for deposit, needs amount input first)
  const [pendingDeposit, setPendingDeposit] = useState(null)
  const handleCardAction = (action, id) => {
    if (action === "deposit") { setPendingDeposit(id); return }
    if (action === "release") releasePayment(id)
    if (action === "dispute") raiseDispute(id)
  }

  const TABS = [
    { id:"create",  label:"Create Job" },
    { id:"deposit", label:"Fund Escrow" },
    { id:"manage",  label:"Manage Job" },
    { id:"myjobs",  label:"My Jobs" },
  ]

  return (
    <div style={s.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; }
        .grid-bg { position:fixed; inset:0; z-index:0; background-image: linear-gradient(rgba(34,197,94,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.03) 1px, transparent 1px); background-size: 40px 40px; pointer-events:none; }
        input { background:rgba(255,255,255,0.03) !important; border:1px solid rgba(255,255,255,0.08) !important; color:#f1f5f9 !important; border-radius:6px !important; padding:12px 16px !important; font-size:14px !important; width:100% !important; outline:none !important; font-family:'IBM Plex Mono',monospace !important; transition:border-color 0.2s !important; }
        input:focus { border-color:rgba(34,197,94,0.4) !important; }
        input::placeholder { color:#334155 !important; }
        .tab-btn { background:transparent; border:none; padding:10px 18px; font-size:12px; cursor:pointer; font-family:'IBM Plex Mono',monospace; border-bottom:2px solid transparent; transition:all 0.2s; white-space:nowrap; }
        .tab-btn.active { color:#22c55e; border-bottom-color:#22c55e; }
        .tab-btn:not(.active) { color:#475569; }
        .tab-btn:not(.active):hover { color:#94a3b8; }
        .action-btn { width:100%; padding:13px; border-radius:6px; font-size:14px; font-weight:600; cursor:pointer; font-family:'IBM Plex Mono',monospace; transition:all 0.2s; border:none; }
        .action-btn:disabled { opacity:0.5; cursor:not-allowed; }
        .action-btn.primary { background:#22c55e; color:#071c1f; }
        .action-btn.primary:hover:not(:disabled) { background:#16a34a; }
        .action-btn.danger { background:transparent; color:#ef4444; border:1px solid rgba(239,68,68,0.3); }
        .action-btn.danger:hover:not(:disabled) { background:rgba(239,68,68,0.1); }
        .action-btn.secondary { background:transparent; color:#22c55e; border:1px solid rgba(34,197,94,0.3); }
        .action-btn.secondary:hover:not(:disabled) { background:rgba(34,197,94,0.1); }
        .jobs-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(320px, 1fr)); gap:16px; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .job-card-anim { animation: fadeIn 0.3s ease forwards; }
        .spinner { width:20px; height:20px; border:2px solid rgba(34,197,94,0.2); border-top-color:#22c55e; border-radius:50%; animation:spin 0.8s linear infinite; margin:0 auto; }
      `}</style>

      <div className="grid-bg" />

      {/* NAV */}
      <nav style={s.nav}>
        <div style={s.navInner}>
          <div style={s.logo}><span style={s.logoDot} />SCROWCHAIN</div>
          <div style={s.navCenter}><span style={s.navTag}>CLIENT DASHBOARD</span></div>
          <div style={s.navRight}>
            <div style={s.walletPill}><span style={s.greenDot} />{walletAddress.slice(0,6)}...{walletAddress.slice(-4)}</div>
            <button style={s.backBtn} onClick={() => setPage("landing")}>← Exit</button>
          </div>
        </div>
      </nav>

      {/* Deposit modal for card actions */}
      {pendingDeposit !== null && (
        <div style={s.modalOverlay} onClick={() => setPendingDeposit(null)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <div style={s.modalTitle}>Fund Escrow — Job #{pendingDeposit}</div>
            <div style={s.formLabel}>AMOUNT (ETH)</div>
            <input placeholder="e.g. 0.05" value={depositAmount} onChange={e => setDepositAmount(e.target.value)} />
            <div style={{display:"flex", gap:8, marginTop:16}}>
              <button className="action-btn secondary" onClick={() => setPendingDeposit(null)}>Cancel</button>
              <button className="action-btn primary" disabled={!depositAmount || loading}
                onClick={() => { depositFunds(pendingDeposit, depositAmount); setPendingDeposit(null); setDepositAmount("") }}>
                Lock Funds →
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={s.main}>

        {/* LEFT PANEL */}
        <div style={s.leftPanel}>
          <div style={s.panelHeader}>
            <div style={s.panelTitle}>Manage Escrow</div>
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

            {/* ── Create ── */}
            {activeTab === "create" && (
              <div style={s.formSection}>
                <div style={s.formLabel}>FREELANCER WALLET ADDRESS</div>
                <input placeholder="0x..." value={freelancerAddress} onChange={e => setFreelancerAddress(e.target.value)} />
                <div style={{...s.formLabel, marginTop:16}}>JOB DESCRIPTION</div>
                <input placeholder="e.g. Logo design for US client" value={description} onChange={e => setDescription(e.target.value)} />
                <div style={s.infoBox}>
                  <span style={s.infoIcon}>ℹ</span> Creates a job record on Sepolia blockchain. No ETH required at this step.
                </div>
                <button className="action-btn primary" onClick={createJob} disabled={loading || !freelancerAddress || !description}>
                  {loading ? "Broadcasting..." : "Create Job on Blockchain →"}
                </button>
              </div>
            )}

            {/* ── Deposit ── */}
            {activeTab === "deposit" && (
              <div style={s.formSection}>
                <div style={s.formLabel}>JOB ID</div>
                <input placeholder="e.g. 1" value={jobId} onChange={e => setJobId(e.target.value)} />
                <div style={{...s.formLabel, marginTop:16}}>AMOUNT (ETH)</div>
                <input placeholder="e.g. 0.05" value={amount} onChange={e => setAmount(e.target.value)} />
                <div style={s.infoBox}>
                  <span style={s.infoIcon}>🔒</span> Funds locked in the smart contract. Only released when you approve work.
                </div>
                <button className="action-btn primary" onClick={() => depositFunds()} disabled={loading || !jobId || !amount}>
                  {loading ? "Locking funds..." : "Lock Funds in Escrow →"}
                </button>
              </div>
            )}

            {/* ── Manage ── */}
            {activeTab === "manage" && (
              <div style={s.formSection}>
                <div style={s.formLabel}>JOB ID</div>
                <input placeholder="e.g. 1" value={jobId} onChange={e => setJobId(e.target.value)} />
                <div style={s.infoBox}>
                  <span style={s.infoIcon}>⚡</span> Only release payment after verifying the freelancer's work is complete.
                </div>
                <button className="action-btn primary" style={{marginBottom:12}} onClick={() => releasePayment()} disabled={loading || !jobId}>
                  {loading ? "Processing..." : "✓ Approve & Release Payment"}
                </button>
                <button className="action-btn danger" onClick={() => raiseDispute()} disabled={loading || !jobId}>
                  {loading ? "Processing..." : "⚠ Raise Dispute"}
                </button>
              </div>
            )}

            {/* ── My Jobs ── */}
            {activeTab === "myjobs" && (
              <div>
                <div style={s.jobsHeader}>
                  <span style={s.jobsTitle}>Your On-Chain Jobs</span>
                  <button style={s.refreshBtn} onClick={fetchMyJobs} disabled={jobsLoading}>
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
                    <div style={s.emptyIcon}>📋</div>
                    <div style={s.emptyText}>No jobs found on-chain</div>
                    <div style={s.emptySubtext}>Create your first job in the "Create Job" tab</div>
                  </div>
                ) : (
                  <div className="jobs-grid">
                    {myJobs.map((job, i) => (
                      <div key={job.id} className="job-card-anim" style={{animationDelay:`${i*60}ms`}}>
                        <JobCard job={job} onAction={handleCardAction} loading={loading} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

        {/* RIGHT PANEL */}
        <div style={s.rightPanel}>

          {status && (
            <div style={{...s.statusCard, borderColor: statusType==="success" ? "rgba(34,197,94,0.3)" : statusType==="error" ? "rgba(239,68,68,0.3)" : "rgba(59,130,246,0.3)"}}>
              <div style={{...s.statusDot, background: statusType==="success" ? "#22c55e" : statusType==="error" ? "#ef4444" : "#3b82f6"}} />
              <span style={{color: statusType==="success" ? "#22c55e" : statusType==="error" ? "#ef4444" : "#94a3b8", fontFamily:"'IBM Plex Mono',monospace", fontSize:13}}>
                {status}
              </span>
            </div>
          )}

          {/* Flow */}
          <div style={s.infoCard}>
            <div style={s.infoCardTitle}>ESCROW FLOW</div>
            {[
              { label:"Create Job",     desc:"Register job on-chain" },
              { label:"Deposit Funds",  desc:"Lock ETH in contract"  },
              { label:"Work Done",      desc:"Freelancer marks complete" },
              { label:"Release Payment",desc:"Approve & pay freelancer" },
            ].map((f, i) => (
              <div key={i} style={s.flowRow}>
                <div style={{...s.flowDot, background:`rgba(34,197,94,${0.15*(i+1)})`, border:"1px solid rgba(34,197,94,0.2)"}}>
                  <span style={{color:"#22c55e"}}>{i+1}</span>
                </div>
                <div>
                  <div style={s.flowLabel}>{f.label}</div>
                  <div style={s.flowDesc}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Status legend */}
          <div style={s.infoCard}>
            <div style={s.infoCardTitle}>STATUS LEGEND</div>
            {Object.values(STATUS_MAP).map(s2 => (
              <div key={s2.label} style={{display:"flex", alignItems:"center", gap:8, marginBottom:8}}>
                <div style={{width:8, height:8, borderRadius:"50%", background:s2.color, flexShrink:0}} />
                <span style={{fontSize:12, color:"#94a3b8", fontFamily:"'IBM Plex Mono',monospace"}}>{s2.label}</span>
              </div>
            ))}
          </div>

          {/* Contract info */}
          <div style={s.infoCard}>
            <div style={s.infoCardTitle}>CONTRACT INFO</div>
            <div style={s.contractRow}><span style={s.contractLabel}>Network</span><span style={s.contractValue}>Sepolia Testnet</span></div>
            <div style={s.contractRow}><span style={s.contractLabel}>Address</span><span style={{...s.contractValue, color:"#22c55e", fontSize:11}}>0x90d7...73E7</span></div>
            <div style={s.contractRow}><span style={s.contractLabel}>Platform Fee</span><span style={s.contractValue}>1%</span></div>
            <a href="https://sepolia.etherscan.io/address/0x90d77334ac12007771Ae08b36B49a9E9e89673E7" target="_blank" rel="noreferrer" style={s.etherscanLink}>
              View on Etherscan ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

const s = {
  root:          { minHeight:"100vh", background:"#071c1f", fontFamily:"'Space Grotesk',sans-serif", color:"#f1f5f9" },
  nav:           { position:"sticky", top:0, zIndex:100, borderBottom:"1px solid rgba(34,197,94,0.1)", background:"rgba(7,28,31,0.95)", backdropFilter:"blur(12px)" },
  navInner:      { maxWidth:1400, margin:"0 auto", padding:"14px 32px", display:"flex", alignItems:"center", justifyContent:"space-between" },
  logo:          { fontFamily:"'IBM Plex Mono',monospace", color:"#22c55e", fontSize:16, fontWeight:600, letterSpacing:3, display:"flex", alignItems:"center", gap:8 },
  logoDot:       { width:6, height:6, borderRadius:"50%", background:"#22c55e", animation:"pulse 2s infinite" },
  navCenter:     { flex:1, textAlign:"center" },
  navTag:        { fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:"#475569", letterSpacing:2 },
  navRight:      { display:"flex", alignItems:"center", gap:12 },
  walletPill:    { display:"flex", alignItems:"center", gap:6, background:"rgba(34,197,94,0.1)", border:"1px solid rgba(34,197,94,0.2)", padding:"6px 12px", borderRadius:4, color:"#22c55e", fontFamily:"'IBM Plex Mono',monospace", fontSize:12 },
  greenDot:      { width:5, height:5, borderRadius:"50%", background:"#22c55e" },
  backBtn:       { background:"transparent", border:"1px solid rgba(255,255,255,0.1)", color:"#475569", padding:"6px 14px", borderRadius:4, fontFamily:"'IBM Plex Mono',monospace", fontSize:12, cursor:"pointer" },
  main:          { maxWidth:1400, margin:"0 auto", padding:"32px", display:"grid", gridTemplateColumns:"1fr 360px", gap:24, position:"relative", zIndex:1 },
  leftPanel:     { background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:12, overflow:"hidden" },
  panelHeader:   { borderBottom:"1px solid rgba(255,255,255,0.06)", padding:"20px 24px 0" },
  panelTitle:    { fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:"#475569", letterSpacing:2, marginBottom:16 },
  tabRow:        { display:"flex", gap:0, overflowX:"auto" },
  panelBody:     { padding:24 },
  formSection:   { display:"flex", flexDirection:"column", gap:8 },
  formLabel:     { fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:"#475569", letterSpacing:1.5 },
  infoBox:       { background:"rgba(59,130,246,0.05)", border:"1px solid rgba(59,130,246,0.1)", borderRadius:6, padding:"10px 14px", fontSize:12, color:"#64748b", display:"flex", alignItems:"flex-start", gap:8, margin:"8px 0" },
  infoIcon:      { fontSize:14, flexShrink:0, marginTop:1 },
  badge:         { marginLeft:6, background:"rgba(34,197,94,0.2)", color:"#22c55e", borderRadius:10, padding:"1px 6px", fontSize:10, fontWeight:700 },
  jobsHeader:    { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 },
  jobsTitle:     { fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:"#475569", letterSpacing:1.5 },
  refreshBtn:    { background:"transparent", border:"1px solid rgba(255,255,255,0.08)", color:"#475569", padding:"5px 12px", borderRadius:4, fontFamily:"'IBM Plex Mono',monospace", fontSize:11, cursor:"pointer" },
  emptyState:    { textAlign:"center", padding:"48px 0" },
  emptyIcon:     { fontSize:36, marginBottom:12 },
  emptyText:     { color:"#475569", fontFamily:"'IBM Plex Mono',monospace", fontSize:13 },
  emptySubtext:  { color:"#334155", fontSize:12, marginTop:6 },
  rightPanel:    { display:"flex", flexDirection:"column", gap:16 },
  statusCard:    { background:"rgba(255,255,255,0.02)", border:"1px solid", borderRadius:8, padding:"14px 16px", display:"flex", alignItems:"flex-start", gap:10 },
  statusDot:     { width:6, height:6, borderRadius:"50%", flexShrink:0, marginTop:4 },
  infoCard:      { background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:8, padding:20 },
  infoCardTitle: { fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:"#475569", letterSpacing:2, marginBottom:16 },
  flowRow:       { display:"flex", alignItems:"flex-start", gap:12, marginBottom:14 },
  flowDot:       { width:26, height:26, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontFamily:"'IBM Plex Mono',monospace", flexShrink:0, fontWeight:600 },
  flowLabel:     { fontSize:13, fontWeight:600, color:"#f1f5f9" },
  flowDesc:      { fontSize:11, color:"#475569", marginTop:2 },
  contractRow:   { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:"1px solid rgba(255,255,255,0.04)" },
  contractLabel: { fontSize:12, color:"#475569" },
  contractValue: { fontSize:13, color:"#94a3b8", fontFamily:"'IBM Plex Mono',monospace" },
  etherscanLink: { display:"block", marginTop:12, color:"#22c55e", fontSize:12, fontFamily:"'IBM Plex Mono',monospace", textDecoration:"none" },
  modalOverlay:  { position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center" },
  modal:         { background:"#0d2a2f", border:"1px solid rgba(34,197,94,0.2)", borderRadius:12, padding:28, width:340, display:"flex", flexDirection:"column", gap:12 },
  modalTitle:    { fontFamily:"'IBM Plex Mono',monospace", fontSize:13, color:"#22c55e", letterSpacing:1, marginBottom:4 },
}

export default ClientDashboard