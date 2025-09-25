import express from 'express';
import { body, query as expressQuery, validationResult } from 'express-validator';
import { query } from '../config/postgres.js';
import { authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Validation rules for claim creation
const createClaimValidation = [
  body('fullName').trim().isLength({ min: 2 }).withMessage('Full name is required'),
  body('dateOfBirth').isISO8601().toDate().withMessage('Valid date of birth is required'),
  body('nationality').trim().isLength({ min: 2 }).withMessage('Nationality is required'),
  body('vehicleType').trim().isLength({ min: 1 }).withMessage('Vehicle type is required'),
  body('insuranceCompany').trim().isLength({ min: 1 }).withMessage('Insurance company is required'),
  body('accidentDate').isISO8601().toDate().withMessage('Valid accident date is required'),
  body('accidentLocation').trim().isLength({ min: 5 }).withMessage('Accident location is required'),
  body('accidentDescription').trim().isLength({ min: 10 }).withMessage('Accident description must be at least 10 characters'),
  body('damageAmount').isNumeric().withMessage('Damage amount must be a number'),
];

// Generate unique claim number
function generateClaimNumber() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `CLM-${year}${month}${day}-${random}`;
}

// Create new claim
router.post('/', createClaimValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const {
      fullName,
      dateOfBirth,
      nationality,
      vehicleType,
      insuranceCompany,
      accidentDate,
      accidentLocation,
      accidentDescription,
      damageAmount
    } = req.body;

    let claimNumber;
    let attempts = 0;
    const maxAttempts = 5;

    // Ensure unique claim number
    do {
      claimNumber = generateClaimNumber();
      const existing = await query('SELECT id FROM claims WHERE claim_number = $1', [claimNumber]);
      if (existing.rows.length === 0) break;
      attempts++;
    } while (attempts < maxAttempts);

    if (attempts >= maxAttempts) {
      return res.status(500).json({
        error: 'System error',
        message: 'Unable to generate unique claim number'
      });
    }

    // Create claim
    const result = await query(`
      INSERT INTO claims (
        user_id, claim_number, full_name, date_of_birth, nationality,
        vehicle_type, insurance_company, accident_date, accident_location,
        accident_description, damage_amount, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `, [
      req.user.id, claimNumber, fullName, dateOfBirth, nationality,
      vehicleType, insuranceCompany, accidentDate, accidentLocation,
      accidentDescription, damageAmount, 'submitted'
    ]);

    const claim = result.rows[0];

    // Add to status history
    await query(
      'INSERT INTO claim_status_history (claim_id, new_status, changed_by) VALUES ($1, $2, $3)',
      [claim.id, 'submitted', req.user.id]
    );

    // Emit real-time notification to admins
    req.io.emit('new-claim', {
      claimId: claim.id,
      claimNumber: claim.claim_number,
      submittedBy: fullName,
      message: `New claim ${claim.claim_number} submitted by ${fullName}`
    });

    res.status(201).json({
      message: 'Claim created successfully',
      claim: {
        id: claim.id,
        claimNumber: claim.claim_number,
        status: claim.status,
        createdAt: claim.created_at
      }
    });
  } catch (error) {
    console.error('Create claim error:', error);
    res.status(500).json({
      error: 'Failed to create claim',
      message: 'An error occurred while creating the claim'
    });
  }
});

