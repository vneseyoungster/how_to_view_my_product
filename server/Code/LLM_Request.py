#!/usr/bin/env python
# OpenAI GPT API Request Handler using official OpenAI library

import os
import time
import json
import glob
from typing import Dict, Any, List
from openai import OpenAI
from agent_Prompt import PromptLoader

# Set API key globally
openai_api_key = 'fill your api key here'


class BaseAgent:
    """Base class for all OpenAI GPT agents to avoid code duplication"""
    
    def __init__(self, api_key: str = None, default_timeout: int = 60):
        self.client = OpenAI(api_key=openai_api_key)
        self.default_timeout = default_timeout
    
    def check_server(self) -> bool:
        """Check if the OpenAI API is accessible"""
        try:
            self.client.models.list()
            return True
        except Exception:
            return False
    
    def _make_request(self, messages: List[Dict[str, str]], max_retries: int = 3, timeout: int = None, max_tokens: int = 10000) -> Dict[str, Any]:
        """
        Make a request to OpenAI GPT with retry mechanism
        
        Args:
            messages: List of message dictionaries for the conversation
            max_retries: Maximum number of retry attempts
            timeout: Request timeout in seconds (overrides default)
            max_tokens: Maximum tokens for the response
            
        Returns:
            dict: OpenAI GPT response
        """
        if timeout is None:
            timeout = self.default_timeout
        
        for attempt in range(max_retries):
            try:
                print(f"OpenAI GPT request attempt {attempt+1}/{max_retries}...")
                
                response = self.client.chat.completions.create(
                    model="gpt-4.1-mini",
                    messages=messages,
                    temperature=0.7,
                    max_tokens=max_tokens,
                    timeout=timeout
                )
                
                content = response.choices[0].message.content
                return {"success": True, "content": content}
                    
            except Exception as e:
                error_msg = str(e)
                
                # Handle rate limiting
                if "rate_limit" in error_msg.lower() or "429" in error_msg:
                    if attempt < max_retries - 1:
                        print("Rate limit exceeded. Waiting before retry...")
                        time.sleep(5)
                        continue
                
                # Handle other errors
                if attempt < max_retries - 1:
                    wait_time = 2 ** attempt
                    print(f"Request error: {error_msg}. Retrying in {wait_time} seconds...")
                    time.sleep(wait_time)
                else:
                    return {"success": False, "error": error_msg}
        
        return {"success": False, "error": "Maximum retry attempts reached"}


class LLMRequest(BaseAgent):
    """Class to handle requests to OpenAI GPT API using official library"""
    
    def process_text(self, text: str, max_retries: int = 3, timeout: int = None) -> Dict[str, Any]:
        """
        Send text to OpenAI GPT for processing with retry mechanism
        
        Args:
            text: Input text to process
            max_retries: Maximum number of retry attempts
            timeout: Request timeout in seconds (overrides default)
            
        Returns:
            dict: OpenAI GPT response
        """
        system_prompt = """                    You are a smart financial accountant. You are given a text extracted from a financial document in the Assets section.
        You are thinking about how to take out the financial information that is valueable to capture the financial condition of the company. 
        .The collected information should be significant for fundamentals analysis. Then you return the information in a markdown format.

        Sample Output Format:

      | Description                                                | 2018         | 2017 (reclassified) |
|------------------------------------------------------------|--------------|---------------------|
| Profit for the year                                        | 10,466,980   | 8,459,872           |
| Depreciation expense of property and equipment            | 169,180      | 186,948             |
| Amortisation expense of intangible assets                 | 90,423       | 94,193  
.... Continue with the rest of the information            |


        - The output should contain all the provided information, don't miss any information.
        - If the information is not available, please return "N/A"
        - Don't fabricate or make up any information

"""

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": text}
        ]
        
        return self._make_request(messages, max_retries, timeout, max_tokens=10000)


