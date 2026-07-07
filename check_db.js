const { MongoClient } = require('mongodb');
async function run() {
  const client = new MongoClient("mongodb+srv://miahnayeem470_db_user:zWeSH0PUn3OZ2y4Q@cluster0.va8kngs.mongodb.net/?appName=Cluster0");
  await client.connect();
  const db = client.db('bornoland');
  const store = await db.collection('stores').findOne({ subdomain: 'nayeem' });
  console.log("Store:", store);
  await client.close();
}
run();
