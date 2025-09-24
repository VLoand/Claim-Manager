import { useState } from 'react';

export default function ClaimSubmission({ onSubmit }) {
  const [form, setForm] = useState({
    fullName: '',
    dob: '',
    nationality: '',
    vehicleType: '',
    insuranceCompany: '',
    accidentDate: '',
    accidentLocation: '',
    accidentDescription: '',
    damageAmount: '',
    file: null,
  });

  function handleChange(e) {
    const { name, value, files } = e.target;
    setForm(f => ({
      ...f,
      [name]: files ? files[0] : value,
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({ ...form, id: Date.now(), status: 'submitted' });
    setForm({
      fullName: '',
      dob: '',
      nationality: '',
      vehicleType: '',
      insuranceCompany: '',
      accidentDate: '',
      accidentLocation: '',
      accidentDescription: '',
      damageAmount: '',
      file: null,
    });
  }

  return (
    <form className="bg-white rounded-lg shadow p-6 max-w-xl mx-auto" onSubmit={handleSubmit}>
      <h2 className="text-2xl font-bold mb-4">Submit Insurance Claim</h2>
      <div className="grid grid-cols-1 gap-4">
        <input name="fullName" value={form.fullName} onChange={handleChange} required placeholder="Full Name" className="border rounded p-2" />
        <input name="dob" type="date" value={form.dob} onChange={handleChange} required placeholder="Date of Birth" className="border rounded p-2" />
        <input name="nationality" value={form.nationality} onChange={handleChange} required placeholder="Nationality" className="border rounded p-2" />
        <input name="vehicleType" value={form.vehicleType} onChange={handleChange} required placeholder="Vehicle Type" className="border rounded p-2" />
        <input name="insuranceCompany" value={form.insuranceCompany} onChange={handleChange} required placeholder="Insurance Company" className="border rounded p-2" />
        <input name="accidentDate" type="date" value={form.accidentDate} onChange={handleChange} required placeholder="Accident Date" className="border rounded p-2" />
        <input name="accidentLocation" value={form.accidentLocation} onChange={handleChange} required placeholder="Accident Location" className="border rounded p-2" />
        <textarea name="accidentDescription" value={form.accidentDescription} onChange={handleChange} required placeholder="Accident Description" className="border rounded p-2" />
        <input
          name="damageAmount"
          type="text"
          inputMode="numeric"
          pattern="\d*"
          value={form.damageAmount}
          onChange={e => {
            const val = e.target.value;
            if (val === '' || /^\d+$/.test(val)) {
              setForm(f => ({ ...f, damageAmount: val }));
            }
          }}
          required
          placeholder="Estimated Damage Amount"
          className="border rounded p-2"
          autoComplete="off"
        />
        <input name="file" type="file" onChange={handleChange} className="border rounded p-2" />
      </div>
      <button type="submit" className="mt-4 bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700">Submit Claim</button>
    </form>
  );
}
