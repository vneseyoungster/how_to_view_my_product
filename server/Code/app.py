#!/usr/bin/env python
# Flask API for Financial Document OCR + LLM Processing

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
import base64
import tempfile
import re
from werkzeug.utils import secure_filename
from financial_document_parser import FinancialDocumentParser
from LLM_Request import LLMRequest, Financial_Agent, Summarization_Agent
from utils.timing import time_it

app = Flask(__name__)
# Enable CORS for all routes
CORS(app)

# Configure upload folder
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Configure output folder and subdirectories
OUTPUT_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'output')
TEXT_RESULTS_FOLDER = os.path.join(OUTPUT_FOLDER, 'text_results')
FINANCIAL_ANALYSIS_FOLDER = os.path.join(OUTPUT_FOLDER, 'financial_analysis')
os.makedirs(OUTPUT_FOLDER, exist_ok=True)
os.makedirs(TEXT_RESULTS_FOLDER, exist_ok=True)
os.makedirs(FINANCIAL_ANALYSIS_FOLDER, exist_ok=True)

# Initialize parser and LLMs
parser = FinancialDocumentParser(lang='en')
llm = LLMRequest(default_timeout=90)
financial_agent = Financial_Agent(default_timeout=120)
summarization_agent = Summarization_Agent(
    default_timeout=120, 
    financial_analysis_dir=FINANCIAL_ANALYSIS_FOLDER, 
    default_summary_type="income_statement"
)

# Global variable to track the most recently used analysis type
_last_used_analysis_type = None

def save_to_raw_text(llm_analysis, output_path):
    """
    Save only LLM analysis to a raw text file
    
    Args:
        llm_analysis: Analysis from LLM
        output_path: Path to save the raw text file
    """
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(llm_analysis)
    
    return output_path

