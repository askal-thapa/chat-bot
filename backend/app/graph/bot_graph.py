from langgraph.graph import StateGraph, END
from app.models.state import BotState
from app.graph.nodes import classify_input, handle_small_talk, handle_therapy, handle_off_topic

workflow = StateGraph(BotState)

workflow.add_node("classify", classify_input)
workflow.add_node("small_talk", handle_small_talk)
workflow.add_node("therapy", handle_therapy)
workflow.add_node("off_topic", handle_off_topic)

workflow.set_entry_point("classify")

def route_based_on_intent(state: BotState):
    intent = state.get("intent")
    if intent == "small_talk":
        return "small_talk"
    elif intent == "therapy":
        return "therapy"
    else:
        return "off_topic"

workflow.add_conditional_edges(
    "classify",
    route_based_on_intent
)

workflow.add_edge("small_talk", END)
workflow.add_edge("therapy", END)
workflow.add_edge("off_topic", END)

app_graph = workflow.compile()
