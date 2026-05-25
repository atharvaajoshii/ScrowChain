import { connectWallet } from "../utils/contract"

function Landing({ setPage, walletAddress, setWalletAddress }) {

  const handleConnect = async () => {
    const address = await connectWallet()
    if (address) {
      setWalletAddress(address)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>SCROWCHAIN</h1>
        <p style={styles.subtitle}>
          Blockchain-powered escrow for secure cross-border freelance payments
        </p>

        {!walletAddress ? (
          <button style={styles.connectBtn} onClick={handleConnect}>
            Connect Wallet
          </button>
        ) : (
          <div>
            <p style={styles.connected}>
              ✅ Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </p>
            <div style={styles.roleContainer}>
              <button
                style={styles.clientBtn}
                onClick={() => setPage("client")}
              >
                I am a Client
              </button>
              <button
                style={styles.freelancerBtn}
                onClick={() => setPage("freelancer")}
              >
                I am a Freelancer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "#0f0f0f",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    background: "#1a1a1a",
    border: "1px solid #333",
    borderRadius: "16px",
    padding: "48px",
    maxWidth: "480px",
    width: "100%",
    textAlign: "center",
  },
  title: {
    color: "#ffffff",
    fontSize: "42px",
    fontWeight: "700",
    letterSpacing: "4px",
    marginBottom: "12px",
  },
  subtitle: {
    color: "#888",
    fontSize: "16px",
    lineHeight: "1.6",
    marginBottom: "36px",
  },
  connectBtn: {
    background: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "14px 32px",
    fontSize: "16px",
    cursor: "pointer",
    width: "100%",
  },
  connected: {
    color: "#22c55e",
    fontSize: "14px",
    marginBottom: "24px",
  },
  roleContainer: {
    display: "flex",
    gap: "16px",
  },
  clientBtn: {
    flex: 1,
    background: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "14px",
    fontSize: "15px",
    cursor: "pointer",
  },
  freelancerBtn: {
    flex: 1,
    background: "#8b5cf6",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "14px",
    fontSize: "15px",
    cursor: "pointer",
  },
}

export default Landing