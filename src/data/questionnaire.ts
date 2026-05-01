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
          scale: { min: 1, max: 5, labels: ["<4 units/month", "4–6 units/month", "7–9 units/month", "10–12 units/month", ">12 units/month"] },
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
              scaleLabels: ["<4 units/month", "4–6 units/month", "7–9 units/month", "10–12 units/month", ">12 units/month"]
            },
            de: {
              text: "Wie viele Neuwagen verkauft Ihr Autohaus durchschnittlich pro Monat?",
              description: "Berücksichtigen Sie Ihr Verkaufsvolumen der letzten 12 Monate für eine genaue Bewertung",
              purpose: "Misst die Größe und Marktpräsenz Ihres Autohauses im Neuwagenverkauf, was direkt mit dem Umsatzpotenzial und der betrieblichen Effizienz korreliert.",
              situationAnalysis: "Höheres Volumen deutet auf eine stärkere Marktposition, besseres Bestandsmanagement und konstanteren Kundenstrom hin. Es hilft zu erkennen, ob Sie Ihre Marktchancen maximieren.",
              benefits: "Die Optimierung des Verkaufsvolumens führt zu besseren Skaleneffekten, stärkeren Herstellerbeziehungen, erhöhter Verhandlungsmacht und höherer Gesamtrentabilität.",
              scaleLabels: ["<4 Einheiten/Monat", "4–6 Einheiten/Monat", "7–9 Einheiten/Monat", "10–12 Einheiten/Monat", ">12 Einheiten/Monat"]
            }
          }
        },
        {
          id: "nvs-2",
          text: "What percentage of your sales leads successfully convert into actual vehicle purchases?",
          description: "Calculate the ratio of completed sales to total qualified leads received",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["<10%", "10–15%", "16–22%", "23–30%", ">30%"] },
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
              scaleLabels: ["<10%", "10–15%", "16–22%", "23–30%", ">30%"]
            },
            de: {
              text: "Welcher Prozentsatz Ihrer Verkaufsleads wird erfolgreich in tatsächliche Fahrzeugkäufe umgewandelt?",
              description: "Berechnen Sie das Verhältnis von abgeschlossenen Verkäufen zu den erhaltenen qualifizierten Leads",
              purpose: "Bewertet die Effektivität des Verkaufsteams und die Qualität Ihres Verkaufsprozesses von der Lead-Generierung bis zur endgültigen Kaufentscheidung.",
              situationAnalysis: "Niedrige Abschlussquoten weisen auf potenzielle Probleme bei der Verkaufsschulung, Lead-Qualität, Preisstrategie oder Kundenerfahrung hin, die sofortige Aufmerksamkeit erfordern.",
              benefits: "Die Verbesserung der Abschlussquoten erhöht direkt den Umsatz ohne zusätzliche Marketingausgaben, senkt die Kundenakquisitionskosten und maximiert den ROI Ihrer Lead-Generierungsbemühungen.",
              scaleLabels: ["<10%", "10–15%", "16–22%", "23–30%", ">30%"]
            }
          }
        },
        {
          id: "nvs-3",
          text: "How would customers rate their overall satisfaction with your new vehicle sales experience?",
          description: "Based on customer surveys, feedback forms, and post-purchase reviews",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["Very dissatisfied", "Below average", "Average", "Good", "Excellent"] },
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
              scaleLabels: ["Very dissatisfied", "Below average", "Average", "Good", "Excellent"]
            },
            de: {
              text: "Wie würden Kunden ihre Gesamtzufriedenheit mit Ihrem Neuwagenverkaufserlebnis bewerten?",
              description: "Basierend auf Kundenbefragungen, Feedback-Formularen und Bewertungen nach dem Kauf",
              purpose: "Misst die Qualität der Kundenerfahrung während des Verkaufsprozesses, die sich direkt auf Folgegeschäfte, Empfehlungen und Markenreputation auswirkt.",
              situationAnalysis: "Die Kundenzufriedenheit ist ein führender Indikator für zukünftige Verkaufsleistung, Kundenloyalität und Effektivität des Mund-zu-Mund-Marketings.",
              benefits: "Hohe Kundenzufriedenheit führt zu mehr Empfehlungen, wiederkehrenden Kunden, positiven Online-Bewertungen und reduzierten Marketingkosten durch organisches Wachstum.",
              scaleLabels: ["Sehr unzufrieden", "Unter Durchschnitt", "Durchschnittlich", "Gut", "Ausgezeichnet"]
            }
          }
        },
        {
          id: "nvs-4",
          text: "What is the average gross profit your dealership earns on each new vehicle sold?",
          description: "Calculate front-end profit after all discounts and incentives",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["Below €500 per unit", "€500-€900 per unit", "€900-€1,400 per unit", "€1,400-€2,000 per unit", "Above €2,000 per unit"] },
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
              scaleLabels: ["Below €500 per unit", "€500-€900 per unit", "€900-€1,400 per unit", "€1,400-€2,000 per unit", "Above €2,000 per unit"]
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
          scale: { min: 1, max: 5, labels: ["No standard delivery process", "Checklist exists but inconsistently followed", "Documented process followed most of the time", "Consistent structured delivery with CSI follow-up", "Best-practice delivery with digital tools and systematic follow-up"] },
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
              scaleLabels: ["No standard delivery process", "Checklist exists but inconsistently followed", "Documented process followed most of the time", "Consistent structured delivery with CSI follow-up", "Best-practice delivery with digital tools and systematic follow-up"]
            },
            de: {
              text: "Wie lange dauert es typischerweise von der ersten Kundenanfrage bis zur Fahrzeugauslieferung?",
              description: "Messen Sie die durchschnittliche Zeit vom Erstkontakt bis zur Schlüsselübergabe",
              purpose: "Bewertet die Prozesseffizienz und Qualität der Kundenerfahrung, die sich auf Kundenzufriedenheit und Wettbewerbsvorteile auswirken.",
              situationAnalysis: "Schnellere Lieferzeiten verbessern die Kundenzufriedenheit, reduzieren Geschäftsabbrüche und verbessern die Wettbewerbspositionierung auf dem Markt.",
              benefits: "Die Verkürzung der Lieferzeit erhöht die Kundenzufriedenheit, reduziert Stornierungen, verbessert den Cashflow und schafft Wettbewerbsdifferenzierung.",
              scaleLabels: ["Kein standardisierter Übergabeprozess", "Checkliste vorhanden, aber inkonsistent befolgt", "Dokumentierter Prozess meist eingehalten", "Konsistente strukturierte Übergabe mit CSI-Nachverfolgung", "Best-Practice-Übergabe mit digitalen Tools und systematischer Nachverfolgung"]
            }
          }
        },
        {
          id: "nvs-6",
          text: "What percentage of your online leads result in actual showroom visits?",
          description: "Track conversion from digital inquiry to physical dealership visit",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["No digital presence — walk-ins only", "Basic website leads handled manually >1 day response", "CRM used for online leads same-day response", "Structured digital process <2 hour response conversion tracked", "Automated routing <5 min response full funnel analytics active"] },
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
              scaleLabels: ["No digital presence — walk-ins only", "Basic website leads handled manually >1 day response", "CRM used for online leads same-day response", "Structured digital process <2 hour response conversion tracked", "Automated routing <5 min response full funnel analytics active"]
            },
            de: {
              text: "Welcher Prozentsatz Ihrer Online-Leads führt zu tatsächlichen Showroom-Besuchen?",
              description: "Verfolgen Sie die Konvertierung von digitalen Anfragen zu physischen Autohausbesuchen",
              purpose: "Misst die Wirksamkeit Ihrer digitalen Marketingstrategie und Online-Kundenbindungsfähigkeiten.",
              situationAnalysis: "Die Konvertierung digitaler Leads zeigt, wie gut Ihre Online-Präsenz und Ihr digitaler Verkaufstrichter im heutigen digitalen Markt funktionieren.",
              benefits: "Die Verbesserung der digitalen Konvertierung reduziert Marketingkosten, erhöht die Lead-Qualität und positioniert Sie vor Wettbewerbern im digitalen Bereich.",
              scaleLabels: ["Keine digitale Präsenz — nur Laufkundschaft", "Einfache Website-Leads manuell bearbeitet, >1 Tag Antwortzeit", "CRM für Online-Leads genutzt, Antwort am selben Tag", "Strukturierter digitaler Prozess, <2 Std. Antwortzeit, Konversion verfolgt", "Automatisches Routing, <5 Min. Antwortzeit, vollständige Trichteranalyse aktiv"]
            }
          }
        },
        {
          id: "nvs-7",
          text: "How frequently does your sales team receive formal training and skill development?",
          description: "Include product training, sales techniques, and customer service skills",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["No formal training in the last 12 months", "1 manufacturer-required session per year only", "2x per year structured training most staff attend", "Quarterly training schedule with mandatory attendance and tracking", "Monthly development sessions 100% attendance certifications tracked"] },
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
              scaleLabels: ["No formal training in the last 12 months", "1 manufacturer-required session per year only", "2x per year structured training most staff attend", "Quarterly training schedule with mandatory attendance and tracking", "Monthly development sessions 100% attendance certifications tracked"]
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
          scale: { min: 1, max: 5, labels: ["<70 points", "70–75 points", "76–82 points", "83–89 points", "≥90 points"] },
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
              scaleLabels: ["<70 points", "70–75 points", "76–82 points", "83–89 points", "≥90 points"]
            },
            de: {
              text: "Wie oft pro Jahr wechselt Ihr Neuwagenbestand vollständig?",
              description: "Berechnen Sie die jährlichen Verkäufe geteilt durch den durchschnittlichen Lagerwert",
              purpose: "Misst die Effizienz der Lagerverwaltung und die Genauigkeit der Bedarfsprognose, die sich direkt auf den Cashflow und die Lagerkosten auswirken.",
              situationAnalysis: "Schneller Lagerumschlag zeigt gute Bedarfsplanung, effektive Preisgestaltung und starke Verkaufsausführung.",
              benefits: "Die Optimierung des Lagerumschlags verbessert den Cashflow, reduziert Zinsaufwendungen, minimiert das Veralterungsrisiko und erhöht die Rentabilität.",
              scaleLabels: ["<70 Punkte", "70–75 Punkte", "76–82 Punkte", "83–89 Punkte", "≥90 Punkte"]
            }
          }
        },
        {
          id: "nvs-9",
          text: "What percentage of your new vehicle customers purchase finance and insurance products?",
          description: "Include loans, leases, extended warranties, and protection packages",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["No pipeline tracking", "Informal tracking", "Basic pipeline review monthly", "Structured weekly review", "Daily managed pipeline with forecast"] },
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
              scaleLabels: ["No pipeline tracking", "Informal tracking", "Basic pipeline review monthly", "Structured weekly review", "Daily managed pipeline with forecast"]
            },
            de: {
              text: "Welcher Prozentsatz Ihrer Neuwagenkunden kauft Finanz- und Versicherungsprodukte?",
              description: "Einschließlich Kredite, Leasing, erweiterte Garantien und Schutzpakete",
              purpose: "Bewertet die Wirksamkeit Ihrer F&I-Abteilung bei der Wertschöpfung und Generierung zusätzlicher Einnahmen pro Transaktion.",
              situationAnalysis: "Hohe F&I-Durchdringung zeigt starken Aufbau von Kundenbeziehungen und effektive Produktpräsentationsfähigkeiten.",
              benefits: "Die Erhöhung der F&I-Durchdringung steigert die Rentabilität pro Einheit erheblich, verbessert den Kundenschutz und schafft wiederkehrende Einnahmequellen.",
              scaleLabels: ["Kein Pipeline-Tracking", "Informelles Tracking", "Monatliche Pipeline-Überprüfung", "Strukturiertes wöchentliches Review", "Täglich geführte Pipeline mit Prognose"]
            }
          }
        },
        {
          id: "nvs-10",
          text: "How effectively does your team utilize the CRM system for lead management and follow-up?",
          description: "Consider data entry consistency, follow-up automation, and reporting usage",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["CRM not used or <30% of leads logged", "Basic logging only 30-60% of interactions recorded", "Most leads logged limited automation used", "Consistent use automated follow-ups active weekly reports reviewed", "Full adoption all touchpoints logged pipeline managed reporting drives decisions"] },
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
              scaleLabels: ["CRM not used or <30% of leads logged", "Basic logging only 30-60% of interactions recorded", "Most leads logged limited automation used", "Consistent use automated follow-ups active weekly reports reviewed", "Full adoption all touchpoints logged pipeline managed reporting drives decisions"]
            },
            de: {
              text: "Wie effektiv nutzt Ihr Team das CRM-System für Lead-Management und Nachverfolgung?",
              description: "Berücksichtigen Sie Dateneingabekonsistenz, Follow-up-Automatisierung und Berichtsnutzung",
              purpose: "Bewertet die Fähigkeit Ihres Teams, Technologie für das Kundenbeziehungsmanagement und die Optimierung des Verkaufsprozesses zu nutzen.",
              situationAnalysis: "Effektive CRM-Nutzung zeigt einen systematischen Ansatz für das Kundenmanagement, verbesserte Follow-up-Prozesse und datengesteuerte Entscheidungsfindung.",
              benefits: "Bessere CRM-Nutzung verbessert die Lead-Konvertierung, stärkt Kundenbeziehungen, erhöht das Folgegeschäft und liefert wertvolle Erkenntnisse für Wachstum.",
              scaleLabels: ["Kein CRM, <30% erfasst", "30–60% erfasst, keine Auto.", "Meiste erfasst, kaum Auto.", "Konst. Nutzung, Auto-Follow-ups", "Volle Adoption, Pipeline-Mgmt."]
            }
          }
        },
        {
          id: "nvs-11",
          text: "How quickly and consistently does your team engage with incoming sales enquiries across all channels?",
          description: "Consider phone, email, website form, and third-party listing leads during and outside business hours",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["No process — leads handled when convenient", "Most leads contacted within a working day", "2-hour response target during business hours, tracked inconsistently", "<1-hour response with CRM routing, tracked weekly", "<15-min auto-acknowledgement + <30-min personal follow-up, 95%+ SLA tracked daily"] },
          weight: 1.4,
          category: "conversion",
          purpose: "Lead response speed is one of the highest-impact conversion levers in automotive retail — every hour of delay reduces contact and conversion probability materially.",
          situationAnalysis: "Dealerships that respond within 30 minutes are significantly more likely to convert a lead than those who wait hours. This question surfaces the actual operating standard, not just stated intent.",
          linkedKPIs: ["Lead Response Time", "Lead Conversion Rate", "Cost Per Acquisition", "Digital Channel Performance"],
          benefits: "Systematic fast response compresses the sales cycle, reduces lead leakage to competitors, and improves ROI on every marketing pound spent.",
          translations: {
            en: {
              text: "How quickly and consistently does your team engage with incoming sales enquiries across all channels?",
              description: "Consider phone, email, website form, and third-party listing leads during and outside business hours",
              purpose: "Lead response speed is one of the highest-impact conversion levers in automotive retail — every hour of delay reduces contact and conversion probability materially.",
              situationAnalysis: "Dealerships that respond within 30 minutes are significantly more likely to convert a lead than those who wait hours. This question surfaces the actual operating standard, not just stated intent.",
              benefits: "Systematic fast response compresses the sales cycle, reduces lead leakage to competitors, and improves ROI on every marketing pound spent.",
              scaleLabels: ["No process — leads handled when convenient", "Most leads contacted within a working day", "2-hour response target during business hours, tracked inconsistently", "<1-hour response with CRM routing, tracked weekly", "<15-min auto-acknowledgement + <30-min personal follow-up, 95%+ SLA tracked daily"]
            },
            de: {
              text: "Wie schnell und konsistent reagiert Ihr Team auf eingehende Verkaufsanfragen über alle Kanäle?",
              description: "Berücksichtigen Sie Telefon, E-Mail, Website-Formulare und Drittanbieter-Inserate innerhalb und außerhalb der Geschäftszeiten",
              purpose: "Die Lead-Reaktionszeit ist einer der wirkungsstärksten Konversionshebel im Automobilhandel — jede Stunde Verzögerung senkt die Kontakt- und Konversionswahrscheinlichkeit erheblich.",
              situationAnalysis: "Autohäuser, die innerhalb von 30 Minuten antworten, konvertieren Leads signifikant häufiger als solche, die Stunden warten. Diese Frage zeigt den tatsächlichen Betriebsstandard.",
              benefits: "Systematisch schnelle Reaktion verkürzt den Verkaufszyklus, reduziert Lead-Verluste an Wettbewerber und verbessert den ROI jedes ausgegebenen Marketingeuro.",
              scaleLabels: ["Kein Prozess, Leads werden nach Gelegenheit bearbeitet", "Meiste Leads innerhalb eines Arbeitstages kontaktiert", "2-Std.-Ziel während Öffnungszeiten, inkonsistent verfolgt", "<1 Std. mit CRM-Routing, wöchentlich getrackt", "<15 Min. Auto-Bestätigung + <30 Min. persönliche Antwort, 95%+ SLA täglich"]
            }
          }
        },
        {
          id: "nvs-12",
          text: "On average, how many new vehicle sales does each active sales consultant close per month?",
          description: "Divide total monthly new vehicle units sold by the number of active salespeople carrying a target",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["<3 units/consultant/month", "3–4 units/consultant/month", "5–6 units/consultant/month", "7–9 units/consultant/month", "≥10 units/consultant/month"] },
          weight: 1.3,
          category: "productivity",
          purpose: "Sales output per consultant is a direct measure of individual productivity, team sizing, and whether coaching and process support are translating into results.",
          situationAnalysis: "Low units per consultant often signals over-staffing relative to demand, weak closing technique, poor lead allocation, or insufficient management coaching — all addressable with the right interventions.",
          linkedKPIs: ["Units Per Sales Executive", "Sales Productivity Index", "Revenue Per Headcount", "Staffing Efficiency"],
          benefits: "Optimising consultant productivity improves margin per sale, allows leaner staffing models, and pinpoints exactly where coaching investment will yield the fastest return.",
          translations: {
            en: {
              text: "On average, how many new vehicle sales does each active sales consultant close per month?",
              description: "Divide total monthly new vehicle units sold by the number of active salespeople carrying a target",
              purpose: "Sales output per consultant is a direct measure of individual productivity, team sizing, and whether coaching and process support are translating into results.",
              situationAnalysis: "Low units per consultant often signals over-staffing relative to demand, weak closing technique, poor lead allocation, or insufficient management coaching — all addressable with the right interventions.",
              benefits: "Optimising consultant productivity improves margin per sale, allows leaner staffing models, and pinpoints exactly where coaching investment will yield the fastest return.",
              scaleLabels: ["<3 units/consultant/month", "3–4 units/consultant/month", "5–6 units/consultant/month", "7–9 units/consultant/month", "≥10 units/consultant/month"]
            },
            de: {
              text: "Wie viele Neuwagenverkäufe schließt jeder aktive Verkaufsberater durchschnittlich pro Monat ab?",
              description: "Teilen Sie die monatlich verkauften Neufahrzeuge durch die Anzahl aktiver Verkäufer mit Zielvereinbarung",
              purpose: "Der Verkaufsoutput pro Berater ist ein direktes Maß für individuelle Produktivität, Teamgröße und ob Coaching und Prozessunterstützung in Ergebnisse umgewandelt werden.",
              situationAnalysis: "Niedrige Einheiten pro Berater signalisieren oft Überbesetzung, schwache Abschlusstechnik, schlechte Lead-Zuteilung oder unzureichendes Coaching — alles mit gezielten Maßnahmen behebbar.",
              benefits: "Die Optimierung der Beraterproduktivität verbessert die Marge pro Verkauf, ermöglicht schlankere Personalmodelle und zeigt genau, wo Coaching-Investitionen den schnellsten Return liefern.",
              scaleLabels: ["<3 Einh./Berater/Monat", "3–4 Einh./Berater/Monat", "5–6 Einh./Berater/Monat", "7–9 Einh./Berater/Monat", "≥10 Einh./Berater/Monat"]
            }
          }
        },
        {
          id: "nvs-13",
          text: "How stable has your sales team composition been over the past 12 months?",
          description: "Think about voluntary departures, dismissals, and how long your current team has been in their roles",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["High churn — more than half the team has changed in 12 months", "Significant churn — 3 or more departures this year", "Moderate — 1–2 departures replaced with similar experience levels", "Stable — minimal departures, most staff tenure >18 months", "Very stable — core team unchanged 2+ years, structured succession in place"] },
          weight: 1.2,
          category: "retention",
          purpose: "Staff stability is a leading indicator of culture, compensation competitiveness, and management quality — and directly predicts future sales consistency and customer experience scores.",
          situationAnalysis: "High sales team turnover destroys institutional knowledge, inflates recruitment and training costs, disrupts customer relationships, and suppresses volume during ramp-up periods for new hires.",
          linkedKPIs: ["Staff Turnover Rate", "Employee Retention Rate", "Recruitment Cost Per Hire", "Sales Consistency Index"],
          benefits: "Stable teams close more, retain more customers, deliver better satisfaction scores, and cost significantly less to maintain than high-churn environments.",
          translations: {
            en: {
              text: "How stable has your sales team composition been over the past 12 months?",
              description: "Think about voluntary departures, dismissals, and how long your current team has been in their roles",
              purpose: "Staff stability is a leading indicator of culture, compensation competitiveness, and management quality — and directly predicts future sales consistency and customer experience scores.",
              situationAnalysis: "High sales team turnover destroys institutional knowledge, inflates recruitment and training costs, disrupts customer relationships, and suppresses volume during ramp-up periods for new hires.",
              benefits: "Stable teams close more, retain more customers, deliver better satisfaction scores, and cost significantly less to maintain than high-churn environments.",
              scaleLabels: ["High churn — more than half the team has changed in 12 months", "Significant churn — 3 or more departures this year", "Moderate — 1–2 departures replaced with similar experience levels", "Stable — minimal departures, most staff tenure >18 months", "Very stable — core team unchanged 2+ years, structured succession in place"]
            },
            de: {
              text: "Wie stabil war Ihre Verkaufsteamzusammensetzung in den letzten 12 Monaten?",
              description: "Denken Sie an freiwillige Abgänge, Entlassungen und wie lange Ihr aktuelles Team in seinen Rollen ist",
              purpose: "Teamstabilität ist ein Frühindikator für Unternehmenskultur, Vergütungswettbewerbsfähigkeit und Managementqualität und sagt zukünftige Verkaufskonsistenz direkt voraus.",
              situationAnalysis: "Hohe Fluktuation im Verkaufsteam zerstört institutionelles Wissen, erhöht Rekrutierungs- und Schulungskosten, unterbricht Kundenbeziehungen und unterdrückt das Volumen in Einarbeitungsphasen.",
              benefits: "Stabile Teams schließen mehr ab, binden mehr Kunden, erzielen bessere Zufriedenheitswerte und sind deutlich kostengünstiger zu halten als Hochfluktuationsumgebungen.",
              scaleLabels: ["Hohe Fluktuation — mehr als die Hälfte des Teams in 12 Monaten gewechselt", "Erhebliche Fluktuation — 3 oder mehr Abgänge dieses Jahr", "Moderat — 1–2 Abgänge, mit ähnlichem Erfahrungsniveau ersetzt", "Stabil — minimale Abgänge, Betriebszugehörigkeit meist >18 Monate", "Sehr stabil — Kernteam seit 2+ Jahren unverändert, Nachfolgeplanung vorhanden"]
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
          scale: { min: 1, max: 5, labels: [">90 days avg", "61–90 days", "46–60 days", "31–45 days", "≤30 days avg"] },
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
              scaleLabels: [">90 days avg", "61–90 days", "46–60 days", "31–45 days", "≤30 days avg"]
            },
            de: {
              text: "Wie viele Tage verbleiben Gebrauchtwagen durchschnittlich in Ihrem Bestand, bevor sie verkauft werden?",
              description: "Berechnen Sie die durchschnittlichen Tage vom Ankauf bis zum Verkaufsabschluss",
              scaleLabels: [">90 Tage Ø", "61–90 Tage", "46–60 Tage", "31–45 Tage", "≤30 Tage Ø"]
            }
          }
        },
        {
          id: "uvs-2",
          text: "What is the average gross profit margin your dealership achieves on used vehicle sales?",
          description: "Calculate the profit per unit after reconditioning and acquisition costs",
          type: "scale",
          scale: { min: 1, max: 5, labels: [">14 days avg", "11–14 days", "8–10 days", "5–7 days", "≤4 days avg"] },
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
              scaleLabels: [">14 days avg", "11–14 days", "8–10 days", "5–7 days", "≤4 days avg"]
            },
            de: {
              text: "Welche durchschnittliche Bruttogewinnmarge erzielt Ihr Autohaus beim Gebrauchtwagenverkauf?",
              description: "Berechnen Sie den Gewinn pro Einheit nach Aufbereitungs- und Anschaffungskosten",
              scaleLabels: [">14 Tage Ø", "11–14 Tage", "8–10 Tage", "5–7 Tage", "≤4 Tage Ø"]
            }
          }
        },
        {
          id: "uvs-3",
          text: "How accurate are your initial trade-in valuations compared to the final selling prices achieved?",
          description: "Measure the consistency between appraisal values and actual sale outcomes",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["More than 21 days reconditioning time", "15-21 days", "10-14 days", "6-9 days", "Under 5 days — best-in-class reconditioning pipeline"] },
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
              scaleLabels: ["More than 21 days reconditioning time", "15-21 days", "10-14 days", "6-9 days", "Under 5 days — best-in-class reconditioning pipeline"]
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
          scale: { min: 1, max: 5, labels: ["<30%", "30–40%", "41–55%", "56–70%", ">70%"] },
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
              scaleLabels: ["<30%", "30–40%", "41–55%", "56–70%", ">70%"]
            },
            de: {
              text: "Was sind Ihre durchschnittlichen Kosten pro Fahrzeug für die Aufbereitung und Verkaufsvorbereitung von Gebrauchtwagen?",
              description: "Einschließlich mechanischer Reparaturen, Aufbereitung und kosmetischer Verbesserungen",
              scaleLabels: ["<30%", "30–40%", "41–55%", "56–70%", ">70%"]
            }
          }
        },
        {
          id: "uvs-5",
          text: "How would you rate the quality and effectiveness of your online used vehicle listings?",
          description: "Consider photo quality, description accuracy, pricing transparency, and response time",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["<10%", "10–20%", "21–35%", "36–50%", ">50%"] },
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
              scaleLabels: ["<10%", "10–20%", "21–35%", "36–50%", ">50%"]
            },
            de: {
              text: "Wie würden Sie die Qualität und Wirksamkeit Ihrer Online-Gebrauchtwagen-Inserate bewerten?",
              description: "Berücksichtigen Sie Fotoqualität, Beschreibungsgenauigkeit, Preistransparenz und Reaktionszeit",
              scaleLabels: ["<10%", "10–20%", "21–35%", "36–50%", ">50%"]
            }
          }
        },
        {
          id: "uvs-6",
          text: "What percentage of vehicles you purchase at auctions turn out to be profitable after resale?",
          description: "Track which auction purchases result in positive margins",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["<€500", "€500–€800", "€801–€1,100", "€1,101–€1,500", ">€1,500"] },
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
              scaleLabels: ["<€500", "€500–€800", "€801–€1,100", "€1,101–€1,500", ">€1,500"]
            },
            de: {
              text: "Welcher Prozentsatz der von Ihnen auf Auktionen gekauften Fahrzeuge erweist sich nach dem Weiterverkauf als profitabel?",
              description: "Verfolgen Sie, welche Auktionskäufe zu positiven Margen führen",
              scaleLabels: ["<500 €", "500–800 €", "801–1.100 €", "1.101–1.500 €", ">1.500 €"]
            }
          }
        },
        {
          id: "uvs-7",
          text: "How do customers rate their overall satisfaction with your used vehicle purchase experience?",
          description: "Based on post-purchase surveys and feedback within 30 days of sale",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["Very dissatisfied", "Below average", "Average", "Good", "Excellent"] },
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
              scaleLabels: ["Very dissatisfied", "Below average", "Average", "Good", "Excellent"]
            },
            de: {
              text: "Wie bewerten Kunden ihre Gesamtzufriedenheit mit Ihrem Gebrauchtwagenkauferlebnis?",
              description: "Basierend auf Umfragen und Feedback nach dem Kauf innerhalb von 30 Tagen nach dem Verkauf",
              scaleLabels: ["Sehr unzufrieden", "Unter Durchschnitt", "Durchschnittlich", "Gut", "Ausgezeichnet"]
            }
          }
        },
        {
          id: "uvs-8",
          text: "What percentage of used vehicle buyers purchase extended warranties or service contracts?",
          description: "Include all protection products offered at point of sale",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["100% auction dependent", "Mainly auction, some trade-in", "Balanced auction and trade-in", "Trade-in dominant, selective auction", "Diversified: trade-in, fleet, direct buy"] },
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
              scaleLabels: ["100% auction dependent", "Mainly auction, some trade-in", "Balanced auction and trade-in", "Trade-in dominant, selective auction", "Diversified: trade-in, fleet, direct buy"]
            },
            de: {
              text: "Welcher Prozentsatz der Gebrauchtwagenkäufer erwirbt erweiterte Garantien oder Serviceverträge?",
              description: "Einschließlich aller am Verkaufsort angebotenen Schutzprodukte",
              scaleLabels: ["100% Auktionsabhängig", "Vorw. Auktion, etwas Inzahlungnahme", "Ausgewogene Mischung", "Inzahlungnahme dominant, selektive Auktion", "Diversifiziert: Inzahlung, Flotte, Direktkauf"]
            }
          }
        },
        {
          id: "uvs-9",
          text: "How does your used vehicle pricing compare to similar vehicles in your local market?",
          description: "Consider pricing relative to competitors within a 50-mile radius",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["No digital presence", "Basic listing only", "Multi-platform with photos", "Targeted campaigns with data", "Full digital funnel with retargeting"] },
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
              scaleLabels: ["No digital presence", "Basic listing only", "Multi-platform with photos", "Targeted campaigns with data", "Full digital funnel with retargeting"]
            },
            de: {
              text: "Wie vergleicht sich Ihre Gebrauchtwagenpreisgestaltung mit ähnlichen Fahrzeugen in Ihrem lokalen Markt?",
              description: "Berücksichtigen Sie die Preisgestaltung im Vergleich zu Wettbewerbern im Umkreis von 80 km",
              scaleLabels: ["Keine digitale Präsenz", "Nur Basis-Listing", "Multi-Plattform mit Fotos", "Gezielte Kampagnen mit Daten", "Vollständiger digitaler Funnel mit Retargeting"]
            }
          }
        },
        {
          id: "uvs-10",
          text: "How effective is your strategy for managing vehicles that remain unsold for more than 60 days?",
          description: "Describe your aged inventory reduction approach and pricing adjustments",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["No process — vehicles age without intervention", "Ad-hoc price cuts only when pressure builds", "30-day review trigger with basic price adjustment", "Structured 21-day review targeted marketing 45-day exit rule", "Real-time tracking with automated price adjustments and proactive disposal strategy"] },
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
              scaleLabels: ["No process — vehicles age without intervention", "Ad-hoc price cuts only when pressure builds", "30-day review trigger with basic price adjustment", "Structured 21-day review targeted marketing 45-day exit rule", "Real-time tracking with automated price adjustments and proactive disposal strategy"]
            },
            de: {
              text: "Wie effektiv ist Ihre Strategie zur Verwaltung von Fahrzeugen, die länger als 60 Tage unverkauft bleiben?",
              description: "Beschreiben Sie Ihren Ansatz zur Reduzierung alter Bestände und Preisanpassungen",
              scaleLabels: ["Kein Prozess, Fahrzeuge altern", "Reaktiv, nur Preissenkungen", "30-Tage-Prüfung, Basisanpassung", "21-Tage-Prüfung, 45-Tage-Regel", "Echtzeit-Tracking, Auto-Preisanpassung"]
            }
          }
        },
        {
          id: "uvs-11",
          text: "When customers buy a new vehicle from you, how often do they trade in their existing car with the dealership rather than selling it privately?",
          description: "Estimate the proportion of new vehicle transactions that also include an in-house trade-in appraisal and acquisition",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["Rarely offered — customers directed elsewhere or sell privately", "Offered occasionally, <25% of buyers trade in with us", "Captured in 25–40% of new vehicle deals", "Structured appraisal presented on every deal, 41–60% capture rate", "Appraisal embedded in sales process, >60% of buyers trade in with us"] },
          weight: 1.3,
          category: "sourcing",
          purpose: "Trade-in capture rate is both a used vehicle sourcing KPI and a customer retention signal — lost trade-ins represent lost gross profit, lost used vehicle stock, and a weakened customer relationship.",
          situationAnalysis: "Dealers who embed appraisals into every new vehicle conversation secure cheaper, better-conditioned stock than auction alternatives while retaining the customer across both transactions.",
          linkedKPIs: ["Trade-In Capture Rate", "Used Vehicle Sourcing Mix", "Gross Per Used Vehicle", "Customer Retention Rate"],
          benefits: "Higher trade-in capture improves used vehicle margin (vs auction cost), secures known-history stock, and deepens the customer relationship across multiple departments.",
          translations: {
            en: {
              text: "When customers buy a new vehicle from you, how often do they trade in their existing car with the dealership rather than selling it privately?",
              description: "Estimate the proportion of new vehicle transactions that also include an in-house trade-in appraisal and acquisition",
              purpose: "Trade-in capture rate is both a used vehicle sourcing KPI and a customer retention signal — lost trade-ins represent lost gross profit, lost used vehicle stock, and a weakened customer relationship.",
              situationAnalysis: "Dealers who embed appraisals into every new vehicle conversation secure cheaper, better-conditioned stock than auction alternatives while retaining the customer across both transactions.",
              benefits: "Higher trade-in capture improves used vehicle margin (vs auction cost), secures known-history stock, and deepens the customer relationship across multiple departments.",
              scaleLabels: ["Rarely offered — customers directed elsewhere or sell privately", "Offered occasionally, <25% of buyers trade in with us", "Captured in 25–40% of new vehicle deals", "Structured appraisal presented on every deal, 41–60% capture rate", "Appraisal embedded in sales process, >60% of buyers trade in with us"]
            },
            de: {
              text: "Wenn Kunden ein Neuwagen kaufen, wie häufig tauschen sie ihr Fahrzeug beim Autohaus ein statt es privat zu verkaufen?",
              description: "Schätzen Sie den Anteil der Neuwagengeschäfte, bei denen auch eine Inzahlungnahme-Bewertung im Haus stattfindet",
              purpose: "Die Inzahlungnahmequote ist sowohl ein Gebrauchtwagen-Beschaffungs-KPI als auch ein Kundenbindungssignal — verlorene Inzahlungnahmen bedeuten verlorenen Bruttogewinn und schwächere Kundenbeziehungen.",
              situationAnalysis: "Händler, die Bewertungen in jedes Neuwagenverkaufsgespräch einbetten, sichern sich günstigere, besser gepflegte Fahrzeuge als Auktionsalternativen und binden den Kunden über beide Transaktionen.",
              benefits: "Höhere Inzahlungnahmequote verbessert die Gebrauchtwagenmargen, sichert Fahrzeuge mit bekannter Historie und vertieft die Kundenbeziehung über mehrere Abteilungen.",
              scaleLabels: ["Selten angeboten — Kunden werden anderswo hingewiesen", "Gelegentlich angeboten, <25% tauschen ein", "25–40% der Neuwagengeschäfte mit Inzahlungnahme", "Strukturierte Bewertung bei jedem Geschäft, 41–60% Quote", "Bewertung in Verkaufsprozess integriert, >60% tauschen ein"]
            }
          }
        },
        {
          id: "uvs-12",
          text: "How does your current used vehicle stock level relate to the number of units you typically sell per month?",
          description: "Consider whether your stocking policy and current inventory depth are well-matched to your actual sales rate",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["No stock policy — we sell whatever happens to be available", "Reactive — stock fluctuates significantly month to month with no target", "Rough target exists but stock-to-sales ratio often drifts above 75 days' supply", "Managed to a 45–60 day supply target, reviewed monthly", "Actively managed to a 30–45 day supply, reviewed weekly with real-time market data"] },
          weight: 1.2,
          category: "inventory",
          purpose: "Stock-to-sales ratio governs cash deployment efficiency, carrying cost exposure, and whether the business has the right depth to support consistent sales without over-investing in ageing units.",
          situationAnalysis: "Both under- and over-stocking destroy profitability — the former through lost sales and the latter through interest costs, depreciation, and discounted clearance. A disciplined supply target is a key operational discipline.",
          linkedKPIs: ["Stock-to-Sales Ratio", "Days Supply", "Carrying Cost Per Unit", "Working Capital Efficiency"],
          benefits: "Maintaining a disciplined stock-to-sales ratio reduces floor plan costs, minimises aged stock risk, and ensures consistent availability without capital over-commitment.",
          translations: {
            en: {
              text: "How does your current used vehicle stock level relate to the number of units you typically sell per month?",
              description: "Consider whether your stocking policy and current inventory depth are well-matched to your actual sales rate",
              purpose: "Stock-to-sales ratio governs cash deployment efficiency, carrying cost exposure, and whether the business has the right depth to support consistent sales without over-investing in ageing units.",
              situationAnalysis: "Both under- and over-stocking destroy profitability — the former through lost sales and the latter through interest costs, depreciation, and discounted clearance. A disciplined supply target is a key operational discipline.",
              benefits: "Maintaining a disciplined stock-to-sales ratio reduces floor plan costs, minimises aged stock risk, and ensures consistent availability without capital over-commitment.",
              scaleLabels: ["No stock policy — we sell whatever happens to be available", "Reactive — stock fluctuates significantly month to month with no target", "Rough target exists but stock-to-sales ratio often drifts above 75 days' supply", "Managed to a 45–60 day supply target, reviewed monthly", "Actively managed to a 30–45 day supply, reviewed weekly with real-time market data"]
            },
            de: {
              text: "Wie verhält sich Ihr aktueller Gebrauchtwagenbestand zur Anzahl der Einheiten, die Sie typischerweise pro Monat verkaufen?",
              description: "Überlegen Sie, ob Ihre Lagerpolitik und aktuelle Bestandstiefe gut zu Ihrer tatsächlichen Verkaufsrate passen",
              purpose: "Das Bestands-zu-Verkaufs-Verhältnis steuert die Kapitaleffizienz, Lagerkosten und ob das Unternehmen die richtige Tiefe für konsistente Verkäufe ohne Überinvestition in alternde Einheiten hat.",
              situationAnalysis: "Sowohl Unter- als auch Überbevorratung zerstören die Rentabilität — ersteres durch verlorene Verkäufe, letzteres durch Zinskosten, Wertverlust und Abverkauf mit Rabatt.",
              benefits: "Ein diszipliniertes Bestands-zu-Verkaufs-Verhältnis reduziert Finanzierungskosten, minimiert das Altbestandsrisiko und sichert konsistente Verfügbarkeit ohne Kapitalüberengagement.",
              scaleLabels: ["Keine Lagerpolitik — wir verkaufen was verfügbar ist", "Reaktiv — Bestand schwankt stark ohne Ziel", "Grob-Ziel vorhanden, aber oft >75 Tage Vorrat", "Auf 45–60 Tage Vorrat gesteuert, monatlich überprüft", "Aktiv auf 30–45 Tage gesteuert, wöchentlich mit Echtzeit-Marktdaten überprüft"]
            }
          }
        },
        {
          id: "uvs-13",
          text: "How would you describe the experience level and specialist knowledge of the people managing your used vehicle operation?",
          description: "Think about your used car manager's tenure, market knowledge, and how independently the function operates",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["No dedicated used car manager — handled by new car team", "Used car function managed as a secondary responsibility by an existing manager", "Dedicated used car manager, but relatively new (<2 years in role)", "Experienced used car manager (2–5 years in role) with clear pricing and sourcing process", "Specialist used car leadership with 5+ years' experience, own P&L accountability, and market intelligence tools"] },
          weight: 1.1,
          category: "retention",
          purpose: "Specialist expertise in used vehicles is one of the strongest predictors of used vehicle gross performance — experienced managers appraise better, source cheaper, and price more accurately than generalists.",
          situationAnalysis: "Used vehicle profitability is disproportionately manager-dependent because margins are determined deal-by-deal through appraisal, sourcing, and pricing decisions that require deep market knowledge.",
          linkedKPIs: ["Gross Per Used Vehicle", "Appraisal Accuracy Rate", "Stock Sourcing Efficiency", "Staff Expertise Index"],
          benefits: "Investing in specialist used vehicle management pays back rapidly through improved appraisal accuracy, better buying, tighter inventory control, and higher per-unit gross.",
          translations: {
            en: {
              text: "How would you describe the experience level and specialist knowledge of the people managing your used vehicle operation?",
              description: "Think about your used car manager's tenure, market knowledge, and how independently the function operates",
              purpose: "Specialist expertise in used vehicles is one of the strongest predictors of used vehicle gross performance — experienced managers appraise better, source cheaper, and price more accurately than generalists.",
              situationAnalysis: "Used vehicle profitability is disproportionately manager-dependent because margins are determined deal-by-deal through appraisal, sourcing, and pricing decisions that require deep market knowledge.",
              benefits: "Investing in specialist used vehicle management pays back rapidly through improved appraisal accuracy, better buying, tighter inventory control, and higher per-unit gross.",
              scaleLabels: ["No dedicated used car manager — handled by new car team", "Used car function managed as a secondary responsibility by an existing manager", "Dedicated used car manager, but relatively new (<2 years in role)", "Experienced used car manager (2–5 years in role) with clear pricing and sourcing process", "Specialist used car leadership with 5+ years' experience, own P&L accountability, and market intelligence tools"]
            },
            de: {
              text: "Wie würden Sie das Erfahrungsniveau und Spezialwissen der Personen beschreiben, die Ihr Gebrauchtwagengeschäft leiten?",
              description: "Denken Sie an die Amtszeit Ihres Gebrauchtwagenmanagers, Marktkenntnisse und wie eigenständig die Funktion arbeitet",
              purpose: "Spezialkenntnisse im Gebrauchtwagenbereich sind einer der stärksten Prädiktoren für Gebrauchtwagenbrutto-Leistung — erfahrene Manager bewerten, beschaffen und preisen genauer.",
              situationAnalysis: "Gebrauchtwagen-Rentabilität ist überproportional managerabhängig, da Margen deal-für-deal durch Bewertungs-, Beschaffungs- und Preisentscheidungen bestimmt werden, die tiefes Marktwissen erfordern.",
              benefits: "Investitionen in spezialisiertes Gebrauchtwagenmanagement zahlen sich schnell durch verbesserte Bewertungsgenauigkeit, bessere Einkäufe, engere Bestandskontrolle und höheres Einheitenbrutto aus.",
              scaleLabels: ["Kein dedizierter Gebrauchtwagenmanager — vom Neuwagenteam gehandhabt", "Gebrauchtwagenfunktion als Nebenaufgabe eines bestehenden Managers", "Dedizierter Gebrauchtwagenmanager, aber relativ neu (<2 Jahre)", "Erfahrener Manager (2–5 Jahre) mit klarem Preis- und Beschaffungsprozess", "Spezialist mit 5+ Jahren Erfahrung, eigener P&L-Verantwortung und Markt-Intelligence-Tools"]
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
          scale: { min: 1, max: 5, labels: ["<60%", "60–70%", "71–80%", "81–89%", "≥90%"] },
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
              scaleLabels: ["<60%", "60–70%", "71–80%", "81–89%", "≥90%"]
            },
            de: {
              text: "Welcher Prozentsatz der verfügbaren Stunden Ihrer Techniker wird für abrechenbare, produktive Arbeit aufgewendet?",
              description: "Berechnen Sie produktive Arbeitsstunden geteilt durch die gesamten verfügbaren Stunden",
              scaleLabels: ["<60%", "60–70%", "71–80%", "81–89%", "≥90%"]
            }
          }
        },
        {
          id: "svc-2",
          text: "What percentage of your posted labor rate do you actually realize on customer-pay work?",
          description: "Compare effective labor rate to your posted door rate",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["<75%", "75–80%", "81–86%", "87–92%", ">92%"] },
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
              scaleLabels: ["<75%", "75–80%", "81–86%", "87–92%", ">92%"]
            },
            de: {
              text: "Welchen Prozentsatz Ihres veröffentlichten Arbeitssatzes realisieren Sie tatsächlich bei Kundenarbeiten?",
              description: "Vergleichen Sie den effektiven Arbeitssatz mit Ihrem veröffentlichten Stundensatz",
              scaleLabels: ["<75%", "75–80%", "81–86%", "87–92%", ">92%"]
            }
          }
        },
        {
          id: "svc-3",
          text: "How soon can customers typically get an appointment for routine service at your dealership?",
          description: "Measure average wait time from request to available appointment slot",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["Below €150 ARO", "€150-€220 ARO below benchmark", "€220-€300 ARO at European average", "€300-€400 ARO above average", "Above €400 ARO active multi-point inspection process"] },
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
              scaleLabels: ["Below €150 ARO", "€150-€220 ARO below benchmark", "€220-€300 ARO at European average", "€300-€400 ARO above average", "Above €400 ARO active multi-point inspection process"]
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
          scale: { min: 1, max: 5, labels: ["<10%", "10–18%", "19–27%", "28–36%", ">36%"] },
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
              scaleLabels: ["<10%", "10–18%", "19–27%", "28–36%", ">36%"]
            },
            de: {
              text: "Welcher Prozentsatz der Reparaturen wird beim ersten Besuch korrekt abgeschlossen, ohne dass eine Rückkehr erforderlich ist?",
              description: "Verfolgen Sie Rückkehrer und wiederholte Reparaturen für dasselbe Problem",
              scaleLabels: ["<10%", "10–18%", "19–27%", "28–36%", ">36%"]
            }
          }
        },
        {
          id: "svc-5",
          text: "How do customers rate their overall experience with your service department?",
          description: "Based on post-service surveys and satisfaction ratings",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["Very dissatisfied", "Below average", "Average", "Good", "Excellent"] },
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
              scaleLabels: ["Very dissatisfied", "Below average", "Average", "Good", "Excellent"]
            },
            de: {
              text: "Wie bewerten Kunden ihre Gesamterfahrung mit Ihrer Serviceabteilung?",
              description: "Basierend auf Umfragen und Zufriedenheitsbewertungen nach dem Service",
              scaleLabels: ["Sehr unzufrieden", "Unter Durchschnitt", "Durchschnittlich", "Gut", "Ausgezeichnet"]
            }
          }
        },
        {
          id: "svc-6",
          text: "What percentage of your warranty claims are successfully approved and reimbursed by the manufacturer?",
          description: "Track warranty claim submission success rate",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["<45%", "45–55%", "56–65%", "66–75%", ">75%"] },
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
              scaleLabels: ["<45%", "45–55%", "56–65%", "66–75%", ">75%"]
            },
            de: {
              text: "Welcher Prozentsatz Ihrer Garantieansprüche wird erfolgreich genehmigt und vom Hersteller erstattet?",
              description: "Verfolgen Sie die Erfolgsquote bei der Einreichung von Garantieansprüchen",
              scaleLabels: ["<45%", "45–55%", "56–65%", "66–75%", ">75%"]
            }
          }
        },
        {
          id: "svc-7",
          text: "What percentage of your technicians hold current ASE certifications or equivalent manufacturer credentials?",
          description: "Count certified technicians as a percentage of total technical staff",
          type: "scale",
          scale: { min: 1, max: 5, labels: [">10 days avg", "7–10 days", "4–6 days", "2–3 days", "Next-day availability"] },
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
              scaleLabels: [">10 days avg", "7–10 days", "4–6 days", "2–3 days", "Next-day availability"]
            },
            de: {
              text: "Welcher Prozentsatz Ihrer Techniker verfügt über aktuelle ASE-Zertifizierungen oder gleichwertige Herstellerzertifikate?",
              description: "Zählen Sie zertifizierte Techniker als Prozentsatz des gesamten technischen Personals",
              scaleLabels: [">10 Tage Ø", "7–10 Tage", "4–6 Tage", "2–3 Tage", "Verfügbarkeit am nächsten Tag"]
            }
          }
        },
        {
          id: "svc-8",
          text: "What percentage of your service customers return for additional service within 12 months?",
          description: "Track repeat customer visits excluding warranty-required service",
          type: "scale",
          scale: { min: 1, max: 5, labels: [">8%", "6–8%", "4–5%", "2–3%", "<2%"] },
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
              scaleLabels: [">8%", "6–8%", "4–5%", "2–3%", "<2%"]
            },
            de: {
              text: "Welcher Prozentsatz Ihrer Servicekunden kehrt innerhalb von 12 Monaten für zusätzlichen Service zurück?",
              description: "Verfolgen Sie wiederholte Kundenbesuche ohne garantiebedingte Services",
              scaleLabels: [">8%", "6–8%", "4–5%", "2–3%", "<2%"]
            }
          }
        },
        {
          id: "svc-9",
          text: "When a technician needs a part, how often is it immediately available in your parts inventory?",
          description: "Track parts availability for service work orders",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["No mobility offer", "<20% of bookings", "20–40% of bookings", "41–65% of bookings", ">65% of bookings"] },
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
              scaleLabels: ["No mobility offer", "<20% of bookings", "20–40% of bookings", "41–65% of bookings", ">65% of bookings"]
            },
            de: {
              text: "Wenn ein Techniker ein Teil benötigt, wie oft ist es sofort in Ihrem Teilelager verfügbar?",
              description: "Verfolgen Sie die Teileverfügbarkeit für Service-Arbeitsaufträge",
              scaleLabels: ["Kein Mobilitätsangebot", "<20% der Buchungen", "20–40% der Buchungen", "41–65% der Buchungen", ">65% der Buchungen"]
            }
          }
        },
        {
          id: "svc-10",
          text: "How effectively do you use digital tools to keep customers informed about their vehicle's service status?",
          description: "Include text updates, service videos, digital inspections, and online payment",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["No digital communication — phone calls only", "Email updates on request only", "Proactive SMS/email status updates on job completion", "Digital inspection reports with photos online payment available", "Full digital journey — video inspection status tracker online payment follow-up survey"] },
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
              scaleLabels: ["No digital communication — phone calls only", "Email updates on request only", "Proactive SMS/email status updates on job completion", "Digital inspection reports with photos online payment available", "Full digital journey — video inspection status tracker online payment follow-up survey"]
            },
            de: {
              text: "Wie effektiv nutzen Sie digitale Tools, um Kunden über den Servicestatus ihres Fahrzeugs zu informieren?",
              description: "Einschließlich SMS-Updates, Service-Videos, digitale Inspektionen und Online-Zahlung",
              scaleLabels: ["Keine digitale Kommunikation — nur Telefonanrufe", "E-Mail-Updates nur auf Anfrage", "Proaktive SMS/E-Mail-Updates bei Fertigstellung", "Digitale Inspektionsberichte mit Fotos, Online-Zahlung verfügbar", "Vollständige digitale Reise — Video-Inspektion, Status-Tracker, Online-Zahlung, Nachverfolgungsumfrage"]
            }
          }
        },
        {
          id: "svc-11",
          text: "How many repair orders does each service advisor typically process per day?",
          description: "Calculate average daily RO count per advisor",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["Under 6 ROs per advisor per day", "6-8 ROs per day below benchmark", "9-11 ROs per day at European benchmark", "12-14 ROs per day above average", "15+ ROs per day high-efficiency operation with DMS workflow support"] },
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
              scaleLabels: ["Under 6 ROs per advisor per day", "6-8 ROs per day below benchmark", "9-11 ROs per day at European benchmark", "12-14 ROs per day above average", "15+ ROs per day high-efficiency operation with DMS workflow support"]
            },
            de: {
              text: "Wie viele Reparaturaufträge bearbeitet jeder Serviceberater typischerweise pro Tag?",
              description: "Berechnen Sie die durchschnittliche tägliche RO-Anzahl pro Berater",
              scaleLabels: ["Unter 6 ROs pro Berater pro Tag", "6-8 ROs pro Tag — unter Benchmark", "9-11 ROs pro Tag — europäischer Benchmark", "12-14 ROs pro Tag — überdurchschnittlich", "15+ ROs pro Tag — Hochleistungsbetrieb mit DMS-Workflow-Unterstützung"]
            }
          }
        },
        {
          id: "svc-12",
          text: "How would you rate the efficiency and throughput of your express or quick service lane?",
          description: "Consider wait times, service speed, and customer satisfaction for quick service",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["No digital process", "Email updates only", "SMS updates on request", "Proactive SMS/app updates", "Full digital journey with video"] },
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
              scaleLabels: ["No digital process", "Email updates only", "SMS updates on request", "Proactive SMS/app updates", "Full digital journey with video"]
            },
            de: {
              text: "Wie würden Sie die Effizienz und den Durchsatz Ihrer Express- oder Schnellservice-Spur bewerten?",
              description: "Berücksichtigen Sie Wartezeiten, Servicegeschwindigkeit und Kundenzufriedenheit für Schnellservice",
              scaleLabels: ["Kein digitaler Prozess", "Nur E-Mail-Updates", "SMS-Updates auf Anfrage", "Proaktive SMS/App-Updates", "Vollständige digitale Journey mit Video"]
            }
          }
        },
        {
          id: "svc-13",
          text: "How often do vehicles return to your service department within 30 days for the same reported fault?",
          description: "Think about repair comebacks — cases where the original repair did not resolve the customer's complaint",
          type: "scale",
          scale: { min: 1, max: 5, labels: [">8% of repairs result in a comeback — no tracking in place", "5–8% comeback rate, reviewed informally", "3–5% comeback rate, root causes discussed in team meetings", "1–3% comeback rate, technician-level tracking and structured review", "<1% comeback rate, first-time fix tracked daily and embedded in technician KPIs"] },
          weight: 1.4,
          category: "quality",
          purpose: "First-time fix rate (inverse of comeback rate) is the primary quality metric for a service department — it directly drives customer trust, workshop efficiency, and warranty cost exposure.",
          situationAnalysis: "Every comeback consumes a bay slot, a technician's time, and a service advisor's capacity while delivering zero revenue and damaging customer confidence. A single repeat repair can cost 3–5× the original job in hidden operational cost.",
          linkedKPIs: ["First Time Fix Rate", "Repair Comeback Rate", "Customer Satisfaction Score", "Workshop Efficiency"],
          benefits: "Reducing comebacks frees bay capacity without adding headcount, protects CSI scores, reduces warranty exposure, and is one of the most cost-effective improvements available in fixed operations.",
          translations: {
            en: {
              text: "How often do vehicles return to your service department within 30 days for the same reported fault?",
              description: "Think about repair comebacks — cases where the original repair did not resolve the customer's complaint",
              purpose: "First-time fix rate (inverse of comeback rate) is the primary quality metric for a service department — it directly drives customer trust, workshop efficiency, and warranty cost exposure.",
              situationAnalysis: "Every comeback consumes a bay slot, a technician's time, and a service advisor's capacity while delivering zero revenue and damaging customer confidence. A single repeat repair can cost 3–5× the original job in hidden operational cost.",
              benefits: "Reducing comebacks frees bay capacity without adding headcount, protects CSI scores, reduces warranty exposure, and is one of the most cost-effective improvements available in fixed operations.",
              scaleLabels: [">8% of repairs result in a comeback — no tracking in place", "5–8% comeback rate, reviewed informally", "3–5% comeback rate, root causes discussed in team meetings", "1–3% comeback rate, technician-level tracking and structured review", "<1% comeback rate, first-time fix tracked daily and embedded in technician KPIs"]
            },
            de: {
              text: "Wie häufig kehren Fahrzeuge innerhalb von 30 Tagen wegen desselben gemeldeten Fehlers in Ihre Serviceabteilung zurück?",
              description: "Denken Sie an Reparatur-Rückkehrer — Fälle, bei denen die ursprüngliche Reparatur die Beschwerde des Kunden nicht behoben hat",
              purpose: "Die First-Time-Fix-Rate (Umkehrung der Comeback-Rate) ist die primäre Qualitätsmetrik für eine Serviceabteilung und treibt direkt Kundenvertrauen, Werkstattffizienz und Garantiekostenexposition.",
              situationAnalysis: "Jeder Rückkehrer verbraucht einen Stellplatz, die Zeit eines Technikers und die Kapazität eines Serviceberaters bei null Umsatz und Schädigung des Kundenvertrauens. Eine einzelne Wiederholungsreparatur kann 3–5-fach die ursprünglichen Kosten in versteckten Betriebskosten verursachen.",
              benefits: "Die Reduzierung von Rückkehrern gibt Hallenkapazität frei ohne zusätzliches Personal, schützt CSI-Scores, reduziert Garantieexposition und ist eine der kosteneffektivsten Verbesserungen im Fixed Operations-Bereich.",
              scaleLabels: [">8% der Reparaturen führen zu Rückkehrern — kein Tracking", "5–8% Comeback-Rate, informell überprüft", "3–5% Comeback-Rate, Ursachen in Teammeetings", "1–3% Comeback-Rate, Techniker-Tracking und strukturierte Überprüfung", "<1% Comeback-Rate, täglich getrackt und in Techniker-KPIs eingebettet"]
            }
          }
        },
        {
          id: "svc-14",
          text: "When a service advisor recommends additional work or maintenance items beyond what a customer originally booked for, how often do customers approve that work?",
          description: "Consider all upsell and additional repair recommendations made at the point of vehicle check-in or mid-service",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["We rarely make recommendations beyond the booked service", "Recommendations made ad-hoc, approval rate not tracked", "Recommendations made consistently but approval rate below 20%", "Structured menu-based recommendations, 20–35% approval rate tracked monthly", "Consultative value-led recommendations with photo/video evidence, >35% approval rate tracked per advisor"] },
          weight: 1.3,
          category: "productivity",
          purpose: "Service advisor recommendation approval rate captures both the quality of needs-presentation skills and the trust customers place in your service team — it is the primary lever for growing labour revenue per visit without increasing vehicle count.",
          situationAnalysis: "Customers often arrive unaware of developing maintenance needs. A confident, evidence-based presentation (e.g. tyre tread video, brake wear photo) converts significantly better than verbal-only recommendations — and is a trainable, measurable skill.",
          linkedKPIs: ["Service Advisor Upsell Rate", "Labour Revenue Per Repair Order", "Additional Work Approval Rate", "Workshop Revenue Yield"],
          benefits: "A 10-percentage-point improvement in approval rate typically adds 8–15% to total service revenue with zero increase in marketing spend or customer count.",
          translations: {
            en: {
              text: "When a service advisor recommends additional work or maintenance items beyond what a customer originally booked for, how often do customers approve that work?",
              description: "Consider all upsell and additional repair recommendations made at the point of vehicle check-in or mid-service",
              purpose: "Service advisor recommendation approval rate captures both the quality of needs-presentation skills and the trust customers place in your service team — it is the primary lever for growing labour revenue per visit without increasing vehicle count.",
              situationAnalysis: "Customers often arrive unaware of developing maintenance needs. A confident, evidence-based presentation (e.g. tyre tread video, brake wear photo) converts significantly better than verbal-only recommendations — and is a trainable, measurable skill.",
              benefits: "A 10-percentage-point improvement in approval rate typically adds 8–15% to total service revenue with zero increase in marketing spend or customer count.",
              scaleLabels: ["We rarely make recommendations beyond the booked service", "Recommendations made ad-hoc, approval rate not tracked", "Recommendations made consistently but approval rate below 20%", "Structured menu-based recommendations, 20–35% approval rate tracked monthly", "Consultative value-led recommendations with photo/video evidence, >35% approval rate tracked per advisor"]
            },
            de: {
              text: "Wenn ein Serviceberater zusätzliche Arbeiten oder Wartungspunkte über das ursprünglich gebuchte hinaus empfiehlt, wie oft stimmen Kunden diesen Arbeiten zu?",
              description: "Berücksichtigen Sie alle Upsell- und Zusatzreparaturempfehlungen beim Fahrzeug-Check-in oder während des Services",
              purpose: "Die Genehmigungsrate für Serviceberater-Empfehlungen erfasst die Qualität der Bedarfspräsentationsfähigkeiten und das Vertrauen der Kunden — der primäre Hebel für wachsende Arbeitserlöse pro Besuch ohne Erhöhung der Fahrzeugzahl.",
              situationAnalysis: "Kunden kommen oft unwissend über sich entwickelnde Wartungsbedürfnisse. Eine selbstbewusste, evidenzbasierte Präsentation (z.B. Reifenprofil-Video, Bremsenverschleiß-Foto) konvertiert deutlich besser als nur verbale Empfehlungen — eine trainierbare, messbare Fähigkeit.",
              benefits: "Eine Verbesserung der Genehmigungsrate um 10 Prozentpunkte fügt typischerweise 8–15% zum Gesamtserviceumsatz hinzu ohne Erhöhung von Marketing oder Kundenzahl.",
              scaleLabels: ["Wir machen selten Empfehlungen über den gebuchten Service hinaus", "Ad-hoc Empfehlungen, Genehmigungsrate nicht verfolgt", "Konsistente Empfehlungen, aber Genehmigungsrate unter 20%", "Menübasierte Empfehlungen, 20–35% Genehmigungsrate monatlich", "Beratende wertbasierte Empfehlungen mit Foto/Video, >35% pro Berater verfolgt"]
            }
          }
        },
        {
          id: "svc-15",
          text: "Of the customers who bought a vehicle from you in the last two years, what proportion regularly return to your workshop for servicing?",
          description: "Think about vehicle owners who could service with you but choose a competitor, an independent, or not at all",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["No visibility — we don't track this", "We believe <30% return, but no active retention programme", "Roughly 30–50% service retention, occasional reminder campaigns", "50–70% service retention with structured service plan or reminder programme", ">70% service retention, active loyalty programme, service plan penetration >40%"] },
          weight: 1.5,
          category: "retention",
          purpose: "Service retention from vehicle sales is one of the most critical long-term revenue metrics in automotive — a retained service customer generates 2–4× the lifetime value of a sales-only customer.",
          situationAnalysis: "Every vehicle sold but not retained in service represents lost parts margin, lost labour revenue, lost repeat purchase influence, and lost visibility into the customer's next buying cycle. Retention is typically highest in the first 12 months after purchase — the window where investment matters most.",
          linkedKPIs: ["Service Retention Rate", "Customer Lifetime Value", "Service Plan Penetration", "Fixed Operations Revenue"],
          benefits: "Each percentage point improvement in service retention translates directly to recurring fixed operations revenue, higher customer lifetime value, and stronger influencing position for the next vehicle purchase.",
          translations: {
            en: {
              text: "Of the customers who bought a vehicle from you in the last two years, what proportion regularly return to your workshop for servicing?",
              description: "Think about vehicle owners who could service with you but choose a competitor, an independent, or not at all",
              purpose: "Service retention from vehicle sales is one of the most critical long-term revenue metrics in automotive — a retained service customer generates 2–4× the lifetime value of a sales-only customer.",
              situationAnalysis: "Every vehicle sold but not retained in service represents lost parts margin, lost labour revenue, lost repeat purchase influence, and lost visibility into the customer's next buying cycle. Retention is typically highest in the first 12 months after purchase — the window where investment matters most.",
              benefits: "Each percentage point improvement in service retention translates directly to recurring fixed operations revenue, higher customer lifetime value, and stronger influencing position for the next vehicle purchase.",
              scaleLabels: ["No visibility — we don't track this", "We believe <30% return, but no active retention programme", "Roughly 30–50% service retention, occasional reminder campaigns", "50–70% service retention with structured service plan or reminder programme", ">70% service retention, active loyalty programme, service plan penetration >40%"]
            },
            de: {
              text: "Von den Kunden, die in den letzten zwei Jahren ein Fahrzeug bei Ihnen gekauft haben, welcher Anteil kehrt regelmäßig für die Wartung in Ihre Werkstatt zurück?",
              description: "Denken Sie an Fahrzeugeigentümer, die bei Ihnen warten könnten, aber einen Wettbewerber, einen Freien oder niemanden wählen",
              purpose: "Servicebindung aus Fahrzeugverkäufen ist eine der kritischsten langfristigen Umsatzmetriken — ein gebundener Servicekunde generiert 2–4-fachen Lifetime Value gegenüber einem reinen Verkaufskunden.",
              situationAnalysis: "Jedes verkaufte, aber nicht im Service gebundene Fahrzeug bedeutet verlorene Teile- und Arbeitsumsätze, verlorenen Kaufeinfluss und fehlende Sichtbarkeit für den nächsten Kaufzyklus. Bindung ist typischerweise in den ersten 12 Monaten nach dem Kauf am höchsten.",
              benefits: "Jeder Prozentpunkt Verbesserung der Servicebindung übersetzt sich direkt in wiederkehrende Fixed-Operations-Umsätze, höheren Customer Lifetime Value und stärkere Kaufeinflussposition.",
              scaleLabels: ["Keine Sichtbarkeit — wir tracken das nicht", "Wir glauben <30% kehren zurück, kein aktives Bindungsprogramm", "Ca. 30–50% Servicebindung, gelegentliche Erinnerungskampagnen", "50–70% Bindung mit strukturiertem Serviceplan oder Erinnerungsprogramm", ">70% Bindung, aktives Loyalitätsprogramm, Serviceplan-Penetration >40%"]
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
          scale: { min: 1, max: 5, labels: ["<80%", "80–85%", "86–90%", "91–95%", ">95%"] },
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
              scaleLabels: ["<80%", "80–85%", "86–90%", "91–95%", ">95%"]
            },
            de: {
              text: "Wie oft pro Jahr wechselt Ihr gesamter Teilebestand durch Verkäufe?",
              description: "Berechnen Sie die jährlichen Teileverkäufe geteilt durch den durchschnittlichen Lagerwert",
              scaleLabels: ["<80%", "80–85%", "86–90%", "91–95%", ">95%"]
            }
          }
        },
        {
          id: "pts-2",
          text: "What percentage of parts requests can you fulfill immediately from your on-hand stock?",
          description: "Track first-time fill rate for both customer and internal service requests",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["<4× per year", "4–5× per year", "6–7× per year", "8–9× per year", "≥10× per year"] },
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
              scaleLabels: ["<4× per year", "4–5× per year", "6–7× per year", "8–9× per year", "≥10× per year"]
            },
            de: {
              text: "Welchen Prozentsatz der Teileanfragen können Sie sofort aus Ihrem Lagerbestand erfüllen?",
              description: "Verfolgen Sie die Ersterfüllungsrate für Kunden- und interne Serviceanfragen",
              scaleLabels: ["<4× pro Jahr", "4–5× pro Jahr", "6–7× pro Jahr", "8–9× pro Jahr", "≥10× pro Jahr"]
            }
          }
        },
        {
          id: "pts-3",
          text: "What is the average gross profit margin you achieve on parts sales across all channels?",
          description: "Calculate total parts gross profit as a percentage of parts revenue",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["No daily order", "3–4× per week", "5× per week, informal", "Daily, structured process", "Daily with auto-replenishment"] },
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
              scaleLabels: ["No daily order", "3–4× per week", "5× per week, informal", "Daily, structured process", "Daily with auto-replenishment"]
            },
            de: {
              text: "Wie hoch ist die durchschnittliche Bruttogewinnmarge, die Sie bei Teileverkäufen über alle Kanäle erzielen?",
              description: "Berechnen Sie den gesamten Teile-Bruttogewinn als Prozentsatz des Teileumsatzes",
              scaleLabels: ["Keine tägliche Bestellung", "3–4× pro Woche", "5× pro Woche, informell", "Täglich, strukturierter Prozess", "Täglich mit automatischer Nachbestellung"]
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
          scale: { min: 1, max: 5, labels: ["<5% wholesale share", "5-10% wholesale", "11-20% wholesale", "21-30% wholesale", ">30% wholesale"] },
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
              scaleLabels: ["<5% wholesale share", "5-10% wholesale", "11-20% wholesale", "21-30% wholesale", ">30% wholesale"]
            },
            de: {
              text: "Wie würden Sie Ihren Erfolg beim Verkauf von Teilen an externe Kunden wie freie Werkstätten bewerten?",
              description: "Bewerten Sie Ihr Großhandels- und Einzelhandelsteilegeschäft außerhalb des internen Service",
              scaleLabels: ["<5% Großhandel-Anteil", "5–10% Großhandel", "11–20% Großhandel", "21–30% Großhandel", ">30% Großhandel"]
            }
          }
        },
        {
          id: "pts-7",
          text: "What percentage of parts sold are returned due to ordering errors or incorrect parts?",
          description: "Track return rate attributed to dealership mistakes",
          type: "scale",
          scale: { min: 1, max: 5, labels: [">6%", "4–6%", "2–3%", "1–2%", "<1%"] },
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
              scaleLabels: [">6%", "4–6%", "2–3%", "1–2%", "<1%"]
            },
            de: {
              text: "Welcher Prozentsatz der verkauften Teile wird aufgrund von Bestellfehlern oder falschen Teilen zurückgegeben?",
              description: "Verfolgen Sie die Rückgabequote, die auf Fehler des Autohauses zurückzuführen ist",
              scaleLabels: [">6%", "4–6%", "2–3%", "1–2%", "<1%"]
            }
          }
        },
        {
          id: "pts-8",
          text: "How effectively can you source and obtain urgently needed parts that are not in stock?",
          description: "Rate your emergency sourcing capabilities for critical customer needs",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["No VOR process", "Ad hoc escalation", "Identified but no SLA", "SLA defined, inconsistent", "Formal VOR SLA <4h, tracked"] },
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
              scaleLabels: ["No VOR process", "Ad hoc escalation", "Identified but no SLA", "SLA defined, inconsistent", "Formal VOR SLA <4h, tracked"]
            },
            de: {
              text: "Wie effektiv können Sie dringend benötigte Teile beschaffen, die nicht auf Lager sind?",
              description: "Bewerten Sie Ihre Notfallbeschaffungsfähigkeiten für kritische Kundenbedürfnisse",
              scaleLabels: ["Kein VOR-Prozess", "Ad-hoc-Eskalation", "Identifiziert, kein SLA", "SLA definiert, inkonsistent", "Formaler VOR-SLA <4h, nachverfolgt"]
            }
          }
        },
        {
          id: "pts-9",
          text: "How long does it typically take to process and fulfill a standard parts counter request?",
          description: "Measure time from customer request to parts in hand",
          type: "scale",
          scale: { min: 1, max: 5, labels: [">60 min avg", "45–60 min", "30–44 min", "15–29 min", "<15 min avg"] },
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
              scaleLabels: [">60 min avg", "45–60 min", "30–44 min", "15–29 min", "<15 min avg"]
            },
            de: {
              text: "Wie lange dauert es typischerweise, eine Standard-Teilethekennanfrage zu bearbeiten und zu erfüllen?",
              description: "Messen Sie die Zeit von der Kundenanfrage bis zu den Teilen in der Hand",
              scaleLabels: [">60 Min. Ø", "45–60 Min.", "30–44 Min.", "15–29 Min.", "<15 Min. Ø"]
            }
          }
        },
        {
          id: "pts-10",
          text: "How strong are your relationships and communication with your parts suppliers and vendors?",
          description: "Consider pricing, delivery reliability, and support quality",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["No pricing control", "Informal discounting", "Partial list price adherence", "Structured pricing, some exceptions", "Full list price discipline with approval workflow"] },
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
              scaleLabels: ["No pricing control", "Informal discounting", "Partial list price adherence", "Structured pricing, some exceptions", "Full list price discipline with approval workflow"]
            },
            de: {
              text: "Wie stark sind Ihre Beziehungen und Kommunikation mit Ihren Teilelieferanten und Anbietern?",
              description: "Berücksichtigen Sie Preisgestaltung, Lieferzuverlässigkeit und Supportqualität",
              scaleLabels: ["Keine Preiskontrolle", "Informelle Rabatte", "Teilweise Listenpreiseinhaltung", "Strukturierte Preise, Ausnahmen möglich", "Volle Listenpreisdisziplin mit Genehmigungsworkflow"]
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
          scale: { min: 1, max: 5, labels: ["Net profit declining more than 20% versus prior year", "Declining 0-20% or breakeven no recovery plan in place", "Stable net profit 1-2% net margin", "Growing net profit 2-4% net margin", "Net profit above 4% and improving year-on-year"] },
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
              scaleLabels: ["Net profit declining more than 20% versus prior year", "Declining 0-20% or breakeven no recovery plan in place", "Stable net profit 1-2% net margin", "Growing net profit 2-4% net margin", "Net profit above 4% and improving year-on-year"]
            },
            de: {
              text: "Wie würden Sie den Rentabilitätstrend Ihres Autohauses in den letzten 12 Monaten beschreiben?",
              description: "Berücksichtigen Sie Nettogewinnwachstum, Stabilität oder Rückgangsmuster",
              scaleLabels: ["Nettoverlust >20% ggü. VJ", "Rückgang 0–20%, kein Plan", "Stabil, 1–2% Nettomarge", "Wachsend, 2–4% Marge", ">4% Nettomarge, steigend"]
            }
          }
        },
        {
          id: "fin-2",
          text: "How consistent and predictable is your dealership's monthly cash flow?",
          description: "Rate the stability of cash inflows and outflows",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["Regular cash shortfalls — payroll or supplier payments at risk", "Tight cash position — managed but little headroom", "Adequate cash flow, monthly obligations met comfortably", "Healthy position with 45+ days of operating reserves", "Strong liquidity with formal treasury management and investment buffer"] },
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
              scaleLabels: ["Regular cash shortfalls — payroll or supplier payments at risk", "Tight cash position — managed but little headroom", "Adequate cash flow, monthly obligations met comfortably", "Healthy position with 45+ days of operating reserves", "Strong liquidity with formal treasury management and investment buffer"]
            },
            de: {
              text: "Wie konsistent und vorhersehbar ist der monatliche Cashflow Ihres Autohauses?",
              description: "Bewerten Sie die Stabilität der Geldzu- und -abflüsse",
              scaleLabels: ["Engpässe, Löhne gefährdet", "Angespannt, wenig Puffer", "Ausreichend, Ziele erfüllt", ">45 Tage Betriebsreserven", "Stark, Investitionspuffer"]
            }
          }
        },
        {
          id: "fin-3",
          text: "How effectively do you manage your floor plan financing to minimize interest costs?",
          description: "Consider inventory turn rate relative to floor plan terms and payment timing",
          type: "scale",
          scale: { min: 1, max: 5, labels: [">75 days", "61–75 days", "46–60 days", "31–45 days", "≤30 days"] },
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
              scaleLabels: [">75 days", "61–75 days", "46–60 days", "31–45 days", "≤30 days"]
            },
            de: {
              text: "Wie effektiv verwalten Sie Ihre Bestandsfinanzierung, um Zinskosten zu minimieren?",
              description: "Berücksichtigen Sie die Umschlagshäufigkeit im Verhältnis zu den Finanzierungsbedingungen und Zahlungszeitpunkten",
              scaleLabels: [">75 Tage", "61–75 Tage", "46–60 Tage", "31–45 Tage", "≤30 Tage"]
            }
          }
        },
        {
          id: "fin-4",
          text: "How effectively does your dealership control and manage operational expenses?",
          description: "Consider cost monitoring, budget adherence, and expense reduction initiatives",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["<60%", "60–70%", "71–80%", "81–94%", "≥95%"] },
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
              scaleLabels: ["<60%", "60–70%", "71–80%", "81–94%", "≥95%"]
            },
            de: {
              text: "Wie effektiv kontrolliert und verwaltet Ihr Autohaus die Betriebskosten?",
              description: "Berücksichtigen Sie Kostenüberwachung, Budgeteinhaltung und Kostensenkungsinitiativen",
              scaleLabels: ["<60%", "60–70%", "71–80%", "81–94%", "≥95%"]
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
          scale: { min: 1, max: 5, labels: ["<0.5%", "0.5–1%", "1.1–1.8%", "1.9–2.5%", ">2.5%"] },
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
              scaleLabels: ["<0.5%", "0.5–1%", "1.1–1.8%", "1.9–2.5%", ">2.5%"]
            },
            de: {
              text: "Welche Rendite erzielen Sie bei Ihren Technologie- und Geräteinvestitionen?",
              description: "Berücksichtigen Sie DMS, CRM, Servicegeräte und digitale Marketing-Tools",
              scaleLabels: ["<0,5%", "0,5–1%", "1,1–1,8%", "1,9–2,5%", ">2,5%"]
            }
          }
        },
        {
          id: "fin-7",
          text: "How efficiently are you utilizing your showroom floor space and service bay capacity?",
          description: "Consider revenue per square foot and bay utilization rates",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["<50% of target", "50–65%", "66–79%", "80–94%", "≥95%"] },
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
              scaleLabels: ["<50% of target", "50–65%", "66–79%", "80–94%", "≥95%"]
            },
            de: {
              text: "Wie effizient nutzen Sie Ihre Ausstellungsraumfläche und Servicebucht-Kapazität?",
              description: "Berücksichtigen Sie den Umsatz pro Quadratmeter und die Buchtauslastung",
              scaleLabels: ["<50% des Ziels", "50–65%", "66–79%", "80–94%", "≥95%"]
            }
          }
        },
        {
          id: "fin-8",
          text: "How well do you maintain and leverage your customer database for marketing and retention?",
          description: "Consider data quality, segmentation capabilities, and utilization for targeted campaigns",
          type: "scale",
          scale: { min: 1, max: 5, labels: [">30 days avg", "21–30 days", "14–20 days", "8–13 days", "≤7 days avg"] },
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
              scaleLabels: [">30 days avg", "21–30 days", "14–20 days", "8–13 days", "≤7 days avg"]
            },
            de: {
              text: "Wie gut pflegen und nutzen Sie Ihre Kundendatenbank für Marketing und Kundenbindung?",
              description: "Berücksichtigen Sie Datenqualität, Segmentierungsfähigkeiten und Nutzung für zielgerichtete Kampagnen",
              scaleLabels: [">30 Tage Ø", "21–30 Tage", "14–20 Tage", "8–13 Tage", "≤7 Tage Ø"]
            }
          }
        },
        {
          id: "fin-9",
          text: "To what extent does the gross profit generated by your service and parts departments cover the total fixed overhead of your dealership?",
          description: "Think about whether fixed operations alone could sustain the business if vehicle sales had a poor month — without relying on variable sales gross",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["Fixed ops covers <40% of overhead — heavily dependent on vehicle sales gross", "40–55% absorption — vulnerable to any sales downturn", "56–70% absorption — partially buffered but still exposed to sales volatility", "71–85% absorption — strong fixed ops base providing meaningful protection", ">85% absorption — fixed ops effectively self-fund the business; vehicle sales are pure profit"] },
          weight: 1.5,
          category: "profitability",
          purpose: "Fixed absorption rate is the single most important structural health indicator for a dealership — it measures whether the business model is genuinely resilient or structurally dependent on vehicle sales margin to survive.",
          situationAnalysis: "Dealerships with high fixed absorption weather economic downturns, supply disruptions, and margin compression far better than those reliant on variable vehicle gross. OEM programmes and financial institutions use this ratio to assess dealer viability.",
          linkedKPIs: ["Fixed Absorption Rate", "Fixed Operations Gross Profit", "Overhead Coverage Ratio", "Dealership Resilience Index"],
          benefits: "Every percentage point of absorption improvement represents direct overhead coverage that reduces the volume of vehicle sales needed to break even — materially de-risking the entire business.",
          translations: {
            en: {
              text: "To what extent does the gross profit generated by your service and parts departments cover the total fixed overhead of your dealership?",
              description: "Think about whether fixed operations alone could sustain the business if vehicle sales had a poor month — without relying on variable sales gross",
              purpose: "Fixed absorption rate is the single most important structural health indicator for a dealership — it measures whether the business model is genuinely resilient or structurally dependent on vehicle sales margin to survive.",
              situationAnalysis: "Dealerships with high fixed absorption weather economic downturns, supply disruptions, and margin compression far better than those reliant on variable vehicle gross. OEM programmes and financial institutions use this ratio to assess dealer viability.",
              benefits: "Every percentage point of absorption improvement represents direct overhead coverage that reduces the volume of vehicle sales needed to break even — materially de-risking the entire business.",
              scaleLabels: ["Fixed ops covers <40% of overhead — heavily dependent on vehicle sales gross", "40–55% absorption — vulnerable to any sales downturn", "56–70% absorption — partially buffered but still exposed to sales volatility", "71–85% absorption — strong fixed ops base providing meaningful protection", ">85% absorption — fixed ops effectively self-fund the business; vehicle sales are pure profit"]
            },
            de: {
              text: "In welchem Ausmaß deckt der Bruttogewinn Ihrer Service- und Teileabteilungen die gesamten Fixkosten Ihres Autohauses?",
              description: "Überlegen Sie, ob Fixed Operations allein das Geschäft aufrechterhalten könnten, wenn der Fahrzeugverkauf einen schlechten Monat hätte — ohne auf variablen Verkaufsbrutto angewiesen zu sein",
              purpose: "Die Fixed-Absorption-Rate ist der einzeln wichtigste strukturelle Gesundheitsindikator für ein Autohaus — sie misst, ob das Geschäftsmodell wirklich widerstandsfähig oder strukturell abhängig von Fahrzeugverkaufsmargen ist.",
              situationAnalysis: "Autohäuser mit hoher Fixed Absorption überstehen wirtschaftliche Abschwünge, Versorgungsunterbrechungen und Margenkompression weit besser als solche, die auf variablen Fahrzeugbrutto angewiesen sind.",
              benefits: "Jeder Prozentpunkt Verbesserung der Absorption stellt direkte Gemeinkostendeckung dar, die das nötige Fahrzeugverkaufsvolumen zur Gewinnzone reduziert — das Gesamtrisiko materiell verringernd.",
              scaleLabels: ["Fixed Ops deckt <40% der Gemeinkosten — stark abhängig von Fahrzeugverkauf", "40–55% Absorption — anfällig bei Absatzschwächen", "56–70% Absorption — teilweise gepuffert, aber noch exponiert", "71–85% Absorption — starke Fixed-Ops-Basis mit bedeutendem Schutz", ">85% Absorption — Fixed Ops finanzieren das Geschäft effektiv selbst"]
            }
          }
        },
        {
          id: "fin-10",
          text: "How structured and consistent is the way your dealership reviews individual staff performance and links it to development and compensation?",
          description: "Consider whether targets are clear, reviews happen on schedule, and outcomes actually influence pay, coaching, or role progression",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["No formal review process — performance discussed informally or not at all", "Annual appraisal only, limited connection to pay or development", "Semi-annual reviews with basic targets, some link to variable pay", "Quarterly structured reviews with clear KPIs, variable pay tied to results, development plans in place", "Monthly 1:1 KPI reviews + quarterly appraisals, full variable pay alignment, personal development plans actively managed"] },
          weight: 1.3,
          category: "efficiency",
          purpose: "Performance management cadence is a staff KPI proxy that predicts retention, productivity output, and the dealership's ability to improve through people — the single variable that differentiates consistently high-performing dealerships.",
          situationAnalysis: "Dealerships without structured performance management cannot diagnose whether underperformance is a skill, will, or process issue. Without clear targets and regular feedback, even capable staff drift, and top performers leave for environments that recognise them.",
          linkedKPIs: ["Staff Performance Index", "Employee Retention Rate", "Variable Pay Alignment", "Management Effectiveness Score"],
          benefits: "Structured performance management improves productivity without headcount increases, reduces turnover through recognition and development clarity, and creates the management infrastructure needed to scale consistently.",
          translations: {
            en: {
              text: "How structured and consistent is the way your dealership reviews individual staff performance and links it to development and compensation?",
              description: "Consider whether targets are clear, reviews happen on schedule, and outcomes actually influence pay, coaching, or role progression",
              purpose: "Performance management cadence is a staff KPI proxy that predicts retention, productivity output, and the dealership's ability to improve through people — the single variable that differentiates consistently high-performing dealerships.",
              situationAnalysis: "Dealerships without structured performance management cannot diagnose whether underperformance is a skill, will, or process issue. Without clear targets and regular feedback, even capable staff drift, and top performers leave for environments that recognise them.",
              benefits: "Structured performance management improves productivity without headcount increases, reduces turnover through recognition and development clarity, and creates the management infrastructure needed to scale consistently.",
              scaleLabels: ["No formal review process — performance discussed informally or not at all", "Annual appraisal only, limited connection to pay or development", "Semi-annual reviews with basic targets, some link to variable pay", "Quarterly structured reviews with clear KPIs, variable pay tied to results, development plans in place", "Monthly 1:1 KPI reviews + quarterly appraisals, full variable pay alignment, personal development plans actively managed"]
            },
            de: {
              text: "Wie strukturiert und konsistent ist die Art und Weise, wie Ihr Autohaus die individuelle Mitarbeiterleistung bewertet und mit Entwicklung und Vergütung verknüpft?",
              description: "Überlegen Sie, ob Ziele klar sind, Bewertungen planmäßig stattfinden und Ergebnisse tatsächlich Vergütung, Coaching oder Karriereentwicklung beeinflussen",
              purpose: "Leistungsmanagement-Kadenz ist ein Mitarbeiter-KPI-Proxy, der Bindung, Produktivitätsoutput und die Fähigkeit des Autohauses vorhersagt, sich durch Menschen zu verbessern.",
              situationAnalysis: "Autohäuser ohne strukturiertes Leistungsmanagement können nicht diagnostizieren, ob Unterleistung ein Fähigkeits-, Willens- oder Prozessproblem ist. Ohne klare Ziele und regelmäßiges Feedback driften selbst fähige Mitarbeiter ab.",
              benefits: "Strukturiertes Leistungsmanagement verbessert die Produktivität ohne Personalaufstockung, reduziert Fluktuation durch Anerkennung und Entwicklungsklarheit und schafft die Managementinfrastruktur für konsistentes Wachstum.",
              scaleLabels: ["Kein formaler Bewertungsprozess — Leistung informell oder gar nicht besprochen", "Nur Jahresgespräch, kaum Verbindung zu Vergütung oder Entwicklung", "Halbjährliche Bewertungen mit Grundzielen, teilweise variable Vergütung", "Vierteljährliche strukturierte Bewertungen mit KPIs, variable Vergütung an Ergebnisse gekoppelt", "Monatliche 1:1 KPI-Reviews + vierteljährliche Beurteilungen, vollständige variable Vergütungsausrichtung"]
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
