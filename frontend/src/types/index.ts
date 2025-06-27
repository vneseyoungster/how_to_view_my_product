// Main Types Index
// Re-export all financial document types

export * from './balanceSheet';
export * from './cashFlow';
export * from './incomeStatement';
export * from './financialPosition';

// Common shared types
export interface FinancialMetric {
  value: number | string;
  from?: string;
  to?: string;
}

export interface ProcessingResultFile {
  ocr: string;
  parsing: string;
  analysis: string;
  json?: string;
}

export interface ProcessingResult {
  success: boolean;
  ocr_text: string;
  parsing_results: string;
  financial_analysis: string;
  financial_data?: Record<string, FinancialMetric>;
  files: ProcessingResultFile;
  error?: string;
} 