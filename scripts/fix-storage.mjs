#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

async function fixStorage() {
  console.log('🔧 Configurez Supabase Storage...\n');

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  try {
    // List buckets
    console.log('1️⃣  Verific bucket-uri...');
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
      console.error('   ❌ Eroare:', listError.message);
      return;
    }

    const listingsBucket = buckets?.find(b => b.name === 'listings');

    if (!listingsBucket) {
      console.log('   ⚠️  Bucket "listings" nu există, îl creez...');
      const { data: newBucket, error: createError } = await supabase.storage.createBucket('listings', {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      });

      if (createError) {
        console.error('   ❌ Eroare la creare:', createError.message);
        return;
      }
      console.log('   ✅ Bucket "listings" creat cu succes');
    } else {
      console.log(`   ✅ Bucket "listings" găsit (public: ${listingsBucket.public})`);

      if (!listingsBucket.public) {
        console.log('   🔄 Fac bucket-ul public...');
        const { data: updated, error: updateError } = await supabase.storage.updateBucket('listings', {
          public: true,
        });

        if (updateError) {
          console.error('   ❌ Eroare:', updateError.message);
        } else {
          console.log('   ✅ Bucket e public acum');
        }
      }
    }

    // Test upload
    console.log('\n2️⃣  Test upload...');
    const testContent = Buffer.from('test image');
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('listings')
      .upload('test-upload.txt', testContent, {
        contentType: 'text/plain',
        upsert: true,
      });

    if (uploadError) {
      console.error('   ❌ Eroare upload:', uploadError.message);
    } else {
      console.log('   ✅ Upload test succeeds');
      console.log(`   📍 Path: ${uploadData?.path}`);

      // Test public URL
      const { data: publicUrl } = supabase.storage
        .from('listings')
        .getPublicUrl('test-upload.txt');

      console.log(`   🌐 Public URL: ${publicUrl.publicUrl}`);

      // Cleanup
      await supabase.storage.from('listings').remove(['test-upload.txt']);
    }

    console.log('\n✨ Storage configurare completă!\n');
  } catch (err) {
    console.error('❌ Eroare:', err.message);
  }
}

fixStorage();