class Financial_Agent(BaseAgent):
    """Class to handle financial analysis requests to OpenAI GPT API using official library"""
    
    def __init__(self, api_key: str = None, default_timeout: int = 60, prompts_dir: str = None, default_analysis_type: str = "income_statement"):
        super().__init__(api_key, default_timeout)
        self.default_analysis_type = default_analysis_type
        
        # Initialize the prompt loader
        self.prompt_loader = PromptLoader(prompts_dir)
    
    def analyze_financial_data(self, text: str, analysis_type: str = None, max_retries: int = 3, timeout: int = None) -> Dict[str, Any]:
        """
        Send financial text to OpenAI GPT for analysis with retry mechanism
        
        Args:
            text: Input financial text to analyze
            analysis_type: Type of analysis to perform (e.g., 'income_statement', 'balance_sheet', 'cash_flow', 'general_analysis')
            max_retries: Maximum number of retry attempts
            timeout: Request timeout in seconds (overrides default)
            
        Returns:
            dict: OpenAI GPT response with financial analysis
        """
        # Use provided analysis_type or fall back to default
        if analysis_type is None:
            analysis_type = self.default_analysis_type
        
        # Validate analysis_type
        available_prompts = self.prompt_loader.list_available_prompts()
        if available_prompts and analysis_type not in available_prompts:
            print(f"Warning: Analysis type '{analysis_type}' not found. Available types: {available_prompts}")
            print(f"Falling back to default analysis type: '{self.default_analysis_type}'")
            analysis_type = self.default_analysis_type
        
        # Load the system prompt for the specified analysis type
        try:
            system_prompt = self.prompt_loader.load_prompt(analysis_type)
            print(f"Using {analysis_type} analysis prompt")
        except Exception as e:
            print(f"Error loading prompt for '{analysis_type}': {e}")
            system_prompt = self.prompt_loader.load_prompt(self.default_analysis_type)

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": text}
        ]
        
        return self._make_request(messages, max_retries, timeout)
    
    def list_available_analysis_types(self) -> List[str]:
        """
        Get list of available analysis types
        
        Returns:
            List[str]: List of available analysis types
        """
        return self.prompt_loader.list_available_prompts()
    
    def get_prompt_info(self) -> Dict[str, Any]:
        """
        Get information about the prompt system
        
        Returns:
            Dict[str, Any]: Information about available prompts and cache status
        """
        return {
            "available_analysis_types": self.list_available_analysis_types(),
            "default_analysis_type": self.default_analysis_type,
            "cache_info": self.prompt_loader.get_cache_info()
        }


