#include <stdio.h>
#include <pthread.h>

#define BUFSIZE 32

typedef struct {
    int buf[BUFSIZE];
    int head, tail, count;
    pthread_mutex_t mtx;
    pthread_cond_t not_empty, not_full;
} Channel;

void ch_init(Channel *ch) {
    ch->head = ch->tail = ch->count = 0;
    pthread_mutex_init(&ch->mtx, NULL);
    pthread_cond_init(&ch->not_empty, NULL);
    pthread_cond_init(&ch->not_full, NULL);
}

void ch_send(Channel *ch, int val) {
    pthread_mutex_lock(&ch->mtx);
    while (ch->count == BUFSIZE) pthread_cond_wait(&ch->not_full, &ch->mtx);
    ch->buf[ch->tail] = val;
    ch->tail = (ch->tail + 1) % BUFSIZE;
    ch->count++;
    pthread_cond_signal(&ch->not_empty);
    pthread_mutex_unlock(&ch->mtx);
}

int ch_recv(Channel *ch) {
    pthread_mutex_lock(&ch->mtx);
    while (ch->count == 0) pthread_cond_wait(&ch->not_empty, &ch->mtx);
    int val = ch->buf[ch->head];
    ch->head = (ch->head + 1) % BUFSIZE;
    ch->count--;
    pthread_cond_signal(&ch->not_full);
    pthread_mutex_unlock(&ch->mtx);
    return val;
}

Channel ch1, ch2;

void *producer(void *arg) {
    for (int i = 1; i <= 20; i++) ch_send(&ch1, i);
    ch_send(&ch1, -1);
    return NULL;
}

void *filter(void *arg) {
    int v;
    while ((v = ch_recv(&ch1)) != -1) {
        if (v % 2 == 1) ch_send(&ch2, v);
    }
    ch_send(&ch2, -1);
    return NULL;
}

int main(void) {
    ch_init(&ch1);
    ch_init(&ch2);

    pthread_t t1, t2;
    pthread_create(&t1, NULL, producer, NULL);
    pthread_create(&t2, NULL, filter, NULL);

    int v;
    while ((v = ch_recv(&ch2)) != -1) {
        printf("%d\n", v);
    }

    pthread_join(t1, NULL);
    pthread_join(t2, NULL);
    return 0;
}
