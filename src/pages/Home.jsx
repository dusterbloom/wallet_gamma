import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold mb-4">Welcome to PaySplit</h1>
        <p className="text-gray-600 mb-4">
          Split bills easily with friends and family. No KYC required.
        </p>
        <div className="flex space-x-4">
          <Link 
            to="/split" 
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Split a Bill
          </Link>
          <Link 
            to="/wallet" 
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
          >
            My Wallet
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
        <div className="space-y-2">
          <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
            <span>Dinner Split</span>
            <span className="text-green-500">$25.00</span>
          </div>
          <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
            <span>Movie Night</span>
            <span className="text-red-500">-$15.00</span>
          </div>
        </div>
      </div>
    </div>
  )
}
