import sys
from collections import Counter

def main():
    try:
        text = open(sys.argv[1]).read().lower()
    except (IndexError, FileNotFoundError) as e:
        print(f"error: {e}", file=sys.stderr)
        sys.exit(1)

    words = [w for w in text.split() if w.isalpha()]
    counts = Counter(words)
    for word, count in counts.most_common(10):
        print(f"{word}: {count}")

if __name__ == "__main__":
    main()
