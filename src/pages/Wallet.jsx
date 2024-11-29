import { useState, useEffect } from 'react'
import { ethers } from 'ethers'

export default function Wallet() {
  const [balance, setBalance] = useState('0')
  const [wallet, setWallet] = useState(null)

  useEffect(() => {
    const initWallet = async () => {
      const newWallet = ethers.Wallet.createRandom()
      setWallet(newWallet)
    }
    initWallet()
  }, [])

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Your Wallet</h2>
        <div className="bg-blue-500 text-white p-4 rounded-lg mb-4">
          <p className="text-sm">Balance</p>
          <p className="text-2xl font-bold">${balance}</p>
        </div>
        
        <div className="flex space-x-4 mb-4">
          <button className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">
            Add Money
          </button>
          <button className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
            Send Money
          </button>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">Wallet Address</p>
          <p className="text-xs break-all">{wallet?.address}</p>
        </div>
      </div>
    </div>
  )
}
