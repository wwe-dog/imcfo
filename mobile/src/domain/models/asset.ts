export type AssetCategory =
  | "cash"
  | "bankDeposit"
  | "paymentAccount"
  | "investment"
  | "receivable"
  | "fixedAsset"
  | "other"
  | "现金"
  | "银行卡"
  | "支付账户"
  | "货币基金"
  | "大额存单"
  | "短债工具"
  | "债券基金"
  | "A股股票"
  | "港美股"
  | "宽基ETF"
  | "行业ETF"
  | "公募基金"
  | "黄金"
  | "外币资产"
  | "房产"
  | "车辆"
  | "保险现金价值"
  | "应收款"
  | "项目权益";

export interface Asset {
  id: string;
  name: string;
  category: AssetCategory;
  amount: number;
  valuationMethod?: string;
  purchaseDate?: string;
  currentValue: number;
  accountId?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}
