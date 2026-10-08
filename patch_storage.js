const fs = require('fs');

let content = fs.readFileSync('c:\\Codeverse\\server.js', 'utf8');

// Replace multer.diskStorage with multer.memoryStorage
const multerStorageRegex = /const storage = multer\.diskStorage\(\{[\s\S]*?\}\);/m;
content = content.replace(multerStorageRegex, "const storage = multer.memoryStorage();");

// Replace the upload handler in /api/payment/submit
const oldSubmitPayment = `
    const proofFilePath = \`/uploads/\${req.file.filename}\`;

    const updatedTeam = await db.submitPayment({
      registrationId: registrationId.trim(),
      paymentMethod,
      utrNumber: utrNumber.trim(),
      transactionDate: transactionDate || new Date().toISOString().split('T')[0],
      amountPaid: Number(amountPaid) || HACKATHON_CONFIG.registrationFee,
      proofFilePath
    });
`;

const newSubmitPayment = `
    const ext = path.extname(req.file.originalname);
    const cleanReg = registrationId.replace(/[^a-zA-Z0-9_-]/g, '');
    const uniqueSuffix = \`\${Date.now()}-\${Math.round(Math.random() * 1e5)}\`;
    const filename = \`proof-\${cleanReg}-\${uniqueSuffix}\${ext}\`;

    const { data, error } = await db.supabase.storage
      .from('receipts')
      .upload(filename, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false
      });

    if (error) {
      console.error('Supabase Storage Error:', error);
      return res.status(500).json({ success: false, error: 'Failed to upload receipt to cloud storage.' });
    }

    const { data: publicUrlData } = db.supabase.storage.from('receipts').getPublicUrl(filename);
    const proofFilePath = publicUrlData.publicUrl;

    const updatedTeam = await db.submitPayment({
      registrationId: registrationId.trim(),
      paymentMethod,
      utrNumber: utrNumber.trim(),
      transactionDate: transactionDate || new Date().toISOString().split('T')[0],
      amountPaid: Number(amountPaid) || HACKATHON_CONFIG.registrationFee,
      proofFilePath
    });
`;

content = content.replace(oldSubmitPayment, newSubmitPayment);

fs.writeFileSync('c:\\Codeverse\\server.js', content, 'utf8');
console.log('Successfully updated server.js to use Supabase Storage.');
