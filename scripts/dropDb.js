const { MongoClient } = require('mongodb');

async function dropDatabase(connectionString, databaseName) {
  const client = new MongoClient(connectionString);
  
  try {
    await client.connect();
    const db = client.db(databaseName);
    
    // Drop the entire database
    const result = await db.dropDatabase();
    console.log(`Database ${databaseName} dropped successfully:`, result);
    
    return result;
  } catch (error) {
    console.error('Error dropping database:', error);
    throw error;
  } finally {
    await client.close();
  }
}

// Example usage:
dropDatabase("mongodb://root:13cs6EVPtNtUwgbLzgdpYL6zCoBGeanAU39hXiQF3bVnhcqrDXmh5T35KDCfHS3m@65.21.209.112:14445/?directConnection=true", "test").then(() => {
  console.log('Database dropped successfully');
}).catch(error => {
  console.error('Error dropping database:', error);
});