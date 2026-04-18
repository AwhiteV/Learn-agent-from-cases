import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const projectRoot = path.resolve(import.meta.dirname, '..');
const rendererPath = path.join(projectRoot, 'components', 'markdown-renderer.tsx');

test('markdown renderer unwraps the outer pre element for fenced code blocks', () => {
  const source = fs.readFileSync(rendererPath, 'utf8');

  assert.match(
    source,
    /pre\s*\(\s*\{\s*children\s*\}\s*\)\s*\{[\s\S]*overflow-hidden rounded-lg border bg-muted[\s\S]*match \? match\[1\] : 'text'[\s\S]*<pre className="overflow-x-auto bg-\[#0d1117\] p-4 text-sm text-slate-100">[\s\S]*\{children\}[\s\S]*<\/pre>[\s\S]*\}/s
  );
});

test('markdown renderer keeps the code component focused on inline code only', () => {
  const source = fs.readFileSync(rendererPath, 'utf8');

  assert.match(
    source,
    /code\s*\(\s*\{[^}]*className[^}]*children[^}]*\}\s*:\s*any\s*\)\s*\{[\s\S]*String\(children\)\.includes\('\\n'\)[\s\S]*<code className=\{className\} \{\.\.\.props\}>[\s\S]*\{children\}[\s\S]*<\/code>[\s\S]*rounded bg-muted px-1\.5 py-0\.5 text-sm font-mono/s
  );
});
