from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
from app.graph.bot_graph import app_graph
from langchain_core.messages import HumanMessage, AIMessage
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="AI Mind Reset Bot", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    history: List[Dict[str, str]] = [] # [{'role': 'user', 'content': '...'}, ...]

class ChatResponse(BaseModel):
    response: str
    mood: str
    intent: str

@app.get("/")
async def root():
    return {"message": "AI Mind Reset Bot API is running"}

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        # Convert history format
        lc_messages = []
        for msg in request.history:
            if msg['role'] == 'user':
                lc_messages.append(HumanMessage(content=msg['content']))
            else:
                lc_messages.append(AIMessage(content=msg['content']))
        
        lc_messages.append(HumanMessage(content=request.message))
        
        # Invoke Graph
        result = app_graph.invoke({"messages": lc_messages})
        
        ai_msg = result["messages"][-1].content
        mood = result.get("mood", "neutral")
        intent = result.get("intent", "unknown")
        
        return ChatResponse(response=ai_msg, mood=mood, intent=intent)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
