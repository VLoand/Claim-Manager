// Service Model
class Service {
  constructor(id, serviceName, serviceType) {
    this.id = id;
    this.serviceName = serviceName;
    this.serviceType = serviceType;
  }

  // Validation method
  static validate(serviceData) {
    const errors = [];
    
    if (!serviceData.serviceName || serviceData.serviceName.trim().length === 0) {
      errors.push('Service name is required');
    }
    
    if (!serviceData.serviceType || serviceData.serviceType.trim().length === 0) {
      errors.push('Service type is required');
    }
    
    if (serviceData.serviceName && serviceData.serviceName.length > 100) {
      errors.push('Service name must be less than 100 characters');
    }
    
    if (serviceData.serviceType && serviceData.serviceType.length > 50) {
      errors.push('Service type must be less than 50 characters');
    }
    
    return errors;
  }
}

module.exports = Service;