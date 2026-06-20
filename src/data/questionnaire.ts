import { Language } from '@/contexts/LanguageContext';
import { SignalCode, RootCauseDimension } from '@/data/signalTypes';

export interface QuestionTranslation {
  text: string;
  description?: string;
  purpose?: string;
  situationAnalysis?: string;
  benefits?: string;
  scaleLabels?: string[];
}

export interface BaseQuestion {
  id: string;
  text: string;
  description?: string;
  category: string;
  purpose?: string;
  situationAnalysis?: string;
  linkedKPIs?: string[];
  benefits?: string;
  primarySignalCode?: SignalCode;
  secondarySignalCode?: SignalCode;
  rootCauseDimension?: RootCauseDimension;
  translations?: Record<Language, QuestionTranslation>;
}

export interface ScoredQuestion extends BaseQuestion {
  kind: "scored";
  type: "scale" | "multiple_choice" | "rating";
  options?: string[];
  scale: {
    min: number;
    max: number;
    labels: string[];
  };
  weight: number;
}

export interface DataQuestion extends BaseQuestion {
  kind: "data";
  type: "numeric" | "percentage" | "currency" | "ratio";
  kpiKey: string;
  unit: string;
  referencePeriod: "last_calendar_month" | "last_financial_year" | "current";
  validRange?: { min: number; max: number };
  formula?: { expression: string; example?: string; dataSource?: string };
  benchmarkRef?: string;
  subSection?: string;
}

export type Question = ScoredQuestion | DataQuestion;

export function isScoredQuestion(q: Question): q is ScoredQuestion {
  return q.kind === "scored";
}

