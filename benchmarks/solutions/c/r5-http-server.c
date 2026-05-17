#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <microhttpd.h>

static enum MHD_Result handler(void *cls, struct MHD_Connection *conn,
    const char *url, const char *method, const char *version,
    const char *upload_data, size_t *upload_data_size, void **con_cls) {
    char body[256];
    int status;

    if (strcmp(url, "/hello") == 0) {
        const char *name = MHD_lookup_connection_value(conn,
            MHD_GET_ARGUMENT_KIND, "name");
        if (!name) name = "World";
        snprintf(body, sizeof(body),
            "{\"greeting\":\"Hello, %s!\"}", name);
        status = 200;
    } else {
        snprintf(body, sizeof(body), "{\"error\":\"not found\"}");
        status = 404;
    }

    struct MHD_Response *resp = MHD_create_response_from_buffer(
        strlen(body), body, MHD_RESPMEM_MUST_COPY);
    MHD_add_response_header(resp, "Content-Type", "application/json");
    enum MHD_Result ret = MHD_queue_response(conn, status, resp);
    MHD_destroy_response(resp);
    return ret;
}

int main(void) {
    struct MHD_Daemon *d = MHD_start_daemon(
        MHD_USE_INTERNAL_POLLING_THREAD, 8080,
        NULL, NULL, &handler, NULL, MHD_OPTION_END);
    if (!d) return 1;
    getchar();
    MHD_stop_daemon(d);
    return 0;
}
