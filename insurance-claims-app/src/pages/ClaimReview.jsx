import ClaimCard from '../components/ClaimCard';

export default function ClaimReview({ claims, onStatusChange }) {
  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Review Claims</h2>
      {claims.length === 0 ? (
        <div className="text-gray-500">No claims submitted yet.</div>
      ) : (
        claims.map(claim => (
          <ClaimCard key={claim.id} claim={claim} onStatusChange={onStatusChange} />
        ))
      )}
    </div>
  );
}
