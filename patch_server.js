const fs = require('fs');

let content = fs.readFileSync('c:\\Codeverse\\server.js', 'utf8');

// 1. Add async to routes
content = content.replace(/app\.get\('\/api\/team\/edit-info\/:registrationId', \(req, res\) => {/g, "app.get('/api/team/edit-info/:registrationId', async (req, res) => {");
content = content.replace(/app\.put\('\/api\/team\/update', \(req, res\) => {/g, "app.put('/api/team/update', async (req, res) => {");
content = content.replace(/app\.post\('\/api\/register', \(req, res\) => {/g, "app.post('/api/register', async (req, res) => {");
content = content.replace(/app\.post\('\/api\/payment\/submit', upload\.single\('proofFile'\), \(req, res\) => {/g, "app.post('/api/payment/submit', upload.single('proofFile'), async (req, res) => {");
content = content.replace(/app\.get\('\/api\/registration\/:registrationId', \(req, res\) => {/g, "app.get('/api/registration/:registrationId', async (req, res) => {");
content = content.replace(/app\.get\('\/api\/admin\/metrics', requireAdminAuth, \(req, res\) => {/g, "app.get('/api/admin/metrics', requireAdminAuth, async (req, res) => {");
content = content.replace(/app\.get\('\/api\/admin\/teams', requireAdminAuth, \(req, res\) => {/g, "app.get('/api/admin/teams', requireAdminAuth, async (req, res) => {");
content = content.replace(/app\.post\('\/api\/admin\/verify', requireAdminAuth, \(req, res\) => {/g, "app.post('/api/admin/verify', requireAdminAuth, async (req, res) => {");
content = content.replace(/app\.all\(\['\/api\/admin\/teams\/:id\/delete', '\/api\/admin\/teams\/:id'\], requireAdminAuth, \(req, res\) => {/g, "app.all(['/api/admin/teams/:id/delete', '/api/admin/teams/:id'], requireAdminAuth, async (req, res) => {");
content = content.replace(/app\.all\(\['\/api\/admin\/teams\/:id\/update', '\/api\/admin\/teams\/:id'\], requireAdminAuth, \(req, res\) => {/g, "app.all(['/api/admin/teams/:id/update', '/api/admin/teams/:id'], requireAdminAuth, async (req, res) => {");
content = content.replace(/app\.get\('\/api\/admin\/export-csv', \(req, res\) => {/g, "app.get('/api/admin/export-csv', async (req, res) => {");
content = content.replace(/app\.get\('\/api\/admin\/settings', requireAdminAuth, \(req, res\) => {/g, "app.get('/api/admin/settings', requireAdminAuth, async (req, res) => {");
content = content.replace(/app\.post\('\/api\/admin\/settings\/deadline', requireAdminAuth, \(req, res\) => {/g, "app.post('/api/admin/settings/deadline', requireAdminAuth, async (req, res) => {");
content = content.replace(/app\.post\('\/api\/admin\/seed-demo', requireAdminAuth, \(req, res\) => {/g, "app.post('/api/admin/seed-demo', requireAdminAuth, async (req, res) => {");

// 2. Add awaits to db calls
content = content.replace(/db\.getEditDeadline\(\)/g, "await db.getEditDeadline()");
content = content.replace(/db\.isEditDeadlinePassed\(\)/g, "await db.isEditDeadlinePassed()");
content = content.replace(/db\.getTeamByRegistrationId\(/g, "await db.getTeamByRegistrationId(");
content = content.replace(/db\.updateTeamDetails\(/g, "await db.updateTeamDetails(");
content = content.replace(/db\.createTeam\(/g, "await db.createTeam(");
content = content.replace(/db\.submitPayment\(/g, "await db.submitPayment(");
content = content.replace(/db\.getMetrics\(\)/g, "await db.getMetrics()");
content = content.replace(/db\.getAllTeams\(/g, "await db.getAllTeams(");
content = content.replace(/db\.updatePaymentStatus\(/g, "await db.updatePaymentStatus(");
content = content.replace(/db\.deleteTeam\(/g, "await db.deleteTeam(");
content = content.replace(/db\.adminUpdateTeam\(/g, "await db.adminUpdateTeam(");
content = content.replace(/db\.setEditDeadline\(/g, "await db.setEditDeadline(");

fs.writeFileSync('c:\\Codeverse\\server.js', content, 'utf8');
console.log('Successfully updated server.js to use async/await for Supabase db.');
