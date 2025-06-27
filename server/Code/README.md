# Financial Document OCR & Analysis System

## Executive Summary

A comprehensive system for processing financial documents using OCR technology and AI-powered analysis. This application extracts data from financial statements, balance sheets, and other financial documents, then provides structured analysis using large language models.

## System Architecture

### Technical Stack
- **Backend Framework**: Flask (Python 3.8+)
- **OCR Engine**: PaddleOCR for text extraction
- **AI Analysis**: OpenAI GPT models for financial analysis
- **API Design**: RESTful web services
- **Output Formats**: JSON, Excel, and text files

### Supported Document Types
- Operating Cost Statements
- Balance Sheets  
- Cash Flow Statements
- Profit & Loss Statements

## Installation & Setup

### Prerequisites
- Python 3.8 or higher
- PaddlePaddle OCR library
- Valid OpenAI API key
- Minimum 4GB RAM (recommended for OCR processing)
- Internet connection for API access

### Installation Steps

1. **Navigate to Project Directory**
   ```bash
   cd server/Code
   ```

2. **Create and Activate Virtual Environment**
   ```bash
   # Create virtual environment
   python -m venv venv
   
   # Activate virtual environment
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install Required Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure Environment Variables**
   ```bash
   # Create .env file with your OpenAI API key
   echo "OPENAI_API_KEY=your_openai_api_key_here" > .env
   ```

5. **Launch Application**
   ```bash
   python app.py
   ```
   
   The Flask API server will start on `http://localhost:5001`

## API Documentation

### Primary Endpoints

#### Document Processing
**Endpoint**: `POST /api/process-document`

**Purpose**: Upload and process financial documents through OCR and AI analysis

**Request Parameters**:
- `document`: Image file (PNG, JPG) or PDF document
- `category`: Document classification (`operating-cost`, `balance-sheet`, `cash-flow`, `profit`)

**Response**: Structured financial data in JSON format

#### Summary Generation
**Endpoint**: `POST /api/generate-summary`

**Purpose**: Generate comprehensive analytical summaries from processed documents

#### Health Check
**Endpoint**: `GET /api/health`

**Purpose**: Verify system status and service availability

## Core Features

### OCR Processing
- Advanced text extraction from financial document images using PaddleOCR
- Support for multiple image formats and PDF documents
- High accuracy text recognition optimized for financial data

### AI-Powered Analysis
- Structured financial analysis using OpenAI GPT models
- Automated categorization and data extraction
- Intelligent parsing of financial metrics and key performance indicators

### Multi-Format Export
- JSON output for programmatic access
- Excel spreadsheets for data analysis
- Plain text files for documentation

### Integration Capabilities
- RESTful API design for frontend integration
- Scalable architecture for enterprise deployment
- Comprehensive error handling and logging

## Configuration

### Environment Variables
Create a `.env` file in the project root with the following configuration:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

### Document Category Mapping
- `operating-cost` → Income Statement analysis
- `profit` → Profit & Loss Statement analysis  
- `balance-sheet` → Balance Sheet analysis
- `cash-flow` → Cash Flow Statement analysis

## Project Structure

```
Code/
├── app.py                           # Main Flask API server
├── financial_document_parser.py     # OCR processing with PaddleOCR
├── LLM_Request.py                   # OpenAI API integration
├── requirements.txt                 # Python dependencies
├── .env                            # Environment variables (create this)
├── agent_Prompt/                   # AI prompts for financial analysis
├── uploads/                        # Document upload directory
├── output/                         # Processed results
│   ├── text_results/              # OCR text extraction output
│   └── financial_analysis/        # AI analysis results
└── utils/                          # Utility functions and helpers
```

## Troubleshooting

### Common Installation Issues

**PaddleOCR Installation Problems**
```bash
pip install paddlepaddle paddleocr
```

**OpenAI API Authentication Errors**
- Verify API key configuration in `.env` file
- Check API rate limits and account billing status
- Ensure internet connectivity for API requests

**Port Conflicts**
If port 5001 is already in use, modify the port in `app.py`:
```python
app.run(port=5002)  # Change to available port
```

### System Requirements
- **Python Version**: 3.8 or higher
- **Memory**: 4GB+ RAM recommended for optimal OCR performance
- **Network**: Stable internet connection required for OpenAI API
- **Storage**: Adequate disk space for document uploads and processed outputs

## Support & Licensing

**License**: This project is developed for academic and research purposes.

**Technical Support**: For technical issues or questions, please refer to the troubleshooting section or check the project documentation.

**API Rate Limits**: Be aware of OpenAI API usage limits and associated costs when processing large volumes of documents.
