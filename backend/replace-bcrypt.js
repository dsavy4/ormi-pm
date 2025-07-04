// replace-bcrypt.js - Replace bcrypt with bcryptjs for Workers compatibility

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to replace bcrypt with bcryptjs in a file
function replaceBcryptInFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace import statements
  content = content.replace(/import\s+.*?\s+from\s+['"]bcrypt['"]/g, "import bcrypt from 'bcryptjs'");
  content = content.replace(/import\s+bcrypt\s+from\s+['"]bcrypt['"]/g, "import bcrypt from 'bcryptjs'");
  content = content.replace(/require\(['"]bcrypt['"]\)/g, "require('bcryptjs')");
  
  // Replace bcrypt usage patterns
  content = content.replace(/bcrypt\.hash\(/g, 'bcrypt.hash(');
  content = content.replace(/bcrypt\.compare\(/g, 'bcrypt.compare(');
  content = content.replace(/bcrypt\.hashSync\(/g, 'bcrypt.hashSync(');
  content = content.replace(/bcrypt\.compareSync\(/g, 'bcrypt.compareSync(');
  
  fs.writeFileSync(filePath, content);
  console.log(`✓ Replaced bcrypt with bcryptjs in ${filePath}`);
}

// Function to recursively find and replace in all JS files
function replaceInDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    console.log(`Directory not found: ${dirPath}`);
    return;
  }

  const files = fs.readdirSync(dirPath);
  
  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      replaceInDirectory(filePath);
    } else if (file.endsWith('.js') || file.endsWith('.mjs')) {
      replaceBcryptInFile(filePath);
    }
  });
}

// Replace in the dist directory
const distDir = path.join(__dirname, 'dist');
console.log('Replacing bcrypt with bcryptjs in built files...');
replaceInDirectory(distDir);

console.log('✓ BCrypt replacement completed successfully'); 