def extract_json_from_text(text_content, output_base_path=None):
    """
    Extract JSON content from analysis text and optionally save to a file
    
    Args:
        text_content: Content from Financial_Agent analysis
        output_base_path: Optional base path for saving the JSON file
    
    Returns:
        dict: Extracted JSON data or None if extraction failed
        str: Path to saved JSON file (if output_base_path provided) or None
    """
    json_data = None
    json_path = None
    
    # Strategy 1: Look for JSON in code blocks with ```json
    json_pattern = r'```json\s*(\{[\s\S]*?\})\s*```'
    json_match = re.search(json_pattern, text_content, re.DOTALL)
    
    if not json_match:
        # Strategy 2: Look for JSON in code blocks without json tag
        json_pattern = r'```\s*(\{[\s\S]*?\})\s*```'
        json_match = re.search(json_pattern, text_content, re.DOTALL)
    
    if not json_match:
        # Strategy 3: Look for any JSON-like structure (greedy match for nested objects)
        json_pattern = r'(\{(?:[^{}]|(?:\{(?:[^{}]|(?:\{[^{}]*\})*)*\})*)*\})'
        matches = re.findall(json_pattern, text_content, re.DOTALL)
        # Take the largest match (most likely to be the complete JSON)
        if matches:
            json_match = type('Match', (), {'group': lambda self, x: max(matches, key=len)})()
    
    if json_match:
        json_str = json_match.group(1).strip()
        
        try:
            # First attempt: Parse as-is
            json_data = json.loads(json_str)
            print("JSON extracted successfully on first attempt")
            
        except json.JSONDecodeError as e:
            print(f"Initial JSON parse failed: {e}")
            
            try:
                # Strategy 4: Clean up common JSON formatting issues
                cleaned_json = json_str
                
                # Remove trailing commas before closing braces/brackets
                cleaned_json = re.sub(r',(\s*[}\]])', r'\1', cleaned_json)
                
                # Fix single quotes to double quotes for JSON compliance
                cleaned_json = re.sub(r"'([^']*)'(\s*:)", r'"\1"\2', cleaned_json)  # Keys
                cleaned_json = re.sub(r':\s*\'([^\']*)\'', r': "\1"', cleaned_json)  # String values
                
                # Fix unquoted property names
                cleaned_json = re.sub(r'(\w+)(\s*:)', r'"\1"\2', cleaned_json)
                
                # Fix numbers with thousand separators (remove commas in numeric values)
                cleaned_json = re.sub(r':\s*([0-9,]+(?:\.[0-9]+)?)', 
                                    lambda m: f': {m.group(1).replace(",", "")}', cleaned_json)
                
                # Fix date formatting issues
                cleaned_json = re.sub(r'"(from|to)":\s*(\d{4}-\d{2}-\d{2})', r'"\1": "\2"', cleaned_json)
                
                # Fix boolean values
                cleaned_json = re.sub(r':\s*(true|false|null)\b', r': \1', cleaned_json, flags=re.IGNORECASE)
                
                json_data = json.loads(cleaned_json)
                print("JSON extracted successfully after cleaning")
                
            except json.JSONDecodeError as e2:
                print(f"Cleaned JSON parse also failed: {e2}")
                
                try:
                    # Strategy 5: More aggressive cleaning and reconstruction
                    # Remove comments and extra whitespace
                    lines = json_str.split('\n')
                    cleaned_lines = []
                    
                    for line in lines:
                        # Remove comments (// style)
                        line = re.sub(r'//.*$', '', line)
                        # Remove excessive whitespace but preserve structure
                        line = line.strip()
                        if line:
                            cleaned_lines.append(line)
                    
                    reconstructed_json = '\n'.join(cleaned_lines)
                    
                    # Apply all previous fixes
                    reconstructed_json = re.sub(r',(\s*[}\]])', r'\1', reconstructed_json)
                    reconstructed_json = re.sub(r"'([^']*)'(\s*:)", r'"\1"\2', reconstructed_json)
                    reconstructed_json = re.sub(r':\s*\'([^\']*)\'', r': "\1"', reconstructed_json)
                    reconstructed_json = re.sub(r'(\w+)(\s*:)', r'"\1"\2', reconstructed_json)
                    reconstructed_json = re.sub(r':\s*([0-9,]+(?:\.[0-9]+)?)', 
                                              lambda m: f': {m.group(1).replace(",", "")}', reconstructed_json)
                    
                    json_data = json.loads(reconstructed_json)
                    print("JSON extracted successfully after reconstruction")
                    
                except Exception as e3:
                    print(f"All JSON parsing strategies failed: {e3}")
                    print(f"Problematic JSON snippet: {json_str[:500]}...")
                    json_data = None
    
    # Recursive function to clean numeric values in nested structures
    def clean_numeric_values(obj):
        if isinstance(obj, dict):
            cleaned = {}
            for key, value in obj.items():
                if key == "value" and isinstance(value, str):
                    # Try to convert string numbers to actual numbers
                    try:
                        # Remove commas and convert
                        cleaned_value = value.replace(',', '').replace(' ', '')
                        if '.' in cleaned_value:
                            cleaned[key] = float(cleaned_value)
                        else:
                            cleaned[key] = int(cleaned_value)
                    except (ValueError, AttributeError):
                        cleaned[key] = value
                else:
                    cleaned[key] = clean_numeric_values(value)
            return cleaned
        elif isinstance(obj, list):
            return [clean_numeric_values(item) for item in obj]
        else:
            return obj
    
    # Clean the extracted JSON data
    if json_data:
        json_data = clean_numeric_values(json_data)
    
    # Save to file if requested and data was extracted
    if output_base_path and json_data:
        json_path = f"{output_base_path.rsplit('.', 1)[0]}.json"
        try:
            with open(json_path, 'w', encoding='utf-8') as f:
                json.dump(json_data, f, indent=2, ensure_ascii=False)
            print(f"JSON data saved to: {json_path}")
        except Exception as e:
            print(f"Failed to save JSON to file: {e}")
            json_path = None
    
    return json_data, json_path

def map_category_to_analysis_type(category: str) -> str:
    """
    Map frontend category to Financial_Agent analysis type
    
    Args:
        category: Frontend category (e.g., "operating-cost", "balance-sheet", "cash-flow", "profit")
    
    Returns:
        str: Analysis type for Financial_Agent
    """
    category_mapping = {
        "operating-cost": "income_statement",
        "profit": "income_statement", 
        "balance-sheet": "balance_sheet",
        "cash-flow": "cash_flow"
    }
    
    # Default to income_statement if category is not recognized
    return category_mapping.get(category, "income_statement")

