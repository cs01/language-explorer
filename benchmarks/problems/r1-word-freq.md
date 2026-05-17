# R1: Word Frequency Counter

## Problem

Read a text file, count frequency of each word (case-insensitive), print top 10 words by frequency.

## Input

- File path as command-line argument

## Output

- Top 10 words, one per line: `word: count`
- Sorted by count descending, ties broken alphabetically

## Constraints

- Handle file-not-found gracefully (print error, exit non-zero)
- Words = contiguous alphabetic characters (split on non-alpha)
- Case-insensitive (normalize to lowercase)

## What This Tests

- File I/O with error handling
- String manipulation (split, lowercase)
- HashMap (insert/update frequency)
- Sorting with custom comparator
- Command-line argument access
- Formatting output
