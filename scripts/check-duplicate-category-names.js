// Simple script to check for duplicate category names
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDuplicateCategoryNames() {
  try {
    console.log('Fetching all categories...');
    
    // Get all categories
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true
      },
      orderBy: {
        name: 'asc'
      }
    });
    
    console.log(`Found ${categories.length} categories in total\n`);
    
    // Check for case-insensitive duplicate names
    console.log('Checking for duplicate category names (case-insensitive)...');
    const nameMap = new Map();
    const duplicates = [];
    
    categories.forEach(cat => {
      const nameLower = cat.name.toLowerCase();
      
      if (nameMap.has(nameLower)) {
        // Found a duplicate
        nameMap.get(nameLower).push(cat);
      } else {
        // First occurrence of this name
        nameMap.set(nameLower, [cat]);
      }
    });
    
    // Find all names that have more than one entry
    for (const [name, cats] of nameMap.entries()) {
      if (cats.length > 1) {
        duplicates.push({
          name: name,
          categories: cats
        });
      }
    }
    
    // Display results
    if (duplicates.length === 0) {
      console.log('No duplicate category names found.');
    } else {
      console.log(`Found ${duplicates.length} duplicate category names:`);
      
      duplicates.forEach(dup => {
        console.log(`\nDuplicate name: "${dup.name}"`);
        dup.categories.forEach(cat => {
          console.log(`  - ID: ${cat.id}, Name: "${cat.name}", Slug: "${cat.slug}"`);
        });
      });
    }
    
  } catch (error) {
    console.error('Error checking for duplicate category names:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
checkDuplicateCategoryNames()
  .then(() => console.log('\nCheck complete!'))
  .catch(e => console.error('Error running script:', e));
