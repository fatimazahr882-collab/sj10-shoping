export type BankType = 'wallet' | 'bank';

export interface BankDef {
  id: string;
  name: string;
  type: BankType;
  logo: string; // Ensure these images exist in /public/banks/
}

export const BANK_LIST: BankDef[] = [
  // --- Mobile Wallets ---
  { id: 'easypaisa', name: 'EasyPaisa', type: 'wallet', logo: '/banks/easypaisa.png' },
  { id: 'jazzcash', name: 'JazzCash', type: 'wallet', logo: '/banks/jazzcash.png' },
  { id: 'sadapay', name: 'SadaPay', type: 'wallet', logo: '/banks/sadapay.png' },
  { id: 'nayapay', name: 'NayaPay', type: 'wallet', logo: '/banks/nayapay.png' },
  { id: 'upaisa', name: 'UPaisa', type: 'wallet', logo: '/banks/upaisa.png' },

  // --- Banks ---
  { id: 'hbl', name: 'HBL (Habib Bank)', type: 'bank', logo: '/banks/hbl.png' },
  { id: 'ubl', name: 'UBL (United Bank)', type: 'bank', logo: '/banks/ubl.png' },
  { id: 'mcb', name: 'MCB Bank', type: 'bank', logo: '/banks/mcb.png' },
  { id: 'meezan', name: 'Meezan Bank', type: 'bank', logo: '/banks/meezan.png' },
  { id: 'alfalah', name: 'Bank Alfalah', type: 'bank', logo: '/banks/alfalah.png' },
  { id: 'faysal', name: 'Faysal Bank', type: 'bank', logo: '/banks/faysal.png' },
  { id: 'askari', name: 'Askari Bank', type: 'bank', logo: '/banks/askari.png' },
];