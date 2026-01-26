import { Language } from '@/contexts/LanguageContext';

export interface QuestionTranslation {
  text: string;
  description?: string;
  purpose?: string;
  situationAnalysis?: string;
  benefits?: string;
  scaleLabels?: string[];
}

export interface Question {
  id: string;
  text: string;
  description?: string;
  type: "scale" | "multiple_choice" | "rating";
  options?: string[];
  scale?: {
    min: number;
    max: number;
    labels: string[];
  };
  weight: number;
  category: string;
  purpose?: string;
  situationAnalysis?: string;
  linkedKPIs?: string[];
  benefits?: string;
  translations?: Record<Language, QuestionTranslation>;
}

export interface SectionTranslation {
  title: string;
  description: string;
}

export interface Section {
  id: string;
  title: string;
  description: string;
  icon: string;
  questions: Question[];
  translations?: Record<Language, SectionTranslation>;
}

export interface Questionnaire {
  title: string;
  description: string;
  sections: Section[];
}

export const questionnaire: Questionnaire = {
  title: "Dealership Performance Assessment",
  description: "Comprehensive evaluation of your dealership's operational excellence across all key areas",
  sections: [
    {
      id: "new-vehicle-sales",
      title: "New Vehicle Sales Performance",
      description: "Evaluate your new vehicle sales processes, performance metrics, and customer satisfaction",
      icon: "car",
      translations: {
        en: {
          title: "New Vehicle Sales Performance",
          description: "Evaluate your new vehicle sales processes, performance metrics, and customer satisfaction"
        },
        de: {
          title: "Neuwagenverkaufsleistung",
          description: "Bewerten Sie Ihre Neuwagenverkaufsprozesse, Leistungskennzahlen und Kundenzufriedenheit"
        }
      },
      questions: [
        {
          id: "nvs-1",
          text: "How many new vehicles does your dealership sell on average per month?",
          description: "Consider your sales volume over the last 12 months to provide an accurate assessment",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["<20 units", "21-50 units", "51-100 units", "101-200 units", ">200 units"] },
          weight: 1.2,
          category: "volume",
          purpose: "Measures your dealership's scale and market presence in new vehicle sales, which directly correlates with revenue potential and operational efficiency.",
          situationAnalysis: "Higher volume indicates stronger market position, better inventory management, and more consistent customer flow. It helps identify if you're maximizing your market opportunity.",
          linkedKPIs: ["Monthly Revenue", "Market Share", "Sales Growth Rate", "Inventory Turnover"],
          benefits: "Optimizing sales volume leads to better economies of scale, stronger manufacturer relationships, increased negotiating power, and higher overall profitability.",
          translations: {
            en: {
              text: "How many new vehicles does your dealership sell on average per month?",
              description: "Consider your sales volume over the last 12 months to provide an accurate assessment",
              purpose: "Measures your dealership's scale and market presence in new vehicle sales, which directly correlates with revenue potential and operational efficiency.",
              situationAnalysis: "Higher volume indicates stronger market position, better inventory management, and more consistent customer flow. It helps identify if you're maximizing your market opportunity.",
              benefits: "Optimizing sales volume leads to better economies of scale, stronger manufacturer relationships, increased negotiating power, and higher overall profitability.",
              scaleLabels: ["<20 units", "21-50 units", "51-100 units", "101-200 units", ">200 units"]
            },
            de: {
              text: "Wie viele Neuwagen verkauft Ihr Autohaus durchschnittlich pro Monat?",
              description: "Berücksichtigen Sie Ihr Verkaufsvolumen der letzten 12 Monate für eine genaue Bewertung",
              purpose: "Misst die Größe und Marktpräsenz Ihres Autohauses im Neuwagenverkauf, was direkt mit dem Umsatzpotenzial und der betrieblichen Effizienz korreliert.",
              situationAnalysis: "Höheres Volumen deutet auf eine stärkere Marktposition, besseres Bestandsmanagement und konstanteren Kundenstrom hin. Es hilft zu erkennen, ob Sie Ihre Marktchancen maximieren.",
              benefits: "Die Optimierung des Verkaufsvolumens führt zu besseren Skaleneffekten, stärkeren Herstellerbeziehungen, erhöhter Verhandlungsmacht und höherer Gesamtrentabilität.",
              scaleLabels: ["<20 Einheiten", "21-50 Einheiten", "51-100 Einheiten", "101-200 Einheiten", ">200 Einheiten"]
            }
          }
        },
        {
          id: "nvs-2",
          text: "What percentage of your sales leads successfully convert into actual vehicle purchases?",
          description: "Calculate the ratio of completed sales to total qualified leads received",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["<10%", "10-15%", "16-20%", "21-25%", ">25%"] },
          weight: 1.5,
          category: "conversion",
          purpose: "Evaluates sales team effectiveness and the quality of your sales process from lead generation to final purchase decision.",
          situationAnalysis: "Low closing ratios indicate potential issues in sales training, lead quality, pricing strategy, or customer experience that need immediate attention.",
          linkedKPIs: ["Lead Conversion Rate", "Sales Efficiency", "Cost Per Acquisition", "Revenue Per Lead"],
          benefits: "Improving closing ratios directly increases revenue without additional marketing spend, reduces customer acquisition costs, and maximizes the ROI of your lead generation efforts.",
          translations: {
            en: {
              text: "What percentage of your sales leads successfully convert into actual vehicle purchases?",
              description: "Calculate the ratio of completed sales to total qualified leads received",
              purpose: "Evaluates sales team effectiveness and the quality of your sales process from lead generation to final purchase decision.",
              situationAnalysis: "Low closing ratios indicate potential issues in sales training, lead quality, pricing strategy, or customer experience that need immediate attention.",
              benefits: "Improving closing ratios directly increases revenue without additional marketing spend, reduces customer acquisition costs, and maximizes the ROI of your lead generation efforts.",
              scaleLabels: ["<10%", "10-15%", "16-20%", "21-25%", ">25%"]
            },
            de: {
              text: "Welcher Prozentsatz Ihrer Verkaufsleads wird erfolgreich in tatsächliche Fahrzeugkäufe umgewandelt?",
              description: "Berechnen Sie das Verhältnis von abgeschlossenen Verkäufen zu den erhaltenen qualifizierten Leads",
              purpose: "Bewertet die Effektivität des Verkaufsteams und die Qualität Ihres Verkaufsprozesses von der Lead-Generierung bis zur endgültigen Kaufentscheidung.",
              situationAnalysis: "Niedrige Abschlussquoten weisen auf potenzielle Probleme bei der Verkaufsschulung, Lead-Qualität, Preisstrategie oder Kundenerfahrung hin, die sofortige Aufmerksamkeit erfordern.",
              benefits: "Die Verbesserung der Abschlussquoten erhöht direkt den Umsatz ohne zusätzliche Marketingausgaben, senkt die Kundenakquisitionskosten und maximiert den ROI Ihrer Lead-Generierungsbemühungen.",
              scaleLabels: ["<10%", "10-15%", "16-20%", "21-25%", ">25%"]
            }
          }
        },
        {
          id: "nvs-3",
          text: "How would customers rate their overall satisfaction with your new vehicle sales experience?",
          description: "Based on customer surveys, feedback forms, and post-purchase reviews",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["Poor (1-2)", "Fair (3-4)", "Good (5-6)", "Very Good (7-8)", "Excellent (9-10)"] },
          weight: 1.3,
          category: "satisfaction",
          purpose: "Measures customer experience quality during the sales process, which directly impacts repeat business, referrals, and brand reputation.",
          situationAnalysis: "Customer satisfaction is a leading indicator of future sales performance, customer loyalty, and word-of-mouth marketing effectiveness.",
          linkedKPIs: ["Net Promoter Score", "Customer Retention Rate", "Referral Rate", "Online Review Ratings"],
          benefits: "High customer satisfaction leads to increased referrals, repeat customers, positive online reviews, and reduced marketing costs through organic growth.",
          translations: {
            en: {
              text: "How would customers rate their overall satisfaction with your new vehicle sales experience?",
              description: "Based on customer surveys, feedback forms, and post-purchase reviews",
              purpose: "Measures customer experience quality during the sales process, which directly impacts repeat business, referrals, and brand reputation.",
              situationAnalysis: "Customer satisfaction is a leading indicator of future sales performance, customer loyalty, and word-of-mouth marketing effectiveness.",
              benefits: "High customer satisfaction leads to increased referrals, repeat customers, positive online reviews, and reduced marketing costs through organic growth.",
              scaleLabels: ["Poor (1-2)", "Fair (3-4)", "Good (5-6)", "Very Good (7-8)", "Excellent (9-10)"]
            },
            de: {
              text: "Wie würden Kunden ihre Gesamtzufriedenheit mit Ihrem Neuwagenverkaufserlebnis bewerten?",
              description: "Basierend auf Kundenbefragungen, Feedback-Formularen und Bewertungen nach dem Kauf",
              purpose: "Misst die Qualität der Kundenerfahrung während des Verkaufsprozesses, die sich direkt auf Folgegeschäfte, Empfehlungen und Markenreputation auswirkt.",
              situationAnalysis: "Die Kundenzufriedenheit ist ein führender Indikator für zukünftige Verkaufsleistung, Kundenloyalität und Effektivität des Mund-zu-Mund-Marketings.",
              benefits: "Hohe Kundenzufriedenheit führt zu mehr Empfehlungen, wiederkehrenden Kunden, positiven Online-Bewertungen und reduzierten Marketingkosten durch organisches Wachstum.",
              scaleLabels: ["Schlecht (1-2)", "Ausreichend (3-4)", "Gut (5-6)", "Sehr gut (7-8)", "Ausgezeichnet (9-10)"]
            }
          }
        },
        {
          id: "nvs-4",
          text: "What is the average gross profit your dealership earns on each new vehicle sold?",
          description: "Calculate front-end profit after all discounts and incentives",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["<$1,000", "$1,000-$2,000", "$2,000-$3,500", "$3,500-$5,000", ">$5,000"] },
          weight: 1.4,
          category: "profitability",
          purpose: "Assesses pricing strategy effectiveness and negotiation skills, directly impacting dealership profitability and financial sustainability.",
          situationAnalysis: "Profit margins indicate your competitive positioning, pricing power, and ability to add value during the sales process.",
          linkedKPIs: ["Gross Profit Margin", "Price Realization", "Discount Rate", "Profitability Per Unit"],
          benefits: "Optimizing gross profit per unit significantly improves overall dealership profitability, cash flow, and ability to invest in growth initiatives.",
          translations: {
            en: {
              text: "What is the average gross profit your dealership earns on each new vehicle sold?",
              description: "Calculate front-end profit after all discounts and incentives",
              purpose: "Assesses pricing strategy effectiveness and negotiation skills, directly impacting dealership profitability and financial sustainability.",
              situationAnalysis: "Profit margins indicate your competitive positioning, pricing power, and ability to add value during the sales process.",
              benefits: "Optimizing gross profit per unit significantly improves overall dealership profitability, cash flow, and ability to invest in growth initiatives.",
              scaleLabels: ["<€1.000", "€1.000-€2.000", "€2.000-€3.500", "€3.500-€5.000", ">€5.000"]
            },
            de: {
              text: "Wie hoch ist der durchschnittliche Bruttogewinn, den Ihr Autohaus bei jedem verkauften Neuwagen erzielt?",
              description: "Berechnen Sie den Front-End-Gewinn nach allen Rabatten und Anreizen",
              purpose: "Bewertet die Wirksamkeit der Preisstrategie und Verhandlungsfähigkeiten, die sich direkt auf die Rentabilität und finanzielle Nachhaltigkeit des Autohauses auswirken.",
              situationAnalysis: "Gewinnmargen zeigen Ihre Wettbewerbspositionierung, Preismacht und Fähigkeit, während des Verkaufsprozesses Mehrwert zu schaffen.",
              benefits: "Die Optimierung des Bruttogewinns pro Einheit verbessert die Gesamtrentabilität des Autohauses, den Cashflow und die Fähigkeit, in Wachstumsinitiativen zu investieren, erheblich.",
              scaleLabels: ["<€1.000", "€1.000-€2.000", "€2.000-€3.500", "€3.500-€5.000", ">€5.000"]
            }
          }
        },
        {
          id: "nvs-5",
          text: "How long does it typically take from a customer's initial inquiry to vehicle delivery?",
          description: "Measure the average time from first contact to keys-in-hand",
          type: "scale",
          scale: { min: 1, max: 5, labels: [">30 days", "21-30 days", "14-20 days", "7-13 days", "<7 days"] },
          weight: 1.1,
          category: "efficiency",
          purpose: "Evaluates process efficiency and customer experience quality, impacting customer satisfaction and competitive advantage.",
          situationAnalysis: "Faster delivery times improve customer satisfaction, reduce deal fallout, and enhance competitive positioning in the market.",
          linkedKPIs: ["Cycle Time", "Process Efficiency", "Customer Wait Time", "Deal Completion Rate"],
          benefits: "Reducing delivery time increases customer satisfaction, reduces cancellations, improves cash flow, and creates competitive differentiation.",
          translations: {
            en: {
              text: "How long does it typically take from a customer's initial inquiry to vehicle delivery?",
              description: "Measure the average time from first contact to keys-in-hand",
              purpose: "Evaluates process efficiency and customer experience quality, impacting customer satisfaction and competitive advantage.",
              situationAnalysis: "Faster delivery times improve customer satisfaction, reduce deal fallout, and enhance competitive positioning in the market.",
              benefits: "Reducing delivery time increases customer satisfaction, reduces cancellations, improves cash flow, and creates competitive differentiation.",
              scaleLabels: [">30 days", "21-30 days", "14-20 days", "7-13 days", "<7 days"]
            },
            de: {
              text: "Wie lange dauert es typischerweise von der ersten Kundenanfrage bis zur Fahrzeugauslieferung?",
              description: "Messen Sie die durchschnittliche Zeit vom Erstkontakt bis zur Schlüsselübergabe",
              purpose: "Bewertet die Prozesseffizienz und Qualität der Kundenerfahrung, die sich auf Kundenzufriedenheit und Wettbewerbsvorteile auswirken.",
              situationAnalysis: "Schnellere Lieferzeiten verbessern die Kundenzufriedenheit, reduzieren Geschäftsabbrüche und verbessern die Wettbewerbspositionierung auf dem Markt.",
              benefits: "Die Verkürzung der Lieferzeit erhöht die Kundenzufriedenheit, reduziert Stornierungen, verbessert den Cashflow und schafft Wettbewerbsdifferenzierung.",
              scaleLabels: [">30 Tage", "21-30 Tage", "14-20 Tage", "7-13 Tage", "<7 Tage"]
            }
          }
        },
        {
          id: "nvs-6",
          text: "What percentage of your online leads result in actual showroom visits?",
          description: "Track conversion from digital inquiry to physical dealership visit",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["<5%", "5-10%", "11-15%", "16-20%", ">20%"] },
          weight: 1.2,
          category: "digital",
          purpose: "Measures the effectiveness of your digital marketing strategy and online customer engagement capabilities.",
          situationAnalysis: "Digital lead conversion indicates how well your online presence and digital sales funnel are performing in today's digital-first marketplace.",
          linkedKPIs: ["Digital Marketing ROI", "Online Lead Quality", "Website Conversion Rate", "Digital Channel Performance"],
          benefits: "Improving digital conversion reduces marketing costs, increases lead quality, and positions you ahead of competitors in the digital space.",
          translations: {
            en: {
              text: "What percentage of your online leads result in actual showroom visits?",
              description: "Track conversion from digital inquiry to physical dealership visit",
              purpose: "Measures the effectiveness of your digital marketing strategy and online customer engagement capabilities.",
              situationAnalysis: "Digital lead conversion indicates how well your online presence and digital sales funnel are performing in today's digital-first marketplace.",
              benefits: "Improving digital conversion reduces marketing costs, increases lead quality, and positions you ahead of competitors in the digital space.",
              scaleLabels: ["<5%", "5-10%", "11-15%", "16-20%", ">20%"]
            },
            de: {
              text: "Welcher Prozentsatz Ihrer Online-Leads führt zu tatsächlichen Showroom-Besuchen?",
              description: "Verfolgen Sie die Konvertierung von digitalen Anfragen zu physischen Autohausbesuchen",
              purpose: "Misst die Wirksamkeit Ihrer digitalen Marketingstrategie und Online-Kundenbindungsfähigkeiten.",
              situationAnalysis: "Die Konvertierung digitaler Leads zeigt, wie gut Ihre Online-Präsenz und Ihr digitaler Verkaufstrichter im heutigen digitalen Markt funktionieren.",
              benefits: "Die Verbesserung der digitalen Konvertierung reduziert Marketingkosten, erhöht die Lead-Qualität und positioniert Sie vor Wettbewerbern im digitalen Bereich.",
              scaleLabels: ["<5%", "5-10%", "11-15%", "16-20%", ">20%"]
            }
          }
        },
        {
          id: "nvs-7",
          text: "How frequently does your sales team receive formal training and skill development?",
          description: "Include product training, sales techniques, and customer service skills",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["Rarely", "Annually", "Bi-annually", "Quarterly", "Monthly"] },
          weight: 1.0,
          category: "training",
          purpose: "Assesses investment in team development and continuous improvement, which directly correlates with sales performance and customer satisfaction.",
          situationAnalysis: "Regular training ensures your team stays updated with product knowledge, sales techniques, and industry best practices.",
          linkedKPIs: ["Sales Performance", "Employee Retention", "Skill Development Index", "Training ROI"],
          benefits: "Consistent training improves sales results, reduces staff turnover, enhances customer experience, and builds long-term competitive advantage.",
          translations: {
            en: {
              text: "How frequently does your sales team receive formal training and skill development?",
              description: "Include product training, sales techniques, and customer service skills",
              purpose: "Assesses investment in team development and continuous improvement, which directly correlates with sales performance and customer satisfaction.",
              situationAnalysis: "Regular training ensures your team stays updated with product knowledge, sales techniques, and industry best practices.",
              benefits: "Consistent training improves sales results, reduces staff turnover, enhances customer experience, and builds long-term competitive advantage.",
              scaleLabels: ["Rarely", "Annually", "Bi-annually", "Quarterly", "Monthly"]
            },
            de: {
              text: "Wie häufig erhält Ihr Verkaufsteam formale Schulungen und Kompetenzentwicklung?",
              description: "Einschließlich Produktschulung, Verkaufstechniken und Kundenservice-Fähigkeiten",
              purpose: "Bewertet die Investition in die Teamentwicklung und kontinuierliche Verbesserung, die direkt mit der Verkaufsleistung und Kundenzufriedenheit korreliert.",
              situationAnalysis: "Regelmäßige Schulungen stellen sicher, dass Ihr Team mit Produktwissen, Verkaufstechniken und Best Practices der Branche auf dem Laufenden bleibt.",
              benefits: "Konsequente Schulungen verbessern die Verkaufsergebnisse, reduzieren die Mitarbeiterfluktuation, verbessern die Kundenerfahrung und bauen langfristige Wettbewerbsvorteile auf.",
              scaleLabels: ["Selten", "Jährlich", "Halbjährlich", "Vierteljährlich", "Monatlich"]
            }
          }
        },
        {
          id: "nvs-8",
          text: "How many times per year does your new vehicle inventory completely turn over?",
          description: "Calculate annual sales divided by average inventory value",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["<6 times/year", "6-8 times/year", "9-11 times/year", "12-15 times/year", ">15 times/year"] },
          weight: 1.3,
          category: "inventory",
          purpose: "Measures inventory management efficiency and demand forecasting accuracy, directly impacting cash flow and carrying costs.",
          situationAnalysis: "Fast inventory turnover indicates good demand planning, effective pricing, and strong sales execution.",
          linkedKPIs: ["Inventory Days Supply", "Carrying Costs", "Cash Flow", "Working Capital Efficiency"],
          benefits: "Optimizing inventory turnover improves cash flow, reduces interest expenses, minimizes obsolescence risk, and increases profitability.",
          translations: {
            en: {
              text: "How many times per year does your new vehicle inventory completely turn over?",
              description: "Calculate annual sales divided by average inventory value",
              purpose: "Measures inventory management efficiency and demand forecasting accuracy, directly impacting cash flow and carrying costs.",
              situationAnalysis: "Fast inventory turnover indicates good demand planning, effective pricing, and strong sales execution.",
              benefits: "Optimizing inventory turnover improves cash flow, reduces interest expenses, minimizes obsolescence risk, and increases profitability.",
              scaleLabels: ["<6 times/year", "6-8 times/year", "9-11 times/year", "12-15 times/year", ">15 times/year"]
            },
            de: {
              text: "Wie oft pro Jahr wechselt Ihr Neuwagenbestand vollständig?",
              description: "Berechnen Sie die jährlichen Verkäufe geteilt durch den durchschnittlichen Lagerwert",
              purpose: "Misst die Effizienz der Lagerverwaltung und die Genauigkeit der Bedarfsprognose, die sich direkt auf den Cashflow und die Lagerkosten auswirken.",
              situationAnalysis: "Schneller Lagerumschlag zeigt gute Bedarfsplanung, effektive Preisgestaltung und starke Verkaufsausführung.",
              benefits: "Die Optimierung des Lagerumschlags verbessert den Cashflow, reduziert Zinsaufwendungen, minimiert das Veralterungsrisiko und erhöht die Rentabilität.",
              scaleLabels: ["<6 mal/Jahr", "6-8 mal/Jahr", "9-11 mal/Jahr", "12-15 mal/Jahr", ">15 mal/Jahr"]
            }
          }
        },
        {
          id: "nvs-9",
          text: "What percentage of your new vehicle customers purchase finance and insurance products?",
          description: "Include loans, leases, extended warranties, and protection packages",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["<40%", "40-55%", "56-70%", "71-85%", ">85%"] },
          weight: 1.2,
          category: "financial",
          purpose: "Evaluates the effectiveness of your F&I department in adding value and generating additional revenue per transaction.",
          situationAnalysis: "High F&I penetration indicates strong customer relationship building and effective product presentation skills.",
          linkedKPIs: ["F&I Revenue Per Unit", "Product Penetration Rate", "Customer Protection Rate", "Profit Per Deal"],
          benefits: "Increasing F&I penetration significantly boosts per-unit profitability, enhances customer protection, and creates recurring revenue streams.",
          translations: {
            en: {
              text: "What percentage of your new vehicle customers purchase finance and insurance products?",
              description: "Include loans, leases, extended warranties, and protection packages",
              purpose: "Evaluates the effectiveness of your F&I department in adding value and generating additional revenue per transaction.",
              situationAnalysis: "High F&I penetration indicates strong customer relationship building and effective product presentation skills.",
              benefits: "Increasing F&I penetration significantly boosts per-unit profitability, enhances customer protection, and creates recurring revenue streams.",
              scaleLabels: ["<40%", "40-55%", "56-70%", "71-85%", ">85%"]
            },
            de: {
              text: "Welcher Prozentsatz Ihrer Neuwagenkunden kauft Finanz- und Versicherungsprodukte?",
              description: "Einschließlich Kredite, Leasing, erweiterte Garantien und Schutzpakete",
              purpose: "Bewertet die Wirksamkeit Ihrer F&I-Abteilung bei der Wertschöpfung und Generierung zusätzlicher Einnahmen pro Transaktion.",
              situationAnalysis: "Hohe F&I-Durchdringung zeigt starken Aufbau von Kundenbeziehungen und effektive Produktpräsentationsfähigkeiten.",
              benefits: "Die Erhöhung der F&I-Durchdringung steigert die Rentabilität pro Einheit erheblich, verbessert den Kundenschutz und schafft wiederkehrende Einnahmequellen.",
              scaleLabels: ["<40%", "40-55%", "56-70%", "71-85%", ">85%"]
            }
          }
        },
        {
          id: "nvs-10",
          text: "How effectively does your team utilize the CRM system for lead management and follow-up?",
          description: "Consider data entry consistency, follow-up automation, and reporting usage",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["Poor", "Fair", "Good", "Very Good", "Excellent"] },
          weight: 1.1,
          category: "technology",
          purpose: "Assesses your team's ability to leverage technology for customer relationship management and sales process optimization.",
          situationAnalysis: "Effective CRM usage indicates systematic approach to customer management, improved follow-up processes, and data-driven decision making.",
          linkedKPIs: ["Lead Management Efficiency", "Follow-up Rate", "Customer Data Quality", "Sales Process Consistency"],
          benefits: "Better CRM utilization improves lead conversion, enhances customer relationships, increases repeat business, and provides valuable insights for growth.",
          translations: {
            en: {
              text: "How effectively does your team utilize the CRM system for lead management and follow-up?",
              description: "Consider data entry consistency, follow-up automation, and reporting usage",
              purpose: "Assesses your team's ability to leverage technology for customer relationship management and sales process optimization.",
              situationAnalysis: "Effective CRM usage indicates systematic approach to customer management, improved follow-up processes, and data-driven decision making.",
              benefits: "Better CRM utilization improves lead conversion, enhances customer relationships, increases repeat business, and provides valuable insights for growth.",
              scaleLabels: ["Poor", "Fair", "Good", "Very Good", "Excellent"]
            },
            de: {
              text: "Wie effektiv nutzt Ihr Team das CRM-System für Lead-Management und Nachverfolgung?",
              description: "Berücksichtigen Sie Dateneingabekonsistenz, Follow-up-Automatisierung und Berichtsnutzung",
              purpose: "Bewertet die Fähigkeit Ihres Teams, Technologie für das Kundenbeziehungsmanagement und die Optimierung des Verkaufsprozesses zu nutzen.",
              situationAnalysis: "Effektive CRM-Nutzung zeigt einen systematischen Ansatz für das Kundenmanagement, verbesserte Follow-up-Prozesse und datengesteuerte Entscheidungsfindung.",
              benefits: "Bessere CRM-Nutzung verbessert die Lead-Konvertierung, stärkt Kundenbeziehungen, erhöht das Folgegeschäft und liefert wertvolle Erkenntnisse für Wachstum.",
              scaleLabels: ["Schlecht", "Ausreichend", "Gut", "Sehr gut", "Ausgezeichnet"]
            }
          }
        }
      ]
    },
    {
      id: "used-vehicle-sales",
      title: "Used Vehicle Sales Performance",
      description: "Assess your used vehicle operations, pricing strategies, and market positioning",
      icon: "car",
      translations: {
        en: {
          title: "Used Vehicle Sales Performance",
          description: "Assess your used vehicle operations, pricing strategies, and market positioning"
        },
        de: {
          title: "Gebrauchtwagenverkaufsleistung",
          description: "Beurteilen Sie Ihre Gebrauchtwagenoperationen, Preisstrategien und Marktpositionierung"
        }
      },
      questions: [
        {
          id: "uvs-1",
          text: "On average, how many days do used vehicles remain in your inventory before being sold?",
          description: "Calculate the average days from acquisition to sale completion",
          type: "scale",
          scale: { min: 1, max: 5, labels: [">60 days", "46-60 days", "31-45 days", "21-30 days", "<21 days"] },
          weight: 1.4,
          category: "turnover",
          purpose: "Measures the efficiency of your used vehicle operations and pricing strategy, directly impacting profitability and cash flow.",
          situationAnalysis: "Fast turnover indicates effective market pricing, good vehicle selection, and strong sales execution in the used vehicle market.",
          linkedKPIs: ["Days in Inventory", "Carrying Costs", "Interest Expense", "Market Share"],
          benefits: "Faster turnover reduces carrying costs, improves cash flow, minimizes depreciation losses, and increases inventory ROI.",
          translations: {
            en: {
              text: "On average, how many days do used vehicles remain in your inventory before being sold?",
              description: "Calculate the average days from acquisition to sale completion",
              scaleLabels: [">60 days", "46-60 days", "31-45 days", "21-30 days", "<21 days"]
            },
            de: {
              text: "Wie viele Tage verbleiben Gebrauchtwagen durchschnittlich in Ihrem Bestand, bevor sie verkauft werden?",
              description: "Berechnen Sie die durchschnittlichen Tage vom Ankauf bis zum Verkaufsabschluss",
              scaleLabels: [">60 Tage", "46-60 Tage", "31-45 Tage", "21-30 Tage", "<21 Tage"]
            }
          }
        },
        {
          id: "uvs-2",
          text: "What is the average gross profit margin your dealership achieves on used vehicle sales?",
          description: "Calculate the profit per unit after reconditioning and acquisition costs",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["<$1,500", "$1,500-$2,500", "$2,500-$3,500", "$3,500-$4,500", ">$4,500"] },
          weight: 1.5,
          category: "profitability",
          purpose: "Evaluates pricing strategy effectiveness and market positioning for used vehicles, crucial for overall dealership profitability.",
          situationAnalysis: "Higher margins indicate strong appraisal skills, effective reconditioning processes, and successful value proposition communication.",
          linkedKPIs: ["Gross Profit Per Unit", "Margin Percentage", "Price Realization", "Competitive Positioning"],
          benefits: "Optimizing used vehicle margins significantly improves dealership profitability and provides flexibility for competitive pricing strategies.",
          translations: {
            en: {
              text: "What is the average gross profit margin your dealership achieves on used vehicle sales?",
              description: "Calculate the profit per unit after reconditioning and acquisition costs",
              scaleLabels: ["<€1,500", "€1,500-€2,500", "€2,500-€3,500", "€3,500-€4,500", ">€4,500"]
            },
            de: {
              text: "Welche durchschnittliche Bruttogewinnmarge erzielt Ihr Autohaus beim Gebrauchtwagenverkauf?",
              description: "Berechnen Sie den Gewinn pro Einheit nach Aufbereitungs- und Anschaffungskosten",
              scaleLabels: ["<€1.500", "€1.500-€2.500", "€2.500-€3.500", "€3.500-€4.500", ">€4.500"]
            }
          }
        },
        {
          id: "uvs-3",
          text: "How accurate are your initial trade-in valuations compared to the final selling prices achieved?",
          description: "Measure the consistency between appraisal values and actual sale outcomes",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["<70%", "70-75%", "76-80%", "81-85%", ">85%"] },
          weight: 1.2,
          category: "accuracy",
          purpose: "Measures the effectiveness of your appraisal process and market knowledge, impacting both acquisition costs and profitability.",
          situationAnalysis: "Accurate appraisals indicate strong market knowledge, effective valuation tools, and experienced appraisal staff.",
          linkedKPIs: ["Appraisal Accuracy Rate", "Acquisition Cost Variance", "Profit Margin Consistency", "Market Value Alignment"],
          benefits: "Improved appraisal accuracy reduces financial risk, enhances customer satisfaction, and increases predictable profit margins.",
          translations: {
            en: {
              text: "How accurate are your initial trade-in valuations compared to the final selling prices achieved?",
              description: "Measure the consistency between appraisal values and actual sale outcomes",
              scaleLabels: ["<70%", "70-75%", "76-80%", "81-85%", ">85%"]
            },
            de: {
              text: "Wie genau sind Ihre anfänglichen Inzahlungnahme-Bewertungen im Vergleich zu den erzielten Endverkaufspreisen?",
              description: "Messen Sie die Konsistenz zwischen Schätzwerten und tatsächlichen Verkaufsergebnissen",
              scaleLabels: ["<70%", "70-75%", "76-80%", "81-85%", ">85%"]
            }
          }
        },
        {
          id: "uvs-4",
          text: "What is your average cost per vehicle for reconditioning and preparing used vehicles for sale?",
          description: "Include mechanical repairs, detailing, and cosmetic improvements",
          type: "scale",
          scale: { min: 1, max: 5, labels: [">$2,000", "$1,500-$2,000", "$1,000-$1,499", "$500-$999", "<$500"] },
          weight: 1.3,
          category: "costs",
          purpose: "Evaluates operational efficiency in vehicle preparation and cost management, directly affecting unit profitability.",
          situationAnalysis: "Lower reconditioning costs indicate efficient processes, good vendor relationships, and effective quality control.",
          linkedKPIs: ["Reconditioning Cost Per Unit", "Time to Market", "Quality Standards", "Vendor Performance"],
          benefits: "Controlling reconditioning costs improves margins, reduces time to sale, and enhances overall operational efficiency.",
          translations: {
            en: {
              text: "What is your average cost per vehicle for reconditioning and preparing used vehicles for sale?",
              description: "Include mechanical repairs, detailing, and cosmetic improvements",
              scaleLabels: [">€2,000", "€1,500-€2,000", "€1,000-€1,499", "€500-€999", "<€500"]
            },
            de: {
              text: "Was sind Ihre durchschnittlichen Kosten pro Fahrzeug für die Aufbereitung und Verkaufsvorbereitung von Gebrauchtwagen?",
              description: "Einschließlich mechanischer Reparaturen, Aufbereitung und kosmetischer Verbesserungen",
              scaleLabels: [">€2.000", "€1.500-€2.000", "€1.000-€1.499", "€500-€999", "<€500"]
            }
          }
        },
        {
          id: "uvs-5",
          text: "How would you rate the quality and effectiveness of your online used vehicle listings?",
          description: "Consider photo quality, description accuracy, pricing transparency, and response time",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["Poor", "Fair", "Good", "Very Good", "Excellent"] },
          weight: 1.1,
          category: "digital",
          purpose: "Assesses digital marketing effectiveness for used vehicles, crucial in today's online-driven car shopping environment.",
          situationAnalysis: "Quality online listings drive more qualified leads, reduce time to sale, and improve competitive positioning.",
          linkedKPIs: ["Online Lead Generation", "Listing View Rate", "Inquiry Conversion", "Digital Market Penetration"],
          benefits: "Optimized online listings increase visibility, attract more qualified buyers, and accelerate sales velocity.",
          translations: {
            en: {
              text: "How would you rate the quality and effectiveness of your online used vehicle listings?",
              description: "Consider photo quality, description accuracy, pricing transparency, and response time",
              scaleLabels: ["Poor", "Fair", "Good", "Very Good", "Excellent"]
            },
            de: {
              text: "Wie würden Sie die Qualität und Wirksamkeit Ihrer Online-Gebrauchtwagen-Inserate bewerten?",
              description: "Berücksichtigen Sie Fotoqualität, Beschreibungsgenauigkeit, Preistransparenz und Reaktionszeit",
              scaleLabels: ["Schlecht", "Ausreichend", "Gut", "Sehr gut", "Ausgezeichnet"]
            }
          }
        },
        {
          id: "uvs-6",
          text: "What percentage of vehicles you purchase at auctions turn out to be profitable after resale?",
          description: "Track which auction purchases result in positive margins",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["<60%", "60-70%", "71-80%", "81-90%", ">90%"] },
          weight: 1.2,
          category: "sourcing",
          purpose: "Measures procurement efficiency and market knowledge in wholesale acquisition, affecting inventory quality and profitability.",
          situationAnalysis: "High success rates indicate strong market knowledge, disciplined buying practices, and effective inventory planning.",
          linkedKPIs: ["Acquisition Success Rate", "Purchase Cost Accuracy", "Inventory Quality", "Sourcing Efficiency"],
          benefits: "Improved auction success reduces acquisition risks, ensures quality inventory, and maintains consistent profit margins.",
          translations: {
            en: {
              text: "What percentage of vehicles you purchase at auctions turn out to be profitable after resale?",
              description: "Track which auction purchases result in positive margins",
              scaleLabels: ["<60%", "60-70%", "71-80%", "81-90%", ">90%"]
            },
            de: {
              text: "Welcher Prozentsatz der von Ihnen auf Auktionen gekauften Fahrzeuge erweist sich nach dem Weiterverkauf als profitabel?",
              description: "Verfolgen Sie, welche Auktionskäufe zu positiven Margen führen",
              scaleLabels: ["<60%", "60-70%", "71-80%", "81-90%", ">90%"]
            }
          }
        },
        {
          id: "uvs-7",
          text: "How do customers rate their overall satisfaction with your used vehicle purchase experience?",
          description: "Based on post-purchase surveys and feedback within 30 days of sale",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["Poor (1-2)", "Fair (3-4)", "Good (5-6)", "Very Good (7-8)", "Excellent (9-10)"] },
          weight: 1.3,
          category: "satisfaction",
          purpose: "Evaluates customer experience quality for used vehicle sales, impacting reputation, referrals, and repeat business.",
          situationAnalysis: "High satisfaction in used vehicle sales builds trust, generates referrals, and establishes long-term customer relationships.",
          linkedKPIs: ["Customer Satisfaction Score", "Repeat Customer Rate", "Referral Rate", "Online Review Ratings"],
          benefits: "Excellent customer satisfaction drives organic growth through referrals, improves online reputation, and increases customer lifetime value.",
          translations: {
            en: {
              text: "How do customers rate their overall satisfaction with your used vehicle purchase experience?",
              description: "Based on post-purchase surveys and feedback within 30 days of sale",
              scaleLabels: ["Poor (1-2)", "Fair (3-4)", "Good (5-6)", "Very Good (7-8)", "Excellent (9-10)"]
            },
            de: {
              text: "Wie bewerten Kunden ihre Gesamtzufriedenheit mit Ihrem Gebrauchtwagenkauferlebnis?",
              description: "Basierend auf Umfragen und Feedback nach dem Kauf innerhalb von 30 Tagen nach dem Verkauf",
              scaleLabels: ["Schlecht (1-2)", "Ausreichend (3-4)", "Gut (5-6)", "Sehr gut (7-8)", "Ausgezeichnet (9-10)"]
            }
          }
        },
        {
          id: "uvs-8",
          text: "What percentage of used vehicle buyers purchase extended warranties or service contracts?",
          description: "Include all protection products offered at point of sale",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["<20%", "20-35%", "36-50%", "51-65%", ">65%"] },
          weight: 1.1,
          category: "penetration",
          purpose: "Measures ability to add value and generate additional revenue while providing customer protection on used vehicle sales.",
          situationAnalysis: "Higher penetration rates indicate effective value communication and strong customer relationship building.",
          linkedKPIs: ["Product Penetration Rate", "Revenue Per Unit", "Customer Protection Rate", "Profit Margin Enhancement"],
          benefits: "Increased warranty penetration boosts profitability, enhances customer confidence, and creates additional revenue streams.",
          translations: {
            en: {
              text: "What percentage of used vehicle buyers purchase extended warranties or service contracts?",
              description: "Include all protection products offered at point of sale",
              scaleLabels: ["<20%", "20-35%", "36-50%", "51-65%", ">65%"]
            },
            de: {
              text: "Welcher Prozentsatz der Gebrauchtwagenkäufer erwirbt erweiterte Garantien oder Serviceverträge?",
              description: "Einschließlich aller am Verkaufsort angebotenen Schutzprodukte",
              scaleLabels: ["<20%", "20-35%", "36-50%", "51-65%", ">65%"]
            }
          }
        },
        {
          id: "uvs-9",
          text: "How does your used vehicle pricing compare to similar vehicles in your local market?",
          description: "Consider pricing relative to competitors within a 50-mile radius",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["Above market", "Slightly above", "At market", "Slightly below", "Below market"] },
          weight: 1.2,
          category: "pricing",
          purpose: "Evaluates market positioning and pricing strategy effectiveness in the competitive used vehicle marketplace.",
          situationAnalysis: "Competitive pricing ensures market relevance while maintaining profitability and sales velocity.",
          linkedKPIs: ["Price Competitiveness Index", "Market Position", "Sales Velocity", "Profit Margin"],
          benefits: "Optimal pricing balances profitability with competitiveness, maximizing both sales volume and unit profits.",
          translations: {
            en: {
              text: "How does your used vehicle pricing compare to similar vehicles in your local market?",
              description: "Consider pricing relative to competitors within a 50-mile radius",
              scaleLabels: ["Above market", "Slightly above", "At market", "Slightly below", "Below market"]
            },
            de: {
              text: "Wie vergleicht sich Ihre Gebrauchtwagenpreisgestaltung mit ähnlichen Fahrzeugen in Ihrem lokalen Markt?",
              description: "Berücksichtigen Sie die Preisgestaltung im Vergleich zu Wettbewerbern im Umkreis von 80 km",
              scaleLabels: ["Über dem Markt", "Leicht darüber", "Am Markt", "Leicht darunter", "Unter dem Markt"]
            }
          }
        },
        {
          id: "uvs-10",
          text: "How effective is your strategy for managing vehicles that remain unsold for more than 60 days?",
          description: "Describe your aged inventory reduction approach and pricing adjustments",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["No strategy", "Reactive", "Basic plan", "Good plan", "Excellent plan"] },
          weight: 1.3,
          category: "inventory",
          purpose: "Assesses risk management and inventory optimization strategies, crucial for maintaining healthy cash flow and profitability.",
          situationAnalysis: "Effective aged inventory management prevents excessive carrying costs and minimizes depreciation losses.",
          linkedKPIs: ["Aged Inventory Percentage", "Carrying Cost Management", "Loss Prevention", "Cash Flow Optimization"],
          benefits: "Proactive aged inventory management reduces financial risk, improves cash flow, and maintains inventory freshness.",
          translations: {
            en: {
              text: "How effective is your strategy for managing vehicles that remain unsold for more than 60 days?",
              description: "Describe your aged inventory reduction approach and pricing adjustments",
              scaleLabels: ["No strategy", "Reactive", "Basic plan", "Good plan", "Excellent plan"]
            },
            de: {
              text: "Wie effektiv ist Ihre Strategie zur Verwaltung von Fahrzeugen, die länger als 60 Tage unverkauft bleiben?",
              description: "Beschreiben Sie Ihren Ansatz zur Reduzierung alter Bestände und Preisanpassungen",
              scaleLabels: ["Keine Strategie", "Reaktiv", "Basisplan", "Guter Plan", "Ausgezeichneter Plan"]
            }
          }
        }
      ]
    },
    {
      id: "service-performance",
      title: "Service Performance",
      description: "Evaluate your service department efficiency, customer satisfaction, and profitability",
      icon: "wrench",
      translations: {
        en: {
          title: "Service Performance",
          description: "Evaluate your service department efficiency, customer satisfaction, and profitability"
        },
        de: {
          title: "Serviceleistung",
          description: "Bewerten Sie die Effizienz Ihrer Serviceabteilung, Kundenzufriedenheit und Rentabilität"
        }
      },
      questions: [
        {
          id: "svc-1",
          text: "What percentage of your technicians' available hours are spent on billable, productive work?",
          description: "Calculate productive labor hours divided by total available hours",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["<60%", "60-70%", "71-80%", "81-90%", ">90%"] },
          weight: 1.5,
          category: "efficiency",
          purpose: "Measures how effectively your service department utilizes technician time, directly impacting profitability and customer satisfaction.",
          situationAnalysis: "Higher efficiency indicates better workflow management, adequate staffing, and optimized processes.",
          linkedKPIs: ["Labor Utilization Rate", "Productive Hours", "Technician Efficiency", "Revenue Per Hour"],
          benefits: "Improved labor efficiency increases profitability, reduces customer wait times, and maximizes revenue potential from existing resources.",
          translations: {
            en: {
              text: "What percentage of your technicians' available hours are spent on billable, productive work?",
              description: "Calculate productive labor hours divided by total available hours",
              scaleLabels: ["<60%", "60-70%", "71-80%", "81-90%", ">90%"]
            },
            de: {
              text: "Welcher Prozentsatz der verfügbaren Stunden Ihrer Techniker wird für abrechenbare, produktive Arbeit aufgewendet?",
              description: "Berechnen Sie produktive Arbeitsstunden geteilt durch die gesamten verfügbaren Stunden",
              scaleLabels: ["<60%", "60-70%", "71-80%", "81-90%", ">90%"]
            }
          }
        },
        {
          id: "svc-2",
          text: "What percentage of your posted labor rate do you actually realize on customer-pay work?",
          description: "Compare effective labor rate to your posted door rate",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["<80%", "80-85%", "86-90%", "91-95%", ">95%"] },
          weight: 1.4,
          category: "pricing",
          purpose: "Evaluates pricing strategy effectiveness and market positioning for service labor, crucial for service department profitability.",
          situationAnalysis: "High rate utilization indicates strong value proposition, competitive pricing, and effective customer communication.",
          linkedKPIs: ["Effective Labor Rate", "Price Realization", "Service Revenue", "Profit Margin"],
          benefits: "Maximizing labor rate utilization significantly improves service department profitability and competitive positioning.",
          translations: {
            en: {
              text: "What percentage of your posted labor rate do you actually realize on customer-pay work?",
              description: "Compare effective labor rate to your posted door rate",
              scaleLabels: ["<80%", "80-85%", "86-90%", "91-95%", ">95%"]
            },
            de: {
              text: "Welchen Prozentsatz Ihres veröffentlichten Arbeitssatzes realisieren Sie tatsächlich bei Kundenarbeiten?",
              description: "Vergleichen Sie den effektiven Arbeitssatz mit Ihrem veröffentlichten Stundensatz",
              scaleLabels: ["<80%", "80-85%", "86-90%", "91-95%", ">95%"]
            }
          }
        },
        {
          id: "svc-3",
          text: "How soon can customers typically get an appointment for routine service at your dealership?",
          description: "Measure average wait time from request to available appointment slot",
          type: "scale",
          scale: { min: 1, max: 5, labels: [">14 days", "8-14 days", "4-7 days", "2-3 days", "Same/next day"] },
          weight: 1.3,
          category: "availability",
          purpose: "Measures customer convenience and operational capacity, directly affecting customer satisfaction and retention.",
          situationAnalysis: "Short wait times indicate optimal capacity management and strong operational efficiency.",
          linkedKPIs: ["Appointment Lead Time", "Capacity Utilization", "Customer Convenience", "Service Accessibility"],
          benefits: "Better appointment availability improves customer satisfaction, increases service retention, and enhances competitive advantage.",
          translations: {
            en: {
              text: "How soon can customers typically get an appointment for routine service at your dealership?",
              description: "Measure average wait time from request to available appointment slot",
              scaleLabels: [">14 days", "8-14 days", "4-7 days", "2-3 days", "Same/next day"]
            },
            de: {
              text: "Wie schnell können Kunden typischerweise einen Termin für Routineservice in Ihrem Autohaus bekommen?",
              description: "Messen Sie die durchschnittliche Wartezeit von der Anfrage bis zum verfügbaren Termin",
              scaleLabels: [">14 Tage", "8-14 Tage", "4-7 Tage", "2-3 Tage", "Am selben/nächsten Tag"]
            }
          }
        },
        {
          id: "svc-4",
          text: "What percentage of repairs are completed correctly on the first visit without requiring a return?",
          description: "Track comebacks and repeat repairs for the same issue",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["<75%", "75-80%", "81-85%", "86-92%", ">92%"] },
          weight: 1.4,
          category: "quality",
          purpose: "Evaluates service quality and diagnostic accuracy, impacting customer trust, efficiency, and profitability.",
          situationAnalysis: "High first-time fix rates indicate skilled technicians, proper diagnostic procedures, and quality parts.",
          linkedKPIs: ["Quality Index", "Rework Rate", "Customer Satisfaction", "Diagnostic Accuracy"],
          benefits: "Improving first-time fix rates enhances customer trust, reduces costs, increases efficiency, and builds long-term loyalty.",
          translations: {
            en: {
              text: "What percentage of repairs are completed correctly on the first visit without requiring a return?",
              description: "Track comebacks and repeat repairs for the same issue",
              scaleLabels: ["<75%", "75-80%", "81-85%", "86-92%", ">92%"]
            },
            de: {
              text: "Welcher Prozentsatz der Reparaturen wird beim ersten Besuch korrekt abgeschlossen, ohne dass eine Rückkehr erforderlich ist?",
              description: "Verfolgen Sie Rückkehrer und wiederholte Reparaturen für dasselbe Problem",
              scaleLabels: ["<75%", "75-80%", "81-85%", "86-92%", ">92%"]
            }
          }
        },
        {
          id: "svc-5",
          text: "How do customers rate their overall experience with your service department?",
          description: "Based on post-service surveys and satisfaction ratings",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["Poor (1-2)", "Fair (3-4)", "Good (5-6)", "Very Good (7-8)", "Excellent (9-10)"] },
          weight: 1.5,
          category: "satisfaction",
          purpose: "Measures overall service experience quality, crucial for customer retention and referral generation.",
          situationAnalysis: "High satisfaction scores indicate excellent customer experience, quality work, and effective communication.",
          linkedKPIs: ["Net Promoter Score", "Customer Retention Rate", "Referral Rate", "Service Loyalty"],
          benefits: "Excellent service satisfaction drives customer loyalty, generates referrals, and creates sustainable competitive advantage.",
          translations: {
            en: {
              text: "How do customers rate their overall experience with your service department?",
              description: "Based on post-service surveys and satisfaction ratings",
              scaleLabels: ["Poor (1-2)", "Fair (3-4)", "Good (5-6)", "Very Good (7-8)", "Excellent (9-10)"]
            },
            de: {
              text: "Wie bewerten Kunden ihre Gesamterfahrung mit Ihrer Serviceabteilung?",
              description: "Basierend auf Umfragen und Zufriedenheitsbewertungen nach dem Service",
              scaleLabels: ["Schlecht (1-2)", "Ausreichend (3-4)", "Gut (5-6)", "Sehr gut (7-8)", "Ausgezeichnet (9-10)"]
            }
          }
        },
        {
          id: "svc-6",
          text: "What percentage of your warranty claims are successfully approved and reimbursed by the manufacturer?",
          description: "Track warranty claim submission success rate",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["<85%", "85-90%", "91-94%", "95-97%", ">97%"] },
          weight: 1.2,
          category: "warranty",
          purpose: "Evaluates administrative efficiency and process compliance, directly impacting service department profitability.",
          situationAnalysis: "High recovery rates indicate proper documentation, process compliance, and effective manufacturer relationships.",
          linkedKPIs: ["Warranty Recovery Rate", "Process Compliance", "Administrative Efficiency", "Profit Recovery"],
          benefits: "Maximizing warranty recovery improves profitability, ensures proper compensation for work performed, and maintains cash flow.",
          translations: {
            en: {
              text: "What percentage of your warranty claims are successfully approved and reimbursed by the manufacturer?",
              description: "Track warranty claim submission success rate",
              scaleLabels: ["<85%", "85-90%", "91-94%", "95-97%", ">97%"]
            },
            de: {
              text: "Welcher Prozentsatz Ihrer Garantieansprüche wird erfolgreich genehmigt und vom Hersteller erstattet?",
              description: "Verfolgen Sie die Erfolgsquote bei der Einreichung von Garantieansprüchen",
              scaleLabels: ["<85%", "85-90%", "91-94%", "95-97%", ">97%"]
            }
          }
        },
        {
          id: "svc-7",
          text: "What percentage of your technicians hold current ASE certifications or equivalent manufacturer credentials?",
          description: "Count certified technicians as a percentage of total technical staff",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["<50%", "50-65%", "66-80%", "81-90%", ">90%"] },
          weight: 1.1,
          category: "certification",
          purpose: "Assesses technical competency and professional development investment, impacting service quality and customer confidence.",
          situationAnalysis: "Higher certification levels indicate investment in training, technical competency, and professional standards.",
          linkedKPIs: ["Certification Rate", "Technical Competency", "Training Investment", "Service Quality"],
          benefits: "Higher certification levels improve service quality, enhance customer confidence, and support premium pricing strategies.",
          translations: {
            en: {
              text: "What percentage of your technicians hold current ASE certifications or equivalent manufacturer credentials?",
              description: "Count certified technicians as a percentage of total technical staff",
              scaleLabels: ["<50%", "50-65%", "66-80%", "81-90%", ">90%"]
            },
            de: {
              text: "Welcher Prozentsatz Ihrer Techniker verfügt über aktuelle ASE-Zertifizierungen oder gleichwertige Herstellerzertifikate?",
              description: "Zählen Sie zertifizierte Techniker als Prozentsatz des gesamten technischen Personals",
              scaleLabels: ["<50%", "50-65%", "66-80%", "81-90%", ">90%"]
            }
          }
        },
        {
          id: "svc-8",
          text: "What percentage of your service customers return for additional service within 12 months?",
          description: "Track repeat customer visits excluding warranty-required service",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["<40%", "40-50%", "51-60%", "61-70%", ">70%"] },
          weight: 1.3,
          category: "retention",
          purpose: "Measures customer loyalty and service experience quality, crucial for long-term revenue and profitability.",
          situationAnalysis: "High retention rates indicate satisfied customers, quality service, and effective customer relationship management.",
          linkedKPIs: ["Customer Retention Rate", "Service Loyalty", "Repeat Business", "Customer Lifetime Value"],
          benefits: "Strong service retention creates predictable revenue, reduces marketing costs, and builds sustainable business growth.",
          translations: {
            en: {
              text: "What percentage of your service customers return for additional service within 12 months?",
              description: "Track repeat customer visits excluding warranty-required service",
              scaleLabels: ["<40%", "40-50%", "51-60%", "61-70%", ">70%"]
            },
            de: {
              text: "Welcher Prozentsatz Ihrer Servicekunden kehrt innerhalb von 12 Monaten für zusätzlichen Service zurück?",
              description: "Verfolgen Sie wiederholte Kundenbesuche ohne garantiebedingte Services",
              scaleLabels: ["<40%", "40-50%", "51-60%", "61-70%", ">70%"]
            }
          }
        },
        {
          id: "svc-9",
          text: "When a technician needs a part, how often is it immediately available in your parts inventory?",
          description: "Track parts availability for service work orders",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["<85%", "85-90%", "91-94%", "95-97%", ">97%"] },
          weight: 1.2,
          category: "parts",
          purpose: "Evaluates inventory management effectiveness and customer convenience, impacting service efficiency and satisfaction.",
          situationAnalysis: "High parts availability indicates effective inventory planning, supplier relationships, and demand forecasting.",
          linkedKPIs: ["Parts Fill Rate", "Service Efficiency", "Customer Wait Time", "Inventory Management"],
          benefits: "Better parts availability improves service efficiency, reduces customer wait times, and enhances overall satisfaction.",
          translations: {
            en: {
              text: "When a technician needs a part, how often is it immediately available in your parts inventory?",
              description: "Track parts availability for service work orders",
              scaleLabels: ["<85%", "85-90%", "91-94%", "95-97%", ">97%"]
            },
            de: {
              text: "Wenn ein Techniker ein Teil benötigt, wie oft ist es sofort in Ihrem Teilelager verfügbar?",
              description: "Verfolgen Sie die Teileverfügbarkeit für Service-Arbeitsaufträge",
              scaleLabels: ["<85%", "85-90%", "91-94%", "95-97%", ">97%"]
            }
          }
        },
        {
          id: "svc-10",
          text: "How effectively do you use digital tools to keep customers informed about their vehicle's service status?",
          description: "Include text updates, service videos, digital inspections, and online payment",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["None", "Basic", "Good", "Very Good", "Excellent"] },
          weight: 1.0,
          category: "digital",
          purpose: "Assesses adoption of modern communication tools, enhancing customer experience and operational efficiency.",
          situationAnalysis: "Digital communication tools improve customer experience, reduce phone calls, and enhance transparency.",
          linkedKPIs: ["Digital Adoption Rate", "Customer Communication", "Process Efficiency", "Customer Experience"],
          benefits: "Digital communication improves customer experience, increases efficiency, and differentiates your service offering.",
          translations: {
            en: {
              text: "How effectively do you use digital tools to keep customers informed about their vehicle's service status?",
              description: "Include text updates, service videos, digital inspections, and online payment",
              scaleLabels: ["None", "Basic", "Good", "Very Good", "Excellent"]
            },
            de: {
              text: "Wie effektiv nutzen Sie digitale Tools, um Kunden über den Servicestatus ihres Fahrzeugs zu informieren?",
              description: "Einschließlich SMS-Updates, Service-Videos, digitale Inspektionen und Online-Zahlung",
              scaleLabels: ["Keine", "Grundlegend", "Gut", "Sehr gut", "Ausgezeichnet"]
            }
          }
        },
        {
          id: "svc-11",
          text: "How many repair orders does each service advisor typically process per day?",
          description: "Calculate average daily RO count per advisor",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["<8 ROs", "8-10 ROs", "11-13 ROs", "14-16 ROs", ">16 ROs"] },
          weight: 1.3,
          category: "productivity",
          purpose: "Measures front-end efficiency and customer handling capacity, directly impacting service department revenue.",
          situationAnalysis: "Higher productivity indicates efficient processes, good training, and effective customer management systems.",
          linkedKPIs: ["Advisor Productivity", "Service Capacity", "Revenue Per Advisor", "Customer Throughput"],
          benefits: "Improved advisor productivity increases revenue capacity, reduces wait times, and maximizes staff efficiency.",
          translations: {
            en: {
              text: "How many repair orders does each service advisor typically process per day?",
              description: "Calculate average daily RO count per advisor",
              scaleLabels: ["<8 ROs", "8-10 ROs", "11-13 ROs", "14-16 ROs", ">16 ROs"]
            },
            de: {
              text: "Wie viele Reparaturaufträge bearbeitet jeder Serviceberater typischerweise pro Tag?",
              description: "Berechnen Sie die durchschnittliche tägliche RO-Anzahl pro Berater",
              scaleLabels: ["<8 ROs", "8-10 ROs", "11-13 ROs", "14-16 ROs", ">16 ROs"]
            }
          }
        },
        {
          id: "svc-12",
          text: "How would you rate the efficiency and throughput of your express or quick service lane?",
          description: "Consider wait times, service speed, and customer satisfaction for quick service",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["Poor", "Fair", "Good", "Very Good", "Excellent"] },
          weight: 1.1,
          category: "express",
          purpose: "Evaluates quick service operations efficiency, important for customer convenience and service department productivity.",
          situationAnalysis: "Efficient express service improves customer convenience, increases throughput, and enhances competitive positioning.",
          linkedKPIs: ["Express Service Volume", "Customer Convenience", "Service Speed", "Operational Efficiency"],
          benefits: "Optimized express service increases customer satisfaction, improves efficiency, and captures more quick-turn business.",
          translations: {
            en: {
              text: "How would you rate the efficiency and throughput of your express or quick service lane?",
              description: "Consider wait times, service speed, and customer satisfaction for quick service",
              scaleLabels: ["Poor", "Fair", "Good", "Very Good", "Excellent"]
            },
            de: {
              text: "Wie würden Sie die Effizienz und den Durchsatz Ihrer Express- oder Schnellservice-Spur bewerten?",
              description: "Berücksichtigen Sie Wartezeiten, Servicegeschwindigkeit und Kundenzufriedenheit für Schnellservice",
              scaleLabels: ["Schlecht", "Ausreichend", "Gut", "Sehr gut", "Ausgezeichnet"]
            }
          }
        }
      ]
    },
    {
      id: "parts-inventory",
      title: "Parts and Inventory Performance",
      description: "Analyze your parts department efficiency, inventory management, and profitability",
      icon: "package",
      translations: {
        en: {
          title: "Parts and Inventory Performance",
          description: "Analyze your parts department efficiency, inventory management, and profitability"
        },
        de: {
          title: "Teile- und Lagerleistung",
          description: "Analysieren Sie die Effizienz Ihrer Teileabteilung, Lagerverwaltung und Rentabilität"
        }
      },
      questions: [
        {
          id: "pts-1",
          text: "How many times per year does your entire parts inventory turn over through sales?",
          description: "Calculate annual parts sales divided by average inventory value",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["<4 times", "4-5 times", "6-7 times", "8-10 times", ">10 times"] },
          weight: 1.5,
          category: "turnover",
          purpose: "Measures inventory management efficiency and demand forecasting accuracy, directly impacting cash flow and profitability.",
          situationAnalysis: "Higher turnover indicates effective inventory management, better cash utilization, and reduced carrying costs.",
          linkedKPIs: ["Inventory Turnover Rate", "Cash Flow", "Carrying Costs", "Working Capital Efficiency"],
          benefits: "Faster inventory turnover improves cash flow, reduces carrying costs, and maximizes return on inventory investment.",
          translations: {
            en: {
              text: "How many times per year does your entire parts inventory turn over through sales?",
              description: "Calculate annual parts sales divided by average inventory value",
              scaleLabels: ["<4 times", "4-5 times", "6-7 times", "8-10 times", ">10 times"]
            },
            de: {
              text: "Wie oft pro Jahr wechselt Ihr gesamter Teilebestand durch Verkäufe?",
              description: "Berechnen Sie die jährlichen Teileverkäufe geteilt durch den durchschnittlichen Lagerwert",
              scaleLabels: ["<4 mal", "4-5 mal", "6-7 mal", "8-10 mal", ">10 mal"]
            }
          }
        },
        {
          id: "pts-2",
          text: "What percentage of parts requests can you fulfill immediately from your on-hand stock?",
          description: "Track first-time fill rate for both customer and internal service requests",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["<80%", "80-85%", "86-90%", "91-95%", ">95%"] },
          weight: 1.4,
          category: "availability",
          purpose: "Evaluates inventory planning effectiveness and customer service capability, impacting service efficiency and satisfaction.",
          situationAnalysis: "High fill rates indicate effective demand planning, appropriate stock levels, and good supplier relationships.",
          linkedKPIs: ["Parts Availability", "Service Efficiency", "Customer Satisfaction", "Stock-out Rate"],
          benefits: "Higher fill rates improve service efficiency, enhance customer satisfaction, and reduce service completion delays.",
          translations: {
            en: {
              text: "What percentage of parts requests can you fulfill immediately from your on-hand stock?",
              description: "Track first-time fill rate for both customer and internal service requests",
              scaleLabels: ["<80%", "80-85%", "86-90%", "91-95%", ">95%"]
            },
            de: {
              text: "Welchen Prozentsatz der Teileanfragen können Sie sofort aus Ihrem Lagerbestand erfüllen?",
              description: "Verfolgen Sie die Ersterfüllungsrate für Kunden- und interne Serviceanfragen",
              scaleLabels: ["<80%", "80-85%", "86-90%", "91-95%", ">95%"]
            }
          }
        },
        {
          id: "pts-3",
          text: "What is the average gross profit margin you achieve on parts sales across all channels?",
          description: "Calculate total parts gross profit as a percentage of parts revenue",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["<25%", "25-30%", "31-35%", "36-40%", ">40%"] },
          weight: 1.5,
          category: "profitability",
          purpose: "Evaluates pricing strategy effectiveness and market positioning for parts, crucial for parts department profitability.",
          situationAnalysis: "Higher margins indicate effective pricing strategies, good supplier negotiations, and strong market positioning.",
          linkedKPIs: ["Gross Profit Margin", "Price Realization", "Competitive Position", "Parts Revenue"],
          benefits: "Optimizing parts margins significantly improves department profitability and overall dealership financial performance.",
          translations: {
            en: {
              text: "What is the average gross profit margin you achieve on parts sales across all channels?",
              description: "Calculate total parts gross profit as a percentage of parts revenue",
              scaleLabels: ["<25%", "25-30%", "31-35%", "36-40%", ">40%"]
            },
            de: {
              text: "Wie hoch ist die durchschnittliche Bruttogewinnmarge, die Sie bei Teileverkäufen über alle Kanäle erzielen?",
              description: "Berechnen Sie den gesamten Teile-Bruttogewinn als Prozentsatz des Teileumsatzes",
              scaleLabels: ["<25%", "25-30%", "31-35%", "36-40%", ">40%"]
            }
          }
        },
        {
          id: "pts-4",
          text: "What percentage of your parts inventory is considered obsolete with no movement in 12+ months?",
          description: "Identify slow-moving and dead stock as a percentage of total inventory value",
          type: "scale",
          scale: { min: 1, max: 5, labels: [">15%", "11-15%", "6-10%", "3-5%", "<3%"] },
          weight: 1.3,
          category: "obsolete",
          purpose: "Measures inventory management effectiveness and risk control, impacting profitability and cash flow.",
          situationAnalysis: "Lower obsolete percentages indicate effective demand planning, good inventory rotation, and market awareness.",
          linkedKPIs: ["Obsolete Inventory Rate", "Inventory Risk", "Cash Flow Impact", "Inventory Quality"],
          benefits: "Reducing obsolete inventory improves cash flow, reduces write-offs, and increases inventory ROI.",
          translations: {
            en: {
              text: "What percentage of your parts inventory is considered obsolete with no movement in 12+ months?",
              description: "Identify slow-moving and dead stock as a percentage of total inventory value",
              scaleLabels: [">15%", "11-15%", "6-10%", "3-5%", "<3%"]
            },
            de: {
              text: "Welcher Prozentsatz Ihres Teilebestands gilt als veraltet ohne Bewegung in 12+ Monaten?",
              description: "Identifizieren Sie langsamdrehende und tote Bestände als Prozentsatz des gesamten Lagerwerts",
              scaleLabels: [">15%", "11-15%", "6-10%", "3-5%", "<3%"]
            }
          }
        },
        {
          id: "pts-5",
          text: "How accurate are your parts orders in terms of ordering the correct part and quantity?",
          description: "Track orders that don't require corrections or returns",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["<85%", "85-90%", "91-94%", "95-97%", ">97%"] },
          weight: 1.2,
          category: "accuracy",
          purpose: "Evaluates process efficiency and staff competency, impacting customer satisfaction and operational costs.",
          situationAnalysis: "High accuracy indicates well-trained staff, effective systems, and good process controls.",
          linkedKPIs: ["Order Accuracy Rate", "Process Efficiency", "Error Reduction", "Customer Satisfaction"],
          benefits: "Improved ordering accuracy reduces costs, enhances customer satisfaction, and improves operational efficiency.",
          translations: {
            en: {
              text: "How accurate are your parts orders in terms of ordering the correct part and quantity?",
              description: "Track orders that don't require corrections or returns",
              scaleLabels: ["<85%", "85-90%", "91-94%", "95-97%", ">97%"]
            },
            de: {
              text: "Wie genau sind Ihre Teilebestellungen hinsichtlich der Bestellung des richtigen Teils und der richtigen Menge?",
              description: "Verfolgen Sie Bestellungen, die keine Korrekturen oder Rücksendungen erfordern",
              scaleLabels: ["<85%", "85-90%", "91-94%", "95-97%", ">97%"]
            }
          }
        },
        {
          id: "pts-6",
          text: "How would you rate your success in selling parts to external customers such as independent shops?",
          description: "Evaluate your wholesale and retail parts business outside of internal service",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["Poor", "Fair", "Good", "Very Good", "Excellent"] },
          weight: 1.1,
          category: "wholesale",
          purpose: "Assesses market expansion opportunities and additional revenue generation from parts inventory.",
          situationAnalysis: "Strong wholesale performance indicates market knowledge, competitive pricing, and relationship building capabilities.",
          linkedKPIs: ["Wholesale Revenue", "Market Share", "Customer Base Expansion", "Revenue Diversification"],
          benefits: "Growing wholesale business increases revenue, improves inventory turnover, and diversifies customer base.",
          translations: {
            en: {
              text: "How would you rate your success in selling parts to external customers such as independent shops?",
              description: "Evaluate your wholesale and retail parts business outside of internal service",
              scaleLabels: ["Poor", "Fair", "Good", "Very Good", "Excellent"]
            },
            de: {
              text: "Wie würden Sie Ihren Erfolg beim Verkauf von Teilen an externe Kunden wie freie Werkstätten bewerten?",
              description: "Bewerten Sie Ihr Großhandels- und Einzelhandelsteilegeschäft außerhalb des internen Service",
              scaleLabels: ["Schlecht", "Ausreichend", "Gut", "Sehr gut", "Ausgezeichnet"]
            }
          }
        },
        {
          id: "pts-7",
          text: "What percentage of parts sold are returned due to ordering errors or incorrect parts?",
          description: "Track return rate attributed to dealership mistakes",
          type: "scale",
          scale: { min: 1, max: 5, labels: [">10%", "6-10%", "3-5%", "1-2%", "<1%"] },
          weight: 1.2,
          category: "returns",
          purpose: "Measures process quality and accuracy, impacting profitability and customer satisfaction.",
          situationAnalysis: "Low return rates indicate accurate ordering, good process controls, and effective staff training.",
          linkedKPIs: ["Return Rate", "Process Quality", "Customer Satisfaction", "Operational Costs"],
          benefits: "Reducing return rates improves profitability, enhances customer satisfaction, and reduces operational inefficiencies.",
          translations: {
            en: {
              text: "What percentage of parts sold are returned due to ordering errors or incorrect parts?",
              description: "Track return rate attributed to dealership mistakes",
              scaleLabels: [">10%", "6-10%", "3-5%", "1-2%", "<1%"]
            },
            de: {
              text: "Welcher Prozentsatz der verkauften Teile wird aufgrund von Bestellfehlern oder falschen Teilen zurückgegeben?",
              description: "Verfolgen Sie die Rückgabequote, die auf Fehler des Autohauses zurückzuführen ist",
              scaleLabels: [">10%", "6-10%", "3-5%", "1-2%", "<1%"]
            }
          }
        },
        {
          id: "pts-8",
          text: "How effectively can you source and obtain urgently needed parts that are not in stock?",
          description: "Rate your emergency sourcing capabilities for critical customer needs",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["Poor", "Fair", "Good", "Very Good", "Excellent"] },
          weight: 1.1,
          category: "emergency",
          purpose: "Evaluates supply chain relationships and problem-solving capabilities, crucial for customer service excellence.",
          situationAnalysis: "Strong emergency procurement capabilities indicate good supplier relationships and effective logistics management.",
          linkedKPIs: ["Emergency Response Time", "Supplier Relationships", "Service Completion Rate", "Customer Satisfaction"],
          benefits: "Better emergency procurement improves customer satisfaction, reduces service delays, and enhances competitive advantage.",
          translations: {
            en: {
              text: "How effectively can you source and obtain urgently needed parts that are not in stock?",
              description: "Rate your emergency sourcing capabilities for critical customer needs",
              scaleLabels: ["Poor", "Fair", "Good", "Very Good", "Excellent"]
            },
            de: {
              text: "Wie effektiv können Sie dringend benötigte Teile beschaffen, die nicht auf Lager sind?",
              description: "Bewerten Sie Ihre Notfallbeschaffungsfähigkeiten für kritische Kundenbedürfnisse",
              scaleLabels: ["Schlecht", "Ausreichend", "Gut", "Sehr gut", "Ausgezeichnet"]
            }
          }
        },
        {
          id: "pts-9",
          text: "How long does it typically take to process and fulfill a standard parts counter request?",
          description: "Measure time from customer request to parts in hand",
          type: "scale",
          scale: { min: 1, max: 5, labels: [">10 min", "6-10 min", "3-5 min", "1-2 min", "<1 min"] },
          weight: 1.0,
          category: "efficiency",
          purpose: "Measures operational efficiency and customer service speed, impacting customer satisfaction and productivity.",
          situationAnalysis: "Fast parts counter service indicates efficient systems, trained staff, and streamlined processes.",
          linkedKPIs: ["Processing Time", "Customer Wait Time", "Staff Productivity", "Service Efficiency"],
          benefits: "Improved counter efficiency enhances customer satisfaction, increases productivity, and reduces operational bottlenecks.",
          translations: {
            en: {
              text: "How long does it typically take to process and fulfill a standard parts counter request?",
              description: "Measure time from customer request to parts in hand",
              scaleLabels: [">10 min", "6-10 min", "3-5 min", "1-2 min", "<1 min"]
            },
            de: {
              text: "Wie lange dauert es typischerweise, eine Standard-Teilethekennanfrage zu bearbeiten und zu erfüllen?",
              description: "Messen Sie die Zeit von der Kundenanfrage bis zu den Teilen in der Hand",
              scaleLabels: [">10 Min", "6-10 Min", "3-5 Min", "1-2 Min", "<1 Min"]
            }
          }
        },
        {
          id: "pts-10",
          text: "How strong are your relationships and communication with your parts suppliers and vendors?",
          description: "Consider pricing, delivery reliability, and support quality",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["Poor", "Fair", "Good", "Very Good", "Excellent"] },
          weight: 1.1,
          category: "vendor",
          purpose: "Evaluates supply chain management effectiveness, impacting costs, availability, and service quality.",
          situationAnalysis: "Strong vendor relationships ensure better pricing, priority service, and supply chain reliability.",
          linkedKPIs: ["Supplier Performance", "Cost Management", "Supply Reliability", "Partnership Quality"],
          benefits: "Excellent vendor relationships improve pricing, ensure supply availability, and enhance overall operational effectiveness.",
          translations: {
            en: {
              text: "How strong are your relationships and communication with your parts suppliers and vendors?",
              description: "Consider pricing, delivery reliability, and support quality",
              scaleLabels: ["Poor", "Fair", "Good", "Very Good", "Excellent"]
            },
            de: {
              text: "Wie stark sind Ihre Beziehungen und Kommunikation mit Ihren Teilelieferanten und Anbietern?",
              description: "Berücksichtigen Sie Preisgestaltung, Lieferzuverlässigkeit und Supportqualität",
              scaleLabels: ["Schlecht", "Ausreichend", "Gut", "Sehr gut", "Ausgezeichnet"]
            }
          }
        }
      ]
    },
    {
      id: "financial-operations",
      title: "Financial Operations & Overall Performance",
      description: "Evaluate overall financial health, operational efficiency, and business management",
      icon: "dollar-sign",
      translations: {
        en: {
          title: "Financial Operations & Overall Performance",
          description: "Evaluate overall financial health, operational efficiency, and business management"
        },
        de: {
          title: "Finanzielle Abläufe & Gesamtleistung",
          description: "Bewerten Sie die allgemeine finanzielle Gesundheit, betriebliche Effizienz und Unternehmensführung"
        }
      },
      questions: [
        {
          id: "fin-1",
          text: "How would you describe your dealership's overall profitability trend over the past 12 months?",
          description: "Consider net profit growth, stability, or decline patterns",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["Declining", "Stable/Low", "Moderate", "Good", "Excellent"] },
          weight: 2.0,
          category: "profitability",
          purpose: "Evaluates overall business performance and sustainability, the ultimate measure of dealership success.",
          situationAnalysis: "Profitability trends indicate business health, market position effectiveness, and operational efficiency.",
          linkedKPIs: ["Net Profit Margin", "ROI", "Revenue Growth", "Operating Efficiency"],
          benefits: "Strong profitability ensures business sustainability, enables growth investments, and provides financial security.",
          translations: {
            en: {
              text: "How would you describe your dealership's overall profitability trend over the past 12 months?",
              description: "Consider net profit growth, stability, or decline patterns",
              scaleLabels: ["Declining", "Stable/Low", "Moderate", "Good", "Excellent"]
            },
            de: {
              text: "Wie würden Sie den Rentabilitätstrend Ihres Autohauses in den letzten 12 Monaten beschreiben?",
              description: "Berücksichtigen Sie Nettogewinnwachstum, Stabilität oder Rückgangsmuster",
              scaleLabels: ["Rückläufig", "Stabil/Niedrig", "Moderat", "Gut", "Ausgezeichnet"]
            }
          }
        },
        {
          id: "fin-2",
          text: "How consistent and predictable is your dealership's monthly cash flow?",
          description: "Rate the stability of cash inflows and outflows",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["Poor", "Fair", "Good", "Very Good", "Excellent"] },
          weight: 1.8,
          category: "cashflow",
          purpose: "Assesses financial management effectiveness and business stability, crucial for operational continuity.",
          situationAnalysis: "Consistent cash flow indicates effective financial management, predictable operations, and good planning.",
          linkedKPIs: ["Cash Flow Consistency", "Working Capital", "Liquidity Ratios", "Financial Stability"],
          benefits: "Stable cash flow ensures operational continuity, enables strategic investments, and reduces financial stress.",
          translations: {
            en: {
              text: "How consistent and predictable is your dealership's monthly cash flow?",
              description: "Rate the stability of cash inflows and outflows",
              scaleLabels: ["Poor", "Fair", "Good", "Very Good", "Excellent"]
            },
            de: {
              text: "Wie konsistent und vorhersehbar ist der monatliche Cashflow Ihres Autohauses?",
              description: "Bewerten Sie die Stabilität der Geldzu- und -abflüsse",
              scaleLabels: ["Schlecht", "Ausreichend", "Gut", "Sehr gut", "Ausgezeichnet"]
            }
          }
        },
        {
          id: "fin-3",
          text: "How effectively do you manage your floor plan financing to minimize interest costs?",
          description: "Consider inventory turn rate relative to floor plan terms and payment timing",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["Poor", "Fair", "Good", "Very Good", "Excellent"] },
          weight: 1.5,
          category: "floorplan",
          purpose: "Evaluates inventory financing efficiency, directly impacting profitability and cash management.",
          situationAnalysis: "Efficient floor plan management reduces interest costs and optimizes inventory investment.",
          linkedKPIs: ["Interest Cost Management", "Inventory Efficiency", "Days in Stock", "Financing Optimization"],
          benefits: "Optimized floor plan management reduces costs, improves cash flow, and maximizes inventory ROI.",
          translations: {
            en: {
              text: "How effectively do you manage your floor plan financing to minimize interest costs?",
              description: "Consider inventory turn rate relative to floor plan terms and payment timing",
              scaleLabels: ["Poor", "Fair", "Good", "Very Good", "Excellent"]
            },
            de: {
              text: "Wie effektiv verwalten Sie Ihre Bestandsfinanzierung, um Zinskosten zu minimieren?",
              description: "Berücksichtigen Sie die Umschlagshäufigkeit im Verhältnis zu den Finanzierungsbedingungen und Zahlungszeitpunkten",
              scaleLabels: ["Schlecht", "Ausreichend", "Gut", "Sehr gut", "Ausgezeichnet"]
            }
          }
        },
        {
          id: "fin-4",
          text: "How effectively does your dealership control and manage operational expenses?",
          description: "Consider cost monitoring, budget adherence, and expense reduction initiatives",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["Poor", "Fair", "Good", "Very Good", "Excellent"] },
          weight: 1.6,
          category: "costs",
          purpose: "Measures operational efficiency and expense management, crucial for maintaining profitability and competitiveness.",
          situationAnalysis: "Effective cost control ensures competitive pricing capability while maintaining service quality.",
          linkedKPIs: ["Operating Expense Ratio", "Cost Per Unit", "Expense Management", "Operational Efficiency"],
          benefits: "Superior cost control improves profitability, enables competitive pricing, and provides operational flexibility.",
          translations: {
            en: {
              text: "How effectively does your dealership control and manage operational expenses?",
              description: "Consider cost monitoring, budget adherence, and expense reduction initiatives",
              scaleLabels: ["Poor", "Fair", "Good", "Very Good", "Excellent"]
            },
            de: {
              text: "Wie effektiv kontrolliert und verwaltet Ihr Autohaus die Betriebskosten?",
              description: "Berücksichtigen Sie Kostenüberwachung, Budgeteinhaltung und Kostensenkungsinitiativen",
              scaleLabels: ["Schlecht", "Ausreichend", "Gut", "Sehr gut", "Ausgezeichnet"]
            }
          }
        },
        {
          id: "fin-5",
          text: "How does your revenue per employee compare to industry benchmarks for your market?",
          description: "Evaluate staff productivity and efficiency across all departments",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["Below industry", "At industry", "Above industry", "Well above", "Exceptional"] },
          weight: 1.4,
          category: "productivity",
          purpose: "Evaluates human resource effectiveness and operational efficiency, impacting overall business performance.",
          situationAnalysis: "High employee productivity indicates effective management, good systems, and motivated workforce.",
          linkedKPIs: ["Revenue Per Employee", "Staff Efficiency", "Productivity Index", "Human Resource ROI"],
          benefits: "Higher employee productivity improves profitability, enhances competitiveness, and creates better work environment.",
          translations: {
            en: {
              text: "How does your revenue per employee compare to industry benchmarks for your market?",
              description: "Evaluate staff productivity and efficiency across all departments",
              scaleLabels: ["Below industry", "At industry", "Above industry", "Well above", "Exceptional"]
            },
            de: {
              text: "Wie verhält sich Ihr Umsatz pro Mitarbeiter im Vergleich zu Branchenbenchmarks in Ihrem Markt?",
              description: "Bewerten Sie die Mitarbeiterproduktivität und -effizienz in allen Abteilungen",
              scaleLabels: ["Unter Branche", "Branchendurchschnitt", "Über Branche", "Weit darüber", "Außergewöhnlich"]
            }
          }
        },
        {
          id: "fin-6",
          text: "What return are you achieving on your technology and equipment investments?",
          description: "Consider DMS, CRM, service equipment, and digital marketing tools",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["Poor", "Fair", "Good", "Very Good", "Excellent"] },
          weight: 1.2,
          category: "technology",
          purpose: "Assesses technology investment effectiveness and digital transformation success, crucial for future competitiveness.",
          situationAnalysis: "Strong technology ROI indicates effective digital strategy, good vendor selection, and successful implementation.",
          linkedKPIs: ["Technology ROI", "Digital Efficiency", "System Utilization", "Innovation Index"],
          benefits: "Effective technology investment improves efficiency, enhances customer experience, and builds competitive advantage.",
          translations: {
            en: {
              text: "What return are you achieving on your technology and equipment investments?",
              description: "Consider DMS, CRM, service equipment, and digital marketing tools",
              scaleLabels: ["Poor", "Fair", "Good", "Very Good", "Excellent"]
            },
            de: {
              text: "Welche Rendite erzielen Sie bei Ihren Technologie- und Geräteinvestitionen?",
              description: "Berücksichtigen Sie DMS, CRM, Servicegeräte und digitale Marketing-Tools",
              scaleLabels: ["Schlecht", "Ausreichend", "Gut", "Sehr gut", "Ausgezeichnet"]
            }
          }
        },
        {
          id: "fin-7",
          text: "How efficiently are you utilizing your showroom floor space and service bay capacity?",
          description: "Consider revenue per square foot and bay utilization rates",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["Poor", "Fair", "Good", "Very Good", "Excellent"] },
          weight: 1.3,
          category: "facility",
          purpose: "Evaluates physical asset utilization and operational design effectiveness, impacting productivity and costs.",
          situationAnalysis: "Efficient facility utilization maximizes productivity, enhances customer experience, and optimizes space investment.",
          linkedKPIs: ["Facility Utilization Rate", "Space Productivity", "Asset Efficiency", "Layout Optimization"],
          benefits: "Optimized facility utilization improves productivity, reduces costs, and enhances customer experience.",
          translations: {
            en: {
              text: "How efficiently are you utilizing your showroom floor space and service bay capacity?",
              description: "Consider revenue per square foot and bay utilization rates",
              scaleLabels: ["Poor", "Fair", "Good", "Very Good", "Excellent"]
            },
            de: {
              text: "Wie effizient nutzen Sie Ihre Ausstellungsraumfläche und Servicebucht-Kapazität?",
              description: "Berücksichtigen Sie den Umsatz pro Quadratmeter und die Buchtauslastung",
              scaleLabels: ["Schlecht", "Ausreichend", "Gut", "Sehr gut", "Ausgezeichnet"]
            }
          }
        },
        {
          id: "fin-8",
          text: "How well do you maintain and leverage your customer database for marketing and retention?",
          description: "Consider data quality, segmentation capabilities, and utilization for targeted campaigns",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["Poor", "Fair", "Good", "Very Good", "Excellent"] },
          weight: 1.1,
          category: "data",
          purpose: "Assesses data asset quality and utilization effectiveness, crucial for customer relationship management and business intelligence.",
          situationAnalysis: "High-quality customer data enables better decision making, targeted marketing, and improved customer service.",
          linkedKPIs: ["Data Quality Index", "Customer Insights", "Marketing Effectiveness", "Business Intelligence"],
          benefits: "Valuable customer data improves marketing ROI, enhances customer relationships, and enables data-driven decision making.",
          translations: {
            en: {
              text: "How well do you maintain and leverage your customer database for marketing and retention?",
              description: "Consider data quality, segmentation capabilities, and utilization for targeted campaigns",
              scaleLabels: ["Poor", "Fair", "Good", "Very Good", "Excellent"]
            },
            de: {
              text: "Wie gut pflegen und nutzen Sie Ihre Kundendatenbank für Marketing und Kundenbindung?",
              description: "Berücksichtigen Sie Datenqualität, Segmentierungsfähigkeiten und Nutzung für zielgerichtete Kampagnen",
              scaleLabels: ["Schlecht", "Ausreichend", "Gut", "Sehr gut", "Ausgezeichnet"]
            }
          }
        }
      ]
    }
  ]
};

// Helper function to get translated question content
export function getTranslatedQuestion(question: Question, language: Language): Question {
  if (!question.translations || !question.translations[language]) {
    return question;
  }

  const translation = question.translations[language];
  return {
    ...question,
    text: translation.text || question.text,
    description: translation.description || question.description,
    purpose: translation.purpose || question.purpose,
    situationAnalysis: translation.situationAnalysis || question.situationAnalysis,
    benefits: translation.benefits || question.benefits,
    scale: question.scale ? {
      ...question.scale,
      labels: translation.scaleLabels || question.scale.labels
    } : undefined
  };
}

// Helper function to get translated section content
export function getTranslatedSection(section: Section, language: Language): Section {
  if (!section.translations || !section.translations[language]) {
    return {
      ...section,
      questions: section.questions.map(q => getTranslatedQuestion(q, language))
    };
  }

  const translation = section.translations[language];
  return {
    ...section,
    title: translation.title || section.title,
    description: translation.description || section.description,
    questions: section.questions.map(q => getTranslatedQuestion(q, language))
  };
}
