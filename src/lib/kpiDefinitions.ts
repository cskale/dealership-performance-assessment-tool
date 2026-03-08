export interface KPIDefinition {
  title: string;
  definition: string;
  executiveSummary?: string;
  whyItMatters: string;
  formula?: string;
  inclusions?: string[];
  exclusions?: string[];
  unitOfMeasure?: string;
  benchmark?: string;
  rootCauseDiagnostics?: {
    people: string;
    process: string;
    tools: string;
    structure: string;
    incentives: string;
  };
  improvementLevers?: string[];
  interdependencies?: {
    upstreamDrivers: string[];
    downstreamImpacts: string[];
  };
  department?: string;
}

export const KPI_DEFINITIONS: Record<string, { en: KPIDefinition; de: KPIDefinition }> = {
  // =====================================================
  // NEW VEHICLE SALES KPIs (from Deep Dive document)
  // =====================================================
  leadResponseTime: {
    en: {
      title: 'Lead Response Time',
      definition: 'The average time elapsed between when a lead first contacts the dealership and when the dealership provides a meaningful human response.',
      executiveSummary: 'Lead Response Time is a critical predictor of conversion success. Research shows responding within 1 minute yields 391% improvement in lead conversion, while waiting 30 minutes reduces effectiveness by 21 times. With only 5.5% of dealerships responding within one hour, rapid response creates immediate market differentiation.',
      whyItMatters: 'Speed-to-lead directly impacts showroom traffic, appointment booking rates, and revenue per sales executive. Reflects operational readiness and CRM system effectiveness.',
      formula: 'Lead Response Time = Σ(Response Timestamp − Lead Inquiry Timestamp) / Total Number of Leads',
      inclusions: ['All lead sources (web forms, phone calls, emails, chat, third-party platforms)'],
      exclusions: ['After-hours leads responded to during next business day (track separately)', 'Automated/bot responses without human follow-up'],
      unitOfMeasure: 'Minutes or Hours',
      benchmark: '<5 minutes',
      department: 'new-vehicle-sales',
      rootCauseDiagnostics: {
        people: 'Insufficient BDC staffing, lack of urgency culture, poor lead assignment clarity, inadequate training on response protocols',
        process: 'No lead routing rules, unclear escalation procedures, manual lead distribution, lack of SLA standards',
        tools: 'Inadequate CRM alerts/notifications, poor mobile accessibility, no lead management system integration',
        structure: 'No dedicated BDC/internet department, poor shift coverage, unclear ownership between sales and BDC',
        incentives: 'No penalties for slow response, compensation not tied to response speed, lack of gamification/leaderboards'
      },
      improvementLevers: [
        'Implement instant lead routing automation with mobile push notifications',
        'Establish 5-minute response SLA with escalation after 10 minutes',
        'Create dedicated BDC with extended coverage or AI-powered initial response',
        'Deploy auto-responders followed by immediate human contact',
        'Implement real-time response time dashboards visible to team',
        'Tie BDC compensation directly to response time performance'
      ],
      interdependencies: {
        upstreamDrivers: ['Lead volume and quality', 'CRM system capabilities', 'Staff availability/scheduling', 'Training effectiveness'],
        downstreamImpacts: ['Lead Conversion Rate (+391% when <1 min vs. delayed)', 'Appointment Show Rate', 'Showroom Traffic Conversion Rate', 'Sales Cycle Length']
      }
    },
    de: {
      title: 'Lead-Reaktionszeit',
      definition: 'Die durchschnittliche Zeit zwischen der ersten Kontaktaufnahme eines Leads und der ersten menschlichen Antwort des Autohauses.',
      whyItMatters: 'Schnelle Lead-Reaktion beeinflusst direkt Showroom-Verkehr, Terminbuchungsraten und Umsatz pro Verkaufsberater.',
      benchmark: '<5 Minuten'
    }
  },
  leadConversion: {
    en: {
      title: 'Lead Conversion Rate',
      definition: 'The percentage of all leads that ultimately convert into vehicle purchases within a defined tracking period.',
      executiveSummary: 'Lead Conversion Rate is the ultimate measure of sales and marketing effectiveness, directly translating marketing investment into revenue. Industry benchmarks range from 10-15% for well-optimized operations. A 1% improvement can add significant revenue without additional marketing cost.',
      whyItMatters: 'Measures sales team effectiveness. Improving conversion reduces customer acquisition costs and maximizes marketing ROI.',
      formula: 'Lead Conversion Rate (%) = (Number of Sales / Total Number of Leads) × 100',
      inclusions: ['All lead sources (walk-ins, phone, web, third-party, referrals)', 'All vehicle types'],
      exclusions: ['Duplicate leads from same customer', 'Unqualified/spam leads', 'Leads outside service area'],
      unitOfMeasure: 'Percentage (%)',
      benchmark: '10-15%',
      department: 'new-vehicle-sales',
      rootCauseDiagnostics: {
        people: 'Inadequate sales training, poor needs analysis skills, weak closing techniques, inconsistent follow-up discipline',
        process: 'Weak lead qualification process, insufficient follow-up touchpoints, no standardized sales process, poor CRM hygiene',
        tools: 'Poor lead tracking visibility, inadequate inventory matching tools, lack of digital retailing options',
        structure: 'Misalignment between BDC and sales floor, poor lead handoff process, territory conflicts',
        incentives: 'Compensation favoring walk-ins over internet leads, no bonuses for conversion improvement, lack of accountability'
      },
      improvementLevers: [
        'Implement lead scoring to prioritize high-intent prospects',
        'Develop multi-touch follow-up sequences (minimum 7-10 touchpoints)',
        'Create specialized internet sales team vs. traditional sales floor',
        'Enhance lead qualification criteria to focus on viable prospects',
        'Deploy video personalization and multi-channel engagement',
        'Provide real-time inventory matching and digital retailing tools',
        'Track conversion by source to optimize marketing spend'
      ],
      interdependencies: {
        upstreamDrivers: ['Lead Response Time', 'Lead Quality Score by source', 'Marketing campaign effectiveness', 'Inventory availability'],
        downstreamImpacts: ['Units Sold per Sales Executive', 'Revenue per Sales Executive', 'Gross per New Vehicle', 'Customer Acquisition Cost']
      }
    },
    de: {
      title: 'Lead-Konversionsrate',
      definition: 'Prozentsatz der Leads, die zu tatsächlichen Fahrzeugverkäufen werden',
      whyItMatters: 'Misst die Effektivität des Verkaufsteams. Verbesserte Konversion reduziert Kundenakquisitionskosten und maximiert Marketing-ROI.',
      benchmark: '10-15%'
    }
  },
  showroomConversion: {
    en: {
      title: 'Showroom Traffic Conversion Rate',
      definition: 'The percentage of physical showroom visitors who ultimately purchase a vehicle.',
      executiveSummary: 'Showroom Traffic Conversion is the most direct measure of sales floor effectiveness. Unlike digital leads, showroom visitors have invested time and effort, indicating strong purchase intent. Industry benchmarks range from 20-40% for optimized dealerships.',
      whyItMatters: 'Directly reflects sales team skill, inventory appeal, facility experience, and pricing competitiveness.',
      formula: 'Showroom Traffic Conversion Rate (%) = (Number of Sales from Showroom Visitors / Total Showroom Visitors) × 100',
      inclusions: ['All walk-in traffic', 'Scheduled appointments who show', 'Returning customers'],
      exclusions: ['Service-only customers', 'Parts counter visitors', 'Non-buying companions'],
      unitOfMeasure: 'Percentage (%)',
      benchmark: '20-40%',
      department: 'new-vehicle-sales',
      rootCauseDiagnostics: {
        people: 'Weak greeting/engagement skills, poor product knowledge, inability to overcome objections, rushed sales approach',
        process: 'No consistent sales process, weak needs assessment, inadequate follow-up on unsold ups, poor trade evaluation',
        tools: 'Limited inventory variety, no virtual inventory access, poor desking tools, slow financing approval',
        structure: 'Poor floor coverage during peak times, territorial sales approach, lack of team selling',
        incentives: 'Commission structure discouraging time investment, cherry-picking behavior, no accountability for unsold traffic'
      },
      improvementLevers: [
        'Implement mandatory sales process adherence (greet, qualify, present, demo, close)',
        'Train on consultative selling vs. product pushing',
        'Enhance CRM logging for every up (sold or unsold) to enable follow-up',
        'Create specialization by vehicle type or customer segment',
        'Deploy "up system" to ensure fair distribution and accountability',
        'Conduct regular role-playing and objection-handling training',
        'Increase floor manager coaching presence during customer interactions'
      ],
      interdependencies: {
        upstreamDrivers: ['Quality of showroom traffic', 'Inventory selection and availability', 'Sales team training and skill level', 'Facility appearance and experience'],
        downstreamImpacts: ['Units Sold per Sales Executive', 'Test Drive Ratio', 'Closing Ratio', 'Average Transaction Price', 'Front-End Gross %']
      }
    },
    de: {
      title: 'Showroom-Konversionsrate',
      definition: 'Prozentsatz der Showroom-Besucher, die letztlich ein Fahrzeug kaufen.',
      whyItMatters: 'Spiegelt direkt Verkaufsteam-Fähigkeiten, Bestandsattraktivität und Preiskompetenz wider.',
      benchmark: '20-40%'
    }
  },
  testDriveRatio: {
    en: {
      title: 'Test Drive Ratio',
      definition: 'The percentage of showroom visitors or qualified leads who take a test drive of a vehicle.',
      executiveSummary: 'Test Drive Ratio is a critical mid-funnel conversion metric. Research shows test drives dramatically increase purchase probability — 20-40% of test drives convert to sales. This metric reveals both sales team ability to move prospects through the buying journey and inventory appeal.',
      whyItMatters: 'Bridges initial interest and purchase commitment. Optimizing speed-to-test-drive and follow-up protocols improves overall closing rates.',
      formula: 'Test Drive Ratio (%) = (Number of Test Drives / Total Showroom Visitors or Qualified Leads) × 100',
      inclusions: ['All vehicle demos (new, used, any duration)', 'Both scheduled and walk-in test drives'],
      exclusions: ['Service loaner demonstrations', 'Dealer trade demos', 'Non-customer test drives'],
      unitOfMeasure: 'Percentage (%)',
      benchmark: '50-70%',
      department: 'new-vehicle-sales',
      rootCauseDiagnostics: {
        people: 'Sales team not suggesting test drives proactively, lack of confidence in demonstrating features, poor qualification leading to wrong vehicle selection',
        process: 'Cumbersome test drive approval process, no standardized demo route, inadequate vehicle preparation, slow key retrieval',
        tools: 'Limited demo fleet availability, poor scheduling tools, no digital license scanning',
        structure: 'Understaffed during peak hours reducing demo availability, no dedicated demo vehicles maintained',
        incentives: 'No tracking or accountability for test drive offers, volume focus discouraging time investment in demos'
      },
      improvementLevers: [
        'Make test drive suggestion mandatory in sales process (scripted offer)',
        'Streamline administrative requirements (e-signatures, digital license scan)',
        'Maintain dedicated demo fleet for popular models in optimal condition',
        'Create compelling demonstration routes highlighting vehicle features',
        'Train sales team on experiential selling (focus on feeling, not just features)',
        'Implement "demo or document" policy — if no test drive, must document reason',
        'Track test drive ratio by salesperson and provide coaching'
      ],
      interdependencies: {
        upstreamDrivers: ['Showroom Traffic volume and quality', 'Lead Response Time', 'Inventory availability and appeal', 'Sales team engagement effectiveness'],
        downstreamImpacts: ['Closing Ratio (test drives increase close rate 20-40%)', 'Sales Cycle Length', 'Average Transaction Price', 'Gross per New Vehicle', 'Customer satisfaction']
      }
    },
    de: {
      title: 'Probefahrt-Quote',
      definition: 'Prozentsatz der Showroom-Besucher oder qualifizierten Leads, die eine Probefahrt machen.',
      whyItMatters: 'Verbindet anfängliches Interesse und Kaufverpflichtung. Optimierung der Probefahrt-Abläufe verbessert die Abschlussquote.',
      benchmark: '50-70%'
    }
  },
  appointmentShowRate: {
    en: {
      title: 'Appointment Show Rate',
      definition: 'The percentage of scheduled sales appointments where the customer actually arrives at the dealership.',
      executiveSummary: 'Each no-show represents $75-150 in direct revenue loss, plus wasted sales executive time. Best-practice dealerships achieve 60-80% show rates through systematic confirmation and engagement strategies. Improving show rates by 10% can add significant revenue without increasing marketing spend.',
      whyItMatters: 'Directly impacts sales efficiency, resource utilization, and forecasting accuracy.',
      formula: 'Appointment Show Rate (%) = (Number of Appointments Where Customer Showed / Total Scheduled Appointments) × 100',
      inclusions: ['All pre-scheduled appointments (sales, test drives, delivery)', 'Both online and phone-scheduled'],
      exclusions: ['Appointments canceled with >24hr notice (track separately)', 'Rescheduled appointments'],
      unitOfMeasure: 'Percentage (%)',
      benchmark: '60-80%',
      department: 'new-vehicle-sales',
      rootCauseDiagnostics: {
        people: 'Weak appointment confirmation discipline, poor rapport building, failure to establish value proposition for visit',
        process: 'Single confirmation touchpoint, too much time between scheduling and appointment, unclear appointment purpose/duration',
        tools: 'No automated reminder system, lack of calendar integration, no SMS/text capability, poor CRM appointment tracking',
        structure: 'Appointments set by BDC but no sales team awareness, no accountability for no-shows',
        incentives: 'No consequence for chronic no-shows, no rewards for keeping appointments, sales team not penalized for poor appointment setting'
      },
      improvementLevers: [
        'Implement multi-touchpoint confirmation sequence (at booking, 48hrs, 24hrs, 2hrs prior)',
        'Use multiple channels (email, SMS, phone, video message)',
        'Provide "add to calendar" functionality at booking',
        'Send personalized video confirmations from sales advisor',
        'Require smaller deposit or pre-qualification for high-value appointments',
        'Create tiered no-show policy (warnings → deposits → restricted scheduling)',
        'Reward consistent show behavior with perks',
        'Shorten time between appointment setting and actual appointment'
      ],
      interdependencies: {
        upstreamDrivers: ['Lead Response Time', 'Lead quality and qualification rigor', 'Appointment value proposition clarity', 'Customer relationship strength'],
        downstreamImpacts: ['Showroom Traffic Conversion Rate', 'Test Drive Ratio', 'Units Sold per Sales Executive', 'Sales Cycle Length', 'Revenue per Sales Executive']
      }
    },
    de: {
      title: 'Termin-Erscheinungsrate',
      definition: 'Prozentsatz der geplanten Verkaufstermine, bei denen der Kunde tatsächlich erscheint.',
      whyItMatters: 'Beeinflusst direkt Vertriebseffizienz, Ressourcennutzung und Prognosegenauigkeit.',
      benchmark: '60-80%'
    }
  },
  salesCycleLength: {
    en: {
      title: 'Sales Cycle Length',
      definition: 'The average number of days from first customer contact to completed vehicle sale and delivery.',
      executiveSummary: 'Shorter cycles mean faster inventory turns, reduced floor plan interest, and higher sales volume per executive. Industry benchmarks: 0-30 days excellent, 30-60 days acceptable, 60-90 days needs improvement. A 10-day reduction can significantly improve annual inventory ROI.',
      whyItMatters: 'Critical efficiency and cash flow metric impacting inventory costs, working capital, and sales productivity.',
      formula: 'Sales Cycle Length (Days) = Σ(Sale Close Date − First Contact Date) / Number of Sales',
      inclusions: ['All sold units from first documented contact to delivery date'],
      exclusions: ['Walk-in same-day cash purchases (track separately)', 'Fleet/commercial sales with procurement cycles'],
      unitOfMeasure: 'Days',
      benchmark: '<30 days',
      department: 'new-vehicle-sales',
      rootCauseDiagnostics: {
        people: 'Inadequate follow-up discipline, poor pipeline management, weak urgency creation, insufficient availability',
        process: 'Excessive decision points/approvals, slow financing processing, complicated paperwork, inefficient delivery preparation',
        tools: 'Manual credit applications, no online document signing, poor inventory visibility, slow trade appraisals',
        structure: 'Handoff delays between departments (sales/F&I/delivery), limited finance sources, inventory constraints',
        incentives: 'No penalties for extended cycles, monthly quotas encouraging end-of-month focus, compensation not velocity-based'
      },
      improvementLevers: [
        'Implement structured follow-up cadence with specific timeline milestones',
        'Deploy digital retailing tools enabling online credit applications',
        'Create urgency through time-limited incentives tied to inventory age',
        'Streamline F&I process with menu selling and e-contracting',
        'Expand lender network for faster approvals',
        'Use predictive analytics to identify at-risk deals',
        'Track cycle length by salesperson and stage to identify bottlenecks',
        'Implement "one-visit close" protocols for qualified buyers'
      ],
      interdependencies: {
        upstreamDrivers: ['Lead Response Time', 'Lead quality', 'Financing pre-qualification', 'Inventory availability'],
        downstreamImpacts: ['Units Sold per Sales Executive', 'Inventory Turnover', 'Closing Ratio', 'Gross per New Vehicle', 'Customer Satisfaction']
      }
    },
    de: {
      title: 'Verkaufszyklus-Länge',
      definition: 'Durchschnittliche Anzahl der Tage vom ersten Kundenkontakt bis zum abgeschlossenen Verkauf.',
      whyItMatters: 'Kritische Effizienz- und Cashflow-Kennzahl mit Einfluss auf Lagerkosten und Vertriebsproduktivität.',
      benchmark: '<30 Tage'
    }
  },
  closingRatio: {
    en: {
      title: 'Closing Ratio',
      definition: 'The percentage of sales opportunities (leads or showroom ups) that result in completed vehicle sales.',
      executiveSummary: 'Closing Ratio is the definitive measure of sales team effectiveness. Typical automotive closing ratios range from 20-25% for all opportunities, with showroom traffic achieving 20-40%. A 5-point improvement can add millions in annual revenue without additional marketing investment.',
      whyItMatters: 'Directly translates opportunities into revenue and profitability. Critical for sales forecasting and capacity planning.',
      formula: 'Closing Ratio (%) = (Number of Sales Closed / Total Number of Opportunities) × 100',
      inclusions: ['All qualified opportunities (leads, walk-ins, phone ups)', 'Both new and used vehicle sales'],
      exclusions: ['Unqualified prospects', 'Service-only customers', 'Duplicate counting'],
      unitOfMeasure: 'Percentage (%)',
      benchmark: '20-25%',
      department: 'new-vehicle-sales',
      rootCauseDiagnostics: {
        people: 'Weak closing skills, fear of asking for sale, poor objection handling, inadequate product knowledge, lack of persistence',
        process: 'No structured closing sequence, weak needs-to-features matching, inadequate proposal/pricing strategy, poor trade handling',
        tools: 'Uncompetitive pricing, limited financing options, poor inventory selection relative to market demand',
        structure: 'Price approval delays, management unavailable for negotiations, territorial sales culture preventing team closes',
        incentives: 'Compensation discouraging difficult deals, no coaching for low closers, volume-only focus without quality consideration'
      },
      improvementLevers: [
        'Implement mandatory closing training with certification requirements',
        'Develop multiple closing techniques (assumptive, alternative choice, urgency-based)',
        'Create structured objection-handling playbooks by common scenarios',
        'Deploy real-time deal structuring tools with multiple payment scenarios',
        'Increase management floor presence for collaborative closing',
        'Track closing ratio by individual and provide targeted coaching',
        'Implement peer shadowing programs pairing low and high closers',
        'Use mystery shopping to identify process breakdowns'
      ],
      interdependencies: {
        upstreamDrivers: ['Lead quality and qualification', 'Lead Response Time', 'Showroom Traffic quality', 'Test Drive Ratio', 'Appointment Show Rate'],
        downstreamImpacts: ['Units Sold per Sales Executive', 'Revenue per Sales Executive', 'Average Transaction Price', 'Gross per New Vehicle', 'Customer Satisfaction']
      }
    },
    de: {
      title: 'Abschlussquote',
      definition: 'Prozentsatz der Verkaufschancen, die zu abgeschlossenen Fahrzeugverkäufen führen.',
      whyItMatters: 'Übersetzt Chancen direkt in Umsatz und Rentabilität. Kritisch für Prognose und Kapazitätsplanung.',
      benchmark: '20-25%'
    }
  },
  unitsSoldPerExec: {
    en: {
      title: 'Units Sold per Sales Executive',
      definition: 'The average number of vehicles sold by each sales executive within a defined period.',
      executiveSummary: 'Every 1% increase in sales productivity is worth approximately $500,000 in revenue, with potential to lift sales per employee by 25% to reach 20+ units annually through optimized processes and technology.',
      whyItMatters: 'Primary productivity metric driving staffing decisions, compensation planning, and operational efficiency.',
      formula: 'Units Sold per Sales Executive = Total Vehicles Sold / Number of Sales Executives',
      inclusions: ['All retail vehicle sales (new and used)', 'Full-time and FTE sales staff'],
      exclusions: ['Fleet sales', 'Wholesale transactions', 'Sales managers (unless actively selling)'],
      unitOfMeasure: 'Units (absolute number)',
      benchmark: '15-20 units/month',
      department: 'new-vehicle-sales',
      rootCauseDiagnostics: {
        people: 'Inadequate sales skills, poor time management, low motivation, insufficient product knowledge',
        process: 'Inefficient lead distribution, administrative burden on salespeople, poor inventory matching tools, slow deal processing',
        tools: 'Inadequate CRM adoption, poor mobile tools, limited virtual selling capabilities, manual paperwork',
        structure: 'Overstaffing relative to traffic, poor schedule alignment with customer availability, lack of BDC support',
        incentives: 'Flat compensation not rewarding volume growth, no team selling encouragement, inadequate recognition programs'
      },
      improvementLevers: [
        'Implement BDC to handle appointment setting, freeing sales team for closing',
        'Deploy digital retailing tools to reduce transaction friction',
        'Optimize staffing levels and schedules to match traffic patterns',
        'Provide specialized training on high-efficiency selling techniques',
        'Automate administrative tasks (credit apps, paperwork, vehicle prep)',
        'Create team-based selling for complex deals',
        'Implement performance management with clear productivity targets',
        'Use technology for virtual selling and remote deal structuring'
      ],
      interdependencies: {
        upstreamDrivers: ['Lead volume and quality', 'Closing Ratio', 'Sales Cycle Length', 'Test Drive Ratio', 'Appointment Show Rate'],
        downstreamImpacts: ['Revenue per Sales Executive', 'Dealership total sales volume', 'Gross per New Vehicle', 'Customer Satisfaction', 'Staff retention']
      }
    },
    de: {
      title: 'Einheiten pro Verkaufsberater',
      definition: 'Durchschnittliche Anzahl verkaufter Fahrzeuge pro Verkaufsberater.',
      whyItMatters: 'Primäre Produktivitätskennzahl für Personal-, Vergütungs- und Effizienzentscheidungen.',
      benchmark: '15-20 Einheiten/Monat'
    }
  },
  revenuePerExec: {
    en: {
      title: 'Revenue per Sales Executive',
      definition: 'The average total revenue generated by each sales executive including vehicle sales and F&I products.',
      executiveSummary: 'Revenue per Sales Executive measures both volume productivity and value productivity, making it a comprehensive gauge of sales team contribution. High-performing dealerships optimize both components for maximum profitability.',
      whyItMatters: 'Reveals whether productivity issues stem from volume problems or transaction value problems. Directly ties sales team performance to dealership financial health.',
      formula: 'Revenue per Sales Executive = Total Sales Revenue (Vehicle + F&I) / Number of Sales Executives',
      inclusions: ['All retail vehicle revenue (new and used)', 'F&I product revenue', 'Full-time equivalents (FTE)'],
      exclusions: ['Service and parts revenue', 'Fleet/wholesale sales', 'Sales managers unless actively selling'],
      unitOfMeasure: 'Currency (€, $)',
      benchmark: '€500,000+/month',
      department: 'new-vehicle-sales',
      rootCauseDiagnostics: {
        people: 'Focus on volume without value selling, weak F&I product presentation, poor customer profiling for upsell opportunities',
        process: 'Inadequate needs discovery limiting upsell, rushed sales process skipping add-ons, weak F&I handoff',
        tools: 'Limited product offerings, poor inventory mix (low-margin vehicles), uncompetitive F&I products',
        structure: 'Compensation favoring volume over margin, conflicting incentives between sales and F&I, inadequate F&I support',
        incentives: 'Flat per-unit compensation not rewarding higher-value sales, no bonuses for F&I penetration'
      },
      improvementLevers: [
        'Train on consultative selling emphasizing customer value vs. just price',
        'Improve vehicle mix by stocking higher-margin models and trims',
        'Enhance F&I menu presentation and product value communication',
        'Implement bundled offerings increasing average transaction value',
        'Create sales contests rewarding revenue per unit, not just volume',
        'Develop customer segmentation strategies targeting higher-value buyers',
        'Strengthen sales-to-F&I handoff with warm introductions',
        'Deploy technology showing total cost of ownership'
      ],
      interdependencies: {
        upstreamDrivers: ['Units Sold per Sales Executive', 'Average Transaction Price', 'Back-End Gross', 'Inventory mix and pricing strategy', 'Lead quality'],
        downstreamImpacts: ['Dealership total revenue', 'Gross per New Vehicle', 'Profitability', 'Sales executive compensation', 'Customer lifetime value']
      }
    },
    de: {
      title: 'Umsatz pro Verkaufsberater',
      definition: 'Durchschnittlicher Gesamtumsatz pro Verkaufsberater inklusive Fahrzeugverkauf und F&I-Produkte.',
      whyItMatters: 'Zeigt ob Produktivitätsprobleme aus Volumen- oder Transaktionswert-Problemen stammen.',
      benchmark: '€500.000+/Monat'
    }
  },
  transactionValue: {
    en: {
      title: 'Average Transaction Price',
      definition: 'The average total selling price of vehicles sold, including base price plus dealer-installed accessories, before F&I products.',
      executiveSummary: 'ATP directly impacts gross profit potential and overall revenue without requiring volume increases. A $1,000 increase in ATP with 100 monthly units yields $1.2M additional annual revenue.',
      whyItMatters: 'Reflects inventory mix strategy, pricing power, market positioning, and sales team ability to sell value over price.',
      formula: 'Average Transaction Price = Total Vehicle Sales Revenue / Number of Units Sold',
      inclusions: ['Vehicle selling price', 'Dealer-installed accessories and add-ons', 'Freight/destination charges'],
      exclusions: ['F&I products', 'Taxes and fees', 'Trade-in values (use net figures)'],
      unitOfMeasure: 'Currency (€, $)',
      benchmark: '€42,000+',
      department: 'new-vehicle-sales',
      rootCauseDiagnostics: {
        people: 'Sales team defaulting to lower-priced vehicles for easier closes, weak value presentation skills, fear of losing sale on price',
        process: 'Leading with price instead of value, inadequate needs discovery revealing ability to pay, poor vehicle matching',
        tools: 'Inventory weighted toward lower-trim models, limited premium vehicle availability, poor desking tools',
        structure: 'Compensation per unit regardless of price, excessive price transparency eliminating negotiation',
        incentives: 'Volume-based contests encouraging low-price quick closes, no recognition for premium sales'
      },
      improvementLevers: [
        'Adjust inventory mix toward higher-trim and premium models matching market demographics',
        'Train on feature-benefit selling emphasizing value over price',
        'Implement needs-based selling process identifying customer budget capacity',
        'Create tiered vehicle presentations (good-better-best) anchoring higher prices',
        'Adjust compensation to reward higher-value sales',
        'Deploy comparison tools highlighting value of premium features',
        'Monitor ATP by salesperson and provide coaching on value selling'
      ],
      interdependencies: {
        upstreamDrivers: ['Inventory mix (vehicle types, trims, features)', 'Market demographics', 'Brand positioning', 'Sales team value-selling skills', 'Competitive pricing pressure'],
        downstreamImpacts: ['Revenue per Sales Executive', 'Gross per New Vehicle', 'Front-End Gross %', 'Total dealership revenue', 'Customer profile quality']
      }
    },
    de: {
      title: 'Durchschnittlicher Transaktionspreis',
      definition: 'Durchschnittlicher Gesamtverkaufspreis der Fahrzeuge inkl. Zubehör, vor F&I-Produkten.',
      whyItMatters: 'Spiegelt Bestandsmix-Strategie, Preisgestaltungsmacht und Marktpositionierung wider.',
      benchmark: '€42.000+'
    }
  },
  grossPerNewVehicle: {
    en: {
      title: 'Gross per New Vehicle',
      definition: 'The average total gross profit earned on each new vehicle sold, including front-end gross, aftermarket products, holdback, and manufacturer incentives.',
      executiveSummary: 'This is the definitive profitability metric. Industry averages range from $1,500-$3,000 per unit. A $100 per-unit increase on 100 monthly sales yields $120,000 annually.',
      whyItMatters: 'Directly flows to dealership net profit. Encompasses negotiation effectiveness, inventory management, and aftermarket penetration.',
      formula: 'Gross per New Vehicle = (Retail Gross Profit + Aftermarket + Holdback + Incentives) / Number of Retail Units Sold',
      inclusions: ['Front-end vehicle gross profit', 'Dealer-installed accessories', 'Holdback (manufacturer rebate)', 'Dealer incentives/bonuses'],
      exclusions: ['F&I income (tracked separately as back-end)', 'Service contract income', 'Fleet/wholesale sales'],
      unitOfMeasure: 'Currency (€, $)',
      benchmark: '€1,500-3,000',
      department: 'new-vehicle-sales',
      rootCauseDiagnostics: {
        people: 'Weak negotiation skills, discounting too early, not presenting value effectively, giving away margin unnecessarily',
        process: 'No structured pricing strategy, poor desking procedures, inadequate management oversight of discounting, failure to maximize OEM programs',
        tools: 'Inaccurate cost/incentive tracking, poor competitive pricing intelligence, limited aftermarket product offerings',
        structure: 'Excessive pricing authority at sales level, pressure to move aged inventory at any margin, competing internal quotas',
        incentives: 'Volume-only compensation encouraging low-margin sales, no profit-based bonuses'
      },
      improvementLevers: [
        'Implement structured desking process with required manager approval for below-threshold margins',
        'Train on value-based selling and negotiation techniques (anchoring, bundling)',
        'Maximize utilization of manufacturer holdback and incentive programs',
        'Increase aftermarket product attachment (accessories, protection packages)',
        'Deploy dynamic pricing tools using market data to optimize asking prices',
        'Age inventory strategically with pricing tiers (premium for fresh stock)',
        'Create profit-based compensation components',
        'Establish minimum gross profit standards per vehicle category'
      ],
      interdependencies: {
        upstreamDrivers: ['Average Transaction Price', 'Closing Ratio', 'Inventory age', 'Sales team negotiation skill', 'Market competitiveness'],
        downstreamImpacts: ['Total dealership gross profit', 'Net profit', 'Absorption rate', 'Sales executive compensation', 'Inventory management decisions']
      }
    },
    de: {
      title: 'Bruttogewinn pro Neufahrzeug',
      definition: 'Durchschnittlicher Gesamtbruttogewinn pro verkauftem Neufahrzeug.',
      whyItMatters: 'Fließt direkt in den Nettogewinn. Umfasst Verhandlungseffektivität und Bestandsmanagement.',
      benchmark: '€1.500-3.000'
    }
  },
  frontEndGross: {
    en: {
      title: 'Front-End Gross %',
      definition: 'The gross profit margin percentage on the vehicle sale itself.',
      executiveSummary: 'Front-End Gross % measures pricing power and negotiation effectiveness as a ratio, enabling comparison across vehicle price points. Typical new vehicle margins range from 5-8%. Declining percentages indicate increased pricing pressure or poor negotiation.',
      whyItMatters: 'Essential for strategic pricing decisions, market positioning evaluation, and identifying training needs.',
      formula: 'Front-End Gross % = ((Selling Price − True Cost) / Selling Price) × 100',
      inclusions: ['Vehicle selling price', 'Actual dealer cost (invoice minus all rebates/incentives)'],
      exclusions: ['F&I products', 'Aftermarket accessories sold separately', 'Doc fees'],
      unitOfMeasure: 'Percentage (%)',
      benchmark: '5-8%',
      department: 'new-vehicle-sales',
      rootCauseDiagnostics: {
        people: 'Immediately discounting without establishing value, weak closing confidence, fear-based negotiations',
        process: 'Leading with price instead of payment, no structured negotiation framework, giving "lowest price" too early',
        tools: 'Excessive online price transparency removing negotiation room, third-party pricing tools creating unrealistic expectations',
        structure: 'High-volume low-margin strategy, price-based advertising creating race-to-bottom positioning',
        incentives: 'Compensation structure rewarding only volume without margin considerations'
      },
      improvementLevers: [
        'Shift to payment-focused selling vs. price-focused negotiations',
        'Train on value-stacking techniques before presenting price',
        'Implement structured discount approval requiring justification',
        'Create multi-step negotiation framework',
        'Reduce advertised discounting and low-margin lead vehicles',
        'Deploy technology showing total cost of ownership vs. just purchase price',
        'Establish minimum gross percentage thresholds by vehicle type'
      ],
      interdependencies: {
        upstreamDrivers: ['Brand pricing power', 'Market inventory supply', 'Sales team negotiation skills', 'Marketing positioning', 'Competitive intensity'],
        downstreamImpacts: ['Gross per New Vehicle', 'Total front-end gross profit', 'Closing Ratio (inverse relationship)', 'Average Transaction Price', 'Net profit margin']
      }
    },
    de: {
      title: 'Front-End Bruttomarge %',
      definition: 'Bruttogewinnmarge in Prozent auf den Fahrzeugverkauf selbst.',
      whyItMatters: 'Wesentlich für strategische Preisentscheidungen und Marktpositionierung.',
      benchmark: '5-8%'
    }
  },
  backEndGross: {
    en: {
      title: 'Back-End Gross (F&I) per Unit',
      definition: 'The average gross profit earned from F&I products and aftermarket items sold per vehicle.',
      executiveSummary: 'Back-End Gross represents one of the highest-margin profit centers, often contributing 40-60% of total dealership profitability. Industry benchmarks range from $1,000-$1,800 per unit. A $200 improvement per unit on 100 monthly sales yields $240,000 annually.',
      whyItMatters: 'Unlike front-end gross which faces pricing pressure, back-end products offer higher margins and less transparency.',
      formula: 'Back-End Gross per Unit = (F&I Product Income + Finance Reserve + Aftermarket Income) / Number of Units Sold',
      inclusions: ['Extended warranties', 'GAP insurance', 'Paint/fabric/wheel protection', 'Financing reserve', 'Credit insurance', 'Accessories sold in F&I office'],
      exclusions: ['Front-end vehicle gross', 'Accessories sold separately post-sale', 'Denied finance applications'],
      unitOfMeasure: 'Currency (€, $)',
      benchmark: '€1,000-1,800',
      department: 'new-vehicle-sales',
      rootCauseDiagnostics: {
        people: 'F&I managers lacking product knowledge or presentation skills, weak value articulation, rushed presentations',
        process: 'Poor sales-to-F&I handoff, limited presentation time, no structured menu presentation',
        tools: 'Uncompetitive product offerings, poor presentation technology, limited lender options',
        structure: 'Inadequate F&I staffing creating bottlenecks, no dedicated F&I office/privacy',
        incentives: 'Compensation not aligned with product penetration, no accountability for low per-unit averages'
      },
      improvementLevers: [
        'Implement menu-based selling with tiered product packages (good-better-best)',
        'Train sales team to pre-frame F&I value during sales process ("warm handoff")',
        'Enhance F&I manager product knowledge and consultative selling skills',
        'Deploy digital F&I presentation tools showing product value clearly',
        'Expand product portfolio (maintenance plans, wheel/tire programs)',
        'Optimize lender relationships to maximize finance reserve',
        'Create efficient F&I process minimizing wait time while allowing adequate presentation'
      ],
      interdependencies: {
        upstreamDrivers: ['Units Sold (volume drives opportunity)', 'Financing vs. cash purchases', 'Customer profile and creditworthiness', 'Sales team F&I pre-framing quality'],
        downstreamImpacts: ['Total gross per unit', 'Dealership total gross profit and net profit', 'Absorption rate', 'Customer lifetime value', 'Service department revenue']
      }
    },
    de: {
      title: 'Back-End Bruttogewinn (F&I) pro Einheit',
      definition: 'Durchschnittlicher Bruttogewinn aus F&I-Produkten pro verkauftem Fahrzeug.',
      whyItMatters: 'F&I-Produkte bieten höhere Margen und tragen oft 40-60% zum Gesamtgewinn bei.',
      benchmark: '€1.000-1.800'
    }
  },
  fniPenetration: {
    en: {
      title: 'F&I Penetration Rate',
      definition: 'The percentage of vehicle sales that include at least one F&I product.',
      executiveSummary: 'F&I Penetration is foundational for measuring F&I effectiveness. F&I products carry 20-50% margins. Industry benchmarks show average penetration of 46% for service contracts and 45% for GAP insurance. High penetration demonstrates superior customer consultation and drives profitability.',
      whyItMatters: 'Directly impacts profitability since F&I products carry significantly higher margins than vehicle sales.',
      formula: 'F&I Penetration Rate (%) = (Number of Deals with at Least One F&I Product / Total Vehicles Sold) × 100',
      inclusions: ['Any retail deal including one or more F&I products'],
      exclusions: ['Fleet/wholesale sales', 'Cash deals where no F&I presentation occurred', 'Canceled contracts'],
      unitOfMeasure: 'Percentage (%)',
      benchmark: '60-70%',
      department: 'new-vehicle-sales',
      rootCauseDiagnostics: {
        people: 'F&I managers lacking confidence or product knowledge, weak value presentation skills, discomfort with consultative selling',
        process: 'Poor sales-to-F&I handoff leaving customers defensive, inadequate presentation time, no structured menu process',
        tools: 'Uncompetitive product offerings, outdated presentation materials, no digital menu tools',
        structure: 'Insufficient F&I staffing creating bottlenecks, lack of dedicated F&I office, sales team not pre-framing F&I value',
        incentives: 'Compensation not tied to penetration rates, no accountability for low-performing F&I managers'
      },
      improvementLevers: [
        'Train sales team to pre-frame F&I value during vehicle presentation ("warm handoff")',
        'Implement structured menu-based selling with tiered protection packages',
        'Enhance F&I manager consultative selling training',
        'Deploy digital F&I presentation tools with visual value demonstrations',
        'Create "protection package" bundles increasing perceived value',
        'Use customer testimonials demonstrating product benefits',
        'Establish minimum penetration targets with accountability',
        'Optimize F&I office environment for privacy and professional presentation'
      ],
      interdependencies: {
        upstreamDrivers: ['Sales process quality', 'Finance vs. cash deal mix', 'Customer relationship and trust', 'Time allocated for F&I presentation'],
        downstreamImpacts: ['Back-End Gross per Unit', 'Product per Retail Unit (PVR)', 'Total dealership profitability', 'Customer lifetime value', 'Service department revenue']
      }
    },
    de: {
      title: 'F&I-Durchdringungsrate',
      definition: 'Prozentsatz der Fahrzeugverkäufe mit mindestens einem F&I-Produkt.',
      whyItMatters: 'Beeinflusst direkt die Rentabilität, da F&I-Produkte deutlich höhere Margen bieten.',
      benchmark: '60-70%'
    }
  },
  financePenetration: {
    en: {
      title: 'Finance Penetration %',
      definition: 'The percentage of total vehicle sales where the dealership arranges financing versus cash purchases.',
      executiveSummary: 'Financed deals create opportunities for finance reserve income and higher F&I product attachment. Industry averages range from 75-85%. Financed customers are in a payment mindset and more receptive to protection products.',
      whyItMatters: 'Low finance penetration limits back-end gross opportunity, as financed deals generate substantially higher PVR than cash deals.',
      formula: 'Finance Penetration (%) = (Number of Financed Vehicle Sales / Total Vehicle Sales) × 100',
      inclusions: ['All retail vehicle sales financed through any lender'],
      exclusions: ['Lease transactions (track separately)', 'Cash purchases', 'Fleet/wholesale sales'],
      unitOfMeasure: 'Percentage (%)',
      benchmark: '75-85%',
      department: 'new-vehicle-sales',
      rootCauseDiagnostics: {
        people: 'F&I team not proactively offering financing, weak financing benefit presentation, inadequate credit knowledge',
        process: 'No financing pre-qualification during sales process, poor credit application procedures, lengthy approval times',
        tools: 'Limited lender network reducing approval rates, uncompetitive rates, poor credit decisioning technology',
        structure: 'Affluent market demographics with higher cash purchase propensity, weak captive lender relationships',
        incentives: 'No incentives for arranging financing vs. accepting cash deals'
      },
      improvementLevers: [
        'Expand lender network to increase approval rates across credit spectrum',
        'Implement pre-qualification early in sales process',
        'Train sales team to present financing benefits (cash flow preservation, credit building)',
        'Offer competitive rates through captive lender programs',
        'Deploy digital credit applications reducing friction',
        'Create financing incentives encouraging financing vs. cash',
        'Monitor finance penetration by sales advisor for coaching'
      ],
      interdependencies: {
        upstreamDrivers: ['Customer demographics and affluence', 'Lender network breadth', 'Interest rate environment', 'Sales team financing presentation skills'],
        downstreamImpacts: ['Back-End Gross per Unit (financed deals generate 2-3x more F&I)', 'Finance reserve income', 'F&I Penetration Rate', 'Product per Retail Unit', 'Total F&I profitability']
      }
    },
    de: {
      title: 'Finanzierungsquote %',
      definition: 'Prozentsatz der Fahrzeugverkäufe mit Finanzierung über das Autohaus.',
      whyItMatters: 'Niedrige Finanzierungsquote begrenzt die Back-End-Gewinnmöglichkeiten.',
      benchmark: '75-85%'
    }
  },
  extendedWarrantyPenetration: {
    en: {
      title: 'Extended Warranty Penetration',
      definition: 'The percentage of vehicle sales that include an extended service contract or warranty product.',
      executiveSummary: 'Extended warranties typically contribute 25-35% of total F&I income. Industry benchmarks average 46% penetration, with top performers achieving 60-70%+. High margin, high customer loyalty, and future service revenue driver.',
      whyItMatters: 'Generates high profit margins, creates customer loyalty through service retention, and drives future service department revenue.',
      formula: 'Extended Warranty Penetration (%) = (Number of Sales with Extended Warranty / Total Vehicle Sales) × 100',
      inclusions: ['All extended service contracts and vehicle service agreements'],
      exclusions: ['Factory warranties', 'Maintenance plans (track separately)', 'Canceled warranty contracts'],
      unitOfMeasure: 'Percentage (%)',
      benchmark: '46-70%',
      department: 'new-vehicle-sales',
      rootCauseDiagnostics: {
        people: 'F&I managers failing to articulate warranty value, focusing on cost vs. protection benefit, weak objection handling',
        process: 'Inadequate time for warranty presentation, presenting warranties too late in F&I process, no structured menu approach',
        tools: 'Uncompetitive warranty pricing vs. aftermarket options, limited coverage options, poor presentation materials',
        structure: 'Used vehicle focus where customers perceive less warranty need, sales team not pre-framing warranty value',
        incentives: 'Low commission rates on warranty products, no penetration accountability'
      },
      improvementLevers: [
        'Train F&I on emotional/financial benefit selling (peace of mind, budget protection)',
        'Present warranties early in F&I menu using tiered packages',
        'Use real customer claims examples demonstrating warranty value and ROI',
        'Offer competitive multi-tier warranty options (basic to comprehensive)',
        'Create "what if" scenario presentations showing repair costs without warranty',
        'Bundle warranties with other protection products for perceived value',
        'Establish penetration targets by vehicle type with accountability'
      ],
      interdependencies: {
        upstreamDrivers: ['F&I Penetration Rate', 'Vehicle age and mileage (used vehicles)', 'Customer risk perception', 'Product competitiveness'],
        downstreamImpacts: ['Back-End Gross per Unit', 'Service department revenue', 'Customer retention', 'Product per Retail Unit', 'Customer satisfaction']
      }
    },
    de: {
      title: 'Garantieverlängerung-Durchdringung',
      definition: 'Prozentsatz der Verkäufe mit erweitertem Servicevertrag.',
      whyItMatters: 'Hohe Margen, Kundenbindung und zukünftige Serviceumsätze.',
      benchmark: '46-70%'
    }
  },
  gapInsurancePenetration: {
    en: {
      title: 'GAP Insurance Penetration',
      definition: 'The percentage of financed/leased vehicle sales that include GAP insurance coverage.',
      executiveSummary: 'GAP insurance is essential protection for customers with negative equity. Each GAP contract contributes $300-600 in profit. Industry benchmarks range from 35-50% on qualified deals. Critical for customer financial protection and dealership profitability.',
      whyItMatters: 'Protects customers against negative equity in total-loss scenarios while generating high-margin income for the dealership.',
      formula: 'GAP Insurance Penetration (%) = (Number of Sales with GAP Insurance / Total Financed/Leased Vehicle Sales) × 100',
      inclusions: ['All GAP insurance products sold on financed or leased vehicles'],
      exclusions: ['Cash purchases', 'Canceled GAP policies', 'Wholesale/fleet sales'],
      unitOfMeasure: 'Percentage (%)',
      benchmark: '35-50% of financed deals',
      department: 'new-vehicle-sales',
      rootCauseDiagnostics: {
        people: 'F&I managers not effectively communicating negative equity risk, weak fear-based selling, poor customer qualification',
        process: 'Presenting GAP too late after customer is "sold out," no systematic identification of high-LTV candidates',
        tools: 'Overpriced GAP products vs. alternatives, lack of visual tools demonstrating depreciation curves',
        structure: 'Presenting GAP as optional "add-on" vs. essential protection, inadequate training on total-loss scenarios',
        incentives: 'Low commission rates on GAP products, no accountability for penetration rates on qualified deals'
      },
      improvementLevers: [
        'Systematically identify high-LTV deals (loan-to-value >100%) requiring GAP',
        'Use depreciation charts and total-loss scenario illustrations',
        'Present GAP early in F&I process as "essential protection"',
        'Bundle GAP with warranties in protection packages',
        'Train on consultative questioning about negative equity risks',
        'Offer competitive GAP pricing through multiple sources',
        'Create penetration targets specifically for qualified deals (80%+ goal)',
        'Establish compliance standards ensuring GAP presentation on all financed deals >90% LTV'
      ],
      interdependencies: {
        upstreamDrivers: ['Finance Penetration %', 'Loan-to-value ratios', 'Down payment levels', 'Loan term lengths'],
        downstreamImpacts: ['Back-End Gross per Unit', 'Product per Retail Unit', 'Customer satisfaction', 'Dealership reputation', 'F&I compliance']
      }
    },
    de: {
      title: 'GAP-Versicherung Durchdringung',
      definition: 'Prozentsatz der finanzierten Verkäufe mit GAP-Versicherung.',
      whyItMatters: 'Schützt Kunden vor Unterdeckung bei Totalschaden und generiert hochmargigen Gewinn.',
      benchmark: '35-50% der finanzierten Deals'
    }
  },
  productPerRetailUnit: {
    en: {
      title: 'Product per Retail Unit (PVR)',
      definition: 'The average number of F&I products sold per retail vehicle delivered.',
      executiveSummary: 'PVR reveals selling depth beyond simple penetration rates. Industry benchmarks range from 1.3-1.8 products per deal, with top performers achieving 2-3 products. Two dealerships with identical back-end gross can have dramatically different PVR, indicating different income sustainability.',
      whyItMatters: 'Indicates consultative selling effectiveness and menu presentation quality. Higher PVR means more sustainable F&I profitability.',
      formula: 'Product per Retail Unit (PVR) = Total Number of F&I Products Sold / Total Retail Units Delivered',
      inclusions: ['All F&I products (service contracts, GAP, credit insurance, protection products, maintenance plans)'],
      exclusions: ['Accessories not sold through F&I', 'Financing itself', 'Canceled products', 'Fleet/wholesale'],
      unitOfMeasure: 'Ratio (e.g., 1.5 products per unit)',
      benchmark: '1.5-2.0',
      department: 'new-vehicle-sales',
      rootCauseDiagnostics: {
        people: 'F&I managers selling single products vs. consulting on comprehensive protection, weak needs assessment, poor bundling presentation',
        process: 'Linear product presentation vs. menu-based packages, insufficient presentation time, no systematic multiple product approach',
        tools: 'Limited product portfolio, poor menu presentation technology, products not strategically bundled',
        structure: 'Compensation rewarding single-product sales vs. packages, rushing F&I process to increase throughput',
        incentives: 'Flat per-deal compensation not rewarding additional products, no PVR accountability'
      },
      improvementLevers: [
        'Implement tiered menu selling with bundled protection packages',
        'Train F&I managers on consultative needs assessment for multiple products',
        'Create logical product pairings (warranty + GAP, maintenance + appearance)',
        'Present products as comprehensive solutions vs. individual items',
        'Use payment-based selling showing minimal impact of additional products',
        'Expand product portfolio with complementary offerings',
        'Establish PVR targets by deal type',
        'Monitor PVR by F&I manager and provide targeted coaching'
      ],
      interdependencies: {
        upstreamDrivers: ['F&I Penetration Rate', 'Finance Penetration %', 'F&I presentation time and quality', 'Product portfolio breadth', 'Customer trust'],
        downstreamImpacts: ['Back-End Gross per Unit', 'Total F&I profitability', 'Customer lifetime value', 'Service department revenue', 'F&I income sustainability']
      }
    },
    de: {
      title: 'Produkte pro Einzelhandelseinheit (PVR)',
      definition: 'Durchschnittliche Anzahl verkaufter F&I-Produkte pro ausgeliefertem Fahrzeug.',
      whyItMatters: 'Zeigt Beratungskompetenz und Menü-Präsentationsqualität. Höherer PVR bedeutet nachhaltigere F&I-Rentabilität.',
      benchmark: '1,5-2,0'
    }
  },
  orderBankCoverage: {
    en: {
      title: 'Order Bank Coverage (Months)',
      definition: 'The number of months of production capacity covered by current customer orders.',
      executiveSummary: 'Order Bank Coverage provides visibility into future revenue and enables accurate inventory planning. Insufficient coverage (<1 month) indicates sales challenges; excessive coverage (>3 months) creates customer satisfaction risks through extended wait times.',
      whyItMatters: 'Reveals brand health, market demand strength, and sales pipeline quality. Essential for revenue forecasting.',
      formula: 'Order Bank Coverage (Months) = Total Units in Order Bank / Average Monthly Sales Volume',
      inclusions: ['All confirmed customer orders awaiting production or allocation', 'Factory orders', 'Depot/compound orders'],
      exclusions: ['Dealer stock orders (not customer-committed)', 'Canceled orders', 'Completed orders awaiting delivery'],
      unitOfMeasure: 'Months',
      benchmark: '1-3 months',
      department: 'new-vehicle-sales',
      rootCauseDiagnostics: {
        people: 'Sales team unable to secure customer deposits on factory orders, weak order-selling skills',
        process: 'Complicated order process discouraging customers, high order cancellation rates',
        tools: 'Limited online order configurators, poor order tracking visibility for customers',
        structure: 'Insufficient production allocation, brand unpopularity, market preference for immediate inventory',
        incentives: 'Compensation favoring stock sales over factory orders, no incentives for building order banks'
      },
      improvementLevers: [
        'Train sales team on "order selling" techniques emphasizing customization benefits',
        'Implement customer-facing online order tracking systems',
        'Offer order incentives (priority delivery, exclusive features, deposit incentives)',
        'Develop order confirmation and nurturing communications',
        'Create allocation management strategies prioritizing high-demand configurations',
        'Deploy virtual product configurators',
        'Establish order bank targets by salesperson',
        'Minimize cancellations through better qualification and communication'
      ],
      interdependencies: {
        upstreamDrivers: ['Brand demand and market popularity', 'Production capacity and allocation', 'Order-to-Delivery Time', 'Sales team capability', 'Customer willingness to wait'],
        downstreamImpacts: ['Future revenue visibility', 'Allocation Fulfillment Rate', 'Cancellation Rate', 'Inventory planning', 'Customer satisfaction']
      }
    },
    de: {
      title: 'Auftragsbestandsdeckung (Monate)',
      definition: 'Anzahl der Monate an Produktionskapazität, die durch aktuelle Kundenbestellungen abgedeckt sind.',
      whyItMatters: 'Zeigt Markengesundheit, Marktnachfrage und Pipeline-Qualität. Wesentlich für Umsatzprognosen.',
      benchmark: '1-3 Monate'
    }
  },
  orderToDeliveryTime: {
    en: {
      title: 'Order-to-Delivery Time',
      definition: 'The average number of days from customer order placement to vehicle delivery.',
      executiveSummary: 'Customer willingness to wait decreases significantly beyond 30 days, with each additional week increasing cancellation probability. OTD time directly impacts order bank management and the viability of build-to-order models.',
      whyItMatters: 'Critical customer satisfaction and competitive advantage metric. Extended OTD creates competitive disadvantages and increases cancellation risk.',
      formula: 'Order-to-Delivery Time (Days) = Σ(Delivery Date − Order Placement Date) / Number of Delivered Orders',
      inclusions: ['Complete cycle from order placement through dealer delivery'],
      exclusions: ['Time customer spent deciding before ordering', 'Canceled orders', 'Dealer stock purchases'],
      unitOfMeasure: 'Days',
      benchmark: '<30 days',
      department: 'new-vehicle-sales',
      rootCauseDiagnostics: {
        people: 'Order entry errors causing delays, inadequate order status communication, poor delivery coordination',
        process: 'Lengthy order bank queuing, inefficient production scheduling, slow dealer preparation',
        tools: 'Manual order systems without integration, poor order tracking visibility, inadequate logistics',
        structure: 'Distant manufacturing locations, batched production scheduling, long component lead times',
        incentives: 'No incentives for reducing OTD time, manufacturing quotas prioritizing batch efficiency'
      },
      improvementLevers: [
        'Optimize order bank management reducing queuing time',
        'Improve order accuracy through training and digital configurators',
        'Implement production scheduling prioritization for customer orders',
        'Enhance transportation logistics with expedited shipping options',
        'Deploy customer-facing order tracking systems',
        'Reduce dealer preparation time through efficient PDI processes',
        'Create communication protocols providing regular status updates',
        'Benchmark against competitive brands offering faster delivery'
      ],
      interdependencies: {
        upstreamDrivers: ['Manufacturing scheduling efficiency', 'Order bank depth', 'Component supply chain', 'Transportation logistics', 'Order accuracy'],
        downstreamImpacts: ['Cancellation Rate', 'Customer satisfaction', 'Order Bank Coverage', 'Sales Cycle Length', 'Competitive positioning']
      }
    },
    de: {
      title: 'Bestell-zu-Lieferzeit',
      definition: 'Durchschnittliche Tage von der Kundenbestellung bis zur Fahrzeuglieferung.',
      whyItMatters: 'Kritische Kundenzufriedenheits-Kennzahl. Verlängerte Lieferzeiten erhöhen das Stornierungsrisiko.',
      benchmark: '<30 Tage'
    }
  },
  allocationFulfillment: {
    en: {
      title: 'Allocation Fulfillment Rate',
      definition: 'The percentage of manufacturer allocation successfully converted into customer sales.',
      executiveSummary: 'Manufacturers often reward high-fulfillment dealerships with increased allocations. 90%+ fulfillment during supply shortages indicates strong performance. This metric is critical for strategic inventory planning and manufacturer negotiations.',
      whyItMatters: 'Directly impacts manufacturer relationships, future allocation decisions, and revenue maximization.',
      formula: 'Allocation Fulfillment Rate (%) = (Units Sold from Allocation / Total Units Allocated) × 100',
      inclusions: ['All allocated units converted to retail or fleet sales within period'],
      exclusions: ['Dealer trade-outs', 'Turn-backs to manufacturer', 'Units still in transit'],
      unitOfMeasure: 'Percentage (%)',
      benchmark: '90%+',
      department: 'new-vehicle-sales',
      rootCauseDiagnostics: {
        people: 'Inadequate allocation planning skills, poor market demand assessment, failure to pre-sell allocated units',
        process: 'No systematic allocation management process, reactive vs. proactive allocation utilization, poor dealer trade network',
        tools: 'Limited visibility into incoming allocation, poor inventory management systems, inadequate market demand data',
        structure: 'Misalignment between allocation mix and market demand, geographic constraints, competing dealer network',
        incentives: 'No accountability for unfulfilled allocation, compensation not tied to allocation utilization'
      },
      improvementLevers: [
        'Implement proactive allocation management with pre-selling strategies',
        'Develop dealer trade network for unwanted allocation',
        'Analyze historical sales data to optimize allocation requests',
        'Create allocation fulfillment forecasts and action plans',
        'Build relationships with manufacturer allocation teams',
        'Deploy marketing campaigns specifically for allocated inventory',
        'Establish fulfillment targets with regular progress reviews'
      ],
      interdependencies: {
        upstreamDrivers: ['Market demand alignment', 'Order Bank Coverage', 'Dealer trade network', 'Pre-selling effectiveness', 'Manufacturer relationship quality'],
        downstreamImpacts: ['Future allocation decisions', 'Inventory management', 'Revenue and volume targets', 'Manufacturer standing', 'Days in Inventory']
      }
    },
    de: {
      title: 'Allokationserfüllungsrate',
      definition: 'Prozentsatz der Herstellerzuteilung, der in Kundenverkäufe umgewandelt wird.',
      whyItMatters: 'Beeinflusst direkt Herstellerbeziehungen und zukünftige Zuteilungsentscheidungen.',
      benchmark: '90%+'
    }
  },
  cancellationRate: {
    en: {
      title: 'Cancellation Rate',
      definition: 'The percentage of confirmed orders or sales agreements canceled before vehicle delivery.',
      executiveSummary: 'Recent industry data shows 20% of showroom leads defect within 30 days. Each cancellation represents wasted sales effort, lost allocation, and potential relationship damage. High rates undermine forecasting accuracy and waste allocated inventory.',
      whyItMatters: 'Reveals sales process quality, order-to-delivery effectiveness, and customer engagement strength.',
      formula: 'Cancellation Rate (%) = (Number of Orders Canceled / Total Orders Placed) × 100',
      inclusions: ['All customer orders or sale agreements canceled before delivery'],
      exclusions: ['Trade-outs where customer switches to different vehicle at same dealership', 'Orders without customer deposit'],
      unitOfMeasure: 'Percentage (%)',
      benchmark: '<10%',
      department: 'new-vehicle-sales',
      rootCauseDiagnostics: {
        people: 'Poor customer qualification, overpromising on delivery times, inadequate follow-up communication',
        process: 'Excessive order-to-delivery time allowing buyer\'s remorse, weak deposit requirements, inadequate status communication',
        tools: 'Poor order tracking creating customer anxiety, limited financing pre-qualification',
        structure: 'Economic pressures affecting customer affordability, competitive conquest activity',
        incentives: 'Sales team compensated at order vs. delivery, no penalties for high cancellation rates'
      },
      improvementLevers: [
        'Strengthen customer qualification including financial pre-qualification',
        'Require meaningful deposits ($500-1,000+) demonstrating commitment',
        'Implement proactive communication cadence (weekly updates)',
        'Reduce order-to-delivery time minimizing buyer\'s remorse window',
        'Create early warning system for at-risk orders',
        'Deploy customer-facing order tracking increasing transparency',
        'Conduct "order confirmation" calls 24-48 hours after order',
        'Train sales team on managing expectations realistically',
        'Offer incentives for order completion',
        'Analyze cancellation reasons systematically'
      ],
      interdependencies: {
        upstreamDrivers: ['Order-to-Delivery Time', 'Customer qualification rigor', 'Economic conditions', 'Competitive activity', 'Communication quality'],
        downstreamImpacts: ['Allocation Fulfillment Rate', 'Sales forecasting accuracy', 'Days in Inventory', 'Customer satisfaction', 'Sales team productivity']
      }
    },
    de: {
      title: 'Stornierungsrate',
      definition: 'Prozentsatz der bestätigten Aufträge, die vor Lieferung storniert werden.',
      whyItMatters: 'Zeigt Qualität des Verkaufsprozesses und Kundenengagement.',
      benchmark: '<10%'
    }
  },
  factoryIncentiveCapture: {
    en: {
      title: 'Factory Incentive Capture %',
      definition: 'The percentage of eligible manufacturer incentive programs successfully achieved by the dealership.',
      executiveSummary: 'Dealers can earn $100,000+ monthly from incentive programs, often representing the difference between profit and loss. Approximately 70% of dealerships achieve factory targets, meaning 30% miss substantial income. Missing targets marginally can be devastating.',
      whyItMatters: 'Increasingly critical as manufacturers shift from vehicle margin to performance bonuses. Reveals operational discipline and manufacturer alignment.',
      formula: 'Factory Incentive Capture (%) = (Number of Programs Achieved / Total Eligible Programs) × 100',
      inclusions: ['All manufacturer incentive programs (volume bonuses, CSI targets, certification, training, facility standards)'],
      exclusions: ['Customer incentives (rebates, subventions)', 'Dealer cash applied to individual vehicles'],
      unitOfMeasure: 'Percentage (%)',
      benchmark: '85%+',
      department: 'new-vehicle-sales',
      rootCauseDiagnostics: {
        people: 'Inadequate awareness of incentive programs, lack of focused effort on targets, insufficient cross-department coordination',
        process: 'No systematic incentive tracking, reactive management, failure to course-correct mid-period',
        tools: 'Poor visibility into real-time performance, inadequate reporting, complex program requirements',
        structure: 'Misalignment between dealership priorities and incentive metrics, conflicting departmental incentives, unrealistic targets',
        incentives: 'Management bonuses not tied to incentive capture, no accountability, excessive focus on front-end gross undermining volume targets'
      },
      improvementLevers: [
        'Implement real-time incentive tracking dashboards (daily/weekly)',
        'Create incentive attainment forecasts enabling proactive adjustments',
        'Assign dedicated personnel for incentive program management',
        'Conduct monthly incentive reviews analyzing capture probability',
        'Balance incentive pursuit with margin management',
        'Develop contingency strategies for near-miss situations',
        'Educate entire dealership on incentive importance',
        'Create internal incentive alignment (staff bonuses tied to factory achievement)'
      ],
      interdependencies: {
        upstreamDrivers: ['Sales volume and market share', 'Customer satisfaction scores', 'Facility and certification compliance', 'Staff training completion', 'Manufacturer relationship quality'],
        downstreamImpacts: ['Gross per New Vehicle (incentives add $500-2,000 per unit)', 'New vehicle department profitability', 'Dealership valuation', 'Strategic decision-making', 'Manufacturer relationship']
      }
    },
    de: {
      title: 'Herstelleranreiz-Erfassungsrate %',
      definition: 'Prozentsatz der erfolgreich erreichten Herstelleranreizprogramme.',
      whyItMatters: 'Zunehmend kritisch, da Hersteller von Fahrzeugmargen zu Leistungsboni übergehen.',
      benchmark: '85%+'
    }
  },

  // =====================================================
  // USED VEHICLE SALES KPIs
  // =====================================================
  usedCarInventoryTurn: {
    en: {
      title: 'Used Car Inventory Turn',
      definition: 'The number of times the used vehicle inventory is completely sold and replaced within a year.',
      executiveSummary: 'Higher turns mean faster velocity, reduced carrying costs, and improved capital efficiency. A dealership turning every 45 days vs. 90 days generates double the annual volume with the same capital. Each day a vehicle sits costs $40-50 in holding expenses.',
      whyItMatters: 'Fundamentally determines used vehicle department ROI. Reveals buying discipline, pricing effectiveness, and market alignment.',
      formula: 'Inventory Turn Ratio = Cost of Goods Sold (Annual) / Average Inventory Value',
      inclusions: ['All used vehicle inventory (retail, wholesale candidates)'],
      exclusions: ['New vehicle inventory', 'Service loaners', 'Demos (unless inventory)'],
      unitOfMeasure: 'Ratio (times per year)',
      benchmark: '8-12x per year',
      department: 'used-vehicle-sales',
      rootCauseDiagnostics: {
        people: 'Poor acquisition decisions, weak pricing discipline allowing inventory to age, inadequate sales follow-through',
        process: 'Slow reconditioning extending time-to-frontline, inadequate pricing strategies, weak market intelligence on demand',
        tools: 'Poor inventory management systems, inadequate market pricing data, limited remarketing technology',
        structure: 'Excessive inventory levels, poor inventory mix, inadequate wholesale channels',
        incentives: 'Acquisition incentives not tied to turn rates, no accountability for aged inventory, volume focus without turn consideration'
      },
      improvementLevers: [
        'Implement data-driven acquisition targeting high-demand vehicles',
        'Optimize pricing with dynamic repricing every 15 days based on days in inventory',
        'Reduce reconditioning cycle time to <7 days',
        'Deploy inventory management technology with turn rate alerts',
        'Create aged inventory action protocols (45/60/90-day triggers)',
        'Right-size inventory levels to sales velocity (target 45-60 day supply)',
        'Enhance digital marketing and merchandising',
        'Implement turn targets by vehicle category with accountability',
        'Use predictive analytics for slow-turn risk identification',
        'Develop efficient wholesale channels'
      ],
      interdependencies: {
        upstreamDrivers: ['Acquisition decision quality', 'Reconditioning Cycle Time', 'Pricing strategy effectiveness', 'Market demand alignment', 'Sales team effectiveness'],
        downstreamImpacts: ['Days in Inventory (inverse)', 'Aged Stock %', 'Capital efficiency', 'Floor plan interest costs', 'Gross profit per unit']
      }
    },
    de: {
      title: 'Gebrauchtwagenumschlag',
      definition: 'Anzahl der Male, die das GW-Inventar pro Jahr komplett verkauft und ersetzt wird.',
      whyItMatters: 'Bestimmt grundlegend die GW-Abteilungs-Rendite. Zeigt Einkaufsdisziplin und Marktausrichtung.',
      benchmark: '8-12x pro Jahr'
    }
  },
  daysInInventory: {
    en: {
      title: 'Days in Inventory',
      definition: 'The average number of days a used vehicle remains in inventory from acquisition to retail sale.',
      executiveSummary: 'Each day costs approximately $40-50 per vehicle in floor plan interest, depreciation, and carrying expenses. Best practices target 45-60 days. A 120-vehicle dealer with 30% aged inventory (90+ days) has over £100,000 in capital draining cash flow monthly.',
      whyItMatters: 'Reveals operational efficiency, market alignment, and capital productivity. Lower days means faster sales and less holding costs.',
      formula: 'Days in Inventory = 365 / Inventory Turn Ratio',
      inclusions: ['All days from acquisition/trade-in to retail sale date', 'Includes reconditioning time'],
      exclusions: ['Wholesale disposals (track separately)', 'Vehicles on dealer transfer'],
      unitOfMeasure: 'Days',
      benchmark: '45-60 days',
      department: 'used-vehicle-sales',
      rootCauseDiagnostics: {
        people: 'Overpricing vehicles based on emotion vs. market data, resistance to repricing aged units, poor acquisition decisions',
        process: 'Extended reconditioning cycles (10-12 days vs. 7-day target), reactive pricing, inadequate aged inventory protocols',
        tools: 'Poor market pricing visibility, inadequate inventory management alerts, limited digital merchandising',
        structure: 'Wrong inventory mix for market demographic, excessive inventory volume, inadequate wholesale infrastructure',
        incentives: 'No accountability for unit-level aging, acquisition bonuses not tied to turn performance'
      },
      improvementLevers: [
        'Implement automated repricing protocols at 15-day intervals',
        'Establish hard action triggers: 45 days (review), 60 days (aggressive repricing), 90 days (wholesale)',
        'Reduce reconditioning cycle time to <7 days',
        'Deploy real-time aged inventory dashboards with vehicle-level visibility',
        'Create weekly aged inventory review meetings with accountability',
        'Use predictive analytics identifying slow-movers at acquisition',
        'Enhance digital merchandising for aged units',
        'Implement staff incentives for aged inventory sales',
        'Make decisive wholesale decisions at 90+ days',
        'Benchmark competitor days-to-sale'
      ],
      interdependencies: {
        upstreamDrivers: ['Reconditioning Cycle Time', 'Acquisition quality', 'Pricing strategy', 'Market demand', 'Digital merchandising quality'],
        downstreamImpacts: ['Inventory Turn Ratio (inverse)', 'Carrying costs', 'Gross profit per unit', 'Capital efficiency', 'Wholesale losses']
      }
    },
    de: {
      title: 'Lagertage',
      definition: 'Durchschnittliche Tage von Ankauf bis Verkauf eines Gebrauchtfahrzeugs.',
      whyItMatters: 'Zeigt betriebliche Effizienz und Kapitalproduktivität. Jeder Tag kostet ~$40-50 pro Fahrzeug.',
      benchmark: '45-60 Tage'
    }
  },

  // =====================================================
  // LEGACY KPIs (preserved for backward compatibility)
  // =====================================================
  monthlyRevenue: {
    en: {
      title: 'Monthly Revenue',
      definition: 'Total revenue generated from new vehicle sales per month',
      whyItMatters: 'Primary indicator of business health and growth trajectory. Higher revenue enables investment in staff, facilities, and customer experience.',
      benchmark: '€420,000 monthly',
      department: 'new-vehicle-sales'
    },
    de: {
      title: 'Monatsumsatz',
      definition: 'Gesamtumsatz aus Neuwagenverkäufen pro Monat',
      whyItMatters: 'Primärer Indikator für Geschäftsgesundheit und Wachstumskurs.',
      benchmark: '€420.000 monatlich'
    }
  },
  avgMargin: {
    en: {
      title: 'Average Margin',
      definition: 'Average profit margin percentage per vehicle sale after all costs',
      whyItMatters: 'Directly impacts profitability. Higher margins mean more retained profit per sale.',
      benchmark: '9.2%',
      department: 'new-vehicle-sales'
    },
    de: {
      title: 'Durchschnittsmarge',
      definition: 'Durchschnittliche Gewinnmarge in Prozent pro Fahrzeugverkauf nach allen Kosten',
      whyItMatters: 'Beeinflusst direkt die Rentabilität.',
      benchmark: '9,2%'
    }
  },
  customerSatisfaction: {
    en: {
      title: 'Customer Satisfaction',
      definition: 'Average customer rating from post-purchase surveys (typically 1-100 scale)',
      whyItMatters: 'Drives repeat business, referrals, and online reviews. Satisfied customers are 3x more likely to recommend your dealership.',
      benchmark: '84%',
      department: 'new-vehicle-sales'
    },
    de: {
      title: 'Kundenzufriedenheit',
      definition: 'Durchschnittliche Kundenbewertung aus Nachkauf-Umfragen',
      whyItMatters: 'Fördert Folgegeschäft, Empfehlungen und Online-Bewertungen.',
      benchmark: '84%'
    }
  },
  usedInventoryTurnover: {
    en: {
      title: 'Used Inventory Turnover',
      definition: 'Number of times used vehicle inventory is sold and replaced per year',
      whyItMatters: 'Faster turnover means less capital tied up in inventory and reduced depreciation risk.',
      benchmark: '12x per year',
      department: 'used-vehicle-sales'
    },
    de: {
      title: 'Gebrauchtwagenumschlag',
      definition: 'Anzahl der Male, die das GW-Bestand pro Jahr verkauft und ersetzt wird',
      whyItMatters: 'Schnellerer Umschlag bedeutet weniger gebundenes Kapital.',
      benchmark: '12x pro Jahr'
    }
  },
  laborEfficiency: {
    en: {
      title: 'Labor Efficiency Rate',
      definition: 'Percentage of billable hours vs total available technician hours',
      whyItMatters: 'Higher efficiency means more revenue from the same labor capacity. Target is 85%+.',
      benchmark: '85%',
      department: 'service-performance'
    },
    de: {
      title: 'Arbeitseffizienzrate',
      definition: 'Prozentsatz der abrechenbaren Stunden vs. verfügbare Technikerstunden',
      whyItMatters: 'Höhere Effizienz bedeutet mehr Umsatz aus derselben Arbeitskapazität.',
      benchmark: '85%'
    }
  },
  serviceRetention: {
    en: {
      title: 'Service Retention Rate',
      definition: 'Percentage of customers returning for service within 12 months',
      whyItMatters: 'Retained customers have 6x lower acquisition cost and higher lifetime value.',
      benchmark: '65%',
      department: 'service-performance'
    },
    de: {
      title: 'Servicebindungsrate',
      definition: 'Prozentsatz der Kunden, die innerhalb von 12 Monaten zum Service zurückkehren',
      whyItMatters: 'Bindungskunden haben 6x niedrigere Akquisitionskosten.',
      benchmark: '65%'
    }
  },
  technicianProductivity: {
    en: {
      title: 'Technician Productivity',
      definition: 'Average repair orders completed per technician per day',
      whyItMatters: 'Measures workflow efficiency and technician utilization. Higher productivity increases service capacity.',
      benchmark: '12 per day',
      department: 'service-performance'
    },
    de: {
      title: 'Technikerproduktivität',
      definition: 'Durchschnittliche Reparaturaufträge pro Techniker pro Tag',
      whyItMatters: 'Misst Workflow-Effizienz und Technikerauslastung.',
      benchmark: '12 pro Tag'
    }
  },
  partsGrossProfit: {
    en: {
      title: 'Parts Gross Profit',
      definition: 'Profit margin on parts sales after cost of goods sold',
      whyItMatters: 'Parts is often the highest-margin department. Optimizing pricing improves overall profitability.',
      benchmark: '35%',
      department: 'parts-inventory'
    },
    de: {
      title: 'Teile-Bruttogewinn',
      definition: 'Gewinnmarge bei Teileverkäufen nach Warenkosten',
      whyItMatters: 'Teile ist oft die Abteilung mit der höchsten Marge.',
      benchmark: '35%'
    }
  },
  fillRate: {
    en: {
      title: 'Parts Fill Rate',
      definition: 'Percentage of parts orders fulfilled from existing inventory',
      whyItMatters: 'Higher fill rates mean faster service completion and happier customers.',
      benchmark: '95%',
      department: 'parts-inventory'
    },
    de: {
      title: 'Teile-Erfüllungsrate',
      definition: 'Prozentsatz der Teilebestellungen aus vorhandenem Bestand',
      whyItMatters: 'Höhere Erfüllungsraten bedeuten schnellere Serviceabwicklung.',
      benchmark: '95%'
    }
  },
  cashFlowDays: {
    en: {
      title: 'Cash Flow Days',
      definition: 'Average days between transaction and cash receipt',
      whyItMatters: 'Faster cash collection improves liquidity and reduces financing costs.',
      benchmark: '7 days',
      department: 'financial-operations'
    },
    de: {
      title: 'Cashflow-Tage',
      definition: 'Durchschnittliche Tage zwischen Transaktion und Bargeldeingang',
      whyItMatters: 'Schnellere Bargeldsammlung verbessert Liquidität.',
      benchmark: '7 Tage'
    }
  },
  expenseRatio: {
    en: {
      title: 'Expense Ratio',
      definition: 'Operating expenses as a percentage of gross profit',
      whyItMatters: 'Lower ratios mean more profit retained. Industry benchmark is under 75%.',
      benchmark: '75%',
      department: 'financial-operations'
    },
    de: {
      title: 'Kostenquote',
      definition: 'Betriebskosten als Prozentsatz des Bruttogewinns',
      whyItMatters: 'Niedrigere Quoten bedeuten mehr einbehaltenen Gewinn.',
      benchmark: '75%'
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

/**
 * Get enriched KPIs (those with root cause diagnostics from the deep dive document)
 */
export function getEnrichedKPIs(language: 'en' | 'de' = 'en'): Record<string, KPIDefinition> {
  const result: Record<string, KPIDefinition> = {};
  for (const [key, value] of Object.entries(KPI_DEFINITIONS)) {
    const def = value[language] || value.en;
    if (def.rootCauseDiagnostics) {
      result[key] = def;
    }
  }
  return result;
}

/**
 * Get KPI definitions by department
 */
export function getKPIsByDepartment(department: string, language: 'en' | 'de' = 'en'): Record<string, KPIDefinition> {
  const result: Record<string, KPIDefinition> = {};
  for (const [key, value] of Object.entries(KPI_DEFINITIONS)) {
    const def = value.en; // Check department on English definition
    if (def.department === department) {
      result[key] = value[language] || value.en;
    }
  }
  return result;
}
