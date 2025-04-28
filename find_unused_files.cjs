const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get all TypeScript and TypeScript React files
const sourceFiles = execSync('Get-ChildItem -Path src -Recurse -File -Include *.tsx,*.ts | Where-Object { $_.DirectoryName -notlike "*node_modules*" } | Select-Object -ExpandProperty FullName', { encoding: 'utf8' })
  .split('\n')
  .filter(file => file.trim() !== '')
  .map(file => file.trim());

// Map to store if a file is imported by any other file
const isImported = {};
// Map to store what files import each file
const importedBy = {};

// Initialize maps with all source files
sourceFiles.forEach(file => {
  const relativePath = path.relative(process.cwd(), file).replace(/\\/g, '/');
  isImported[relativePath] = false;
  importedBy[relativePath] = [];
});

// Analyze imports in each file
sourceFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const relativePath = path.relative(process.cwd(), file).replace(/\\/g, '/');
  
  // Find import statements
  const importRegex = /import\s+(?:[\w\s{},*]+\s+from\s+)?['"]([^'"]+)['"]/g;
  let match;
  
  while ((match = importRegex.exec(content)) !== null) {
    let importPath = match[1];
    
    // Handle relative imports
    if (importPath.startsWith('.')) {
      const sourceDir = path.dirname(file);
      // Normalize import path (handle .js/.ts extension differences)
      let fullImportPath = path.resolve(sourceDir, importPath);
      
      // If the import doesn't have an extension, try different extensions
      if (!path.extname(fullImportPath)) {
        const extensions = ['.ts', '.tsx', '.js', '.jsx'];
        for (const ext of extensions) {
          const testPath = `${fullImportPath}${ext}`;
          if (fs.existsSync(testPath)) {
            fullImportPath = testPath;
            break;
          }
          
          // Check for index files
          const indexPath = path.join(fullImportPath, `index${ext}`);
          if (fs.existsSync(indexPath)) {
            fullImportPath = indexPath;
            break;
          }
        }
      }
      
      // Convert to relative path from project root
      const normalizedImportPath = path.relative(process.cwd(), fullImportPath).replace(/\\/g, '/');
      
      // Check if this is one of our source files
      if (normalizedImportPath in isImported) {
        isImported[normalizedImportPath] = true;
        importedBy[normalizedImportPath].push(relativePath);
      }
    }
  }
});

// Check for files that are directly referenced without import statements
// (e.g., React components referenced in JSX)
sourceFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const relativePath = path.relative(process.cwd(), file).replace(/\\/g, '/');
  const filename = path.parse(file).name;
  
  // Special case for components that might be used without imports
  if (filename !== 'index') {
    // Look for usage of the component name in other files
    sourceFiles.forEach(otherFile => {
      if (otherFile !== file) {
        const otherContent = fs.readFileSync(otherFile, 'utf8');
        const otherRelativePath = path.relative(process.cwd(), otherFile).replace(/\\/g, '/');
        
        // Look for <ComponentName or <ComponentName.
        const componentUsageRegex = new RegExp(`<${filename}[\\s.>]`, 'g');
        if (componentUsageRegex.test(otherContent)) {
          isImported[relativePath] = true;
          importedBy[relativePath].push(otherRelativePath);
        }
      }
    });
  }
});

// Consider entry points as imported (App.tsx, main.tsx)
['src/App.tsx', 'src/main.tsx'].forEach(entryPoint => {
  if (entryPoint in isImported) {
    isImported[entryPoint] = true;
  }
});

// Mark special files that we know are used
// App.tsx.final and App.tsx.example seem to be examples/backups
const specialFiles = [
  'src/App.tsx.final',
  'src/App.tsx.example'
];

specialFiles.forEach(file => {
  if (file in isImported) {
    isImported[file] = true; // Mark as used
  }
});

// Find unused files
const unusedFiles = Object.keys(isImported).filter(file => !isImported[file]);

console.log('Unused files:');
unusedFiles.forEach(file => {
  console.log(file);
});

console.log('\nTotal unused files:', unusedFiles.length);
console.log('Total source files:', Object.keys(isImported).length); 