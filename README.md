If any issues are faced like the code is faulty or any such issue, please clone the repository from the following link using this command: 
git clone "https://github.com/akashopp/DSA-Project.git"

chatbot section:
CHATBOT STEPS       
1) First go to groq cloud (https://console.groq.com/home) and generate an api, remember to copy the api key as it will be visible only once  
2) first go to the chatbot folder on terminal.  
3) create a virtual env (must) command: **python -m venv myenv**  
4) go to virtual env command: if git bash :**source venv/Scripts/activate**    
5) create a .env file and store the GROQ_API_KEY="Enter_The_Key"  
6) run this command: **pip install fastapi uvicorn python-dotenv groq** (ensure it's installed in the virtual env)  
7) now run: uvicorn test:app --reload  
8) now that the server is running try fetching a response from here  

steps to set-up few things in order to get the project running:
cd frontend and run the command: npm -i force
1. GROQ API Key (Sanity.io)
If your project uses Sanity.io and you need to query content using GROQ, follow these steps to generate an API token:

Generate a GROQ API Token
Go to https://www.groqcloud and select your project.

Navigate to the API section.

Under Tokens, click "Add API token".

Give the token a name and assign Read access (or appropriate permissions).

Copy the generated token.

Add to .env file:
GROQ_SPI_KEY
2. MongoDB Connection String
You can connect to MongoDB either locally or using MongoDB Atlas (cloud-based). Update the .env file with the appropriate URI.

Local MongoDB Setup

MongoDB Atlas Setup
Sign in at https://cloud.mongodb.com.

Create a cluster if you haven't already.

Add your IP address under Network Access (or use 0.0.0.0/0 for unrestricted access during development).

Create a database user with a username and password.

Click Connect > Connect your application, and copy the connection string.

Replace <username>, <password>, and <dbname> with your actual values:

ini
Copy
Edit
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/<dbname>?retryWrites=true&w=majority
Example .env File
ini
Copy
Edit
# GROQ/Sanity
GROQ_API_KEY=""
 in OUR CASE THE STRING IS ALREADY PRESENT
# MongoDB
MONGODB_URI=mongodb://localhost:27017/mydatabase
# or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster0.mongodb.net/mydatabase
Make sure not to commit your .env file to version control. Add .env to your .gitignore file to keep your credentials safe.