// Get all claims (with pagination and filtering)
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      search,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    let whereClause = '1=1';
    const params = [];
    let paramCount = 0;

    // If user is not admin, only show their own claims
    if (req.user.role !== 'admin') {
      whereClause += ` AND user_id = $${++paramCount}`;
      params.push(req.user.id);
    }

    // Status filter
    if (status && status !== 'all') {
      whereClause += ` AND status = $${++paramCount}`;
      params.push(status);
    }

    // Search filter
    if (search) {
      whereClause += ` AND (
        full_name ILIKE $${++paramCount} OR 
        claim_number ILIKE $${++paramCount} OR 
        insurance_company ILIKE $${++paramCount} OR
        accident_location ILIKE $${++paramCount}
      )`;
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern);
      paramCount += 3; // We added 4 params but already incremented once
    }

    // Validate sort parameters
    const validSortColumns = ['created_at', 'updated_at', 'status', 'damage_amount', 'accident_date'];
    const validSortOrders = ['ASC', 'DESC'];
    
    const finalSortBy = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
    const finalSortOrder = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) FROM claims WHERE ${whereClause}`,
      params
    );
    const totalClaims = parseInt(countResult.rows[0].count);

    // Get claims
    const claimsResult = await query(`
      SELECT 
        c.*,
        u.full_name as submitted_by_name,
        assigned_user.full_name as assigned_to_name
      FROM claims c
      LEFT JOIN users u ON c.user_id = u.id
      LEFT JOIN users assigned_user ON c.assigned_to = assigned_user.id
      WHERE ${whereClause}
      ORDER BY c.${finalSortBy} ${finalSortOrder}
      LIMIT $${++paramCount} OFFSET $${++paramCount}
    `, [...params, limit, offset]);

    res.json({
      claims: claimsResult.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalClaims / limit),
        totalClaims,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get claims error:', error);
    res.status(500).json({
      error: 'Failed to fetch claims',
      message: 'An error occurred while fetching claims'
    });
  }
});

// Get single claim by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    let whereClause = 'c.id = $1';
    const params = [id];
    
    // If user is not admin, only allow viewing their own claims
    if (req.user.role !== 'admin') {
      whereClause += ' AND c.user_id = $2';
      params.push(req.user.id);
    }

    const result = await query(`
      SELECT 
        c.*,
        u.full_name as submitted_by_name,
        u.email as submitted_by_email,
        assigned_user.full_name as assigned_to_name
      FROM claims c
      LEFT JOIN users u ON c.user_id = u.id
      LEFT JOIN users assigned_user ON c.assigned_to = assigned_user.id
      WHERE ${whereClause}
    `, params);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Claim not found',
        message: 'The requested claim does not exist or you do not have permission to view it'
      });
    }

    const claim = result.rows[0];

    // Get status history
    const historyResult = await query(`
      SELECT 
        csh.*,
        u.full_name as changed_by_name
      FROM claim_status_history csh
      LEFT JOIN users u ON csh.changed_by = u.id
      WHERE csh.claim_id = $1
      ORDER BY csh.created_at ASC
    `, [id]);

    // Get comments
    const commentsResult = await query(`
      SELECT 
        cc.*,
        u.full_name as user_name
      FROM claim_comments cc
      LEFT JOIN users u ON cc.user_id = u.id
      WHERE cc.claim_id = $1 
      ${req.user.role !== 'admin' ? 'AND cc.is_internal = false' : ''}
      ORDER BY cc.created_at ASC
    `, [id]);

    res.json({
      claim,
      statusHistory: historyResult.rows,
      comments: commentsResult.rows
    });
  } catch (error) {
    console.error('Get claim error:', error);
    res.status(500).json({
      error: 'Failed to fetch claim',
      message: 'An error occurred while fetching the claim'
    });
  }
});

// Update claim status (admin only)
router.patch('/:id/status', authorizeRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, comment } = req.body;

    const validStatuses = ['submitted', 'reviewed', 'in progress', 'rejected', 'paid out'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Invalid status',
        message: `Status must be one of: ${validStatuses.join(', ')}`
      });
    }

    // Get current claim
    const currentClaim = await query('SELECT * FROM claims WHERE id = $1', [id]);
    if (currentClaim.rows.length === 0) {
      return res.status(404).json({
        error: 'Claim not found',
        message: 'The specified claim does not exist'
      });
    }

    const oldStatus = currentClaim.rows[0].status;

    // Update claim status
    const result = await query(
      'UPDATE claims SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, id]
    );

    const updatedClaim = result.rows[0];

    // Add to status history
    await query(
      'INSERT INTO claim_status_history (claim_id, old_status, new_status, changed_by, comment) VALUES ($1, $2, $3, $4, $5)',
      [id, oldStatus, status, req.user.id, comment]
    );

    // Emit real-time notification to claim owner
    req.io.to(`user-${updatedClaim.user_id}`).emit('claim-status-updated', {
      claimId: id,
      claimNumber: updatedClaim.claim_number,
      oldStatus,
      newStatus: status,
      message: `Your claim ${updatedClaim.claim_number} status has been updated to ${status}`
    });

    res.json({
      message: 'Claim status updated successfully',
      claim: updatedClaim
    });
  } catch (error) {
    console.error('Update claim status error:', error);
    res.status(500).json({
      error: 'Failed to update claim status',
      message: 'An error occurred while updating the claim status'
    });
  }
});

// Add comment to claim
router.post('/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    const { comment, isInternal = false } = req.body;

    if (!comment || comment.trim().length === 0) {
      return res.status(400).json({
        error: 'Comment required',
        message: 'Comment text cannot be empty'
      });
    }

    // Only admins can add internal comments
    const finalIsInternal = req.user.role === 'admin' ? isInternal : false;

    // Verify claim exists and user has permission
    let claimQuery = 'SELECT * FROM claims WHERE id = $1';
    const params = [id];
    
    if (req.user.role !== 'admin') {
      claimQuery += ' AND user_id = $2';
      params.push(req.user.id);
    }

    const claimResult = await query(claimQuery, params);
    if (claimResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Claim not found',
        message: 'The specified claim does not exist or you do not have permission to comment'
      });
    }

    // Add comment
    const result = await query(
      'INSERT INTO claim_comments (claim_id, user_id, comment, is_internal) VALUES ($1, $2, $3, $4) RETURNING *',
      [id, req.user.id, comment.trim(), finalIsInternal]
    );

    const newComment = result.rows[0];

    // Emit real-time notification
    if (!finalIsInternal) {
      const claim = claimResult.rows[0];
      req.io.to(`user-${claim.user_id}`).emit('new-comment', {
        claimId: id,
        claimNumber: claim.claim_number,
        commentId: newComment.id,
        message: `New comment added to your claim ${claim.claim_number}`
      });
    }

    res.status(201).json({
      message: 'Comment added successfully',
      comment: {
        ...newComment,
        user_name: req.user.full_name
      }
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      error: 'Failed to add comment',
      message: 'An error occurred while adding the comment'
    });
  }
});

export default router;