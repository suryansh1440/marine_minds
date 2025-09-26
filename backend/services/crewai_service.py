import os
import json
import re
import logging
from datetime import datetime

from dotenv import load_dotenv
load_dotenv()
from crewai import LLM,Agent,Task,Crew,TaskOutput
from crewai_tools import SerperDevTool
from crewai_tools import MCPServerAdapter
from mcp import StdioServerParameters
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional, Union, Literal

# Import socket manager for real-time updates
try:
    from socket_manager import socket_manager
    SOCKET_AVAILABLE = True
except ImportError:
    SOCKET_AVAILABLE = False
    socket_manager = None

# Step callback functions for real-time agent progress updates
def create_step_callback(session_id: str, agent_name: str):
    """Create a step callback function for a specific agent and session"""
    def step_callback(step_output):
        if SOCKET_AVAILABLE and socket_manager and session_id:
            # Extract meaningful information from the step output
            step_info = str(step_output)
            if hasattr(step_output, 'raw'):
                step_info = str(step_output.raw)
            
            # Create a thought message based on the agent and step
            thought_messages = {
                'Router Agent': [
                    "Analyzing query type and determining the best approach...",
                    "Classifying the query to route to the appropriate specialist...",
                    "Evaluating query complexity and requirements..."
                ],
                'Conversational Assistant': [
                    "Processing your conversational query...",
                    "Preparing a friendly response...",
                    "Generating an appropriate reply..."
                ],
                'Data Retrieval Specialist': [
                    "Connecting to the database to fetch your data...",
                    "Executing database queries to retrieve relevant information...",
                    "Processing and organizing the retrieved data...",
                    "Validating data integrity and completeness..."
                ],
                'Data Analyst': [
                    "Analyzing the retrieved data for insights...",
                    "Processing data to identify patterns and trends...",
                    "Preparing comprehensive analysis results...",
                    "Generating visualizations and reports..."
                ],
                'Report Generator': [
                    "Compiling analysis results into a comprehensive report...",
                    "Formatting data for clear presentation...",
                    "Finalizing the report with insights and recommendations..."
                ]
            }
            
            # Get a random thought for this agent
            agent_thoughts = thought_messages.get(agent_name, [
                f"{agent_name} is processing your request...",
                f"Executing {agent_name} analysis step...",
                f"{agent_name} is working on your query..."
            ])
            
            import random
            thought_message = random.choice(agent_thoughts)
            
            # Send the thought to the client
            socket_manager.emit_thoughts_to_client(session_id, 'agent_step', thought_message)
    
    return step_callback


# Configure LLM for Gemini
llm = LLM(
    model="deepseek/deepseek-chat",
    temperature=0.1,
    api_key="sk-e226bae36f4d43a2aa3c86d9fce835d8"
)
# llm = LLM(
#     model="gemini/gemini-2.0-flash",
#     temperature=0.1,
#     api_key=os.getenv("GEMINI_API_KEY")  # Use the correct environment variable
# )

def parse_llm_output(output_string: Any) -> Dict[str, Any]:
    """Extract and parse JSON from an LLM output that may include code fences, prefixes, and pipes."""
    text = str(output_string)

    # Try fenced JSON first
    match = re.search(r'```json(.*?)```', text, re.DOTALL | re.IGNORECASE)
    if match:
        json_content = match.group(1)
    else:
        # Try to locate the first JSON object in the text
        obj_match = re.search(r'(\{[\s\S]*\})', text)
        json_content = obj_match.group(1) if obj_match else text

    # Cleanup visual pipes and whitespace
    json_content = re.sub(r'│', '', json_content)
    json_content = re.sub(r'^\s+|\s+$', '', json_content, flags=re.MULTILINE)
    # Fix common issues
    json_content = re.sub(r',\s*}', '}', json_content)
    json_content = re.sub(r',\s*]', ']', json_content)
    return json.loads(json_content)


def safe_parse_llm_output(output_string: Any) -> Dict[str, Any]:
    """Lenient parser with basic cleaning and fixes for trailing commas."""
    try:
        cleaned = str(output_string).replace('```json', '').replace('```', '').replace('│', '').strip()
        # If cleaned is not a JSON object, extract first braces block
        if not cleaned.strip().startswith('{'):
            m = re.search(r'(\{[\s\S]*\})', cleaned)
            if m:
                cleaned = m.group(1)
        return json.loads(cleaned)
    except json.JSONDecodeError:
        cleaned = re.sub(r',\s*}', '}', cleaned)
        cleaned = re.sub(r',\s*]', ']', cleaned)
        return json.loads(cleaned)

