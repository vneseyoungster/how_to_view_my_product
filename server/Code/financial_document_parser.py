#!/usr/bin/env python
# Financial Document Parser - Specialized for Financial Statements

import os
import json
import re
import pandas as pd
from paddleocr import PaddleOCR
from collections import defaultdict

class FinancialDocumentParser:
    """
    Parser specifically designed for financial documents like balance sheets,
    income statements, etc. Extracts and organizes the OCR content into a
    meaningful financial structure.
    """
    
    def __init__(self, lang='en', use_gpu=False):
        """Initialize the parser with PaddleOCR"""
        self.ocr = PaddleOCR(
            lang=lang, 
            use_angle_cls=True, 
            use_gpu=use_gpu,
            ocr_version='PP-OCRv4',
            structure_version='PP-StructureV3'
        )
        
    def process_document(self, image_path, output_dir='./financial_data'):
        """Process a financial document image and extract structured data"""
        # Create output directory
        os.makedirs(output_dir, exist_ok=True)
        
        # Extract base name for output files
        base_name = os.path.splitext(os.path.basename(image_path))[0]
        
        # Run OCR on the image
        print(f"Processing financial document: {image_path}")
        ocr_result = self.ocr.ocr(image_path, cls=False)
        
        # Extract text and positions
        extracted_data = self._extract_raw_data(ocr_result)
        
        # Organize into financial structure
        financial_structure = self._organize_financial_data(extracted_data)
        
        # Save the results in various formats
        output_files = self._save_results(financial_structure, base_name, output_dir)
        
        return output_files, financial_structure
    
    def _extract_raw_data(self, ocr_result):
        """Extract raw text and positional data from OCR results"""
        extracted_data = []
        
        if ocr_result and len(ocr_result) > 0:
            for page_idx, page_results in enumerate(ocr_result):
                for line in page_results:
                    if len(line) >= 2:
                        bbox = line[0]  # Bounding box coordinates
                        text_info = line[1]  # Text and confidence
                        
                        if isinstance(text_info, tuple) and len(text_info) >= 1:
                            text = text_info[0]
                            confidence = text_info[1] if len(text_info) > 1 else None
                            
                            # Calculate the center point y-coordinate for vertical position reference
                            if len(bbox) >= 4:  # Ensure bbox has at least 4 points
                                y_values = [point[1] for point in bbox]
                                center_y = sum(y_values) / len(y_values)
                                
                                # Calculate the left and right x-coordinates for alignment
                                x_values = [point[0] for point in bbox]
                                left_x = min(x_values)
                                right_x = max(x_values)
                                
                                extracted_data.append({
                                    'text': text,
                                    'confidence': confidence,
                                    'bbox': bbox,
                                    'page': page_idx,
                                    'center_y': center_y,
                                    'left_x': left_x,
                                    'right_x': right_x
                                })
        
        # Sort by vertical position (center_y)
        extracted_data.sort(key=lambda x: x['center_y'])
        
        return extracted_data
    
    def _organize_financial_data(self, extracted_data):
        """
        Organize the extracted data into a financial document structure
        This is a simplistic approach - in a real application, more sophisticated
        algorithms would be used to identify sections, tables, etc.
        """
        financial_structure = {
            'title': None,
            'date': None,
            'sections': {},
            'line_items': [],
            'unallocated': []
        }
        
        # First, try to identify the title and date
        title_candidates = [item for item in extracted_data[:5] if len(item['text']) > 10]
        if title_candidates:
            financial_structure['title'] = title_candidates[0]['text']
        
        # Look for dates in standard formats
        date_pattern = re.compile(r'\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{1,2},?\s+\d{4}\b|\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b|\b\d{4}[/-]\d{1,2}[/-]\d{1,2}\b', re.IGNORECASE)
        for item in extracted_data[:10]:  # Check first 10 items for date
            date_match = date_pattern.search(item['text'])
            if date_match:
                financial_structure['date'] = date_match.group(0)
                break
        
        # Group items by their approximate vertical position (for line items)
        line_groups = self._group_by_vertical_position(extracted_data)
        
        # Process each line group
        for line_idx, group in enumerate(line_groups):
            # Skip if group is empty
            if not group:
                continue
            
            # If the first item in group contains "TOTAL" or "Total", treat as a total line
            if "TOTAL" in group[0]['text'].upper():
                section_name = "TOTALS"
                if section_name not in financial_structure['sections']:
                    financial_structure['sections'][section_name] = []
                financial_structure['sections'][section_name].append({
                    'line_number': line_idx,
                    'items': group
                })
            else:
                # Regular line item - add to line_items
                financial_structure['line_items'].append({
                    'line_number': line_idx,
                    'items': group
                })
        
        return financial_structure
    
    def _group_by_vertical_position(self, extracted_data, tolerance=10):
        """Group items that are approximately on the same line (within tolerance)"""
        if not extracted_data:
            return []
        
        groups = []
        current_group = [extracted_data[0]]
        current_y = extracted_data[0]['center_y']
        
        for item in extracted_data[1:]:
            if abs(item['center_y'] - current_y) <= tolerance:
                # Same line
                current_group.append(item)
            else:
                # New line
                groups.append(current_group)
                current_group = [item]
                current_y = item['center_y']
        
        # Add the last group
        if current_group:
            groups.append(current_group)
        
        # Sort items in each group by x position
        for group in groups:
            group.sort(key=lambda x: x['left_x'])
        
        return groups
    
    def _save_results(self, financial_structure, base_name, output_dir):
        """Save the financial structure in various formats"""
        output_files = {}
        
        # 1. Save as JSON (full structure)
        json_path = os.path.join(output_dir, f"{base_name}_financial.json")
        with open(json_path, 'w', encoding='utf-8') as f:
            # Create a serializable version (without complex objects)
            serializable = {
                'title': financial_structure['title'],
                'date': financial_structure['date'],
                'sections': {},
                'line_items': []
            }
            
            # Process sections
            for section_name, section_data in financial_structure['sections'].items():
                serializable['sections'][section_name] = []
                for line in section_data:
                    serializable['sections'][section_name].append({
                        'line_number': line['line_number'],
                        'content': [item['text'] for item in line['items']]
                    })
            
            # Process line items
            for line in financial_structure['line_items']:
                serializable['line_items'].append({
                    'line_number': line['line_number'],
                    'content': [item['text'] for item in line['items']]
                })
            
            json.dump(serializable, f, ensure_ascii=False, indent=2)
        
        output_files['json'] = json_path
        
        # 2. Create Excel spreadsheet with tabular format
        excel_path = os.path.join(output_dir, f"{base_name}_financial.xlsx")
        
        # Prepare data for Excel
        rows = []
        
        # Add metadata
        if financial_structure['title']:
            rows.append(["Document Title", financial_structure['title']])
        if financial_structure['date']:
            rows.append(["Document Date", financial_structure['date']])
        
        rows.append([])  # Empty row as separator
        
        # Add column headers
        rows.append(["Line Item", "Value", "Line Number"])
        
        # Add line items
        for line in financial_structure['line_items']:
            line_content = [item['text'] for item in line['items']]
            
            # Try to separate label and value
            if len(line_content) >= 2:
                # Assume first item is label, last is value
                rows.append([line_content[0], line_content[-1], line['line_number']])
            elif len(line_content) == 1:
                rows.append([line_content[0], "", line['line_number']])
        
        # Create DataFrame and save
        df = pd.DataFrame(rows)
        df.to_excel(excel_path, header=False, index=False)
        
        output_files['excel'] = excel_path
        
        # 3. Plain text with the most important information
        txt_path = os.path.join(output_dir, f"{base_name}_financial.txt")
        with open(txt_path, 'w', encoding='utf-8') as f:
            if financial_structure['title']:
                f.write(f"TITLE: {financial_structure['title']}\n")
            if financial_structure['date']:
                f.write(f"DATE: {financial_structure['date']}\n")
            
            f.write("\n--- LINE ITEMS ---\n")
            
            for line in financial_structure['line_items']:
                line_content = [item['text'] for item in line['items']]
                f.write(f"{' | '.join(line_content)}\n")
            
            f.write("\n--- TOTALS ---\n")
            if 'TOTALS' in financial_structure['sections']:
                for line in financial_structure['sections']['TOTALS']:
                    line_content = [item['text'] for item in line['items']]
                    f.write(f"{' | '.join(line_content)}\n")
        
        output_files['text'] = txt_path
        
        print(f"Financial document data saved:")
        print(f"- Text: {txt_path}")
        
        return output_files

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Parse financial documents with OCR")
    parser.add_argument("image_path", help="Path to the financial document image")
    parser.add_argument("--output", "-o", default="./financial_data", 
                        help="Directory to save output files")
    parser.add_argument("--lang", "-l", default="en",
                        help="Language for OCR (default: en)")
    
    args = parser.parse_args()
    
    parser = FinancialDocumentParser(lang=args.lang)
    parser.process_document(args.image_path, args.output) 