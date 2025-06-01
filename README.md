If any issues are faced like the code is faulty or any such issue, please clone the repository from the following link using this command: 
git clone "https://github.com/akashopp/DSA_Project.git"

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
open a terminal and run "cd frontend && npm -i force && npm run dev"
open another terminal and run "cd backend && npm -i && npm run dev"
1. GROQ API Key (Sanity.io)
If your project uses Sanity.io and you need to query content using GROQ, follow these steps to generate an API token:

Generate a GROQ API Token
Go to https://www.groqcloud and select your project.

Navigate to the API section.

Under Tokens, click "Add API token".

Give the token a name and assign Read access (or appropriate permissions).

Copy the generated token.

Add to .env file (under Chatbot folder):
GROQ_SPI_KEY
