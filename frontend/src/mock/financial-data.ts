/**
 * Mock financial data for visualization
 * This data structure matches the expected financial data interface used by visualization components
 */

import { FinancialData, BackendCashFlowData } from '../components/Visualization/types';
import { IncomeStatementData } from '../types/incomeStatement';

export interface FinancialMetric {
  value: number | string;
  from?: string;
  to?: string;
}

// Mock income statement data for tech company
const techCompanyIncomeData: IncomeStatementData = {
  "2024": {
    "Q4": {
      "Net_Interest_Income": 15638753,
      "Net_Gains_from_Services": 1966665,
      "Total_Operating_Income": 33049950,
      "Total_Operating_Expenses": 9382068,
      "Provision_for_Credit_Losses": 7686946,
      "Profit_Before_Tax": 9336316,
      "Owners_Net_Profit": 7328333
    },
    "Q4_YTD": {
      "Net_Interest_Income": 58007600,
      "Net_Gains_from_Services": 7073571,
      "Total_Operating_Income": 134297047,
      "Total_Operating_Expenses": 27790446,
      "Provision_for_Credit_Losses": 21886528,
      "Profit_Before_Tax": 31383041,
      "Owners_Net_Profit": 24658253
    }
  },
  "2023": {
    "Q4": {
      "Net_Interest_Income": 14869089,
      "Net_Gains_from_Services": 1614305,
      "Total_Operating_Income": 20438612,
      "Total_Operating_Expenses": 7830729,
      "Provision_for_Credit_Losses": -4933966,
      "Profit_Before_Tax": 7825904,
      "Owners_Net_Profit": 6027424
    },
    "Q4_YTD": {
      "Net_Interest_Income": 56135566,
      "Net_Gains_from_Services": 6569870,
      "Total_Operating_Income": 123979377,
      "Total_Operating_Expenses": 25080598,
      "Provision_for_Credit_Losses": 20343515,
      "Profit_Before_Tax": 27588904,
      "Owners_Net_Profit": 21504918
    }
  }
};

// Mock income statement data for manufacturing company
const manufacturingCompanyIncomeData: IncomeStatementData = {
  "2024": {
    "Q4_YTD": {
      "Net_Interest_Income": 12500000,
      "Net_Gains_from_Services": 2800000,
      "Total_Operating_Income": 45200000,
      "Total_Operating_Expenses": 38500000,
      "Provision_for_Credit_Losses": 1200000,
      "Profit_Before_Tax": 5500000,
      "Owners_Net_Profit": 4125000
    }
  },
  "2023": {
    "Q4_YTD": {
      "Net_Interest_Income": 11800000,
      "Net_Gains_from_Services": 2400000,
      "Total_Operating_Income": 42500000,
      "Total_Operating_Expenses": 36200000,
      "Provision_for_Credit_Losses": 1100000,
      "Profit_Before_Tax": 5200000,
      "Owners_Net_Profit": 3900000
    }
  }
};

// Mock income statement data for retail company
const retailCompanyIncomeData: IncomeStatementData = {
  "2024": {
    "Q4_YTD": {
      "Net_Interest_Income": 8200000,
      "Net_Gains_from_Services": 1900000,
      "Total_Operating_Income": 28500000,
      "Total_Operating_Expenses": 24800000,
      "Provision_for_Credit_Losses": 800000,
      "Profit_Before_Tax": 2900000,
      "Owners_Net_Profit": 2175000
    }
  },
  "2023": {
    "Q4_YTD": {
      "Net_Interest_Income": 7800000,
      "Net_Gains_from_Services": 1650000,
      "Total_Operating_Income": 26200000,
      "Total_Operating_Expenses": 23100000,
      "Provision_for_Credit_Losses": 750000,
      "Profit_Before_Tax": 2350000,
      "Owners_Net_Profit": 1762500
    }
  }
};

/**
 * Mock data for a successful tech company
 */
