#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <pthread.h>
#include <curl/curl.h>

#define MAX_CONCURRENT 4

struct FetchArgs { const char *url; };

struct Buffer { char *data; size_t len; };

static size_t write_cb(void *ptr, size_t size, size_t nmemb, void *userdata) {
    struct Buffer *buf = userdata;
    size_t total = size * nmemb;
    buf->data = realloc(buf->data, buf->len + total);
    memcpy(buf->data + buf->len, ptr, total);
    buf->len += total;
    return total;
}

void *fetch(void *arg) {
    struct FetchArgs *a = arg;
    CURL *curl = curl_easy_init();
    struct Buffer buf = {NULL, 0};
    long status = 0;

    curl_easy_setopt(curl, CURLOPT_URL, a->url);
    curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, write_cb);
    curl_easy_setopt(curl, CURLOPT_WRITEDATA, &buf);
    curl_easy_setopt(curl, CURLOPT_TIMEOUT, 5L);

    CURLcode res = curl_easy_perform(curl);
    if (res == CURLE_OK) {
        curl_easy_getinfo(curl, CURLINFO_RESPONSE_CODE, &status);
        printf("%s: %ld (%zu bytes)\n", a->url, status, buf.len);
    } else {
        printf("%s: error: %s\n", a->url, curl_easy_strerror(res));
    }

    free(buf.data);
    curl_easy_cleanup(curl);
    return NULL;
}

int main(void) {
    const char *urls[] = {
        "https://httpbin.org/get",
        "https://httpbin.org/status/404",
        "https://httpbin.org/delay/1",
        "https://httpbin.org/bytes/1024",
        "https://invalid.example.test",
    };
    int n = sizeof(urls) / sizeof(urls[0]);

    curl_global_init(CURL_GLOBAL_DEFAULT);
    pthread_t threads[MAX_CONCURRENT];
    struct FetchArgs args[MAX_CONCURRENT];

    for (int i = 0; i < n; i += MAX_CONCURRENT) {
        int batch = (n - i < MAX_CONCURRENT) ? n - i : MAX_CONCURRENT;
        for (int j = 0; j < batch; j++) {
            args[j].url = urls[i + j];
            pthread_create(&threads[j], NULL, fetch, &args[j]);
        }
        for (int j = 0; j < batch; j++) {
            pthread_join(threads[j], NULL);
        }
    }

    curl_global_cleanup();
    return 0;
}
