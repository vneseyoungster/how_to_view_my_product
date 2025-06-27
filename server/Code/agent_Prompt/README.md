# Agent Prompts

This directory contains system prompts for different financial analysis scenarios used by the Financial_Agent class.

## Available Prompts

### `income_statement.txt`
- **Purpose**: Extract income statement data from financial documents
- **Focus**: Revenue, costs, profits, and operating metrics
- **Output**: JSON format with 6 key financial metrics

### `balance_sheet.txt`
- **Purpose**: Extract balance sheet data from financial documents
- **Focus**: Assets, liabilities, and equity components
- **Output**: JSON format with 7 key balance sheet items

### `cash_flow.txt`
- **Purpose**: Extract cash flow statement data from financial documents
- **Focus**: Operating, investing, and financing cash flows
- **Output**: JSON format with 7 cash flow metrics

### `general_analysis.txt`
- **Purpose**: Comprehensive financial analysis with key ratios
- **Focus**: Overall financial health and performance metrics
- **Output**: JSON format with 10 financial ratios and metrics

## Usage

The prompts are automatically loaded by the `PromptLoader` class when the Financial_Agent is initialized with different analysis types:

```python
# Income statement analysis (default)
agent = Financial_Agent()
result = agent.analyze_financial_data(text, analysis_type="income_statement")

# Balance sheet analysis
result = agent.analyze_financial_data(text, analysis_type="balance_sheet")

# Cash flow analysis
result = agent.analyze_financial_data(text, analysis_type="cash_flow")

# General analysis
result = agent.analyze_financial_data(text, analysis_type="general_analysis")
```

## Prompt Format

All prompts follow a consistent structure:
1. **Role Definition**: Establishes the AI's expertise and role
2. **Task Description**: Clearly defines the analysis objective
3. **Data Requirements**: Lists specific information to extract
4. **Output Format**: Provides JSON template with example values
5. **Validation Rules**: Includes accuracy checks and fallback instructions

## Adding New Prompts

To add a new analysis type:
1. Create a new `.txt` file with the prompt content
2. Follow the existing prompt structure and format
3. Update the `PromptLoader` class if needed
4. Test with the Financial_Agent class

## Notes

- All prompts request JSON output for consistency
- Date ranges are included for time-series analysis
- Fallback to "N/A" is specified for missing data
- Prompts include validation rules specific to each financial statement type 