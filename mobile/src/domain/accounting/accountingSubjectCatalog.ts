import type { Account, Asset, Liability } from "../models";

export type AccountingSubjectKind = "asset" | "liability";

export interface AccountingSubject {
  description: string;
  detailExamples: string[];
  displayName: string;
  id: string;
  kind: AccountingSubjectKind;
  matchKeywords: string[];
  personalExample: string;
  rowExamples: string[];
}

export const assetAccountingSubjects: AccountingSubject[] = [
  {
    description: "手头持有的现金类资产。",
    detailExamples: ["现金钱包", "零用现金", "备用金"],
    displayName: "库存现金",
    id: "cash-on-hand",
    kind: "asset",
    matchKeywords: ["cash", "现金", "现金钱包"],
    personalExample: "日常备用的纸币、零钱和小额现金可归入这里。",
    rowExamples: ["现金钱包"],
  },
  {
    description: "存放在银行账户中的资金，包括活期、定期和存款类资产。",
    detailExamples: ["招商银行活期", "工商银行活期", "大额存单"],
    displayName: "银行存款",
    id: "bank-deposit",
    kind: "asset",
    matchKeywords: ["bank", "银行卡", "活期", "存款", "大额存单"],
    personalExample: "工资卡、生活卡、备用金银行卡、大额存单都可归入这里。",
    rowExamples: ["招商银行", "工商银行", "大额存单"],
  },
  {
    description: "不在普通银行存款中、但仍属于货币资金的支付或专用资金。",
    detailExamples: ["微信零钱", "支付宝余额", "证券可用资金"],
    displayName: "其他货币资金",
    id: "other-monetary-funds",
    kind: "asset",
    matchKeywords: ["wechat", "alipay", "支付宝", "微信", "支付账户", "证券可用资金"],
    personalExample: "微信、支付宝、证券账户可用资金等可归入这里。",
    rowExamples: ["微信", "支付宝", "证券可用资金"],
  },
  {
    description: "为短期持有、赚取价差或投资收益而持有的金融资产。",
    detailExamples: ["A股股票", "宽基 ETF", "公募基金"],
    displayName: "交易性金融资产",
    id: "trading-financial-assets",
    kind: "asset",
    matchKeywords: [
      "investment",
      "securities",
      "fund",
      "A股股票",
      "港美股",
      "ETF",
      "基金",
      "债券基金",
      "黄金",
      "黄金ETF",
      "证券",
    ],
    personalExample: "你的股票账户、ETF、基金、黄金 ETF 等都可放在这里。",
    rowExamples: ["股票", "ETF", "基金", "黄金"],
  },
  {
    description: "除常规经营应收外，个人临时应收、代垫或待收回款项。",
    detailExamples: ["公司报销款", "朋友借款应收", "临时代垫款"],
    displayName: "其他应收款",
    id: "other-receivables",
    kind: "asset",
    matchKeywords: ["receivable", "应收款", "报销款", "朋友借款应收", "其他应收款"],
    personalExample: "公司还没报销的钱、朋友欠你的钱、你替别人垫付的钱可归入这里。",
    rowExamples: ["报销款", "朋友借款应收"],
  },
  {
    description: "长期持有、具有权益性质的项目或股权类资产。",
    detailExamples: ["项目权益", "合伙份额", "非上市股权"],
    displayName: "长期股权投资",
    id: "long-term-equity-investment",
    kind: "asset",
    matchKeywords: ["项目权益", "股权", "合伙", "长期投资", "长期股权投资"],
    personalExample: "你参与的项目权益、合伙份额、长期股权类投入可归入这里。",
    rowExamples: ["项目权益"],
  },
  {
    description: "长期使用、价值较高、不会在短期内出售的实物资产。",
    detailExamples: ["房产", "车辆", "电脑设备"],
    displayName: "固定资产",
    id: "fixed-assets",
    kind: "asset",
    matchKeywords: ["fixedAsset", "房产", "车辆", "固定资产", "电脑", "设备", "手机", "相机"],
    personalExample: "自住房、汽车、电脑、相机等大件耐用品可归入这里。",
    rowExamples: ["房产", "车辆", "电脑设备"],
  },
  {
    description: "不适合放入以上科目的其他个人资产。",
    detailExamples: ["保险现金价值", "外币资产", "其他资产"],
    displayName: "其他资产",
    id: "other-assets",
    kind: "asset",
    matchKeywords: ["保险现金价值", "外币资产", "其他资产", "other"],
    personalExample: "保险现金价值、特殊资产、暂时无法明确归类的资产可放在这里。",
    rowExamples: ["保险现金价值", "外币资产", "其他资产"],
  },
];

