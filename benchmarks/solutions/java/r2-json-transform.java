import com.google.gson.*;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.stream.Collectors;

class JsonTransform {
    public static void main(String[] args) {
        String input = new BufferedReader(new InputStreamReader(System.in))
            .lines().collect(Collectors.joining());

        JsonArray users;
        try {
            users = JsonParser.parseString(input).getAsJsonArray();
        } catch (JsonSyntaxException e) {
            System.err.println("error: " + e.getMessage());
            System.exit(1);
            return;
        }

        JsonArray result = new JsonArray();
        for (JsonElement el : users) {
            JsonObject u = el.getAsJsonObject();
            if (u.get("active").getAsBoolean() && u.get("age").getAsInt() > 18) {
                JsonObject out = new JsonObject();
                out.addProperty("name", u.get("name").getAsString());
                out.addProperty("email", u.get("email").getAsString());
                result.add(out);
            }
        }

        System.out.println(new Gson().toJson(result));
    }
}
