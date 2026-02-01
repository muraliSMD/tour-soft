const mongoose = require('mongoose');
const Tournament = require('./src/models/Tournament');
const Academy = require('./src/models/Academy');
require('dotenv').config({ path: '.env.local' });

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const tournaments = await Tournament.find().limit(5);
        console.log(`Found ${tournaments.length} tournaments`);

        for (const t of tournaments) {
            console.log('---');
            console.log(`Tournament: ${t.title || t.name}`);
            console.log(`Academy ID in Tournament: ${t.academy}`);

            if (t.academy) {
                const academy = await Academy.findById(t.academy);
                console.log(`Academy Found: ${academy ? 'YES' : 'NO'}`);
                if (academy) {
                    console.log(`Academy Name: ${academy.name}`);
                }
            } else {
                console.log('No Academy linked');
            }
        }
    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

check();
