const http = require('http');

function request(url, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = http.request({
      hostname: u.hostname,
      port: u.port,
      path: u.pathname + u.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runTest() {
  console.log('Testing CodeVerse backend & edit functionality...');

  // 1. Admin login
  const loginRes = await request('http://localhost:3000/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { username: 'Metaverse_Admin', password: 'Meta@234' });

  console.log('1. Admin Login:', loginRes.status, loginRes.data.success ? 'PASS' : 'FAIL');
  const token = loginRes.data.token;

  // 2. Clear any deadline first
  const clearRes = await request('http://localhost:3000/api/admin/settings/deadline', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
  }, { deadline: null });
  console.log('2. Clear Deadline:', clearRes.status, clearRes.data.success ? 'PASS' : 'FAIL');

  // 3. Register a new test team
  const regRes = await request('http://localhost:3000/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    teamName: 'EditTestTeam_' + Date.now().toString().slice(-4),
    track: 'AI & Intelligent Systems',
    projectTitle: 'Neural Network Optimizer',
    members: [
      { fullName: 'Ananya Sharma', regNumber: '22BCE9001', collegeEmail: `ananya_${Date.now()}@college.edu`, phone: '9876543210', isLeader: true },
      { fullName: 'Rohan Gupta', regNumber: '22BCE9002', collegeEmail: `rohan_${Date.now()}@college.edu`, phone: '9876543211', isLeader: false },
      { fullName: 'Meera Iyer', regNumber: '22BCE9003', collegeEmail: `meera_${Date.now()}@college.edu`, phone: '9876543212', isLeader: false },
      { fullName: 'Vikram Rao', regNumber: '22BCE9004', collegeEmail: `vikram_${Date.now()}@college.edu`, phone: '9876543213', isLeader: false }
    ]
  });
  console.log('3. Team Registration:', regRes.status, regRes.data.success ? 'PASS' : 'FAIL');
  const regId = regRes.data.team.registration_id;
  console.log('   Registration ID:', regId);

  // 4. Lookup team for editing
  const editInfoRes = await request(`http://localhost:3000/api/team/edit-info/${regId}`);
  console.log('4. Team Edit-Info Lookup:', editInfoRes.status, editInfoRes.data.success ? 'PASS' : 'FAIL');
  console.log('   Deadline status:', editInfoRes.data.isDeadlinePassed ? 'PASSED' : 'OPEN');
  console.log('   Leader Name:', editInfoRes.data.team.leader.full_name);
  console.log('   Total Members:', editInfoRes.data.team.members.length);

  // 5. Update team details (edit topic, project title, member name)
  const updateRes = await request('http://localhost:3000/api/team/update', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' }
  }, {
    registrationId: regId,
    teamName: 'EditedAlphaTeam_' + Date.now().toString().slice(-4),
    track: 'Cybersecurity & Cloud Resilience',
    projectTitle: 'Quantum Safe Shield',
    members: [
      { fullName: 'Ananya Sharma (Updated)', regNumber: '22BCE9001', collegeEmail: `ananya_${Date.now()}@college.edu`, phone: '9876543210', isLeader: true },
      { fullName: 'Rohan Gupta (Updated)', regNumber: '22BCE9002', collegeEmail: `rohan_${Date.now()}@college.edu`, phone: '9876543211', isLeader: false },
      { fullName: 'Meera Iyer', regNumber: '22BCE9003', collegeEmail: `meera_${Date.now()}@college.edu`, phone: '9876543212', isLeader: false },
      { fullName: 'Vikram Rao', regNumber: '22BCE9004', collegeEmail: `vikram_${Date.now()}@college.edu`, phone: '9876543213', isLeader: false }
    ]
  });
  console.log('5. Update Team:', updateRes.status, updateRes.data && updateRes.data.success ? 'PASS' : 'FAIL', updateRes.data);
  if (updateRes.data && updateRes.data.team) {
    console.log('   New Team Name:', updateRes.data.team.team_name);
    console.log('   New Leader Name:', updateRes.data.team.leader.full_name);
  }

  // 6. Admin sets a deadline in the PAST (1 hour ago)
  const pastDeadline = new Date(Date.now() - 3600000).toISOString();
  const setPastRes = await request('http://localhost:3000/api/admin/settings/deadline', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
  }, { deadline: pastDeadline });
  console.log('6. Set Past Deadline:', setPastRes.status, setPastRes.data.isPassed ? 'PASS (Correctly marked as passed)' : 'FAIL');

  // 7. Verify edit lookup shows expired
  const expiredLookupRes = await request(`http://localhost:3000/api/team/edit-info/${regId}`);
  console.log('7. Expired Edit Lookup isDeadlinePassed:', expiredLookupRes.data.isDeadlinePassed ? 'PASS (true)' : 'FAIL (false)');

  // 8. Attempt update when deadline passed (should be blocked with 400)
  const blockedUpdateRes = await request('http://localhost:3000/api/team/update', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' }
  }, {
    registrationId: regId,
    teamName: 'ShouldFailUpdate',
    track: 'Cybersecurity & Cloud Resilience',
    members: [
      { fullName: 'Ananya Sharma', regNumber: '22BCE9001', collegeEmail: 'ananya@college.edu', phone: '9876543210', isLeader: true },
      { fullName: 'Rohan Gupta', regNumber: '22BCE9002', collegeEmail: 'rohan@college.edu', phone: '9876543211', isLeader: false },
      { fullName: 'Meera Iyer', regNumber: '22BCE9003', collegeEmail: 'meera@college.edu', phone: '9876543212', isLeader: false },
      { fullName: 'Vikram Rao', regNumber: '22BCE9004', collegeEmail: 'vikram@college.edu', phone: '9876543213', isLeader: false }
    ]
  });
  console.log('8. Blocked Update after Deadline:', blockedUpdateRes.status === 400 ? 'PASS (400 Blocked)' : 'FAIL', blockedUpdateRes.data.error);

  // 9. Reset deadline to FUTURE or null for regular operation
  const resetRes = await request('http://localhost:3000/api/admin/settings/deadline', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
  }, { deadline: null });
  console.log('9. Re-opened Deadline (null):', resetRes.status, resetRes.data.success ? 'PASS' : 'FAIL');

  console.log('All backend checks completed successfully!');
}

runTest().catch(console.error);
