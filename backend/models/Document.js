import mongoose from 'mongoose';

const DocumentSchema = new mongoose.Schema({
  claimId: {
    type: Number,
    required: true,
    index: true
  },
  originalName: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true,
    unique: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    enum: ['accident_photos', 'documents', 'receipts', 'other'],
    default: 'other'
  },
  uploadedBy: {
    type: Number,
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  metadata: {
    dimensions: String,
    pages: Number,
    description: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for performance
DocumentSchema.index({ claimId: 1, uploadDate: -1 });
DocumentSchema.index({ uploadedBy: 1 });

export default mongoose.model('Document', DocumentSchema);