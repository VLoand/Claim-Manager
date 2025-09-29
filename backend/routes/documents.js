import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { upload } from '../config/fileStorage.js';
import Document from '../models/Document.js';
import path from 'path';
import fs from 'fs';
import { query } from '../config/postgres.js';

const router = express.Router();

// Upload documents for a claim
router.post('/claims/:claimId/documents', authenticateToken, upload.array('documents', 10), async (req, res) => {
  try {
    const { claimId } = req.params;
    const { category = 'other' } = req.body;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({
        error: 'No files uploaded',
        message: 'Please select at least one file to upload'
      });
    }

    // Verify claim exists and user has access
    const claimResult = await query(
      'SELECT id, user_id FROM claims WHERE id = $1',
      [claimId]
    );

    if (claimResult.rows.length === 0) {
      // Clean up uploaded files
      files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
      
      return res.status(404).json({
        error: 'Claim not found',
        message: 'The specified claim does not exist'
      });
    }

    const claim = claimResult.rows[0];

    // Check if user owns the claim or is admin
    if (claim.user_id !== req.user.id && req.user.role !== 'admin') {
      // Clean up uploaded files
      files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });

      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only upload documents to your own claims'
      });
    }

    // Save document metadata to MongoDB
    const documents = [];
    
    for (const file of files) {
      try {
        const document = new Document({
          claimId: parseInt(claimId),
          originalName: file.originalname,
          fileName: file.filename,
          filePath: file.path,
          fileType: file.mimetype,
          fileSize: file.size,
          category: category,
          uploadedBy: req.user.id,
          metadata: {
            description: req.body.description || ''
          }
        });

        const savedDocument = await document.save();
        documents.push(savedDocument);
      } catch (error) {
        console.error('Error saving document metadata:', error);
        // Clean up file if database save fails
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      }
    }

    // Emit real-time notification
    req.io?.emit('documents-uploaded', {
      claimId: claimId,
      documentCount: documents.length,
      uploadedBy: req.user.fullName || req.user.email
    });

    res.status(201).json({
      message: `${documents.length} document(s) uploaded successfully`,
      documents: documents.map(doc => ({
        id: doc._id,
        originalName: doc.originalName,
        fileName: doc.fileName,
        fileType: doc.fileType,
        fileSize: doc.fileSize,
        category: doc.category,
        uploadDate: doc.uploadDate,
        uploadedBy: doc.uploadedBy
      }))
    });

  } catch (error) {
    console.error('Error uploading documents:', error);
    
    // Clean up uploaded files on error
    if (req.files) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }

    res.status(500).json({
      error: 'Upload failed',
      message: 'An error occurred while uploading documents'
    });
  }
});

// Handle CORS preflight for documents endpoint
router.options('/claims/:claimId/documents', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(200);
});

// Get documents for a claim
router.get('/claims/:claimId/documents', authenticateToken, async (req, res) => {
  try {
    const { claimId } = req.params;

    // Verify claim exists and user has access
    const claimResult = await query(
      'SELECT id, user_id FROM claims WHERE id = $1',
      [claimId]
    );

    if (claimResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Claim not found',
        message: 'The specified claim does not exist'
      });
    }

    const claim = claimResult.rows[0];

    // Check if user owns the claim or is admin
    if (claim.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only view documents for your own claims'
      });
    }

    // Get documents from MongoDB
    const documents = await Document.find({
      claimId: parseInt(claimId),
      isActive: true
    }).sort({ uploadDate: -1 });

    // Get uploader information from PostgreSQL
    const documentsWithUploaderInfo = await Promise.all(
      documents.map(async (doc) => {
        const userResult = await query(
          'SELECT full_name, email FROM users WHERE id = $1',
          [doc.uploadedBy]
        );
        
        const uploader = userResult.rows[0];
        
        return {
          id: doc._id,
          originalName: doc.originalName,
          fileName: doc.fileName,
          fileType: doc.fileType,
          fileSize: doc.fileSize,
          category: doc.category,
          uploadDate: doc.uploadDate,
          uploadedBy: {
            id: doc.uploadedBy,
            name: uploader?.full_name || 'Unknown User',
            email: uploader?.email || ''
          },
          metadata: doc.metadata
        };
      })
    );

    res.json({
      claimId: claimId,
      documents: documentsWithUploaderInfo,
      totalDocuments: documentsWithUploaderInfo.length,
      totalSize: documentsWithUploaderInfo.reduce((sum, doc) => sum + doc.fileSize, 0)
    });

  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({
      error: 'Fetch failed',
      message: 'An error occurred while fetching documents'
    });
  }
});

