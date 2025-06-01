CHATBOT STEPS
First go to groq cloud (https://console.groq.com/home) and generate an api, remember to copy the api key as it will be visible only once
first go to the chatbot folder on terminal.
create a virtual env (must) command: **python -m venv myenv**
go to virtual env command: if git bash :**source venv/Scripts/activate**
create a .env file and store the GROQ_API_KEY="Enter_The_Key"
run this command: **pip install fastapi uvicorn python-dotenv groq** (ensure it's installed in the virtual env)
now run: uvicorn test:app --reload
now that the server is running try fetching a response from here



