require('dotenv').config();
const { MongoClient } = require('mongodb');

async function migrate() {
    // 1. Configuration
    const localUri = 'mongodb://localhost:27017';
    const localDbName = 'ai-estimator';

    // Get Atlas URI from .env or command line argument
    const atlasUri = process.env.MONGODB_URI || process.argv[2];

    if (!atlasUri) {
        console.error('Error: Please provide your Atlas URI as an argument.');
        console.log('Usage: node migrateData.js "mongodb+srv://user:pass@cluster.mongodb.net/ai-estimator"');
        process.exit(1);
    }

    const localClient = new MongoClient(localUri);
    const atlasClient = new MongoClient(atlasUri);

    try {
        console.log('--- Starting Migration ---');
        await localClient.connect();
        await atlasClient.connect();

        const localDb = localClient.db(localDbName);
        const atlasDb = atlasClient.db(); // Atlas URI usually includes the DB name

        const collections = await localDb.listCollections().toArray();
        console.log(`Found ${collections.length} collections to migrate.`);

        for (const col of collections) {
            const colName = col.name;
            console.log(`Migrating collection: ${colName}...`);

            const docs = await localDb.collection(colName).find({}).toArray();

            if (docs.length > 0) {
                // Clear existing data in Atlas if any
                await atlasDb.collection(colName).deleteMany({});

                // Insert all docs
                await atlasDb.collection(colName).insertMany(docs);
                console.log(`✅ Successfully moved ${docs.length} documents to ${colName}`);
            } else {
                console.log(`ℹ️ Collection ${colName} is empty, skipping.`);
            }
        }

        console.log('--- Migration Complete! ---');
    } catch (err) {
        console.error('❌ Migration failed:', err);
    } finally {
        await localClient.close();
        await atlasClient.close();
    }
}

migrate();
