# Artificial Intelligence Application in Analyzing Financial Reports: MVP Development Summary

Before delving into the detailed plan, this summary provides an overview of a BSc Computer Science undergraduate project focused on developing an AI-driven web application for financial report analysis. The project aims to transform traditional manual financial analysis into an automated, efficient process using Large Language Models, with the current phase transitioning from model development to integration and testing as of March 14, 2025.

## Project Overview and Current Status

This project aims to develop an AI-powered web application that extracts and visualizes key financial metrics from unstructured document formats including PDFs, Word documents, and Excel spreadsheets. The solution leverages Large Language Models (LLMs) to automatically analyze financial reports, providing consultants, accountants, and business owners with rapid insights from financial data.

As of **May 27, 2025**, the project has progressed significantly through frontend development. Core functionalities such as document upload, simulated processing, and results visualization are implemented. Recent efforts have focused on resolving UI bugs, including JSX syntax errors and layout issues, to ensure the application renders correctly and utilizes the full viewport. The integration of mock data for demonstration and testing purposes is also complete. The project is now moving towards more comprehensive testing, deeper backend integration, and preparation for deployment.

Based on the reports provided, the project has successfully completed:
1. The project proposal (A1) outlining background, rationale, aims, and objectives
2. A comprehensive literature review (A2) examining existing research in AI-based financial analysis

According to the timeline in the project planning documentation, the project is currently transitioning from the model development phase to the integration and testing phase. With today's date being March 14, 2025, the project has progressed through approximately 75% of Phase 3 (Model Development) and should be preparing to begin Phase 4 (Integration & Testing).

## Core MVP Features

The Minimum Viable Product should include the following essential features to demonstrate the concept's viability:

### Document Processing Capabilities

The MVP requires robust document handling to process various financial report formats. This includes:

1. A document upload interface supporting multiple formats (PDF, Word, Excel)
2. Implementation of document parsing using tools like MinerU to convert unstructured documents into machine-readable formats
3. Text segmentation to identify relevant sections within financial reports

This component forms the foundation of the application, as the accuracy of subsequent analysis depends entirely on successful document processing.

### AI-Powered Data Extraction

The central feature of the MVP is the AI model that extracts key financial information. The application will use GPT-4o-mini, which has been identified as a cost-effective model with sufficient capabilities. The model needs to extract:

1. Income statement metrics: Revenue, Gross Profit, Operating Income, Net Income
2. Balance sheet information: Assets, Liabilities, Equity
3. Cash flow statement details: Operating Activities, Investing Activities, Financing Activities

The AI component must accurately identify these data points even when presented in different formats or layouts across various financial reports.

### Data Visualization Module

The MVP should include essential visualization tools to present the extracted financial data in meaningful ways:

1. Line charts displaying Cash Flow from Operating Activities (CFO) values and trend analysis
2. Stacked area charts showing different cash inflows and outflows as separate layers
3. Waterfall charts illustrating the breakdown of cash components from net income

These visualizations provide stakeholders with clear representations of financial performance and operational cash movements.

## MVP Development Timeline

Based on the project's Gantt chart and current date (March 14, 2025), the MVP development should follow this timeline:

### Immediate Focus: Model Completion and Integration (March-April 2025)

The project should prioritize:
1. Finalizing the AI model configuration and optimization
2. Building the web application framework
3. Implementing document upload and processing functionalities
4. Creating data extraction pipelines
5. Conducting iterative testing with diverse financial reports

This phase requires careful attention to the accuracy of data extraction across different document formats and financial terminology.

### Secondary Focus: Visualization Development (April-May 2025)

Following successful integration, development should shift to:
1. Implementing the three core visualization types
2. Creating interactive elements for data exploration
3. Ensuring visualizations accurately represent extracted financial data
4. Testing with real financial data to verify visualization accuracy

### Final Phase: Review and Deployment (Mid-May 2025)

The MVP should be completed with:
1. Comprehensive testing of the end-to-end workflow
2. User interface refinements based on testing feedback
3. Documentation creation for users
4. Preparation for deployment

## Critical Considerations for MVP Success

Several factors require special attention during MVP development:

### Data Format Handling

The literature review identified inconsistent data formats as a significant challenge. The MVP needs to implement:
1. Robust document parsing for different input formats
2. Effective preprocessing workflows
3. Error detection mechanisms for numerical data extraction

### Model Accuracy

Ensuring high accuracy in financial data extraction is paramount. The MVP must:
1. Accurately identify and extract numerical values
2. Understand the context of extracted figures
3. Correctly classify financial information
4. Handle specialized financial terminology

### User Experience

The MVP should prioritize usability for non-technical users:
1. Create an intuitive interface for document uploading
2. Provide clear feedback during processing
3. Present results in an easily understandable format
4. Allow for exploration of visualization components

## Conclusion

The MVP for the AI Application in Analyzing Financial Reports project should focus on delivering a functional system that demonstrates the core value proposition: automated extraction and visualization of key financial metrics from unstructured documents. With the current date being March 14, 2025, the primary focus should be on finalizing the model development and beginning the integration phase.

By following this development plan, the project can deliver a viable product that showcases the potential of AI in transforming financial analysis workflows, setting the foundation for future enhancements and features beyond the MVP.

Sources
[1] 24196077_NguyenPhuongDo_LiteratureReview_2024-2025.pdf https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/56481725/857967f3-d9cd-4cbc-aa77-da18d7caa866/24196077_NguyenPhuongDo_LiteratureReview_2024-2025.pdf
[2] A1Proposal.pdf https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/56481725/e3b0be2c-6f56-4641-9dbe-5577a25a988a/A1Proposal.pdf
