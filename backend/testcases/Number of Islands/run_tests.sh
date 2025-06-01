#!/bin/bash

# Define the range of X (for example, from 1 to 5)
start=1
end=20

# Loop over the range of X values
for ((X=$start; X<=$end; X++))
do
    # Define input and output file names
    input_file="input$X.txt"
    output_file="output$X.txt"
    
    # Run the Java program with the input and output file paths as arguments
    echo "Running test case for X=$X with input file $input_file and output file $output_file"
    java Main "$input_file" "$output_file"
    
    # Check if the Java program ran successfully
    if [ $? -eq 0 ]; then
        echo "Test case $X completed successfully."
    else
        echo "Error occurred while processing test case $X."
    fi
done