export const techCompanyData: FinancialData = {
  periods: ['Q1 2023', 'Q2 2023', 'Q3 2023', 'Q4 2023', 'Q1 2024', 'Q2 2024'],
  cashFlowOperating: [4500000, 5200000, 6100000, 6800000, 7500000],
  cashInflows: {
    operatingActivities: [8000000, 9500000, 11000000, 12500000, 14000000],
    investingActivities: [1000000, 1200000, 800000, 1500000, 2000000],
    financingActivities: [5000000, 3000000, 2000000, 1000000, 500000]
  },
  cashOutflows: {
    operatingActivities: [3500000, 4300000, 4900000, 5700000, 6500000],
    investingActivities: [4000000, 4500000, 5000000, 6000000, 7000000],
    financingActivities: [1000000, 1500000, 2000000, 2500000, 3000000]
  },
  netIncomeComponents: {
    labels: ['Net Income', 'Depreciation', 'Changes in Working Capital', 'Other Adjustments', 'Cash from Operations'],
    values: [6000000, 1500000, -500000, 500000, 7500000]
  },
  profitBeforeTax: [3500000, 3800000, 4100000, 4400000, 4700000],
  financialMetrics: {
    "Revenue": {
      "value": 14000000,
      "from": "2024-01-01",
      "to": "2024-03-31"
    },
    "Cost of Revenue": {
      "value": 5600000,
      "from": "2024-01-01",
      "to": "2024-03-31"
    },
    "Gross Profit": {
      "value": 8400000,
      "from": "2024-01-01",
      "to": "2024-03-31"
    },
    "Research & Development": {
      "value": 2100000,
      "from": "2024-01-01",
      "to": "2024-03-31"
    },
    "Sales & Marketing": {
      "value": 1400000,
      "from": "2024-01-01",
      "to": "2024-03-31"
    },
    "General & Administrative": {
      "value": 980000,
      "from": "2024-01-01",
      "to": "2024-03-31"
    },
    "Operating Income": {
      "value": 3920000,
      "from": "2024-01-01",
      "to": "2024-03-31"
    },
    "Net Income": {
      "value": 3136000,
      "from": "2024-01-01",
      "to": "2024-03-31"
    },
    "EPS": {
      "value": 2.45,
      "from": "2024-01-01",
      "to": "2024-03-31"
    },
    "Operating Margin": {
      "value": "28%",
      "from": "2024-01-01",
      "to": "2024-03-31"
    },
    "Net Profit Margin": {
      "value": "22.4%",
      "from": "2024-01-01",
      "to": "2024-03-31"
    }
  },
  // Sample backend cash flow data
  backendCashFlowData: {
    "2023": {
      "Q4": {
        "Net_Operation": 1200000,
        "Net_Investing": -1500000,
        "Net_Financing": 800000,
        "Profit_Before_Tax": 980000
      },
      "Q4_YTD": {
        "Net_Operation": 4500000,
        "Net_Investing": -4000000,
        "Net_Financing": 5000000,
        "Profit_Before_Tax": 3920000
      }
    },
    "2024": {
      "Q4": {
        "Net_Operation": 1800000,
        "Net_Investing": -2200000,
        "Net_Financing": 200000,
        "Profit_Before_Tax": 1100000
      },
      "Q4_YTD": {
        "Net_Operation": 7500000,
        "Net_Investing": -7000000,
        "Net_Financing": 500000,
        "Profit_Before_Tax": 4200000
      }
    }
  },
  incomeStatementData: {
    "2024": {
      "Q4_YTD": {
        "Total_Income": 250000000,
        "Total_Expenses": 180000000,
        "Gross_Profit": 70000000,
        "Profit_Before_Tax": 45000000,
        "Profit_After_Tax": 35000000
      },
      "Q3_YTD": {
        "Total_Income": 180000000,
        "Total_Expenses": 135000000,
        "Gross_Profit": 45000000,
        "Profit_Before_Tax": 28000000,
        "Profit_After_Tax": 22000000
      },
      "Q2": {
        "Total_Income": 65000000,
        "Total_Expenses": 48000000,
        "Gross_Profit": 17000000,
        "Profit_Before_Tax": 12000000,
        "Profit_After_Tax": 9500000
      },
      "Q1": {
        "Total_Income": 58000000,
        "Total_Expenses": 45000000,
        "Gross_Profit": 13000000,
        "Profit_Before_Tax": 8500000,
        "Profit_After_Tax": 6800000
      }
    },
    "2023": {
      "Q4_YTD": {
        "Total_Income": 220000000,
        "Total_Expenses": 165000000,
        "Gross_Profit": 55000000,
        "Profit_Before_Tax": 35000000,
        "Profit_After_Tax": 28000000
      },
      "Q3_YTD": {
        "Total_Income": 155000000,
        "Total_Expenses": 120000000,
        "Gross_Profit": 35000000,
        "Profit_Before_Tax": 22000000,
        "Profit_After_Tax": 17500000
      },
      "Q2": {
        "Total_Income": 52000000,
        "Total_Expenses": 40000000,
        "Gross_Profit": 12000000,
        "Profit_Before_Tax": 7500000,
        "Profit_After_Tax": 6000000
      },
      "Q1": {
        "Total_Income": 48000000,
        "Total_Expenses": 38000000,
        "Gross_Profit": 10000000,
        "Profit_Before_Tax": 6200000,
        "Profit_After_Tax": 4950000
      }
    }
  }
};