class Summarization_Agent(BaseAgent):
    """Class to handle summarization of multiple financial analysis JSON documents"""
    
    def __init__(self, api_key: str = None, default_timeout: int = 120, financial_analysis_dir: str = None, prompts_dir: str = None, default_summary_type: str = "comprehensive_summary"):
        super().__init__(api_key, default_timeout)
        self.default_summary_type = default_summary_type
        
        # Set default directory if not provided
        if financial_analysis_dir is None:
            current_dir = os.path.dirname(os.path.abspath(__file__))
            self.financial_analysis_dir = os.path.join(current_dir, 'output', 'financial_analysis')
        else:
            self.financial_analysis_dir = financial_analysis_dir
        
        # Set default prompts directory if not provided
        if prompts_dir is None:
            current_dir = os.path.dirname(os.path.abspath(__file__))
            prompts_dir = os.path.join(current_dir, 'agent_Prompt', 'summarization_agent')
        
        # Initialize the prompt loader
        self.prompt_loader = PromptLoader(prompts_dir)
    
    def update_default_summary_type(self, new_default: str):
        """
        Update the default summary type
        
        Args:
            new_default: New default summary type
        """
        old_default = self.default_summary_type
        self.default_summary_type = new_default
        print(f"Updated Summarization_Agent default summary type from '{old_default}' to '{new_default}'")
    
    def load_all_analysis_files(self) -> Dict[str, Any]:
        """
        Load all JSON analysis files from the financial analysis directory
        
        Returns:
            Dict[str, Any]: Dictionary with filename as key and JSON content as value
        """
        analysis_data = {}
        
        if not os.path.exists(self.financial_analysis_dir):
            print(f"Warning: Financial analysis directory does not exist: {self.financial_analysis_dir}")
            return analysis_data
        
        # Find all JSON files in the directory
        json_pattern = os.path.join(self.financial_analysis_dir, "*.json")
        json_files = glob.glob(json_pattern)
        
        if not json_files:
            print(f"No JSON files found in: {self.financial_analysis_dir}")
            return analysis_data
        
        print(f"Found {len(json_files)} JSON files to process")
        
        for json_file in json_files:
            try:
                filename = os.path.basename(json_file)
                with open(json_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    analysis_data[filename] = data
                    print(f"Loaded: {filename}")
            except Exception as e:
                print(f"Error loading {json_file}: {e}")
        
        return analysis_data
    
    def create_comprehensive_summary(self, analysis_data: Dict[str, Any] = None, summary_type: str = None, max_retries: int = 3, timeout: int = None) -> Dict[str, Any]:
        """
        Create a comprehensive summary of all financial analysis documents
        
        Args:
            analysis_data: Optional pre-loaded analysis data. If None, will load from directory
            summary_type: Type of summary to perform (e.g., 'comprehensive_summary', 'quarterly_summary')
            max_retries: Maximum number of retry attempts
            timeout: Request timeout in seconds (overrides default)
            
        Returns:
            dict: OpenAI GPT response with comprehensive summary
        """
        # Load data if not provided
        if analysis_data is None:
            analysis_data = self.load_all_analysis_files()
        
        if not analysis_data:
            return {"success": False, "error": "No analysis data available for summarization"}
        
        # Use provided summary_type or fall back to default
        if summary_type is None:
            summary_type = self.default_summary_type
        
        # Validate summary_type
        available_prompts = self.prompt_loader.list_available_prompts()
        if available_prompts and summary_type not in available_prompts:
            print(f"Warning: Summary type '{summary_type}' not found. Available types: {available_prompts}")
            print(f"Falling back to default summary type: '{self.default_summary_type}'")
            summary_type = self.default_summary_type
        
        # Load the system prompt for the specified summary type
        try:
            system_prompt = self.prompt_loader.load_prompt(summary_type)
            print(f"Using {summary_type} summary prompt")
        except Exception as e:
            print(f"Error loading prompt for '{summary_type}': {e}")
            system_prompt = self.prompt_loader.load_prompt(self.default_summary_type)
        
        # Create a consolidated text from all analysis data
        consolidated_text = self._consolidate_analysis_data(analysis_data)

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": consolidated_text}
        ]
        
        print("Creating comprehensive financial summary...")
        return self._make_request(messages, max_retries, timeout, max_tokens=10000)
    
    def list_available_summary_types(self) -> List[str]:
        """
        Get list of available summary types
        
        Returns:
            List[str]: List of available summary types
        """
        return self.prompt_loader.list_available_prompts()
    
    def get_prompt_info(self) -> Dict[str, Any]:
        """
        Get information about the prompt system
        
        Returns:
            Dict[str, Any]: Information about available prompts and cache status
        """
        return {
            "available_summary_types": self.list_available_summary_types(),
            "default_summary_type": self.default_summary_type,
            "cache_info": self.prompt_loader.get_cache_info()
        }
    
    def _consolidate_analysis_data(self, analysis_data: Dict[str, Any]) -> str:
        """
        Consolidate all analysis data into a single text for processing
        
        Args:
            analysis_data: Dictionary of analysis data from multiple files
            
        Returns:
            str: Consolidated text representation of all analysis data
        """
        consolidated_parts = []
        
        consolidated_parts.append("=== COMPREHENSIVE FINANCIAL ANALYSIS DATA ===\n")
        consolidated_parts.append(f"Total Documents Analyzed: {len(analysis_data)}\n")
        
        for filename, data in analysis_data.items():
            consolidated_parts.append(f"\n--- Analysis from: {filename} ---")
            
            # Convert JSON data to readable text
            if isinstance(data, dict):
                consolidated_parts.append(json.dumps(data, indent=2, ensure_ascii=False))
            else:
                consolidated_parts.append(str(data))
            
            consolidated_parts.append("\n" + "="*50)
        
        return "\n".join(consolidated_parts)
    
    def save_summary_report(self, summary_content: str, output_filename: str = None) -> str:
        """
        Save the summary report to a file
        
        Args:
            summary_content: The summary content to save
            output_filename: Optional custom filename. If None, uses timestamp
            
        Returns:
            str: Path to the saved file
        """
        if output_filename is None:
            timestamp = time.strftime("%Y%m%d_%H%M%S")
            output_filename = f"comprehensive_financial_summary_{timestamp}.txt"
        
        # Save in the same directory as the analysis files
        output_path = os.path.join(self.financial_analysis_dir, output_filename)
        
        try:
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(summary_content)
            print(f"Summary report saved to: {output_path}")
            return output_path
        except Exception as e:
            print(f"Error saving summary report: {e}")
            return None
    
    def process_all_analyses(self, save_report: bool = True) -> Dict[str, Any]:
        """
        Complete workflow: Load all analyses, create summary, and optionally save report
        
        Args:
            save_report: Whether to save the summary report to a file
            
        Returns:
            dict: Result containing success status, summary content, and file path (if saved)
        """
        try:
            # Load all analysis files
            analysis_data = self.load_all_analysis_files()
            
            if not analysis_data:
                return {
                    "success": False,
                    "error": "No analysis files found to process",
                    "files_processed": 0
                }
            
            # Create comprehensive summary
            summary_result = self.create_comprehensive_summary(analysis_data)
            
            if not summary_result["success"]:
                return {
                    "success": False,
                    "error": f"Failed to create summary: {summary_result['error']}",
                    "files_processed": len(analysis_data)
                }
            
            result = {
                "success": True,
                "summary_content": summary_result["content"],
                "files_processed": len(analysis_data),
                "processed_files": list(analysis_data.keys())
            }
            
            # Save report if requested
            if save_report:
                file_path = self.save_summary_report(summary_result["content"])
                result["summary_file_path"] = file_path
            
            return result
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Error during summarization process: {str(e)}",
                "files_processed": 0
            }


