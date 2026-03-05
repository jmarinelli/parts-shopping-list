export interface Car {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  carId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Part {
  id: string;
  optionId: string;
  name: string;
  price: number;
  currency: string;
  source: string | null;
  link: string | null;
  comment: string | null;
  status: 'pending' | 'ordered' | 'owned';
  createdAt: string;
  updatedAt: string;
}

export interface Option {
  id: string;
  partGroupId: string;
  name: string;
  parts: Part[];
  createdAt: string;
  updatedAt: string;
}

export interface PartGroup {
  id: string;
  projectId: string;
  name: string;
  isOptional: boolean;
  sortOrder: number;
  selectedOptionId: string | null;
  computedStatus: 'pending' | 'ordered' | 'owned' | null;
  selectedOption: {
    id: string;
    name: string;
    computedPrice: number | null;
    currencies: string[];
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface ExchangeRate {
  id: string;
  projectId: string;
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectTotals {
  total: number;
  spent: number;
  remaining: number;
  currency: string;
  availableCurrencies: string[];
}
