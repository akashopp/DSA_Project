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

        int n = r.nextInt(5, 1000); // Random n (rows)
        int m = r.nextInt(5, 1000); // Random m (columns)
        int[][] arr = new int[n][m];

        // Create the input file and write the randomly generated matrix to it
        try (BufferedWriter writer = new BufferedWriter(new FileWriter(inputFilePath))) {
            writer.write(n + " " + m); // Write n and m in the first line
            writer.newLine(); // Move to the next line

            for (int i = 0; i < n; i++) {
                for (int j = 0; j < m; j++) {
                    arr[i][j] = r.nextInt(0, 2); // Randomly fill the matrix with 0s and 1s
                    writer.write(arr[i][j] + " "); // Write random 0 or 1
                }
                writer.newLine(); // Move to the next line after each row
            }

            System.out.println("Random matrix written to file: " + inputFilePath);
        } catch (IOException e) {
            System.out.println("An error occurred while writing to the input file: " + e.getMessage());
            return;
        }

        // Now, count the number of islands in the matrix
        int numOfIslands = countIslands(arr, n, m);

        // Write the result to the output file
        try (BufferedWriter writer = new BufferedWriter(new FileWriter(outputFilePath))) {
            writer.write(String.valueOf(numOfIslands));
            writer.newLine();
            System.out.println("Result written to file: " + outputFilePath);
        } catch (IOException e) {
            System.out.println("An error occurred while writing to the output file: " + e.getMessage());
        }
    }

    // Helper function to perform DFS and mark visited islands
    private static void dfs(int[][] arr, int x, int y, int n, int m) {
        arr[x][y] = 0; // Mark as visited by changing land to water

        for (int i = 0; i < 4; i++) {
            int newX = x + directions[i];
            int newY = y + directions[i + 1];

            // Check bounds and if the cell is land
            if (newX >= 0 && newX < n && newY >= 0 && newY < m && arr[newX][newY] == 1) {
                dfs(arr, newX, newY, n, m);
            }
        }
    }

    // Main function to count the number of islands
    private static int countIslands(int[][] arr, int n, int m) {
        int islandCount = 0;

        for (int i = 0; i < n; i++) {
            for (int j = 0; j < m; j++) {
                if (arr[i][j] == 1) {  // Found an island
                    dfs(arr, i, j, n, m); // Perform DFS to mark the island
                    islandCount++; // Increment island count
                }
            }
        }
        return islandCount;
    }
}