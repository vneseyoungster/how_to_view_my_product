from financial_document_parser import FinancialDocumentParser
import os
import sys
import glob
from datetime import datetime

def process_document_ocr_only(img_path, output_dir=None):
    """
    Process a financial document image through OCR only (no LLM analysis)
    
    Args:
        img_path: Path to the image file
        output_dir: Directory to save output files (optional)
    
    Returns:
        dict: Dictionary containing paths to output files and success status
    """
    parser = FinancialDocumentParser(lang='en')
    
    print(f"Processing document with OCR: {img_path}")
    try:
        # If output_dir is None, let the parser use its default
        if output_dir is None:
            output_files, financial_structure = parser.process_document(img_path)
        else:
            output_files, financial_structure = parser.process_document(img_path, output_dir)
        
        print(f"OCR processing completed successfully!")
        print(f"- Text file: {output_files['text']}")
        print(f"- Annotated image: {output_files['annotated_image']}")
        print(f"- Structure file: {output_files['structure']}")
        
        return {
            "success": True,
            "output_files": output_files,
            "financial_structure": financial_structure
        }
        
    except Exception as e:
        print(f"Error during OCR processing: {e}")
        return {
            "success": False,
            "error": str(e)
        }

def process_image_folder_ocr_only(folder_path, output_dir=None):
    """
    Process all images in a folder with OCR only
    
    Args:
        folder_path: Path to the folder containing images
        output_dir: Directory to save output files (optional)
    """
    if not os.path.isdir(folder_path):
        print(f"Error: {folder_path} is not a valid directory.")
        return
        
    image_extensions = ['*.jpg', '*.jpeg', '*.png', '*.tif', '*.tiff', '*.bmp']
    image_files = []
    
    for ext in image_extensions:
        image_files.extend(glob.glob(os.path.join(folder_path, ext)))
        
    if not image_files:
        print(f"No image files found in {folder_path}")
        return
        
    print(f"Found {len(image_files)} image files to process.")
    
    if output_dir is None:
        output_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'ocr_output')
        
    os.makedirs(output_dir, exist_ok=True)
    
    success_count = 0
    failed_files = []
    
    for i, img_path in enumerate(image_files):
        print(f"\nProcessing image {i+1}/{len(image_files)}: {os.path.basename(img_path)}")
        
        result = process_document_ocr_only(img_path, output_dir)
        
        if result["success"]:
            success_count += 1
        else:
            failed_files.append(os.path.basename(img_path))
    
    print(f"\nBatch OCR processing complete: {success_count}/{len(image_files)} files processed successfully.")
    print(f"Output files saved to: {output_dir}")
    
    if failed_files:
        print(f"Failed files: {', '.join(failed_files)}")

def display_ocr_results(output_files):
    """
    Display the OCR results in a readable format
    
    Args:
        output_files: Dictionary containing paths to output files
    """
    if 'text' in output_files and os.path.exists(output_files['text']):
        print(f"\n{'='*50}")
        print("EXTRACTED TEXT CONTENT:")
        print(f"{'='*50}")
        
        with open(output_files['text'], 'r', encoding='utf-8') as f:
            content = f.read()
            print(content)
    
    if 'structure' in output_files and os.path.exists(output_files['structure']):
        print(f"\n{'='*50}")
        print("FINANCIAL STRUCTURE:")
        print(f"{'='*50}")
        
        with open(output_files['structure'], 'r', encoding='utf-8') as f:
            structure = f.read()
            print(structure)

if __name__ == "__main__":
    print("==== Financial Document OCR Processing (Paddle OCR Only) ====")
    print("This tool extracts text from financial documents using Paddle OCR")
    print("No LLM analysis is performed - only text extraction and structure detection")
    
    if len(sys.argv) > 1:
        path = sys.argv[1]
        
        output_dir = None
        if len(sys.argv) > 2:
            output_dir = sys.argv[2]
            
        if os.path.isdir(path):
            print(f"Processing folder: {path}")
            process_image_folder_ocr_only(path, output_dir)
        elif os.path.isfile(path):
            print(f"Processing single file: {path}")
            result = process_document_ocr_only(path, output_dir)
            
            if result["success"]:
                display_results = input("\nWould you like to display the extracted text? (y/n): ").strip().lower()
                if display_results == 'y':
                    display_ocr_results(result["output_files"])
        else:
            print(f"Error: {path} is not a valid file or directory.")
    else:
        path = input("\nEnter path to financial document or folder: ").strip()
        
        if not path:
            imgs_folder = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'imgs')
            if os.path.isdir(imgs_folder):
                print(f"Using default images folder: {imgs_folder}")
                process_image_folder_ocr_only(imgs_folder)
            else:
                print("No path provided and default 'imgs' folder not found.")
                sys.exit(1)
        elif os.path.isdir(path):
            print(f"Processing folder: {path}")
            process_image_folder_ocr_only(path)
        elif os.path.isfile(path):
            print(f"Processing single file: {path}")
            result = process_document_ocr_only(path)
            
            if result["success"]:
                display_results = input("\nWould you like to display the extracted text? (y/n): ").strip().lower()
                if display_results == 'y':
                    display_ocr_results(result["output_files"])
        else:
            print(f"Error: {path} is not a valid file or directory.") 