async function* producer() {
  for (let i = 1; i <= 20; i++) yield i;
}

async function* filterOdd(source) {
  for await (const v of source) {
    if (v % 2 === 1) yield v;
  }
}

for await (const v of filterOdd(producer())) {
  console.log(v);
}
