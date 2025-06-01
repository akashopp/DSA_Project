from fastapi import FastAPI
from pydantic import BaseModel
from groq import Groq
import os
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

# Initialize FastAPI app
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# Define request body schema
class ChatRequest(BaseModel):
    message: str

@app.get("/")
def read_root():
    return {"message": "Welcome to the DSA Chatbot API. Use /chat to POST messages."}

# POST /chat endpoint
@app.post("/chat")
async def chat(request: ChatRequest):
    try:
        chat_completion = client.chat.completions.create(
            model="llama3-70b-8192",
            messages=[
                {"role": "user", "content": request.message}
            ],
        )

        content = chat_completion.choices[0].message.content

        # === Optional: Auto-wrap code with markdown fencing ===
        def wrap_code_blocks(text: str) -> str:
            if "```" in text:
                return text  # Already wrapped properly
            if any(keyword in request.message.lower() for keyword in ["code", "python", "implement", "function", "class"]):
                return f"```python\n{text.strip()}\n```"
            return text

        return {"response": wrap_code_blocks(content)}

    except Exception as e:
        return {"error": str(e)}