class MapLabel(BaseModel):
    lat: float
    lng: float
    text: str
    color: str
    size: float
    altitude: float

class MapHexbin(BaseModel):
    lat: float
    lng: float
    weight: float

class MapHeatmap(BaseModel):
    lat: float
    lng: float
    weight: float

# Define the models for each map type using discriminated unions
class BaseMap(BaseModel):
    title: str
    description: str

class LabelsMap(BaseMap):
    type: Literal["labels"] = "labels"
    data: List[MapLabel] = Field(..., description="List of label data points.")

class HexbinMap(BaseMap):
    type: Literal["hexbin"] = "hexbin"
    data: List[MapHexbin] = Field(..., description="List of hexbin data points.")

class HeatmapMap(BaseMap):
    type: Literal["heatmap"] = "heatmap"
    data: List[MapHeatmap] = Field(..., description="List of heatmap data points.")

# Union to allow the 'maps' list to contain different types of map objects
MapItem = Union[LabelsMap, HexbinMap, HeatmapMap]

# Pydantic model for report content
class Report(BaseModel):
    title: str
    content: str

# Pydantic model for graph data
class Graph(BaseModel):
    type: str = Field(..., description="The type of chart, e.g., 'bar', 'line', 'pie', etc.")
    title: str = Field(..., description="Title of the graph.")
    description: str = Field(..., description="A brief description of what the graph shows.")
    data: List[Dict[str, Any]] = Field(..., description="The data points for the chart. Each item is a dictionary.")
    xKey: str = Field(..., description="The key in the data dictionaries to use for the x-axis.")
    yKey: Union[str, List[str]] = Field(..., description="The key(s) in the data dictionaries to use for the y-values.")
    seriesNames: Optional[List[str]] = None
    colors: Optional[List[str]] = None

# The final Pydantic model for the complete result
class FinalOutputModel(BaseModel):
    thought: str = Field(..., description="The agent's internal thought process and reasoning.")
    report: Report
    graphs: List[Graph]
    maps: List[MapItem]

class RouterOutput(BaseModel):
    route: Literal["CONVERSATION", "LOOKUP", "REPORT"]


# Removed JSON report generator tool per requirements

server_params = StdioServerParameters(
    command=".venv/Scripts/python.exe", 
    args=["mcpServers/supabaseserver.py"],
    env={"UV_PYTHON": "3.12", **os.environ},
    
)


def create_callback_function_convo(session_id: str):
    """Create callback function for conversation tasks"""
    def callback_function(output: TaskOutput):
        try:
            if SOCKET_AVAILABLE and socket_manager and session_id:
                socket_manager.emit_thoughts_to_client(session_id, "Assistant Response", str(output.raw))
        except Exception as e:
            print(f"Callback error: {e}")
    return callback_function

def create_callback_function_lookup(session_id: str):
    """Create callback function for lookup tasks"""
    def callback_function(output: TaskOutput):
        try:
            if SOCKET_AVAILABLE and socket_manager and session_id:
                socket_manager.emit_thoughts_to_client(session_id, "Database Query", str(output.raw))
        except Exception as e:
            print(f"Callback error: {e}")
    return callback_function

def create_callback_function_report(session_id: str):
    """Create callback function for report tasks"""
    def callback_function(output: TaskOutput):
        try:
            if SOCKET_AVAILABLE and socket_manager and session_id:
                socket_manager.emit_thoughts_to_client(session_id, "Report Generation", str(output.raw))
        except Exception as e:
            print(f"Callback error: {e}")
    return callback_function

