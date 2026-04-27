import type { CashFlowType, TransactionType } from "../models";

export const getDefaultCashFlowType = (transactionType: TransactionType): CashFlowType => {
  switch (transactionType) {
    case "income":
    case "expense":
      return "operating";
    case "investmentBuy":
    case "investmentSell":
      return "investing";
    case "liabilityIncrease":
    case "liabilityDecrease":
    case "repayment":
    case "creditCardRepayment":
      return "financing";
    case "creditCardExpense":
      return "nonCash";
    case "assetIncrease":
    case "assetDecrease":
    case "transfer":
      return "nonCash";
  }
};
