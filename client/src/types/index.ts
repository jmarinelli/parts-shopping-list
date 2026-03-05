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

export interface Option {
  id: string;
  partId: string;
  name: string;
  price: number;
  currency: string;
  source: string | null;
  link: string | null;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Part {
  id: string;
  projectId: string;
  name: string;
  status: 'pending' | 'ordered' | 'owned';
  isOptional: boolean;
  sortOrder: number;
  selectedOptionId: string | null;
  selectedOption: Option | null;
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
