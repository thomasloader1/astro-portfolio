#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Simple migration tool: lists files importing from src/icons and suggests replacements.
const root = path.resolve(__dirname, '..');
const walk = (dir) => {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const f of files) {
    const full = path.join(dir, f.name);
    if (f.isDirectory()) walk(full);
    else if (full.endsWith('.astro') || full.endsWith('.ts') || full.endsWith('.tsx') || full.endsWith('.js')) {
      const content = fs.readFileSync(full, 'utf8');
      if (content.includes("from '../../icons/") || content.includes("from '../icons/") || content.includes("from './icons/")) {
        console.log('FOUND:', path.relative(root, full));
        // print suggested replacement
        console.log('  Suggest: import Icon from "src/components/ui/Icon.astro" and replace usage with <Icon name="..."/>');
      }
    }
  }
};

walk(root);

console.log('\nDone. Run this script and manually apply replacements or extend with --apply flag to automate.');
