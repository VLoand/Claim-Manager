// Basic placeholder component - Services CRUD ready for exam activation
import React from 'react';

const ServicesDashboard = () => {
  return (
    <div className="services-dashboard">
      <h2>Services Dashboard</h2>
      <p>Services CRUD is currently deactivated. Use SERVICES_CRUD_ACTIVATION_GUIDE.md to activate for exam.</p>
    </div>
  );
};

export default ServicesDashboard;

/*
// FULL SERVICES CRUD COMPONENT - UNCOMMENT FOR EXAM
const ServicesDashboard = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    serviceName: '',
    serviceType: ''
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await servicesAPI.getAll();
      if (response.success) {
        setServices(response.services);
      } else {
        setError('Failed to fetch services');
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      setError('Error fetching services');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      if (editingService) {
        const response = await servicesAPI.update(editingService.id, formData);
        if (response.success) {
          await fetchServices();
          resetForm();
        } else {
          setError(response.message || 'Failed to update service');
        }
      } else {
        const response = await servicesAPI.create(formData);
        if (response.success) {
          await fetchServices();
          resetForm();
        } else {
          setError(response.message || 'Failed to create service');
        }
      }
    } catch (error) {
      console.error('Error submitting service:', error);
      setError('Error submitting service');
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({
      serviceName: service.service_name,
      serviceType: service.service_type
    });
    setShowForm(true);
  };

  const handleDelete = async (serviceId) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        setError(null);
        const response = await servicesAPI.delete(serviceId);
        if (response.success) {
          await fetchServices();
        } else {
          setError(response.message || 'Failed to delete service');
        }
      } catch (error) {
        console.error('Error deleting service:', error);
        setError('Error deleting service');
      }
    }
  };

  const resetForm = () => {
    setFormData({ serviceName: '', serviceType: '' });
    setEditingService(null);
    setShowForm(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading services...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Services Management</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          {showForm ? 'Cancel' : 'Add New Service'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingService ? 'Edit Service' : 'Add New Service'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Name
                </label>
                <input
                  type="text"
                  name="serviceName"
                  value={formData.serviceName}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter service name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Type
                </label>
                <select
                  name="serviceType"
                  value={formData.serviceType}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select service type</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Repair">Repair</option>
                  <option value="Diagnostics">Diagnostics</option>
                  <option value="Installation">Installation</option>
                  <option value="Inspection">Inspection</option>
                </select>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                type="submit"
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
              >
                {editingService ? 'Update Service' : 'Create Service'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">All Services</h2>
          {services.length === 0 ? (
            <p className="text-gray-500">No services found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left">ID</th>
                    <th className="px-4 py-2 text-left">Service Name</th>
                    <th className="px-4 py-2 text-left">Service Type</th>
                    <th className="px-4 py-2 text-left">Created At</th>
                    <th className="px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((service) => (
                    <tr key={service.id} className="border-b">
                      <td className="px-4 py-2">{service.id}</td>
                      <td className="px-4 py-2">{service.service_name}</td>
                      <td className="px-4 py-2">
                        <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                          {service.service_type}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        {new Date(service.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => handleEdit(service)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded mr-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(service.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServicesDashboard;
*/