def map_analysis_type_to_summary_type(analysis_type: str) -> str:
    """
    Map Financial_Agent analysis type to Summarization_Agent summary type
    
    Args:
        analysis_type: Analysis type used by Financial_Agent (e.g., "cash_flow", "income_statement", "balance_sheet")
    
    Returns:
        str: Summary type for Summarization_Agent
    """
    # Handle naming differences between Financial_Agent and Summarization_Agent
    type_mapping = {
        "cash_flow": "cashflow",  # Financial_Agent uses "cash_flow", Summarization_Agent uses "cashflow"
        "income_statement": "income_statement",  # Same name
        "balance_sheet": "balance_sheet",  # Same name (if available)
        "general_analysis": "comprehensive_summary"  # Map general analysis to comprehensive summary
    }
    
    # Return mapped type or the original if no mapping exists
    return type_mapping.get(analysis_type, analysis_type)

def update_last_used_analysis_type(analysis_type: str):
    """Update the global tracking of the last used analysis type and update summarization agent default"""
    global _last_used_analysis_type
    _last_used_analysis_type = analysis_type
    # Map the analysis type to the corresponding summary type
    summary_type = map_analysis_type_to_summary_type(analysis_type)
    # Update the summarization agent's default to match
    summarization_agent.update_default_summary_type(summary_type)
    print(f"Updated last used analysis type to: {analysis_type} (mapped to summary type: {summary_type})")

