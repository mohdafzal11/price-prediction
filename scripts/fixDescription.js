require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
// No need for OpenAI module, we'll use axios directly
const Anthropic = require('@anthropic-ai/sdk');

// AI client configuration
let anthropic = null;

// Check which API keys are available and initialize the appropriate client
if (process.env.ANTHROPIC_API_KEY) {
  console.log('Using Anthropic Claude API');
  anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
} else if (process.env.OPENAI_API_KEY) {
  console.log('Using Direct API with axios');
  console.log(`API Key: ${process.env.OPENAI_API_KEY ? 'Set (hidden)' : 'Not set'}`);
  console.log(`API Base URL: ${process.env.OPENAI_API_BASE || 'Default OpenAI endpoint'}`);
  console.log(`Model: ${process.env.OPENAI_MODEL_NAME || process.env.OPENAI_MODEL || 'Default model'}`);
} else {
  console.warn('No API keys found for OpenAI or Anthropic. The script will fail when trying to rewrite descriptions.');
}

/**
 * Makes a request to an OpenAI-compatible API using axios
 * @param {string} prompt - The prompt to send to the API
 * @param {string} systemPrompt - The system prompt to use
 * @returns {Promise<string>} - The API response text
 */
async function callCompatibleAPI(prompt, systemPrompt) {
  try {
    const baseURL = process.env.OPENAI_API_BASE || 'https://api.openai.com/v1';
    const model = process.env.OPENAI_MODEL_NAME || process.env.OPENAI_MODEL || 'gpt-4';
    
    console.log(`Making API request to: ${baseURL}`);
    console.log(`Using model: ${model}`);
    
    const response = await axios.post(
      `${baseURL}/chat/completions`,
      {
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 4000
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        }
      }
    );
    
    console.log('API response received');
    
    // Handle different API response formats
    if (response.data.choices && response.data.choices.length > 0) {
      if (response.data.choices[0].message) {
        return response.data.choices[0].message.content;
      } else if (response.data.choices[0].text) {
        return response.data.choices[0].text;
      }
    }
    
    console.error('Unexpected API response format:', JSON.stringify(response.data, null, 2));
    return null;
  } catch (error) {
    console.error('API call error:', error.message);
    if (error.response) {
      console.error('API response error data:', JSON.stringify(error.response.data, null, 2));
    }
    throw error;
  }
}

const PROMPT = `Rewrite the following text to improve clarity and readability while preserving the original meaning and tone. Do not imply or suggest that any individual or entity is backing, endorsing, or investing in the cryptocurrency unless explicitly stated in the original text. Avoid making predictions about future price movements, listings, or market performance, or any statements suggesting future market activity. Remove any references to CoinMarketCap, replacing them with "DroomDroom" where contextually appropriate, or removing links entirely while maintaining the core message about the token. Keep the content evergreen, eliminate any time-specific references that could date the content such as 'recently'. Focus strictly on presenting only the factual information contained in the original text.`;

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

/**
 * Empties the description field for all tokens in the database
 * @param {number} batchSize - Number of tokens to process in each batch
 * @returns {Promise<number>} The number of tokens updated
 */
