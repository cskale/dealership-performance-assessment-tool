export interface KPIDefinition {
  title: string;
  definition: string;
  whyItMatters: string;
  benchmark?: string;
}

export const KPI_DEFINITIONS: Record<string, { en: KPIDefinition; de: KPIDefinition }> = {
  // New Vehicle Sales KPIs
  monthlyRevenue: {
    en: {
      title: "Monthly Revenue",
      definition: "Total revenue generated from new vehicle sales per month",
      whyItMatters: "Primary indicator of business health and growth trajectory. Higher revenue enables investment in staff, facilities, and customer experience.",
      benchmark: "€420,000 monthly"
    },
    de: {
      title: "Monatsumsatz",
      definition: "Gesamtumsatz aus Neuwagenverkäufen pro Monat",
      whyItMatters: "Primärer Indikator für Geschäftsgesundheit und Wachstumskurs. Höherer Umsatz ermöglicht Investitionen in Personal, Einrichtungen und Kundenerfahrung.",
      benchmark: "€420.000 monatlich"
    }
  },
  avgMargin: {
    en: {
      title: "Average Margin",
      definition: "Average profit margin percentage per vehicle sale after all costs",
      whyItMatters: "Directly impacts profitability. Higher margins mean more retained profit per sale to reinvest in the business.",
      benchmark: "9.2%"
    },
    de: {
      title: "Durchschnittsmarge",
      definition: "Durchschnittliche Gewinnmarge in Prozent pro Fahrzeugverkauf nach allen Kosten",
      whyItMatters: "Beeinflusst direkt die Rentabilität. Höhere Margen bedeuten mehr einbehaltenen Gewinn pro Verkauf zur Reinvestition.",
      benchmark: "9,2%"
    }
  },
  leadConversion: {
    en: {
      title: "Lead Conversion Rate",
      definition: "Percentage of leads that convert into actual vehicle sales",
      whyItMatters: "Measures sales team effectiveness. Improving conversion reduces customer acquisition costs and maximizes marketing ROI.",
      benchmark: "23%"
    },
    de: {
      title: "Lead-Konversionsrate",
      definition: "Prozentsatz der Leads, die zu tatsächlichen Fahrzeugverkäufen werden",
      whyItMatters: "Misst die Effektivität des Verkaufsteams. Verbesserte Konversion reduziert Kundenakquisitionskosten und maximiert Marketing-ROI.",
      benchmark: "23%"
    }
  },
  customerSatisfaction: {
    en: {
      title: "Customer Satisfaction",
      definition: "Average customer rating from post-purchase surveys (typically 1-100 scale)",
      whyItMatters: "Drives repeat business, referrals, and online reviews. Satisfied customers are 3x more likely to recommend your dealership.",
      benchmark: "84%"
    },
    de: {
      title: "Kundenzufriedenheit",
      definition: "Durchschnittliche Kundenbewertung aus Nachkauf-Umfragen (typischerweise 1-100 Skala)",
      whyItMatters: "Fördert Folgegeschäft, Empfehlungen und Online-Bewertungen. Zufriedene Kunden empfehlen Ihr Autohaus 3x häufiger.",
      benchmark: "84%"
    }
  },
  transactionValue: {
    en: {
      title: "Average Transaction Value",
      definition: "Average total value per vehicle transaction including add-ons and financing",
      whyItMatters: "Higher transaction values increase profit per customer. Includes F&I products, accessories, and service contracts.",
      benchmark: "€42,000"
    },
    de: {
      title: "Durchschnittlicher Transaktionswert",
      definition: "Durchschnittlicher Gesamtwert pro Fahrzeugtransaktion einschließlich Zusatzleistungen und Finanzierung",
      whyItMatters: "Höhere Transaktionswerte erhöhen den Gewinn pro Kunde. Beinhaltet F&I-Produkte, Zubehör und Serviceverträge.",
      benchmark: "€42.000"
    }
  },
  
  // Used Vehicle Sales KPIs
  usedInventoryTurnover: {
    en: {
      title: "Used Inventory Turnover",
      definition: "Number of times used vehicle inventory is sold and replaced per year",
      whyItMatters: "Faster turnover means less capital tied up in inventory and reduced depreciation risk.",
      benchmark: "12x per year"
    },
    de: {
      title: "Gebrauchtwagenumschlag",
      definition: "Anzahl der Male, die das Gebrauchtwagenbestand pro Jahr verkauft und ersetzt wird",
      whyItMatters: "Schnellerer Umschlag bedeutet weniger gebundenes Kapital und reduziertes Abschreibungsrisiko.",
      benchmark: "12x pro Jahr"
    }
  },
  daysInInventory: {
    en: {
      title: "Days in Inventory",
      definition: "Average number of days a used vehicle stays in inventory before sale",
      whyItMatters: "Lower days means faster sales and less holding costs. Industry target is under 45 days.",
      benchmark: "45 days"
    },
    de: {
      title: "Lagertage",
      definition: "Durchschnittliche Anzahl der Tage, die ein Gebrauchtfahrzeug vor dem Verkauf im Bestand bleibt",
      whyItMatters: "Weniger Tage bedeuten schnellere Verkäufe und geringere Lagerkosten. Branchenziel ist unter 45 Tage.",
      benchmark: "45 Tage"
    }
  },
  
  // Service Performance KPIs
  laborEfficiency: {
    en: {
      title: "Labor Efficiency Rate",
      definition: "Percentage of billable hours vs total available technician hours",
      whyItMatters: "Higher efficiency means more revenue from the same labor capacity. Target is 85%+.",
      benchmark: "85%"
    },
    de: {
      title: "Arbeitseffizienzrate",
      definition: "Prozentsatz der abrechenbaren Stunden vs. verfügbare Technikerstunden",
      whyItMatters: "Höhere Effizienz bedeutet mehr Umsatz aus derselben Arbeitskapazität. Ziel ist 85%+.",
      benchmark: "85%"
    }
  },
  serviceRetention: {
    en: {
      title: "Service Retention Rate",
      definition: "Percentage of customers returning for service within 12 months",
      whyItMatters: "Retained customers have 6x lower acquisition cost and higher lifetime value.",
      benchmark: "65%"
    },
    de: {
      title: "Servicebindungsrate",
      definition: "Prozentsatz der Kunden, die innerhalb von 12 Monaten zum Service zurückkehren",
      whyItMatters: "Bindungskunden haben 6x niedrigere Akquisitionskosten und höheren Lebenszeitwert.",
      benchmark: "65%"
    }
  },
  technicianProductivity: {
    en: {
      title: "Technician Productivity",
      definition: "Average repair orders completed per technician per day",
      whyItMatters: "Measures workflow efficiency and technician utilization. Higher productivity increases service capacity.",
      benchmark: "12 per day"
    },
    de: {
      title: "Technikerproduktivität",
      definition: "Durchschnittliche Reparaturaufträge pro Techniker pro Tag",
      whyItMatters: "Misst Workflow-Effizienz und Technikerauslastung. Höhere Produktivität erhöht Servicekapazität.",
      benchmark: "12 pro Tag"
    }
  },
  
  // Parts & Inventory KPIs
  partsGrossProfit: {
    en: {
      title: "Parts Gross Profit",
      definition: "Profit margin on parts sales after cost of goods sold",
      whyItMatters: "Parts is often the highest-margin department. Optimizing pricing improves overall profitability.",
      benchmark: "35%"
    },
    de: {
      title: "Teile-Bruttogewinn",
      definition: "Gewinnmarge bei Teileverkäufen nach Warenkosten",
      whyItMatters: "Teile ist oft die Abteilung mit der höchsten Marge. Preisoptimierung verbessert Gesamtrentabilität.",
      benchmark: "35%"
    }
  },
  fillRate: {
    en: {
      title: "Parts Fill Rate",
      definition: "Percentage of parts orders fulfilled from existing inventory",
      whyItMatters: "Higher fill rates mean faster service completion and happier customers.",
      benchmark: "95%"
    },
    de: {
      title: "Teile-Erfüllungsrate",
      definition: "Prozentsatz der Teilebestellungen, die aus vorhandenem Bestand erfüllt werden",
      whyItMatters: "Höhere Erfüllungsraten bedeuten schnellere Serviceabwicklung und zufriedenere Kunden.",
      benchmark: "95%"
    }
  },
  
  // Financial Operations KPIs
  cashFlowDays: {
    en: {
      title: "Cash Flow Days",
      definition: "Average days between transaction and cash receipt",
      whyItMatters: "Faster cash collection improves liquidity and reduces financing costs.",
      benchmark: "7 days"
    },
    de: {
      title: "Cashflow-Tage",
      definition: "Durchschnittliche Tage zwischen Transaktion und Bargeldeingang",
      whyItMatters: "Schnellere Bargeldsammlung verbessert Liquidität und reduziert Finanzierungskosten.",
      benchmark: "7 Tage"
    }
  },
  expenseRatio: {
    en: {
      title: "Expense Ratio",
      definition: "Operating expenses as a percentage of gross profit",
      whyItMatters: "Lower ratios mean more profit retained. Industry benchmark is under 75%.",
      benchmark: "75%"
    },
    de: {
      title: "Kostenquote",
      definition: "Betriebskosten als Prozentsatz des Bruttogewinns",
      whyItMatters: "Niedrigere Quoten bedeuten mehr einbehaltenen Gewinn. Branchenbenchmark ist unter 75%.",
      benchmark: "75%"
    }
  }
};

/**
 * Get KPI definition by key and language
 */
export function getKPIDefinition(key: string, language: 'en' | 'de' = 'en'): KPIDefinition | null {
  const kpi = KPI_DEFINITIONS[key];
  if (!kpi) return null;
  return kpi[language] || kpi.en;
}

/**
 * Get all KPI definitions for a language
 */
export function getAllKPIDefinitions(language: 'en' | 'de' = 'en'): Record<string, KPIDefinition> {
  const result: Record<string, KPIDefinition> = {};
  for (const [key, value] of Object.entries(KPI_DEFINITIONS)) {
    result[key] = value[language] || value.en;
  }
  return result;
}