/**
 * Mock data for a manufacturing company
 */
export const manufacturingCompanyData: FinancialData = {
  periods: ['Q1 2023', 'Q2 2023', 'Q3 2023', 'Q4 2023', 'Q1 2024', 'Q2 2024'],
  cashFlowOperating: [2200000, 2600000, 2400000, 2900000, 3100000],
  cashInflows: {
    operatingActivities: [5000000, 5500000, 5200000, 6000000, 6500000],
    investingActivities: [200000, 300000, 250000, 400000, 350000],
    financingActivities: [1000000, 1500000, 2000000, 1200000, 800000]
  },
  cashOutflows: {
    operatingActivities: [2800000, 2900000, 2800000, 3100000, 3400000],
    investingActivities: [1500000, 2000000, 1800000, 2200000, 2500000],
    financingActivities: [800000, 700000, 900000, 1000000, 1200000]
  },
  netIncomeComponents: {
    labels: ['Net Income', 'Depreciation', 'Changes in Working Capital', 'Other Adjustments', 'Cash from Operations'],
    values: [2000000, 1200000, -300000, 200000, 3100000]
  },
  profitBeforeTax: [1800000, 2000000, 1900000, 2200000, 2400000],
  financialMetrics: {
    "Revenue": {
      "value": 6500000,
      "from": "2024-01-01",
      "to": "2024-03-31"
    },
    "Cost of Goods Sold": {
      "value": 3900000,
      "from": "2024-01-01",
      "to": "2024-03-31"
    },
    "Gross Profit": {
      "value": 2600000,
      "from": "2024-01-01",
      "to": "2024-03-31"
    },
    "Operating Expenses": {
      "value": 1560000,
      "from": "2024-01-01",
      "to": "2024-03-31"
    },
    "Operating Income": {
      "value": 1040000,
      "from": "2024-01-01",
      "to": "2024-03-31"
    },
    "Net Income": {
      "value": 832000,
      "from": "2024-01-01",
      "to": "2024-03-31"
    },
    "Inventory Turnover": {
      "value": 4.8,
      "from": "2024-01-01",
      "to": "2024-03-31"
    },
    "Gross Margin": {
      "value": "40%",
      "from": "2024-01-01",
      "to": "2024-03-31"
    },
    "Operating Margin": {
      "value": "16%",
      "from": "2024-01-01",
      "to": "2024-03-31"
    },
    "Net Profit Margin": {
      "value": "12.8%",
      "from": "2024-01-01",
      "to": "2024-03-31"
    }
  },
  incomeStatementData: {
    "2024": {
      "Q4_YTD": {
        "Total_Income": 180000000,
        "Total_Expenses": 145000000,
        "Gross_Profit": 35000000,
        "Profit_Before_Tax": 18000000,
        "Profit_After_Tax": 14000000
      },
      "Q3_YTD": {
        "Total_Income": 125000000,
        "Total_Expenses": 102000000,
        "Gross_Profit": 23000000,
        "Profit_Before_Tax": 12000000,
        "Profit_After_Tax": 9500000
      },
      "Q2": {
        "Total_Income": 48000000,
        "Total_Expenses": 39000000,
        "Gross_Profit": 9000000,
        "Profit_Before_Tax": 4800000,
        "Profit_After_Tax": 3800000
      },
      "Q1": {
        "Total_Income": 42000000,
        "Total_Expenses": 35000000,
        "Gross_Profit": 7000000,
        "Profit_Before_Tax": 3500000,
        "Profit_After_Tax": 2800000
      }
    },
    "2023": {
      "Q4_YTD": {
        "Total_Income": 165000000,
        "Total_Expenses": 135000000,
        "Gross_Profit": 30000000,
        "Profit_Before_Tax": 15000000,
        "Profit_After_Tax": 12000000
      },
      "Q3_YTD": {
        "Total_Income": 115000000,
        "Total_Expenses": 96000000,
        "Gross_Profit": 19000000,
        "Profit_Before_Tax": 9500000,
        "Profit_After_Tax": 7600000
      },
      "Q2": {
        "Total_Income": 41000000,
        "Total_Expenses": 34500000,
        "Gross_Profit": 6500000,
        "Profit_Before_Tax": 3200000,
        "Profit_After_Tax": 2550000
      },
      "Q1": {
        "Total_Income": 38000000,
        "Total_Expenses": 32000000,
        "Gross_Profit": 6000000,
        "Profit_Before_Tax": 2900000,
        "Profit_After_Tax": 2320000
      }
    }
  }
};

/**
 * Mock data for a retail company
 */
