import java.io.*;
import java.util.*;

public class Main {
    // Directions for moving up, down, left, right
    private static final int[] directions = {-1, 0, 1, 0, -1, 0};

    public static void main(String[] args) {
        if (args.length != 2) {
            System.out.println("Usage: java Main <input-file-path> <output-file-path>");
            return;
        }

        String inputFilePath = args[0];  // First file with input matrix
        String outputFilePath = args[1]; // Second file to write result (number of islands)

        Random r = new Random();
        int mx = 200000;
        int n = mx, sum = r.nextInt(0, 5 * mx);
        int[] arr = new int[n];
        // Create the input file and write the randomly generated matrix to it
        try (BufferedWriter writer = new BufferedWriter(new FileWriter(inputFilePath))) {
            writer.write(n + " " + sum); // Write n and m in the first line
            writer.newLine(); // Move to the next line

            for (int i = 0; i < n; i++) {
                arr[i] = r.nextInt(0, mx);
                writer.write(arr[i] + " "); 
            }
            writer.newLine(); 
            System.out.println("Testcase written to file: " + inputFilePath);
        } catch (IOException e) {
            System.out.println("An error occurred while writing to the input file: " + e.getMessage());
            return;
        }

        int[] res = new int[]{-1, -1};
        Map<Integer, Queue<Integer>> map = new HashMap<>();
        for(int i = 0; i < n; i++) {
            if(!map.containsKey(arr[i])) map.put(arr[i], new LinkedList<>());
            map.get(arr[i]).add(i);
        }
        for(int i = 0; i < n; i++) {
            int req = sum - arr[i];
            if(!map.containsKey(req)) continue;
            var q = map.get(req);
            while(!q.isEmpty() && q.peek() <= i) q.poll();
            if(!q.isEmpty()) {
                res[0] = i;
                res[1] = q.poll();
                break;
            }
        }
        // Write the result to the output file
        try (BufferedWriter writer = new BufferedWriter(new FileWriter(outputFilePath))) {
            writer.write(res[0] + " " + res[1]);
            writer.newLine();
            System.out.println("Result written to file: " + outputFilePath);
        } catch (IOException e) {
            System.out.println("An error occurred while writing to the output file: " + e.getMessage());
        }
    }
}