import { readFileSync } from "fs";

interface User {
  name: string;
  age: number;
  active: boolean;
  email: string;
}

let users: User[];
try {
  users = JSON.parse(readFileSync("/dev/stdin", "utf-8"));
} catch (e: any) {
  console.error(`error: ${e.message}`);
  process.exit(1);
}

const result = users
  .filter((u) => u.active && u.age > 18)
  .map(({ name, email }) => ({ name, email }));

console.log(JSON.stringify(result));