def main():
    """Main function to demonstrate usage"""
    try:
        # Test LLMRequest
        llm = LLMRequest()
        
        if not llm.check_server():
            print("Error: OpenAI API is not accessible. Please check your API key and internet connection.")
            return
        
        # Example usage of LLMRequest
        print("\n===== Testing LLMRequest with OpenAI GPT =====")
        sample_text = "This is a sample document to analyze."
        result = llm.process_text(sample_text)
        
        if result["success"]:
            print("OpenAI GPT Response:", result["content"])
        else:
            print("Error:", result["error"])
        
        # Test Financial_Agent
        print("\n===== Testing Financial_Agent with OpenAI GPT =====")
        financial_agent = Financial_Agent()
        
        if not financial_agent.check_server():
            print("Error: OpenAI API is not accessible for Financial_Agent")
            return
        
        # Show available analysis types
        print("Available analysis types:", financial_agent.list_available_analysis_types())
        print("Prompt info:", financial_agent.get_prompt_info())
        
        # Example usage of Financial_Agent
        financial_text = """
        Company XYZ Financial Summary (in millions USD):
        Revenue: $532.4 (2022), $498.2 (2021)
        Net Income: $78.6 (2022), $65.3 (2021)
        Total Assets: $1,245.8 (2022), $1,123.6 (2021)
        Total Liabilities: $523.9 (2022), $567.4 (2021)
        Operating Cash Flow: $112.5 (2022), $98.7 (2021)
        """
        
        # Test with default (income statement) analysis
        print("\n--- Testing Income Statement Analysis ---")
        result = financial_agent.analyze_financial_data(financial_text)
        
        if result["success"]:
            print("Income Statement Analysis:", result["content"])
        else:
            print("Error:", result["error"])
        
        # Test with balance sheet analysis
        print("\n--- Testing Balance Sheet Analysis ---")
        result = financial_agent.analyze_financial_data(financial_text, analysis_type="balance_sheet")
        
        if result["success"]:
            print("Balance Sheet Analysis:", result["content"])
        else:
            print("Error:", result["error"])
        
        # Test Summarization_Agent
        print("\n===== Testing Summarization_Agent =====")
        summarization_agent = Summarization_Agent()
        
        if not summarization_agent.check_server():
            print("Error: OpenAI API is not accessible for Summarization_Agent")
            return
        
        # Show available summary types
        print("Available summary types:", summarization_agent.list_available_summary_types())
        print("Prompt info:", summarization_agent.get_prompt_info())
        
        # Test summarization process
        print("\n--- Testing Comprehensive Summarization ---")
        summary_result = summarization_agent.process_all_analyses(save_report=True)
        
        if summary_result["success"]:
            print(f"Successfully processed {summary_result['files_processed']} files")
            print(f"Processed files: {summary_result['processed_files']}")
            if 'summary_file_path' in summary_result:
                print(f"Summary saved to: {summary_result['summary_file_path']}")
            print("Summary content preview:", summary_result["summary_content"][:500] + "...")
        else:
            print("Summarization Error:", summary_result["error"])
            
    except ImportError:
        print("Error: OpenAI library not installed. Please install it with: pip install openai")

if __name__ == "__main__":
    main() 