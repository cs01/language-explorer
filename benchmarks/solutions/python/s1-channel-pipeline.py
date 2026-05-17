from queue import Queue
from threading import Thread

def producer(out):
    for i in range(1, 21):
        out.put(i)
    out.put(None)

def filter_odd(inp, out):
    while (v := inp.get()) is not None:
        if v % 2 == 1:
            out.put(v)
    out.put(None)

def consumer(inp):
    while (v := inp.get()) is not None:
        print(v)

ch1, ch2 = Queue(), Queue()
Thread(target=producer, args=(ch1,)).start()
Thread(target=filter_odd, args=(ch1, ch2)).start()
consumer(ch2)
