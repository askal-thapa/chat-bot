from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from langchain_core.prompts import ChatPromptTemplate
from app.core.config import settings
from app.models.state import BotState

llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash-lite", google_api_key=settings.GOOGLE_API_KEY)

from langchain_core.pydantic_v1 import BaseModel, Field
from typing import Optional

from langchain_core.pydantic_v1 import BaseModel, Field
from typing import Optional

class BotResponse(BaseModel):
    response: str = Field(description="The conversational response to the user.")
    mood: str = Field(description="The detected mood of the user. One of: Happy, Sad, Anxious, Neutral, Angry, Excited, Stressed.")
    suggested_activity: Optional[str] = Field(description="A short, specific activity or content based on mood. E.g. A joke (Happy), A deep breath exercise (Anxious), A fun fact (Neutral).")
    activity_type: Optional[str] = Field(description="Type of activity: 'joke', 'meditation', 'fact', 'challenge', 'none'.")

def classify_input(state: BotState):
    """Classifies the user input into Small Talk, Therapy, or Off-topic."""
    messages = state['messages']
    last_message = messages[-1].content if messages else ""
    
    classification_prompt = ChatPromptTemplate.from_template(
        """
        You are the 'AI Stress Reducer', a helpful assistant for mental well-being.
        Classify the user's input:
        1. "small_talk": Casual chat, greetings, general questions.
        2. "therapy": Stress, anxiety, sadness, emotional topics, needing advice.
        3. "off_topic": Unrelated topics (coding, politics, math).

        User Input: {input}
        
        Return ONLY the category name.
        """
    )
    chain = classification_prompt | llm
    response = chain.invoke({"input": last_message})
    intent = response.content.strip().lower()
    
    if "small_talk" in intent: intent = "small_talk"
    elif "therapy" in intent: intent = "therapy"
    elif "off_topic" in intent: intent = "off_topic"
    else: intent = "off_topic" 

    return {"intent": intent}

def handle_small_talk(state: BotState):
    """Handles small talk. If happy/neutral, suggests fun things."""
    messages = state['messages']
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are the 'AI Stress Reducer'. You are a friendly, witty, and positive companion. "
                   "Engage in small talk. "
                   "If the user seems Happy/Excited, tell a Joke or a Fun Fact as a 'suggested_activity'. "
                   "If Neutral, share an interesting short tidbit or ask a fun question. "
                   "Analyze the mood."),
        ("placeholder", "{messages}")
    ])
    
    structured_llm = llm.with_structured_output(BotResponse)
    chain = prompt | structured_llm
    
    try:
        result = chain.invoke({"messages": messages})
        return {
            "messages": [AIMessage(content=result.response)], 
            "mood": result.mood,
            "suggested_activity": result.suggested_activity,
            "activity_type": result.activity_type
        }
    except Exception:
        return {
            "messages": [AIMessage(content="I'm here for you! How are things?")],
            "mood": "Neutral",
            "suggested_activity": None,
            "activity_type": "none"
        }

def handle_therapy(state: BotState):
    """Handles stress/anxiety. Suggests calming activities."""
    messages = state['messages']
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are the 'AI Stress Reducer'. Your goal is to help users feel better. "
                   "Offer specific, actionable support. "
                   "If Anxious/Stressed: Suggest a breathing exercise (e.g. 4-7-8 breathing) or a grounding technique (5-4-3-2-1). "
                   "If Sad: Offer a comforting thought or a very gentle, uplifting activity. "
                   "Be empathetic and non-judgmental. "
                   "Disclaimer: You are not a doctor."),
        ("placeholder", "{messages}")
    ])
    
    structured_llm = llm.with_structured_output(BotResponse)
    chain = prompt | structured_llm
    
    try:
        result = chain.invoke({"messages": messages})
        return {
            "messages": [AIMessage(content=result.response)], 
            "mood": result.mood,
            "suggested_activity": result.suggested_activity,
            "activity_type": result.activity_type
        }
    except Exception:
        return {
            "messages": [AIMessage(content="I hear you. Let's just breathe together.")],
            "mood": "Stressed",
            "suggested_activity": "Take a deep breath in... and out.",
            "activity_type": "meditation"
        }

def handle_off_topic(state: BotState):
    return {
        "messages": [AIMessage(content="I am your AI Stress Reducer. I'm here to help with your well-being. Let's focus on you!")],
        "mood": "Neutral",
        "suggested_activity": None,
        "activity_type": "none"
    }