// Download a specific document
router.get('/documents/:documentId/download', authenticateToken, async (req, res) => {
  try {
    const { documentId } = req.params;

    // Get document from MongoDB
    const document = await Document.findById(documentId);
    
    if (!document || !document.isActive) {
      return res.status(404).json({
        error: 'Document not found',
        message: 'The specified document does not exist'
      });
    }

    // Verify claim access
    const claimResult = await query(
      'SELECT id, user_id FROM claims WHERE id = $1',
      [document.claimId]
    );

    if (claimResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Claim not found',
        message: 'The associated claim does not exist'
      });
    }

    const claim = claimResult.rows[0];

    // Check if user owns the claim or is admin
    if (claim.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only download documents from your own claims'
      });
    }

    // Check if file exists on disk
    if (!fs.existsSync(document.filePath)) {
      return res.status(404).json({
        error: 'File not found',
        message: 'The document file is missing from storage'
      });
    }

    // Set appropriate headers for file download
    res.setHeader('Content-Disposition', `attachment; filename="${document.originalName}"`);
    res.setHeader('Content-Type', document.fileType);
    res.setHeader('Content-Length', document.fileSize);

    // Stream the file
    const fileStream = fs.createReadStream(document.filePath);
    fileStream.pipe(res);

  } catch (error) {
    console.error('Error downloading document:', error);
    res.status(500).json({
      error: 'Download failed',
      message: 'An error occurred while downloading the document'
    });
  }
});

// Delete a document (soft delete)
router.delete('/documents/:documentId', authenticateToken, async (req, res) => {
  try {
    const { documentId } = req.params;

    // Get document from MongoDB
    const document = await Document.findById(documentId);
    
    if (!document || !document.isActive) {
      return res.status(404).json({
        error: 'Document not found',
        message: 'The specified document does not exist'
      });
    }

    // Verify claim access
    const claimResult = await query(
      'SELECT id, user_id FROM claims WHERE id = $1',
      [document.claimId]
    );

    if (claimResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Claim not found',
        message: 'The associated claim does not exist'
      });
    }

    const claim = claimResult.rows[0];

    // Check if user owns the claim or is admin, or if user uploaded the document
    if (claim.user_id !== req.user.id && req.user.role !== 'admin' && document.uploadedBy !== req.user.id) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only delete your own documents or documents from your own claims'
      });
    }

    // Soft delete - mark as inactive
    document.isActive = false;
    await document.save();

    // Emit real-time notification
    req.io?.emit('document-deleted', {
      claimId: document.claimId,
      documentId: documentId,
      deletedBy: req.user.fullName || req.user.email
    });

    res.json({
      message: 'Document deleted successfully',
      documentId: documentId
    });

  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({
      error: 'Delete failed',
      message: 'An error occurred while deleting the document'
    });
  }
});

// Get document categories
router.get('/document-categories', authenticateToken, (req, res) => {
  res.json({
    categories: [
      { value: 'accident_photos', label: 'Accident Photos', description: 'Photos of the accident scene and damage' },
      { value: 'documents', label: 'Official Documents', description: 'Police reports, forms, certificates' },
      { value: 'receipts', label: 'Receipts & Estimates', description: 'Repair estimates, medical bills, receipts' },
      { value: 'other', label: 'Other', description: 'Additional supporting documents' }
    ]
  });
});

export default router;