/*
 * ========================================
 * SERVICES CRUD - READY FOR EXAM
 * ========================================
 * This file contains a complete CRUD implementation for Services entity
 * To activate: Uncomment the import and route registration in server.js
 * Database table already created with sample data
 * Frontend component: ServicesDashboard.jsx (also commented out)
 * API functions: servicesAPI in api.js (commented out)
 * ========================================
 */

import express from 'express';
import { connectPostgreSQL, query } from '../config/postgres.js';
import { authenticateToken } from '../middleware/auth.js';

// Service validation
const validateService = (serviceData) => {
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
};

const router = express.Router();

// GET /api/services - Get all services
router.get('/', authenticateToken, async (req, res) => {
  try {
    await connectPostgreSQL();
    
    const result = await query('SELECT * FROM services ORDER BY id DESC');
    
    res.json({
      success: true,
      services: result.rows
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch services',
      error: error.message
    });
  }
});

// GET /api/services/:id - Get single service
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid service ID'
      });
    }
    
    await connectPostgreSQL();
    
    const result = await query('SELECT * FROM services WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }
    
    res.json({
      success: true,
      service: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching service:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch service',
      error: error.message
    });
  }
});

// POST /api/services - Create new service
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { serviceName, serviceType } = req.body;
    
    // Validate input
    const validationErrors = validateService({ serviceName, serviceType });
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }
    
    await connectPostgreSQL();
    
    const result = await query(
      'INSERT INTO services (service_name, service_type) VALUES ($1, $2) RETURNING *',
      [serviceName.trim(), serviceType.trim()]
    );
    
    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      service: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create service',
      error: error.message
    });
  }
});

// PUT /api/services/:id - Update service
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { serviceName, serviceType } = req.body;
    
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid service ID'
      });
    }
    
    // Validate input
    const validationErrors = validateService({ serviceName, serviceType });
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }
    
    await connectPostgreSQL();
    
    const result = await query(
      'UPDATE services SET service_name = $1, service_type = $2 WHERE id = $3 RETURNING *',
      [serviceName.trim(), serviceType.trim(), id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Service updated successfully',
      service: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update service',
      error: error.message
    });
  }
});

// DELETE /api/services/:id - Delete service
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid service ID'
      });
    }
    
    await connectPostgreSQL();
    
    const result = await query('DELETE FROM services WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Service deleted successfully',
      service: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete service',
      error: error.message
    });
  }
});

export default router;