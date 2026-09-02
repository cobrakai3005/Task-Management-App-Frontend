import fs from 'fs';
import path from 'path';

const replaceMap = {
  'bg-white': 'bg-white dark:bg-gray-800',
  'bg-gray-50': 'bg-gray-50 dark:bg-gray-900',
  'text-gray-900': 'text-gray-900 dark:text-gray-100',
  'text-gray-800': 'text-gray-800 dark:text-gray-200',
  'text-gray-700': 'text-gray-700 dark:text-gray-300',
  'text-gray-600': 'text-gray-600 dark:text-gray-400',
  'text-gray-500': 'text-gray-500 dark:text-gray-400',
  'border-gray-200': 'border-gray-200 dark:border-gray-700',
  'border-gray-100': 'border-gray-100 dark:border-gray-800',
  'border-gray-300': 'border-gray-300 dark:border-gray-600',
  'hover:bg-gray-50': 'hover:bg-gray-50 dark:hover:bg-gray-700',
  'hover:bg-gray-200': 'hover:bg-gray-200 dark:hover:bg-gray-700',
  'hover:bg-gray-100': 'hover:bg-gray-100 dark:hover:bg-gray-700',
  'bg-blue-50': 'bg-blue-50 dark:bg-blue-900/30',
  'text-blue-700': 'text-blue-700 dark:text-blue-300',
};

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Avoid double replacing if script run multiple times
      if (!content.includes('dark:bg-gray-800')) {
        for (const [find, replace] of Object.entries(replaceMap)) {
          // Replace only whole words inside classNames
          const regex = new RegExp(`\\b${find}\\b(?! dark:)`, 'g');
          content = content.replace(regex, replace);
        }
        fs.writeFileSync(fullPath, content);
      }
    }
  }
}

processDir('./src');
console.log('Done applying dark classes.');