export function isDataQuestion(q: Question): q is DataQuestion {
  return q.kind === "data";
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
        },
        fr: {
          description: "Évaluez vos processus de vente de véhicules neufs, vos indicateurs de performance et la satisfaction client"
        },
        es: {
          description: "Evalúe sus procesos de venta de vehículos nuevos, métricas de rendimiento y satisfacción del cliente"
        },
        it: {
          description: "Valuti i processi di vendita dei veicoli nuovi, le metriche di performance e la soddisfazione dei clienti"
        }
      },
      questions: [
        {
          id: "nvs-1",
          kind: "scored",
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
          primarySignalCode: 'CAPACITY_MISALIGNED',
          secondarySignalCode: 'KPI_NOT_REVIEWED',
          rootCauseDimension: 'structure',
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
            },
            fr: {
              text: "Combien de véhicules neufs votre concessionnaire vend-il en moyenne par mois ?",
              description: "Considérez votre volume de ventes sur les 12 derniers mois pour fournir une évaluation précise",
              purpose: "Mesure l'envergure et la présence sur le marché de votre concessionnaire dans la vente de véhicules neufs, ce qui est directement corrélé au potentiel de revenus et à l'efficacité opérationnelle.",
              situationAnalysis: "Un volume plus élevé indique une position de marché plus forte, une meilleure gestion du stock et un flux de clients plus régulier. Cela aide à déterminer si vous maximisez votre opportunité de marché.",
              benefits: "L'optimisation du volume des ventes conduit à de meilleures économies d'échelle, des relations plus solides avec le constructeur, un pouvoir de négociation accru et une rentabilité globale supérieure.",
              scaleLabels: ["<4 unités/mois", "4–6 unités/mois", "7–9 unités/mois", "10–12 unités/mois", ">12 unités/mois"]
            },
            es: {
              text: "¿Cuántos vehículos nuevos vende su concesionario de media al mes?",
              description: "Considere su volumen de ventas de los últimos 12 meses para proporcionar una evaluación precisa",
              purpose: "Mide la escala y presencia de mercado de su concesionario en ventas de vehículos nuevos, lo cual se correlaciona directamente con el potencial de ingresos y la eficiencia operativa.",
              situationAnalysis: "Un mayor volumen indica una posición de mercado más fuerte, mejor gestión de inventario y un flujo de clientes más constante. Ayuda a identificar si está maximizando su oportunidad de mercado.",
              benefits: "Optimizar el volumen de ventas conduce a mejores economías de escala, relaciones más sólidas con el fabricante, mayor poder de negociación y una rentabilidad general más alta.",
              scaleLabels: ["<4 unidades/mes", "4–6 unidades/mes", "7–9 unidades/mes", "10–12 unidades/mes", ">12 unidades/mes"]
            },
            it: {
              text: "Quanti veicoli nuovi vende mediamente la Sua concessionaria al mese?",
              description: "Consideri il volume di vendita degli ultimi 12 mesi per fornire una valutazione accurata",
              purpose: "Misura la dimensione e la presenza sul mercato della Sua concessionaria nella vendita di veicoli nuovi, direttamente correlata al potenziale di ricavi e all'efficienza operativa.",
              situationAnalysis: "Un volume più elevato indica una posizione di mercato più forte, una migliore gestione del magazzino e un flusso di clienti più costante. Aiuta a identificare se si sta massimizzando l'opportunità di mercato.",
              benefits: "L'ottimizzazione del volume di vendita porta a migliori economie di scala, rapporti più solidi con la casa costruttrice, maggiore potere negoziale e una redditività complessiva più elevata.",
              scaleLabels: ["<4 unità/mese", "4–6 unità/mese", "7–9 unità/mese", "10–12 unità/mese", ">12 unità/mese"]
            }
          }
        },
        {
          id: "nvs-2",
          kind: "scored",
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
          primarySignalCode: 'PROCESS_NOT_EXECUTED',
          secondarySignalCode: 'KPI_NOT_REVIEWED',
          rootCauseDimension: 'process',
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
            },
            fr: {
              text: "Quel pourcentage de vos prospects se concrétise en achats de véhicules ?",
              description: "Calculez le ratio de ventes conclues par rapport au nombre total de prospects qualifiés reçus",
              purpose: "Évalue l'efficacité de l'équipe de vente et la qualité de votre processus commercial, de la génération de prospects à la décision finale d'achat.",
              situationAnalysis: "Un faible taux de conclusion indique des problèmes potentiels de formation commerciale, de qualité des prospects, de stratégie tarifaire ou d'expérience client nécessitant une attention immédiate.",
              benefits: "L'amélioration du taux de conclusion augmente directement le chiffre d'affaires sans dépenses marketing supplémentaires, réduit les coûts d'acquisition client et maximise le retour sur investissement de vos efforts de génération de prospects.",
              scaleLabels: ["<10%", "10–15%", "16–22%", "23–30%", ">30%"]
            },
            es: {
              text: "¿Qué porcentaje de sus oportunidades de venta se convierten en compras efectivas de vehículos?",
              description: "Calcule la proporción de ventas completadas respecto al total de oportunidades cualificadas recibidas",
              purpose: "Evalúa la eficacia del equipo de ventas y la calidad de su proceso comercial desde la generación de oportunidades hasta la decisión final de compra.",
              situationAnalysis: "Ratios de cierre bajos indican posibles problemas en la formación de ventas, calidad de las oportunidades, estrategia de precios o experiencia del cliente que requieren atención inmediata.",
              benefits: "Mejorar los ratios de cierre incrementa directamente los ingresos sin gasto adicional en marketing, reduce los costes de adquisición de clientes y maximiza el retorno de sus esfuerzos de generación de oportunidades.",
              scaleLabels: ["<10%", "10–15%", "16–22%", "23–30%", ">30%"]
            },
            it: {
              text: "Quale percentuale dei Suoi lead di vendita si converte con successo in acquisti effettivi di veicoli?",
              description: "Calcoli il rapporto tra vendite concluse e lead qualificati totali ricevuti",
              purpose: "Valuta l'efficacia del team di vendita e la qualità del processo commerciale, dalla generazione del lead alla decisione finale di acquisto.",
              situationAnalysis: "Tassi di chiusura bassi indicano potenziali problemi nella formazione commerciale, nella qualità dei lead, nella strategia di prezzo o nell'esperienza del cliente che richiedono attenzione immediata.",
              benefits: "Il miglioramento dei tassi di chiusura aumenta direttamente i ricavi senza spese aggiuntive di marketing, riduce i costi di acquisizione clienti e massimizza il ROI delle attività di generazione lead.",
              scaleLabels: ["<10%", "10–15%", "16–22%", "23–30%", ">30%"]
            }
          }
        },
        {
          id: "nvs-3",
          kind: "scored",
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
          primarySignalCode: 'KPI_NOT_REVIEWED',
          rootCauseDimension: 'process',
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
            },
            fr: {
              text: "Comment les clients évalueraient-ils leur satisfaction globale concernant leur expérience d'achat de véhicule neuf ?",
              description: "Sur la base d'enquêtes client, de formulaires de retour et d'avis après achat",
              purpose: "Mesure la qualité de l'expérience client durant le processus de vente, ce qui impacte directement les achats répétés, les recommandations et la réputation de la marque.",
              situationAnalysis: "La satisfaction client est un indicateur avancé de la performance commerciale future, de la fidélité client et de l'efficacité du bouche-à-oreille.",
              benefits: "Une satisfaction client élevée entraîne davantage de recommandations, de clients fidèles, d'avis en ligne positifs et une réduction des coûts marketing grâce à la croissance organique.",
              scaleLabels: ["Très insatisfait", "En dessous de la moyenne", "Moyen", "Bon", "Excellent"]
            },
            es: {
              text: "¿Cómo calificarían los clientes su satisfacción general con la experiencia de compra de vehículos nuevos?",
              description: "Basado en encuestas de clientes, formularios de opinión y valoraciones posteriores a la compra",
              purpose: "Mide la calidad de la experiencia del cliente durante el proceso de venta, lo cual impacta directamente en la repetición de compra, las recomendaciones y la reputación de marca.",
              situationAnalysis: "La satisfacción del cliente es un indicador adelantado del rendimiento futuro de ventas, la fidelización del cliente y la eficacia del marketing boca a boca.",
              benefits: "Una alta satisfacción del cliente conduce a más recomendaciones, clientes recurrentes, valoraciones positivas en línea y reducción de costes de marketing mediante crecimiento orgánico.",
              scaleLabels: ["Muy insatisfecho", "Por debajo de la media", "Promedio", "Bueno", "Excelente"]
            },
            it: {
              text: "Come valuterebbero i clienti la loro soddisfazione complessiva riguardo all'esperienza di acquisto di un veicolo nuovo?",
              description: "Sulla base di sondaggi clienti, moduli di feedback e recensioni post-acquisto",
              purpose: "Misura la qualità dell'esperienza del cliente durante il processo di vendita, con impatto diretto su acquisti ripetuti, referenze e reputazione del marchio.",
              situationAnalysis: "La soddisfazione del cliente è un indicatore anticipatore delle performance di vendita future, della fidelizzazione e dell'efficacia del passaparola.",
              benefits: "Un'elevata soddisfazione del cliente porta a un aumento delle referenze, dei clienti abituali, delle recensioni online positive e alla riduzione dei costi di marketing grazie alla crescita organica.",
              scaleLabels: ["Molto insoddisfatto", "Sotto la media", "Nella media", "Buono", "Eccellente"]
            }
          }
        },
        {
          id: "nvs-4",
          kind: "scored",
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
          primarySignalCode: 'KPI_NOT_REVIEWED',
          secondarySignalCode: 'PROCESS_NOT_STANDARDISED',
          rootCauseDimension: 'process',
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
            },
            fr: {
              text: "Quelle est la marge brute moyenne que votre concessionnaire réalise sur chaque véhicule neuf vendu ?",
              description: "Calculez le profit front-end après toutes les remises et incitations",
              purpose: "Évalue l'efficacité de la stratégie tarifaire et les compétences de négociation, impactant directement la rentabilité et la viabilité financière du concessionnaire.",
              situationAnalysis: "Les marges bénéficiaires indiquent votre positionnement concurrentiel, votre pouvoir de fixation des prix et votre capacité à créer de la valeur pendant le processus de vente.",
              benefits: "L'optimisation de la marge brute par unité améliore considérablement la rentabilité globale du concessionnaire, la trésorerie et la capacité à investir dans des initiatives de croissance.",
              scaleLabels: ["Moins de 500 € par unité", "500–900 € par unité", "900–1 400 € par unité", "1 400–2 000 € par unité", "Plus de 2 000 € par unité"]
            },
            es: {
              text: "¿Cuál es el margen bruto medio que obtiene su concesionario en cada vehículo nuevo vendido?",
              description: "Calcule el beneficio bruto del vehículo tras todos los descuentos e incentivos",
              purpose: "Evalúa la eficacia de la estrategia de precios y las habilidades de negociación, impactando directamente en la rentabilidad y la sostenibilidad financiera del concesionario.",
              situationAnalysis: "Los márgenes de beneficio indican su posicionamiento competitivo, poder de fijación de precios y capacidad de añadir valor durante el proceso de venta.",
              benefits: "Optimizar el margen bruto por unidad mejora significativamente la rentabilidad general del concesionario, el flujo de caja y la capacidad de invertir en iniciativas de crecimiento.",
              scaleLabels: ["Por debajo de €500 por unidad", "€500-€900 por unidad", "€900-€1.400 por unidad", "€1.400-€2.000 por unidad", "Por encima de €2.000 por unidad"]
            },
            it: {
              text: "Qual è il margine lordo medio che la Sua concessionaria realizza su ogni veicolo nuovo venduto?",
              description: "Calcoli il profitto front-end al netto di tutti gli sconti e gli incentivi",
              purpose: "Valuta l'efficacia della strategia di prezzo e le capacità negoziali, con impatto diretto sulla redditività della concessionaria e sulla sostenibilità finanziaria.",
              situationAnalysis: "I margini di profitto indicano il posizionamento competitivo, il potere di prezzo e la capacità di aggiungere valore durante il processo di vendita.",
              benefits: "L'ottimizzazione del margine lordo per unità migliora significativamente la redditività complessiva della concessionaria, il flusso di cassa e la capacità di investire in iniziative di crescita.",
              scaleLabels: ["Sotto €500 per unità", "€500-€900 per unità", "€900-€1.400 per unità", "€1.400-€2.000 per unità", "Sopra €2.000 per unità"]
            }
          }
        },
        {
          id: "nvs-5",
          kind: "scored",
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
          primarySignalCode: 'PROCESS_NOT_EXECUTED',
          rootCauseDimension: 'process',
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
            },
            fr: {
              text: "Combien de temps faut-il généralement entre la première demande d'un client et la livraison du véhicule ?",
              description: "Mesurez le délai moyen entre le premier contact et la remise des clés",
              purpose: "Évalue l'efficacité des processus et la qualité de l'expérience client, impactant la satisfaction client et l'avantage concurrentiel.",
              situationAnalysis: "Des délais de livraison plus courts améliorent la satisfaction client, réduisent les abandons de transaction et renforcent le positionnement concurrentiel sur le marché.",
              benefits: "Réduire le délai de livraison augmente la satisfaction client, réduit les annulations, améliore la trésorerie et crée une différenciation concurrentielle.",
              scaleLabels: ["Aucun processus de livraison standard", "Checklist existante mais suivie de manière inconstante", "Processus documenté suivi la plupart du temps", "Livraison structurée et régulière avec suivi CSI", "Livraison selon les meilleures pratiques avec outils numériques et suivi systématique"]
            },
            es: {
              text: "¿Cuánto tiempo transcurre normalmente desde la consulta inicial del cliente hasta la entrega del vehículo?",
              description: "Mida el tiempo medio desde el primer contacto hasta la entrega de llaves",
              purpose: "Evalúa la eficiencia del proceso y la calidad de la experiencia del cliente, impactando en la satisfacción del cliente y la ventaja competitiva.",
              situationAnalysis: "Tiempos de entrega más rápidos mejoran la satisfacción del cliente, reducen la pérdida de operaciones y fortalecen el posicionamiento competitivo en el mercado.",
              benefits: "Reducir el tiempo de entrega aumenta la satisfacción del cliente, reduce las cancelaciones, mejora el flujo de caja y crea diferenciación competitiva.",
              scaleLabels: ["Sin proceso estándar de entrega", "Existe una lista de verificación pero se sigue de forma inconsistente", "Proceso documentado seguido la mayor parte del tiempo", "Entrega estructurada y consistente con seguimiento CSI", "Entrega según mejores prácticas con herramientas digitales y seguimiento sistemático"]
            },
            it: {
              text: "Quanto tempo impiega tipicamente dal primo contatto del cliente alla consegna del veicolo?",
              description: "Misuri il tempo medio dal primo contatto alla consegna delle chiavi",
              purpose: "Valuta l'efficienza dei processi e la qualità dell'esperienza del cliente, con impatto sulla soddisfazione e sul vantaggio competitivo.",
              situationAnalysis: "Tempi di consegna più rapidi migliorano la soddisfazione del cliente, riducono le mancate conclusioni e rafforzano il posizionamento competitivo sul mercato.",
              benefits: "La riduzione dei tempi di consegna aumenta la soddisfazione del cliente, riduce le cancellazioni, migliora il flusso di cassa e crea differenziazione competitiva.",
              scaleLabels: ["Nessun processo di consegna standard", "Esiste una checklist ma non viene seguita in modo costante", "Processo documentato seguito nella maggior parte dei casi", "Consegna strutturata e costante con follow-up CSI", "Consegna best-practice con strumenti digitali e follow-up sistematico"]
            }
          }
        },
        {
          id: "nvs-6",
          kind: "scored",
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
          primarySignalCode: 'TOOL_UNDERUTILISED',
          secondarySignalCode: 'PROCESS_NOT_EXECUTED',
          rootCauseDimension: 'tools',
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
            },
            fr: {
              text: "Quel pourcentage de vos prospects en ligne se traduit par des visites en salle d'exposition ?",
              description: "Suivez la conversion entre la demande numérique et la visite physique au concessionnaire",
              purpose: "Mesure l'efficacité de votre stratégie de marketing numérique et de vos capacités d'engagement client en ligne.",
              situationAnalysis: "La conversion des prospects numériques indique dans quelle mesure votre présence en ligne et votre tunnel de vente digital fonctionnent sur le marché actuel axé sur le numérique.",
              benefits: "L'amélioration de la conversion numérique réduit les coûts marketing, augmente la qualité des prospects et vous positionne en avance sur vos concurrents dans l'espace digital.",
              scaleLabels: ["Aucune présence numérique — visites spontanées uniquement", "Site web basique, prospects traités manuellement, délai de réponse >1 jour", "CRM utilisé pour les prospects en ligne, réponse le jour même", "Processus numérique structuré, réponse <2 heures, conversion suivie", "Routage automatisé, réponse <5 min, analytique complète du tunnel actif"]
            },
            es: {
              text: "¿Qué porcentaje de sus oportunidades en línea resultan en visitas efectivas al concesionario?",
              description: "Realice el seguimiento de la conversión desde la consulta digital hasta la visita física al concesionario",
              purpose: "Mide la eficacia de su estrategia de marketing digital y sus capacidades de captación de clientes en línea.",
              situationAnalysis: "La conversión de oportunidades digitales indica el rendimiento de su presencia en línea y su embudo de ventas digital en el mercado actual, donde lo digital es prioritario.",
              benefits: "Mejorar la conversión digital reduce los costes de marketing, aumenta la calidad de las oportunidades y le posiciona por delante de la competencia en el ámbito digital.",
              scaleLabels: ["Sin presencia digital — solo clientes sin cita", "Oportunidades web básicas gestionadas manualmente, respuesta >1 día", "CRM utilizado para oportunidades en línea, respuesta en el mismo día", "Proceso digital estructurado, respuesta <2 horas, conversión monitorizada", "Enrutamiento automatizado, respuesta <5 min, analítica completa del embudo activa"]
            },
            it: {
              text: "Quale percentuale dei Suoi lead online si trasforma in visite effettive in showroom?",
              description: "Monitori la conversione dalla richiesta digitale alla visita fisica in concessionaria",
              purpose: "Misura l'efficacia della strategia di marketing digitale e le capacità di engagement online del cliente.",
              situationAnalysis: "La conversione dei lead digitali indica la qualità della presenza online e del funnel di vendita digitale nell'attuale mercato orientato al digitale.",
              benefits: "Il miglioramento della conversione digitale riduce i costi di marketing, aumenta la qualità dei lead e posiziona la concessionaria in vantaggio rispetto ai concorrenti nel contesto digitale.",
              scaleLabels: ["Nessuna presenza digitale — solo clienti spontanei", "Lead dal sito web gestiti manualmente, risposta >1 giorno", "CRM utilizzato per i lead online, risposta in giornata", "Processo digitale strutturato, risposta <2 ore, conversione monitorata", "Routing automatizzato, risposta <5 min, analytics completi del funnel attivi"]
            }
          }
        },
        {
          id: "nvs-7",
          kind: "scored",
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
          primarySignalCode: 'ROLE_OWNERSHIP_MISSING',
          rootCauseDimension: 'people',
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
            },
            fr: {
              text: "À quelle fréquence votre équipe commerciale bénéficie-t-elle de formations formelles et de développement des compétences ?",
              description: "Incluez la formation produit, les techniques de vente et les compétences en service client",
              purpose: "Évalue l'investissement dans le développement de l'équipe et l'amélioration continue, ce qui est directement corrélé aux performances commerciales et à la satisfaction client.",
              situationAnalysis: "Une formation régulière garantit que votre équipe reste à jour sur la connaissance des produits, les techniques de vente et les meilleures pratiques du secteur.",
              benefits: "Une formation régulière améliore les résultats commerciaux, réduit la rotation du personnel, améliore l'expérience client et construit un avantage concurrentiel durable.",
              scaleLabels: ["Aucune formation formelle au cours des 12 derniers mois", "1 session imposée par le constructeur par an uniquement", "2 formations structurées par an, la plupart du personnel y participe", "Planning trimestriel de formation avec participation obligatoire et suivi", "Sessions de développement mensuelles, 100 % de participation, certifications suivies"]
            },
            es: {
              text: "¿Con qué frecuencia recibe su equipo de ventas formación reglada y desarrollo de competencias?",
              description: "Incluya formación de producto, técnicas de venta y habilidades de atención al cliente",
              purpose: "Evalúa la inversión en desarrollo del equipo y mejora continua, lo cual se correlaciona directamente con el rendimiento de ventas y la satisfacción del cliente.",
              situationAnalysis: "La formación regular garantiza que su equipo se mantenga actualizado en conocimiento de producto, técnicas de venta y mejores prácticas del sector.",
              benefits: "La formación constante mejora los resultados de ventas, reduce la rotación de personal, mejora la experiencia del cliente y construye ventaja competitiva a largo plazo.",
              scaleLabels: ["Sin formación reglada en los últimos 12 meses", "Solo 1 sesión obligatoria del fabricante al año", "2 veces al año, formación estructurada, asiste la mayoría del personal", "Calendario trimestral de formación con asistencia obligatoria y seguimiento", "Sesiones mensuales de desarrollo, 100% de asistencia, certificaciones monitorizadas"]
            },
            it: {
              text: "Con quale frequenza il Suo team commerciale riceve formazione strutturata e sviluppo delle competenze?",
              description: "Includa formazione prodotto, tecniche di vendita e competenze di assistenza al cliente",
              purpose: "Valuta l'investimento nello sviluppo del team e nel miglioramento continuo, direttamente correlato alle performance di vendita e alla soddisfazione del cliente.",
              situationAnalysis: "La formazione regolare garantisce che il team sia aggiornato sulle conoscenze di prodotto, le tecniche di vendita e le best practice del settore.",
              benefits: "Una formazione costante migliora i risultati di vendita, riduce il turnover del personale, migliora l'esperienza del cliente e costruisce un vantaggio competitivo a lungo termine.",
              scaleLabels: ["Nessuna formazione strutturata negli ultimi 12 mesi", "Solo 1 sessione obbligatoria del costruttore all'anno", "2 volte l'anno, formazione strutturata, partecipazione della maggior parte del personale", "Programma di formazione trimestrale con partecipazione obbligatoria e monitoraggio", "Sessioni di sviluppo mensili, partecipazione al 100%, certificazioni monitorate"]
            }
          }
        },
        {
          id: "nvs-8",
          kind: "scored",
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
          primarySignalCode: 'PROCESS_NOT_STANDARDISED',
          secondarySignalCode: 'GOVERNANCE_WEAK',
          rootCauseDimension: 'process',
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
            },
            fr: {
              text: "Combien de fois par an votre stock de véhicules neufs effectue-t-il une rotation complète ?",
              description: "Calculez les ventes annuelles divisées par la valeur moyenne du stock",
              purpose: "Mesure l'efficacité de la gestion des stocks et la précision des prévisions de demande, impactant directement la trésorerie et les coûts de portage.",
              situationAnalysis: "Une rotation rapide des stocks indique une bonne planification de la demande, une tarification efficace et une exécution commerciale solide.",
              benefits: "L'optimisation de la rotation des stocks améliore la trésorerie, réduit les charges d'intérêts, minimise le risque d'obsolescence et augmente la rentabilité.",
              scaleLabels: ["<70 points", "70–75 points", "76–82 points", "83–89 points", "≥90 points"]
            },
            es: {
              text: "¿Cuántas veces al año rota completamente su inventario de vehículos nuevos?",
              description: "Calcule las ventas anuales divididas por el valor medio del inventario",
              purpose: "Mide la eficiencia de la gestión de inventario y la precisión de la previsión de demanda, impactando directamente en el flujo de caja y los costes de mantenimiento.",
              situationAnalysis: "Una rotación rápida del inventario indica buena planificación de la demanda, precios eficaces y una ejecución de ventas sólida.",
              benefits: "Optimizar la rotación de inventario mejora el flujo de caja, reduce los gastos financieros, minimiza el riesgo de obsolescencia y aumenta la rentabilidad.",
              scaleLabels: ["<70 puntos", "70–75 puntos", "76–82 puntos", "83–89 puntos", "≥90 puntos"]
            },
            it: {
              text: "Quante volte all'anno il magazzino di veicoli nuovi viene completamente rinnovato?",
              description: "Calcoli le vendite annuali divise per il valore medio del magazzino",
              purpose: "Misura l'efficienza della gestione del magazzino e l'accuratezza delle previsioni di domanda, con impatto diretto sul flusso di cassa e sui costi di mantenimento.",
              situationAnalysis: "Una rotazione rapida del magazzino indica una buona pianificazione della domanda, una politica di prezzo efficace e una forte esecuzione commerciale.",
              benefits: "L'ottimizzazione della rotazione del magazzino migliora il flusso di cassa, riduce gli oneri finanziari, minimizza il rischio di obsolescenza e aumenta la redditività.",
              scaleLabels: ["<70 punti", "70–75 punti", "76–82 punti", "83–89 punti", "≥90 punti"]
            }
          }
        },
        {
          id: "nvs-9",
          kind: "scored",
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
          primarySignalCode: 'KPI_NOT_REVIEWED',
          secondarySignalCode: 'PROCESS_NOT_EXECUTED',
          rootCauseDimension: 'process',
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
            },
            fr: {
              text: "Quel pourcentage de vos clients de véhicules neufs souscrit des produits de financement et d'assurance ?",
              description: "Incluez les prêts, les leasings, les extensions de garantie et les contrats de protection",
              purpose: "Évalue l'efficacité de votre département F&I dans la création de valeur ajoutée et la génération de revenus supplémentaires par transaction.",
              situationAnalysis: "Un taux de pénétration F&I élevé indique une bonne capacité à construire des relations client et des compétences efficaces de présentation des produits.",
              benefits: "L'augmentation de la pénétration F&I accroît significativement la rentabilité par unité, améliore la protection des clients et crée des flux de revenus récurrents.",
              scaleLabels: ["Aucun suivi du pipeline", "Suivi informel", "Revue basique du pipeline mensuelle", "Revue hebdomadaire structurée", "Pipeline géré quotidiennement avec prévisions"]
            },
            es: {
              text: "¿Qué porcentaje de sus clientes de vehículos nuevos adquieren productos de financiación y seguros?",
              description: "Incluya préstamos, leasing, garantías extendidas y paquetes de protección",
              purpose: "Evalúa la eficacia de su departamento de F&I en la generación de valor añadido e ingresos adicionales por transacción.",
              situationAnalysis: "Una alta penetración de F&I indica una sólida capacidad de construcción de relaciones con el cliente y habilidades eficaces de presentación de productos.",
              benefits: "Aumentar la penetración de F&I incrementa significativamente la rentabilidad por unidad, mejora la protección del cliente y crea flujos de ingresos recurrentes.",
              scaleLabels: ["Sin seguimiento del pipeline", "Seguimiento informal", "Revisión básica mensual del pipeline", "Revisión semanal estructurada", "Pipeline gestionado diariamente con previsión"]
            },
            it: {
              text: "Quale percentuale dei Suoi clienti di veicoli nuovi acquista prodotti finanziari e assicurativi?",
              description: "Includa finanziamenti, leasing, garanzie estese e pacchetti di protezione",
              purpose: "Valuta l'efficacia del reparto F&I nell'aggiungere valore e generare ricavi aggiuntivi per ogni transazione.",
              situationAnalysis: "Un'elevata penetrazione F&I indica una forte capacità di costruire relazioni con i clienti e competenze efficaci nella presentazione dei prodotti.",
              benefits: "L'aumento della penetrazione F&I incrementa significativamente la redditività per unità, migliora la protezione del cliente e crea flussi di ricavi ricorrenti.",
              scaleLabels: ["Nessun monitoraggio della pipeline", "Monitoraggio informale", "Revisione mensile di base della pipeline", "Revisione settimanale strutturata", "Pipeline gestita quotidianamente con previsioni"]
            }
          }
        },
        {
          id: "nvs-10",
          kind: "scored",
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
          primarySignalCode: 'TOOL_UNDERUTILISED',
          rootCauseDimension: 'tools',
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
            },
            fr: {
              text: "Dans quelle mesure votre équipe utilise-t-elle efficacement le système CRM pour la gestion des prospects et le suivi ?",
              description: "Considérez la régularité de la saisie des données, l'automatisation du suivi et l'utilisation des rapports",
              purpose: "Évalue la capacité de votre équipe à exploiter la technologie pour la gestion de la relation client et l'optimisation du processus de vente.",
              situationAnalysis: "Une utilisation efficace du CRM indique une approche systématique de la gestion client, des processus de suivi améliorés et une prise de décision basée sur les données.",
              benefits: "Une meilleure utilisation du CRM améliore la conversion des prospects, renforce les relations client, augmente les achats répétés et fournit des informations précieuses pour la croissance.",
              scaleLabels: ["CRM non utilisé ou <30 % des prospects enregistrés", "Enregistrement basique seulement, 30–60 % des interactions enregistrées", "La plupart des prospects enregistrés, automatisation limitée utilisée", "Utilisation régulière, suivis automatisés actifs, rapports hebdomadaires consultés", "Adoption complète, tous les points de contact enregistrés, pipeline géré, les rapports orientent les décisions"]
            },
            es: {
              text: "¿Con qué eficacia utiliza su equipo el sistema CRM para la gestión de oportunidades y el seguimiento?",
              description: "Considere la consistencia en la introducción de datos, la automatización de seguimientos y el uso de informes",
              purpose: "Evalúa la capacidad de su equipo para aprovechar la tecnología en la gestión de relaciones con clientes y la optimización del proceso de ventas.",
              situationAnalysis: "El uso eficaz del CRM indica un enfoque sistemático en la gestión de clientes, procesos de seguimiento mejorados y toma de decisiones basada en datos.",
              benefits: "Un mejor uso del CRM mejora la conversión de oportunidades, fortalece las relaciones con los clientes, incrementa la repetición de compra y proporciona información valiosa para el crecimiento.",
              scaleLabels: ["CRM no utilizado o <30% de oportunidades registradas", "Solo registro básico, 30-60% de interacciones registradas", "Mayoría de oportunidades registradas, automatización limitada", "Uso consistente, seguimientos automáticos activos, informes semanales revisados", "Adopción completa, todos los contactos registrados, pipeline gestionado, los informes dirigen las decisiones"]
            },
            it: {
              text: "Con quale efficacia il Suo team utilizza il sistema CRM per la gestione dei lead e il follow-up?",
              description: "Consideri la coerenza nell'inserimento dati, l'automazione del follow-up e l'uso dei report",
              purpose: "Valuta la capacità del team di sfruttare la tecnologia per la gestione delle relazioni con i clienti e l'ottimizzazione del processo di vendita.",
              situationAnalysis: "Un utilizzo efficace del CRM indica un approccio sistematico alla gestione dei clienti, processi di follow-up migliorati e un processo decisionale basato sui dati.",
              benefits: "Un migliore utilizzo del CRM migliora la conversione dei lead, rafforza le relazioni con i clienti, aumenta gli acquisti ripetuti e fornisce informazioni preziose per la crescita.",
              scaleLabels: ["CRM non utilizzato o <30% dei lead registrati", "Solo registrazione di base, 30-60% delle interazioni registrate", "La maggior parte dei lead registrati, automazione limitata", "Uso costante, follow-up automatizzati attivi, report settimanali analizzati", "Adozione completa, tutti i touchpoint registrati, pipeline gestita, reporting guida le decisioni"]
            }
          }
        },
        {
          id: "nvs-11",
          kind: "scored",
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
          primarySignalCode: 'PROCESS_NOT_EXECUTED',
          rootCauseDimension: 'process',
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
            },
            fr: {
              text: "Avec quelle rapidité et régularité votre équipe répond-elle aux demandes commerciales entrantes sur tous les canaux ?",
              description: "Considérez le téléphone, l'e-mail, les formulaires du site web et les prospects de plateformes tierces, pendant et en dehors des heures d'ouverture",
              purpose: "La rapidité de réponse aux prospects est l'un des leviers de conversion les plus impactants dans la distribution automobile — chaque heure de retard réduit significativement la probabilité de contact et de conversion.",
              situationAnalysis: "Les concessionnaires qui répondent dans les 30 minutes ont significativement plus de chances de convertir un prospect que ceux qui attendent des heures. Cette question met en lumière le standard opérationnel réel, et non l'intention déclarée.",
              benefits: "Une réponse rapide et systématique compresse le cycle de vente, réduit la perte de prospects au profit de la concurrence et améliore le retour sur investissement de chaque euro dépensé en marketing.",
              scaleLabels: ["Aucun processus — prospects traités quand c'est possible", "La plupart des prospects contactés dans la journée ouvrable", "Objectif de réponse sous 2 heures pendant les heures ouvrables, suivi inconstant", "Réponse <1 heure avec routage CRM, suivi hebdomadaire", "Accusé de réception automatique <15 min + suivi personnalisé <30 min, SLA 95 %+ suivi quotidiennement"]
            },
            es: {
              text: "¿Con qué rapidez y consistencia se atienden las consultas de ventas entrantes en todos los canales?",
              description: "Considere teléfono, correo electrónico, formulario web y oportunidades de portales de terceros, dentro y fuera del horario comercial",
              purpose: "La velocidad de respuesta a las oportunidades es una de las palancas de conversión de mayor impacto en la venta de automóviles — cada hora de retraso reduce materialmente la probabilidad de contacto y conversión.",
              situationAnalysis: "Los concesionarios que responden en 30 minutos tienen una probabilidad significativamente mayor de convertir una oportunidad que aquellos que esperan horas. Esta pregunta evalúa el estándar operativo real, no solo la intención declarada.",
              benefits: "Una respuesta rápida y sistemática comprime el ciclo de ventas, reduce la fuga de oportunidades hacia la competencia y mejora el retorno de cada euro invertido en marketing.",
              scaleLabels: ["Sin proceso — las oportunidades se atienden cuando conviene", "La mayoría de las oportunidades se contactan en un día laborable", "Objetivo de respuesta de 2 horas en horario comercial, seguimiento inconsistente", "Respuesta <1 hora con enrutamiento CRM, seguimiento semanal", "Acuse de recibo automático <15 min + seguimiento personal <30 min, SLA >95% monitorizado diariamente"]
            },
            it: {
              text: "Con quale rapidità e costanza il Suo team gestisce le richieste di vendita in arrivo su tutti i canali?",
              description: "Consideri telefono, email, moduli del sito web e lead da portali terzi durante e fuori dall'orario lavorativo",
              purpose: "La velocità di risposta ai lead è una delle leve di conversione a più alto impatto nel retail automobilistico — ogni ora di ritardo riduce materialmente la probabilità di contatto e conversione.",
              situationAnalysis: "Le concessionarie che rispondono entro 30 minuti hanno una probabilità significativamente maggiore di convertire un lead rispetto a quelle che attendono ore. Questa domanda evidenzia lo standard operativo effettivo, non solo l'intento dichiarato.",
              benefits: "Una risposta rapida e sistematica comprime il ciclo di vendita, riduce la dispersione dei lead verso la concorrenza e migliora il ROI di ogni euro speso in marketing.",
              scaleLabels: ["Nessun processo — i lead vengono gestiti quando possibile", "La maggior parte dei lead viene contattata entro un giorno lavorativo", "Obiettivo di risposta entro 2 ore durante l'orario lavorativo, monitoraggio non costante", "Risposta <1 ora con routing CRM, monitoraggio settimanale", "Auto-risposta <15 min + follow-up personale <30 min, SLA 95%+ monitorato quotidianamente"]
            }
          }
        },
        {
          id: "nvs-12",
          kind: "scored",
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
          primarySignalCode: 'CAPACITY_MISALIGNED',
          rootCauseDimension: 'structure',
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
            },
            fr: {
              text: "En moyenne, combien de véhicules neufs chaque conseiller commercial actif conclut-il par mois ?",
              description: "Divisez le total mensuel de véhicules neufs vendus par le nombre de vendeurs actifs portant un objectif",
              purpose: "La production par conseiller commercial est une mesure directe de la productivité individuelle, du dimensionnement de l'équipe et de la capacité du coaching et du support processus à se traduire en résultats.",
              situationAnalysis: "Un faible nombre d'unités par conseiller signale souvent un sureffectif par rapport à la demande, une faiblesse dans les techniques de conclusion, une mauvaise attribution des prospects ou un accompagnement managérial insuffisant — autant de problèmes traitables avec les bonnes interventions.",
              benefits: "L'optimisation de la productivité des conseillers améliore la marge par vente, permet des modèles d'effectifs plus légers et identifie précisément où l'investissement en coaching produira le rendement le plus rapide.",
              scaleLabels: ["<3 unités/conseiller/mois", "3–4 unités/conseiller/mois", "5–6 unités/conseiller/mois", "7–9 unités/conseiller/mois", "≥10 unités/conseiller/mois"]
            },
            es: {
              text: "De media, ¿cuántas ventas de vehículos nuevos cierra cada asesor comercial activo al mes?",
              description: "Divida el total de unidades de vehículos nuevos vendidas al mes entre el número de asesores comerciales activos con objetivo asignado",
              purpose: "La producción de ventas por asesor es una medida directa de la productividad individual, el dimensionamiento del equipo y de si la formación y el soporte de procesos se traducen en resultados.",
              situationAnalysis: "Pocas unidades por asesor suele indicar sobredimensionamiento respecto a la demanda, técnica de cierre deficiente, mala asignación de oportunidades o coaching insuficiente por parte de la dirección — todo ello subsanable con las intervenciones adecuadas.",
              benefits: "Optimizar la productividad del asesor mejora el margen por venta, permite modelos de dotación más eficientes e identifica exactamente dónde la inversión en formación generará el retorno más rápido.",
              scaleLabels: ["<3 unidades/asesor/mes", "3–4 unidades/asesor/mes", "5–6 unidades/asesor/mes", "7–9 unidades/asesor/mes", "≥10 unidades/asesor/mes"]
            },
            it: {
              text: "In media, quanti veicoli nuovi vende ogni consulente commerciale attivo al mese?",
              description: "Divida il totale mensile di veicoli nuovi venduti per il numero di venditori attivi con obiettivo assegnato",
              purpose: "Le vendite per consulente sono una misura diretta della produttività individuale, del dimensionamento del team e di quanto il coaching e il supporto ai processi si traducano in risultati.",
              situationAnalysis: "Un basso numero di unità per consulente spesso segnala un sovradimensionamento dell'organico rispetto alla domanda, tecniche di chiusura deboli, scarsa allocazione dei lead o coaching manageriale insufficiente — tutti fattori risolvibili con gli interventi giusti.",
              benefits: "L'ottimizzazione della produttività dei consulenti migliora il margine per vendita, consente modelli organizzativi più snelli e individua con precisione dove l'investimento in coaching produrrà il rendimento più rapido.",
              scaleLabels: ["<3 unità/consulente/mese", "3–4 unità/consulente/mese", "5–6 unità/consulente/mese", "7–9 unità/consulente/mese", "≥10 unità/consulente/mese"]
            }
          }
        },
        {
          id: "nvs-13",
          kind: "scored",
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
          primarySignalCode: 'ROLE_OWNERSHIP_MISSING',
          rootCauseDimension: 'people',
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
            },
            fr: {
              text: "Quelle a été la stabilité de la composition de votre équipe commerciale au cours des 12 derniers mois ?",
              description: "Pensez aux départs volontaires, aux licenciements et à l'ancienneté de votre équipe actuelle dans leurs postes",
              purpose: "La stabilité du personnel est un indicateur avancé de la culture, de la compétitivité de la rémunération et de la qualité du management — et prédit directement la régularité des ventes futures et les scores d'expérience client.",
              situationAnalysis: "Un fort turnover de l'équipe commerciale détruit le savoir institutionnel, gonfle les coûts de recrutement et de formation, perturbe les relations client et réduit le volume pendant les périodes de montée en compétence des nouvelles recrues.",
              benefits: "Les équipes stables concluent davantage, fidélisent plus de clients, obtiennent de meilleurs scores de satisfaction et coûtent significativement moins à maintenir que les environnements à fort turnover.",
              scaleLabels: ["Fort turnover — plus de la moitié de l'équipe a changé en 12 mois", "Turnover significatif — 3 départs ou plus cette année", "Modéré — 1 à 2 départs remplacés par des profils d'expérience similaire", "Stable — départs minimes, la plupart du personnel avec une ancienneté >18 mois", "Très stable — équipe clé inchangée depuis 2+ ans, plan de succession structuré en place"]
            },
            es: {
              text: "¿Cuán estable ha sido la composición de su equipo de ventas en los últimos 12 meses?",
              description: "Piense en las bajas voluntarias, despidos y cuánto tiempo lleva su equipo actual en sus puestos",
              purpose: "La estabilidad del personal es un indicador adelantado de la cultura, la competitividad salarial y la calidad de la gestión — y predice directamente la consistencia futura de ventas y las puntuaciones de experiencia del cliente.",
              situationAnalysis: "Una alta rotación en el equipo de ventas destruye el conocimiento institucional, infla los costes de contratación y formación, interrumpe las relaciones con los clientes y reduce el volumen durante los periodos de adaptación de los nuevos empleados.",
              benefits: "Los equipos estables cierran más, retienen más clientes, obtienen mejores puntuaciones de satisfacción y tienen un coste de mantenimiento significativamente menor que los entornos con alta rotación.",
              scaleLabels: ["Alta rotación — más de la mitad del equipo ha cambiado en 12 meses", "Rotación significativa — 3 o más bajas este año", "Moderada — 1–2 bajas reemplazadas con niveles de experiencia similares", "Estable — bajas mínimas, la mayoría del personal con antigüedad >18 meses", "Muy estable — equipo principal sin cambios en más de 2 años, plan de sucesión estructurado"]
            },
            it: {
              text: "Quanto è stata stabile la composizione del Suo team commerciale negli ultimi 12 mesi?",
              description: "Consideri le dimissioni volontarie, i licenziamenti e da quanto tempo il team attuale ricopre i propri ruoli",
              purpose: "La stabilità del personale è un indicatore anticipatore della cultura aziendale, della competitività retributiva e della qualità manageriale — e predice direttamente la costanza delle vendite future e i punteggi di soddisfazione del cliente.",
              situationAnalysis: "Un elevato turnover del team commerciale distrugge il know-how aziendale, aumenta i costi di reclutamento e formazione, interrompe le relazioni con i clienti e comprime i volumi durante i periodi di inserimento dei nuovi assunti.",
              benefits: "Team stabili vendono di più, fidelizzano più clienti, ottengono punteggi di soddisfazione migliori e comportano costi significativamente inferiori rispetto ad ambienti ad alto turnover.",
              scaleLabels: ["Elevato turnover — più della metà del team è cambiata negli ultimi 12 mesi", "Turnover significativo — 3 o più uscite quest'anno", "Moderato — 1–2 uscite sostituite con livelli di esperienza simili", "Stabile — uscite minime, anzianità della maggior parte del personale >18 mesi", "Molto stabile — team principale invariato da 2+ anni, piani di successione strutturati"]
            }
          }
        },
        {
          id: "nvs-kpi-4",
          kind: "data",
          text: "What is your average front-end gross profit per new vehicle retailed?",
          description: "Average front-end gross profit (selling price minus invoice cost minus discounts) per new vehicle retailed, before finance and insurance income.",
          type: "currency",
          category: "performance_data",
          subSection: "performance_data",
          kpiKey: "nvs_gross_profit_per_unit",
          unit: "EUR",
          referencePeriod: "last_calendar_month",
          validRange: { min: 0, max: 15000 },
          formula: {
            expression: "Total front-end gross profit on new vehicles sold ÷ number of new vehicles retailed",
            example: "€420,000 total front-end gross ÷ 120 units sold = €3,500 per unit",
            dataSource: "DMS sales journal — new vehicle deals report (front-end gross by unit)"
          },
          translations: {
            en: {
              text: "What is your average front-end gross profit per new vehicle retailed?",
              description: "Average front-end gross profit (selling price minus invoice cost minus discounts) per new vehicle retailed, before finance and insurance income."
            },
            de: {
              text: "Wie hoch ist Ihr durchschnittlicher Frontend-Bruttoertrag pro verkauftem Neufahrzeug?",
              description: "Durchschnittlicher Frontend-Bruttoertrag (Verkaufspreis minus Einstandspreis minus Rabatte) pro verkauftem Neufahrzeug, vor Finanzierungs- und Versicherungserträgen."
            },
            fr: {
              text: "Quelle est votre marge brute front-end moyenne par véhicule neuf vendu au détail ?",
              description: "Marge brute front-end moyenne (prix de vente moins coût facture moins remises) par véhicule neuf vendu au détail, avant revenus de financement et d'assurance."
            },
            es: {
              text: "¿Cuál es su margen bruto medio por vehículo nuevo vendido al público?",
              description: "Margen bruto medio (precio de venta menos coste de factura menos descuentos) por vehículo nuevo vendido al público, antes de ingresos por financiación y seguros."
            },
            it: {
              text: "Qual è il Suo margine lordo front-end medio per veicolo nuovo venduto al dettaglio?",
              description: "Margine lordo front-end medio (prezzo di vendita meno costo di fattura meno sconti) per veicolo nuovo venduto al dettaglio, prima dei ricavi da finanziamenti e assicurazioni."
            }
          }
        },
        {
          id: "nvs-kpi-7",
          kind: "data",
          text: "What percentage of your new vehicle leads receive a response within 1 hour?",
          description: "Share of all new vehicle sales leads (phone, web form, third-party portals) that receive a first response from a sales consultant within 60 minutes of arrival.",
          type: "percentage",
          category: "performance_data",
          subSection: "performance_data",
          kpiKey: "nvs_lead_response_1h_pct",
          unit: "%",
          referencePeriod: "last_calendar_month",
          validRange: { min: 0, max: 100 },
          formula: {
            expression: "Number of new vehicle leads responded to within 1 hour ÷ total new vehicle leads received × 100",
            example: "342 leads responded to within 1 hour ÷ 480 total leads × 100 = 71.3%",
            dataSource: "CRM lead response time report (lead arrival timestamp vs. first outbound activity timestamp)"
          },
          translations: {
            en: {
              text: "What percentage of your new vehicle leads receive a response within 1 hour?",
              description: "Share of all new vehicle sales leads (phone, web form, third-party portals) that receive a first response from a sales consultant within 60 minutes of arrival."
            },
            de: {
              text: "Welcher Anteil Ihrer Neuwagen-Leads erhält innerhalb von 1 Stunde eine Antwort?",
              description: "Anteil aller Neuwagen-Verkaufsanfragen (Telefon, Webformular, Drittportale), die innerhalb von 60 Minuten nach Eingang eine erste Antwort von einem Verkaufsberater erhalten."
            },
            fr: {
              text: "Quel pourcentage de vos prospects véhicules neufs reçoit une réponse dans l'heure ?",
              description: "Part de l'ensemble des prospects de vente de véhicules neufs (téléphone, formulaire web, portails tiers) recevant une première réponse d'un conseiller commercial dans les 60 minutes suivant leur arrivée."
            },
            es: {
              text: "¿Qué porcentaje de sus oportunidades de vehículos nuevos reciben respuesta en menos de 1 hora?",
              description: "Proporción de todas las oportunidades de venta de vehículos nuevos (teléfono, formulario web, portales de terceros) que reciben una primera respuesta de un asesor comercial en un plazo de 60 minutos desde su recepción."
            },
            it: {
              text: "Quale percentuale dei Suoi lead per veicoli nuovi riceve una risposta entro 1 ora?",
              description: "Quota di tutti i lead di vendita di veicoli nuovi (telefono, modulo web, portali terzi) che ricevono una prima risposta da un consulente commerciale entro 60 minuti dall'arrivo."
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
        },
        fr: {
          description: "Évaluez vos opérations de véhicules d'occasion, vos stratégies tarifaires et votre positionnement sur le marché"
        },
        es: {
          description: "Evalúe sus operaciones de vehículos de ocasión, estrategias de precios y posicionamiento en el mercado"
        },
        it: {
          description: "Valuti le operazioni di vendita di veicoli usati, le strategie di prezzo e il posizionamento di mercato"
        }
      },
      questions: [
        {
          id: "uvs-1",
          kind: "scored",
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
          primarySignalCode: 'PROCESS_NOT_STANDARDISED',
          secondarySignalCode: 'GOVERNANCE_WEAK',
          rootCauseDimension: 'process',
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
            },
            fr: {
              text: "En moyenne, combien de jours les véhicules d'occasion restent-ils en stock avant d'être vendus ?",
              description: "Calculez le nombre moyen de jours entre l'acquisition et la conclusion de la vente",
              scaleLabels: [">90 jours en moyenne", "61–90 jours", "46–60 jours", "31–45 jours", "≤30 jours en moyenne"]
            },
            es: {
              text: "De media, ¿cuántos días permanecen los vehículos de ocasión en su inventario antes de venderse?",
              description: "Calcule los días medios desde la adquisición hasta la finalización de la venta",
              scaleLabels: [">90 días de media", "61–90 días", "46–60 días", "31–45 días", "≤30 días de media"]
            },
            it: {
              text: "In media, quanti giorni i veicoli usati rimangono nel Suo magazzino prima di essere venduti?",
              description: "Calcoli la media dei giorni dall'acquisizione alla conclusione della vendita",
              scaleLabels: [">90 giorni in media", "61–90 giorni", "46–60 giorni", "31–45 giorni", "≤30 giorni in media"]
            }
          }
        },
        {
          id: "uvs-2",
          kind: "scored",
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
          primarySignalCode: 'KPI_NOT_REVIEWED',
          secondarySignalCode: 'PROCESS_NOT_STANDARDISED',
          rootCauseDimension: 'process',
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
            },
            fr: {
              text: "Quelle est la marge brute moyenne que votre concessionnaire réalise sur les ventes de véhicules d'occasion ?",
              description: "Calculez le profit par unité après les coûts de remise en état et d'acquisition",
              scaleLabels: [">14 jours en moyenne", "11–14 jours", "8–10 jours", "5–7 jours", "≤4 jours en moyenne"]
            },
            es: {
              text: "¿Cuál es el margen bruto medio que obtiene su concesionario en las ventas de vehículos de ocasión?",
              description: "Calcule el beneficio por unidad tras los costes de reacondicionamiento y adquisición",
              scaleLabels: [">14 días de media", "11–14 días", "8–10 días", "5–7 días", "≤4 días de media"]
            },
            it: {
              text: "Qual è il margine lordo medio che la Sua concessionaria realizza sulle vendite di veicoli usati?",
              description: "Calcoli il profitto per unità al netto dei costi di ricondizionamento e di acquisizione",
              scaleLabels: [">14 giorni in media", "11–14 giorni", "8–10 giorni", "5–7 giorni", "≤4 giorni in media"]
            }
          }
        },
        {
          id: "uvs-3",
          kind: "scored",
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
          primarySignalCode: 'PROCESS_NOT_STANDARDISED',
          rootCauseDimension: 'process',
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
            },
            fr: {
              text: "Quelle est la précision de vos estimations initiales de reprise par rapport aux prix de vente finaux réalisés ?",
              description: "Mesurez la cohérence entre les valeurs d'expertise et les résultats de vente réels",
              scaleLabels: ["Plus de 21 jours de délai de remise en état", "15–21 jours", "10–14 jours", "6–9 jours", "Moins de 5 jours — pipeline de remise en état de référence"]
            },
            es: {
              text: "¿Cuán precisas son sus valoraciones iniciales de vehículos entregados a cuenta en comparación con los precios finales de venta logrados?",
              description: "Mida la consistencia entre los valores de tasación y los resultados reales de venta",
              scaleLabels: ["Más de 21 días de tiempo de reacondicionamiento", "15-21 días", "10-14 días", "6-9 días", "Menos de 5 días — pipeline de reacondicionamiento de primer nivel"]
            },
            it: {
              text: "Quanto sono accurate le Sue valutazioni iniziali di permuta rispetto ai prezzi di vendita effettivamente realizzati?",
              description: "Misuri la coerenza tra i valori di perizia e i risultati effettivi di vendita",
              scaleLabels: ["Più di 21 giorni di ricondizionamento", "15-21 giorni", "10-14 giorni", "6-9 giorni", "Meno di 5 giorni — pipeline di ricondizionamento best-in-class"]
            }
          }
        },
        {
          id: "uvs-4",
          kind: "scored",
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
          primarySignalCode: 'GOVERNANCE_WEAK',
          secondarySignalCode: 'PROCESS_NOT_EXECUTED',
          rootCauseDimension: 'process',
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
            },
            fr: {
              text: "Quel est votre coût moyen par véhicule pour la remise en état et la préparation des véhicules d'occasion à la vente ?",
              description: "Incluez les réparations mécaniques, la préparation esthétique et les améliorations cosmétiques",
              scaleLabels: ["<30%", "30–40%", "41–55%", "56–70%", ">70%"]
            },
            es: {
              text: "¿Cuál es su coste medio por vehículo para el reacondicionamiento y preparación de vehículos de ocasión para la venta?",
              description: "Incluya reparaciones mecánicas, detallado y mejoras estéticas",
              scaleLabels: ["<30%", "30–40%", "41–55%", "56–70%", ">70%"]
            },
            it: {
              text: "Qual è il costo medio per veicolo per il ricondizionamento e la preparazione dei veicoli usati alla vendita?",
              description: "Includa riparazioni meccaniche, detailing e interventi estetici",
              scaleLabels: ["<30%", "30–40%", "41–55%", "56–70%", ">70%"]
            }
          }
        },
        {
          id: "uvs-5",
          kind: "scored",
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
          primarySignalCode: 'TOOL_UNDERUTILISED',
          rootCauseDimension: 'tools',
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
            },
            fr: {
              text: "Comment évalueriez-vous la qualité et l'efficacité de vos annonces de véhicules d'occasion en ligne ?",
              description: "Considérez la qualité des photos, la précision des descriptions, la transparence des prix et le temps de réponse",
              scaleLabels: ["<10%", "10–20%", "21–35%", "36–50%", ">50%"]
            },
            es: {
              text: "¿Cómo valoraría la calidad y eficacia de sus anuncios de vehículos de ocasión en línea?",
              description: "Considere la calidad de las fotografías, la precisión de las descripciones, la transparencia de precios y el tiempo de respuesta",
              scaleLabels: ["<10%", "10–20%", "21–35%", "36–50%", ">50%"]
            },
            it: {
              text: "Come valuterebbe la qualità e l'efficacia dei Suoi annunci online di veicoli usati?",
              description: "Consideri la qualità delle foto, l'accuratezza delle descrizioni, la trasparenza dei prezzi e i tempi di risposta",
              scaleLabels: ["<10%", "10–20%", "21–35%", "36–50%", ">50%"]
            }
          }
        },
        {
          id: "uvs-6",
          kind: "scored",
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
          primarySignalCode: 'CAPACITY_MISALIGNED',
          rootCauseDimension: 'structure',
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
            },
            fr: {
              text: "Quel pourcentage des véhicules que vous achetez aux enchères s'avère rentable après la revente ?",
              description: "Suivez quels achats en vente aux enchères génèrent des marges positives",
              scaleLabels: ["<500 €", "500–800 €", "801–1 100 €", "1 101–1 500 €", ">1 500 €"]
            },
            es: {
              text: "¿Qué porcentaje de los vehículos que compra en subastas resultan rentables tras la reventa?",
              description: "Haga seguimiento de qué compras en subasta generan márgenes positivos",
              scaleLabels: ["<€500", "€500–€800", "€801–€1.100", "€1.101–€1.500", ">€1.500"]
            },
            it: {
              text: "Quale percentuale dei veicoli acquistati all'asta risulta redditizia dopo la rivendita?",
              description: "Monitori quali acquisti all'asta generano margini positivi",
              scaleLabels: ["<€500", "€500–€800", "€801–€1.100", "€1.101–€1.500", ">€1.500"]
            }
          }
        },
        {
          id: "uvs-7",
          kind: "scored",
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
          primarySignalCode: 'KPI_NOT_REVIEWED',
          rootCauseDimension: 'process',
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
            },
            fr: {
              text: "Comment les clients évaluent-ils leur satisfaction globale concernant leur expérience d'achat de véhicule d'occasion ?",
              description: "Sur la base d'enquêtes post-achat et de retours dans les 30 jours suivant la vente",
              scaleLabels: ["Très insatisfait", "En dessous de la moyenne", "Moyen", "Bon", "Excellent"]
            },
            es: {
              text: "¿Cómo valoran los clientes su satisfacción general con la experiencia de compra de vehículos de ocasión?",
              description: "Basado en encuestas posteriores a la compra y opiniones dentro de los 30 días siguientes a la venta",
              scaleLabels: ["Muy insatisfecho", "Por debajo de la media", "Promedio", "Bueno", "Excelente"]
            },
            it: {
              text: "Come valutano i clienti la loro soddisfazione complessiva riguardo all'esperienza di acquisto di un veicolo usato?",
              description: "Sulla base di sondaggi post-acquisto e feedback raccolti entro 30 giorni dalla vendita",
              scaleLabels: ["Molto insoddisfatto", "Sotto la media", "Nella media", "Buono", "Eccellente"]
            }
          }
        },
        {
          id: "uvs-8",
          kind: "scored",
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
          primarySignalCode: 'TOOL_UNDERUTILISED',
          secondarySignalCode: 'PROCESS_NOT_EXECUTED',
          rootCauseDimension: 'tools',
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
            },
            fr: {
              text: "Quel pourcentage des acheteurs de véhicules d'occasion souscrit des extensions de garantie ou des contrats d'entretien ?",
              description: "Incluez tous les produits de protection proposés au moment de la vente",
              scaleLabels: ["100 % dépendant des enchères", "Principalement enchères, quelques reprises", "Équilibre entre enchères et reprises", "Reprise dominante, enchères sélectives", "Diversifié : reprises, flottes, achat direct"]
            },
            es: {
              text: "¿Qué porcentaje de compradores de vehículos de ocasión adquieren garantías extendidas o contratos de servicio?",
              description: "Incluya todos los productos de protección ofrecidos en el punto de venta",
              scaleLabels: ["100% dependiente de subastas", "Principalmente subasta, algo de entrega a cuenta", "Equilibrio entre subasta y entrega a cuenta", "Predomina la entrega a cuenta, subasta selectiva", "Diversificado: entrega a cuenta, flotas, compra directa"]
            },
            it: {
              text: "Quale percentuale degli acquirenti di veicoli usati acquista garanzie estese o contratti di assistenza?",
              description: "Includa tutti i prodotti di protezione offerti al momento della vendita",
              scaleLabels: ["100% dipendente da aste", "Prevalentemente aste, qualche permuta", "Equilibrio tra aste e permute", "Prevalenza di permute, aste selettive", "Diversificato: permute, flotte, acquisto diretto"]
            }
          }
        },
        {
          id: "uvs-9",
          kind: "scored",
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
          primarySignalCode: 'PROCESS_NOT_STANDARDISED',
          rootCauseDimension: 'process',
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
            },
            fr: {
              text: "Comment vos prix de véhicules d'occasion se comparent-ils à ceux de véhicules similaires sur votre marché local ?",
              description: "Considérez la tarification par rapport aux concurrents dans un rayon de 80 km",
              scaleLabels: ["Aucune présence numérique", "Annonces basiques uniquement", "Multi-plateformes avec photos", "Campagnes ciblées avec données", "Tunnel numérique complet avec retargeting"]
            },
            es: {
              text: "¿Cómo se comparan sus precios de vehículos de ocasión con los de vehículos similares en su mercado local?",
              description: "Considere los precios en relación con la competencia en un radio de 80 kilómetros",
              scaleLabels: ["Sin presencia digital", "Solo anuncios básicos", "Multiplataforma con fotografías", "Campañas segmentadas con datos", "Embudo digital completo con retargeting"]
            },
            it: {
              text: "Come si colloca il prezzo dei Suoi veicoli usati rispetto a veicoli simili nel mercato locale?",
              description: "Consideri il posizionamento di prezzo rispetto ai concorrenti in un raggio di 80 km",
              scaleLabels: ["Nessuna presenza digitale", "Solo annunci di base", "Multi-piattaforma con foto", "Campagne mirate basate sui dati", "Funnel digitale completo con retargeting"]
            }
          }
        },
        {
          id: "uvs-10",
          kind: "scored",
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
          primarySignalCode: 'GOVERNANCE_WEAK',
          secondarySignalCode: 'PROCESS_NOT_STANDARDISED',
          rootCauseDimension: 'process',
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
            },
            fr: {
              text: "Quelle est l'efficacité de votre stratégie de gestion des véhicules invendus depuis plus de 60 jours ?",
              description: "Décrivez votre approche de réduction du stock vieillissant et vos ajustements tarifaires",
              scaleLabels: ["Aucun processus — les véhicules vieillissent sans intervention", "Baisses de prix ponctuelles uniquement sous la pression", "Déclencheur de revue à 30 jours avec ajustement tarifaire basique", "Revue structurée à 21 jours, marketing ciblé, règle de sortie à 45 jours", "Suivi en temps réel avec ajustements tarifaires automatisés et stratégie de sortie proactive"]
            },
            es: {
              text: "¿Cuán eficaz es su estrategia para gestionar vehículos que permanecen sin vender más de 60 días?",
              description: "Describa su enfoque de reducción de inventario antiguo y ajustes de precios",
              scaleLabels: ["Sin proceso — los vehículos envejecen sin intervención", "Bajadas de precio puntuales solo cuando aumenta la presión", "Revisión cada 30 días con ajuste básico de precio", "Revisión estructurada cada 21 días, marketing dirigido, regla de salida a los 45 días", "Seguimiento en tiempo real con ajustes de precio automatizados y estrategia proactiva de disposición"]
            },
            it: {
              text: "Quanto è efficace la Sua strategia per gestire i veicoli che rimangono invenduti per più di 60 giorni?",
              description: "Descriva il Suo approccio alla riduzione del magazzino datato e agli aggiustamenti di prezzo",
              scaleLabels: ["Nessun processo — i veicoli invecchiano senza intervento", "Riduzioni di prezzo ad hoc solo quando la pressione aumenta", "Revisione al 30° giorno con aggiustamento di prezzo di base", "Revisione strutturata al 21° giorno, marketing mirato, regola di uscita al 45° giorno", "Monitoraggio in tempo reale con aggiustamenti di prezzo automatizzati e strategia proattiva di smaltimento"]
            }
          }
        },
        {
          id: "uvs-11",
          kind: "scored",
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
          primarySignalCode: 'PROCESS_NOT_EXECUTED',
          rootCauseDimension: 'process',
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
            },
            fr: {
              text: "Lorsque les clients achètent un véhicule neuf chez vous, à quelle fréquence reprennent-ils leur véhicule existant auprès du concessionnaire plutôt que de le vendre en privé ?",
              description: "Estimez la proportion de transactions de véhicules neufs incluant également une expertise et une acquisition de reprise en interne",
              purpose: "Le taux de captation des reprises est à la fois un KPI d'approvisionnement en véhicules d'occasion et un signal de fidélisation client — les reprises perdues représentent de la marge brute perdue, du stock VO perdu et une relation client affaiblie.",
              situationAnalysis: "Les concessionnaires qui intègrent l'expertise à chaque conversation de vente de véhicules neufs obtiennent un stock moins cher et en meilleur état que les alternatives en vente aux enchères, tout en fidélisant le client sur les deux transactions.",
              benefits: "Un taux de captation des reprises plus élevé améliore la marge VO (vs coût en vente aux enchères), sécurise un stock à historique connu et approfondit la relation client à travers plusieurs départements.",
              scaleLabels: ["Rarement proposé — clients orientés ailleurs ou vendent en privé", "Proposé occasionnellement, <25 % des acheteurs reprennent avec nous", "Capté dans 25–40 % des transactions VN", "Expertise structurée présentée à chaque transaction, taux de captation 41–60 %", "Expertise intégrée au processus de vente, >60 % des acheteurs reprennent avec nous"]
            },
            es: {
              text: "Cuando los clientes le compran un vehículo nuevo, ¿con qué frecuencia entregan su coche actual a cuenta en el concesionario en lugar de venderlo de forma privada?",
              description: "Estime la proporción de transacciones de vehículos nuevos que incluyen una tasación y adquisición del vehículo entregado a cuenta en el propio concesionario",
              purpose: "La tasa de captación de entregas a cuenta es tanto un KPI de aprovisionamiento de vehículos de ocasión como una señal de retención del cliente — las entregas a cuenta perdidas representan margen bruto perdido, stock de vehículos de ocasión perdido y una relación con el cliente debilitada.",
              situationAnalysis: "Los concesionarios que integran la tasación en cada conversación de venta de vehículos nuevos aseguran stock más económico y en mejor estado que las alternativas de subasta, al tiempo que retienen al cliente en ambas transacciones.",
              benefits: "Una mayor captación de entregas a cuenta mejora el margen de vehículos de ocasión (frente al coste de subasta), asegura stock con historial conocido y profundiza la relación con el cliente a través de múltiples departamentos.",
              scaleLabels: ["Raramente se ofrece — los clientes son dirigidos a otros canales o venden de forma privada", "Se ofrece ocasionalmente, <25% de los compradores entregan a cuenta con nosotros", "Captada en el 25–40% de las operaciones de vehículos nuevos", "Tasación estructurada presentada en cada operación, tasa de captación del 41–60%", "Tasación integrada en el proceso de ventas, >60% de los compradores entregan a cuenta con nosotros"]
            },
            it: {
              text: "Quando i clienti acquistano un veicolo nuovo da Lei, con quale frequenza permutano il loro veicolo esistente presso la concessionaria anziché venderlo privatamente?",
              description: "Stimi la proporzione di transazioni di veicoli nuovi che includono anche una valutazione e un'acquisizione di permuta interna",
              purpose: "Il tasso di acquisizione delle permute è sia un KPI di approvvigionamento di veicoli usati che un indicatore di fidelizzazione del cliente — le permute perse rappresentano margine lordo perso, stock di veicoli usati perso e una relazione con il cliente indebolita.",
              situationAnalysis: "Le concessionarie che integrano la valutazione in ogni trattativa di veicolo nuovo si assicurano stock a minor costo e in migliori condizioni rispetto alle alternative d'asta, mantenendo il cliente su entrambe le transazioni.",
              benefits: "Una maggiore acquisizione di permute migliora il margine sui veicoli usati (rispetto al costo d'asta), garantisce stock con storia nota e approfondisce la relazione con il cliente su più reparti.",
              scaleLabels: ["Raramente offerta — i clienti vengono indirizzati altrove o vendono privatamente", "Offerta occasionalmente, <25% degli acquirenti permuta con noi", "Acquisita nel 25–40% delle trattative di veicoli nuovi", "Valutazione strutturata presentata su ogni trattativa, tasso di acquisizione 41–60%", "Valutazione integrata nel processo di vendita, >60% degli acquirenti permuta con noi"]
            }
          }
        },
        {
          id: "uvs-12",
          kind: "scored",
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
          primarySignalCode: 'PROCESS_NOT_STANDARDISED',
          rootCauseDimension: 'process',
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
            },
            fr: {
              text: "Comment votre niveau de stock actuel de véhicules d'occasion se rapporte-t-il au nombre d'unités que vous vendez habituellement par mois ?",
              description: "Considérez si votre politique de stockage et la profondeur actuelle de votre stock sont bien adaptées à votre rythme de vente réel",
              purpose: "Le ratio stock/ventes régit l'efficacité du déploiement des capitaux, l'exposition aux coûts de portage et la question de savoir si l'entreprise dispose de la profondeur appropriée pour soutenir des ventes régulières sans surinvestir dans des unités vieillissantes.",
              situationAnalysis: "Le sous-stockage comme le surstockage détruisent la rentabilité — le premier par les ventes perdues et le second par les coûts d'intérêts, la dépréciation et les liquidations à prix réduit. Un objectif d'approvisionnement discipliné est une discipline opérationnelle clé.",
              benefits: "Le maintien d'un ratio stock/ventes discipliné réduit les coûts de financement, minimise le risque de stock vieillissant et assure une disponibilité constante sans surengagement de capital.",
              scaleLabels: ["Aucune politique de stock — nous vendons ce qui est disponible", "Réactif — le stock fluctue significativement d'un mois à l'autre sans objectif", "Un objectif approximatif existe mais le ratio stock/ventes dépasse souvent 75 jours d'approvisionnement", "Géré selon un objectif de 45–60 jours d'approvisionnement, revu mensuellement", "Géré activement selon un objectif de 30–45 jours, revu hebdomadairement avec données de marché en temps réel"]
            },
            es: {
              text: "¿Cómo se relaciona su nivel actual de stock de vehículos de ocasión con el número de unidades que vende normalmente al mes?",
              description: "Considere si su política de stock y la profundidad de inventario actual están bien ajustadas a su ritmo real de ventas",
              purpose: "La ratio stock/ventas determina la eficiencia del despliegue de capital, la exposición a costes de mantenimiento y si el negocio tiene la profundidad adecuada para sostener ventas consistentes sin sobreinvertir en unidades envejecidas.",
              situationAnalysis: "Tanto el infra-stock como el sobre-stock destruyen la rentabilidad — el primero por ventas perdidas y el segundo por costes financieros, depreciación y liquidación con descuento. Un objetivo de aprovisionamiento disciplinado es una disciplina operativa clave.",
              benefits: "Mantener una ratio stock/ventas disciplinada reduce los costes de financiación de inventario, minimiza el riesgo de stock envejecido y garantiza disponibilidad constante sin sobrecompromiso de capital.",
              scaleLabels: ["Sin política de stock — vendemos lo que haya disponible", "Reactivo — el stock fluctúa significativamente mes a mes sin objetivo", "Existe un objetivo aproximado pero la ratio stock/ventas frecuentemente supera los 75 días de suministro", "Gestionado con un objetivo de 45–60 días de suministro, revisado mensualmente", "Gestionado activamente con un objetivo de 30–45 días de suministro, revisado semanalmente con datos de mercado en tiempo real"]
            },
            it: {
              text: "Come si rapporta il Suo attuale livello di stock di veicoli usati al numero di unità che vende tipicamente al mese?",
              description: "Consideri se la politica di approvvigionamento e la profondità attuale del magazzino sono ben calibrate rispetto al tasso di vendita effettivo",
              purpose: "Il rapporto stock/vendite governa l'efficienza nell'impiego del capitale, l'esposizione ai costi di mantenimento e la capacità di sostenere vendite costanti senza sovrainvestire in unità che invecchiano.",
              situationAnalysis: "Sia il sotto che il sovrapprovvigionamento distruggono la redditività — il primo attraverso vendite perse e il secondo attraverso oneri finanziari, svalutazione e smaltimento a sconto. Un obiettivo disciplinato di approvvigionamento è una disciplina operativa fondamentale.",
              benefits: "Mantenere un rapporto stock/vendite disciplinato riduce i costi di floor plan, minimizza il rischio di stock datato e garantisce disponibilità costante senza sovraimpiego di capitale.",
              scaleLabels: ["Nessuna politica di stock — vendiamo ciò che capita di avere disponibile", "Reattivo — lo stock fluttua significativamente di mese in mese senza obiettivo", "Esiste un obiettivo approssimativo ma il rapporto stock/vendite spesso supera i 75 giorni di copertura", "Gestito con un obiettivo di 45–60 giorni di copertura, rivisto mensilmente", "Gestito attivamente con un obiettivo di 30–45 giorni, rivisto settimanalmente con dati di mercato in tempo reale"]
            }
          }
        },
        {
          id: "uvs-13",
          kind: "scored",
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
          primarySignalCode: 'ROLE_OWNERSHIP_MISSING',
          rootCauseDimension: 'people',
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
            },
            fr: {
              text: "Comment décririez-vous le niveau d'expérience et l'expertise spécialisée des personnes gérant votre activité de véhicules d'occasion ?",
              description: "Pensez à l'ancienneté de votre responsable VO, sa connaissance du marché et le degré d'autonomie de la fonction",
              purpose: "L'expertise spécialisée en véhicules d'occasion est l'un des meilleurs prédicteurs de la performance de marge brute VO — les responsables expérimentés expertisent mieux, achètent moins cher et fixent les prix plus précisément que les généralistes.",
              situationAnalysis: "La rentabilité des véhicules d'occasion dépend de manière disproportionnée du responsable car les marges sont déterminées transaction par transaction à travers des décisions d'expertise, d'achat et de tarification qui nécessitent une connaissance approfondie du marché.",
              benefits: "Investir dans un management spécialisé de l'activité VO se rentabilise rapidement grâce à une meilleure précision des expertises, de meilleurs achats, un contrôle des stocks plus serré et une marge brute par unité plus élevée.",
              scaleLabels: ["Pas de responsable VO dédié — géré par l'équipe VN", "Activité VO gérée en responsabilité secondaire par un responsable existant", "Responsable VO dédié, mais relativement nouveau (<2 ans dans le poste)", "Responsable VO expérimenté (2–5 ans dans le poste) avec un processus clair de tarification et d'approvisionnement", "Direction VO spécialisée avec 5+ ans d'expérience, responsabilité propre du P&L et outils d'intelligence de marché"]
            },
            es: {
              text: "¿Cómo describiría el nivel de experiencia y conocimiento especializado de las personas que gestionan su operación de vehículos de ocasión?",
              description: "Piense en la antigüedad de su responsable de vehículos de ocasión, su conocimiento del mercado y con qué autonomía opera la función",
              purpose: "La experiencia especializada en vehículos de ocasión es uno de los predictores más fiables del rendimiento del margen bruto — los responsables experimentados tasan mejor, compran más barato y fijan precios con mayor precisión que los generalistas.",
              situationAnalysis: "La rentabilidad de vehículos de ocasión depende desproporcionadamente del responsable porque los márgenes se determinan operación por operación a través de decisiones de tasación, aprovisionamiento y fijación de precios que requieren un profundo conocimiento del mercado.",
              benefits: "Invertir en gestión especializada de vehículos de ocasión se recupera rápidamente mediante mejor precisión de tasación, mejores compras, control de inventario más ajustado y mayor margen bruto por unidad.",
              scaleLabels: ["Sin responsable dedicado de vehículos de ocasión — gestionado por el equipo de vehículos nuevos", "La función de vehículos de ocasión es una responsabilidad secundaria de un responsable existente", "Responsable dedicado de vehículos de ocasión, pero relativamente nuevo (<2 años en el puesto)", "Responsable experimentado de vehículos de ocasión (2–5 años en el puesto) con proceso claro de fijación de precios y aprovisionamiento", "Liderazgo especializado en vehículos de ocasión con más de 5 años de experiencia, P&L propio y herramientas de inteligencia de mercado"]
            },
            it: {
              text: "Come descriverebbe il livello di esperienza e le competenze specialistiche delle persone che gestiscono il Suo reparto veicoli usati?",
              description: "Consideri l'anzianità del responsabile usato, la conoscenza del mercato e il grado di autonomia operativa della funzione",
              purpose: "La competenza specialistica nei veicoli usati è uno dei più forti predittori delle performance di margine lordo sull'usato — i responsabili esperti valutano meglio, acquistano a minor costo e prezzano con maggiore accuratezza rispetto ai generalisti.",
              situationAnalysis: "La redditività dei veicoli usati dipende in modo sproporzionato dal responsabile perché i margini vengono determinati trattativa per trattativa attraverso decisioni di valutazione, approvvigionamento e prezzo che richiedono una profonda conoscenza del mercato.",
              benefits: "Investire nella gestione specializzata dei veicoli usati produce un ritorno rapido attraverso una migliore accuratezza nelle valutazioni, acquisti più vantaggiosi, un controllo più stretto del magazzino e un margine lordo per unità più elevato.",
              scaleLabels: ["Nessun responsabile usato dedicato — gestito dal team del nuovo", "La funzione usato è gestita come responsabilità secondaria da un manager esistente", "Responsabile usato dedicato, ma relativamente nuovo (<2 anni nel ruolo)", "Responsabile usato esperto (2–5 anni nel ruolo) con processi chiari di prezzo e approvvigionamento", "Leadership specializzata per l'usato con 5+ anni di esperienza, responsabilità diretta del conto economico e strumenti di intelligence di mercato"]
            }
          }
        },
        {
          id: "uvs-kpi-2",
          kind: "data",
          text: "What is your average days-to-sale for used vehicle stock?",
          description: "Average number of days a used vehicle remains in stock from intake to retail sale (Standtage).",
          type: "numeric",
          category: "performance_data",
          subSection: "performance_data",
          kpiKey: "uvs_days_to_sale",
          unit: "days",
          referencePeriod: "last_calendar_month",
          validRange: { min: 0, max: 365 },
          formula: {
            expression: "Sum of days in stock for all used vehicles sold in the period ÷ number of used vehicles sold",
            example: "2,640 total stock-days across 60 units sold ÷ 60 = 44 days average days-to-sale",
            dataSource: "DMS used vehicle inventory aging report"
          },
          translations: {
            en: {
              text: "What is your average days-to-sale for used vehicle stock?",
              description: "Average number of days a used vehicle remains in stock from intake to retail sale (Standtage)."
            },
            de: {
              text: "Wie hoch sind Ihre durchschnittlichen Standtage für Gebrauchtwagenbestand?",
              description: "Durchschnittliche Anzahl der Tage, die ein Gebrauchtwagen von der Einlagerung bis zum Verkauf im Bestand verbleibt (Standtage)."
            },
            fr: {
              text: "Quel est votre délai moyen de vente pour le stock de véhicules d'occasion ?",
              description: "Nombre moyen de jours pendant lesquels un véhicule d'occasion reste en stock de l'entrée à la vente au détail (Standtage)."
            },
            es: {
              text: "¿Cuál es su media de días de permanencia en stock para vehículos de ocasión?",
              description: "Número medio de días que un vehículo de ocasión permanece en stock desde su entrada hasta la venta al público (Standtage)."
            },
            it: {
              text: "Qual è la Sua media di giorni di permanenza in stock per i veicoli usati?",
              description: "Numero medio di giorni in cui un veicolo usato rimane in stock dall'ingresso alla vendita al dettaglio (Standtage)."
            }
          }
        },
        {
          id: "uvs-kpi-3",
          kind: "data",
          text: "What is your average front-end gross profit per used vehicle retailed?",
          description: "Average front-end gross profit per used vehicle retailed (sale price minus acquisition cost and reconditioning, before finance and insurance income).",
          type: "currency",
          category: "performance_data",
          subSection: "performance_data",
          kpiKey: "uvs_gross_profit_per_unit",
          unit: "EUR",
          referencePeriod: "last_calendar_month",
          validRange: { min: 0, max: 15000 },
          formula: {
            expression: "Total front-end gross profit on used vehicles sold ÷ number of used vehicles retailed",
            example: "€180,000 total front-end gross ÷ 60 units sold = €3,000 per unit",
            dataSource: "DMS used vehicle deals report (front-end gross per unit)"
          },
          translations: {
            en: {
              text: "What is your average front-end gross profit per used vehicle retailed?",
              description: "Average front-end gross profit per used vehicle retailed (sale price minus acquisition cost and reconditioning, before finance and insurance income)."
            },
            de: {
              text: "Wie hoch ist Ihr durchschnittlicher Frontend-Bruttoertrag pro verkauftem Gebrauchtwagen?",
              description: "Durchschnittlicher Frontend-Bruttoertrag pro verkauftem Gebrauchtwagen (Verkaufspreis minus Einkaufspreis und Aufbereitungskosten, vor F&I-Erträgen)."
            },
            fr: {
              text: "Quelle est votre marge brute front-end moyenne par véhicule d'occasion vendu au détail ?",
              description: "Marge brute front-end moyenne par véhicule d'occasion vendu au détail (prix de vente moins coût d'acquisition et remise en état, avant revenus de financement et d'assurance)."
            },
            es: {
              text: "¿Cuál es su margen bruto medio por vehículo de ocasión vendido al público?",
              description: "Margen bruto medio por vehículo de ocasión vendido al público (precio de venta menos coste de adquisición y reacondicionamiento, antes de ingresos por financiación y seguros)."
            },
            it: {
              text: "Qual è il Suo margine lordo front-end medio per veicolo usato venduto al dettaglio?",
              description: "Margine lordo front-end medio per veicolo usato venduto al dettaglio (prezzo di vendita meno costo di acquisizione e ricondizionamento, prima dei ricavi da finanziamenti e assicurazioni)."
            }
          }
        },
        {
          id: "uvs-kpi-5",
          kind: "data",
          text: "What is your average vehicle reconditioning cost per unit?",
          description: "Average reconditioning cost (parts, labour, and outsourced services) per used vehicle prepared for retail sale.",
          type: "currency",
          category: "performance_data",
          subSection: "performance_data",
          kpiKey: "uvs_recon_cost_per_unit",
          unit: "EUR",
          referencePeriod: "last_calendar_month",
          validRange: { min: 0, max: 10000 },
          formula: {
            expression: "Total reconditioning cost across all used vehicles prepared ÷ number of used vehicles prepared",
            example: "€42,000 total reconditioning cost ÷ 60 units = €700 per unit",
            dataSource: "DMS reconditioning work order costs, summed by stock number"
          },
          translations: {
            en: {
              text: "What is your average vehicle reconditioning cost per unit?",
              description: "Average reconditioning cost (parts, labour, and outsourced services) per used vehicle prepared for retail sale."
            },
            de: {
              text: "Wie hoch sind Ihre durchschnittlichen Aufbereitungskosten pro Gebrauchtfahrzeug?",
              description: "Durchschnittliche Aufbereitungskosten (Teile, Arbeitszeit und Fremdleistungen) pro für den Verkauf vorbereitetem Gebrauchtfahrzeug."
            },
            fr: {
              text: "Quel est votre coût moyen de remise en état par véhicule ?",
              description: "Coût moyen de remise en état (pièces de rechange, main-d'œuvre et services externalisés) par véhicule d'occasion préparé pour la vente au détail."
            },
            es: {
              text: "¿Cuál es su coste medio de reacondicionamiento por unidad?",
              description: "Coste medio de reacondicionamiento (recambios, mano de obra y servicios externalizados) por vehículo de ocasión preparado para venta al público."
            },
            it: {
              text: "Qual è il Suo costo medio di ricondizionamento per unità?",
              description: "Costo medio di ricondizionamento (ricambi, manodopera e servizi esternalizzati) per veicolo usato preparato per la vendita al dettaglio."
            }
          }
        },
        {
          id: "uvs-kpi-6",
          kind: "data",
          text: "What is your used-to-new retail ratio (UV units / NV units)?",
          description: "Ratio of used vehicle retail units sold to new vehicle retail units sold in the same period.",
          type: "ratio",
          category: "performance_data",
          subSection: "performance_data",
          kpiKey: "uvs_used_to_new_ratio",
          unit: "x:1",
          referencePeriod: "last_calendar_month",
          validRange: { min: 0, max: 10 },
          formula: {
            expression: "Used vehicle units retailed ÷ new vehicle units retailed",
            example: "60 used units ÷ 120 new units = 0.5:1",
            dataSource: "DMS sales summary — new vs. used unit counts"
          },
          translations: {
            en: {
              text: "What is your used-to-new retail ratio (UV units / NV units)?",
              description: "Ratio of used vehicle retail units sold to new vehicle retail units sold in the same period."
            },
            de: {
              text: "Wie hoch ist Ihr Verhältnis von Gebrauchtwagen- zu Neuwagenverkäufen (GW-Einheiten / NW-Einheiten)?",
              description: "Verhältnis der verkauften Gebrauchtwagen-Einheiten zu den verkauften Neuwagen-Einheiten im selben Zeitraum."
            },
            fr: {
              text: "Quel est votre ratio occasion/neuf (unités VO / unités VN) ?",
              description: "Ratio d'unités de véhicules d'occasion vendues au détail par rapport aux unités de véhicules neufs vendues au détail sur la même période."
            },
            es: {
              text: "¿Cuál es su ratio de venta de vehículos de ocasión frente a nuevos (unidades VO / unidades VN)?",
              description: "Ratio de unidades de vehículos de ocasión vendidas al público respecto a las unidades de vehículos nuevos vendidas al público en el mismo periodo."
            },
            it: {
              text: "Qual è il Suo rapporto vendite usato/nuovo (unità VU / unità VN)?",
              description: "Rapporto tra le unità di veicoli usati venduti al dettaglio e le unità di veicoli nuovi venduti al dettaglio nello stesso periodo."
            }
          }
        },
        {
          id: "uvs-kpi-7",
          kind: "data",
          text: "What percentage of used vehicle appraisals result in a purchase?",
          description: "Share of used vehicle appraisals (trade-ins and outright purchase offers) that convert into an actual purchase by the dealership.",
          type: "percentage",
          category: "performance_data",
          subSection: "performance_data",
          kpiKey: "uvs_appraisal_to_buy_pct",
          unit: "%",
          referencePeriod: "last_calendar_month",
          validRange: { min: 0, max: 100 },
          formula: {
            expression: "Number of appraisals resulting in a purchase ÷ total appraisals conducted × 100",
            example: "45 appraisals purchased ÷ 150 appraisals conducted × 100 = 30%",
            dataSource: "Appraisal tool / CRM appraisal log outcome report"
          },
          translations: {
            en: {
              text: "What percentage of used vehicle appraisals result in a purchase?",
              description: "Share of used vehicle appraisals (trade-ins and outright purchase offers) that convert into an actual purchase by the dealership."
            },
            de: {
              text: "Welcher Anteil Ihrer Gebrauchtwagen-Bewertungen führt zu einem Ankauf?",
              description: "Anteil der Gebrauchtwagen-Bewertungen (Inzahlungnahmen und Ankaufsangebote), die zu einem tatsächlichen Ankauf durch den Betrieb führen."
            },
            fr: {
              text: "Quel pourcentage des expertises de véhicules d'occasion aboutit à un achat ?",
              description: "Part des expertises de véhicules d'occasion (reprises et offres d'achat ferme) se convertissant en achat effectif par le concessionnaire."
            },
            es: {
              text: "¿Qué porcentaje de tasaciones de vehículos de ocasión resultan en una compra?",
              description: "Proporción de tasaciones de vehículos de ocasión (entregas a cuenta y ofertas de compra directa) que se convierten en una compra efectiva por parte del concesionario."
            },
            it: {
              text: "Quale percentuale delle valutazioni di veicoli usati si traduce in un acquisto?",
              description: "Quota di valutazioni di veicoli usati (permute e offerte di acquisto diretto) che si convertono in un acquisto effettivo da parte della concessionaria."
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
        },
        fr: {
          description: "Évaluez l'efficacité de votre service après-vente, la satisfaction client et la rentabilité"
        },
        es: {
          description: "Evalúe la eficiencia de su departamento de servicio, la satisfacción del cliente y la rentabilidad"
        },
        it: {
          description: "Valuti l'efficienza del reparto assistenza, la soddisfazione dei clienti e la redditività"
        }
      },
      questions: [
        {
          id: "svc-1",
          kind: "scored",
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
          primarySignalCode: 'CAPACITY_MISALIGNED',
          secondarySignalCode: 'PROCESS_NOT_EXECUTED',
          rootCauseDimension: 'structure',
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
            },
            fr: {
              text: "Quel pourcentage des heures disponibles de vos techniciens est consacré à du travail productif facturable ?",
              description: "Calculez les heures de main-d'œuvre productives divisées par le total des heures disponibles",
              scaleLabels: ["<60%", "60–70%", "71–80%", "81–89%", "≥90%"]
            },
            es: {
              text: "¿Qué porcentaje de las horas disponibles de sus técnicos se dedica a trabajo productivo facturable?",
              description: "Calcule las horas de mano de obra productiva divididas por el total de horas disponibles",
              scaleLabels: ["<60%", "60–70%", "71–80%", "81–89%", "≥90%"]
            },
            it: {
              text: "Quale percentuale delle ore disponibili dei Suoi tecnici viene dedicata a lavoro fatturabile e produttivo?",
              description: "Calcoli le ore di manodopera produttive divise per le ore totali disponibili",
              scaleLabels: ["<60%", "60–70%", "71–80%", "81–89%", "≥90%"]
            }
          }
        },
        {
          id: "svc-2",
          kind: "scored",
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
          primarySignalCode: 'PROCESS_NOT_STANDARDISED',
          secondarySignalCode: 'KPI_NOT_REVIEWED',
          rootCauseDimension: 'process',
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
            },
            fr: {
              text: "Quel pourcentage de votre taux horaire affiché réalisez-vous effectivement sur les travaux payés par le client ?",
              description: "Comparez le taux horaire effectif à votre taux horaire affiché",
              scaleLabels: ["<75%", "75–80%", "81–86%", "87–92%", ">92%"]
            },
            es: {
              text: "¿Qué porcentaje de su tarifa de mano de obra publicada se realiza efectivamente en trabajos de clientes particulares?",
              description: "Compare la tarifa efectiva de mano de obra con su tarifa de puerta publicada",
              scaleLabels: ["<75%", "75–80%", "81–86%", "87–92%", ">92%"]
            },
            it: {
              text: "Quale percentuale della tariffa oraria pubblicata realizza effettivamente sui lavori a pagamento del cliente?",
              description: "Confronti la tariffa oraria effettiva con la tariffa esposta",
              scaleLabels: ["<75%", "75–80%", "81–86%", "87–92%", ">92%"]
            }
          }
        },
        {
          id: "svc-3",
          kind: "scored",
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
          primarySignalCode: 'CAPACITY_MISALIGNED',
          rootCauseDimension: 'structure',
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
            },
            fr: {
              text: "Dans quel délai les clients peuvent-ils généralement obtenir un rendez-vous pour un entretien courant chez votre concessionnaire ?",
              description: "Mesurez le temps d'attente moyen entre la demande et le créneau de rendez-vous disponible",
              scaleLabels: ["Moins de 150 € par OR", "150–220 € par OR, en dessous du référentiel", "220–300 € par OR, à la moyenne européenne", "300–400 € par OR, au-dessus de la moyenne", "Plus de 400 € par OR, processus d'inspection multi-points actif"]
            },
            es: {
              text: "¿Con qué antelación pueden los clientes obtener una cita para el servicio de mantenimiento habitual en su concesionario?",
              description: "Mida el tiempo medio de espera desde la solicitud hasta la plaza de cita disponible",
              scaleLabels: ["Por debajo de €150 ARO", "€150-€220 ARO, por debajo del benchmark", "€220-€300 ARO, en la media europea", "€300-€400 ARO, por encima de la media", "Por encima de €400 ARO, proceso activo de inspección multipunto"]
            },
            it: {
              text: "In quanto tempo i clienti possono tipicamente ottenere un appuntamento per la manutenzione ordinaria presso la Sua concessionaria?",
              description: "Misuri il tempo medio di attesa dalla richiesta allo slot di appuntamento disponibile",
              scaleLabels: ["Sotto €150 di scontrino medio per ordine di riparazione", "€150-€220 scontrino medio, sotto il benchmark", "€220-€300 scontrino medio, nella media europea", "€300-€400 scontrino medio, sopra la media", "Sopra €400 scontrino medio, processo attivo di ispezione multipunto"]
            }
          }
        },
        {
          id: "svc-4",
          kind: "scored",
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
          primarySignalCode: 'PROCESS_NOT_EXECUTED',
          secondarySignalCode: 'ROLE_OWNERSHIP_MISSING',
          rootCauseDimension: 'people',
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
            },
            fr: {
              text: "Quel pourcentage des réparations est réalisé correctement dès la première visite sans nécessiter de retour ?",
              description: "Suivez les retours et les réparations répétées pour le même problème",
              scaleLabels: ["<10%", "10–18%", "19–27%", "28–36%", ">36%"]
            },
            es: {
              text: "¿Qué porcentaje de reparaciones se completan correctamente en la primera visita sin requerir un retorno?",
              description: "Realice seguimiento de las repeticiones y reparaciones recurrentes por el mismo problema",
              scaleLabels: ["<10%", "10–18%", "19–27%", "28–36%", ">36%"]
            },
            it: {
              text: "Quale percentuale delle riparazioni viene completata correttamente alla prima visita senza necessità di ritorno?",
              description: "Monitori i ritorni e le riparazioni ripetute per lo stesso problema",
              scaleLabels: ["<10%", "10–18%", "19–27%", "28–36%", ">36%"]
            }
          }
        },
        {
          id: "svc-5",
          kind: "scored",
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
          primarySignalCode: 'KPI_NOT_REVIEWED',
          rootCauseDimension: 'process',
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
            },
            fr: {
              text: "Comment les clients évaluent-ils leur expérience globale avec votre service après-vente ?",
              description: "Sur la base d'enquêtes post-intervention et de notations de satisfaction",
              scaleLabels: ["Très insatisfait", "En dessous de la moyenne", "Moyen", "Bon", "Excellent"]
            },
            es: {
              text: "¿Cómo valoran los clientes su experiencia general con su departamento de servicio?",
              description: "Basado en encuestas posteriores al servicio y valoraciones de satisfacción",
              scaleLabels: ["Muy insatisfecho", "Por debajo de la media", "Promedio", "Bueno", "Excelente"]
            },
            it: {
              text: "Come valutano i clienti la loro esperienza complessiva con il Suo reparto assistenza?",
              description: "Sulla base di sondaggi post-assistenza e valutazioni di soddisfazione",
              scaleLabels: ["Molto insoddisfatto", "Sotto la media", "Nella media", "Buono", "Eccellente"]
            }
          }
        },
        {
          id: "svc-6",
          kind: "scored",
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
          primarySignalCode: 'PROCESS_NOT_EXECUTED',
          rootCauseDimension: 'process',
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
            },
            fr: {
              text: "Quel pourcentage de vos demandes de garantie est approuvé et remboursé avec succès par le constructeur ?",
              description: "Suivez le taux de réussite de soumission des demandes de garantie",
              scaleLabels: ["<45%", "45–55%", "56–65%", "66–75%", ">75%"]
            },
            es: {
              text: "¿Qué porcentaje de sus reclamaciones de garantía son aprobadas y reembolsadas con éxito por el fabricante?",
              description: "Realice seguimiento de la tasa de éxito de las reclamaciones de garantía presentadas",
              scaleLabels: ["<45%", "45–55%", "56–65%", "66–75%", ">75%"]
            },
            it: {
              text: "Quale percentuale delle Sue richieste di garanzia viene approvata e rimborsata con successo dal costruttore?",
              description: "Monitori il tasso di successo delle richieste di garanzia presentate",
              scaleLabels: ["<45%", "45–55%", "56–65%", "66–75%", ">75%"]
            }
          }
        },
        {
          id: "svc-7",
          kind: "scored",
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
          primarySignalCode: 'ROLE_OWNERSHIP_MISSING',
          rootCauseDimension: 'people',
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
            },
            fr: {
              text: "Quel pourcentage de vos techniciens détient des certifications ASE en cours de validité ou des accréditations constructeur équivalentes ?",
              description: "Comptez les techniciens certifiés en pourcentage du personnel technique total",
              scaleLabels: [">10 jours en moyenne", "7–10 jours", "4–6 jours", "2–3 jours", "Disponibilité le lendemain"]
            },
            es: {
              text: "¿Qué porcentaje de sus técnicos posee certificaciones ASE vigentes o credenciales equivalentes del fabricante?",
              description: "Cuente los técnicos certificados como porcentaje del total del personal técnico",
              scaleLabels: [">10 días de media", "7–10 días", "4–6 días", "2–3 días", "Disponibilidad al día siguiente"]
            },
            it: {
              text: "Quale percentuale dei Suoi tecnici possiede certificazioni ASE aggiornate o credenziali equivalenti del costruttore?",
              description: "Calcoli i tecnici certificati come percentuale del personale tecnico totale",
              scaleLabels: [">10 giorni in media", "7–10 giorni", "4–6 giorni", "2–3 giorni", "Disponibilità il giorno successivo"]
            }
          }
        },
        {
          id: "svc-8",
          kind: "scored",
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
          primarySignalCode: 'KPI_NOT_REVIEWED',
          secondarySignalCode: 'GOVERNANCE_WEAK',
          rootCauseDimension: 'process',
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
            },
            fr: {
              text: "Quel pourcentage de vos clients du service après-vente revient pour un entretien supplémentaire dans les 12 mois ?",
              description: "Suivez les visites de clients récurrents hors interventions de garantie obligatoires",
              scaleLabels: [">8%", "6–8%", "4–5%", "2–3%", "<2%"]
            },
            es: {
              text: "¿Qué porcentaje de sus clientes de servicio vuelven para un servicio adicional en un plazo de 12 meses?",
              description: "Realice seguimiento de las visitas de clientes recurrentes excluyendo el servicio obligatorio por garantía",
              scaleLabels: [">8%", "6–8%", "4–5%", "2–3%", "<2%"]
            },
            it: {
              text: "Quale percentuale dei Suoi clienti assistenza ritorna per ulteriori interventi entro 12 mesi?",
              description: "Monitori le visite ricorrenti dei clienti escludendo gli interventi obbligatori in garanzia",
              scaleLabels: [">8%", "6–8%", "4–5%", "2–3%", "<2%"]
            }
          }
        },
        {
          id: "svc-9",
          kind: "scored",
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
          primarySignalCode: 'CAPACITY_MISALIGNED',
          rootCauseDimension: 'structure',
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
            },
            fr: {
              text: "Lorsqu'un technicien a besoin d'une pièce, à quelle fréquence est-elle immédiatement disponible dans votre stock de pièces de rechange ?",
              description: "Suivez la disponibilité des pièces pour les ordres de réparation en atelier",
              scaleLabels: ["Aucune offre de mobilité", "<20 % des réservations", "20–40 % des réservations", "41–65 % des réservations", ">65 % des réservations"]
            },
            es: {
              text: "Cuando un técnico necesita un recambio, ¿con qué frecuencia está disponible de inmediato en su inventario de recambios?",
              description: "Realice seguimiento de la disponibilidad de recambios para las órdenes de reparación de servicio",
              scaleLabels: ["Sin oferta de movilidad", "<20% de las reservas", "20–40% de las reservas", "41–65% de las reservas", ">65% de las reservas"]
            },
            it: {
              text: "Quando un tecnico ha bisogno di un ricambio, con quale frequenza è immediatamente disponibile nel Suo magazzino ricambi?",
              description: "Monitori la disponibilità dei ricambi per gli ordini di lavoro del reparto assistenza",
              scaleLabels: ["Nessuna offerta di mobilità", "<20% delle prenotazioni", "20–40% delle prenotazioni", "41–65% delle prenotazioni", ">65% delle prenotazioni"]
            }
          }
        },
        {
          id: "svc-10",
          kind: "scored",
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
          primarySignalCode: 'TOOL_UNDERUTILISED',
          rootCauseDimension: 'tools',
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
            },
            fr: {
              text: "Dans quelle mesure utilisez-vous efficacement les outils numériques pour tenir les clients informés de l'état d'entretien de leur véhicule ?",
              description: "Incluez les mises à jour par SMS, les vidéos d'intervention, les inspections numériques et le paiement en ligne",
              scaleLabels: ["Aucune communication numérique — appels téléphoniques uniquement", "Mises à jour par e-mail sur demande uniquement", "Mises à jour proactives par SMS/e-mail à l'achèvement des travaux", "Rapports d'inspection numériques avec photos, paiement en ligne disponible", "Parcours numérique complet — inspection vidéo, suivi d'état, paiement en ligne, enquête de suivi"]
            },
            es: {
              text: "¿Con qué eficacia utiliza herramientas digitales para mantener informados a los clientes sobre el estado de servicio de su vehículo?",
              description: "Incluya actualizaciones por SMS, vídeos de servicio, inspecciones digitales y pago en línea",
              scaleLabels: ["Sin comunicación digital — solo llamadas telefónicas", "Actualizaciones por correo electrónico solo bajo petición", "Actualizaciones proactivas por SMS/correo electrónico al completar el trabajo", "Informes de inspección digital con fotografías, pago en línea disponible", "Recorrido digital completo — inspección en vídeo, seguimiento de estado, pago en línea, encuesta de seguimiento"]
            },
            it: {
              text: "Con quale efficacia utilizza strumenti digitali per tenere i clienti informati sullo stato dell'assistenza del loro veicolo?",
              description: "Includa aggiornamenti via SMS, video dell'assistenza, ispezioni digitali e pagamento online",
              scaleLabels: ["Nessuna comunicazione digitale — solo telefonate", "Aggiornamenti via email solo su richiesta", "Aggiornamenti proattivi SMS/email al completamento del lavoro", "Report di ispezione digitali con foto, pagamento online disponibile", "Percorso digitale completo — video ispezione, tracker stato, pagamento online, sondaggio di follow-up"]
            }
          }
        },
        {
          id: "svc-11",
          kind: "scored",
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
          primarySignalCode: 'CAPACITY_MISALIGNED',
          secondarySignalCode: 'PROCESS_NOT_EXECUTED',
          rootCauseDimension: 'structure',
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
            },
            fr: {
              text: "Combien d'ordres de réparation chaque conseiller après-vente traite-t-il en moyenne par jour ?",
              description: "Calculez le nombre moyen quotidien d'OR par conseiller",
              scaleLabels: ["Moins de 6 OR par conseiller par jour", "6–8 OR par jour, en dessous du référentiel", "9–11 OR par jour, au référentiel européen", "12–14 OR par jour, au-dessus de la moyenne", "15+ OR par jour, fonctionnement haute efficacité avec support de workflow DMS"]
            },
            es: {
              text: "¿Cuántas órdenes de reparación procesa cada asesor de servicio normalmente al día?",
              description: "Calcule el promedio diario de órdenes de reparación por asesor",
              scaleLabels: ["Menos de 6 órdenes de reparación por asesor al día", "6-8 órdenes de reparación al día, por debajo del benchmark", "9-11 órdenes de reparación al día, en el benchmark europeo", "12-14 órdenes de reparación al día, por encima de la media", "15+ órdenes de reparación al día, operación de alta eficiencia con soporte de flujo de trabajo DMS"]
            },
            it: {
              text: "Quanti ordini di riparazione gestisce ogni accettatore in media al giorno?",
              description: "Calcoli il numero medio giornaliero di ordini di riparazione per accettatore",
              scaleLabels: ["Meno di 6 ordini di riparazione per accettatore al giorno", "6-8 ordini di riparazione al giorno, sotto il benchmark", "9-11 ordini di riparazione al giorno, al benchmark europeo", "12-14 ordini di riparazione al giorno, sopra la media", "15+ ordini di riparazione al giorno, operatività ad alta efficienza con supporto workflow DMS"]
            }
          }
        },
        {
          id: "svc-12",
          kind: "scored",
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
          primarySignalCode: 'PROCESS_NOT_EXECUTED',
          rootCauseDimension: 'process',
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
            },
            fr: {
              text: "Comment évalueriez-vous l'efficacité et le débit de votre service rapide ou voie express ?",
              description: "Considérez les temps d'attente, la rapidité du service et la satisfaction client pour le service rapide",
              scaleLabels: ["Aucun processus numérique", "Mises à jour par e-mail uniquement", "Mises à jour SMS sur demande", "Mises à jour proactives par SMS/application", "Parcours numérique complet avec vidéo"]
            },
            es: {
              text: "¿Cómo valoraría la eficiencia y el rendimiento de su línea de servicio rápido o exprés?",
              description: "Considere los tiempos de espera, la velocidad del servicio y la satisfacción del cliente en el servicio rápido",
              scaleLabels: ["Sin proceso digital", "Solo actualizaciones por correo electrónico", "Actualizaciones por SMS bajo petición", "Actualizaciones proactivas por SMS/app", "Recorrido digital completo con vídeo"]
            },
            it: {
              text: "Come valuterebbe l'efficienza e la produttività della Sua corsia di assistenza rapida o express?",
              description: "Consideri i tempi di attesa, la velocità dell'assistenza e la soddisfazione del cliente per il servizio rapido",
              scaleLabels: ["Nessun processo digitale", "Solo aggiornamenti via email", "Aggiornamenti SMS su richiesta", "Aggiornamenti proattivi SMS/app", "Percorso digitale completo con video"]
            }
          }
        },
        {
          id: "svc-13",
          kind: "scored",
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
          primarySignalCode: 'PROCESS_NOT_EXECUTED',
          rootCauseDimension: 'process',
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
            },
            fr: {
              text: "À quelle fréquence les véhicules reviennent-ils dans votre atelier dans les 30 jours pour le même défaut signalé ?",
              description: "Pensez aux retours en atelier — les cas où la réparation initiale n'a pas résolu la plainte du client",
              purpose: "Le taux de réparation au premier passage (inverse du taux de retour) est le principal indicateur de qualité d'un service après-vente — il influence directement la confiance client, l'efficacité de l'atelier et l'exposition aux coûts de garantie.",
              situationAnalysis: "Chaque retour consomme un emplacement de pont, le temps d'un technicien et la capacité d'un conseiller tout en générant zéro revenu et en dégradant la confiance du client. Une seule réparation répétée peut coûter 3 à 5 fois le travail initial en coûts opérationnels cachés.",
              benefits: "Réduire les retours libère de la capacité en atelier sans ajouter d'effectifs, protège les scores CSI, réduit l'exposition à la garantie et constitue l'une des améliorations les plus rentables en opérations fixes.",
              scaleLabels: [">8 % des réparations entraînent un retour — aucun suivi en place", "5–8 % de taux de retour, revu de manière informelle", "3–5 % de taux de retour, causes racines discutées en réunion d'équipe", "1–3 % de taux de retour, suivi par technicien et revue structurée", "<1 % de taux de retour, réparation au premier passage suivie quotidiennement et intégrée aux KPI des techniciens"]
            },
            es: {
              text: "¿Con qué frecuencia vuelven los vehículos a su taller en un plazo de 30 días por la misma avería reportada?",
              description: "Piense en las repeticiones de reparación — casos en los que la reparación original no resolvió la reclamación del cliente",
              purpose: "La tasa de resolución a la primera (inversa de la tasa de repeticiones) es la métrica de calidad principal de un departamento de servicio — impulsa directamente la confianza del cliente, la eficiencia del taller y la exposición a costes de garantía.",
              situationAnalysis: "Cada repetición consume una plaza de puesto, el tiempo de un técnico y la capacidad de un asesor de servicio sin generar ingresos y dañando la confianza del cliente. Una sola reparación repetida puede costar entre 3 y 5 veces el trabajo original en costes operativos ocultos.",
              benefits: "Reducir las repeticiones libera capacidad de puestos sin aumentar la plantilla, protege las puntuaciones CSI, reduce la exposición a garantías y es una de las mejoras más rentables disponibles en operaciones fijas.",
              scaleLabels: [">8% de las reparaciones resultan en repetición — sin seguimiento implantado", "Tasa de repetición del 5–8%, revisada de forma informal", "Tasa de repetición del 3–5%, causas raíz analizadas en reuniones de equipo", "Tasa de repetición del 1–3%, seguimiento por técnico y revisión estructurada", "Tasa de repetición <1%, resolución a la primera monitorizada diariamente e integrada en los KPI de los técnicos"]
            },
            it: {
              text: "Con quale frequenza i veicoli ritornano nel Suo reparto assistenza entro 30 giorni per lo stesso guasto segnalato?",
              description: "Consideri i ritorni in officina — casi in cui la riparazione originale non ha risolto il problema lamentato dal cliente",
              purpose: "Il tasso di risoluzione al primo intervento (inverso del tasso di ritorno) è la metrica di qualità primaria per un reparto assistenza — influenza direttamente la fiducia del cliente, l'efficienza dell'officina e l'esposizione ai costi di garanzia.",
              situationAnalysis: "Ogni ritorno occupa una postazione, il tempo di un tecnico e la capacità di un accettatore senza generare alcun ricavo e danneggiando la fiducia del cliente. Una singola riparazione ripetuta può costare 3–5 volte il lavoro originale in costi operativi nascosti.",
              benefits: "Ridurre i ritorni libera capacità di officina senza aggiungere personale, protegge i punteggi CSI, riduce l'esposizione alla garanzia ed è uno dei miglioramenti più efficaci in termini di costi nelle operazioni fisse.",
              scaleLabels: [">8% delle riparazioni genera un ritorno — nessun monitoraggio attivo", "5–8% tasso di ritorno, rivisto informalmente", "3–5% tasso di ritorno, cause analizzate nelle riunioni di team", "1–3% tasso di ritorno, monitoraggio per tecnico e revisione strutturata", "<1% tasso di ritorno, risoluzione al primo intervento monitorata quotidianamente e integrata nei KPI dei tecnici"]
            }
          }
        },
        {
          id: "svc-14",
          kind: "scored",
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
          primarySignalCode: 'PROCESS_NOT_STANDARDISED',
          rootCauseDimension: 'incentives',
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
            },
            fr: {
              text: "Lorsqu'un conseiller après-vente recommande des travaux ou des éléments de maintenance supplémentaires au-delà de ce que le client a initialement réservé, à quelle fréquence les clients approuvent-ils ces travaux ?",
              description: "Considérez toutes les recommandations de vente additionnelle et de réparations supplémentaires faites lors de la réception du véhicule ou en cours d'intervention",
              purpose: "Le taux d'approbation des recommandations du conseiller après-vente capture à la fois la qualité des compétences de présentation des besoins et la confiance que les clients accordent à votre équipe — c'est le principal levier pour augmenter le chiffre d'affaires main-d'œuvre par visite sans accroître le nombre de véhicules.",
              situationAnalysis: "Les clients arrivent souvent sans connaître les besoins de maintenance en développement. Une présentation confiante et fondée sur des preuves (ex. vidéo de l'usure des pneus, photo de l'usure des freins) convertit significativement mieux que les recommandations uniquement verbales — et c'est une compétence mesurable et entraînable.",
              benefits: "Une amélioration de 10 points de pourcentage du taux d'approbation ajoute généralement 8 à 15 % au chiffre d'affaires total du service sans aucune augmentation des dépenses marketing ou du nombre de clients.",
              scaleLabels: ["Nous faisons rarement des recommandations au-delà de l'entretien réservé", "Recommandations faites de manière ponctuelle, taux d'approbation non suivi", "Recommandations faites de manière régulière mais taux d'approbation inférieur à 20 %", "Recommandations structurées par menu, taux d'approbation de 20–35 % suivi mensuellement", "Recommandations consultatives à valeur ajoutée avec preuves photo/vidéo, taux d'approbation >35 % suivi par conseiller"]
            },
            es: {
              text: "Cuando un asesor de servicio recomienda trabajos adicionales o elementos de mantenimiento más allá de lo que el cliente reservó originalmente, ¿con qué frecuencia aprueban los clientes ese trabajo?",
              description: "Considere todas las recomendaciones de venta adicional y reparaciones complementarias realizadas en el momento de la recepción del vehículo o durante el servicio",
              purpose: "La tasa de aprobación de recomendaciones del asesor de servicio refleja tanto la calidad de las habilidades de presentación de necesidades como la confianza que los clientes depositan en su equipo de servicio — es la palanca principal para aumentar los ingresos de mano de obra por visita sin incrementar el número de vehículos.",
              situationAnalysis: "Los clientes a menudo llegan sin ser conscientes de las necesidades de mantenimiento que se están desarrollando. Una presentación segura y basada en evidencias (p. ej., vídeo del desgaste de neumáticos, fotografía del desgaste de frenos) convierte significativamente mejor que las recomendaciones únicamente verbales — y es una habilidad medible y entrenable.",
              benefits: "Una mejora de 10 puntos porcentuales en la tasa de aprobación suele añadir entre un 8% y un 15% a los ingresos totales de servicio sin ningún incremento en el gasto de marketing ni en el número de clientes.",
              scaleLabels: ["Raramente hacemos recomendaciones más allá del servicio reservado", "Recomendaciones realizadas de forma puntual, tasa de aprobación no monitorizada", "Recomendaciones realizadas de forma consistente pero tasa de aprobación por debajo del 20%", "Recomendaciones estructuradas basadas en menú, tasa de aprobación del 20–35% monitorizada mensualmente", "Recomendaciones consultivas orientadas al valor con evidencia fotográfica/vídeo, tasa de aprobación >35% monitorizada por asesor"]
            },
            it: {
              text: "Quando un accettatore raccomanda lavori aggiuntivi o interventi di manutenzione oltre a quanto prenotato dal cliente, con quale frequenza i clienti approvano tali lavori?",
              description: "Consideri tutte le raccomandazioni di upsell e riparazioni aggiuntive formulate al momento dell'accettazione del veicolo o durante l'assistenza",
              purpose: "Il tasso di approvazione delle raccomandazioni dell'accettatore cattura sia la qualità delle competenze di presentazione dei bisogni che la fiducia che i clienti ripongono nel team di assistenza — è la leva principale per far crescere i ricavi di manodopera per visita senza aumentare il numero di veicoli.",
              situationAnalysis: "I clienti spesso arrivano inconsapevoli delle esigenze di manutenzione emergenti. Una presentazione sicura e basata sull'evidenza (es. video dell'usura degli pneumatici, foto dell'usura dei freni) converte significativamente meglio delle sole raccomandazioni verbali — ed è una competenza misurabile e formabile.",
              benefits: "Un miglioramento di 10 punti percentuali nel tasso di approvazione tipicamente aggiunge l'8–15% ai ricavi totali dell'assistenza senza alcun aumento della spesa di marketing o del numero di clienti.",
              scaleLabels: ["Raramente formuliamo raccomandazioni oltre all'assistenza prenotata", "Raccomandazioni formulate ad hoc, tasso di approvazione non monitorato", "Raccomandazioni formulate costantemente ma tasso di approvazione inferiore al 20%", "Raccomandazioni strutturate a menu, tasso di approvazione 20–35% monitorato mensilmente", "Raccomandazioni consultive basate sul valore con foto/video a supporto, tasso di approvazione >35% monitorato per accettatore"]
            }
          }
        },
        {
          id: "svc-15",
          kind: "scored",
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
          primarySignalCode: 'KPI_NOT_REVIEWED',
          rootCauseDimension: 'process',
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
            },
            fr: {
              text: "Parmi les clients qui ont acheté un véhicule chez vous au cours des deux dernières années, quelle proportion revient régulièrement dans votre atelier pour l'entretien ?",
              description: "Pensez aux propriétaires de véhicules qui pourraient se faire entretenir chez vous mais choisissent un concurrent, un indépendant, ou pas d'entretien du tout",
              purpose: "La rétention en service après-vente à partir des ventes de véhicules est l'un des indicateurs de revenus à long terme les plus critiques dans l'automobile — un client retenu en service génère 2 à 4 fois la valeur vie d'un client limité à la vente.",
              situationAnalysis: "Chaque véhicule vendu mais non retenu en service représente une perte de marge sur les pièces de rechange, de revenus de main-d'œuvre, d'influence sur les achats répétés et de visibilité sur le prochain cycle d'achat du client. La rétention est généralement la plus élevée dans les 12 premiers mois après l'achat — la période où l'investissement compte le plus.",
              benefits: "Chaque point de pourcentage d'amélioration de la rétention en service se traduit directement en revenus récurrents d'opérations fixes, une valeur vie client plus élevée et une position d'influence plus forte pour le prochain achat de véhicule.",
              scaleLabels: ["Aucune visibilité — nous ne suivons pas cela", "Nous estimons que <30 % reviennent, mais aucun programme de rétention actif", "Environ 30–50 % de rétention en service, campagnes de rappel occasionnelles", "50–70 % de rétention en service avec plan d'entretien structuré ou programme de rappel", ">70 % de rétention en service, programme de fidélité actif, pénétration des plans d'entretien >40 %"]
            },
            es: {
              text: "De los clientes que le compraron un vehículo en los últimos dos años, ¿qué proporción vuelve regularmente a su taller para el mantenimiento?",
              description: "Piense en los propietarios de vehículos que podrían hacer el servicio con usted pero eligen un competidor, un taller independiente o simplemente no lo hacen",
              purpose: "La retención de servicio de las ventas de vehículos es una de las métricas de ingresos a largo plazo más críticas en automoción — un cliente de servicio retenido genera entre 2 y 4 veces el valor de vida de un cliente solo de ventas.",
              situationAnalysis: "Cada vehículo vendido pero no retenido en servicio representa margen de recambios perdido, ingresos de mano de obra perdidos, influencia perdida en la próxima compra y pérdida de visibilidad del ciclo de compra del cliente. La retención suele ser más alta en los primeros 12 meses tras la compra — la ventana donde la inversión más importa.",
              benefits: "Cada punto porcentual de mejora en la retención de servicio se traduce directamente en ingresos recurrentes de operaciones fijas, mayor valor de vida del cliente y una posición de influencia más sólida para la siguiente compra de vehículo.",
              scaleLabels: ["Sin visibilidad — no monitorizamos esto", "Creemos que <30% vuelven, pero sin programa activo de retención", "Retención de servicio aproximada del 30–50%, campañas de recordatorio ocasionales", "Retención de servicio del 50–70% con plan de servicio estructurado o programa de recordatorios", ">70% de retención de servicio, programa de fidelización activo, penetración de planes de servicio >40%"]
            },
            it: {
              text: "Dei clienti che hanno acquistato un veicolo da Lei negli ultimi due anni, quale proporzione ritorna regolarmente nella Sua officina per la manutenzione?",
              description: "Consideri i proprietari di veicoli che potrebbero fare assistenza da Lei ma scelgono un concorrente, un'officina indipendente o non fanno assistenza affatto",
              purpose: "La fidelizzazione assistenza dalla vendita veicoli è una delle metriche di ricavo a lungo termine più critiche nel settore automobilistico — un cliente assistenza fidelizzato genera 2–4 volte il valore complessivo di un cliente di sola vendita.",
              situationAnalysis: "Ogni veicolo venduto ma non fidelizzato nell'assistenza rappresenta margine ricambi perso, ricavi di manodopera persi, influenza persa sull'acquisto successivo e visibilità persa sul prossimo ciclo di acquisto del cliente. La fidelizzazione è tipicamente più alta nei primi 12 mesi dopo l'acquisto — la finestra in cui l'investimento conta di più.",
              benefits: "Ogni punto percentuale di miglioramento nella fidelizzazione assistenza si traduce direttamente in ricavi ricorrenti delle operazioni fisse, maggiore valore del ciclo di vita del cliente e una posizione più forte per influenzare il prossimo acquisto del veicolo.",
              scaleLabels: ["Nessuna visibilità — non monitoriamo questo dato", "Riteniamo che <30% ritorni, ma nessun programma attivo di fidelizzazione", "Circa il 30–50% di fidelizzazione assistenza, campagne di promemoria occasionali", "50–70% di fidelizzazione assistenza con piano di manutenzione o programma di promemoria strutturato", ">70% di fidelizzazione assistenza, programma fedeltà attivo, penetrazione piani di manutenzione >40%"]
            }
          }
        },
        {
          id: "svc-kpi-2",
          kind: "data",
          text: "What is your average hours sold per repair order?",
          description: "Average number of labour hours sold per repair order (RO) across all workshop visits.",
          type: "numeric",
          category: "performance_data",
          subSection: "performance_data",
          kpiKey: "svc_hours_per_ro",
          unit: "hours",
          referencePeriod: "last_calendar_month",
          validRange: { min: 0, max: 20 },
          formula: {
            expression: "Total labour hours sold ÷ number of repair orders",
            example: "2,850 labour hours sold ÷ 1,500 repair orders = 1.9 hours per RO",
            dataSource: "DMS service invoicing report (sold hours by repair order)"
          },
          translations: {
            en: {
              text: "What is your average hours sold per repair order?",
              description: "Average number of labour hours sold per repair order (RO) across all workshop visits."
            },
            de: {
              text: "Wie viele Arbeitsstunden verkaufen Sie durchschnittlich pro Reparaturauftrag?",
              description: "Durchschnittliche Anzahl verkaufter Arbeitsstunden pro Reparaturauftrag (RO) über alle Werkstattbesuche."
            },
            fr: {
              text: "Quel est votre nombre moyen d'heures vendues par ordre de réparation ?",
              description: "Nombre moyen d'heures de main-d'œuvre vendues par ordre de réparation (OR) pour l'ensemble des visites atelier."
            },
            es: {
              text: "¿Cuál es su media de horas vendidas por orden de reparación?",
              description: "Número medio de horas de mano de obra vendidas por orden de reparación en todas las visitas al taller."
            },
            it: {
              text: "Qual è la Sua media di ore vendute per ordine di riparazione?",
              description: "Numero medio di ore di manodopera vendute per ordine di riparazione in tutti gli interventi di officina."
            }
          }
        },
        {
          id: "svc-kpi-5",
          kind: "data",
          text: "What is your effective labour rate (total labour revenue / hours sold)?",
          description: "Effective labour rate realised across all service work — total labour revenue divided by total hours sold, reflecting the blended rate after discounts and goodwill.",
          type: "currency",
          category: "performance_data",
          subSection: "performance_data",
          kpiKey: "svc_effective_labour_rate",
          unit: "EUR/hr",
          referencePeriod: "last_calendar_month",
          validRange: { min: 0, max: 500 },
          formula: {
            expression: "Total labour revenue ÷ total labour hours sold",
            example: "€299,250 labour revenue ÷ 2,850 hours sold = €105/hr effective rate",
            dataSource: "DMS service invoicing report — labour revenue and sold hours totals"
          },
          translations: {
            en: {
              text: "What is your effective labour rate (total labour revenue / hours sold)?",
              description: "Effective labour rate realised across all service work — total labour revenue divided by total hours sold, reflecting the blended rate after discounts and goodwill."
            },
            de: {
              text: "Wie hoch ist Ihr effektiver Stundenverrechnungssatz (Gesamtarbeitserlös / verkaufte Stunden)?",
              description: "Effektiv erzielter Stundenverrechnungssatz über alle Werkstattaufträge: Gesamtarbeitserlös geteilt durch verkaufte Stunden, einschließlich Rabatten und Kulanz."
            },
            fr: {
              text: "Quel est votre taux horaire effectif (chiffre d'affaires main-d'œuvre total / heures vendues) ?",
              description: "Taux horaire effectif réalisé sur l'ensemble des travaux d'atelier — chiffre d'affaires main-d'œuvre total divisé par le total des heures vendues, reflétant le taux moyen après remises et gestes commerciaux."
            },
            es: {
              text: "¿Cuál es su tarifa efectiva de mano de obra (ingresos totales de mano de obra / horas vendidas)?",
              description: "Tarifa efectiva de mano de obra realizada en todos los trabajos de servicio — ingresos totales de mano de obra divididos por el total de horas vendidas, reflejando la tarifa combinada tras descuentos y gestos comerciales."
            },
            it: {
              text: "Qual è la Sua tariffa oraria effettiva (ricavi totali manodopera / ore vendute)?",
              description: "Tariffa oraria effettiva realizzata su tutti i lavori di assistenza — ricavi totali di manodopera divisi per le ore totali vendute, che riflette la tariffa ponderata al netto di sconti e avviamenti."
            }
          }
        },
        {
          id: "svc-kpi-6",
          kind: "data",
          text: "What percentage of your service capacity is currently booked?",
          description: "Current workshop capacity utilisation — booked technician hours as a percentage of available productive technician hours.",
          type: "percentage",
          category: "performance_data",
          subSection: "performance_data",
          kpiKey: "svc_workshop_loading_pct",
          unit: "%",
          referencePeriod: "current",
          validRange: { min: 0, max: 150 },
          formula: {
            expression: "Booked technician hours for the period ÷ available productive technician hours × 100",
            example: "1,680 booked hours ÷ 1,600 available hours × 100 = 105%",
            dataSource: "Service scheduling / DMS workshop loading report (booked vs. available technician hours)"
          },
          translations: {
            en: {
              text: "What percentage of your service capacity is currently booked?",
              description: "Current workshop capacity utilisation — booked technician hours as a percentage of available productive technician hours."
            },
            de: {
              text: "Wie hoch ist Ihre aktuelle Werkstattauslastung (gebuchte Stunden / verfügbare Kapazität)?",
              description: "Aktuelle Auslastung der Werkstattkapazität: gebuchte Technikerstunden als Prozentsatz der verfügbaren produktiven Technikerstunden."
            },
            fr: {
              text: "Quel pourcentage de votre capacité d'atelier est actuellement réservé ?",
              description: "Taux d'utilisation actuel de la capacité atelier — heures technicien réservées en pourcentage des heures productives technicien disponibles."
            },
            es: {
              text: "¿Qué porcentaje de su capacidad de servicio está actualmente reservado?",
              description: "Utilización actual de la capacidad del taller — horas de técnico reservadas como porcentaje de las horas productivas de técnico disponibles."
            },
            it: {
              text: "Quale percentuale della Sua capacità di assistenza è attualmente prenotata?",
              description: "Utilizzo attuale della capacità di officina — ore tecnico prenotate come percentuale delle ore produttive disponibili dei tecnici."
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
        },
        fr: {
          description: "Analysez l'efficacité de votre département pièces de rechange, la gestion des stocks et la rentabilité"
        },
        es: {
          description: "Analice la eficiencia de su departamento de recambios, la gestión de inventario y la rentabilidad"
        },
        it: {
          description: "Analizzi l'efficienza del reparto ricambi, la gestione del magazzino e la redditività"
        }
      },
      questions: [
        {
          id: "pts-1",
          kind: "scored",
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
            },
            fr: {
              text: "Combien de fois par an votre stock total de pièces de rechange effectue-t-il une rotation complète via les ventes ?",
              description: "Calculez les ventes annuelles de pièces divisées par la valeur moyenne du stock",
              scaleLabels: ["<80%", "80–85%", "86–90%", "91–95%", ">95%"]
            },
            es: {
              text: "¿Cuántas veces al año rota completamente su inventario de recambios a través de las ventas?",
              description: "Calcule las ventas anuales de recambios divididas por el valor medio del inventario",
              scaleLabels: ["<80%", "80–85%", "86–90%", "91–95%", ">95%"]
            },
            it: {
              text: "Quante volte all'anno l'intero magazzino ricambi viene rinnovato attraverso le vendite?",
              description: "Calcoli le vendite annuali di ricambi divise per il valore medio del magazzino",
              scaleLabels: ["<80%", "80–85%", "86–90%", "91–95%", ">95%"]
            }
          }
        },
        {
          id: "pts-2",
          kind: "scored",
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
            },
            fr: {
              text: "Quel pourcentage des demandes de pièces pouvez-vous satisfaire immédiatement à partir de votre stock disponible ?",
              description: "Suivez le taux de disponibilité immédiate pour les demandes clients et les demandes internes de l'atelier",
              scaleLabels: ["<4× par an", "4–5× par an", "6–7× par an", "8–9× par an", "≥10× par an"]
            },
            es: {
              text: "¿Qué porcentaje de solicitudes de recambios puede satisfacer de inmediato con su stock disponible?",
              description: "Realice seguimiento de la tasa de satisfacción inmediata tanto para solicitudes de clientes como internas de servicio",
              scaleLabels: ["<4 veces al año", "4–5 veces al año", "6–7 veces al año", "8–9 veces al año", "≥10 veces al año"]
            },
            it: {
              text: "Quale percentuale delle richieste di ricambi può soddisfare immediatamente dal magazzino disponibile?",
              description: "Monitori il tasso di evasione al primo tentativo sia per le richieste dei clienti che per quelle interne del reparto assistenza",
              scaleLabels: ["<4× all'anno", "4–5× all'anno", "6–7× all'anno", "8–9× all'anno", "≥10× all'anno"]
            }
          }
        },
        {
          id: "pts-3",
          kind: "scored",
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
            },
            fr: {
              text: "Quelle est la marge brute moyenne que vous réalisez sur les ventes de pièces de rechange sur l'ensemble des canaux ?",
              description: "Calculez la marge brute totale des pièces en pourcentage du chiffre d'affaires pièces",
              scaleLabels: ["Pas de commande quotidienne", "3–4× par semaine", "5× par semaine, informel", "Quotidien, processus structuré", "Quotidien avec réapprovisionnement automatique"]
            },
            es: {
              text: "¿Cuál es el margen bruto medio que obtiene en las ventas de recambios a través de todos los canales?",
              description: "Calcule el margen bruto total de recambios como porcentaje de los ingresos por recambios",
              scaleLabels: ["Sin pedido diario", "3–4 veces por semana", "5 veces por semana, informal", "Diario, proceso estructurado", "Diario con reposición automática"]
            },
            it: {
              text: "Qual è il margine lordo medio che realizza sulle vendite di ricambi su tutti i canali?",
              description: "Calcoli il margine lordo totale sui ricambi come percentuale dei ricavi ricambi",
              scaleLabels: ["Nessun ordine giornaliero", "3–4× a settimana", "5× a settimana, informale", "Giornaliero, processo strutturato", "Giornaliero con riassortimento automatico"]
            }
          }
        },
        {
          id: "pts-4",
          kind: "scored",
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
            },
            fr: {
              text: "Quel pourcentage de votre stock de pièces est considéré comme obsolète sans mouvement depuis plus de 12 mois ?",
              description: "Identifiez le stock à faible rotation et le stock mort en pourcentage de la valeur totale du stock",
              scaleLabels: [">15%", "11-15%", "6-10%", "3-5%", "<3%"]
            },
            es: {
              text: "¿Qué porcentaje de su inventario de recambios se considera obsoleto sin movimiento en más de 12 meses?",
              description: "Identifique el stock de baja rotación y muerto como porcentaje del valor total del inventario",
              scaleLabels: [">15%", "11-15%", "6-10%", "3-5%", "<3%"]
            },
            it: {
              text: "Quale percentuale del Suo magazzino ricambi è considerata obsoleta senza movimentazione da più di 12 mesi?",
              description: "Identifichi lo stock a lenta rotazione e fermo come percentuale del valore totale del magazzino",
              scaleLabels: [">15%", "11-15%", "6-10%", "3-5%", "<3%"]
            }
          }
        },
        {
          id: "pts-5",
          kind: "scored",
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
            },
            fr: {
              text: "Quelle est la précision de vos commandes de pièces en termes de référence correcte et de quantité ?",
              description: "Suivez les commandes ne nécessitant ni correction ni retour",
              scaleLabels: ["<85%", "85-90%", "91-94%", "95-97%", ">97%"]
            },
            es: {
              text: "¿Cuán precisos son sus pedidos de recambios en cuanto a pedir la referencia y la cantidad correctas?",
              description: "Realice seguimiento de los pedidos que no requieren correcciones ni devoluciones",
              scaleLabels: ["<85%", "85-90%", "91-94%", "95-97%", ">97%"]
            },
            it: {
              text: "Quanto sono accurati i Suoi ordini di ricambi in termini di correttezza del codice e della quantità ordinata?",
              description: "Monitori gli ordini che non richiedono correzioni o resi",
              scaleLabels: ["<85%", "85-90%", "91-94%", "95-97%", ">97%"]
            }
          }
        },
        {
          id: "pts-6",
          kind: "scored",
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
            },
            fr: {
              text: "Comment évalueriez-vous votre réussite dans la vente de pièces à des clients externes tels que des garages indépendants ?",
              description: "Évaluez votre activité de vente en gros et au détail de pièces en dehors de l'atelier interne",
              scaleLabels: ["<5 % part grossiste", "5–10 % grossiste", "11–20 % grossiste", "21–30 % grossiste", ">30 % grossiste"]
            },
            es: {
              text: "¿Cómo valoraría su éxito en la venta de recambios a clientes externos como talleres independientes?",
              description: "Evalúe su negocio de recambios al por mayor y al por menor fuera del servicio interno",
              scaleLabels: ["<5% cuota mayorista", "5-10% mayorista", "11-20% mayorista", "21-30% mayorista", ">30% mayorista"]
            },
            it: {
              text: "Come valuterebbe il Suo successo nella vendita di ricambi a clienti esterni come officine indipendenti?",
              description: "Valuti il Suo business ricambi all'ingrosso e al dettaglio al di fuori dell'assistenza interna",
              scaleLabels: ["<5% quota ingrosso", "5-10% ingrosso", "11-20% ingrosso", "21-30% ingrosso", ">30% ingrosso"]
            }
          }
        },
        {
          id: "pts-7",
          kind: "scored",
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
            },
            fr: {
              text: "Quel pourcentage des pièces vendues est retourné en raison d'erreurs de commande ou de pièces incorrectes ?",
              description: "Suivez le taux de retour attribuable aux erreurs du concessionnaire",
              scaleLabels: [">6%", "4–6%", "2–3%", "1–2%", "<1%"]
            },
            es: {
              text: "¿Qué porcentaje de recambios vendidos son devueltos por errores de pedido o recambios incorrectos?",
              description: "Realice seguimiento de la tasa de devoluciones atribuida a errores del concesionario",
              scaleLabels: [">6%", "4–6%", "2–3%", "1–2%", "<1%"]
            },
            it: {
              text: "Quale percentuale dei ricambi venduti viene resa a causa di errori di ordinazione o ricambi errati?",
              description: "Monitori il tasso di reso attribuibile a errori della concessionaria",
              scaleLabels: [">6%", "4–6%", "2–3%", "1–2%", "<1%"]
            }
          }
        },
        {
          id: "pts-8",
          kind: "scored",
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
            },
            fr: {
              text: "Avec quelle efficacité pouvez-vous sourcer et obtenir des pièces urgentes qui ne sont pas en stock ?",
              description: "Évaluez vos capacités d'approvisionnement d'urgence pour les besoins critiques des clients",
              scaleLabels: ["Aucun processus VOR", "Escalade ponctuelle", "Identifié mais sans SLA", "SLA défini, application inconstante", "SLA VOR formel <4h, suivi"]
            },
            es: {
              text: "¿Con qué eficacia puede localizar y obtener recambios urgentes que no están en stock?",
              description: "Valore sus capacidades de aprovisionamiento de emergencia para necesidades críticas del cliente",
              scaleLabels: ["Sin proceso VOR", "Escalado puntual", "Identificado pero sin SLA", "SLA definido, inconsistente", "SLA VOR formal <4h, monitorizado"]
            },
            it: {
              text: "Con quale efficacia riesce a reperire e ottenere ricambi urgenti non disponibili a magazzino?",
              description: "Valuti le Sue capacità di approvvigionamento d'emergenza per esigenze critiche dei clienti",
              scaleLabels: ["Nessun processo VOR", "Escalation ad hoc", "Identificato ma senza SLA", "SLA definito, non costante", "SLA VOR formale <4h, monitorato"]
            }
          }
        },
        {
          id: "pts-9",
          kind: "scored",
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
            },
            fr: {
              text: "Combien de temps faut-il généralement pour traiter et exécuter une demande standard au comptoir pièces de rechange ?",
              description: "Mesurez le temps entre la demande du client et la pièce en main",
              scaleLabels: [">60 min en moyenne", "45–60 min", "30–44 min", "15–29 min", "<15 min en moyenne"]
            },
            es: {
              text: "¿Cuánto tiempo se tarda normalmente en procesar y completar una solicitud estándar en el mostrador de recambios?",
              description: "Mida el tiempo desde la solicitud del cliente hasta la entrega del recambio",
              scaleLabels: [">60 min de media", "45–60 min", "30–44 min", "15–29 min", "<15 min de media"]
            },
            it: {
              text: "Quanto tempo impiega tipicamente per elaborare e evadere una richiesta standard al banco ricambi?",
              description: "Misuri il tempo dalla richiesta del cliente alla consegna del ricambio",
              scaleLabels: [">60 min in media", "45–60 min", "30–44 min", "15–29 min", "<15 min in media"]
            }
          }
        },
        {
          id: "pts-10",
          kind: "scored",
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
            },
            fr: {
              text: "Quelle est la qualité de vos relations et de votre communication avec vos fournisseurs de pièces ?",
              description: "Considérez la tarification, la fiabilité des livraisons et la qualité du support",
              scaleLabels: ["Aucun contrôle tarifaire", "Remises informelles", "Respect partiel du prix catalogue", "Tarification structurée, quelques exceptions", "Discipline tarifaire complète avec processus d'approbation"]
            },
            es: {
              text: "¿Cuán sólidas son sus relaciones y comunicación con sus proveedores de recambios?",
              description: "Considere los precios, la fiabilidad de las entregas y la calidad del soporte",
              scaleLabels: ["Sin control de precios", "Descuentos informales", "Adherencia parcial al precio de lista", "Precios estructurados, algunas excepciones", "Disciplina total de precio de lista con flujo de aprobación"]
            },
            it: {
              text: "Quanto sono solide le Sue relazioni e la comunicazione con i fornitori di ricambi?",
              description: "Consideri i prezzi, l'affidabilità delle consegne e la qualità del supporto",
              scaleLabels: ["Nessun controllo dei prezzi", "Sconti informali", "Adesione parziale al listino", "Prezzi strutturati, alcune eccezioni", "Piena disciplina di listino con workflow di approvazione"]
            }
          }
        },
        {
          id: "prt-kpi-1",
          kind: "data",
          text: "What is your parts department gross profit margin?",
          description: "Gross profit margin on parts sales — gross profit as a percentage of total parts revenue.",
          type: "percentage",
          category: "performance_data",
          subSection: "performance_data",
          kpiKey: "prt_gross_margin_pct",
          unit: "%",
          referencePeriod: "last_calendar_month",
          validRange: { min: 0, max: 100 },
          formula: {
            expression: "Parts gross profit ÷ parts sales revenue × 100",
            example: "€58,000 parts gross profit ÷ €200,000 parts revenue × 100 = 29%",
            dataSource: "DMS parts department P&L (gross profit and revenue)"
          },
          translations: {
            en: {
              text: "What is your parts department gross profit margin?",
              description: "Gross profit margin on parts sales — gross profit as a percentage of total parts revenue."
            },
            de: {
              text: "Wie hoch ist Ihre Bruttomarge im Teileverkauf?",
              description: "Bruttoertragsmarge im Teilegeschäft: Bruttoertrag als Prozentsatz des gesamten Teileumsatzes."
            },
            fr: {
              text: "Quelle est la marge brute de votre département pièces de rechange ?",
              description: "Marge brute sur les ventes de pièces — marge brute en pourcentage du chiffre d'affaires total des pièces de rechange."
            },
            es: {
              text: "¿Cuál es el margen bruto de su departamento de recambios?",
              description: "Margen bruto en ventas de recambios — margen bruto como porcentaje de los ingresos totales por recambios."
            },
            it: {
              text: "Qual è il margine lordo del Suo reparto ricambi?",
              description: "Margine lordo sulle vendite di ricambi — margine lordo come percentuale dei ricavi totali del reparto ricambi."
            }
          }
        },
        {
          id: "prt-kpi-3",
          kind: "data",
          text: "What is your parts inventory turn rate (annualised)?",
          description: "Annualised parts inventory turn rate — how many times the parts inventory value is sold through and replenished per year.",
          type: "numeric",
          category: "performance_data",
          subSection: "performance_data",
          kpiKey: "prt_inventory_turns",
          unit: "turns/yr",
          referencePeriod: "last_financial_year",
          validRange: { min: 0, max: 30 },
          formula: {
            expression: "Annual cost of parts sold ÷ average parts inventory value (at cost)",
            example: "€1,800,000 annual cost of parts sold ÷ €300,000 average inventory value = 6 turns/year",
            dataSource: "DMS parts inventory valuation + annual parts cost of sales from management accounts"
          },
          translations: {
            en: {
              text: "What is your parts inventory turn rate (annualised)?",
              description: "Annualised parts inventory turn rate — how many times the parts inventory value is sold through and replenished per year."
            },
            de: {
              text: "Wie hoch ist Ihr Teile-Lagerumschlag (Teileumschlag) pro Jahr?",
              description: "Annualisierter Lagerumschlag im Teilebereich: wie oft der Wert des Teilebestands pro Jahr verkauft und wieder aufgefüllt wird."
            },
            fr: {
              text: "Quel est votre taux de rotation du stock de pièces (annualisé) ?",
              description: "Taux de rotation annualisé du stock de pièces — nombre de fois que la valeur du stock de pièces est vendue et reconstituée par an."
            },
            es: {
              text: "¿Cuál es su tasa de rotación de inventario de recambios (anualizada)?",
              description: "Tasa de rotación de inventario de recambios anualizada — cuántas veces se vende y repone el valor del inventario de recambios al año."
            },
            it: {
              text: "Qual è il tasso di rotazione del Suo magazzino ricambi (annualizzato)?",
              description: "Tasso di rotazione annualizzato del magazzino ricambi — quante volte il valore del magazzino ricambi viene venduto e reintegrato all'anno."
            }
          }
        },
        {
          id: "prt-kpi-5",
          kind: "data",
          text: "What is your average parts sales value per repair order?",
          description: "Average value of parts sold per repair order in the workshop.",
          type: "currency",
          category: "performance_data",
          subSection: "performance_data",
          kpiKey: "prt_sales_per_ro",
          unit: "EUR",
          referencePeriod: "last_calendar_month",
          validRange: { min: 0, max: 5000 },
          formula: {
            expression: "Total parts revenue from workshop repair orders ÷ number of repair orders",
            example: "€112,500 parts revenue ÷ 1,500 repair orders = €75 per RO",
            dataSource: "DMS service invoicing report — parts revenue by repair order"
          },
          translations: {
            en: {
              text: "What is your average parts sales value per repair order?",
              description: "Average value of parts sold per repair order in the workshop."
            },
            de: {
              text: "Wie hoch ist Ihr durchschnittlicher Teileumsatz pro Reparaturauftrag?",
              description: "Durchschnittlicher Wert der verkauften Teile pro Reparaturauftrag in der Werkstatt."
            },
            fr: {
              text: "Quelle est votre valeur moyenne de ventes de pièces par ordre de réparation ?",
              description: "Valeur moyenne des pièces vendues par ordre de réparation en atelier."
            },
            es: {
              text: "¿Cuál es su valor medio de venta de recambios por orden de reparación?",
              description: "Valor medio de los recambios vendidos por orden de reparación en el taller."
            },
            it: {
              text: "Qual è il valore medio delle vendite ricambi per ordine di riparazione?",
              description: "Valore medio dei ricambi venduti per ordine di riparazione in officina."
            }
          }
        },
        {
          id: "prt-kpi-6",
          kind: "data",
          text: "What percentage of your parts sales come from wholesale/external customers?",
          description: "Share of total parts sales revenue generated from wholesale/trade customers and external workshops, rather than the dealership's own service department or retail counter.",
          type: "percentage",
          category: "performance_data",
          subSection: "performance_data",
          kpiKey: "prt_wholesale_pct",
          unit: "%",
          referencePeriod: "last_calendar_month",
          validRange: { min: 0, max: 100 },
          formula: {
            expression: "Wholesale parts revenue ÷ total parts revenue × 100",
            example: "€60,000 wholesale revenue ÷ €200,000 total parts revenue × 100 = 30%",
            dataSource: "DMS parts sales report segmented by customer type (internal / retail / wholesale)"
          },
          translations: {
            en: {
              text: "What percentage of your parts sales come from wholesale/external customers?",
              description: "Share of total parts sales revenue generated from wholesale/trade customers and external workshops, rather than the dealership's own service department or retail counter."
            },
            de: {
              text: "Welcher Anteil Ihres Teileumsatzes entfällt auf Großhandel/externe Kunden?",
              description: "Anteil des gesamten Teileumsatzes, der von Großhandels- und externen Werkstattkunden stammt, im Gegensatz zur eigenen Werkstatt oder dem Einzelhandelsverkauf."
            },
            fr: {
              text: "Quel pourcentage de vos ventes de pièces provient de clients grossistes/externes ?",
              description: "Part du chiffre d'affaires total des pièces générée par les clients grossistes/professionnels et les ateliers externes, par opposition au propre atelier du concessionnaire ou au comptoir de détail."
            },
            es: {
              text: "¿Qué porcentaje de sus ventas de recambios proviene de clientes mayoristas/externos?",
              description: "Proporción de los ingresos totales por ventas de recambios generados por clientes mayoristas/profesionales y talleres externos, frente al propio departamento de servicio del concesionario o el mostrador de venta al público."
            },
            it: {
              text: "Quale percentuale delle Sue vendite ricambi proviene da clienti all'ingrosso/esterni?",
              description: "Quota dei ricavi totali del reparto ricambi generata da clienti all'ingrosso/professionali e officine esterne, anziché dal reparto assistenza interno della concessionaria o dal banco al dettaglio."
            }
          }
        },
        {
          id: "prt-kpi-7",
          kind: "data",
          text: "How many days does a typical parts back-order take to resolve?",
          description: "Typical number of days it takes to resolve a parts back-order (from order placement to part availability) for a part not currently in stock.",
          type: "numeric",
          category: "performance_data",
          subSection: "performance_data",
          kpiKey: "prt_backorder_days",
          unit: "days",
          referencePeriod: "current",
          validRange: { min: 0, max: 60 },
          formula: {
            expression: "Average elapsed days between back-order placement and parts receipt across recent back-orders",
            example: "Average of 6 days across the last 20 back-orders resolved = 6 days",
            dataSource: "DMS parts ordering system — back-order open/close timestamps"
          },
          translations: {
            en: {
              text: "How many days does a typical parts back-order take to resolve?",
              description: "Typical number of days it takes to resolve a parts back-order (from order placement to part availability) for a part not currently in stock."
            },
            de: {
              text: "Wie viele Tage dauert die Bearbeitung einer typischen Teile-Nachbestellung?",
              description: "Typische Anzahl an Tagen, die die Bearbeitung einer Teile-Nachbestellung (von Bestellung bis Verfügbarkeit) für ein nicht vorrätiges Teil in Anspruch nimmt."
            },
            fr: {
              text: "Combien de jours faut-il en moyenne pour résoudre une commande de pièces en rupture ?",
              description: "Nombre de jours typique pour résoudre une commande de pièces en rupture (de la passation de commande à la disponibilité de la pièce) pour une pièce non actuellement en stock."
            },
            es: {
              text: "¿Cuántos días tarda normalmente en resolverse un pedido pendiente de recambios?",
              description: "Número típico de días necesarios para resolver un pedido pendiente de recambios (desde la realización del pedido hasta la disponibilidad del recambio) para un recambio no disponible actualmente en stock."
            },
            it: {
              text: "Quanti giorni impiega tipicamente la risoluzione di un arretrato ricambi?",
              description: "Numero tipico di giorni necessari per risolvere un arretrato ricambi (dall'ordine alla disponibilità del ricambio) per un ricambio non attualmente a magazzino."
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
        },
        fr: {
          description: "Évaluez la santé financière globale, l'efficacité opérationnelle et la gestion de l'entreprise"
        },
        es: {
          description: "Evalúe la salud financiera general, la eficiencia operativa y la gestión empresarial"
        },
        it: {
          description: "Valuti la salute finanziaria complessiva, l'efficienza operativa e la gestione aziendale"
        }
      },
      questions: [
        {
          id: "fin-1",
          kind: "scored",
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
          primarySignalCode: 'KPI_NOT_REVIEWED',
          secondarySignalCode: 'GOVERNANCE_WEAK',
          rootCauseDimension: 'process',
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
            },
            fr: {
              text: "Comment décririez-vous la tendance de rentabilité globale de votre concessionnaire au cours des 12 derniers mois ?",
              description: "Considérez la croissance, la stabilité ou les schémas de déclin du bénéfice net",
              scaleLabels: ["Bénéfice net en baisse de plus de 20 % par rapport à l'année précédente", "En baisse de 0–20 % ou à l'équilibre, aucun plan de redressement en place", "Bénéfice net stable, marge nette de 1–2 %", "Bénéfice net en croissance, marge nette de 2–4 %", "Bénéfice net supérieur à 4 % et en amélioration d'année en année"]
            },
            es: {
              text: "¿Cómo describiría la tendencia de rentabilidad general de su concesionario en los últimos 12 meses?",
              description: "Considere el crecimiento, la estabilidad o los patrones de declive del beneficio neto",
              scaleLabels: ["Beneficio neto en descenso más del 20% respecto al año anterior", "En descenso del 0-20% o en punto muerto, sin plan de recuperación", "Beneficio neto estable, margen neto del 1-2%", "Beneficio neto en crecimiento, margen neto del 2-4%", "Beneficio neto por encima del 4% y mejorando interanualmente"]
            },
            it: {
              text: "Come descriverebbe l'andamento della redditività complessiva della Sua concessionaria negli ultimi 12 mesi?",
              description: "Consideri la crescita, la stabilità o il calo dell'utile netto",
              scaleLabels: ["Utile netto in calo di oltre il 20% rispetto all'anno precedente", "In calo 0-20% o in pareggio, nessun piano di recupero attivo", "Utile netto stabile, margine netto 1-2%", "Utile netto in crescita, margine netto 2-4%", "Utile netto superiore al 4% e in miglioramento anno su anno"]
            }
          }
        },
        {
          id: "fin-2",
          kind: "scored",
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
          primarySignalCode: 'KPI_NOT_REVIEWED',
          secondarySignalCode: 'GOVERNANCE_WEAK',
          rootCauseDimension: 'process',
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
            },
            fr: {
              text: "Quelle est la régularité et la prévisibilité de la trésorerie mensuelle de votre concessionnaire ?",
              description: "Évaluez la stabilité des flux de trésorerie entrants et sortants",
              scaleLabels: ["Déficits de trésorerie réguliers — salaires ou paiements fournisseurs à risque", "Position de trésorerie tendue — gérée mais peu de marge de manœuvre", "Trésorerie adéquate, obligations mensuelles couvertes confortablement", "Position saine avec 45+ jours de réserves opérationnelles", "Forte liquidité avec gestion de trésorerie formelle et réserve d'investissement"]
            },
            es: {
              text: "¿Cuán consistente y predecible es el flujo de caja mensual de su concesionario?",
              description: "Valore la estabilidad de las entradas y salidas de caja",
              scaleLabels: ["Déficits de caja recurrentes — nóminas o pagos a proveedores en riesgo", "Posición de caja ajustada — gestionada pero con poco margen de maniobra", "Flujo de caja adecuado, obligaciones mensuales cubiertas con holgura", "Posición saludable con más de 45 días de reservas operativas", "Liquidez sólida con gestión formal de tesorería y colchón de inversión"]
            },
            it: {
              text: "Quanto è costante e prevedibile il flusso di cassa mensile della Sua concessionaria?",
              description: "Valuti la stabilità delle entrate e uscite di cassa",
              scaleLabels: ["Carenze di liquidità regolari — pagamenti stipendi o fornitori a rischio", "Posizione di cassa tesa — gestita ma con poco margine", "Flusso di cassa adeguato, obblighi mensili soddisfatti agevolmente", "Posizione solida con oltre 45 giorni di riserve operative", "Forte liquidità con gestione formale della tesoreria e buffer di investimento"]
            }
          }
        },
        {
          id: "fin-3",
          kind: "scored",
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
          primarySignalCode: 'GOVERNANCE_WEAK',
          rootCauseDimension: 'structure',
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
            },
            fr: {
              text: "Avec quelle efficacité gérez-vous votre financement de stock pour minimiser les coûts d'intérêts ?",
              description: "Considérez le taux de rotation du stock par rapport aux conditions du plan de financement et au calendrier des paiements",
              scaleLabels: [">75 jours", "61–75 jours", "46–60 jours", "31–45 jours", "≤30 jours"]
            },
            es: {
              text: "¿Con qué eficacia gestiona su financiación de inventario para minimizar los costes financieros?",
              description: "Considere la tasa de rotación de inventario en relación con las condiciones de financiación y los plazos de pago",
              scaleLabels: [">75 días", "61–75 días", "46–60 días", "31–45 días", "≤30 días"]
            },
            it: {
              text: "Con quale efficacia gestisce il finanziamento del floor plan per minimizzare gli oneri finanziari?",
              description: "Consideri il tasso di rotazione del magazzino in relazione alle condizioni del floor plan e ai tempi di pagamento",
              scaleLabels: [">75 giorni", "61–75 giorni", "46–60 giorni", "31–45 giorni", "≤30 giorni"]
            }
          }
        },
        {
          id: "fin-4",
          kind: "scored",
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
          primarySignalCode: 'GOVERNANCE_WEAK',
          secondarySignalCode: 'PROCESS_NOT_STANDARDISED',
          rootCauseDimension: 'process',
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
            },
            fr: {
              text: "Avec quelle efficacité votre concessionnaire contrôle-t-il et gère-t-il les charges d'exploitation ?",
              description: "Considérez le suivi des coûts, le respect des budgets et les initiatives de réduction des dépenses",
              scaleLabels: ["<60%", "60–70%", "71–80%", "81–94%", "≥95%"]
            },
            es: {
              text: "¿Con qué eficacia controla y gestiona su concesionario los gastos operativos?",
              description: "Considere la monitorización de costes, el cumplimiento presupuestario y las iniciativas de reducción de gastos",
              scaleLabels: ["<60%", "60–70%", "71–80%", "81–94%", "≥95%"]
            },
            it: {
              text: "Con quale efficacia la Sua concessionaria controlla e gestisce le spese operative?",
              description: "Consideri il monitoraggio dei costi, il rispetto del budget e le iniziative di riduzione delle spese",
              scaleLabels: ["<60%", "60–70%", "71–80%", "81–94%", "≥95%"]
            }
          }
        },
        {
          id: "fin-5",
          kind: "scored",
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
          primarySignalCode: 'CAPACITY_MISALIGNED',
          rootCauseDimension: 'structure',
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
            },
            fr: {
              text: "Comment votre chiffre d'affaires par employé se compare-t-il aux référentiels du secteur pour votre marché ?",
              description: "Évaluez la productivité et l'efficacité du personnel dans tous les départements",
              scaleLabels: ["En dessous du secteur", "Au niveau du secteur", "Au-dessus du secteur", "Bien au-dessus", "Exceptionnel"]
            },
            es: {
              text: "¿Cómo se comparan sus ingresos por empleado con los benchmarks del sector en su mercado?",
              description: "Evalúe la productividad y la eficiencia del personal en todos los departamentos",
              scaleLabels: ["Por debajo del sector", "En la media del sector", "Por encima del sector", "Muy por encima", "Excepcional"]
            },
            it: {
              text: "Come si colloca il Suo fatturato per dipendente rispetto ai benchmark di settore per il Suo mercato?",
              description: "Valuti la produttività e l'efficienza del personale in tutti i reparti",
              scaleLabels: ["Sotto il settore", "In linea con il settore", "Sopra il settore", "Ben sopra", "Eccezionale"]
            }
          }
        },
        {
          id: "fin-6",
          kind: "scored",
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
          primarySignalCode: 'TOOL_UNDERUTILISED',
          rootCauseDimension: 'tools',
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
            },
            fr: {
              text: "Quel rendement obtenez-vous sur vos investissements en technologie et en équipement ?",
              description: "Considérez le DMS, le CRM, l'équipement d'atelier et les outils de marketing numérique",
              scaleLabels: ["<0,5%", "0,5–1%", "1,1–1,8%", "1,9–2,5%", ">2,5%"]
            },
            es: {
              text: "¿Qué retorno está obteniendo de sus inversiones en tecnología y equipamiento?",
              description: "Considere DMS, CRM, equipamiento de servicio y herramientas de marketing digital",
              scaleLabels: ["<0,5%", "0,5–1%", "1,1–1,8%", "1,9–2,5%", ">2,5%"]
            },
            it: {
              text: "Quale rendimento sta ottenendo dai Suoi investimenti in tecnologia e attrezzature?",
              description: "Consideri DMS, CRM, attrezzature di officina e strumenti di marketing digitale",
              scaleLabels: ["<0,5%", "0,5–1%", "1,1–1,8%", "1,9–2,5%", ">2,5%"]
            }
          }
        },
        {
          id: "fin-7",
          kind: "scored",
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
          primarySignalCode: 'CAPACITY_MISALIGNED',
          rootCauseDimension: 'structure',
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
            },
            fr: {
              text: "Avec quelle efficacité utilisez-vous la surface de votre salle d'exposition et la capacité de vos postes de travail atelier ?",
              description: "Considérez le chiffre d'affaires par mètre carré et les taux d'utilisation des postes",
              scaleLabels: ["<50 % de l'objectif", "50–65%", "66–79%", "80–94%", "≥95%"]
            },
            es: {
              text: "¿Con qué eficiencia utiliza la superficie de su sala de exposición y la capacidad de sus puestos de taller?",
              description: "Considere los ingresos por metro cuadrado y las tasas de utilización de puestos",
              scaleLabels: ["<50% del objetivo", "50–65%", "66–79%", "80–94%", "≥95%"]
            },
            it: {
              text: "Con quale efficienza utilizza lo spazio del Suo showroom e la capacità delle postazioni di officina?",
              description: "Consideri il fatturato per metro quadrato e i tassi di utilizzo delle postazioni",
              scaleLabels: ["<50% dell'obiettivo", "50–65%", "66–79%", "80–94%", "≥95%"]
            }
          }
        },
        {
          id: "fin-8",
          kind: "scored",
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
          primarySignalCode: 'TOOL_UNDERUTILISED',
          rootCauseDimension: 'tools',
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
            },
            fr: {
              text: "Dans quelle mesure entretenez-vous et exploitez-vous votre base de données clients pour le marketing et la fidélisation ?",
              description: "Considérez la qualité des données, les capacités de segmentation et l'utilisation pour des campagnes ciblées",
              scaleLabels: [">30 jours en moyenne", "21–30 jours", "14–20 jours", "8–13 jours", "≤7 jours en moyenne"]
            },
            es: {
              text: "¿Con qué eficacia mantiene y aprovecha su base de datos de clientes para marketing y retención?",
              description: "Considere la calidad de los datos, las capacidades de segmentación y la utilización para campañas dirigidas",
              scaleLabels: [">30 días de media", "21–30 días", "14–20 días", "8–13 días", "≤7 días de media"]
            },
            it: {
              text: "Quanto bene mantiene e sfrutta il Suo database clienti per il marketing e la fidelizzazione?",
              description: "Consideri la qualità dei dati, le capacità di segmentazione e l'utilizzo per campagne mirate",
              scaleLabels: [">30 giorni in media", "21–30 giorni", "14–20 giorni", "8–13 giorni", "≤7 giorni in media"]
            }
          }
        },
        {
          id: "fin-9",
          kind: "scored",
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
          primarySignalCode: 'GOVERNANCE_WEAK',
          rootCauseDimension: 'structure',
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
            },
            fr: {
              text: "Dans quelle mesure la marge brute générée par vos départements après-vente et pièces de rechange couvre-t-elle les frais fixes totaux de votre concessionnaire ?",
              description: "Réfléchissez à la question de savoir si les opérations fixes seules pourraient soutenir l'activité en cas de mauvais mois de ventes de véhicules — sans dépendre de la marge brute variable des ventes",
              purpose: "Le taux d'absorption fixe est l'indicateur de santé structurelle le plus important pour un concessionnaire — il mesure si le modèle économique est véritablement résilient ou structurellement dépendant de la marge de vente de véhicules pour survivre.",
              situationAnalysis: "Les concessionnaires avec un taux d'absorption élevé résistent bien mieux aux ralentissements économiques, aux perturbations d'approvisionnement et à la compression des marges que ceux qui dépendent de la marge brute variable des véhicules. Les programmes constructeurs et les institutions financières utilisent ce ratio pour évaluer la viabilité du concessionnaire.",
              benefits: "Chaque point de pourcentage d'amélioration de l'absorption représente une couverture directe des frais généraux qui réduit le volume de ventes de véhicules nécessaire pour atteindre le seuil de rentabilité — réduisant matériellement le risque de l'ensemble de l'activité.",
              scaleLabels: ["Les opérations fixes couvrent <40 % des frais généraux — forte dépendance à la marge brute des ventes de véhicules", "40–55 % d'absorption — vulnérable à tout ralentissement des ventes", "56–70 % d'absorption — partiellement protégé mais toujours exposé à la volatilité des ventes", "71–85 % d'absorption — base solide d'opérations fixes offrant une protection significative", ">85 % d'absorption — les opérations fixes autofinancent effectivement l'activité ; les ventes de véhicules sont du profit pur"]
            },
            es: {
              text: "¿En qué medida el margen bruto generado por sus departamentos de servicio y recambios cubre los gastos fijos totales de su concesionario?",
              description: "Piense en si las operaciones fijas por sí solas podrían sostener el negocio si las ventas de vehículos tuvieran un mal mes — sin depender del margen variable de ventas",
              purpose: "La tasa de absorción de gastos fijos es el indicador de salud estructural más importante para un concesionario — mide si el modelo de negocio es genuinamente resiliente o estructuralmente dependiente del margen de venta de vehículos para sobrevivir.",
              situationAnalysis: "Los concesionarios con alta absorción de gastos fijos soportan las recesiones económicas, las interrupciones de suministro y la compresión de márgenes mucho mejor que aquellos que dependen del margen bruto variable de vehículos. Los programas OEM y las instituciones financieras utilizan esta ratio para evaluar la viabilidad del concesionario.",
              benefits: "Cada punto porcentual de mejora en la absorción representa cobertura directa de gastos generales que reduce el volumen de ventas de vehículos necesario para alcanzar el punto de equilibrio — reduciendo materialmente el riesgo de todo el negocio.",
              scaleLabels: ["Las operaciones fijas cubren <40% de los gastos generales — fuertemente dependiente del margen bruto de ventas de vehículos", "Absorción del 40–55% — vulnerable ante cualquier caída de ventas", "Absorción del 56–70% — parcialmente protegido pero aún expuesto a la volatilidad de ventas", "Absorción del 71–85% — sólida base de operaciones fijas que proporciona protección significativa", ">85% de absorción — las operaciones fijas financian efectivamente el negocio; las ventas de vehículos son beneficio puro"]
            },
            it: {
              text: "In che misura il margine lordo generato dai reparti assistenza e ricambi copre i costi fissi complessivi della Sua concessionaria?",
              description: "Consideri se le operazioni fisse da sole potrebbero sostenere l'attività se le vendite di veicoli avessero un mese negativo — senza dipendere dal margine lordo variabile delle vendite",
              purpose: "Il tasso di assorbimento fisso è il singolo indicatore più importante della salute strutturale di una concessionaria — misura se il modello di business è realmente resiliente o strutturalmente dipendente dal margine di vendita dei veicoli per sopravvivere.",
              situationAnalysis: "Le concessionarie con un elevato assorbimento fisso affrontano le recessioni economiche, le interruzioni di approvvigionamento e la compressione dei margini molto meglio di quelle dipendenti dal margine lordo variabile dei veicoli. I programmi OEM e gli istituti finanziari utilizzano questo rapporto per valutare la solidità del concessionario.",
              benefits: "Ogni punto percentuale di miglioramento dell'assorbimento rappresenta una copertura diretta dei costi fissi che riduce il volume di vendite di veicoli necessario per raggiungere il pareggio — riducendo materialmente il rischio dell'intera attività.",
              scaleLabels: ["Le operazioni fisse coprono <40% dei costi fissi — forte dipendenza dal margine lordo delle vendite veicoli", "40–55% di assorbimento — vulnerabile a qualsiasi calo delle vendite", "56–70% di assorbimento — parzialmente protetti ma ancora esposti alla volatilità delle vendite", "71–85% di assorbimento — solida base di operazioni fisse che fornisce una protezione significativa", ">85% di assorbimento — le operazioni fisse autofinanziano di fatto l'attività; le vendite di veicoli sono puro profitto"]
            }
          }
        },
        {
          id: "fin-10",
          kind: "scored",
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
          primarySignalCode: 'GOVERNANCE_WEAK',
          rootCauseDimension: 'incentives',
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
            },
            fr: {
              text: "Dans quelle mesure les évaluations de performance individuelle de votre concessionnaire sont-elles structurées et régulières, et dans quelle mesure sont-elles liées au développement et à la rémunération ?",
              description: "Réfléchissez à la clarté des objectifs, à la régularité des entretiens et à l'impact réel sur la rémunération, le coaching ou l'évolution de carrière",
              purpose: "La cadence de gestion de la performance est un indicateur proxy de KPI RH qui prédit la rétention, la productivité et la capacité du concessionnaire à progresser grâce à ses collaborateurs — la seule variable qui différencie les concessionnaires régulièrement performants.",
              situationAnalysis: "Les concessionnaires sans gestion de performance structurée ne peuvent pas diagnostiquer si la sous-performance est un problème de compétence, de volonté ou de processus. Sans objectifs clairs et retours réguliers, même les collaborateurs compétents décrochent, et les meilleurs partent vers des environnements qui les reconnaissent.",
              benefits: "Une gestion de performance structurée améliore la productivité sans augmentation d'effectifs, réduit le turnover grâce à la reconnaissance et à la clarté du développement, et crée l'infrastructure managériale nécessaire pour se développer de manière cohérente.",
              scaleLabels: ["Aucun processus d'évaluation formel — performance discutée de manière informelle ou pas du tout", "Entretien annuel uniquement, lien limité avec la rémunération ou le développement", "Entretiens semestriels avec objectifs basiques, un certain lien avec la part variable", "Entretiens trimestriels structurés avec KPI clairs, part variable liée aux résultats, plans de développement en place", "Entretiens KPI mensuels en 1:1 + évaluations trimestrielles, alignement complet de la part variable, plans de développement personnel activement gérés"]
            },
            es: {
              text: "¿Cuán estructurada y consistente es la forma en que su concesionario evalúa el rendimiento individual del personal y lo vincula al desarrollo y la compensación?",
              description: "Considere si los objetivos son claros, las evaluaciones se realizan según lo programado y los resultados realmente influyen en la remuneración, la formación o la progresión profesional",
              purpose: "La cadencia de la gestión del rendimiento es un indicador proxy de KPI de personal que predice la retención, la productividad y la capacidad del concesionario de mejorar a través de las personas — la variable que diferencia a los concesionarios consistentemente de alto rendimiento.",
              situationAnalysis: "Los concesionarios sin gestión estructurada del rendimiento no pueden diagnosticar si el bajo rendimiento es un problema de competencia, voluntad o proceso. Sin objetivos claros y retroalimentación regular, incluso el personal capaz se estanca y los mejores talentos se van a entornos que los reconocen.",
              benefits: "La gestión estructurada del rendimiento mejora la productividad sin aumentar la plantilla, reduce la rotación mediante el reconocimiento y la claridad en el desarrollo, y crea la infraestructura de gestión necesaria para escalar de forma consistente.",
              scaleLabels: ["Sin proceso formal de evaluación — el rendimiento se comenta de forma informal o no se comenta", "Evaluación anual únicamente, con conexión limitada a la remuneración o el desarrollo", "Evaluaciones semestrales con objetivos básicos, cierta vinculación a la retribución variable", "Evaluaciones trimestrales estructuradas con KPI claros, retribución variable vinculada a resultados, planes de desarrollo implantados", "Revisiones mensuales individuales de KPI + evaluaciones trimestrales, alineación completa de retribución variable, planes de desarrollo personal gestionados activamente"]
            },
            it: {
              text: "Quanto è strutturato e costante il modo in cui la Sua concessionaria valuta le performance individuali del personale e le collega allo sviluppo e alla retribuzione?",
              description: "Consideri se gli obiettivi sono chiari, le valutazioni avvengono regolarmente e i risultati influenzano effettivamente la retribuzione, il coaching o la progressione di carriera",
              purpose: "La cadenza della gestione delle performance è un indicatore proxy del personale che predice la fidelizzazione, la produttività e la capacità della concessionaria di migliorare attraverso le persone — la singola variabile che differenzia le concessionarie costantemente ad alte performance.",
              situationAnalysis: "Le concessionarie senza una gestione strutturata delle performance non possono diagnosticare se la sottoperformance è un problema di competenza, volontà o processo. Senza obiettivi chiari e feedback regolari, anche il personale capace si adagia, e i migliori talenti se ne vanno verso ambienti che li riconoscono.",
              benefits: "La gestione strutturata delle performance migliora la produttività senza aumento dell'organico, riduce il turnover attraverso il riconoscimento e la chiarezza dello sviluppo, e crea l'infrastruttura gestionale necessaria per crescere in modo costante.",
              scaleLabels: ["Nessun processo formale di valutazione — le performance vengono discusse informalmente o per nulla", "Solo valutazione annuale, collegamento limitato con retribuzione o sviluppo", "Valutazioni semestrali con obiettivi di base, qualche collegamento con la retribuzione variabile", "Valutazioni trimestrali strutturate con KPI chiari, retribuzione variabile legata ai risultati, piani di sviluppo attivi", "Revisioni KPI individuali mensili + valutazioni trimestrali, pieno allineamento della retribuzione variabile, piani di sviluppo personale gestiti attivamente"]
            }
          }
        },
        {
          id: "fin-kpi-1",
          kind: "data",
          text: "What is your dealership's net profit as a percentage of total revenue?",
          description: "Dealership net profit (after all operating expenses, before tax) as a percentage of total revenue for the last financial year.",
          type: "percentage",
          category: "performance_data",
          subSection: "performance_data",
          kpiKey: "fin_net_profit_pct",
          unit: "%",
          referencePeriod: "last_financial_year",
          validRange: { min: -20, max: 25 },
          formula: {
            expression: "Net profit before tax ÷ total revenue × 100",
            example: "€450,000 net profit ÷ €18,000,000 total revenue × 100 = 2.5%",
            dataSource: "Annual management accounts / profit and loss statement"
          },
          translations: {
            en: {
              text: "What is your dealership's net profit as a percentage of total revenue?",
              description: "Dealership net profit (after all operating expenses, before tax) as a percentage of total revenue for the last financial year."
            },
            de: {
              text: "Wie hoch ist der Nettogewinn Ihres Betriebs in Prozent des Gesamtumsatzes?",
              description: "Nettogewinn des Betriebs (nach allen Betriebskosten, vor Steuern) als Prozentsatz des Gesamtumsatzes im letzten Geschäftsjahr."
            },
            fr: {
              text: "Quel est le bénéfice net de votre concessionnaire en pourcentage du chiffre d'affaires total ?",
              description: "Bénéfice net du concessionnaire (après toutes les charges d'exploitation, avant impôts) en pourcentage du chiffre d'affaires total pour le dernier exercice financier."
            },
            es: {
              text: "¿Cuál es el beneficio neto de su concesionario como porcentaje de los ingresos totales?",
              description: "Beneficio neto del concesionario (tras todos los gastos operativos, antes de impuestos) como porcentaje de los ingresos totales del último ejercicio fiscal."
            },
            it: {
              text: "Qual è l'utile netto della Sua concessionaria come percentuale del fatturato totale?",
              description: "Utile netto della concessionaria (dopo tutte le spese operative, prima delle imposte) come percentuale del fatturato totale per l'ultimo esercizio finanziario."
            }
          }
        },
        {
          id: "fin-kpi-2",
          kind: "data",
          text: "What is your total variable gross profit per new vehicle unit (front + back combined)?",
          description: "Total variable gross profit per new vehicle unit retailed, combining front-end (vehicle sale) and back-end (finance, insurance, accessories) gross profit.",
          type: "currency",
          category: "performance_data",
          subSection: "performance_data",
          kpiKey: "fin_total_gp_per_nv_unit",
          unit: "EUR",
          referencePeriod: "last_calendar_month",
          validRange: { min: 0, max: 20000 },
          formula: {
            expression: "(Front-end gross profit + back-end/F&I gross profit on new vehicles) ÷ new vehicle units retailed",
            example: "(€420,000 front-end + €180,000 back-end) ÷ 120 units = €5,000 per unit",
            dataSource: "DMS new vehicle deals report — combined front and back gross by unit"
          },
          translations: {
            en: {
              text: "What is your total variable gross profit per new vehicle unit (front + back combined)?",
              description: "Total variable gross profit per new vehicle unit retailed, combining front-end (vehicle sale) and back-end (finance, insurance, accessories) gross profit."
            },
            de: {
              text: "Wie hoch ist Ihr gesamter variabler Bruttoertrag pro Neuwagen-Einheit (Front- und Backend kombiniert)?",
              description: "Gesamter variabler Bruttoertrag pro verkaufter Neuwagen-Einheit, bestehend aus Frontend (Fahrzeugverkauf) und Backend (Finanzierung, Versicherung, Zubehör)."
            },
            fr: {
              text: "Quel est votre profit brut variable total par unité de véhicule neuf (front + back combinés) ?",
              description: "Profit brut variable total par unité de véhicule neuf vendu au détail, combinant le front-end (vente du véhicule) et le back-end (financement, assurance, accessoires)."
            },
            es: {
              text: "¿Cuál es su margen bruto variable total por unidad de vehículo nuevo (front-end + back-end combinados)?",
              description: "Margen bruto variable total por unidad de vehículo nuevo vendida al público, combinando el margen bruto de front-end (venta del vehículo) y back-end (financiación, seguros, accesorios)."
            },
            it: {
              text: "Qual è il Suo margine lordo variabile totale per unità di veicolo nuovo (front + back combinati)?",
              description: "Margine lordo variabile totale per unità di veicolo nuovo venduto al dettaglio, combinando front-end (vendita veicolo) e back-end (finanziamenti, assicurazioni, accessori)."
            }
          }
        },
        {
          id: "fin-kpi-3",
          kind: "data",
          text: "What is your floorplan interest cost as a percentage of new vehicle gross profit?",
          description: "Floorplan (inventory financing) interest cost as a percentage of new vehicle gross profit, indicating how much new vehicle margin is consumed by financing stock.",
          type: "percentage",
          category: "performance_data",
          subSection: "performance_data",
          kpiKey: "fin_floorplan_cost_pct",
          unit: "%",
          referencePeriod: "last_calendar_month",
          validRange: { min: 0, max: 100 },
          formula: {
            expression: "Floorplan interest expense on new vehicle stock ÷ total new vehicle gross profit × 100",
            example: "€21,000 floorplan interest ÷ €420,000 new vehicle gross profit × 100 = 5%",
            dataSource: "Management accounts — floorplan interest expense line vs. new vehicle department gross profit"
          },
          translations: {
            en: {
              text: "What is your floorplan interest cost as a percentage of new vehicle gross profit?",
              description: "Floorplan (inventory financing) interest cost as a percentage of new vehicle gross profit, indicating how much new vehicle margin is consumed by financing stock."
            },
            de: {
              text: "Wie hoch sind Ihre Einstandsfinanzierungskosten (Floorplan) im Verhältnis zum Neuwagen-Bruttoertrag?",
              description: "Zinskosten der Einstandsfinanzierung (Floorplan) für den Neuwagenbestand als Prozentsatz des gesamten Neuwagen-Bruttoertrags."
            },
            fr: {
              text: "Quel est votre coût d'intérêts de financement de stock en pourcentage de la marge brute VN ?",
              description: "Coût d'intérêts du financement de stock (floor plan) en pourcentage de la marge brute des véhicules neufs, indiquant quelle part de la marge VN est absorbée par le financement du stock."
            },
            es: {
              text: "¿Cuál es su coste de intereses de financiación de inventario como porcentaje del margen bruto de vehículos nuevos?",
              description: "Coste de intereses de financiación de inventario como porcentaje del margen bruto de vehículos nuevos, indicando cuánto margen de vehículos nuevos se consume en financiar el stock."
            },
            it: {
              text: "Qual è il costo degli interessi sul floor plan come percentuale del margine lordo sui veicoli nuovi?",
              description: "Costo degli interessi sul floor plan (finanziamento del magazzino) come percentuale del margine lordo sui veicoli nuovi, che indica quanto del margine sui veicoli nuovi viene assorbito dal finanziamento dello stock."
            }
          }
        },
        {
          id: "fin-kpi-4",
          kind: "data",
          text: "What is your revenue per employee across the whole dealership?",
          description: "Total dealership revenue divided by total headcount (full-time equivalent employees) for the last financial year.",
          type: "currency",
          category: "performance_data",
          subSection: "performance_data",
          kpiKey: "fin_revenue_per_employee",
          unit: "EUR",
          referencePeriod: "last_financial_year",
          validRange: { min: 0, max: 2000000 },
          formula: {
            expression: "Total annual revenue ÷ average full-time equivalent (FTE) headcount",
            example: "€18,000,000 total revenue ÷ 45 FTE = €400,000 revenue per employee",
            dataSource: "Annual management accounts (revenue) + HR/payroll FTE headcount records"
          },
          translations: {
            en: {
              text: "What is your revenue per employee across the whole dealership?",
              description: "Total dealership revenue divided by total headcount (full-time equivalent employees) for the last financial year."
            },
            de: {
              text: "Wie hoch ist Ihr Umsatz pro Mitarbeiter über den gesamten Betrieb?",
              description: "Gesamtumsatz des Betriebs geteilt durch die durchschnittliche Anzahl der Vollzeitäquivalente (VZÄ) im letzten Geschäftsjahr."
            },
            fr: {
              text: "Quel est votre chiffre d'affaires par employé pour l'ensemble du concessionnaire ?",
              description: "Chiffre d'affaires total du concessionnaire divisé par l'effectif total (équivalents temps plein) pour le dernier exercice financier."
            },
            es: {
              text: "¿Cuáles son sus ingresos por empleado en todo el concesionario?",
              description: "Ingresos totales del concesionario divididos por la plantilla total (empleados equivalentes a tiempo completo) del último ejercicio fiscal."
            },
            it: {
              text: "Qual è il Suo fatturato per dipendente nell'intera concessionaria?",
              description: "Fatturato totale della concessionaria diviso per l'organico totale (equivalente a tempo pieno) per l'ultimo esercizio finanziario."
            }
          }
        },
        {
          id: "fin-kpi-5",
          kind: "data",
          text: "What is your current debtor days outstanding (accounts receivable)?",
          description: "Current debtor days outstanding — the average number of days it takes to collect accounts receivable (Debitorenlaufzeit).",
          type: "numeric",
          category: "performance_data",
          subSection: "performance_data",
          kpiKey: "fin_debtor_days",
          unit: "days",
          referencePeriod: "current",
          validRange: { min: 0, max: 180 },
          formula: {
            expression: "(Accounts receivable ÷ annual credit sales) × 365",
            example: "(€450,000 receivables ÷ €18,000,000 annual sales) × 365 = 9.1 days",
            dataSource: "Balance sheet (accounts receivable) + annual revenue from management accounts"
          },
          translations: {
            en: {
              text: "What is your current debtor days outstanding (accounts receivable)?",
              description: "Current debtor days outstanding — the average number of days it takes to collect accounts receivable (Debitorenlaufzeit)."
            },
            de: {
              text: "Wie hoch ist Ihre aktuelle Debitorenlaufzeit (Forderungslaufzeit)?",
              description: "Aktuelle Debitorenlaufzeit: die durchschnittliche Anzahl an Tagen, die zum Einzug offener Forderungen benötigt wird."
            },
            fr: {
              text: "Quel est votre délai actuel de recouvrement des créances clients ?",
              description: "Délai actuel de recouvrement des créances — nombre moyen de jours nécessaires pour encaisser les comptes clients (Debitorenlaufzeit)."
            },
            es: {
              text: "¿Cuál es su plazo medio actual de cobro a deudores (cuentas por cobrar)?",
              description: "Plazo medio actual de cobro a deudores — el número medio de días que se tarda en cobrar las cuentas por cobrar (Debitorenlaufzeit)."
            },
            it: {
              text: "Qual è il Suo attuale numero di giorni medi di incasso crediti (crediti verso clienti)?",
              description: "Giorni medi di incasso crediti attuali — il numero medio di giorni necessari per incassare i crediti verso clienti (Debitorenlaufzeit)."
            }
          }
        },
        {
          id: "fin-kpi-6",
          kind: "data",
          text: "What percentage of your total gross profit comes from aftersales (service + parts)?",
          description: "Share of total dealership gross profit generated by aftersales (service plus parts departments combined), versus vehicle sales departments.",
          type: "percentage",
          category: "performance_data",
          subSection: "performance_data",
          kpiKey: "fin_aftersales_gp_share_pct",
          unit: "%",
          referencePeriod: "last_financial_year",
          validRange: { min: 0, max: 100 },
          formula: {
            expression: "(Service gross profit + parts gross profit) ÷ total dealership gross profit × 100",
            example: "(€620,000 service GP + €580,000 parts GP) ÷ €2,400,000 total GP × 100 = 50%",
            dataSource: "Annual departmental profit and loss — gross profit by department"
          },
          translations: {
            en: {
              text: "What percentage of your total gross profit comes from aftersales (service + parts)?",
              description: "Share of total dealership gross profit generated by aftersales (service plus parts departments combined), versus vehicle sales departments."
            },
            de: {
              text: "Welcher Anteil Ihres Gesamtbruttoertrags stammt aus dem Aftersales-Geschäft (Service und Teile)?",
              description: "Anteil des gesamten Bruttoertrags des Betriebs, der aus dem Aftersales-Geschäft (Service- und Teileabteilung zusammen) stammt, im Vergleich zu den Verkaufsabteilungen."
            },
            fr: {
              text: "Quel pourcentage de votre marge brute totale provient de l'après-vente (atelier + pièces de rechange) ?",
              description: "Part de la marge brute totale du concessionnaire générée par l'après-vente (départements atelier et pièces de rechange combinés), par rapport aux départements de vente de véhicules."
            },
            es: {
              text: "¿Qué porcentaje de su margen bruto total proviene de posventa (servicio + recambios)?",
              description: "Proporción del margen bruto total del concesionario generado por posventa (departamentos de servicio y recambios combinados), frente a los departamentos de venta de vehículos."
            },
            it: {
              text: "Quale percentuale del Suo margine lordo totale proviene dall'aftersales (assistenza + ricambi)?",
              description: "Quota del margine lordo totale della concessionaria generata dall'aftersales (reparti assistenza e ricambi combinati), rispetto ai reparti vendita veicoli."
            }
          }
        },
        {
          id: "fin-kpi-7",
          kind: "data",
          text: "What is your selling expense as a percentage of total variable gross profit?",
          description: "Total selling (sales department operating) expenses as a percentage of total variable gross profit, indicating how much of the gross margin is consumed by sales overhead.",
          type: "percentage",
          category: "performance_data",
          subSection: "performance_data",
          kpiKey: "fin_selling_expense_pct",
          unit: "%",
          referencePeriod: "last_financial_year",
          validRange: { min: 0, max: 200 },
          formula: {
            expression: "Total selling expenses ÷ total variable gross profit × 100",
            example: "€1,080,000 selling expenses ÷ €2,400,000 total variable gross profit × 100 = 45%",
            dataSource: "Annual departmental profit and loss — selling expense lines vs. total variable gross profit"
          },
          translations: {
            en: {
              text: "What is your selling expense as a percentage of total variable gross profit?",
              description: "Total selling (sales department operating) expenses as a percentage of total variable gross profit, indicating how much of the gross margin is consumed by sales overhead."
            },
            de: {
              text: "Wie hoch sind Ihre Vertriebskosten im Verhältnis zum gesamten variablen Bruttoertrag?",
              description: "Gesamte Vertriebskosten (Betriebskosten der Verkaufsabteilung) als Prozentsatz des gesamten variablen Bruttoertrags."
            },
            fr: {
              text: "Quel est votre ratio de charges commerciales en pourcentage du profit brut variable total ?",
              description: "Total des charges d'exploitation du département commercial en pourcentage du profit brut variable total, indiquant quelle part de la marge brute est absorbée par les frais de vente."
            },
            es: {
              text: "¿Cuál es su gasto comercial como porcentaje del margen bruto variable total?",
              description: "Gastos comerciales totales (gastos operativos del departamento de ventas) como porcentaje del margen bruto variable total, indicando cuánto del margen bruto se consume en gastos generales de ventas."
            },
            it: {
              text: "Quali sono le Sue spese commerciali come percentuale del margine lordo variabile totale?",
              description: "Spese operative totali del reparto vendite come percentuale del margine lordo variabile totale, che indica quanto del margine lordo viene assorbito dai costi generali di vendita."
            }
          }
        }
      ]
    }
  ]
};

// Helper function to get translated question content
export function getTranslatedQuestion<T extends Question>(question: T, language: Language): T {
  if (!question.translations || !question.translations[language]) {
    return question;
  }

  const translation = question.translations[language];
  const base = {
    ...question,
    text: translation.text || question.text,
    description: translation.description || question.description,
    purpose: translation.purpose || question.purpose,
    situationAnalysis: translation.situationAnalysis || question.situationAnalysis,
    benefits: translation.benefits || question.benefits,
  };

  if (isScoredQuestion(question)) {
    return {
      ...base,
      scale: {
        ...question.scale,
        labels: translation.scaleLabels || question.scale.labels
      }
    } as T;
  }

  return base as T;
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
