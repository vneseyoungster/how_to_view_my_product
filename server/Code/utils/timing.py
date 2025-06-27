import time
import os
import json
from datetime import datetime
from functools import wraps
from flask import jsonify

def save_timing_data(endpoint_name, duration, success, error_message=None, metadata=None):
    """
    Save timing data to a JSON file in the output directory
    
    Args:
        endpoint_name: Name of the endpoint function
        duration: Processing time in seconds
        success: Whether the operation was successful
        error_message: Error message if operation failed
        metadata: Additional metadata about the operation
    """
    try:
        # Get the output directory path (relative to the utils folder)
        current_dir = os.path.dirname(os.path.abspath(__file__))
        output_dir = os.path.join(os.path.dirname(current_dir), 'output')
        
        # Ensure output directory exists
        os.makedirs(output_dir, exist_ok=True)
        
        # Create timing log file path
        timing_file = os.path.join(output_dir, 'processing_times.json')
        
        # Create timing entry
        timing_entry = {
            'timestamp': datetime.now().isoformat(),
            'endpoint': endpoint_name,
            'duration_seconds': round(duration, 4),
            'success': success,
            'error_message': error_message,
            'metadata': metadata or {}
        }
        
        # Load existing timing data or create new list
        timing_data = []
        if os.path.exists(timing_file):
            try:
                with open(timing_file, 'r', encoding='utf-8') as f:
                    timing_data = json.load(f)
            except (json.JSONDecodeError, FileNotFoundError):
                timing_data = []
        
        # Append new entry
        timing_data.append(timing_entry)
        
        # Save updated timing data
        with open(timing_file, 'w', encoding='utf-8') as f:
            json.dump(timing_data, f, indent=2, ensure_ascii=False)
        
        print(f"[TIMING] Saved timing data to: {timing_file}")
        
    except Exception as e:
        print(f"[TIMING] Failed to save timing data: {str(e)}")

def time_it(f):
    """
    Decorator to measure the execution time of Flask endpoints
    
    This decorator:
    1. Records start time before function execution
    2. Executes the original endpoint function
    3. Records end time after function completion
    4. Calculates duration and adds it to JSON response
    
    Args:
        f: The Flask endpoint function to be decorated
        
    Returns:
        Modified response with processing_time_seconds field added
    """
    @wraps(f)
    def wrapper(*args, **kwargs):
        start_time = time.time()
        print(f"[TIMING] Starting execution of {f.__name__}")
        
        try:
            response = f(*args, **kwargs)
            end_time = time.time()
            duration = end_time - start_time
            
            print(f"[TIMING] {f.__name__} completed in {duration:.4f} seconds")
            
            # Extract metadata from response for logging
            metadata = {}
            response_data = None
            
            # Check if response is a Flask response object with JSON data
            if hasattr(response, 'get_json') and response.is_json:
                data = response.get_json()
                if isinstance(data, dict):
                    response_data = data
                    data['processing_time_seconds'] = round(duration, 4)
                    final_response = jsonify(data), response.status_code
            
            # If response is a tuple (data, status_code)
            elif isinstance(response, tuple) and len(response) == 2:
                data, status_code = response
                if isinstance(data, dict):
                    response_data = data
                    data['processing_time_seconds'] = round(duration, 4)
                    final_response = jsonify(data), status_code
                else:
                    final_response = response
            
            # If response is direct JSON data (dict)
            elif isinstance(response, dict):
                response_data = response
                response['processing_time_seconds'] = round(duration, 4)
                final_response = jsonify(response)
            else:
                final_response = response
            
            # Extract metadata from response data
            if response_data and isinstance(response_data, dict):
                metadata = {
                    'success': response_data.get('success', True),
                    'files_processed': response_data.get('files_processed'),
                    'metadata': response_data.get('metadata', {}),
                    'category': response_data.get('metadata', {}).get('category') if 'metadata' in response_data else None,
                    'analysis_type': response_data.get('metadata', {}).get('analysis_type') if 'metadata' in response_data else None
                }
            
            # Save timing data to file
            save_timing_data(
                endpoint_name=f.__name__,
                duration=duration,
                success=True,
                metadata=metadata
            )
            
            return final_response
            
        except Exception as e:
            end_time = time.time()
            duration = end_time - start_time
            error_message = str(e)
            print(f"[TIMING] {f.__name__} failed after {duration:.4f} seconds with error: {error_message}")
            
            # Save timing data for failed request
            save_timing_data(
                endpoint_name=f.__name__,
                duration=duration,
                success=False,
                error_message=error_message
            )
            
            raise
    
    return wrapper 