import { useState } from "react"
import { getContract } from "../utils/contract"
import { ethers } from "ethers"

function ClientDashboard({ walletAddress, setPage }) {
  const [freelancerAddress, setFreelancerAddress] = useState("")
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [jobId, setJobId] = useState("")
  const [status, setStatus] = useState("")
  const [loading, setLoading] = useState(false)

  const createJob = async () => {
    try {
      setLoading(true)
      setStatus("Creating job...")
      const contract = await getContract()
      const tx = await contract.createJob(freelancerAddress, description)
      await tx.wait()
      setStatus("✅ Job created on blockchain!")
    } catch (err) {
      setStatus("❌ Error: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  const depositFunds = async () => {
    try {
      setLoading(true)
      setStatus("Depositing funds into escrow...")
      const contract = await getContract()
      const tx = await contract.depositFunds(jobId, {
        value: ethers.parseEther(amount)
      })
      await tx.wait()
      setStatus("✅ Funds locked in escrow!")
    } catch (err) {
      setStatus("❌ Error: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  const releasePayment = async () => {
    try {
      setLoading(true)
      setStatus("Releasing payment to freelancer...")
      const contract = await getContract()
      const tx = await contract.releasePayment(jobId)
      await tx.wait()
      setStatus("✅ Payment released to freelancer!")
    } catch (err) {
      setStatus("❌ Error: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  const raiseDispute = async () => {
    try {
      setLoading(true)
      setStatus("Raising dispute...")
      const contract = await getContract()
      const tx = await contract.raiseDispute(jobId)
      await tx.wait()
      setStatus("✅ Dispute raised!")
    } catch (err) {
      setStatus("❌ Error: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Client Dashboard</h2>
        <div style={styles.headerRight}>
          <p style={styles.wallet}>
            {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </p>
          <button style={styles.backBtn} onClick={() => setPage("landing")}>
            Back
          </button>
        </div>
      </div>

      <div style={styles.grid}>

        {/* Create Job */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Create New Job</h3>
          <input
            style={styles.input}
            placeholder="Freelancer wallet address"
            value={freelancerAddress}
            onChange={(e) => setFreelancerAddress(e.target.value)}
          />
          <input
            style={styles.input}
            placeholder="Job description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <button
            style={styles.primaryBtn}
            onClick={createJob}
            disabled={loading}
          >
            {loading ? "Processing..." : "Create Job"}
          </button>
        </div>

        {/* Deposit Funds */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Deposit Funds into Escrow</h3>
          <input
            style={styles.input}
            placeholder="Job ID"
            value={jobId}
            onChange={(e) => setJobId(e.target.value)}
          />
          <input
            style={styles.input}
            placeholder="Amount in ETH (e.g. 0.01)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <button
            style={styles.primaryBtn}
            onClick={depositFunds}
            disabled={loading}
          >
            {loading ? "Processing..." : "Lock Funds in Escrow"}
          </button>
        </div>

        {/* Release or Dispute */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Manage Job</h3>
          <input
            style={styles.input}
            placeholder="Job ID"
            value={jobId}
            onChange={(e) => setJobId(e.target.value)}
          />
          <button
            style={styles.successBtn}
            onClick={releasePayment}
            disabled={loading}
          >
            {loading ? "Processing..." : "✅ Release Payment"}
          </button>
          <button
            style={styles.dangerBtn}
            onClick={raiseDispute}
            disabled={loading}
          >
            {loading ? "Processing..." : "⚠️ Raise Dispute"}
          </button>
        </div>

      </div>

      {status && <p style={styles.status}>{status}</p>}

    </div>
  )
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "#0f0f0f",
    padding: "32px",
    color: "white",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "32px",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#3b82f6",
  },
  wallet: {
    color: "#888",
    fontSize: "14px",
  },
  backBtn: {
    background: "transparent",
    color: "#888",
    border: "1px solid #333",
    borderRadius: "8px",
    padding: "8px 16px",
    cursor: "pointer",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "24px",
  },
  card: {
    background: "#1a1a1a",
    border: "1px solid #333",
    borderRadius: "12px",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  cardTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: "8px",
  },
  input: {
    background: "#0f0f0f",
    border: "1px solid #333",
    borderRadius: "8px",
    padding: "12px",
    color: "white",
    fontSize: "14px",
    outline: "none",
  },
  primaryBtn: {
    background: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "12px",
    fontSize: "15px",
    cursor: "pointer",
    marginTop: "4px",
  },
  successBtn: {
    background: "#22c55e",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "12px",
    fontSize: "15px",
    cursor: "pointer",
  },
  dangerBtn: {
    background: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "12px",
    fontSize: "15px",
    cursor: "pointer",
  },
  status: {
    marginTop: "24px",
    padding: "16px",
    background: "#1a1a1a",
    border: "1px solid #333",
    borderRadius: "8px",
    color: "#22c55e",
    fontSize: "14px",
  },
}

export default ClientDashboard