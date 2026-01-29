from typing import TypedDict, Annotated, List, Union
from langchain_core.messages import BaseMessage
import operator

class BotState(TypedDict):
    messages: Annotated[List[BaseMessage], operator.add]
    mood: str
    intent: str
