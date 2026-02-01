const mongoose = require('mongoose');
const Academy = require('./src/models/Academy');
require('dotenv').config({ path: '.env.local' });

const ACADEMY_ID = '697f0a7d22d0928e85d2aaf2';

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log(`Checking existence of Academy ID: ${ACADEMY_ID}`);

        const academy = await Academy.findById(ACADEMY_ID);
        
        if (academy) {
            console.log('--- FOUND ---');
            console.log(`Name: ${academy.name}`);
            console.log(`ID: ${academy._id}`);
        } else {
            console.log('--- NOT FOUND ---');
            console.log('This Academy ID does not exist in the database (Dangling Reference).');
        }

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await mongoose.disconnect();
    }
}

check();
