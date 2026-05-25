import { ethers } from "ethers"
import ABI from "./abi.json"

const CONTRACT_ADDRESS = "0x90d77334ac12007771Ae08b36B49a9E9e89673E7"

export const getContract = async () => {
  if (!window.ethereum) {
    alert("Please install MetaMask")
    return null
  }
  const provider = new ethers.BrowserProvider(window.ethereum)
  const signer = await provider.getSigner()
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer)
  return contract
}

export const connectWallet = async () => {
  if (!window.ethereum) {
    alert("Please install MetaMask")
    return null
  }
  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts"
  })
  return accounts[0]
}