export const liabilityAccountingSubjects: AccountingSubject[] = [
  {
    description: "一年内需要偿还的借款或短期周转负债。",
    detailExamples: ["朋友借款", "短期周转借款", "融资融券负债"],
    displayName: "短期借款",
    id: "short-term-borrowings",
    kind: "liability",
    matchKeywords: ["borrowing", "短期借款", "朋友借款", "借款", "融资负债", "融资融券"],
    personalExample: "临时借款、短期资金周转、融资账户负债可归入这里。",
    rowExamples: ["朋友借款", "融资融券负债"],
  },
  {
    description: "已经发生但尚未支付的款项。",
    detailExamples: ["应付房租", "应付服务款", "应付账单"],
    displayName: "应付账款",
    id: "accounts-payable",
    kind: "liability",
    matchKeywords: ["应付账款", "应付房租", "应付服务款"],
    personalExample: "已经确认但还没有支付的房租、服务费或账单可归入这里。",
    rowExamples: ["应付房租", "应付服务款"],
  },
  {
    description: "已经形成纳税义务但尚未缴纳的税费。",
    detailExamples: ["应付个税", "应交所得税", "其他税费"],
    displayName: "应交税费",
    id: "taxes-payable",
    kind: "liability",
    matchKeywords: ["应付个税", "应交税费", "税费", "个税"],
    personalExample: "已经计提但还没缴纳的个税、所得税或其他税费可归入这里。",
    rowExamples: ["应付个税", "税费"],
  },
  {
    description: "除借款、应付账款、应交税费以外的其他应付款项。",
    detailExamples: ["信用卡欠款", "其他应付款", "临时应付款"],
    displayName: "其他应付款",
    id: "other-payables",
    kind: "liability",
    matchKeywords: ["creditCard", "信用卡", "信用卡欠款", "其他应付款"],
    personalExample: "信用卡欠款、临时欠款、待付给他人的其他款项可归入这里。",
    rowExamples: ["信用卡欠款", "其他应付款"],
  },
  {
    description: "偿还期限较长的借款。",
    detailExamples: ["房贷", "车贷", "长期贷款"],
    displayName: "长期借款",
    id: "long-term-borrowings",
    kind: "liability",
    matchKeywords: ["loan", "房贷", "车贷", "长期借款", "longTermLoan"],
    personalExample: "房贷、车贷和其他长期贷款可归入这里。",
    rowExamples: ["房贷", "车贷"],
  },
  {
    description: "长期分期或长期付款安排形成的负债。",
    detailExamples: ["消费分期", "长期分期", "设备分期"],
    displayName: "长期应付款",
    id: "long-term-payables",
    kind: "liability",
    matchKeywords: ["huabei", "消费分期", "长期分期", "长期应付款", "installment"],
    personalExample: "消费分期、设备分期、长期付款计划可归入这里。",
    rowExamples: ["消费分期", "长期分期"],
  },
  {
    description: "不适合放入以上科目的其他负债。",
    detailExamples: ["其他负债", "待确认负债", "临时负债"],
    displayName: "其他负债",
    id: "other-liabilities",
    kind: "liability",
    matchKeywords: ["other", "其他负债", "待确认负债", "临时负债"],
    personalExample: "暂时无法明确归类的负债可以先放在这里。",
    rowExamples: ["其他负债", "待确认负债"],
  },
];

const normalizeText = (value: unknown): string => String(value ?? "").toLowerCase();

const includesAnyKeyword = (haystack: string, keywords: string[]): boolean =>
  keywords.some((keyword) => haystack.includes(keyword.toLowerCase()));

export const getAssetAccountingSubject = (asset: Asset, accounts: Account[] = []): AccountingSubject => {
  const account = asset.accountId ? accounts.find((candidate) => candidate.id === asset.accountId) : undefined;
  const searchableText = normalizeText(
    [asset.name, asset.category, asset.note, account?.name, account?.type].filter(Boolean).join(" "),
  );

  return (
    assetAccountingSubjects.find((subject) => includesAnyKeyword(searchableText, subject.matchKeywords)) ??
    assetAccountingSubjects[assetAccountingSubjects.length - 1]
  );
};

export const getLiabilityAccountingSubject = (liability: Liability): AccountingSubject => {
  const searchableText = normalizeText([liability.name, liability.category, liability.note].filter(Boolean).join(" "));

  return (
    liabilityAccountingSubjects.find((subject) => includesAnyKeyword(searchableText, subject.matchKeywords)) ??
    liabilityAccountingSubjects[liabilityAccountingSubjects.length - 1]
  );
};
