import json
import os
import time
import pandas as pd

json_data = json.load(open("/Users/phuong.nguyen24/Downloads/UNIVERSITY/Honour Project/OCR_Method/Code/financial_data/BIDV_financial.json", "r"))

def convert_json_to_table(data):
    title = data.get("title", "")
    date_info = data.get("line_items", [])[1]["content"][0] if len(data.get("line_items", [])) > 1 else ""
    table_headers = data.get("line_items", [])[2]["content"] if len(data.get("line_items", [])) > 2 else []

    table_rows = []
    # This assumes "No." is always the first item in the header row
    # and the corresponding data for "No." is the first element in the data rows.
    # It also handles multi-line "Items" by concatenating them.

    current_row = []
    for item in data.get("line_items", [])[3:]: # Start from the first data row
        content = item["content"]

        # Handle notes and the special multi-line item "Uncollected interest from loans and fee receivables"
        if len(content) == 1 and content[0].lower() not in ["a", "b", "c", "d"]:
            # This is likely a primary "No." item or a continuation of a previous item
            if current_row: # If there's an incomplete row, this new single item might be its "No."
                table_rows.append(current_row)
                current_row = []
            current_row.append(content[0]) # Add the "No."
            current_row.append("") # Placeholder for "Items" until we find it
            current_row.append("") # Placeholder for "Notes"
        elif len(content) == 1 and content[0].lower() in ["a", "b", "c", "d"]:
            # This is a sub-item, append to the last item in table_rows if it makes sense.
            # This is a simplification; a more robust solution would track parent items.
            if table_rows:
                table_rows[-1][0] += " " + content[0] # Appending sub-item letter to No.
            else:
                current_row.append(content[0]) # Add sub-item letter
                current_row.append("")
                current_row.append("")
        elif len(content) == 2:
            # Could be a continuation of an item or a new item with just two values
            if current_row and len(current_row) == 2: # "No.", "Items"
                current_row[1] += " " + content[0] # Concatenate item name
                current_row.extend(content[1:])
            elif current_row and len(current_row) == 3 and current_row[1] == "": # "No.", "", "Notes"
                 current_row[1] = content[0] # Fill in the Item
                 current_row.extend(content[1:])
            else: # new row with just two values (e.g., "Foreign exchange commitments")
                # This logic is simplified; it assumes no "No." for these items.
                # A more sophisticated parser would know to associate these with previous "No."
                table_rows.append(["", content[0], "", content[1], ""]) # Assuming it maps to Items, and a value
        elif len(content) == 3:
            if current_row and current_row[1] == "" and content[0] in ["C", "c", "D", "d"]: # For 'C' and 'D' items that skip the 'No.' column directly
                current_row[0] = content[0] # Set the 'No.' to 'C' or 'D'
                current_row[1] = content[1] # Set the item description
                current_row.append(content[2]) # Set the 31/12/2024 value
                current_row.append("") # Empty 31/12/2023 value
                table_rows.append(current_row)
                current_row = []
            else:
                # If there's an existing `current_row` with just a number, try to fill it
                if current_row and len(current_row) == 3 and current_row[1] == "": # ['No.', '', '']
                    current_row[1] = content[0] # Item
                    current_row[3:] = content[1:] # 31/12/2024 and 31/12/2023*
                    table_rows.append(current_row)
                    current_row = []
                elif current_row and len(current_row) == 1: # ['No.']
                    current_row.append(content[0]) # Item
                    current_row.append("") # Notes
                    current_row.append(content[1]) # 31/12/2024
                    current_row.append(content[2]) # 31/12/2023*
                    table_rows.append(current_row)
                    current_row = []
                else: # New row with 3 items (e.g., "Item", "Value 2024", "Value 2023")
                    table_rows.append(["", content[0], "", content[1], content[2]]) # Assuming no 'No.'
        elif len(content) == 4:
            # If the first item is a single digit and the others are numbers, it's a full row.
            if content[0].isdigit():
                table_rows.append([content[0], content[1], "", content[2], content[3]])
            else: # If the first is not a digit, it's an item with values
                table_rows.append(["", content[0], "", content[1], content[2]]) # Assuming the first is item, then values
        elif len(content) == 5: # Full row including Notes column
            table_rows.append(content)
        elif len(content) == 0:
            pass # Skip empty lines
        elif "interest from loans" in " ".join(content): # Special handling for "Uncollected interest from loans and fee receivables"
            if len(content) == 3: # "Uncollected interest from loans and", "21,503,201", "17,967,080"
                if current_row and len(current_row) == 1 and current_row[0] == "6": # If "6" is pending
                    current_row.append(content[0] + " " + data.get("line_items", [])[item["line_number"] + 1]["content"][0]) # Combine "Uncollected interest from loans and" and "fee receivables"
                    current_row.append("") # Notes
                    current_row.append(content[1]) # 2024
                    current_row.append(content[2]) # 2023
                    table_rows.append(current_row)
                    current_row = []
            elif len(content) == 2: # "fee receivables"
                # This part is handled by the previous step's concatenation.
                pass
        elif "Doubtful debt written-off" in " ".join(content):
            if len(content) == 3:
                if current_row and len(current_row) == 1 and current_row[0] == "7":
                    current_row.append(content[0])
                    current_row.append("")
                    current_row.append(content[1])
                    current_row.append(content[2])
                    table_rows.append(current_row)
                    current_row = []

    # Clean up the table rows for multi-line items and correct placement
    final_table_rows = []
    i = 0
    while i < len(table_rows):
        row = table_rows[i]
        if row[0].isdigit() and row[1] == "": # It's a "No." with a blank item, usually followed by the item
            next_row_index = i + 1
            if next_row_index < len(table_rows):
                next_row = table_rows[next_row_index]
                if next_row[0] == "": # The next row contains the item description
                    row[1] = next_row[1] if next_row[1] else "" # Fill in the item description
                    if len(next_row) > 3: # Check if values exist in the next row
                        row[3] = next_row[3] if len(next_row) > 3 else "" # 2024 value
                        row[4] = next_row[4] if len(next_row) > 4 else "" # 2023 value
                    i += 1 # Skip the next row as it's merged
            final_table_rows.append(row)
        elif row[0] == "" and (row[1] == "Foreign exchange commitments" or row[1] == "Letter of credit commitments" or row[1] == "Other guarantees" or row[1] == "Other commitments" or row[1] == "Doubtful debt written-off" or row[1] == "Other assets and documents"):
            # These are main items that sometimes appear without an explicit 'No.' before them in the data
            # but are implied to be part of the 'No.' they follow (or are a new main item).
            # This requires more complex state management to link them to the correct 'No.' if they are sub-items.
            # For simplicity, if they directly follow a "No." line, they are considered part of it.
            # Otherwise, treat them as new main items.
            if not final_table_rows or not final_table_rows[-1][0].isdigit():
                final_table_rows.append(row)
            else: # If previous was a number, try to associate. This part is tricky given the JSON structure.
                # Here, we treat them as independent items for now as the JSON doesn't provide a clear hierarchy.
                final_table_rows.append(row)

        elif row[0].strip() in ["a", "b", "c", "d"]:
             # This is a sub-item, so attach it to the most recent main item
            if final_table_rows:
                # Assuming 'Notes' is empty and values are in 3rd and 4th position if available.
                final_table_rows.append(row)
            else:
                final_table_rows.append(row)
        else:
            final_table_rows.append(row)
        i += 1

    # Further refinement for items that have multiple content elements that are part of one logical row
    refined_rows = []
    i = 0
    while i < len(final_table_rows):
        row = final_table_rows[i]
        # Consolidate "Uncollected interest from loans and fee receivables"
        if "Uncollected interest from loans and" in row[1] and i + 1 < len(final_table_rows):
            next_row = final_table_rows[i+1]
            if "fee receivables" in next_row[1]:
                row[1] = "Uncollected interest from loans and fee receivables"
                # The values should already be in the initial row from previous logic.
                i += 1 # Skip the "fee receivables" row
        elif row[0] == "2" and row[1] == "": # Special handling for "Foreign exchange commitments" and its sub-items
            # This is a common pattern where a number is followed by the main item.
            # The JSON doesn't clearly link '2' to 'Foreign exchange commitments'
            # For accurate rendering, I manually identify this based on the problem description.
            # This part is highly dependent on the specific JSON structure provided.
            if i + 1 < len(final_table_rows) and "Foreign exchange commitments" in final_table_rows[i+1][1]:
                # Merge the "2" with "Foreign exchange commitments"
                new_row = ["2", "Foreign exchange commitments", "", final_table_rows[i+1][3], final_table_rows[i+1][4]]
                refined_rows.append(new_row)
                i += 1 # Skip the "Foreign exchange commitments" row
            else:
                refined_rows.append(row)
        elif row[0] == "3" and row[1] == "": # Special handling for "Letter of credit commitments"
             if i + 1 < len(final_table_rows) and "Letter of credit commitments" in final_table_rows[i+1][1]:
                new_row = ["3", "Letter of credit commitments", "", final_table_rows[i+1][3], final_table_rows[i+1][4]]
                refined_rows.append(new_row)
                i += 1
             else:
                refined_rows.append(row)
        elif row[0] == "4" and row[1] == "": # Special handling for "Other guarantees"
            if i + 1 < len(final_table_rows) and "Other guarantees" in final_table_rows[i+1][1]:
                new_row = ["4", "Other guarantees", "", final_table_rows[i+1][3], final_table_rows[i+1][4]]
                refined_rows.append(new_row)
                i += 1
            else:
                refined_rows.append(row)
        elif row[0] == "5" and row[1] == "": # Special handling for "Other commitments"
            if i + 1 < len(final_table_rows) and "Other commitments" in final_table_rows[i+1][1]:
                new_row = ["5", "Other commitments", "", final_table_rows[i+1][3], final_table_rows[i+1][4]]
                refined_rows.append(new_row)
                i += 1
            else:
                refined_rows.append(row)
        elif row[0] == "6" and row[1] == "": # Special handling for "Uncollected interest from loans and fee receivables"
            if i + 1 < len(final_table_rows) and "Uncollected interest from loans and" in final_table_rows[i+1][1]:
                item_desc = final_table_rows[i+1][1]
                if i + 2 < len(final_table_rows) and "fee receivables" in final_table_rows[i+2][1]:
                    item_desc += " " + final_table_rows[i+2][1]
                new_row = ["6", item_desc, "", final_table_rows[i+1][3], final_table_rows[i+1][4]]
                refined_rows.append(new_row)
                i += 2 # Skip both "Uncollected interest from loans and" and "fee receivables"
            else:
                refined_rows.append(row)
        elif row[0] == "7" and row[1] == "": # Special handling for "Doubtful debt written-off"
            if i + 1 < len(final_table_rows) and "Doubtful debt written-off" in final_table_rows[i+1][1]:
                new_row = ["7", "Doubtful debt written-off", "", final_table_rows[i+1][3], final_table_rows[i+1][4]]
                refined_rows.append(new_row)
                i += 1
            else:
                refined_rows.append(row)
        elif row[0] == "8" and row[1] == "": # Special handling for "Other assets and documents"
            if i + 1 < len(final_table_rows) and "Other assets and documents" in final_table_rows[i+1][1]:
                new_row = ["8", "Other assets and documents", "", final_table_rows[i+1][3], final_table_rows[i+1][4]]
                refined_rows.append(new_row)
                i += 1
            else:
                refined_rows.append(row)

        else:
            refined_rows.append(row)
        i += 1

    # Another pass to correct the 'a', 'b', 'c', 'd' placements and ensure correct column count
    final_structured_rows = []
    for row in refined_rows:
        if row[0] in ["a", "b", "c", "d"]:
            # These are sub-items, and their `No.` column should contain the letter.
            # Their corresponding values are usually at index 2 and 3 if the "Notes" column is empty.
            # We need to ensure each row has 5 elements for the table.
            formatted_row = [row[0], row[1], "", row[2] if len(row) > 2 else "", row[3] if len(row) > 3 else ""]
            final_structured_rows.append(formatted_row)
        elif row[0] == "": # Items without a number directly preceding them
            formatted_row = ["", row[1], "", row[2] if len(row) > 2 else "", row[3] if len(row) > 3 else ""]
            final_structured_rows.append(formatted_row)
        else:
            # Ensure all rows have 5 elements for the markdown table
            formatted_row = row + [""] * (5 - len(row))
            final_structured_rows.append(formatted_row)

    # Convert to Markdown table format
    markdown_table = f"## {title}\n\n**{date_info}**\n\n"
    markdown_table += "| " + " | ".join(table_headers) + " |\n"
    markdown_table += "|---" * len(table_headers) + "|\n"

    for row in final_structured_rows:
        # Special handling for "Uncollected interest from loans and fee receivables" for rendering
        if row[0] == "6" and row[1] == "Uncollected interest from loans and fee receivables":
            markdown_table += f"| {row[0]} | {row[1]} | {row[2]} | {row[3]} | {row[4]} |\n"
        elif "Principal of bad debts written off" in row[1] or "Interest of bad debts written off" in row[1]:
            # For these, the 'No.' should be 'a' or 'b'
            # Assuming they follow "7 Doubtful debt written-off"
            markdown_table += f"| {row[0]} | {row[1]} | {row[2]} | {row[3]} | {row[4]} |\n"
        else:
            markdown_table += "| " + " | ".join(map(str, row)) + " |\n"

    # Add the disclaimer
    disclaimer_start_line = None
    for i, item in enumerate(data.get("line_items", [])):
        if "*) The brought forward figures are carried down from the audited consolidated FS for the financial year ended" in " ".join(item["content"]):
            disclaimer_start_line = i
            break

    if disclaimer_start_line is not None:
        disclaimer = " ".join(data["line_items"][disclaimer_start_line]["content"]) + " " + \
                     " ".join(data["line_items"][disclaimer_start_line + 1]["content"])
        markdown_table += f"\n<br/>{disclaimer}\n"

    return markdown_table

