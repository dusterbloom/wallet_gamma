import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl font-bold">PaySplit</Link>
          <div className="flex space-x-4">
            <Link to="/wallet" className="text-gray-600 hover:text-gray-900">Wallet</Link>
            <Link to="/split" className="text-gray-600 hover:text-gray-900">Split Bill</Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
