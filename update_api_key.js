#!/usr/bin/env node

/**
 * API Key Update Script
 * Updates the DeepSeek API key in all relevant files
 * 
 * Usage: node update_api_key.js YOUR_NEW_API_KEY
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get the new API key from command line argument
const newApiKey = process.argv[2];

if (!newApiKey) {
  console.error('Error: No API key provided');
  console.log('Usage: node update_api_key.js YOUR_NEW_API_KEY');
  process.exit(1);
}

// Format check
if (!newApiKey.startsWith('sk-') && !newApiKey.match(/^[a-zA-Z0-9]{32,}$/)) {
  console.warn('Warning: The API key format looks unusual. DeepSeek API keys typically start with "sk-" followed by a string of characters.');
  
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  readline.question('Do you want to continue anyway? (y/n): ', (answer) => {
    if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
      console.log('Operation cancelled.');
      process.exit(0);
    }
    readline.close();
    updateKey();
  });
} else {
  updateKey();
}

function updateKey() {
  console.log('Updating DeepSeek API key in all files...');
  
  // List of files to check and update
  const filesToUpdate = [
    '.env',
    'render.yaml',
    'fallback_bot.js'
  ];
  
  let updatedCount = 0;
  
  for (const file of filesToUpdate) {
    const filePath = path.join(__dirname, file);
    
    if (fs.existsSync(filePath)) {
      try {
        let content = fs.readFileSync(filePath, 'utf8');
        let originalContent = content;
        
        // Different update patterns based on file type
        if (file === '.env') {
          // Update in .env file
          content = content.replace(
            /^(#\s*)?DEEPSEEK_API_KEY=.*/m,
            `DEEPSEEK_API_KEY=${newApiKey}`
          );
        } else if (file === 'render.yaml') {
          // Update in render.yaml file
          content = content.replace(
            /(key: DEEPSEEK_API_KEY\s+value: ).*/,
            `$1${newApiKey}`
          );
        } else {
          // Update hardcoded keys in JS files
          const keyPattern = /('|")sk-[a-zA-Z0-9]+('|")/g;
          const hardcodedPattern = /DEEPSEEK_API_KEY.*['"]([^'"]+)['"]/g;
          
          content = content.replace(keyPattern, `'${newApiKey}'`);
          content = content.replace(hardcodedPattern, (match, p1) => {
            return match.replace(p1, newApiKey);
          });
        }
        
        // Only write if changes were made
        if (content !== originalContent) {
          fs.writeFileSync(filePath, content);
          console.log(`✅ Updated API key in ${file}`);
          updatedCount++;
        } else {
          console.log(`ℹ️ No API key found in ${file} or no changes needed`);
        }
      } catch (error) {
        console.error(`❌ Error updating ${file}:`, error.message);
      }
    } else {
      console.warn(`ℹ️ File ${file} does not exist, skipping.`);
    }
  }
  
  console.log(`\nUpdate complete. Updated ${updatedCount} file(s).`);
  
  if (updatedCount > 0) {
    console.log('\nTo verify the changes, run:');
    console.log('node test_api_connection.js');
    
    // If git is available, show what files changed
    try {
      console.log('\nGit diff summary:');
      execSync('git diff --name-only', { stdio: 'inherit' });
    } catch (error) {
      // Git command failed, probably not a git repo
    }
  }
}
