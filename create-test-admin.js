// Script to create a test admin account
import https from 'https';

const baseURL = 'https://nike-backend-1-g9i6.onrender.com/api';

const adminData = {
  username: 'admin',
  email: 'admin@nike.com',
  password: 'admin123',
  role: 'admin'
};

function createAdmin() {
  return new Promise((resolve) => {
    const postData = JSON.stringify(adminData);
    
    const options = {
      hostname: 'nike-backend-1-g9i6.onrender.com',
      port: 443,
      path: '/api/auth/register',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          success: res.statusCode >= 200 && res.statusCode < 300,
          data: data
        });
      });
    });

    req.on('error', (error) => {
      resolve({
        status: 'ERROR',
        success: false,
        error: error.message
      });
    });

    req.write(postData);
    req.end();
  });
}

async function main() {
  console.log('👤 Creating test admin account...\n');
  console.log('Admin Details:');
  console.log(`  Username: ${adminData.username}`);
  console.log(`  Email: ${adminData.email}`);
  console.log(`  Password: ${adminData.password}`);
  console.log(`  Role: ${adminData.role}\n`);

  const result = await createAdmin();
  
  if (result.success) {
    console.log('✅ Admin account created successfully!');
    console.log('Response:', result.data);
  } else {
    console.log('❌ Failed to create admin account');
    console.log('Status:', result.status);
    console.log('Error:', result.error || result.data);
  }
}

main().catch(console.error);
