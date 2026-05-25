import { useState } from "react"
import Landing from "./pages/Landing"
import ClientDashboard from "./pages/ClientDashboard"
import FreelancerDashboard from "./pages/FreelancerDashboard"

function App() {
  const [page, setPage] = useState("landing")
  const [walletAddress, setWalletAddress] = useState(null)

  return (
    <div>
      {page === "landing" && (
        <Landing
          setPage={setPage}
          walletAddress={walletAddress}
          setWalletAddress={setWalletAddress}
        />
      )}
      {page === "client" && (
        <ClientDashboard
          walletAddress={walletAddress}
          setPage={setPage}
        />
      )}
      {page === "freelancer" && (
        <FreelancerDashboard
          walletAddress={walletAddress}
          setPage={setPage}
        />
      )}
    </div>
  )
}

export default App