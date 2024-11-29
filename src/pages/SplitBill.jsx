import { useState } from 'react'

export default function SplitBill() {
  const [amount, setAmount] = useState('')
  const [people, setPeople] = useState('')

  const calculateSplit = () => {
    const splitAmount = parseFloat(amount) / parseInt(people)
    return isNaN(splitAmount) ? '0' : splitAmount.toFixed(2)
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-6">Split a Bill</h2>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Total Amount</label>
          <input
            type="number"
            className="w-full border border-gray-300 rounded-lg p-2"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Number of People</label>
          <input
            type="number"
            className="w-full border border-gray-300 rounded-lg p-2"
            value={people}
            onChange={(e) => setPeople(e.target.value)}
            placeholder="Enter number of people"
          />
        </div>

        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <p className="text-center text-gray-600">Each person pays</p>
          <p className="text-center text-3xl font-bold">${calculateSplit()}</p>
        </div>

        <button className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
          Send Payment Requests
        </button>
      </div>
    </div>
  )
}
