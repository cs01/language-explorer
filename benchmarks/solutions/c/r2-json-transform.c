#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <cjson/cJSON.h>

int main(void) {
    char buf[65536];
    size_t len = fread(buf, 1, sizeof(buf) - 1, stdin);
    buf[len] = '\0';

    cJSON *users = cJSON_Parse(buf);
    if (!users) {
        fprintf(stderr, "error: invalid JSON\n");
        return 1;
    }

    cJSON *result = cJSON_CreateArray();
    cJSON *u;
    cJSON_ArrayForEach(u, users) {
        cJSON *active = cJSON_GetObjectItem(u, "active");
        cJSON *age = cJSON_GetObjectItem(u, "age");
        if (cJSON_IsTrue(active) && age->valueint > 18) {
            cJSON *out = cJSON_CreateObject();
            cJSON_AddStringToObject(out, "name",
                cJSON_GetObjectItem(u, "name")->valuestring);
            cJSON_AddStringToObject(out, "email",
                cJSON_GetObjectItem(u, "email")->valuestring);
            cJSON_AddItemToArray(result, out);
        }
    }

    char *json = cJSON_PrintUnformatted(result);
    puts(json);
    free(json);
    cJSON_Delete(users);
    cJSON_Delete(result);
    return 0;
}
