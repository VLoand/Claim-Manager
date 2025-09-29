import { useState } from 'react';
import { useClaims, useAuth } from '../contexts/AppContext.jsx';
import { documentsAPI } from '../services/api.js';

export default function ClaimSubmission() {
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
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { createClaim, clearError } = useClaims();
  const { user } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);
    clearError();
    
    try {
      // Prepare claim data
      const claimData = {
        fullName: form.fullName,
        dateOfBirth: form.dob,
        nationality: form.nationality,
        vehicleType: form.vehicleType,
        insuranceCompany: form.insuranceCompany,
        accidentDate: form.accidentDate,
        accidentLocation: form.accidentLocation,
        accidentDescription: form.accidentDescription,
        damageAmount: parseFloat(form.damageAmount) || 0,
        claimType: 'vehicle_accident'
      };

      // Validate damage amount
      if (claimData.damageAmount > 99999999.99) {
        throw new Error('Damage amount cannot exceed $99,999,999.99');
      }
      if (claimData.damageAmount < 0.01) {
        throw new Error('Damage amount must be at least $0.01');
      }

      console.log('Sending claim data:', claimData);
      
      const newClaim = await createClaim(claimData);
      
      // Reset form
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
      
      console.log('Claim submitted successfully:', newClaim);
      
      // Upload document if provided
      if (form.file && newClaim) {
        try {
          // Extract claim ID from response structure
          const claimId = newClaim.claim?.id || newClaim.id;
          console.log('Uploading document for claim:', claimId);
          console.log('File details:', {
            name: form.file.name,
            size: form.file.size,
            type: form.file.type
          });
          
          await documentsAPI.uploadDocuments(
            claimId,
            [form.file],
            'other',
            'Document uploaded during claim submission'
          );
          
          console.log('Document uploaded successfully');
        } catch (uploadError) {
          console.error('Error uploading document:', uploadError);
          console.error('Upload error details:', {
            message: uploadError.message,
            status: uploadError.status,
            data: uploadError.data
          });
          
          // Show error to user but don't fail the whole claim submission
          alert(`Claim created successfully, but document upload failed: ${uploadError.message}. You can upload documents later from the claim documents page.`);
        }
      }
      
      // Extract claim number from response structure
      const claimNumber = newClaim.claim?.claimNumber || newClaim.claimNumber || 'N/A';
      const message = form.file ? 
        `Claim and document submitted successfully! Claim #${claimNumber}. Redirecting to your claims...` :
        `Claim submitted successfully! Claim #${claimNumber}. Redirecting to your claims...`;
      
      alert(message);
      
      setTimeout(() => {
        window.location.href = '/claims';
      }, 2000);
      
    } catch (error) {
      console.error('Error submitting claim:', error);
      if (error.data && error.data.details) {
        console.error('Validation errors:', error.data.details);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleChange(e) {
    const { name, value, files } = e.target;
    setForm(f => ({
      ...f,
      [name]: files ? files[0] : value,
    }));
  }

  const vehicleTypes = [
    'Car', 'Motorcycle', 'Truck', 'Van', 'SUV', 'Bus', 'Bicycle', 'Other'
  ];

  const insuranceCompanies = [
    'Allianz', 'AXA', 'State Farm', 'Geico', 'Progressive', 'Liberty Mutual', 'Other'
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent mb-4">Submit New Claim</h1>
        <p className="text-gray-600 text-lg">Please provide detailed information about your insurance claim</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-xl border border-purple-100 overflow-hidden">
        <div className="px-8 py-6 bg-gradient-to-r from-purple-50 to-blue-50">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Personal Information</h2>
          <p className="text-gray-600">Your basic details for the claim</p>
        </div>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter your full legal name"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Date of Birth *
              </label>
              <input
                type="date"
                name="dob"
                value={form.dob}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nationality *
              </label>
              <input
                type="text"
                name="nationality"
                value={form.nationality}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="e.g., American, British, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Vehicle Type *
              </label>
              <select
                name="vehicleType"
                value={form.vehicleType}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">Select vehicle type</option>
                {vehicleTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="px-8 py-6 bg-gradient-to-r from-blue-50 to-cyan-50 border-t border-gray-100">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Insurance Information</h2>
          <p className="text-gray-600">Details about your insurance coverage</p>
        </div>

        <div className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Insurance Company *
            </label>
            <select
              name="insuranceCompany"
              value={form.insuranceCompany}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="">Select insurance company</option>
              {insuranceCompanies.map(company => (
                <option key={company} value={company}>{company}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="px-8 py-6 bg-gradient-to-r from-cyan-50 to-purple-50 border-t border-gray-100">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Accident Details</h2>
          <p className="text-gray-600">Information about the incident</p>
        </div>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Accident Date *
              </label>
              <input
                type="date"
                name="accidentDate"
                value={form.accidentDate}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Estimated Damage Amount *
              </label>
              <input
                type="number"
                name="damageAmount"
                value={form.damageAmount}
                onChange={handleChange}
                required
                min="0.01"
                max="99999999.99"
                step="0.01"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter amount in USD (max: $99,999,999.99)"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Accident Location *
            </label>
            <input
              type="text"
              name="accidentLocation"
              value={form.accidentLocation}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Street address, city, state/province"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Accident Description *
            </label>
            <textarea
              name="accidentDescription"
              value={form.accidentDescription}
              onChange={handleChange}
              required
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              placeholder="Provide a detailed description of what happened..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Supporting Documents (Optional)
            </label>
            <input
              type="file"
              name="file"
              onChange={handleChange}
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <p className="text-sm text-gray-500 mt-1">
              Accepted formats: PDF, JPG, PNG, DOC, DOCX (Max 10MB)
            </p>
          </div>
        </div>

        <div className="px-8 py-6 bg-gray-50 border-t border-gray-100">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-4 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                <span>Submitting Claim...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                <span>Submit Insurance Claim</span>
              </div>
            )}
          </button>
          
          <p className="text-center text-sm text-gray-500 mt-4">
            By submitting this form, you agree to our terms and conditions
          </p>
        </div>
      </form>
    </div>
  );
}