@app.route('/api/process-document', methods=['POST'])
@time_it
def process_document():
    """
    Process a financial document image through all steps: OCR, parsing, analysis, and JSON extraction
    
    Expected POST data:
    - JSON with 'image', 'category', and optional metadata fields
    - OR file upload with 'document' and 'category' fields
    
    Frontend UploadedFile structure:
    {
        "id": "category-timestamp",
        "image": "base64_encoded_image_data",  // for JSON requests
        "category": "operating-cost|balance-sheet|cash-flow|profit",
        "fileFormat": "pdf|image",
        "processed": false,
        ...other metadata
    }
    
    Returns:
    - JSON with extracted financial data
    """
    try:
        # Check if LLM servers are running
        if not llm.check_server():
            return jsonify({
                'success': False,
                'error': 'LLM server for parsing is not running. Please start the server first.'
            }), 503
        
        if not financial_agent.check_server():
            return jsonify({
                'success': False,
                'error': 'LLM server for financial analysis is not running. Please start the server first.'
            }), 503
        
        # Determine input method (JSON with base64 or file upload)
        category = None
        file_id = None
        
        if request.is_json:
            # Handle JSON request with base64 encoded image
            data = request.json
            if 'image' not in data:
                return jsonify({'success': False, 'error': 'No image data provided'}), 400
            
            # Extract metadata from frontend UploadedFile structure
            category = data.get('category', 'operating-cost')  # Default to operating-cost
            file_id = data.get('id', 'unknown')
            file_format = data.get('fileFormat', 'image')
            
            # Create a temporary file for the image
            file_extension = '.pdf' if file_format == 'pdf' else '.png'
            with tempfile.NamedTemporaryFile(delete=False, suffix=file_extension) as temp_file:
                img_data = base64.b64decode(data['image'])
                temp_file.write(img_data)
                img_path = temp_file.name
                filename = f"{file_id}_{category}"
        else:
            # Handle traditional file upload
            if 'document' not in request.files:
                return jsonify({'success': False, 'error': 'No document file provided'}), 400
                
            file = request.files['document']
            if file.filename == '':
                return jsonify({'success': False, 'error': 'Empty file name'}), 400
            
            # Extract category from form data
            category = request.form.get('category', 'operating-cost')  # Default to operating-cost
            file_id = request.form.get('id', 'uploaded_file')
                
            filename = secure_filename(file.filename)
            img_path = os.path.join(UPLOAD_FOLDER, filename)
            file.save(img_path)
        
        # Map frontend category to analysis type
        analysis_type = map_category_to_analysis_type(category)
        print(f"Processing document with category: {category} -> analysis_type: {analysis_type}")
        
        # Update the global tracking of analysis type
        update_last_used_analysis_type(analysis_type)
        
        # Step 1: Process document with OCR
        print(f"Processing document with OCR: {img_path}")
        try:
            output_files, financial_structure = parser.process_document(
                img_path, 
                output_dir=OUTPUT_FOLDER
            )
        except Exception as e:
            return jsonify({'success': False, 'error': f"Error during OCR processing: {str(e)}"}), 500
        
        # Get the OCR text content
        with open(output_files['text'], 'r', encoding='utf-8') as f:
            ocr_text = f.read()
        
        # Step 2: Process with LLMRequest for initial parsing
        print("Parsing financial document with LLMRequest...")
        llm_result = llm.process_text(
            text=ocr_text,
            max_retries=3,
            timeout=300  # 5 minutes timeout for large documents
        )
        
        if not llm_result["success"]:
            return jsonify({
                'success': False,
                'error': f"Error during initial parsing: {llm_result['error']}"
            }), 500
        
        # Save the initial parsing results
        base_name = os.path.splitext(filename)[0]
        raw_text_path = os.path.join(TEXT_RESULTS_FOLDER, f"{base_name}_results.txt")
        save_to_raw_text(llm_result["content"], raw_text_path)
        
        # Step 3: Process with Financial_Agent for detailed analysis
        print(f"Performing financial analysis with Financial_Agent using {analysis_type} analysis...")
        agent_result = financial_agent.analyze_financial_data(
            text=ocr_text,
            analysis_type=analysis_type,  # Use the mapped analysis type
            max_retries=3,
            timeout=360  # 6 minutes timeout for initial attempt
        )
        
        if not agent_result["success"]:
            return jsonify({
                'success': False,
                'error': f"Error during financial analysis: {agent_result['error']}"
            }), 500
        
        # Save the financial analysis results
        analysis_path = os.path.join(FINANCIAL_ANALYSIS_FOLDER, f"{base_name}_financial_analysis.txt")
        save_to_raw_text(agent_result["content"], analysis_path)
        
        # Step 4: Extract JSON data from the financial analysis
        json_data, json_path = extract_json_from_text(
            agent_result["content"],
            output_base_path=analysis_path
        )
        
        # Clean up temporary file if used
        if 'temp' in img_path:
            try:
                os.unlink(img_path)
            except:
                pass
        
        # If no JSON data was extracted, return an error
        if not json_data:
            return jsonify({
                'success': False,
                'error': "Failed to extract structured financial data from the analysis"
            }), 500
        
        # Note: Summarization_Agent will be triggered separately when all documents are processed
        print(f"Document {base_name} processed successfully.")
        print(f"To generate comprehensive summary of all documents, call POST /api/generate-summary when ready.")
        
        # Return enhanced response with metadata
        return jsonify({
            'success': True,
            'financial_data': json_data,
            'file_path': os.path.basename(json_path) if json_path else None,
            'metadata': {
                'file_id': file_id,
                'category': category,
                'analysis_type': analysis_type,
                'available_analysis_types': financial_agent.list_available_analysis_types()
            }
        })
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/generate-summary', methods=['POST'])
@time_it
def generate_comprehensive_summary():
    """
    Generate comprehensive summary from all processed financial analysis files
    
    Expected POST data:
    - JSON with optional 'category' field (e.g., "operating-cost", "balance-sheet", "cash-flow", "profit")
    - OR 'summary_type' field directly (e.g., "income_statement", "balance_sheet", "cash_flow")
    
    Returns:
    - JSON with summary content and file information
    """
    try:
        # Check if summarization agent server is running
        if not summarization_agent.check_server():
            return jsonify({
                'success': False,
                'error': 'LLM server for summarization is not running. Please start the server first.'
            }), 503
        
        # Determine summary type from request
        summary_type = None
        received_input = None
        input_type = None
        
        if request.is_json and request.json:
            data = request.json
            # Check if summary_type is directly provided
            if 'summary_type' in data:
                summary_type = data['summary_type']
                received_input = data['summary_type']
                input_type = 'summary_type'
            # Otherwise, map from category like in process-document
            elif 'category' in data:
                category = data['category']
                analysis_type = map_category_to_analysis_type(category)
                summary_type = map_analysis_type_to_summary_type(analysis_type)
                received_input = category
                input_type = 'category'
                print(f"Mapping category '{category}' to analysis_type '{analysis_type}' to summary_type '{summary_type}'")
        
        # If no explicit type provided, use the last used analysis type
        if summary_type is None:
            global _last_used_analysis_type
            if _last_used_analysis_type:
                summary_type = map_analysis_type_to_summary_type(_last_used_analysis_type)
                print(f"No summary type specified, using last used analysis type: '{_last_used_analysis_type}' (mapped to summary type: '{summary_type}')")
                received_input = f"auto-detected from last document: {_last_used_analysis_type} -> {summary_type}"
                input_type = 'auto-detected'
            else:
                print("No summary type specified and no previous analysis type found, using default")
        
        # Use the determined summary_type or let it default
        if summary_type:
            print(f"Generating summary using '{summary_type}' prompt...")
        else:
            print("Generating summary using default prompt...")
        
        print("Generating comprehensive summary of all analysis files...")
        
        # Load analysis data
        analysis_data = summarization_agent.load_all_analysis_files()
        
        if not analysis_data:
            return jsonify({
                'success': False,
                'error': 'No analysis files found to process',
                'files_processed': 0
            }), 404
        
        # Create summary with specified type
        summary_result = summarization_agent.create_comprehensive_summary(
            analysis_data=analysis_data,
            summary_type=summary_type,
            max_retries=3,
            timeout=360
        )
        
        if not summary_result["success"]:
            return jsonify({
                'success': False,
                'error': f"Failed to create summary: {summary_result['error']}",
                'files_processed': len(analysis_data)
            }), 500
        
        # Save the summary report
        file_path = summarization_agent.save_summary_report(summary_result["content"])
        
        return jsonify({
            'success': True,
            'summary_content': summary_result["content"],
            'files_processed': len(analysis_data),
            'processed_files': list(analysis_data.keys()),
            'summary_file_path': file_path,
            'message': f"Successfully generated summary from {len(analysis_data)} analysis files.",
            'metadata': {
                'summary_type_used': summary_type or summarization_agent.default_summary_type,
                'received_from_frontend': {
                    'input_type': input_type,
                    'input_value': received_input
                },
                'available_summary_types': summarization_agent.list_available_summary_types(),
                'default_summary_type': summarization_agent.default_summary_type,
                'prompt_info': summarization_agent.get_prompt_info(),
                'last_used_analysis_type': _last_used_analysis_type
            }
        })
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/analysis-status', methods=['GET'])
def get_analysis_status():
    """
    Get status of processed analysis files
    
    Returns:
    - JSON with information about available analysis files
    """
    try:
        # Load analysis data to get file count and names
        analysis_data = summarization_agent.load_all_analysis_files()
        
        return jsonify({
            'success': True,
            'total_analysis_files': len(analysis_data),
            'analysis_files': list(analysis_data.keys()),
            'analysis_directory': summarization_agent.financial_analysis_dir,
            'ready_for_summary': len(analysis_data) > 0,
            'message': f"Found {len(analysis_data)} analysis files ready for summarization." if analysis_data else "No analysis files found yet."
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/summarization-status', methods=['GET'])
def get_summarization_status():
    """
    Check the completion status of the summarization process
    
    Returns:
    - JSON with summarization completion status and summary type information
    """
    try:
        # Check if summary files exist in the output directory
        summary_files = []
        summary_pattern = 'comprehensive_summary_*.txt'
        
        # Look for summary files in the output directory
        import glob
        pattern_path = os.path.join(OUTPUT_FOLDER, summary_pattern)
        summary_files = glob.glob(pattern_path)
        
        # Get the most recent summary file if any exist
        most_recent_summary = None
        summary_created_at = None
        if summary_files:
            most_recent_summary = max(summary_files, key=os.path.getmtime)
            summary_created_at = os.path.getmtime(most_recent_summary)
        
        # Load analysis data to get file count and names
        analysis_data = summarization_agent.load_all_analysis_files()
        
        return jsonify({
            'success': True,
            'summarization_completed': len(summary_files) > 0,
            'output_directory': OUTPUT_FOLDER,
            'available_summary_types': summarization_agent.list_available_summary_types(),
            'default_summary_type': summarization_agent.default_summary_type,
            'prompt_info': summarization_agent.get_prompt_info(),
            'message': f"Summarization {'completed' if summary_files else 'not completed'}. Found {len(summary_files)} summary files."
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/analysis-types', methods=['GET'])
def get_analysis_types():
    """
    Get available analysis types and category mappings
    
    Returns:
    - JSON with available analysis types and category mappings
    """
    try:
        category_mapping = {
            "operating-cost": "income_statement",
            "profit": "income_statement", 
            "balance-sheet": "balance_sheet",
            "cash-flow": "cash_flow"
        }
        
        return jsonify({
            'success': True,
            'available_analysis_types': financial_agent.list_available_analysis_types(),
            'category_mapping': category_mapping,
            'default_analysis_type': financial_agent.default_analysis_type,
            'prompt_info': financial_agent.get_prompt_info()
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/timing-stats', methods=['GET'])
def get_timing_stats():
    """
    Get processing time statistics from the timing log file
    
    Returns:
    - JSON with timing statistics and recent processing times
    """
    try:
        import json
        timing_file = os.path.join(OUTPUT_FOLDER, 'processing_times.json')
        
        if not os.path.exists(timing_file):
            return jsonify({
                'success': True,
                'message': 'No timing data available yet',
                'total_requests': 0,
                'recent_requests': []
            })
        
        with open(timing_file, 'r', encoding='utf-8') as f:
            timing_data = json.load(f)
        
        # Calculate statistics
        total_requests = len(timing_data)
        successful_requests = [req for req in timing_data if req['success']]
        failed_requests = [req for req in timing_data if not req['success']]
        
        # Group by endpoint
        endpoint_stats = {}
        for req in timing_data:
            endpoint = req['endpoint']
            if endpoint not in endpoint_stats:
                endpoint_stats[endpoint] = {
                    'total_requests': 0,
                    'successful_requests': 0,
                    'failed_requests': 0,
                    'total_time': 0,
                    'avg_time': 0,
                    'min_time': float('inf'),
                    'max_time': 0
                }
            
            stats = endpoint_stats[endpoint]
            stats['total_requests'] += 1
            stats['total_time'] += req['duration_seconds']
            stats['min_time'] = min(stats['min_time'], req['duration_seconds'])
            stats['max_time'] = max(stats['max_time'], req['duration_seconds'])
            
            if req['success']:
                stats['successful_requests'] += 1
            else:
                stats['failed_requests'] += 1
        
        # Calculate averages
        for endpoint, stats in endpoint_stats.items():
            if stats['total_requests'] > 0:
                stats['avg_time'] = round(stats['total_time'] / stats['total_requests'], 4)
                stats['min_time'] = round(stats['min_time'], 4)
                stats['max_time'] = round(stats['max_time'], 4)
                stats['total_time'] = round(stats['total_time'], 4)
        
        # Get recent requests (last 10)
        recent_requests = timing_data[-10:] if len(timing_data) > 10 else timing_data
        
        return jsonify({
            'success': True,
            'total_requests': total_requests,
            'successful_requests': len(successful_requests),
            'failed_requests': len(failed_requests),
            'endpoint_statistics': endpoint_stats,
            'recent_requests': recent_requests,
            'timing_file_path': timing_file
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """
    Health check endpoint to verify all services are running
    
    Returns:
    - JSON with service status
    """
    try:
        return jsonify({
            'success': True,
            'services': {
                'llm_server': llm.check_server(),
                'financial_agent': financial_agent.check_server(),
                'summarization_agent': summarization_agent.check_server(),
                'ocr_parser': True  # Always available since it's local
            },
            'available_analysis_types': financial_agent.list_available_analysis_types()
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001) 