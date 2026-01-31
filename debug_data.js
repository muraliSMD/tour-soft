
const mongoose = require('mongoose');
const Match = require('./src/models/Match');
const Tournament = require('./src/models/Tournament');
require('dotenv').config();

const connectDB = async () => {
    if (mongoose.connections[0].readyState) return;
    await mongoose.connect(process.env.MONGODB_URI);
};

async function inspectData() {
    await connectDB();
    
    // Find the most recent active tournament or just list them
    const tournament = await Tournament.find({}).sort({ updatedAt: -1 }).limit(1);
    
    if (!tournament || tournament.length === 0) {
        console.log("No tournaments found.");
        return;
    }
    
    const t = tournament[0];
    console.log("Active Tournament:", {
        id: t._id,
        title: t.title,
        format: t.format,
        status: t.status
    });
    
    const matches = await Match.find({ tournament: t._id });
    console.log(`Found ${matches.length} matches.`);
    
    if (matches.length > 0) {
        console.log("Sample Match:", JSON.stringify(matches[0], null, 2));
        
        const groups = matches.map(m => m.group);
        console.log("Unique Groups:", [...new Set(groups)]);
        
        const types = matches.map(m => m.type);
        console.log("Unique Types:", [...new Set(types)]);
    }
    
    process.exit();
}

inspectData();
