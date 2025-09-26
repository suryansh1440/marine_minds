"""
Socket.IO Manager for CrewAI Service
Handles Socket.IO connections, events, and broadcasting functionality
"""

from flask_socketio import SocketIO, emit
from flask import request
import threading
import time
import random
from typing import Dict, Any, Optional

class SocketManager:
    """Manages Socket.IO connections and events"""
    
    def __init__(self, app=None):
        self.socketio = None
        self.connected_clients = {}  # Store client session info
        
        # Demo thoughts for analysis simulation
        self.demo_thoughts = [
            "I'm analyzing the query structure and intent to understand what data you're looking for. Let me identify the key parameters and determine the most appropriate analysis approach. I'll check our available data sources and prepare the optimal retrieval strategy for your request.",
            
            "Let me evaluate the query complexity and scope to set up the right analysis pipeline components. I'm validating the parameters and constraints while initializing the data processing workflows. I'll optimize the execution plan and cross-reference with our knowledge base to ensure accurate results.",
            
            "I'm preparing the visualization and reporting frameworks while validating data integrity and completeness. Let me set up real-time monitoring and progress tracking for this multi-step analysis execution. I'll ensure all components are properly configured for your specific query requirements.",
            
            "Analyzing the query structure to understand the data requirements and determine the best approach. I'm checking available data sources, preparing retrieval strategies, and evaluating complexity. Setting up analysis pipeline components and validating parameters for optimal execution.",
            
            "I'm identifying key data requirements and preparing the most appropriate analysis approach. Let me check data sources, prepare retrieval strategies, and set up the analysis pipeline. I'll validate parameters and initialize processing workflows for your query."
        ]
        
        if app:
            self.init_app(app)
    
    def init_app(self, app):
        """Initialize Socket.IO with the Flask app"""
        self.socketio = SocketIO(
            app, 
            cors_allowed_origins=[
                "http://localhost:5173", 
                "http://127.0.0.1:5173",
                "http://localhost:5500",
                "http://127.0.0.1:5500",
                "http://localhost:3000",
                "http://127.0.0.1:3000",
                "*"
            ],
            logger=True,
            engineio_logger=True
        )
        self._register_events()
    
    def _register_events(self):
        """Register Socket.IO event handlers"""
        
        @self.socketio.on('connect')
        def handle_connect(auth=None):
            session_id = request.sid
            self.connected_clients[session_id] = {
                'connected_at': time.time(),
                'status': 'connected'
            }
            print(f'✅ Client connected: {session_id}')
        
        @self.socketio.on('disconnect')
        def handle_disconnect():
            session_id = request.sid
            if session_id in self.connected_clients:
                del self.connected_clients[session_id]
            print(f'❌ Client disconnected: {session_id}')
        
        @self.socketio.on('analyze_query')
        def handle_analyze_query(data):
            """Handle analysis requests via Socket.IO"""
            session_id = request.sid
            query = data.get('query')
            
            if not isinstance(query, str) or not query.strip():
                self.emit_to_client(session_id, 'error', {'message': 'Query must be a non-empty string'})
                return
            
            
            # Store the query for this session
            if session_id in self.connected_clients:
                self.connected_clients[session_id]['current_query'] = query
                self.connected_clients[session_id]['status'] = 'analyzing'
            
            # Import and run the analysis
            from services.crewai_service import run_crewai_pipeline
            self.run_analysis_async(session_id, query, run_crewai_pipeline)
    
    def emit_to_client(self, session_id: str, event: str, data: Dict[str, Any]):
        """Emit an event to a specific client"""
        if self.socketio:
            self.socketio.emit(event, data, room=session_id)
    
    def emit_thoughts_to_client(self, session_id: str, stage: str, message: str):
        """Emit thoughts update to a specific client"""
        self.emit_to_client(session_id, 'thoughts', {
            'stage': stage,
            'message': message
        })

    def emit_query_type_to_client(self, session_id: str, query_type: str):
        """Emit query type to a specific client"""
        self.emit_to_client(session_id, 'query_type', {
            'type': query_type
        })
        
    
    def send_demo_thoughts(self, session_id: str):
        """Send one random demo thought to simulate AI analysis"""
        def send_thought():
            # Send one random thought with a short delay
            time.sleep(random.uniform(0.5, 1.5))
            
            # Select one random thought
            selected_thought = random.choice(self.demo_thoughts)
            
            # Send the thought
            self.emit_thoughts_to_client(session_id, 'analysis', selected_thought)
        
        # Start sending thought in background thread
        thread = threading.Thread(target=send_thought)
        thread.daemon = True
        thread.start()
    
    def emit_result_to_client(self, session_id: str, result: Dict[str, Any]):
        """Emit analysis completion to a specific client"""
        self.emit_to_client(session_id, 'result', {
            'result': result
        })
        
        # Update client status
        if session_id in self.connected_clients:
            self.connected_clients[session_id]['status'] = 'idle'
            self.connected_clients[session_id]['last_result'] = result
    
    def emit_error(self, session_id: str, error_message: str):
        """Emit error to a specific client"""
        self.emit_to_client(session_id, 'error', {'message': error_message})
        
        # Update client status
        if session_id in self.connected_clients:
            self.connected_clients[session_id]['status'] = 'error'
    
    def get_connected_clients(self) -> Dict[str, Dict[str, Any]]:
        """Get information about all connected clients"""
        return self.connected_clients.copy()
    
    def get_client_info(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get information about a specific client"""
        return self.connected_clients.get(session_id)
    
    def run_analysis_async(self, session_id: str, query: str, analysis_func):
        """Run analysis in a background thread with progress updates"""
        def run_analysis():
            try:
                # Run the analysis function with session_id for progress updates
                self.emit_query_type_to_client(session_id, 'Analyzing query')
                self.send_demo_thoughts(session_id)
                result = analysis_func(query, session_id=session_id)
                
                # Emit completion
                self.emit_result_to_client(session_id, result)
                
            except Exception as exc:
                self.emit_error(session_id, f'Analysis failed: {str(exc)}')
        
        # Start analysis in background thread
        thread = threading.Thread(target=run_analysis)
        thread.daemon = True
        thread.start()
    
    def run_app(self, app, host="0.0.0.0", port=5000, debug=False):
        """Run the Flask-SocketIO app"""
        if self.socketio:
            self.socketio.run(app, host=host, port=port, debug=debug)
        else:
            raise RuntimeError("Socket.IO not initialized. Call init_app() first.")

# Global socket manager instance
socket_manager = SocketManager()
