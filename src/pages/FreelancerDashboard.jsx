import { useState } from "react"
import { getContract } from "../utils/contract"

function FreelancerDashboard({ walletAddress, setPage }) {
  const [jobId, setJobId] = useState("")
  const [status, setStatus] = useState("")
  const [jobDetails, setJobDetails] = useState(null)
  const [loading, setLoading] = useState(false)

  const getJobDetails = async () => {
    try {
      setLoading(true)
      setStatus("Fetching job details...")
      const contract = await getContract()
      const job = await contract.getJob(jobId)
      setJobDetails({
        jobId: job[0].toString(),
        client: job[1],
        freelancer: job[2],
        amount: job[3].toString(),
        description: job[4],
        status: ["OPEN","FUNDED","COMPLETED","RELEASED","DISPUTED","REFUNDED"][job[5]],
        createdAt: new Date(Number(job[6]) * 1000).toLocaleString()
      })
      setStatus("")
    } catch (err) {
      setStatus("❌ Error: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  const markComplete = async () => {
    try {
      setLoading(true)
      setStatus("Marking work as complete...")
      const contract = await getContract()
      const tx = await contract.markWorkComplete(jobId)
      await tx.wait()
      setStatus("✅ Work marked complete! Waiting for client to release payment.")
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
      setStatus("✅ Dispute raised successfully.")
    } catch (err) {
      setStatus("❌ Error: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Freelancer Dashboard</h2>
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

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Check Job Details</h3>
          <input
            style={styles.input}
            placeholder="Enter Job ID"
            value={jobId}
            onChange={(e) => setJobId(e.target.value)}
          />
          <button style={styles.primaryBtn} onClick={getJobDetails} disabled={loading}>
            {loading ? "Loading..." : "Get Job Details"}
          </button>
          {jobDetails && (
            <div style={styles.details}>
              <p><span style={styles.label}>Job ID:</span> {jobDetails.jobId}</p>
              <p><span style={styles.label}>Client:</span> {jobDetails.client.slice(0,6)}...{jobDetails.client.slice(-4)}</p>
              <p><span style={styles.label}>Amount:</span> {jobDetails.amount} wei</p>
              <p><span style={styles.label}>Description:</span> {jobDetails.description}</p>
              <p><span style={styles.label}>Status:</span> <span style={styles.statusBadge}>{jobDetails.status}</span></p>
              <p><span style={styles.label}>Created:</span> {jobDetails.createdAt}</p>
            </div>
          )}
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Update Job Status</h3>
          <input
            style={styles.input}
            placeholder="Enter Job ID"
            value={jobId}
            onChange={(e) => setJobId(e.target.value)}
          />
          <button style={styles.successBtn} onClick={markComplete} disabled={loading}>
            {loading ? "Processing..." : "✅ Mark Work Complete"}
          </button>
          <button style={styles.dangerBtn} onClick={raiseDispute} disabled={loading}>
            {loading ? "Processing..." : "⚠️ Raise Dispute"}
          </button>
        </div>

      </div>

      {status && <p style={styles.status}>{status}</p>}
    </div>
  )
}

const styles = {
  container: { minHeight: "100vh", background: "#0f0f0f", padding: "32px", color: "white" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" },
  headerRight: { display: "flex", alignItems: "center", gap: "16px" },
  title: { fontSize: "28px", fontWeight: "700", color: "#8b5cf6" },
  wallet: { color: "#888", fontSize: "14px" },
  backBtn: { background: "transparent", color: "#888", border: "1px solid #333", borderRadius: "8px", padding: "8px 16px", cursor: "pointer" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" },
  card: { background: "#1a1a1a", border: "1px solid #333", borderRadius: "12px", padding: "24px", display: "flex", flexDirection: "column", gap: "12px" },
  cardTitle: { fontSize: "18px", fontWeight: "600", color: "#ffffff", marginBottom: "8px" },
  input: { background: "#0f0f0f", border: "1px solid #333", borderRadius: "8px", padding: "12px", color: "white", fontSize: "14px", outline: "none" },
  primaryBtn: { background: "#3b82f6", color: "white", border: "none", borderRadius: "8px", padding: "12px", fontSize: "15px", cursor: "pointer" },
  successBtn: { background: "#22c55e", color: "white", border: "none", borderRadius: "8px", padding: "12px", fontSize: "15px", cursor: "pointer" },
  dangerBtn: { background: "#ef4444", color: "white", border: "none", borderRadius: "8px", padding: "12px", fontSize: "15px", cursor: "pointer" },
  details: { background: "#0f0f0f", borderRadius: "8px", padding: "16px", display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px" },
  label: { color: "#888", marginRight: "8px" },
  statusBadge: { background: "#22c55e", color: "white", padding: "2px 8px", borderRadius: "4px", fontSize: "12px" },
  status: { marginTop: "24px", padding: "16px", background: "#1a1a1a", border: "1px solid #333", borderRadius: "8px", color: "#22c55e", fontSize: "14px" },
}

export default FreelancerDashboard