async function upsertToken(tokenData) {
  try {
    // Extract category data
    const { categoryData, ...tokenDataWithoutCategories } = tokenData;
    
    // Upsert the token first
    const token = await prisma.token.upsert({
      where: { ticker: tokenData.ticker },
      update: tokenDataWithoutCategories,
      create: tokenDataWithoutCategories,
    });
    
    // If we have categories, handle them
    if (categoryData && categoryData.length > 0) {
      console.log(`Processing ${categoryData.length} categories for ${token.ticker}`);
      
      // First, get existing category connections for this token
      const existingCategories = await prisma.tokenToCategory.findMany({
        where: { tokenId: token.id },
        include: { category: true }
      });
      
      // Track which categories we've processed to avoid duplicates
      const processedCategorySlugs = new Set();
      
      // Process each category
      for (const category of categoryData) {
        // Skip if we've already processed this category in this run
        if (processedCategorySlugs.has(category.slug)) continue;
        processedCategorySlugs.add(category.slug);
        
        // Upsert the category
        const upsertedCategory = await prisma.category.upsert({
          where: { slug: category.slug },
          update: {
            name: category.name,
            description: category.description
          },
          create: {
            name: category.name,
            slug: category.slug,
            description: category.description,
            isActive: true
          }
        });
        
        // Check if relationship already exists
        const relationshipExists = existingCategories.some(
          ec => ec.category.id === upsertedCategory.id
        );
        
        // Only create relationship if it doesn't exist
        if (!relationshipExists) {
          await prisma.tokenToCategory.create({
            data: {
              tokenId: token.id,
              categoryId: upsertedCategory.id
            }
          });
        }
      }
      
      // Remove relationships for categories that are no longer associated
      const currentCategorySlugs = new Set(categoryData.map(c => c.slug));
      const categoriesToRemove = existingCategories.filter(
        ec => !currentCategorySlugs.has(ec.category.slug)
      );
      
      for (const categoryToRemove of categoriesToRemove) {
        await prisma.tokenToCategory.delete({
          where: { id: categoryToRemove.id }
        });
      }
      
      console.log(`Successfully linked ${categoryData.length} categories to ${token.ticker}`);
    }
    
    return token;
  } catch (error) {
    console.error('Error upserting token:', error);
    throw error;
  }
} 