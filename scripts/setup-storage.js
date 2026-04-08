#!/usr/bin/env node

const https = require('https');
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET_NAME = 'listings';

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

async function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, SUPABASE_URL);
    const options = {
      method,
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: data ? JSON.parse(data) : null });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function setupStorage() {
  console.log('🔧 Configurez Supabase Storage...\n');

  try {
    // 1. Check bucket
    console.log('1️⃣  Verific bucket-ul listings...');
    const checkRes = await makeRequest('GET', `/rest/v1/buckets/${BUCKET_NAME}`);

    if (checkRes.status === 404) {
      console.log('   ⚠️  Bucket nu există, îl creez...');
      const createRes = await makeRequest('POST', '/rest/v1/buckets', {
        id: BUCKET_NAME,
        name: BUCKET_NAME,
        public: true,
        file_size_limit: 5242880, // 5MB
      });

      if (createRes.status !== 201) {
        console.error('   ❌ Eroare la creare:', createRes.body);
        process.exit(1);
      }
      console.log('   ✅ Bucket creat cu succes');
    } else if (checkRes.status === 200) {
      console.log('   ✅ Bucket găsit');
    } else {
      console.error('   ❌ Eroare:', checkRes.body);
      process.exit(1);
    }

    // 2. Update bucket to public
    console.log('\n2️⃣  Fac bucket-ul public...');
    const updateRes = await makeRequest('PUT', `/rest/v1/buckets/${BUCKET_NAME}`, {
      public: true,
      file_size_limit: 5242880,
    });

    if (updateRes.status === 200) {
      console.log('   ✅ Bucket e public acum');
    } else {
      console.error('   ❌ Eroare:', updateRes.body);
    }

    // 3. Set CORS
    console.log('\n3️⃣  Configurez CORS...');
    const corsRes = await makeRequest('PUT', `/rest/v1/buckets/${BUCKET_NAME}`, {
      public: true,
      file_size_limit: 5242880,
      allowed_mime_types: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    });

    if (corsRes.status === 200) {
      console.log('   ✅ CORS configurat');
    } else {
      console.error('   ⚠️  CORS warning:', corsRes.body);
    }

    console.log('\n✨ Storage configurare completă!\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Eroare:', err.message);
    process.exit(1);
  }
}

setupStorage();
