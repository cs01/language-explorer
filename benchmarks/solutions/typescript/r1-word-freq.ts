import { readFileSync } from "fs";

const path = process.argv[2];
if (!path) {
  console.error("error: no file argument");
  process.exit(1);
}

let text: string;
try {
  text = readFileSync(path, "utf-8");
} catch (e: any) {
  console.error(`error: ${e.message}`);
  process.exit(1);
}

const counts = new Map<string, number>();
for (const word of text.toLowerCase().split(/[^a-zA-Z]+/)) {
  if (word) counts.set(word, (counts.get(word) ?? 0) + 1);
}

const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

for (const [word, count] of sorted.slice(0, 10)) {
  console.log(`${word}: ${count}`);
}