# Generate the table
table_output = convert_json_to_table(json_data)

# Create excel_output directory if it doesn't exist
output_dir = "/Users/phuong.nguyen24/Downloads/UNIVERSITY/Honour Project/OCR_Method/Code/excel_output"
os.makedirs(output_dir, exist_ok=True)

# Generate timestamp for filename
timestamp = time.strftime("%Y%m%d_%H%M%S")
output_filename = f"financial_table_{timestamp}.xlsx"
output_path = os.path.join(output_dir, output_filename)

# Extract structured data for Excel
def extract_data_for_excel(data):
    title = data.get("title", "")
    date_info = data.get("line_items", [])[1]["content"][0] if len(data.get("line_items", [])) > 1 else ""
    table_headers = data.get("line_items", [])[2]["content"] if len(data.get("line_items", [])) > 2 else []

    # Use the same logic from convert_json_to_table but return structured data
    table_rows = []
    current_row = []
    
    for item in data.get("line_items", [])[3:]:
        content = item["content"]

        if len(content) == 1 and content[0].lower() not in ["a", "b", "c", "d"]:
            if current_row:
                table_rows.append(current_row)
                current_row = []
            current_row.append(content[0])
            current_row.append("")
            current_row.append("")
        elif len(content) == 1 and content[0].lower() in ["a", "b", "c", "d"]:
            if table_rows:
                table_rows[-1][0] += " " + content[0]
            else:
                current_row.append(content[0])
                current_row.append("")
                current_row.append("")
        elif len(content) == 2:
            if current_row and len(current_row) == 2:
                current_row[1] += " " + content[0]
                current_row.extend(content[1:])
            elif current_row and len(current_row) == 3 and current_row[1] == "":
                current_row[1] = content[0]
                current_row.extend(content[1:])
            else:
                table_rows.append(["", content[0], "", content[1], ""])
        elif len(content) == 3:
            if current_row and current_row[1] == "" and content[0] in ["C", "c", "D", "d"]:
                current_row[0] = content[0]
                current_row[1] = content[1]
                current_row.append(content[2])
                current_row.append("")
                table_rows.append(current_row)
                current_row = []
            else:
                if current_row and len(current_row) == 3 and current_row[1] == "":
                    current_row[1] = content[0]
                    current_row.extend(content[1:])
                    table_rows.append(current_row)
                    current_row = []
                elif current_row and len(current_row) == 1:
                    current_row.append(content[0])
                    current_row.append("")
                    current_row.extend(content[1:])
                    table_rows.append(current_row)
                    current_row = []
                else:
                    table_rows.append(["", content[0], "", content[1], content[2]])
        elif len(content) == 4:
            if content[0].isdigit():
                table_rows.append([content[0], content[1], "", content[2], content[3]])
            else:
                table_rows.append(["", content[0], "", content[1], content[2]])
        elif len(content) == 5:
            table_rows.append(content)

    # Clean up and ensure all rows have 5 columns
    final_rows = []
    for row in table_rows:
        if len(row) < 5:
            row.extend([""] * (5 - len(row)))
        final_rows.append(row[:5])

    return title, date_info, table_headers, final_rows

