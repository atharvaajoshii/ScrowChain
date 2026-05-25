import { useState } from "react"
import { getContract } from "../utils/contract"
import { ethers } from "ethers"

function ClientDashboard({ walletAddress, setPage }) {
  const [freelancerAddress, setFreelancerAddress] = useState("")
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [jobId, setJobId] = useState("")
  const [status, setStatus] = useState("")
  const [statusType, setStatusType] = useState("info")
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("create")

  const setMsg = (msg, type="info") => { setStatus(msg); setStatusType(type) }

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

  const depositFunds = async () => {
    try {
      setLoading(true); setMsg("Locking funds in escrow contract...", "info")
      const contract = await getContract()
      const tx = await contract.depositFunds(jobId, { value: ethers.parseEther(amount) })
      await tx.wait()
      setMsg(`✓ ${amount} ETH locked in escrow for Job #${jobId}`, "success")
    } catch (err) { setMsg("✗ " + err.message, "error") }
    finally { setLoading(false) }
  }

  const releasePayment = async () => {
    try {
      setLoading(true); setMsg("Releasing payment to freelancer...", "info")
      const contract = await getContract()
      const tx = await contract.releasePayment(jobId)
      await tx.wait()
      setMsg(`✓ Payment released for Job #${jobId}. Freelancer has been paid.`, "success")
    } catch (err) { setMsg("✗ " + err.message, "error") }
    finally { setLoading(false) }
  }

  const raiseDispute = async () => {
    try {
      setLoading(true); setMsg("Raising dispute on-chain...", "info")
      const contract = await getContract()
      const tx = await contract.raiseDispute(jobId)
      await tx.wait()
      setMsg(`✓ Dispute raised for Job #${jobId}. Admin will review.`, "success")
    } catch (err) { setMsg("✗ " + err.message, "error") }
    finally { setLoading(false) }
  }

  return (
    <div style={s.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; }
        .grid-bg { position:fixed; inset:0; z-index:0; background-image: linear-gradient(rgba(34,197,94,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.03) 1px, transparent 1px); background-size: 40px 40px; pointer-events:none; }
        input { background:rgba(255,255,255,0.03) !important; border:1px solid rgba(255,255,255,0.08) !important; color:#f1f5f9 !important; border-radius:6px !important; padding:12px 16px !important; font-size:14px !important; width:100% !important; outline:none !important; font-family:'IBM Plex Mono',monospace !important; transition:border-color 0.2s !important; }
        input:focus { border-color:rgba(34,197,94,0.4) !important; }
        input::placeholder { color:#334155 !important; }
        .tab-btn { background:transparent; border:none; padding:10px 20px; font-size:13px; cursor:pointer; font-family:'IBM Plex Mono',monospace; border-bottom:2px solid transparent; transition:all 0.2s; }
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
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes spin { to{transform:rotate(360deg)} }
      `}</style>

      <div className="grid-bg" />

      {/* NAV */}
      <nav style={s.nav}>
        <div style={s.navInner}>
          <div style={s.logo}>
            <span style={s.logoDot} />
            SCROWCHAIN
          </div>
          <div style={s.navCenter}>
            <span style={s.navTag}>CLIENT DASHBOARD</span>
          </div>
          <div style={s.navRight}>
            <div style={s.walletPill}>
              <span style={s.greenDot} />
              {walletAddress.slice(0,6)}...{walletAddress.slice(-4)}
            </div>
            <button style={s.backBtn} onClick={() => setPage("landing")}>← Exit</button>
          </div>
        </div>
      </nav>

      <div style={s.main}>

        {/* LEFT PANEL — tabs */}
        <div style={s.leftPanel}>
          <div style={s.panelHeader}>
            <div style={s.panelTitle}>Manage Escrow</div>
            <div style={s.tabRow}>
              {["create","deposit","manage"].map(tab => (
                <button key={tab} className={`tab-btn ${activeTab===tab?'active':''}`} onClick={() => setActiveTab(tab)}>
                  {tab==="create" ? "Create Job" : tab==="deposit" ? "Fund Escrow" : "Manage Job"}
                </button>
              ))}
            </div>
          </div>

          <div style={s.panelBody}>
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

            {activeTab === "deposit" && (
              <div style={s.formSection}>
                <div style={s.formLabel}>JOB ID</div>
                <input placeholder="e.g. 1" value={jobId} onChange={e => setJobId(e.target.value)} />
                <div style={{...s.formLabel, marginTop:16}}>AMOUNT (ETH)</div>
                <input placeholder="e.g. 0.05" value={amount} onChange={e => setAmount(e.target.value)} />
                <div style={s.infoBox}>
                  <span style={s.infoIcon}>🔒</span> Funds will be locked in the smart contract. Only released when you approve work.
                </div>
                <button className="action-btn primary" onClick={depositFunds} disabled={loading || !jobId || !amount}>
                  {loading ? "Locking funds..." : "Lock Funds in Escrow →"}
                </button>
              </div>
            )}

            {activeTab === "manage" && (
              <div style={s.formSection}>
                <div style={s.formLabel}>JOB ID</div>
                <input placeholder="e.g. 1" value={jobId} onChange={e => setJobId(e.target.value)} />
                <div style={s.infoBox}>
                  <span style={s.infoIcon}>⚡</span> Only release payment after verifying the freelancer's work is complete.
                </div>
                <button className="action-btn primary" style={{marginBottom:12}} onClick={releasePayment} disabled={loading || !jobId}>
                  {loading ? "Processing..." : "✓ Approve & Release Payment"}
                </button>
                <button className="action-btn danger" onClick={raiseDispute} disabled={loading || !jobId}>
                  {loading ? "Processing..." : "⚠ Raise Dispute"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL — status + info */}
        <div style={s.rightPanel}>

          {/* Status */}
          {status && (
            <div style={{...s.statusCard, borderColor: statusType==="success" ? "rgba(34,197,94,0.3)" : statusType==="error" ? "rgba(239,68,68,0.3)" : "rgba(59,130,246,0.3)"}}>
              <div style={{...s.statusDot, background: statusType==="success" ? "#22c55e" : statusType==="error" ? "#ef4444" : "#3b82f6"}} />
              <span style={{color: statusType==="success" ? "#22c55e" : statusType==="error" ? "#ef4444" : "#94a3b8", fontFamily:"'IBM Plex Mono',monospace", fontSize:13}}>
                {status}
              </span>
            </div>
          )}

          {/* Flow diagram */}
          <div style={s.infoCard}>
            <div style={s.infoCardTitle}>ESCROW FLOW</div>
            {[
              { step:"1", label:"Create Job", desc:"Register job on-chain", done:true },
              { step:"2", label:"Deposit Funds", desc:"Lock ETH in contract", done:false },
              { step:"3", label:"Work Done", desc:"Freelancer marks complete", done:false },
              { step:"4", label:"Release Payment", desc:"Approve & pay freelancer", done:false },
            ].map((f, i) => (
              <div key={i} style={s.flowRow}>
                <div style={{...s.flowDot, background: f.done ? "#22c55e" : "rgba(255,255,255,0.1)", border: f.done ? "none" : "1px solid rgba(255,255,255,0.1)"}}>
                  {f.done ? "✓" : f.step}
                </div>
                <div>
                  <div style={s.flowLabel}>{f.label}</div>
                  <div style={s.flowDesc}>{f.desc}</div>
                </div>
                {i < 3 && <div style={s.flowLine} />}
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
              <span style={{...s.contractValue, color:"#22c55e", fontSize:11}}>0x90d7...73E7</span>
            </div>
            <div style={s.contractRow}>
              <span style={s.contractLabel}>Platform Fee</span>
              <span style={s.contractValue}>1%</span>
            </div>
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
  root: { minHeight:"100vh", background:"#071c1f", fontFamily:"'Space Grotesk',sans-serif", color:"#f1f5f9" },
  nav: { position:"sticky", top:0, zIndex:100, borderBottom:"1px solid rgba(34,197,94,0.1)", background:"rgba(7,28,31,0.95)", backdropFilter:"blur(12px)" },
  navInner: { maxWidth:1400, margin:"0 auto", padding:"14px 32px", display:"flex", alignItems:"center", justifyContent:"space-between" },
  logo: { fontFamily:"'IBM Plex Mono',monospace", color:"#22c55e", fontSize:16, fontWeight:600, letterSpacing:3, display:"flex", alignItems:"center", gap:8 },
  logoDot: { width:6, height:6, borderRadius:"50%", background:"#22c55e", animation:"pulse 2s infinite" },
  navCenter: { flex:1, textAlign:"center" },
  navTag: { fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:"#475569", letterSpacing:2 },
  navRight: { display:"flex", alignItems:"center", gap:12 },
  walletPill: { display:"flex", alignItems:"center", gap:6, background:"rgba(34,197,94,0.1)", border:"1px solid rgba(34,197,94,0.2)", padding:"6px 12px", borderRadius:4, color:"#22c55e", fontFamily:"'IBM Plex Mono',monospace", fontSize:12 },
  greenDot: { width:5, height:5, borderRadius:"50%", background:"#22c55e" },
  backBtn: { background:"transparent", border:"1px solid rgba(255,255,255,0.1)", color:"#475569", padding:"6px 14px", borderRadius:4, fontFamily:"'IBM Plex Mono',monospace", fontSize:12, cursor:"pointer" },
  main: { maxWidth:1400, margin:"0 auto", padding:"32px", display:"grid", gridTemplateColumns:"1fr 380px", gap:24, position:"relative", zIndex:1 },
  leftPanel: { background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:12, overflow:"hidden" },
  panelHeader: { borderBottom:"1px solid rgba(255,255,255,0.06)", padding:"20px 24px 0" },
  panelTitle: { fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:"#475569", letterSpacing:2, marginBottom:16 },
  tabRow: { display:"flex", gap:4 },
  panelBody: { padding:24 },
  formSection: { display:"flex", flexDirection:"column", gap:8 },
  formLabel: { fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:"#475569", letterSpacing:1.5 },
  infoBox: { background:"rgba(59,130,246,0.05)", border:"1px solid rgba(59,130,246,0.1)", borderRadius:6, padding:"10px 14px", fontSize:12, color:"#64748b", display:"flex", alignItems:"flex-start", gap:8, margin:"8px 0" },
  infoIcon: { fontSize:14, flexShrink:0, marginTop:1 },
  rightPanel: { display:"flex", flexDirection:"column", gap:16 },
  statusCard: { background:"rgba(255,255,255,0.02)", border:"1px solid", borderRadius:8, padding:"14px 16px", display:"flex", alignItems:"flex-start", gap:10 },
  statusDot: { width:6, height:6, borderRadius:"50%", flexShrink:0, marginTop:4 },
  infoCard: { background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:8, padding:20 },
  infoCardTitle: { fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:"#475569", letterSpacing:2, marginBottom:16 },
  flowRow: { display:"flex", alignItems:"flex-start", gap:12, marginBottom:16, position:"relative" },
  flowDot: { width:28, height:28, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontFamily:"'IBM Plex Mono',monospace", color:"#071c1f", flexShrink:0, fontWeight:600 },
  flowLabel: { fontSize:13, fontWeight:600, color:"#f1f5f9" },
  flowDesc: { fontSize:11, color:"#475569", marginTop:2 },
  flowLine: { position:"absolute", left:13, top:28, width:1, height:16, background:"rgba(255,255,255,0.05)" },
  contractRow: { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:"1px solid rgba(255,255,255,0.04)" },
  contractLabel: { fontSize:12, color:"#475569" },
  contractValue: { fontSize:13, color:"#94a3b8", fontFamily:"'IBM Plex Mono',monospace" },
  etherscanLink: { display:"block", marginTop:12, color:"#22c55e", fontSize:12, fontFamily:"'IBM Plex Mono',monospace", textDecoration:"none" },
}

export default ClientDashboard