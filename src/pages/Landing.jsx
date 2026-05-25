import { useState, useEffect } from "react"
import { connectWallet } from "../utils/contract"

function Landing({ setPage, walletAddress, setWalletAddress }) {
  const [connecting, setConnecting] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [txFeed] = useState([
    { hash: "0x3f9a...2c1e", type: "Escrow Created", amount: "0.5 ETH", status: "active" },
    { hash: "0x7b2d...9f3a", type: "Payment Released", amount: "1.2 ETH", status: "settled" },
    { hash: "0x1e8c...4d7b", type: "Funds Locked", amount: "0.3 ETH", status: "pending" },
    { hash: "0x9a4f...8e2c", type: "Escrow Created", amount: "2.0 ETH", status: "active" },
  ])

  const handleConnect = async () => {
    setConnecting(true)
    const address = await connectWallet()
    if (address) setWalletAddress(address)
    setConnecting(false)
  }

  return (
    <div style={s.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; }
        body { background:#071c1f; }
        .grid-bg {
          position:fixed; inset:0; z-index:0;
          background-image: linear-gradient(rgba(34,197,94,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34,197,94,0.03) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events:none;
        }
        .nav-link { color:#94a3b8; text-decoration:none; font-size:14px; font-family:'IBM Plex Mono',monospace; transition:color 0.2s; position:relative; padding-bottom:2px; }
        .nav-link::after { content:''; position:absolute; bottom:0; left:0; width:0; height:1px; background:#22c55e; transition:width 0.3s; }
        .nav-link:hover { color:#22c55e; }
        .nav-link:hover::after { width:100%; }
        .step-card:hover { border-color:#22c55e !important; transform:translateY(-4px); }
        .step-card { transition: all 0.3s; }
        .feature-card:hover { background:rgba(34,197,94,0.05) !important; border-color:rgba(34,197,94,0.3) !important; }
        .feature-card { transition: all 0.3s; }
        .tx-row:hover { background:rgba(34,197,94,0.05); }
        .tx-row { transition:background 0.2s; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation: fadeUp 0.7s ease forwards; }
        .fade-up-2 { animation: fadeUp 0.7s 0.15s ease forwards; opacity:0; }
        .fade-up-3 { animation: fadeUp 0.7s 0.3s ease forwards; opacity:0; }
      `}</style>

      <div className="grid-bg" />

      {/* NAV */}
      <nav style={s.nav}>
        <div style={s.navInner}>
          <div style={s.logo}>
            <span style={s.logoDot} />
            SCROWCHAIN
          </div>
          <div style={s.navLinks}>
            <a href="#how" className="nav-link">How it works</a>
            <a href="#features" className="nav-link">Features</a>
            <a href="#txfeed" className="nav-link">Live Feed</a>
          </div>
          {!walletAddress ? (
            <button style={s.connectBtn} onClick={handleConnect} disabled={connecting}>
              {connecting ? "Connecting..." : "Connect Wallet"}
            </button>
          ) : (
            <div style={s.connectedPill}>
              <span style={s.greenDot} />
              {walletAddress.slice(0,6)}...{walletAddress.slice(-4)}
            </div>
          )}
        </div>
      </nav>

      {/* HERO */}
      <section style={s.hero}>
        <div style={s.heroInner}>
          <div style={s.heroBadge} className="fade-up">
            <span style={s.greenDot} /> Live on Sepolia Testnet
          </div>
          <h1 style={s.heroTitle} className="fade-up-2">
            Trustless Payments<br />
            <span style={s.heroAccent}>for the Global Gig Economy</span>
          </h1>
          <p style={s.heroSub} className="fade-up-3">
            Smart contract escrow that locks funds, verifies work, and releases payment — automatically. No banks. No disputes. No middlemen.
          </p>

          {walletAddress ? (
            <div style={s.roleRow} className="fade-up-3">
              <button style={s.clientBtn} onClick={() => setPage("client")}>
                <span style={s.btnIcon}>◈</span> I'm a Client
              </button>
              <button style={s.freelancerBtn} onClick={() => setPage("freelancer")}>
                <span style={s.btnIcon}>◇</span> I'm a Freelancer
              </button>
            </div>
          ) : (
            <button style={s.heroBtn} onClick={handleConnect} className="fade-up-3">
              {connecting ? "Connecting..." : "Launch App →"}
            </button>
          )}

          {/* Escrow card */}
          <div style={s.escrowCard}>
            <div style={s.escrowHeader}>
              <span style={s.escrowLabel}>LIVE ESCROW</span>
              <span style={{...s.badge, background:'rgba(34,197,94,0.15)', color:'#22c55e'}}>● ACTIVE</span>
            </div>
            <div style={s.escrowAmount}>0.50 ETH</div>
            <div style={s.escrowParties}>
              <div style={s.partyBox}>
                <div style={s.partyLabel}>CLIENT</div>
                <div style={s.partyAddr}>0x3f9a...2c1e</div>
              </div>
              <div style={s.arrow}>→</div>
              <div style={s.partyBox}>
                <div style={s.partyLabel}>FREELANCER</div>
                <div style={s.partyAddr}>0x7b2d...9f3a</div>
              </div>
            </div>
            <div style={s.progressBar}>
              <div style={s.progressFill} />
            </div>
            <div style={s.escrowStatus}>Awaiting work completion · Logo Design Project</div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <div style={s.statsBar}>
        {[
          { label: "Total Value Locked", value: "$2.4B" },
          { label: "Escrows Created", value: "148K+" },
          { label: "Uptime", value: "99.9%" },
          { label: "Security Breaches", value: "Zero" },
        ].map((s2, i) => (
          <div key={i} style={s.statItem}>
            <div style={s.statValue}>{s2.value}</div>
            <div style={s.statLabel}>{s2.label}</div>
          </div>
        ))}
      </div>

      {/* HOW IT WORKS */}
      <section id="how" style={s.section}>
        <div style={s.sectionInner}>
          <div style={s.sectionTag}>// HOW IT WORKS</div>
          <h2 style={s.sectionTitle}>Four steps to trustless payment</h2>
          <div style={s.stepsGrid}>
            {[
              { n:"01", title:"Client Creates Job", desc:"Client registers the job on-chain with freelancer's wallet address and job description." },
              { n:"02", title:"Funds Locked in Escrow", desc:"Client deposits ETH into the smart contract. Funds are cryptographically locked — nobody can touch them." },
              { n:"03", title:"Work Delivered", desc:"Freelancer completes the work and marks it done on-chain. Status updates publicly." },
              { n:"04", title:"Payment Released", desc:"Client approves. Contract automatically sends 99% to freelancer, 1% platform fee. Done." },
            ].map((step, i) => (
              <div key={i} style={s.stepCard} className="step-card">
                <div style={s.stepNum}>{step.n}</div>
                <div style={s.stepTitle}>{step.title}</div>
                <div style={s.stepDesc}>{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={s.section}>
        <div style={s.sectionInner}>
          <div style={s.sectionTag}>// FEATURES</div>
          <h2 style={s.sectionTitle}>Built for global freelancers</h2>
          <div style={s.featuresGrid}>
            {[
              { icon:"⬡", title:"Smart Contract Escrow", desc:"Funds locked in immutable Solidity contract. No human can interfere." },
              { icon:"⬢", title:"Dispute Resolution", desc:"Either party can raise a dispute. Platform admin resolves and issues refund if needed." },
              { icon:"◈", title:"Full Transparency", desc:"Every transaction public on Etherscan. Anyone can verify the contract." },
              { icon:"◇", title:"Cross-border Payments", desc:"ETH transfers globally in seconds. No SWIFT, no delays, no hidden fees." },
              { icon:"⬟", title:"1% Platform Fee", desc:"Only 1% fee deducted on release. Freelancers keep 99% of their earnings." },
              { icon:"◉", title:"No Bank Required", desc:"Only needs a crypto wallet. Works for 1.5B unbanked freelancers worldwide." },
            ].map((f, i) => (
              <div key={i} style={s.featureCard} className="feature-card">
                <div style={s.featureIcon}>{f.icon}</div>
                <div style={s.featureTitle}>{f.title}</div>
                <div style={s.featureDesc}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LIVE TX FEED */}
      <section id="txfeed" style={s.section}>
        <div style={s.sectionInner}>
          <div style={s.sectionTag}>// LIVE TRANSACTION FEED</div>
          <h2 style={s.sectionTitle}>Real-time blockchain activity</h2>
          <div style={s.txTable}>
            <div style={s.txHead}>
              <span>TX HASH</span><span>TYPE</span><span>AMOUNT</span><span>STATUS</span>
            </div>
            {txFeed.map((tx, i) => (
              <div key={i} style={s.txRow} className="tx-row">
                <span style={s.txHash}>{tx.hash}</span>
                <span style={s.txType}>{tx.type}</span>
                <span style={s.txAmount}>{tx.amount}</span>
                <span style={{
                  ...s.badge,
                  background: tx.status==='active' ? 'rgba(34,197,94,0.15)' : tx.status==='pending' ? 'rgba(234,179,8,0.15)' : 'rgba(148,163,184,0.15)',
                  color: tx.status==='active' ? '#22c55e' : tx.status==='pending' ? '#eab308' : '#94a3b8'
                }}>● {tx.status.toUpperCase()}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={s.ctaSection}>
        <div style={s.ctaInner}>
          <div style={s.sectionTag}>// GET STARTED</div>
          <h2 style={s.ctaTitle}>Ready to get paid without trust issues?</h2>
          <p style={s.ctaSub}>Connect your wallet and create your first escrow in under 2 minutes.</p>
          {!walletAddress ? (
            <button style={s.heroBtn} onClick={handleConnect}>
              {connecting ? "Connecting..." : "Connect Wallet →"}
            </button>
          ) : (
            <div style={s.roleRow}>
              <button style={s.clientBtn} onClick={() => setPage("client")}>◈ I'm a Client</button>
              <button style={s.freelancerBtn} onClick={() => setPage("freelancer")}>◇ I'm a Freelancer</button>
            </div>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={s.footer}>
        <div style={s.logo}><span style={s.logoDot}/>SCROWCHAIN</div>
        <div style={s.footerSub}>Team Dracarys · NMAMIT · Problem ID: SH-FIN-04</div>
        <div style={s.footerAddr}>Contract: 0x90d77334ac12007771Ae08b36B49a9E9e89673E7 · Sepolia Testnet</div>
      </footer>
    </div>
  )
}

const s = {
  root: { minHeight:"100vh", background:"#071c1f", fontFamily:"'Space Grotesk',sans-serif", position:"relative" },
  nav: { position:"fixed", top:0, left:0, right:0, zIndex:100, borderBottom:"1px solid rgba(34,197,94,0.1)", background:"rgba(7,28,31,0.9)", backdropFilter:"blur(12px)" },
  navInner: { maxWidth:1200, margin:"0 auto", padding:"16px 32px", display:"flex", alignItems:"center", justifyContent:"space-between" },
  logo: { fontFamily:"'IBM Plex Mono',monospace", color:"#22c55e", fontSize:18, fontWeight:600, letterSpacing:3, display:"flex", alignItems:"center", gap:10 },
  logoDot: { width:8, height:8, borderRadius:"50%", background:"#22c55e", display:"inline-block", animation:"pulse 2s infinite" },
  navLinks: { display:"flex", gap:32 },
  connectBtn: { background:"transparent", border:"1px solid #22c55e", color:"#22c55e", padding:"8px 20px", borderRadius:4, fontFamily:"'IBM Plex Mono',monospace", fontSize:13, cursor:"pointer" },
  connectedPill: { display:"flex", alignItems:"center", gap:8, background:"rgba(34,197,94,0.1)", border:"1px solid rgba(34,197,94,0.2)", padding:"6px 14px", borderRadius:4, color:"#22c55e", fontFamily:"'IBM Plex Mono',monospace", fontSize:13 },
  greenDot: { width:6, height:6, borderRadius:"50%", background:"#22c55e", display:"inline-block" },
  hero: { paddingTop:120, paddingBottom:80, position:"relative", zIndex:1 },
  heroInner: { maxWidth:1200, margin:"0 auto", padding:"0 32px" },
  heroBadge: { display:"inline-flex", alignItems:"center", gap:8, background:"rgba(34,197,94,0.1)", border:"1px solid rgba(34,197,94,0.2)", color:"#22c55e", padding:"6px 14px", borderRadius:4, fontFamily:"'IBM Plex Mono',monospace", fontSize:12, marginBottom:24 },
  heroTitle: { fontSize:64, fontWeight:700, color:"#f1f5f9", lineHeight:1.1, marginBottom:24, maxWidth:700 },
  heroAccent: { color:"#22c55e" },
  heroSub: { fontSize:18, color:"#94a3b8", lineHeight:1.7, maxWidth:560, marginBottom:40 },
  heroBtn: { background:"#22c55e", color:"#071c1f", border:"none", padding:"14px 32px", borderRadius:4, fontSize:16, fontWeight:600, cursor:"pointer", fontFamily:"'IBM Plex Mono',monospace" },
  roleRow: { display:"flex", gap:16, marginBottom:40 },
  clientBtn: { background:"#22c55e", color:"#071c1f", border:"none", padding:"14px 28px", borderRadius:4, fontSize:15, fontWeight:600, cursor:"pointer", fontFamily:"'IBM Plex Mono',monospace" },
  freelancerBtn: { background:"transparent", color:"#22c55e", border:"1px solid #22c55e", padding:"14px 28px", borderRadius:4, fontSize:15, fontWeight:600, cursor:"pointer", fontFamily:"'IBM Plex Mono',monospace" },
  btnIcon: { marginRight:8 },
  escrowCard: { marginTop:48, background:"rgba(255,255,255,0.03)", border:"1px solid rgba(34,197,94,0.2)", borderRadius:12, padding:28, maxWidth:480, backdropFilter:"blur(8px)" },
  escrowHeader: { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 },
  escrowLabel: { fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:"#94a3b8", letterSpacing:2 },
  badge: { padding:"3px 10px", borderRadius:4, fontSize:11, fontFamily:"'IBM Plex Mono',monospace", fontWeight:500 },
  escrowAmount: { fontSize:36, fontWeight:700, color:"#f1f5f9", marginBottom:20 },
  escrowParties: { display:"flex", alignItems:"center", gap:12, marginBottom:20 },
  partyBox: { flex:1, background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.05)", borderRadius:6, padding:"10px 14px" },
  partyLabel: { fontSize:10, color:"#94a3b8", fontFamily:"'IBM Plex Mono',monospace", letterSpacing:1, marginBottom:4 },
  partyAddr: { fontSize:13, color:"#22c55e", fontFamily:"'IBM Plex Mono',monospace" },
  arrow: { color:"#94a3b8", fontSize:18 },
  progressBar: { height:3, background:"rgba(255,255,255,0.05)", borderRadius:2, marginBottom:12 },
  progressFill: { height:"100%", width:"60%", background:"linear-gradient(90deg,#22c55e,#16a34a)", borderRadius:2 },
  escrowStatus: { fontSize:12, color:"#64748b", fontFamily:"'IBM Plex Mono',monospace" },
  statsBar: { background:"rgba(34,197,94,0.05)", borderTop:"1px solid rgba(34,197,94,0.1)", borderBottom:"1px solid rgba(34,197,94,0.1)", padding:"24px 32px", display:"flex", justifyContent:"center", gap:80, position:"relative", zIndex:1 },
  statItem: { textAlign:"center" },
  statValue: { fontSize:28, fontWeight:700, color:"#22c55e", fontFamily:"'IBM Plex Mono',monospace" },
  statLabel: { fontSize:12, color:"#64748b", marginTop:4 },
  section: { padding:"80px 0", position:"relative", zIndex:1 },
  sectionInner: { maxWidth:1200, margin:"0 auto", padding:"0 32px" },
  sectionTag: { fontFamily:"'IBM Plex Mono',monospace", fontSize:12, color:"#22c55e", letterSpacing:2, marginBottom:16 },
  sectionTitle: { fontSize:36, fontWeight:700, color:"#f1f5f9", marginBottom:48 },
  stepsGrid: { display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))", gap:24 },
  stepCard: { background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.05)", borderRadius:8, padding:28 },
  stepNum: { fontFamily:"'IBM Plex Mono',monospace", fontSize:36, fontWeight:600, color:"rgba(34,197,94,0.3)", marginBottom:16 },
  stepTitle: { fontSize:18, fontWeight:600, color:"#f1f5f9", marginBottom:10 },
  stepDesc: { fontSize:14, color:"#64748b", lineHeight:1.6 },
  featuresGrid: { display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:20 },
  featureCard: { background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.05)", borderRadius:8, padding:24 },
  featureIcon: { fontSize:24, color:"#22c55e", marginBottom:14 },
  featureTitle: { fontSize:16, fontWeight:600, color:"#f1f5f9", marginBottom:8 },
  featureDesc: { fontSize:13, color:"#64748b", lineHeight:1.6 },
  txTable: { background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.05)", borderRadius:8, overflow:"hidden" },
  txHead: { display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", padding:"12px 20px", background:"rgba(34,197,94,0.05)", borderBottom:"1px solid rgba(255,255,255,0.05)", fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:"#64748b", letterSpacing:1 },
  txRow: { display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", padding:"14px 20px", borderBottom:"1px solid rgba(255,255,255,0.03)", cursor:"default" },
  txHash: { fontFamily:"'IBM Plex Mono',monospace", fontSize:13, color:"#22c55e" },
  txType: { fontSize:13, color:"#94a3b8" },
  txAmount: { fontFamily:"'IBM Plex Mono',monospace", fontSize:13, color:"#f1f5f9" },
  ctaSection: { padding:"80px 0", borderTop:"1px solid rgba(34,197,94,0.1)", position:"relative", zIndex:1 },
  ctaInner: { maxWidth:1200, margin:"0 auto", padding:"0 32px" },
  ctaTitle: { fontSize:42, fontWeight:700, color:"#f1f5f9", marginBottom:16, maxWidth:600 },
  ctaSub: { fontSize:16, color:"#64748b", marginBottom:36 },
  footer: { padding:"32px", borderTop:"1px solid rgba(255,255,255,0.05)", textAlign:"center", position:"relative", zIndex:1 },
  footerSub: { fontSize:13, color:"#475569", marginTop:8 },
  footerAddr: { fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:"#334155", marginTop:6 },
}

export default Landing