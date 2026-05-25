import { useState } from "react"
import { getContract } from "../utils/contract"

function FreelancerDashboard({ walletAddress, setPage }) {
  const [jobId, setJobId] = useState("")
  const [status, setStatus] = useState("")
  const [statusType, setStatusType] = useState("info")
  const [jobDetails, setJobDetails] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("check")

  const setMsg = (msg, type="info") => { setStatus(msg); setStatusType(type) }

  const getJobDetails = async () => {
    try {
      setLoading(true); setMsg("Fetching job from blockchain...", "info")
      const contract = await getContract()
      const job = await contract.getJob(jobId)
      const statusLabels = ["OPEN","FUNDED","COMPLETED","RELEASED","DISPUTED","REFUNDED"]
      setJobDetails({
        jobId: job[0].toString(),
        client: job[1],
        freelancer: job[2],
        amount: job[3].toString(),
        description: job[4],
        status: statusLabels[job[5]],
        statusIndex: Number(job[5]),
        createdAt: new Date(Number(job[6]) * 1000).toLocaleString()
      })
      setMsg("", "info")
    } catch (err) { setMsg("✗ " + err.message, "error") }
    finally { setLoading(false) }
  }

  const markComplete = async () => {
    try {
      setLoading(true); setMsg("Marking work as complete on-chain...", "info")
      const contract = await getContract()
      const tx = await contract.markWorkComplete(jobId)
      await tx.wait()
      setMsg(`✓ Work marked complete for Job #${jobId}. Waiting for client to release payment.`, "success")
      if (jobDetails) setJobDetails({...jobDetails, status:"COMPLETED", statusIndex:2})
    } catch (err) { setMsg("✗ " + err.message, "error") }
    finally { setLoading(false) }
  }

  const raiseDispute = async () => {
    try {
      setLoading(true); setMsg("Raising dispute on-chain...", "info")
      const contract = await getContract()
      const tx = await contract.raiseDispute(jobId)
      await tx.wait()
      setMsg(`✓ Dispute raised for Job #${jobId}. Platform admin will review.`, "success")
      if (jobDetails) setJobDetails({...jobDetails, status:"DISPUTED", statusIndex:4})
    } catch (err) { setMsg("✗ " + err.message, "error") }
    finally { setLoading(false) }
  }

  const statusColors = {
    "OPEN": { bg:"rgba(59,130,246,0.1)", color:"#3b82f6" },
    "FUNDED": { bg:"rgba(234,179,8,0.1)", color:"#eab308" },
    "COMPLETED": { bg:"rgba(34,197,94,0.1)", color:"#22c55e" },
    "RELEASED": { bg:"rgba(34,197,94,0.15)", color:"#22c55e" },
    "DISPUTED": { bg:"rgba(239,68,68,0.1)", color:"#ef4444" },
    "REFUNDED": { bg:"rgba(148,163,184,0.1)", color:"#94a3b8" },
  }

  return (
    <div style={s.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; }
        .grid-bg { position:fixed; inset:0; z-index:0; background-image: linear-gradient(rgba(139,92,246,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.03) 1px, transparent 1px); background-size: 40px 40px; pointer-events:none; }
        input { background:rgba(255,255,255,0.03) !important; border:1px solid rgba(255,255,255,0.08) !important; color:#f1f5f9 !important; border-radius:6px !important; padding:12px 16px !important; font-size:14px !important; width:100% !important; outline:none !important; font-family:'IBM Plex Mono',monospace !important; transition:border-color 0.2s !important; }
        input:focus { border-color:rgba(139,92,246,0.4) !important; }
        input::placeholder { color:#334155 !important; }
        .tab-btn { background:transparent; border:none; padding:10px 20px; font-size:13px; cursor:pointer; font-family:'IBM Plex Mono',monospace; border-bottom:2px solid transparent; transition:all 0.2s; }
        .tab-btn.active { color:#8b5cf6; border-bottom-color:#8b5cf6; }
        .tab-btn:not(.active) { color:#475569; }
        .tab-btn:not(.active):hover { color:#94a3b8; }
        .action-btn { width:100%; padding:13px; border-radius:6px; font-size:14px; font-weight:600; cursor:pointer; font-family:'IBM Plex Mono',monospace; transition:all 0.2s; border:none; }
        .action-btn:disabled { opacity:0.5; cursor:not-allowed; }
        .action-btn.primary { background:#8b5cf6; color:#fff; }
        .action-btn.primary:hover:not(:disabled) { background:#7c3aed; }
        .action-btn.success { background:#22c55e; color:#071c1f; }
        .action-btn.success:hover:not(:disabled) { background:#16a34a; }
        .action-btn.danger { background:transparent; color:#ef4444; border:1px solid rgba(239,68,68,0.3); }
        .action-btn.danger:hover:not(:disabled) { background:rgba(239,68,68,0.1); }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .job-card { animation: fadeUp 0.4s ease forwards; }
      `}</style>

      <div className="grid-bg" />

      {/* NAV */}
      <nav style={s.nav}>
        <div style={s.navInner}>
          <div style={s.logo}>
            <span style={s.purpleDot} />
            SCROWCHAIN
          </div>
          <div style={s.navCenter}>
            <span style={s.navTag}>FREELANCER DASHBOARD</span>
          </div>
          <div style={s.navRight}>
            <div style={s.walletPill}>
              <span style={s.purpleDot} />
              {walletAddress.slice(0,6)}...{walletAddress.slice(-4)}
            </div>
            <button style={s.backBtn} onClick={() => setPage("landing")}>← Exit</button>
          </div>
        </div>
      </nav>

      <div style={s.main}>

        {/* LEFT PANEL */}
        <div style={s.leftPanel}>
          <div style={s.panelHeader}>
            <div style={s.panelTitle}>JOB MANAGEMENT</div>
            <div style={s.tabRow}>
              {["check","actions"].map(tab => (
                <button key={tab} className={`tab-btn ${activeTab===tab?'active':''}`} onClick={() => setActiveTab(tab)}>
                  {tab === "check" ? "Check Job" : "Update Status"}
                </button>
              ))}
            </div>
          </div>

          <div style={s.panelBody}>
            {activeTab === "check" && (
              <div style={s.formSection}>
                <div style={s.formLabel}>ENTER JOB ID</div>
                <input
                  placeholder="e.g. 1"
                  value={jobId}
                  onChange={e => setJobId(e.target.value)}
                />
                <div style={s.infoBox}>
                  <span>ℹ</span> Ask your client for the Job ID after they create the escrow.
                </div>
                <button className="action-btn primary" onClick={getJobDetails} disabled={loading || !jobId}>
                  {loading ? "Fetching..." : "Fetch Job Details →"}
                </button>

                {/* Job card */}
                {jobDetails && (
                  <div style={s.jobCard} className="job-card">
                    <div style={s.jobCardHeader}>
                      <span style={s.jobIdLabel}>JOB #{jobDetails.jobId}</span>
                      <span style={{
                        ...s.statusBadge,
                        background: statusColors[jobDetails.status]?.bg,
                        color: statusColors[jobDetails.status]?.color,
                      }}>
                        ● {jobDetails.status}
                      </span>
                    </div>

                    <div style={s.jobDesc}>{jobDetails.description}</div>

                    <div style={s.divider} />

                    <div style={s.jobRow}>
                      <span style={s.jobLabel}>CLIENT</span>
                      <span style={s.jobValue}>{jobDetails.client.slice(0,8)}...{jobDetails.client.slice(-6)}</span>
                    </div>
                    <div style={s.jobRow}>
                      <span style={s.jobLabel}>FREELANCER</span>
                      <span style={s.jobValue}>{jobDetails.freelancer.slice(0,8)}...{jobDetails.freelancer.slice(-6)}</span>
                    </div>
                    <div style={s.jobRow}>
                      <span style={s.jobLabel}>AMOUNT LOCKED</span>
                      <span style={{...s.jobValue, color:"#22c55e"}}>{jobDetails.amount} wei</span>
                    </div>
                    <div style={s.jobRow}>
                      <span style={s.jobLabel}>CREATED</span>
                      <span style={s.jobValue}>{jobDetails.createdAt}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "actions" && (
              <div style={s.formSection}>
                <div style={s.formLabel}>JOB ID</div>
                <input
                  placeholder="e.g. 1"
                  value={jobId}
                  onChange={e => setJobId(e.target.value)}
                />

                <div style={s.actionInfo}>
                  <div style={s.actionInfoTitle}>Mark Work Complete</div>
                  <div style={s.actionInfoDesc}>Call this once you've delivered the work. This signals the client to review and release payment.</div>
                  <button className="action-btn success" onClick={markComplete} disabled={loading || !jobId} style={{marginTop:12}}>
                    {loading ? "Broadcasting..." : "✓ Mark Work Complete"}
                  </button>
                </div>

                <div style={s.divider} />

                <div style={s.actionInfo}>
                  <div style={s.actionInfoTitle}>Raise a Dispute</div>
                  <div style={s.actionInfoDesc}>Use this if the client is unresponsive or acting in bad faith. Platform admin will review.</div>
                  <button className="action-btn danger" onClick={raiseDispute} disabled={loading || !jobId} style={{marginTop:12}}>
                    {loading ? "Broadcasting..." : "⚠ Raise Dispute"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div style={s.rightPanel}>

          {status && (
            <div style={{...s.statusCard, borderColor: statusType==="success" ? "rgba(139,92,246,0.3)" : statusType==="error" ? "rgba(239,68,68,0.3)" : "rgba(59,130,246,0.3)"}}>
              <div style={{...s.statusDot, background: statusType==="success" ? "#8b5cf6" : statusType==="error" ? "#ef4444" : "#3b82f6"}} />
              <span style={{color: statusType==="success" ? "#8b5cf6" : statusType==="error" ? "#ef4444" : "#94a3b8", fontFamily:"'IBM Plex Mono',monospace", fontSize:13}}>
                {status}
              </span>
            </div>
          )}

          {/* Freelancer flow */}
          <div style={s.infoCard}>
            <div style={s.infoCardTitle}>YOUR JOURNEY</div>
            {[
              { label:"Job Assigned", desc:"Client creates escrow with your wallet", icon:"◇" },
              { label:"Funds Locked", desc:"Client deposits ETH — your payment is safe", icon:"🔒" },
              { label:"Do the Work", desc:"Complete the project as agreed", icon:"⚡" },
              { label:"Mark Complete", desc:"Signal delivery on-chain", icon:"✓" },
              { label:"Get Paid", desc:"Client approves, ETH hits your wallet", icon:"◈" },
            ].map((f, i) => (
              <div key={i} style={s.flowRow}>
                <div style={s.flowIcon}>{f.icon}</div>
                <div>
                  <div style={s.flowLabel}>{f.label}</div>
                  <div style={s.flowDesc}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Contract info */}
          <div style={s.infoCard}>
            <div style={s.infoCardTitle}>CONTRACT INFO</div>
            <div style={s.contractRow}>
              <span style={s.contractLabel}>Network</span>
              <span style={s.contractValue}>Sepolia Testnet</span>
            </div>
            <div style={s.contractRow}>
              <span style={s.contractLabel}>Address</span>
              <span style={{...s.contractValue, color:"#8b5cf6", fontSize:11}}>0x90d7...73E7</span>
            </div>
            <div style={s.contractRow}>
              <span style={s.contractLabel}>You Receive</span>
              <span style={{...s.contractValue, color:"#22c55e"}}>99% of locked amount</span>
            </div>
            <a href="https://sepolia.etherscan.io/address/0x90d77334ac12007771Ae08b36B49a9E9e89673E7" target="_blank" rel="noreferrer" style={{...s.etherscanLink, color:"#8b5cf6"}}>
              View on Etherscan ↗
            </a>
          </div>

        </div>
      </div>
    </div>
  )
}

const s = {
  root: { minHeight:"100vh", background:"#0d0d1a", fontFamily:"'Space Grotesk',sans-serif", color:"#f1f5f9" },
  nav: { position:"sticky", top:0, zIndex:100, borderBottom:"1px solid rgba(139,92,246,0.1)", background:"rgba(13,13,26,0.95)", backdropFilter:"blur(12px)" },
  navInner: { maxWidth:1400, margin:"0 auto", padding:"14px 32px", display:"flex", alignItems:"center", justifyContent:"space-between" },
  logo: { fontFamily:"'IBM Plex Mono',monospace", color:"#8b5cf6", fontSize:16, fontWeight:600, letterSpacing:3, display:"flex", alignItems:"center", gap:8 },
  purpleDot: { width:6, height:6, borderRadius:"50%", background:"#8b5cf6", animation:"pulse 2s infinite", display:"inline-block" },
  navCenter: { flex:1, textAlign:"center" },
  navTag: { fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:"#475569", letterSpacing:2 },
  navRight: { display:"flex", alignItems:"center", gap:12 },
  walletPill: { display:"flex", alignItems:"center", gap:6, background:"rgba(139,92,246,0.1)", border:"1px solid rgba(139,92,246,0.2)", padding:"6px 12px", borderRadius:4, color:"#8b5cf6", fontFamily:"'IBM Plex Mono',monospace", fontSize:12 },
  backBtn: { background:"transparent", border:"1px solid rgba(255,255,255,0.1)", color:"#475569", padding:"6px 14px", borderRadius:4, fontFamily:"'IBM Plex Mono',monospace", fontSize:12, cursor:"pointer" },
  main: { maxWidth:1400, margin:"0 auto", padding:"32px", display:"grid", gridTemplateColumns:"1fr 380px", gap:24, position:"relative", zIndex:1 },
  leftPanel: { background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:12, overflow:"hidden" },
  panelHeader: { borderBottom:"1px solid rgba(255,255,255,0.06)", padding:"20px 24px 0" },
  panelTitle: { fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:"#475569", letterSpacing:2, marginBottom:16 },
  tabRow: { display:"flex", gap:4 },
  panelBody: { padding:24 },
  formSection: { display:"flex", flexDirection:"column", gap:12 },
  formLabel: { fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:"#475569", letterSpacing:1.5 },
  infoBox: { background:"rgba(59,130,246,0.05)", border:"1px solid rgba(59,130,246,0.1)", borderRadius:6, padding:"10px 14px", fontSize:12, color:"#64748b", display:"flex", gap:8 },
  jobCard: { background:"rgba(139,92,246,0.05)", border:"1px solid rgba(139,92,246,0.2)", borderRadius:8, padding:20, marginTop:8 },
  jobCardHeader: { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 },
  jobIdLabel: { fontFamily:"'IBM Plex Mono',monospace", fontSize:12, color:"#8b5cf6" },
  statusBadge: { padding:"3px 10px", borderRadius:4, fontSize:11, fontFamily:"'IBM Plex Mono',monospace" },
  jobDesc: { fontSize:15, fontWeight:500, color:"#f1f5f9", marginBottom:16, lineHeight:1.5 },
  divider: { height:1, background:"rgba(255,255,255,0.05)", margin:"12px 0" },
  jobRow: { display:"flex", justifyContent:"space-between", padding:"6px 0", alignItems:"center" },
  jobLabel: { fontSize:11, color:"#475569", fontFamily:"'IBM Plex Mono',monospace", letterSpacing:1 },
  jobValue: { fontSize:12, color:"#94a3b8", fontFamily:"'IBM Plex Mono',monospace" },
  actionInfo: { background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.05)", borderRadius:8, padding:16 },
  actionInfoTitle: { fontSize:15, fontWeight:600, color:"#f1f5f9", marginBottom:6 },
  actionInfoDesc: { fontSize:13, color:"#64748b", lineHeight:1.6 },
  rightPanel: { display:"flex", flexDirection:"column", gap:16 },
  statusCard: { background:"rgba(255,255,255,0.02)", border:"1px solid", borderRadius:8, padding:"14px 16px", display:"flex", alignItems:"flex-start", gap:10 },
  statusDot: { width:6, height:6, borderRadius:"50%", flexShrink:0, marginTop:4 },
  infoCard: { background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:8, padding:20 },
  infoCardTitle: { fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:"#475569", letterSpacing:2, marginBottom:16 },
  flowRow: { display:"flex", alignItems:"flex-start", gap:12, marginBottom:14 },
  flowIcon: { width:28, height:28, borderRadius:"50%", background:"rgba(139,92,246,0.1)", border:"1px solid rgba(139,92,246,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, flexShrink:0, color:"#8b5cf6" },
  flowLabel: { fontSize:13, fontWeight:500, color:"#f1f5f9" },
  flowDesc: { fontSize:11, color:"#475569", marginTop:2 },
  contractRow: { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:"1px solid rgba(255,255,255,0.04)" },
  contractLabel: { fontSize:12, color:"#475569" },
  contractValue: { fontSize:13, color:"#94a3b8", fontFamily:"'IBM Plex Mono',monospace" },
  etherscanLink: { display:"block", marginTop:12, fontSize:12, fontFamily:"'IBM Plex Mono',monospace", textDecoration:"none" },
}

export default FreelancerDashboard