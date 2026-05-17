import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Pattern;

class WordFreq {
    public static void main(String[] args) {
        if (args.length == 0) {
            System.err.println("error: no file argument");
            System.exit(1);
        }

        String text;
        try {
            text = Files.readString(Path.of(args[0])).toLowerCase();
        } catch (IOException e) {
            System.err.println("error: " + e.getMessage());
            System.exit(1);
            return;
        }

        Map<String, Integer> counts = new HashMap<>();
        for (String word : Pattern.compile("[^a-z]+").split(text)) {
            if (!word.isEmpty()) {
                counts.merge(word, 1, Integer::sum);
            }
        }

        counts.entrySet().stream()
            .sorted(Map.Entry.<String, Integer>comparingByValue().reversed()
                .thenComparing(Map.Entry.comparingByKey()))
            .limit(10)
            .forEach(e -> System.out.println(e.getKey() + ": " + e.getValue()));
    }
}
