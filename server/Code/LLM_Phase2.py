#!/usr/bin/env python

import os
import time
from typing import Dict, Any
from openai import OpenAI

openai_api_key = 'fill your api key here'

class SimpleGPTClient:
    def __init__(self, api_key: str = None, default_timeout: int = 60):
        self.client = OpenAI(api_key=openai_api_key)
        self.default_timeout = default_timeout
    
    def chat(self, user_message: str, max_retries: int = 3, timeout: int = None) -> Dict[str, Any]:
        if timeout is None:
            timeout = self.default_timeout
            
        system_prompt = '''
                    You are a smart financial accountant. You are given a text extracted from a financial document in the Assets section.
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
'''
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message}
        ]
        
        for attempt in range(max_retries):
            try:
                print(f"GPT-4.1-mini request attempt {attempt+1}/{max_retries}...")
                
                response = self.client.chat.completions.create(
                    model="gpt-4.1-mini",
                    messages=messages,
                    temperature=0.7,
                    max_tokens=4096,
                    timeout=timeout
                )
                
                content = response.choices[0].message.content
                return {"success": True, "content": content}
                    
            except Exception as e:
                error_msg = str(e)
                
                if "rate_limit" in error_msg.lower() or "429" in error_msg:
                    if attempt < max_retries - 1:
                        print("Rate limit exceeded. Waiting before retry...")
                        time.sleep(5)
                        continue
                
                if attempt < max_retries - 1:
                    wait_time = 2 ** attempt
                    print(f"Request error: {error_msg}. Retrying in {wait_time} seconds...")
                    time.sleep(wait_time)
                else:
                    return {"success": False, "error": error_msg}
        
        return {"success": False, "error": "Maximum retry attempts reached"}

def main():
    gpt_client = SimpleGPTClient()
    
    print("Enter the path to a file or folder:")
    input_path = input().strip()
    
    if not input_path:
        print("Error: No path provided")
        return
    
    if not os.path.exists(input_path):
        print(f"Error: Path '{input_path}' does not exist")
        return
    
    files_to_process = []
    
    if os.path.isfile(input_path):
        files_to_process.append(input_path)
    elif os.path.isdir(input_path):
        for filename in os.listdir(input_path):
            if filename.lower().endswith('.txt'):
                file_path = os.path.join(input_path, filename)
                files_to_process.append(file_path)
        
        if not files_to_process:
            print("No .txt files found in the directory")
            return
    else:
        print("Error: Path is neither a file nor a directory")
        return
    
    for file_path in files_to_process:
        try:
            with open(file_path, "r", encoding="utf-8") as file:
                user_input = file.read()
            
            print(f"\nProcessing: {os.path.basename(file_path)}")
            print(f"Input text length: {len(user_input)} characters")
            
            result = gpt_client.chat(user_input)
            
            if result["success"]:
                print(f"\nGPT Response for {os.path.basename(file_path)}:")
                print(result["content"])
                
                output_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "output")
                os.makedirs(output_dir, exist_ok=True)
                
                timestamp = time.strftime("%Y%m%d_%H%M%S")
                base_name = os.path.splitext(os.path.basename(file_path))[0]
                output_filename = f"gpt_response_{base_name}_{timestamp}.txt"
                output_path = os.path.join(output_dir, output_filename)
                
                with open(output_path, "w", encoding="utf-8") as output_file:
                    output_file.write(result["content"])
                
                print(f"GPT response saved to: {output_path}")
                
            else:
                print(f"Error processing {os.path.basename(file_path)}: {result['error']}")
                
                output_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "output")
                os.makedirs(output_dir, exist_ok=True)
                
                timestamp = time.strftime("%Y%m%d_%H%M%S")
                base_name = os.path.splitext(os.path.basename(file_path))[0]
                output_filename = f"gpt_error_{base_name}_{timestamp}.txt"
                output_path = os.path.join(output_dir, output_filename)
                
                error_content = f"Error occurred at: {time.strftime('%Y-%m-%d %H:%M:%S')}\n"
                error_content += f"Input file: {os.path.basename(file_path)}\n"
                error_content += f"Model: gpt-4.1-mini\n"
                error_content += f"Error: {result['error']}\n"
                
                with open(output_path, "w", encoding="utf-8") as output_file:
                    output_file.write(error_content)
                
                print(f"Error details saved to: {output_path}")
                
        except FileNotFoundError:
            print(f"Error: File '{file_path}' not found")
        except Exception as e:
            print(f"Error reading file '{file_path}': {e}")

if __name__ == "__main__":
    main()
