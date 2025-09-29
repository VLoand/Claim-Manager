import { connectPostgreSQL, query } from './config/postgres.js';
import { connectMongoDB } from './config/mongodb.js';
import Document from './models/Document.js';

async function testDocuments() {
  try {
    // Connect to databases
    await connectPostgreSQL();
    await connectMongoDB();
    
    // Get the latest claims
    console.log('\n=== Latest Claims ===');
    const claimsResult = await query('SELECT id, claim_number, full_name, created_at FROM claims ORDER BY created_at DESC LIMIT 5');
    console.log(claimsResult.rows);
    
    // Get all documents from MongoDB
    console.log('\n=== All Documents in MongoDB ===');
    const allDocs = await Document.find().sort({ uploadDate: -1 });
    console.log('Total documents:', allDocs.length);
    
    allDocs.forEach((doc, index) => {
      console.log(`${index + 1}. Claim ID: ${doc.claimId}, File: ${doc.originalName}, Date: ${doc.uploadDate}`);
    });
    
    // Check if any claim has documents
    if (claimsResult.rows.length > 0) {
      const latestClaim = claimsResult.rows[0];
      console.log(`\n=== Documents for Latest Claim (ID: ${latestClaim.id}) ===`);
      const claimDocs = await Document.find({ claimId: latestClaim.id, isActive: true });
      console.log(`Found ${claimDocs.length} documents for claim ${latestClaim.id}`);
      
      claimDocs.forEach(doc => {
        console.log(`- ${doc.originalName} (${doc.fileType}, ${doc.fileSize} bytes)`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testDocuments();