export const retailCompanyData: FinancialData = {
  periods: ['Q1 2023', 'Q2 2023', 'Q3 2023', 'Q4 2023', 'Q1 2024', 'Q2 2024'],
  cashFlowOperating: [1800000, 1600000, 2100000, 3200000, 2200000],
  cashInflows: {
    operatingActivities: [7500000, 7000000, 8000000, 12000000, 8500000],
    investingActivities: [100000, 150000, 200000, 300000, 250000],
    financingActivities: [500000, 600000, 700000, 800000, 600000]
  },
  cashOutflows: {
    operatingActivities: [5700000, 5400000, 5900000, 8800000, 6300000],
    investingActivities: [800000, 900000, 1000000, 1200000, 1100000],
    financingActivities: [600000, 700000, 800000, 900000, 750000]
  },
  netIncomeComponents: {
    labels: ['Net Income', 'Depreciation', 'Changes in Working Capital', 'Other Adjustments', 'Cash from Operations'],
    values: [1500000, 500000, 100000, 100000, 2200000]
  },
  profitBeforeTax: [1200000, 1100000, 1400000, 2100000, 1500000],
  financialMetrics: {
    "Revenue": {
      "value": 8500000,
      "from": "2024-01-01",
      "to": "2024-03-31"
    },
    "Cost of Goods Sold": {
      "value": 5950000,
      "from": "2024-01-01",
      "to": "2024-03-31"
    },
    "Gross Profit": {
      "value": 2550000,
      "from": "2024-01-01",
      "to": "2024-03-31"
    },
    "Operating Expenses": {
      "value": 1700000,
      "from": "2024-01-01",
      "to": "2024-03-31"
    },
    "Operating Income": {
      "value": 850000,
      "from": "2024-01-01",
      "to": "2024-03-31"
    },
    "Net Income": {
      "value": 680000,
      "from": "2024-01-01",
      "to": "2024-03-31"
    },
    "Same Store Sales Growth": {
      "value": "4.2%",
      "from": "2024-01-01",
      "to": "2024-03-31"
    },
    "Inventory Turnover": {
      "value": 6.5,
      "from": "2024-01-01",
      "to": "2024-03-31"
    },
    "Gross Margin": {
      "value": "30%",
      "from": "2024-01-01",
      "to": "2024-03-31"
    },
    "Operating Margin": {
      "value": "10%",
      "from": "2024-01-01",
      "to": "2024-03-31"
    }
  },
  incomeStatementData: {
    "2024": {
      "Q4_YTD": {
        "Total_Income": 320000000,
        "Total_Expenses": 270000000,
        "Gross_Profit": 50000000,
        "Profit_Before_Tax": 22000000,
        "Profit_After_Tax": 17000000
      },
      "Q3_YTD": {
        "Total_Income": 230000000,
        "Total_Expenses": 195000000,
        "Gross_Profit": 35000000,
        "Profit_Before_Tax": 15000000,
        "Profit_After_Tax": 12000000
      },
      "Q2": {
        "Total_Income": 85000000,
        "Total_Expenses": 72000000,
        "Gross_Profit": 13000000,
        "Profit_Before_Tax": 5500000,
        "Profit_After_Tax": 4400000
      },
      "Q1": {
        "Total_Income": 75000000,
        "Total_Expenses": 64000000,
        "Gross_Profit": 11000000,
        "Profit_Before_Tax": 4800000,
        "Profit_After_Tax": 3800000
      }
    },
    "2023": {
      "Q4_YTD": {
        "Total_Income": 295000000,
        "Total_Expenses": 252000000,
        "Gross_Profit": 43000000,
        "Profit_Before_Tax": 18500000,
        "Profit_After_Tax": 14800000
      },
      "Q3_YTD": {
        "Total_Income": 210000000,
        "Total_Expenses": 180000000,
        "Gross_Profit": 30000000,
        "Profit_Before_Tax": 12500000,
        "Profit_After_Tax": 10000000
      },
      "Q2": {
        "Total_Income": 72000000,
        "Total_Expenses": 62000000,
        "Gross_Profit": 10000000,
        "Profit_Before_Tax": 4200000,
        "Profit_After_Tax": 3360000
      },
      "Q1": {
        "Total_Income": 68000000,
        "Total_Expenses": 58500000,
        "Gross_Profit": 9500000,
        "Profit_Before_Tax": 3900000,
        "Profit_After_Tax": 3120000
      }
    }
  }
};

/**
 * Mock data collection export
 */
export const mockFinancialData = {
  techCompany: techCompanyData,
  manufacturingCompany: manufacturingCompanyData,
  retailCompany: retailCompanyData
};

export default mockFinancialData;
