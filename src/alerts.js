import { restartGame } from "./model.js";

export const BankruptcyAlert = {
  typeId: 'bankrupt',
  message: 'Bankrupt! Your liabilities exceeded your credit limit.',
  actionLabel: 'Restart game',
  action: restartGame,
};
export const LawsuitAlert = {
  typeId: 'lawsuit',
  message: 'Lawsuit! One of your departments has been sued and is unable to provide income while being investigated!',
};
export const InflationAlert = {
  typeId: 'inflation',
  message: 'Due to global inflation, all minimal wage worker\'s wages have been increased.',
};
export const IncomeTaxAlert = {
  typeId: 'income-tax',
  message: 'Seems like the Income Tax is eating more than half of your profits! Consider lobbying against tax hikes.'
}
