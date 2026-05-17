#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>

#define MAX_WORDS 10000
#define MAX_WORD_LEN 64

struct Entry { char word[MAX_WORD_LEN]; int count; };

int cmp(const void *a, const void *b) {
    const struct Entry *ea = a, *eb = b;
    if (eb->count != ea->count) return eb->count - ea->count;
    return strcmp(ea->word, eb->word);
}

int main(int argc, char **argv) {
    if (argc < 2) { fprintf(stderr, "error: no file argument\n"); return 1; }

    FILE *f = fopen(argv[1], "r");
    if (!f) { fprintf(stderr, "error: cannot open %s\n", argv[1]); return 1; }

    struct Entry entries[MAX_WORDS];
    int n = 0;
    char word[MAX_WORD_LEN];
    int wi = 0;
    int c;

    while ((c = fgetc(f)) != EOF) {
        if (isalpha(c)) {
            if (wi < MAX_WORD_LEN - 1) word[wi++] = tolower(c);
        } else if (wi > 0) {
            word[wi] = '\0';
            wi = 0;
            int found = -1;
            for (int i = 0; i < n; i++) {
                if (strcmp(entries[i].word, word) == 0) { found = i; break; }
            }
            if (found >= 0) {
                entries[found].count++;
            } else if (n < MAX_WORDS) {
                strcpy(entries[n].word, word);
                entries[n].count = 1;
                n++;
            }
        }
    }
    if (wi > 0) {
        word[wi] = '\0';
        int found = -1;
        for (int i = 0; i < n; i++) {
            if (strcmp(entries[i].word, word) == 0) { found = i; break; }
        }
        if (found >= 0) entries[found].count++;
        else if (n < MAX_WORDS) { strcpy(entries[n].word, word); entries[n].count = 1; n++; }
    }
    fclose(f);

    qsort(entries, n, sizeof(struct Entry), cmp);
    for (int i = 0; i < 10 && i < n; i++) {
        printf("%s: %d\n", entries[i].word, entries[i].count);
    }
    return 0;
}
