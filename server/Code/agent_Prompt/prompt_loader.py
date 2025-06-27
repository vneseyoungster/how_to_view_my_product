#!/usr/bin/env python

import os
import logging
from typing import Dict, List, Optional

class PromptLoader:
    """
    Utility class to load and manage system prompts for different financial analysis scenarios.
    Provides caching, error handling, and fallback mechanisms.
    """
    
    def __init__(self, prompts_dir: str = None):
        """
        Initialize the PromptLoader
        
        Args:
            prompts_dir: Directory containing prompt files. If None, uses default location.
        """
        if prompts_dir is None:
            prompts_dir = os.path.dirname(os.path.abspath(__file__))
        
        self.prompts_dir = prompts_dir
        self._prompt_cache: Dict[str, str] = {}
        self._logger = logging.getLogger(__name__)
        
        # Fallback prompt (original hard-coded prompt)
        self._fallback_prompt = """You are a sophisticated financial analyst with expertise in investment analysis, risk assessment, and financial forecasting.
Your task is to analyze the provided financial data. Your main task is to find and extract the income statement within the document for further analysis.

These are the information you need to extract:
- Revenue: known as income of multiple sources, is the total amount of money earned by a company from all business activities before minus the expenses.
- Cost: This represents the cost or the expenses incurred by the company to generate the revenue
- Gross Profit: Profit before taxes
- Operating Expenses: These include costs related to sales, marketing, research and development, and administrative expenses
- Operating Income: Also known as earnings before interest and taxes (EBIT), operating income is gross profit minus operating expenses
- Net Income: This is the bottom line, the profit after all expenses have been deducted from the revenue


- Each information should be format into a key/value pair.
Formatted your response in a json format below:

{
    "Revenue": {
        "value": 100000,
        "from": "2022-01-01",
        "to": "2022-12-31"
    },
    "Cost": {
        "value": 50000,
        "from": "2022-01-01",
        "to": "2022-12-31"
    },
    "Gross Profit": {
        "value": 50000,
        "from": "2022-01-01",
        "to": "2022-12-31"
    },
    "Operating Expenses": {
        "value": 20000,
        "from": "2022-01-01",
        "to": "2022-12-31"
    },
    "Operating Income": {
        "value": 30000,
        "from": "2022-01-01",
        "to": "2022-12-31"
    },
    "Net Income": {
        "value": 20000,
        "from": "2022-01-01",
        "to": "2022-12-31"
    }
}
### GIVE OUT THE FORMULAS USED TO CALCULATE THE VALUES.
### IF YOU CANNOT FIND THE INFORMATION, PLEASE RETURN "N/A" FOR THE KEY/VALUE PAIR."""
    
    def load_prompt(self, prompt_type: str) -> str:
        """
        Load a prompt by type with caching and error handling
        
        Args:
            prompt_type: Type of analysis prompt (e.g., 'income_statement', 'balance_sheet')
        
        Returns:
            str: The prompt content
        
        Raises:
            ValueError: If prompt_type is invalid and no fallback is available
        """
        # Check cache first
        if prompt_type in self._prompt_cache:
            return self._prompt_cache[prompt_type]
        
        # Try to load from file
        try:
            prompt_content = self._load_prompt_from_file(prompt_type)
            # Cache the loaded prompt
            self._prompt_cache[prompt_type] = prompt_content
            return prompt_content
            
        except FileNotFoundError:
            self._logger.warning(f"Prompt file not found for type '{prompt_type}'. Using fallback prompt.")
            return self._get_fallback_prompt(prompt_type)
            
        except Exception as e:
            self._logger.error(f"Error loading prompt for type '{prompt_type}': {e}. Using fallback prompt.")
            return self._get_fallback_prompt(prompt_type)
    
    def _load_prompt_from_file(self, prompt_type: str) -> str:
        """
        Load prompt content from file
        
        Args:
            prompt_type: Type of analysis prompt
        
        Returns:
            str: The prompt content
        
        Raises:
            FileNotFoundError: If the prompt file doesn't exist
        """
        file_path = os.path.join(self.prompts_dir, f"{prompt_type}.txt")
        
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Prompt file not found: {file_path}")
        
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read().strip()
        
        if not content:
            raise ValueError(f"Prompt file is empty: {file_path}")
        
        self._logger.info(f"Successfully loaded prompt for type '{prompt_type}'")
        return content
    
    def _get_fallback_prompt(self, prompt_type: str) -> str:
        """
        Get fallback prompt for given type
        
        Args:
            prompt_type: Type of analysis prompt
        
        Returns:
            str: Fallback prompt content
        """
        # For now, use the same fallback for all types
        # In the future, this could be expanded to have type-specific fallbacks
        return self._fallback_prompt
    
    def validate_prompt_exists(self, prompt_type: str) -> bool:
        """
        Check if a prompt file exists for the given type
        
        Args:
            prompt_type: Type of analysis prompt
        
        Returns:
            bool: True if prompt file exists, False otherwise
        """
        file_path = os.path.join(self.prompts_dir, f"{prompt_type}.txt")
        return os.path.exists(file_path)
    
    def list_available_prompts(self) -> List[str]:
        """
        List all available prompt types
        
        Returns:
            List[str]: List of available prompt types (without .txt extension)
        """
        try:
            files = os.listdir(self.prompts_dir)
            prompt_files = [f for f in files if f.endswith('.txt')]
            prompt_types = [os.path.splitext(f)[0] for f in prompt_files]
            return sorted(prompt_types)
        except Exception as e:
            self._logger.error(f"Error listing available prompts: {e}")
            return []
    
    def clear_cache(self) -> None:
        """Clear the prompt cache"""
        self._prompt_cache.clear()
        self._logger.info("Prompt cache cleared")
    
    def get_cache_info(self) -> Dict[str, int]:
        """
        Get information about the current cache state
        
        Returns:
            Dict[str, int]: Cache information including size and loaded prompts
        """
        return {
            "cache_size": len(self._prompt_cache),
            "cached_prompts": list(self._prompt_cache.keys())
        } 