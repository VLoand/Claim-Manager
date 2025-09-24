export default function ClaimCard({ claim, onStatusChange }) {
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4 flex flex-col md:flex-row md:items-center justify-between">
      <div>
        <div className="font-semibold">{claim.fullName}</div>
        <div className="text-sm text-gray-600">{claim.insuranceCompany} | {claim.accidentDate}</div>
        <div className="text-xs text-gray-500">Status: {claim.status}</div>
      </div>
      <div>
        <select
          className="border rounded p-1 mt-2 md:mt-0"
          value={claim.status}
          onChange={e => onStatusChange(claim.id, e.target.value)}
        >
          <option value="submitted">Submitted</option>
          <option value="reviewed">Reviewed</option>
          <option value="in progress">In Progress</option>
          <option value="rejected">Rejected</option>
          <option value="paid out">Paid Out</option>
        </select>
      </div>
    </div>
  );
}
