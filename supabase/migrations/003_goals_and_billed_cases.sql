-- Mål per månad (2026) + fakturerade case
-- Kör i Neon SQL Editor efter 001 och 002

-- Målbelopp per år/månad (default 100 000 kr)
CREATE TABLE goals (
  year INT NOT NULL,
  month INT NOT NULL CHECK (month >= 1 AND month <= 12),
  goal_amount_kr INT NOT NULL DEFAULT 100000,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (year, month)
);

-- Fakturerade case per månad (synliga för alla)
CREATE TABLE billed_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year INT NOT NULL,
  month INT NOT NULL CHECK (month >= 1 AND month <= 12),
  description TEXT NOT NULL,
  amount_kr INT NOT NULL CHECK (amount_kr >= 0),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_billed_cases_year_month ON billed_cases(year, month);
