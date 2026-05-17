import { readFileSync } from "fs";

const path = process.argv[2];
if (!path) {
  console.error("error: no file argument");
  process.exit(1);
}

let text;
try {
  text = readFileSync(path, "utf-8");
} catch (e) {
  console.error(`error: ${e.message}`);
  process.exit(1);
}

const counts = {};
for (const word of text.toLowerCase().split(/[^a-z]+/)) {
  if (word) counts[word] = (counts[word] || 0) + 1;
}

Object.entries(counts)
  .sort(([a, ac], [b, bc]) => bc - ac || a.localeCompare(b))
  .slice(0, 10)
  .forEach(([word, count]) => console.log(`${word}: ${count}`));
