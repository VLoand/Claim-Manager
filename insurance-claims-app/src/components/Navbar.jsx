import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="bg-white shadow-md rounded-lg p-4 mb-6 flex justify-between items-center">
      <div className="font-bold text-xl">Insurance Claims Manager</div>
      <div className="space-x-4">
        <Link to="/" className="hover:underline">Submit Claim</Link>
        <Link to="/review" className="hover:underline">Review Claims</Link>
        <Link to="/about" className="hover:underline">About</Link>
      </div>
    </nav>
  );
}
