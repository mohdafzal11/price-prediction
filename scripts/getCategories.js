require('dotenv').config();
const { getCategories, getCategoryNames } = require('./db');

async function displayCategories() {
  try {
    // Get all categories with full details
    console.log('Fetching all categories...');
    const allCategories = await getCategories();
    console.log('\nAll Categories (Full Details):');
    console.table(allCategories.map(cat => ({
      name: cat.name,
      slug: cat.slug,
      isActive: cat.isActive,
      displayOrder: cat.displayOrder || 'N/A'
    })));

    // Get just the names of active categories
    console.log('\nFetching active category names...');
    const activeNames = await getCategoryNames();
    console.log('\nActive Category Names:');
    console.log(activeNames);

    // Get all category names including inactive ones
    console.log('\nFetching all category names (including inactive)...');
    const allNames = await getCategoryNames(false);
    console.log('\nAll Category Names:');
    console.log(allNames);
    
    console.log(`\nTotal: ${allCategories.length} categories found (${activeNames.length} active)`);
  } catch (error) {
    console.error('Error displaying categories:', error);
  } finally {
    process.exit(0);
  }
}

// Run the function
displayCategories(); 