async function emptyAllDescriptions(batchSize = 100) {
  try {
    console.log('Starting to empty descriptions for all tokens...');
    
    // Get all tokens
    const tokens = await prisma.token.findMany({
      select: {
        id: true,
        name: true,
        ticker: true,
        description: true
      }
    });
    
    console.log(`Found ${tokens.length} tokens in the database`);
    
    // Count tokens with descriptions
    const tokensWithDescription = tokens.filter(token => token.description);
    console.log(`${tokensWithDescription.length} tokens have descriptions that will be emptied`);

    // Process tokens in batches
    let totalProcessed = 0;
    const totalBatches = Math.ceil(tokens.length / batchSize);
    
    for (let batchNum = 0; batchNum < totalBatches; batchNum++) {
      const start = batchNum * batchSize;
      const end = Math.min(start + batchSize, tokens.length);
      const batch = tokens.slice(start, end);
      
      console.log(`Processing batch ${batchNum + 1}/${totalBatches} (${batch.length} tokens)...`);
      
      const batchPromises = batch.map(token => {
        return prisma.token.update({
          where: { id: token.id },
          data: { description: null }
        })
        .then(() => {
          console.log(`Emptied description for token ${token.name} (${token.ticker})`);
          return true;
        })
        .catch(err => {
          console.error(`Failed to update token ${token.name} (${token.ticker}):`, err);
          return false;
        });
      });
      
      const batchResults = await Promise.all(batchPromises);
      const successCount = batchResults.filter(result => result).length;
      
      totalProcessed += successCount;
      console.log(`Batch ${batchNum + 1} complete: ${successCount}/${batch.length} tokens processed successfully`);
    }
    
    console.log(`Successfully emptied descriptions for ${totalProcessed}/${tokens.length} tokens`);
    return totalProcessed;
  } catch (error) {
    console.error('Error emptying descriptions:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Gets all tokens without descriptions and fetches data from CoinMarketCap
 * @returns {Promise<void>}
 */
async function getTokensWithoutDescriptions() {
  try {
    console.log('Fetching tokens without descriptions...');
    
    // Get tokens without descriptions
    const tokens = await prisma.token.findMany({
      where: {
        description: null,
        cmcSlug: { not: null } // Only get tokens with a valid CMC slug
      },
      select: {
        id: true,
        name: true,
        ticker: true,
        cmcSlug: true
      },
      orderBy: {
        rank: 'asc' // Start with highest ranked tokens
      }
    });
    
    console.log(`Found ${tokens.length} tokens without descriptions that have CMC slugs`);
    
    if (tokens.length === 0) {
      console.log('No tokens to process. Exiting.');
      return;
    }
    
    // Process just the first token for manual inspection
    const firstToken = tokens[0];
    console.log(`Processing token: ${firstToken.name} (${firstToken.ticker}) with slug: ${firstToken.cmcSlug}`);
    
    // Fetch data from CoinMarketCap
    const cmcData = await fetchCoinMarketCapData("chrono-tech");
    
    // Print the data for manual inspection
    console.log('\nCoinMarketCap Data for manual inspection:');
    console.log(JSON.stringify(cmcData, null, 2));
    
    // Process the description with OpenAI if available
    if (cmcData.description) {
      console.log('\nSending description to OpenAI for rewriting...');
      
      try {
        const rewrittenDescription = await rewriteDescriptionWithOpenAI(cmcData.faqDescription || [{
          q: "What is " + cmcData.name + "?",
          a: cmcData.description
        }]);
        
        console.log('\nRewritten description:');
        console.log(JSON.stringify(rewrittenDescription, null, 2));
        
        // Save the rewritten description to a file for reference
        // fs.writeFileSync(`${firstToken.cmcSlug || 'token'}_rewritten.json`, JSON.stringify(rewrittenDescription, null, 2));
      } catch (error) {
        console.error('Error rewriting description with OpenAI:', error);
      }
    } else {
      console.log('\nNo description available to rewrite.');
    }
    
    console.log('\nExiting after processing the first token for manual inspection.');
  } catch (error) {
    console.error('Error processing tokens:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Fetches data from CoinMarketCap for a given slug
 * @param {string} slug - The CoinMarketCap slug for the token
 * @returns {Promise<Object>} The parsed data from CoinMarketCap
 */
async function fetchCoinMarketCapData(slug) {
    try {
      console.log(`Fetching data from CoinMarketCap for slug: ${slug}`);
      
      const url = `https://coinmarketcap.com/currencies/${slug}/`;
      console.log(`URL: ${url}`);
      
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Cache-Control': 'max-age=0'
        }
      });
      
      const html = response.data;
      // save the html to a file for debugging
      fs.writeFileSync(`${slug}.html`, html);
      
      // Look for the script tag with id="__NEXT_DATA__"
      const $ = cheerio.load(html);
      const nextDataScript = $('#__NEXT_DATA__');
      
      if (nextDataScript.length === 0) {
        console.log('Could not find #__NEXT_DATA__ script tag using cheerio');
        
        // Try regex as a fallback
        const nextDataRegex = /<script id="__NEXT_DATA__" type="application\/json" crossorigin="anonymous">(.*?)<\/script>/s;
        const match = html.match(nextDataRegex);
        
        if (!match || !match[1]) {
          console.log('Could not find Next.js data via regex either');
          
          // Look for any script tags and log their ids for debugging
          const scriptTags = $('script');
          console.log(`Found ${scriptTags.length} script tags on the page`);
          scriptTags.each((i, el) => {
            const id = $(el).attr('id');
            if (id) console.log(`Script tag #${i} has id: ${id}`);
          });
          
          // Fallback to basic scraping
          const description = $('.readmoreDesc').text().trim();
          return {
            description,
            source: 'cheerio-fallback',
            html: html.substring(0, 2000) + '...' // First 2000 chars for debugging
          };
        }
        
        // Parse the Next.js data from regex match
        try {
          const nextData = JSON.parse(match[1]);
          console.log('Successfully parsed Next.js data from regex match');
          return processNextData(nextData, slug);
        } catch (e) {
          console.error('Error parsing Next.js data from regex:', e);
          return {
            error: e.message,
            source: 'regex-parse-error',
            slug
          };
        }
      }
      
      // Parse the Next.js data from cheerio
      try {
        const nextData = JSON.parse(nextDataScript.html());
        console.log('Successfully parsed Next.js data from cheerio');
        return processNextData(nextData, slug);
      } catch (e) {
        console.error('Error parsing Next.js data from cheerio:', e);
        
        // Log the first part of the script content for debugging
        const scriptContent = nextDataScript.html();
        console.log('Script content preview:', scriptContent.substring(0, 500) + '...');
        
        return {
          error: e.message,
          source: 'cheerio-parse-error',
          slug
        };
      }
    } catch (error) {
      console.error(`Error fetching data for ${slug}:`, error.message);
      return {
        error: error.message,
        slug
      };
    }
  }
  
  // Helper function to process the Next.js data once it's extracted
  function processNextData(nextData, slug) {
    // Navigate to the faqDescription data
    const faqDescription = nextData.props?.pageProps?.cdpFaqData?.faqDescription || [];
    
    // Log the data paths for debugging
    console.log('Available data paths:');
    console.log('props exists:', !!nextData.props);
    if (nextData.props) {
      console.log('pageProps exists:', !!nextData.props.pageProps);
      if (nextData.props.pageProps) {
        console.log('cdpFaqData exists:', !!nextData.props.pageProps.cdpFaqData);
        if (nextData.props.pageProps.cdpFaqData) {
          console.log('faqDescription exists:', !!nextData.props.pageProps.cdpFaqData.faqDescription);
          console.log('faqDescription length:', faqDescription.length);
        }
        
        // Look for alternative paths to the description
        console.log('detailRes exists:', !!nextData.props.pageProps.detailRes);
        console.log('detail exists:', nextData.props.pageProps.detailRes && !!nextData.props.pageProps.detailRes.detail);
        
        // Log other potential paths that might contain descriptions
        const potentialPaths = [
          'nextData.props.pageProps.detailRes.detail.description',
          'nextData.props.pageProps.detail.description',
          'nextData.props.pageProps.cdpFaqData.faqList',
          'nextData.props.pageProps.about'
        ];
        
        potentialPaths.forEach(path => {
          try {
            const parts = path.split('.');
            let value = nextData;
            for (const part of parts.slice(1)) {
              value = value[part];
              if (value === undefined) break;
            }
            console.log(`${path} exists:`, !!value);
          } catch (e) {
            console.log(`${path} error:`, e.message);
          }
        });
      }
    }
    
    // Extract project description from the FAQ (usually the first answer contains the project description)
    let projectDescription = "";
    if (faqDescription.length > 0) {
      // The first FAQ item typically contains the project description
      projectDescription = faqDescription[0].a;
    }
    
    // Try to get description from other paths if faqDescription failed
    if (!projectDescription) {
      projectDescription = nextData.props?.pageProps?.detailRes?.detail?.description || 
                          nextData.props?.pageProps?.detail?.description || 
                          '';
    }
    
    return {
      name: nextData.props?.pageProps?.detailRes?.detail?.name || slug,
      symbol: nextData.props?.pageProps?.detailRes?.detail?.symbol || '',
      description: projectDescription,
      faqDescription: faqDescription,
      source: 'next-data',
      paths: {
        faqDescription: 'props.pageProps.cdpFaqData.faqDescription',
        directDescription: 'props.pageProps.detailRes.detail.description'
      }
    };
  }
/**
 * Rewrites a token description using OpenAI/Anthropic by processing each FAQ item individually
 * @param {Array} faqDescription - Array of FAQ items with q and a properties
 * @returns {Promise<Object>} The rewritten description
 */
async function rewriteDescriptionWithOpenAI(faqDescription) {
    try {
      console.log(`Processing ${faqDescription.length} FAQ items for rewriting`);
      
      // Process each FAQ item individually
      let allResults = [];
      
      for (let i = 0; i < faqDescription.length; i++) {
        const faqItem = faqDescription[i];
        console.log(`Processing FAQ item ${i+1}/${faqDescription.length}: "${faqItem.q.substring(0, 50)}..."`);
        
        // Process just the answer text for this FAQ item
        const rewrittenAnswer = await processIndividualAnswer(faqItem.a, faqItem.q);
        
        if (rewrittenAnswer && rewrittenAnswer.trim()) {
          // Create a new FAQ item with the original question and rewritten answer
          allResults.push({
            q: faqItem.q,
            a: rewrittenAnswer
          });
          console.log(`Added rewritten answer for item ${i+1}, total: ${allResults.length}`);
        } else {
          console.warn(`Failed to get valid answer for item ${i+1}, using original`);
          allResults.push(faqItem);
        }
        
        // Add a delay between items to avoid rate limiting
        if (i < faqDescription.length - 1) {
          console.log('Waiting 1 second before processing next item...');
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      console.log(`All FAQ items processed, total items: ${allResults.length}`);
      return allResults;
    } catch (error) {
      console.error('Error in rewriteDescriptionWithOpenAI:', error);
      // Return the original data if we encounter an error
      return faqDescription;
    }
}

/**
 * Process a single FAQ answer with AI (OpenAI or Anthropic)
 * @param {string} answerText - The original answer text to rewrite
 * @param {string} questionText - The question for context
 * @returns {Promise<string>} - The processed answer text
 */
async function processIndividualAnswer(answerText, questionText) {
  try {
    // Create a simple prompt that includes the question for context
    const prompt = `${answerText}`;
    let rewrittenContent = '';
    
    // Check which API to use
    if (anthropic) {
      console.log(`Sending answer to Anthropic Claude for rewriting (${answerText.length} chars)`);
      
      // Call Anthropic API with the individual answer
      const response = await anthropic.messages.create({
        model: process.env.ANTHROPIC_MODEL_NAME || 'claude-3-7-sonnet-20240219',
        max_tokens: 4000,
        temperature: 0.7,
        system: PROMPT,
        messages: [
          { role: 'user', content: prompt }
        ]
      });
      
      console.log(`Using Anthropic model: ${process.env.ANTHROPIC_MODEL_NAME || 'claude-3-7-sonnet-20240219'}`);
      
      // Extract the response content
      rewrittenContent = response.content[0].text;
      console.log('Anthropic response received, content length:', rewrittenContent.length);
    } else if (process.env.OPENAI_API_KEY) {
      console.log(`Sending answer to API for rewriting (${answerText.length} chars)`);
      
      // Use our direct axios implementation
      rewrittenContent = await callCompatibleAPI(prompt, PROMPT);
      
      if (!rewrittenContent) {
        throw new Error('Failed to get a valid response from the API');
      }
      
      console.log('API response received, content length:', rewrittenContent.length);
    } else {
      throw new Error('No AI API client available. Set either ANTHROPIC_API_KEY or OPENAI_API_KEY in your environment.');
    }
    
    // Clean up the response - no need to parse JSON since we're just expecting text
    let cleanedContent = rewrittenContent.trim();
    
    // Remove any markdown code block indicators if present
    cleanedContent = cleanedContent.replace(/```json\s*/g, '').replace(/```\s*$/g, '');
    
    // Remove any JSON formatting that might have been added
    if (cleanedContent.startsWith('{') && cleanedContent.endsWith('}')) {
      try {
        // If it's valid JSON, try to extract the answer
        const parsed = JSON.parse(cleanedContent);
        if (parsed.a) {
          return parsed.a;
        }
      } catch (e) {
        // Not valid JSON, continue with the cleaned content
      }
    }
    
    return cleanedContent;
  } catch (error) {
    console.error('Error processing individual answer:', error);
    // Return the original answer if there was an error
    return answerText;
  }
}

/**
 * Process a batch of FAQ items with AI (OpenAI or Anthropic)
 * @param {Array} faqBatch - A batch of FAQ items to process
 * @returns {Promise<Array>} - The processed FAQ items
 */
async function processFAQBatch(faqBatch) {
  // This function is kept for backward compatibility
  // Now it processes each item individually and combines the results
  try {
    let results = [];
    
    for (let i = 0; i < faqBatch.length; i++) {
      const faqItem = faqBatch[i];
      const rewrittenAnswer = await processIndividualAnswer(faqItem.a, faqItem.q);
      
      results.push({
        q: faqItem.q,
        a: rewrittenAnswer || faqItem.a
      });
      
      // Add a small delay between items
      if (i < faqBatch.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    return results;
  } catch (error) {
    console.error('Error in batch processing:', error);
    return {
      error: error.message,
      originalBatch: faqBatch
    };
  }
}

/**
 * Updates a token's description with the rewritten version
 * @param {string} tokenId - The ID of the token to update
 * @param {string} description - The rewritten description
 * @param {Array} faq - The rewritten FAQ items
 * @returns {Promise<Object>} The updated token
 */
async function updateTokenDescription(tokenId, description, faq = null) {
  try {
    console.log(`Updating description for token ${tokenId}`);
    
    const updateData = { description };
    
    // If FAQ is provided, update it as well
    if (faq) {
      updateData.faq = faq;
    }
    
    // const updatedToken = await prisma.token.update({
    //   where: { id: tokenId },
    //   data: updateData
    // });
    // only update the description column
    await prisma.token.update({
      where: { id: tokenId },
      data: { description }
    });
    
    console.log(`Successfully updated description for ${tokenId}`);
    return tokenId;
  } catch (error) {
    console.error(`Error updating token ${tokenId}:`, error);
    throw error;
  }
}

// Export the functions for use in other scripts
module.exports = {
  emptyAllDescriptions,
  getTokensWithoutDescriptions,
  fetchCoinMarketCapData,
  rewriteDescriptionWithOpenAI,
  updateTokenDescription
};

// If this script is run directly, execute the function
if (require.main === module) {
  // Check command line arguments
  const args = process.argv.slice(2);
  
  if (args.includes('--empty')) {
    emptyAllDescriptions()
      .then(count => {
        console.log(`Completed! Emptied descriptions for ${count} tokens.`);
        process.exit(0);
      })
      .catch(error => {
        console.error('Script failed:', error);
        process.exit(1);
      });
  } else if (args.includes('--fetch')) {
    getTokensWithoutDescriptions()
      .then(() => {
        console.log('Completed fetching token data from CoinMarketCap.');
        process.exit(0);
      })
      .catch(error => {
        console.error('Script failed:', error);
        process.exit(1);
      });
  } else if (args.includes('--update')) {
    // Check if a specific slug is provided
    const slugIndex = args.indexOf('--slug');
    const slug = slugIndex !== -1 && args.length > slugIndex + 1 ? args[slugIndex + 1] : null;
    
    // Create an async function to handle the update process for a single token
    async function updateTokenWithSlug(slug) {
        try {
          // First, find the token in the database
          const token = await prisma.token.findFirst({
            where: {
              cmcSlug: slug
            }
          });
          
          if (!token) {
            console.log(`No token found with slug: ${slug}`);
            process.exit(1);
          }
          
          console.log(`Found token: ${token.name} (${token.ticker})`);
          
          // Fetch data from CoinMarketCap
          const cmcData = await fetchCoinMarketCapData(slug);
          console.log('\nFetched data from CoinMarketCap');
          
          if (!cmcData.description && (!cmcData.faqDescription || cmcData.faqDescription.length === 0)) {
            console.log('No description found for this token on CoinMarketCap');
            console.log('Setting an empty array as the description');
            
            // Update token with empty array instead of exiting
            const updatedToken = await prisma.token.update({
              where: { id: token.id },
              data: { 
                description: '[]'
              }
            });
            
            console.log(`\nSuccessfully updated ${updatedToken.name} with an empty description array`);
            await prisma.$disconnect();
            return true;
          }
          
          // Only use the FAQ description data from CoinMarketCap
          if (!cmcData.faqDescription || cmcData.faqDescription.length === 0) {
            console.log('No FAQ description found for this token on CoinMarketCap');
            console.log('Setting an empty array as the description');
            
            // Update token with empty array instead of creating enhanced FAQ
            const updatedToken = await prisma.token.update({
              where: { id: token.id },
              data: { 
                description: '[]'
              }
            });
            
            console.log(`\nSuccessfully updated ${updatedToken.name} with an empty description array`);
            await prisma.$disconnect();
            return true;
            
            /* DISABLED ENHANCED FAQ GENERATION
            // If there's a description, create a basic FAQ
            if (cmcData.description) {
              console.log('Creating a basic FAQ with available description');
              cmcData.faqDescription = [{
                q: `What is ${token.name}?`,
                a: cmcData.description
              }];
            } else {
              // If no description at all, create a minimal generic FAQ
              console.log('Creating a minimal generic FAQ');
              cmcData.faqDescription = [{
                q: `What is ${token.name}?`,
                a: `${token.name} is a cryptocurrency with the ticker symbol ${token.ticker}.`
              }];
            }
            */
          }
          
          // Rewrite the description using OpenAI
          console.log('\nSending FAQ description to OpenAI for rewriting...');
          console.log(`FAQ items: ${cmcData.faqDescription.length}`);
          
          const rewrittenFAQ = await rewriteDescriptionWithOpenAI(cmcData.faqDescription);
          
          // Save the rewritten description to a file for reference
        //   const outputFilename = `${slug}_rewritten.json`;
        //   fs.writeFileSync(outputFilename, JSON.stringify(rewrittenFAQ, null, 2));
        //   console.log(`Saved rewritten FAQ to ${outputFilename}`);
          
          if (!rewrittenFAQ || !Array.isArray(rewrittenFAQ) || rewrittenFAQ.length === 0) {
            console.log('Could not get a valid FAQ response from the AI');
            console.log('Setting an empty array as the description');
            
            // Update token with empty array instead of exiting
            const updatedToken = await prisma.token.update({
              where: { id: token.id },
              data: { 
                description: '[]'
              }
            });
            
            console.log(`\nSuccessfully updated ${updatedToken.name} with an empty description array`);
            await prisma.$disconnect();
            return true;
          }
          
          // Extract the main description from the first FAQ answer
          const mainDescription = rewrittenFAQ[0]?.a || '';
          
          if (!mainDescription) {
            console.log('Could not extract a valid description from the FAQ');
            console.log('Setting an empty array as the description');
            
            // Update token with empty array instead of exiting
            const updatedToken = await prisma.token.update({
              where: { id: token.id },
              data: { 
                description: '[]'
              }
            });
            
            console.log(`\nSuccessfully updated ${updatedToken.name} with an empty description array`);
            await prisma.$disconnect();
            return true;
          }
          
          // Convert the FAQ JSON to a string to store in the description field
          const faqJsonString = JSON.stringify(rewrittenFAQ);
          
          // Update the token in the database with the FAQ JSON string in the description field
          console.log('\nUpdating token description in the database...');
          const updatedToken = await prisma.token.update({
            where: { id: token.id },
            data: { 
              description: faqJsonString
            }
          });
          
          console.log(`\nSuccessfully updated description for ${updatedToken.name}`);
          console.log('Saved FAQ JSON to description field');
          console.log('JSON preview:', faqJsonString.substring(0, 200) + '...');
          
          await prisma.$disconnect();
          return true;
        } catch (error) {
          console.error('Error updating token:', error);
          await prisma.$disconnect();
          return false;
        }
      }
      
      // Call the async function
      if (slug) {
        console.log(`Fetching and updating description for slug: ${slug}`);
        updateTokenWithSlug(slug)
          .then(success => {
            process.exit(success ? 0 : 1);
          })
          .catch(error => {
            console.error('Unexpected error:', error);
            process.exit(1);
          });
      } else {
        // No slug provided, update all tokens with null descriptions
        console.log('No specific slug provided. Updating all tokens with null descriptions...');
        
        // Create an async function to handle batch updating
        async function updateAllTokensWithNullDescriptions(batchSize = 10) {
          try {
            // Get all tokens with null descriptions and valid CMC slugs
            const tokens = await prisma.token.findMany({
              where: {
                description: null,
                cmcSlug: { not: null }
              },
              select: {
                id: true,
                name: true,
                ticker: true,
                cmcSlug: true
              },
              orderBy: {
                rank: 'asc' // Process highest ranked tokens first
              }
            });
            
            console.log(`Found ${tokens.length} tokens with null descriptions and valid CMC slugs`);
            
            if (tokens.length === 0) {
              console.log('No tokens to update. Exiting.');
              return 0;
            }
            
            // Process tokens in batches
            let successCount = 0;
            let failCount = 0;
            const totalBatches = Math.ceil(tokens.length / batchSize);
            
            for (let batchNum = 0; batchNum < totalBatches; batchNum++) {
              const start = batchNum * batchSize;
              const end = Math.min(start + batchSize, tokens.length);
              const batch = tokens.slice(start, end);
              
              console.log(`\nProcessing batch ${batchNum + 1}/${totalBatches} (${batch.length} tokens)...`);
              
              // Process each token in the batch sequentially to avoid rate limiting
              for (const token of batch) {
                try {
                  console.log(`\nProcessing token: ${token.name} (${token.ticker}) with slug: ${token.cmcSlug}`);
                  
                  // Call the single token update function
                  const success = await updateTokenWithSlug(token.cmcSlug);
                  
                  if (success) {
                    successCount++;
                    console.log(`Successfully updated token ${token.name} (${token.ticker})`);
                  } else {
                    failCount++;
                    console.log(`Failed to update token ${token.name} (${token.ticker})`);
                  }
                  
                  // Add a small delay between requests to avoid rate limiting
                  await new Promise(resolve => setTimeout(resolve, 1000));
                } catch (error) {
                  console.error(`Error processing token ${token.name} (${token.ticker}):`, error);
                  failCount++;
                }
              }
              
              console.log(`\nBatch ${batchNum + 1}/${totalBatches} complete. Success: ${successCount}, Failed: ${failCount}`);
            }
            
            console.log(`\nAll batches processed. Total success: ${successCount}, Total failed: ${failCount}`);
            return successCount;
          } catch (error) {
            console.error('Error updating tokens:', error);
            throw error;
          } finally {
            await prisma.$disconnect();
          }
        }
        
        // Call the batch update function
        updateAllTokensWithNullDescriptions()
          .then(count => {
            console.log(`Completed updating ${count} tokens.`);
            process.exit(0);
          })
          .catch(error => {
            console.error('Script failed:', error);
            process.exit(1);
          });
      }
  } else {
    console.log('Please specify an action:');
    console.log('  --empty   : Empty descriptions for all tokens');
    console.log('  --fetch   : Fetch data from CoinMarketCap for tokens without descriptions');
    console.log('  --update  : Update descriptions for all tokens with null descriptions');
    console.log('  --update --slug [slug] : Update description for a specific token');
    process.exit(0);
  }
}