def run_crewai_pipeline(query: str, verbose: bool = True, session_id: str = None) -> Dict[str, Any]:
    """Run the CrewAI pipeline for a user query and return a JSON-serializable dict.

    Parameters:
        query: Natural language request from the user.
        verbose: If True, prints progress messages.

    Returns:
        Dict matching FinalOutputModel schema.
    """
        # 1) First, run a tiny Router Crew to classify the query
    # Create step callback for router agent
    router_step_callback = create_step_callback(session_id, 'Router Agent') if session_id else None
    
    router_agent = Agent(
        role="Router",
        goal="Classify the user's query.",
        backstory=(
            "Your ONLY job is to classify the query. Output exactly one word: "
            "CONVERSATION, LOOKUP, or REPORT."
        ),
        verbose=True,
        llm=llm,
        max_iter=1,
        step_callback=router_step_callback
    )
    route_task = Task(
        description=(
            "Classify this query: '{query}'.\n"
            "Rules:\n"
            "- CONVERSATION: greetings/small talk/general chat.\n"
            "- LOOKUP: simple data lookup (brief values), no graphs/maps unless requested.\n"
            "- REPORT: full analysis/report with possible graphs/maps if relevant.\n"
            "Output JSON exactly as: {\"route\": \"CONVERSATION\"} or {\"route\": \"LOOKUP\"} or {\"route\": \"REPORT\"}. No other text.\n"
            "Examples:\n"
            "- 'hi how are you' => {\"route\": \"CONVERSATION\"}\n"
            "- 'give me count of all cycles for 19005' => {\"route\": \"LOOKUP\"}\n"
            "- 'analyze trends and create graphs in alantic ocean' => {\"route\": \"REPORT\"}"
        ),
        agent=router_agent,
        output_json=RouterOutput,
        expected_output="JSON with a single 'route' field"
    )
    router_crew = Crew(
        agents=[router_agent],
        tasks=[route_task],
        process="sequential",
        max_iter=1,
        max_execution_time=30,
        verbose=True
    )
    # 2) Run the appropriate specialized crew
    with MCPServerAdapter(server_params) as tools:
        if verbose:
            print(f"Available tools from Stdio MCP server: {[tool.name for tool in tools]}")
        
        # convo agent and task
        # Create step callback for conversation agent
        convo_step_callback = create_step_callback(session_id, 'Conversational Assistant') if session_id else None
        
        convo_agent = Agent(
            role="Conversational Assistant",
            goal="Respond to greetings or general chat tersely user query {query}.",
            backstory="You keep responses short and helpful. No tools.",
            verbose=True,
            llm=llm,
            max_iter=1,
            step_callback=convo_step_callback
        )
        convo_task = Task(
            description=(
                    "Produce FinalOutputModel: a brief friendly reply in report.content for user query {query}. "
                    "Set graphs=[] and maps=[]. Keep report.title='Assistant'."
            ),
            agent=convo_agent,
            output_json=FinalOutputModel,
            expected_output="A single JSON object with minimal reply",
            callback=create_callback_function_convo(session_id)
        )





        # Lookup-only agent (no heavy analysis)
        # Create step callback for lookup agent
        lookup_step_callback = create_step_callback(session_id, 'Data Retrieval Specialist') if session_id else None
        
        lookup_data_retrieval = Agent(
            role="Database query Specialist",
            goal="Perform simple database lookups and brief aggregations; return concise values only.",
            backstory="You fetch small, targeted results fast. No graphs or maps unless explicitly asked.",
            verbose=True,
            llm=llm,
            max_iter=2,
            step_callback=lookup_step_callback
        )
        lookup_database_query = Task(
            description=(
                "Perform a SIMPLE LOOKUP based on the user's request using MCP DB tools for user query {query}. "
                "Prefer small aggregates such as COUNT(*), MIN/MAX, AVG by cycle if relevant. "
                "Return only a tiny result table with clear field names. Do not include graphs or maps."
                "first get the database schema then excute query"
            ),
            agent=lookup_data_retrieval,
            expected_output="Small structured dataset with the requested lookup values.",
            tools=[*tools],
            callback=create_callback_function_lookup(session_id)
        )
        result_maker_lookup = Task(
            description=(
                    "Return ONLY FinalOutputModel with a concise report summarizing fetched values. "
                    "make the report according to the query {query}"
                    "Rules (generic for any tabular result):\n"
                    "- Detect shape of the result.\n"
                    "  * Single column: title = column name or 'Results'; content: 'Found N items: v1, v2, v3, ...' (first 10).\n"
                    "  * Two columns: title = '<col1> and <col2> Summary'; content: 'Rows: N. Sample: v11:v12, v21:v22, ...' (first 10 pairs).\n"
                    "  * 3+ columns: title = 'Query Results'; content: 'Rows: N, Columns: M (c1, c2, ...). Sample: row1[c1=v, c2=v, ...]; row2[...]' (first 5 rows, compact).\n"
                    "- If a known semantic fits (e.g., tables list), you may adapt title wording (e.g., 'Database Tables').\n"
                    "- Always keep content plain text (no markdown, no code fences).\n"
                    "- Unless explicitly requested, set graphs=[] and maps=[]."
            ),
            agent=lookup_data_retrieval,
            context=[lookup_database_query],
            output_json=FinalOutputModel,
            expected_output="JSON with report filled with 2-3 sentences, graphs and maps likely empty",
            callback=create_callback_function_lookup(session_id)
        )




        # Report-only agents and tasks (heavy analysis)
        # Create step callback for data analyst agent
        data_analyst_step_callback = create_step_callback(session_id, 'Data Analyst') if session_id else None
        
        data_analyst = Agent(
            role="Data Analysis Agent",
            goal=(
                "Understand the user's query, determine needed variables, station/region and time scope; "
                "fetch required datasets via available tools (including geolocations from DB); "
                "prepare clean aggregated data and then produce a high-quality report, graphs and maps."
            ),
            backstory="""You are a data scientist who can interpret the user's intent, decide what to query,
            use available tools to fetch exactly what's needed, aggregate by cycle/station/month as appropriate,
            and then create compelling reports with meaningful graphs and map layers in the required schema.""",
            tools=[*tools],
            verbose=True,
            llm=llm,
            step_callback=data_analyst_step_callback
            # max_iter=1,  # Only 1 iteration to prevent loops
            # max_execution_time=30  # 30 second timeout
        )

        # Create step callback for result agent
        result_agent_step_callback = create_step_callback(session_id, 'Report Generator') if session_id else None
        
        result_agent = Agent(
            role="Data Visualization and Report Creator",
            goal="""From the provided structured data, create the best possible report with high-quality graphs and maps,
                    adhering strictly to the FinalOutputModel schema.""",
            backstory="""You are a master at converting raw data into clear, insightful, and visually appealing reports.
                        You understand which chart and map types best represent the data to tell a compelling story.""",
            verbose=True,
            llm=llm,
            step_callback=result_agent_step_callback
            # max_iter=2,  # Limit iterations to prevent infinite loops
            # max_execution_time=30  # 30 second timeout
        )


        # Single task where data_analyst interprets the query and fetches data
        analysis_and_fetch = Task(
            description=(
                "For the query: '{query}', perform these steps ONCE:\n"
                "1) Get database schema\n"
                "2) Execute ONE SQL query to get the data (use AVG for aggregation if needed)\n"
                "3) Return the results in a structured format\n"
                "STOP after getting the data. Do not repeat steps or loop."
            ),
            agent=data_analyst,
            tools=[*tools],
            expected_output="Structured findings and tabular aggregates ready to render",
            callback=create_callback_function_report(session_id)
        )



        result_maker = Task(
            description=(
                "Generate ONLY the final JSON strictly matching FinalOutputModel. Use the context data to build:\n"
                "Build the report ,map and graphs beased on this query - {query}"
                "- report.title and report.content (clear, non-generic and insightful).\n"
                "- graphs: create a maximum of 1 graph relevant to the data. Choose from types like 'bar', 'line', 'scatter', 'area', or 'pie'.\n"
                "  Graph data sampling rules: Ensure the 'data' array has between 5 and 20 points. If more than 20 points, uniformly sample down to exactly 20. If fewer than 5 points, omit the graph entirely.\n"
                "  **CRITICAL: Each graph's 'data' array must contain actual data points, not empty objects. Each data point should be a dictionary with the xKey and yKey values.**\n"
                "  For example: [{\"cycle\": 1, \"temp\": 23.1}, {\"cycle\": 2, \"temp\": 24.5}] for a line graph with xKey='cycle' and yKey='temp'.\n"
                "  For example: [{\"station\": \"A\", \"pressure\": 1013}, {\"station\": \"B\", \"pressure\": 1015}] for a bar chart with xKey='station' and yKey='pressure'.\n"
                "- maps: create a maximum of 1 map. If the data includes temperature, use a 'heatmap'. For general location data, use a 'labels' map.\n"
                "  **For a 'hexbin' map, think of it as bars coming upward from the map, where the height of the bar represents a value like density or count.**\n"
                "  The map type should be chosen to best represent the spatial data (e.g., 'heatmap' for density, 'labels' for specific points).\n"
                "  **CRITICAL: Each map's 'data' array must contain actual coordinate and weight data, not empty objects.**\n"
                "No extra keys; numbers must be numeric. Ensure all keys (`xKey`, `yKey`, `lat`, `lng`, etc.) are correctly mapped from the data.\n"
                "**MOST IMPORTANT: Fill the 'data' arrays with actual values from the context, not empty objects {}.**"
            ),
            agent=result_agent,
            context=[analysis_and_fetch],
            output_json=FinalOutputModel,
            expected_output="A single JSON object formatted as per FinalOutputModel with a high-quality narrative, graphs, and maps according to this query : {query}",
            callback=create_callback_function_report(session_id)
        )

        # crews for each route
        convo_crew = Crew(
            agents=[convo_agent],
            tasks=[convo_task],
            process="sequential",
            max_iter=5,
            max_execution_time=30,
            verbose=True
        )
        lookup_crew = Crew(
            agents=[lookup_data_retrieval],
            tasks=[
                lookup_database_query,
                result_maker_lookup
            ],
            process="sequential",
            max_iter=5,
            max_execution_time=120,
            verbose=True
        )
        report_crew = Crew(
            agents=[data_analyst,result_agent],
            tasks=[
                analysis_and_fetch,
                result_maker
            ],
            process="sequential",
            # max_iter=1,  # Only 1 iteration to prevent loops
            # max_execution_time=60,  # 60 second timeout
            verbose=True
        )




        input_data = {"query": query}
        if SOCKET_AVAILABLE and socket_manager and session_id:
            socket_manager.emit_query_type_to_client(session_id, 'Classifying query')
        router_raw = router_crew.kickoff(input_data)
        # Robustly parse router output
        route = 'LOOKUP'
        try:
            raw_text = getattr(router_raw, 'raw', router_raw)  # Safe access
            if not raw_text or not str(raw_text).strip():
                print("Router returned empty output, falling back to LOOKUP")
                route = 'LOOKUP'
            else:
                try:
                    parsed_router = parse_llm_output(raw_text)
                except Exception:
                    parsed_router = safe_parse_llm_output(raw_text)
                if isinstance(parsed_router, dict) and parsed_router.get('route') in ["CONVERSATION","LOOKUP","REPORT"]:
                    route = parsed_router['route']
        except Exception as e:
            print(f"Error parsing router output: {e}, falling back to LOOKUP")
            pass
        print(f"Router selected route: {route}")

        result = None
        if route == "CONVERSATION":
            if SOCKET_AVAILABLE and socket_manager and session_id:
                socket_manager.emit_query_type_to_client(session_id, 'Assistant')
            result = convo_crew.kickoff(input_data)
        elif route == "LOOKUP":
            if SOCKET_AVAILABLE and socket_manager and session_id:
                socket_manager.emit_query_type_to_client(session_id, 'Database Lookup')
            result = lookup_crew.kickoff(input_data)
        elif route == "REPORT":
            if SOCKET_AVAILABLE and socket_manager and session_id:
                socket_manager.emit_query_type_to_client(session_id, 'Report Generation')
            try:
                result = report_crew.kickoff(input_data)
            except Exception as exc:
                error_msg = str(exc)
                if "timeout" in error_msg.lower() or "max_execution_time" in error_msg.lower():
                    error_msg = "Analysis timed out. Please try a simpler query or break it into smaller parts."
                if SOCKET_AVAILABLE and socket_manager and session_id:
                    socket_manager.emit_error(session_id, f'Analysis failed: {error_msg}')
                return {"error": error_msg}
        else:
            # Fallback to LOOKUP if unknown
            if SOCKET_AVAILABLE and socket_manager and session_id:
                socket_manager.emit_query_type_to_client(session_id, 'Database Lookup')
            result = lookup_crew.kickoff(input_data)
        
        # Parse the raw output from CrewAI using robust parser
        if not result:
            if SOCKET_AVAILABLE and socket_manager and session_id:
                socket_manager.emit_error(session_id, 'Analysis failed: No result returned')
            return {"error": "No result returned from crew"}

        raw_result_text = getattr(result, 'raw', result)  # Safe access
        if not raw_result_text or not str(raw_result_text).strip():
            if SOCKET_AVAILABLE and socket_manager and session_id:
                socket_manager.emit_error(session_id, 'Analysis failed: Invalid response from LLM call - None or empty.')
            return {"error": "Invalid response from LLM call - None or empty."}

        try:
            parsed = parse_llm_output(raw_result_text)
        except Exception:
            parsed = safe_parse_llm_output(raw_result_text)
        if parsed:
            return parsed
        return {"result": str(raw_result_text)}

if __name__ == "__main__":
    demo_query = "give me all station no and how many cycles are there in each station"
    try:
        output = run_crewai_pipeline(demo_query, verbose=True)
        print("\nFINAL RESULT:\n", json.dumps(output, indent=2))
    except Exception as e:
        print("\nCREW EXECUTION FAILED:", str(e))