# Extract data for Excel
title, date_info, headers, rows = extract_data_for_excel(json_data)

# Determine the actual number of columns needed
max_cols = 0
if headers:
    max_cols = len(headers)
for row in rows:
    max_cols = max(max_cols, len(row))

# Ensure all rows have the same number of columns
standardized_rows = []
for row in rows:
    standardized_row = row + [""] * (max_cols - len(row))
    standardized_rows.append(standardized_row[:max_cols])

# Create appropriate column headers if none exist or if they don't match
if not headers or len(headers) != max_cols:
    headers = [f"Column_{i+1}" for i in range(max_cols)]

# Save as Excel file
try:
    # Create DataFrame with standardized data
    df = pd.DataFrame(standardized_rows, columns=headers)
    
    # Create Excel writer object
    with pd.ExcelWriter(output_path, engine='openpyxl') as writer:
        # Write the main data
        df.to_excel(writer, sheet_name='Financial Data', index=False, startrow=3)
        
        # Get the workbook and worksheet
        workbook = writer.book
        worksheet = writer.sheets['Financial Data']
        
        # Add title and date
        worksheet['A1'] = title
        worksheet['A2'] = date_info if date_info else "Financial Data"
        
        # Style the title
        from openpyxl.styles import Font, Alignment
        worksheet['A1'].font = Font(bold=True, size=14)
        worksheet['A2'].font = Font(size=12)
        worksheet['A1'].alignment = Alignment(horizontal='center')
        worksheet['A2'].alignment = Alignment(horizontal='center')
        
        # Merge cells for title (adjust based on actual column count)
        end_col = chr(ord('A') + max_cols - 1)
        worksheet.merge_cells(f'A1:{end_col}1')
        worksheet.merge_cells(f'A2:{end_col}2')
    
    print(f"Financial table saved as Excel file: {output_path}")
    print(f"\nFile contains {len(standardized_rows)} data rows with {max_cols} columns")
    print(f"Title: {title}")
    print(f"Date: {date_info}")
    print(f"Columns: {headers}")
    
except Exception as e:
    print(f"Error saving Excel file: {e}")
    print("Make sure pandas and openpyxl are installed: pip install pandas openpyxl")
    print("\nFalling back to markdown output:")
    print(table_output[:500] + "..." if len(table_output) > 500 else table_output)