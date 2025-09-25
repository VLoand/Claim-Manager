import express from 'express';
import { query } from '../config/postgres.js';
import { authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Get current user profile
router.get('/profile', async (req, res) => {
  try {
    const result = await query(
      'SELECT id, email, full_name, role, is_active, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User profile not found'
      });
    }

    res.json({
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Failed to fetch profile',
      message: 'An error occurred while fetching user profile'
    });
  }
});

// Update user profile
router.put('/profile', async (req, res) => {
  try {
    const { fullName } = req.body;

    if (!fullName || fullName.trim().length < 2) {
      return res.status(400).json({
        error: 'Invalid full name',
        message: 'Full name must be at least 2 characters long'
      });
    }

    const result = await query(
      'UPDATE users SET full_name = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, email, full_name, role, is_active, updated_at',
      [fullName.trim(), req.user.id]
    );

    res.json({
      message: 'Profile updated successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      error: 'Failed to update profile',
      message: 'An error occurred while updating profile'
    });
  }
});

// Get all users (admin only)
router.get('/', authorizeRoles('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role, isActive } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = '1=1';
    const params = [];
    let paramCount = 0;

    // Role filter
    if (role && role !== 'all') {
      whereClause += ` AND role = $${++paramCount}`;
      params.push(role);
    }

    // Active status filter
    if (isActive !== undefined) {
      whereClause += ` AND is_active = $${++paramCount}`;
      params.push(isActive === 'true');
    }

    // Search filter
    if (search) {
      whereClause += ` AND (full_name ILIKE $${++paramCount} OR email ILIKE $${++paramCount})`;
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern);
      paramCount++; // We added 2 params but already incremented once
    }

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) FROM users WHERE ${whereClause}`,
      params
    );
    const totalUsers = parseInt(countResult.rows[0].count);

    // Get users
    const usersResult = await query(`
      SELECT id, email, full_name, role, is_active, created_at, updated_at
      FROM users 
      WHERE ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${++paramCount} OFFSET $${++paramCount}
    `, [...params, limit, offset]);

    res.json({
      users: usersResult.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalUsers / limit),
        totalUsers,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      error: 'Failed to fetch users',
      message: 'An error occurred while fetching users'
    });
  }
});

// Update user role (admin only)
router.patch('/:id/role', authorizeRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const validRoles = ['user', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        error: 'Invalid role',
        message: `Role must be one of: ${validRoles.join(', ')}`
      });
    }

    // Prevent admin from demoting themselves
    if (parseInt(id) === req.user.id && role !== 'admin') {
      return res.status(403).json({
        error: 'Cannot demote self',
        message: 'You cannot change your own admin role'
      });
    }

    const result = await query(
      'UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, email, full_name, role, is_active',
      [role, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'User not found',
        message: 'The specified user does not exist'
      });
    }

    res.json({
      message: 'User role updated successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      error: 'Failed to update user role',
      message: 'An error occurred while updating user role'
    });
  }
});

// Toggle user active status (admin only)
router.patch('/:id/status', authorizeRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        error: 'Invalid status',
        message: 'isActive must be a boolean value'
      });
    }

    // Prevent admin from deactivating themselves
    if (parseInt(id) === req.user.id && !isActive) {
      return res.status(403).json({
        error: 'Cannot deactivate self',
        message: 'You cannot deactivate your own account'
      });
    }

    const result = await query(
      'UPDATE users SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, email, full_name, role, is_active',
      [isActive, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'User not found',
        message: 'The specified user does not exist'
      });
    }

    res.json({
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      error: 'Failed to update user status',
      message: 'An error occurred while updating user status'
    });
  }
});

// Get user statistics (admin only)
router.get('/stats', authorizeRoles('admin'), async (req, res) => {
  try {
    // Total users
    const totalUsersResult = await query('SELECT COUNT(*) FROM users');
    const totalUsers = parseInt(totalUsersResult.rows[0].count);

    // Active users
    const activeUsersResult = await query('SELECT COUNT(*) FROM users WHERE is_active = true');
    const activeUsers = parseInt(activeUsersResult.rows[0].count);

    // Users by role
    const roleStatsResult = await query(`
      SELECT role, COUNT(*) as count 
      FROM users 
      WHERE is_active = true 
      GROUP BY role
    `);

    // Recent registrations (last 30 days)
    const recentUsersResult = await query(`
      SELECT COUNT(*) 
      FROM users 
      WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
    `);
    const recentUsers = parseInt(recentUsersResult.rows[0].count);

    res.json({
      totalUsers,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
      recentUsers,
      roleDistribution: roleStatsResult.rows.reduce((acc, row) => {
        acc[row.role] = parseInt(row.count);
        return acc;
      }, {})
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      error: 'Failed to fetch user statistics',
      message: 'An error occurred while fetching user statistics'
    });
  }
});

export default router;