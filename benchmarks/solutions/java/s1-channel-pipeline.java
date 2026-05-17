import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;

class ChannelPipeline {
    public static void main(String[] args) throws InterruptedException {
        BlockingQueue<Integer> ch1 = new LinkedBlockingQueue<>();
        BlockingQueue<Integer> ch2 = new LinkedBlockingQueue<>();

        Thread.startVirtualThread(() -> {
            for (int i = 1; i <= 20; i++) ch1.add(i);
            ch1.add(-1);
        });

        Thread.startVirtualThread(() -> {
            try {
                int v;
                while ((v = ch1.take()) != -1) {
                    if (v % 2 == 1) ch2.add(v);
                }
                ch2.add(-1);
            } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
        });

        int v;
        while ((v = ch2.take()) != -1) {
            System.out.println(v);
        }
    }
}
