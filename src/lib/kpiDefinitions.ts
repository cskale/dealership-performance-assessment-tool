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
  // =====================================================
  // USED VEHICLE SALES KPIs (26-37)
  // =====================================================
  agedStockPercentage: {
    en: {
      title: 'Aged Stock % (>90 Days)',
      definition: 'The percentage of used vehicle inventory that has been in stock for more than 90 days without being sold.',
      executiveSummary: 'Aged stock is one of the most destructive forces in used vehicle profitability. Vehicles depreciate daily, and units over 90 days typically sell at a loss. Best-practice dealerships maintain aged stock below 10% through disciplined pricing, proactive remarketing, and strict stocking standards.',
      whyItMatters: 'Aged inventory ties up capital, depreciates daily, and signals pricing or merchandising failures. Reducing aged stock directly improves gross profit and inventory ROI.',
      formula: 'Aged Stock % = (Units in Stock >90 Days / Total Used Vehicle Inventory) × 100',
      inclusions: ['All retail-ready used vehicles', 'Vehicles in reconditioning if past 90 days from acquisition'],
      exclusions: ['Wholesale units awaiting auction', 'Customer-ordered vehicles', 'Demonstrator vehicles'],
      unitOfMeasure: 'Percentage (%)',
      benchmark: '<10%',
      department: 'used-vehicle-sales',
      rootCauseDiagnostics: {
        people: 'Managers emotionally attached to units, reluctance to take losses, poor appraisal discipline leading to overpriced acquisitions',
        process: 'No systematic aging policy, inconsistent price reduction cadence, weak merchandising rotation, no 60-day warning triggers',
        tools: 'No real-time market pricing tools (e.g., vAuto, AutoTrader insights), poor inventory management dashboards',
        structure: 'No dedicated used vehicle merchandising role, inventory decisions centralized with one person creating bottlenecks',
        incentives: 'No penalties for aged stock, compensation not tied to inventory turn, volume bonuses without profitability guardrails'
      },
      improvementLevers: [
        'Implement strict 60-day pricing policy with automatic reductions at 30/45/60 days',
        'Use market-based pricing tools to price competitively from day one',
        'Create "aging meeting" every week reviewing all units >45 days',
        'Set maximum days-in-stock limits by vehicle segment and price band',
        'Improve reconditioning speed to get vehicles frontline-ready faster',
        'Develop wholesale exit strategy for units unlikely to retail profitably',
        'Tie used car manager compensation to inventory turn, not just gross'
      ],
      interdependencies: {
        upstreamDrivers: ['Appraisal Accuracy Rate', 'Reconditioning Cycle Time', 'Trade-In Capture Rate', 'Stocking criteria discipline'],
        downstreamImpacts: ['Gross per Used Vehicle', 'Used Inventory Turnover', 'Floor plan interest cost', 'Total dealership profitability']
      }
    },
    de: {
      title: 'Überalterter Bestand % (>90 Tage)',
      definition: 'Prozentsatz des Gebrauchtwagenbestands, der seit mehr als 90 Tagen nicht verkauft wurde.',
      whyItMatters: 'Überalterter Bestand bindet Kapital, verliert täglich an Wert und signalisiert Preis- oder Vermarktungsfehler.',
      benchmark: '<10%'
    }
  },
  stockToSalesRatio: {
    en: {
      title: 'Stock-to-Sales Ratio',
      definition: 'The ratio of total used vehicle inventory units to the number of used vehicles sold per month.',
      executiveSummary: 'Stock-to-Sales Ratio is the fundamental balance metric for used vehicle operations. Too high means capital is tied up in slow-moving inventory; too low means missed sales opportunities. The ideal ratio of 2:1 to 3:1 ensures sufficient selection without excessive carrying costs.',
      whyItMatters: 'Balances inventory investment against sales velocity. Optimal ratio ensures customer selection while minimizing depreciation and floor plan costs.',
      formula: 'Stock-to-Sales Ratio = Total Used Vehicle Inventory / Average Monthly Used Vehicle Sales',
      inclusions: ['All retail-ready used vehicles on lot and in transit'],
      exclusions: ['Wholesale-only units', 'Vehicles in reconditioning not yet frontline'],
      unitOfMeasure: 'Ratio (x:1)',
      benchmark: '2:1 to 3:1',
      department: 'used-vehicle-sales',
      rootCauseDiagnostics: {
        people: 'Over-acquisition bias from trade-in acceptance, emotional attachment to high-value units, lack of inventory management discipline',
        process: 'No stocking guide or acquisition criteria, reactive purchasing instead of strategic sourcing, no turn-based ordering',
        tools: 'Limited market demand data, no predictive analytics for optimal inventory mix, poor reporting on aging by segment',
        structure: 'Purchasing decisions not aligned with sales capacity, no feedback loop between sales floor and buying center',
        incentives: 'Buyers rewarded for volume acquired rather than profitability of acquisitions, no accountability for unsold units'
      },
      improvementLevers: [
        'Establish stocking guide based on market demand data and historical sales patterns',
        'Set acquisition limits tied to current sales pace and aging inventory levels',
        'Review stock-to-sales ratio weekly with corrective action for deviations',
        'Implement segment-level analysis (SUVs, sedans, trucks) for targeted stocking',
        'Create systematic wholesale process for units exceeding optimal levels',
        'Align purchasing incentives with turn rate and profitability metrics'
      ],
      interdependencies: {
        upstreamDrivers: ['Trade-In Capture Rate', 'Auction purchasing strategy', 'Wholesale disposal speed', 'Market demand patterns'],
        downstreamImpacts: ['Aged Stock %', 'Used Inventory Turnover', 'Floor plan interest expense', 'Gross per Used Vehicle']
      }
    },
    de: {
      title: 'Bestands-Verkaufs-Verhältnis',
      definition: 'Verhältnis des gesamten Gebrauchtwagenbestands zur Anzahl der monatlich verkauften Gebrauchtwagen.',
      whyItMatters: 'Balanciert Bestandsinvestition gegen Verkaufsgeschwindigkeit.',
      benchmark: '2:1 bis 3:1'
    }
  },
  reconditioningCycleTime: {
    en: {
      title: 'Reconditioning Cycle Time',
      definition: 'The average number of days from vehicle acquisition to frontline-ready status, including all inspection, repair, detailing, and photography steps.',
      executiveSummary: 'Every day a vehicle spends in reconditioning is a day it cannot be sold. Best-practice dealerships complete reconditioning in 3-5 days. Reducing cycle time by even 2 days across 100 units/month can save €15,000+ in depreciation and floor plan costs annually.',
      whyItMatters: 'Directly impacts days-in-stock, depreciation exposure, and sales opportunity window. Faster reconditioning means faster revenue.',
      formula: 'Recon Cycle Time = Σ(Frontline Date − Acquisition Date) / Number of Vehicles Reconditioned',
      inclusions: ['All steps: inspection, mechanical repair, body work, detail, photos, online listing'],
      exclusions: ['Customer-ordered vehicles', 'Wholesale units not reconditioned'],
      unitOfMeasure: 'Days',
      benchmark: '3-5 days',
      department: 'used-vehicle-sales',
      rootCauseDiagnostics: {
        people: 'Insufficient recon staff, lack of urgency, poor communication between departments (service, detail, photo)',
        process: 'No standardized workflow, sequential instead of parallel processing, bottlenecks at parts ordering or body shop',
        tools: 'No recon tracking software, manual handoffs between departments, no visibility into current stage',
        structure: 'Recon competing with customer pay work for service bay time, no dedicated recon facility',
        incentives: 'No time-based targets for recon completion, service department prioritizes higher-margin customer pay work'
      },
      improvementLevers: [
        'Implement recon tracking software with stage-based timers and alerts',
        'Create dedicated recon bays or facility separate from customer service',
        'Establish maximum 72-hour target with escalation at 48 hours',
        'Run parallel processes (parts ordering during inspection, photos during final detail)',
        'Pre-approve recon budgets by vehicle value tier to eliminate approval delays',
        'Create recon team with dedicated technicians separate from service advisors',
        'Track and display daily recon throughput dashboard in service area'
      ],
      interdependencies: {
        upstreamDrivers: ['Parts availability and ordering speed', 'Service bay capacity', 'Appraisal accuracy (pre-purchase inspection)', 'Staffing levels'],
        downstreamImpacts: ['Days in Stock', 'Aged Stock %', 'Gross per Used Vehicle', 'Used Inventory Turnover', 'Online merchandising speed']
      }
    },
    de: {
      title: 'Aufbereitungsdauer',
      definition: 'Durchschnittliche Tage von Fahrzeugakquisition bis zur Verkaufsbereitschaft.',
      whyItMatters: 'Jeder Tag in der Aufbereitung ist ein Tag ohne Verkaufsmöglichkeit.',
      benchmark: '3-5 Tage'
    }
  },
  grossPerUsedVehicle: {
    en: {
      title: 'Gross per Used Vehicle',
      definition: 'The average front-end gross profit per used vehicle retailed, including vehicle margin and any dealer-added accessories.',
      executiveSummary: 'Gross per Used Vehicle is the core profitability metric for used operations. It reflects the combined effectiveness of acquisition pricing, reconditioning cost control, market-based retail pricing, and sales negotiation. Industry benchmarks range from €1,500-€2,500 for mainstream brands.',
      whyItMatters: 'Directly determines used department profitability and overall dealership financial health. Higher gross requires discipline across the entire used vehicle lifecycle.',
      formula: 'Gross per Used Vehicle = (Selling Price − Cost of Vehicle − Reconditioning Cost − Pack) / Number of Used Vehicles Retailed',
      inclusions: ['Vehicle selling price', 'All reconditioning costs', 'Dealer pack charges', 'Any dealer-added accessories/value-adds'],
      exclusions: ['F&I income (tracked separately)', 'Trade-in profits on next transaction', 'Wholesale transactions'],
      unitOfMeasure: 'Currency (€)',
      benchmark: '€1,500-€2,500',
      department: 'used-vehicle-sales',
      rootCauseDiagnostics: {
        people: 'Over-appraising trade-ins to win deals, weak negotiation skills, inability to sell value over price',
        process: 'No consistent appraisal methodology, excessive reconditioning spend, pricing not aligned to market data',
        tools: 'No market comparison tools, limited visibility into true cost-to-market, inadequate deal desking tools',
        structure: 'Appraisal and pricing decisions separated from P&L accountability, no feedback loop on acquisition outcomes',
        incentives: 'Volume-based compensation without gross profit floor, discounting authority too broadly distributed'
      },
      improvementLevers: [
        'Implement market-based appraisal and pricing using real-time market data',
        'Set reconditioning cost limits by vehicle value tier',
        'Train sales team on value-based selling vs. price negotiation',
        'Create tiered discounting authority requiring manager approval beyond thresholds',
        'Track gross per unit by source (trade-in, auction, private purchase) to optimize acquisition channels',
        'Review "loser reports" weekly to identify patterns in negative-gross deals',
        'Implement minimum gross policy with escalation process for exceptions'
      ],
      interdependencies: {
        upstreamDrivers: ['Appraisal Accuracy Rate', 'Reconditioning Cost per Unit', 'Price to Market Ratio', 'Inventory age'],
        downstreamImpacts: ['Used department total gross', 'Total dealership net profit', 'Sales staff compensation', 'Inventory investment ROI']
      }
    },
    de: {
      title: 'Bruttogewinn pro Gebrauchtwagen',
      definition: 'Durchschnittlicher Front-End-Bruttogewinn pro verkauftem Gebrauchtwagen.',
      whyItMatters: 'Bestimmt direkt die Rentabilität der Gebrauchtwagensparte.',
      benchmark: '€1.500-€2.500'
    }
  },
  priceToMarketRatio: {
    en: {
      title: 'Price to Market Ratio',
      definition: 'The ratio of a dealership\'s asking price to the average market price for comparable vehicles.',
      executiveSummary: 'Price to Market Ratio reveals competitive positioning. A ratio of 95-100% means pricing at or near market, while >105% signals overpricing that leads to aging. Best-practice dealers price at 97-100% of market and adjust systematically based on days in stock.',
      whyItMatters: 'Determines how competitively vehicles are priced relative to market alternatives. Directly impacts days-in-stock and probability of sale.',
      formula: 'Price to Market = (Dealer Asking Price / Average Market Price for Comparable Vehicles) × 100',
      inclusions: ['All retail-listed used vehicles', 'Comparable vehicles within same market area, year, make, model, mileage band'],
      exclusions: ['Specialty/collector vehicles', 'Wholesale units', 'Vehicles not yet listed'],
      unitOfMeasure: 'Percentage (%)',
      benchmark: '97-100%',
      department: 'used-vehicle-sales',
      rootCauseDiagnostics: {
        people: 'Managers overvaluing their own inventory, emotional pricing, reluctance to reduce price on units they acquired',
        process: 'No systematic pricing review cadence, no market data consultation during pricing, inconsistent pricing methodology',
        tools: 'No access to real-time market pricing tools, manual competitive analysis, outdated comparable data',
        structure: 'Pricing authority concentrated with individuals who also make acquisition decisions (conflict of interest)',
        incentives: 'No accountability for overpriced units, gross-based compensation discouraging competitive pricing'
      },
      improvementLevers: [
        'Subscribe to market pricing tools (vAuto, DealerSocket) for real-time competitive data',
        'Implement automatic price adjustment schedule based on days in stock',
        'Separate acquisition and pricing decisions to eliminate bias',
        'Review price-to-market daily for all frontline units',
        'Set competitive pricing targets by vehicle segment and price band',
        'Train managers on data-driven pricing vs. gut-feel pricing'
      ],
      interdependencies: {
        upstreamDrivers: ['Market supply and demand dynamics', 'Vehicle condition and reconditioning quality', 'Online merchandising quality', 'Competitive landscape'],
        downstreamImpacts: ['Days in Stock', 'Aged Stock %', 'Gross per Used Vehicle', 'Online lead generation', 'Inventory turn']
      }
    },
    de: {
      title: 'Preis-zu-Markt-Verhältnis',
      definition: 'Verhältnis des Händler-Angebotspreises zum durchschnittlichen Marktpreis vergleichbarer Fahrzeuge.',
      whyItMatters: 'Bestimmt die Wettbewerbsfähigkeit der Preisgestaltung und beeinflusst direkt die Standtage.',
      benchmark: '97-100%'
    }
  },
  appraisalAccuracyRate: {
    en: {
      title: 'Appraisal Accuracy Rate',
      definition: 'The percentage of trade-in appraisals where the actual reconditioning cost and final selling price fall within the originally projected range.',
      executiveSummary: 'Appraisal accuracy is the foundation of used vehicle profitability. Inaccurate appraisals lead to either overpaying for trades (eroding gross) or undervaluing (losing trades to competitors). Top dealers achieve 85%+ accuracy by combining market data with systematic inspection protocols.',
      whyItMatters: 'Directly impacts acquisition cost accuracy, gross profit predictability, and trade-in capture rate.',
      formula: 'Appraisal Accuracy = (Appraisals Within ±10% of Actual Outcome / Total Appraisals) × 100',
      inclusions: ['All trade-in appraisals completed', 'Both accepted and declined appraisals for accuracy tracking'],
      exclusions: ['Wholesale-only appraisals', 'Sight-unseen digital appraisals (track separately)'],
      unitOfMeasure: 'Percentage (%)',
      benchmark: '85%+',
      department: 'used-vehicle-sales',
      rootCauseDiagnostics: {
        people: 'Insufficient inspection training, emotional bias in appraisals, inconsistency between appraisers',
        process: 'No standardized inspection checklist, missing reconditioning cost estimation step, no post-sale accuracy review',
        tools: 'No mobile inspection apps, limited market data access during appraisal, no photo documentation requirement',
        structure: 'Appraisals done by salespeople rather than trained appraisers, no separation of duties between appraisal and deal negotiation',
        incentives: 'Salespeople incentivized to over-appraise to close deals, no accountability for appraisal accuracy outcomes'
      },
      improvementLevers: [
        'Implement standardized multi-point inspection checklist for all trade-ins',
        'Use market data tools to validate appraisal values in real-time',
        'Create dedicated appraiser role or certification program',
        'Track accuracy by appraiser with monthly scorecard reviews',
        'Require photo documentation of all trade-in condition issues',
        'Establish reconditioning cost estimation templates by vehicle category',
        'Conduct monthly "look-back" analysis comparing appraisal vs actual outcome'
      ],
      interdependencies: {
        upstreamDrivers: ['Appraiser training and experience', 'Market data tool access', 'Inspection process rigor', 'Reconditioning cost knowledge'],
        downstreamImpacts: ['Gross per Used Vehicle', 'Trade-In Capture Rate', 'Reconditioning Cost per Unit', 'Customer satisfaction with trade-in experience']
      }
    },
    de: {
      title: 'Bewertungsgenauigkeit',
      definition: 'Prozentsatz der Inzahlungnahme-Bewertungen, bei denen die tatsächlichen Kosten und der Verkaufspreis im projizierten Bereich liegen.',
      whyItMatters: 'Beeinflusst direkt die Akquisitionskosten-Genauigkeit und Bruttogewinn-Vorhersagbarkeit.',
      benchmark: '85%+'
    }
  },
  tradeInCaptureRate: {
    en: {
      title: 'Trade-In Capture Rate',
      definition: 'The percentage of new and used vehicle sales transactions where the dealership also acquires the customer\'s trade-in vehicle.',
      executiveSummary: 'Trade-ins are the lowest-cost acquisition source for used inventory. Capturing more trades reduces auction dependency, improves used vehicle gross margins, and creates a competitive advantage. Best-practice dealers capture 50-60% of eligible trades.',
      whyItMatters: 'Trade-ins cost less to acquire than auction purchases and carry higher gross potential. Higher capture rate reduces sourcing costs and increases used vehicle supply.',
      formula: 'Trade-In Capture Rate = (Number of Trade-Ins Acquired / Number of Vehicle Sales to Customers with Trade-In Eligible Vehicles) × 100',
      inclusions: ['All customer transactions where a trade-in was offered or discussed'],
      exclusions: ['Cash purchases with no trade discussion', 'Fleet transactions', 'Lease returns'],
      unitOfMeasure: 'Percentage (%)',
      benchmark: '50-60%',
      department: 'used-vehicle-sales',
      rootCauseDiagnostics: {
        people: 'Sales staff uncomfortable discussing trade values, poor objection handling on trade offers, desking focused on new deal structure only',
        process: 'Trade appraisal done too late in process, no systematic trade discussion in every deal, weak competitive save process',
        tools: 'No instant trade valuation tools for customers, poor trade-in marketing on website, no digital appraisal option',
        structure: 'Used car department not involved in new car trade discussions, no collaboration between departments on trade acquisition',
        incentives: 'No bonus for trade capture, salespeople indifferent to whether customer trades or sells privately'
      },
      improvementLevers: [
        'Make trade discussion mandatory in every sales interaction, regardless of customer intent',
        'Offer online trade-in valuation tool to engage customers before showroom visit',
        'Train sales team on trade-in value communication and objection handling',
        'Implement "save the trade" process with escalation to used car manager',
        'Create competitive trade-in offers using market data to justify values',
        'Track trade capture rate by salesperson and provide coaching',
        'Collaborate between new and used departments on trade acquisition strategy'
      ],
      interdependencies: {
        upstreamDrivers: ['Appraisal Accuracy Rate', 'Customer trust and relationship', 'Competitive trade-in offers', 'Online trade tools availability'],
        downstreamImpacts: ['Used vehicle acquisition cost', 'Stock-to-Sales Ratio', 'Gross per Used Vehicle', 'Auction dependency and transport costs']
      }
    },
    de: {
      title: 'Inzahlungnahme-Quote',
      definition: 'Prozentsatz der Fahrzeugtransaktionen, bei denen das Autohaus auch das Kundenfahrzeug in Zahlung nimmt.',
      whyItMatters: 'Inzahlungnahmen sind die kostengünstigste Akquisitionsquelle für Gebrauchtwagenbestand.',
      benchmark: '50-60%'
    }
  },
  auctionProfitability: {
    en: {
      title: 'Auction Profitability %',
      definition: 'The percentage of vehicles purchased at auction that are subsequently retailed at a profit after all costs (purchase price, auction fees, transport, reconditioning).',
      executiveSummary: 'Auction purchasing is a necessary but risky acquisition channel. Best-practice dealers achieve 75-85% profitability on auction buys through disciplined bidding limits, accurate condition assessment, and fast reconditioning.',
      whyItMatters: 'Measures the effectiveness of auction buying strategy and discipline. Unprofitable auction purchases directly erode used department margins.',
      formula: 'Auction Profitability = (Profitable Auction Purchases / Total Auction Purchases) × 100',
      inclusions: ['All vehicles purchased at physical and online auctions', 'All associated costs (fees, transport, recon)'],
      exclusions: ['Direct dealer-to-dealer purchases', 'Trade-in acquisitions', 'Program/lease return acquisitions'],
      unitOfMeasure: 'Percentage (%)',
      benchmark: '75-85%',
      department: 'used-vehicle-sales',
      rootCauseDiagnostics: {
        people: 'Auction buyers exceeding bid limits, poor vehicle condition assessment, emotional bidding behavior',
        process: 'No pre-set maximum bid calculations, insufficient market analysis before auction, no post-purchase profitability tracking',
        tools: 'No real-time market data at auction, limited access to vehicle history reports during bidding, poor mobile tools',
        structure: 'Buyer compensation based on volume purchased rather than profitability, no oversight of bidding decisions',
        incentives: 'Buyer bonuses tied to units acquired, not to retail profitability of those units'
      },
      improvementLevers: [
        'Set maximum bid limits based on market retail price minus target gross and estimated recon',
        'Require vehicle history report review before every bid',
        'Track profitability by auction source to identify best-performing channels',
        'Implement post-purchase review of all auction buys vs. actual outcomes',
        'Tie buyer compensation to profitability of acquired units, not volume',
        'Create approved vehicle profile (year, make, model, mileage) to guide purchasing decisions'
      ],
      interdependencies: {
        upstreamDrivers: ['Auction market conditions', 'Buyer skill and discipline', 'Market pricing data accuracy', 'Reconditioning cost estimation'],
        downstreamImpacts: ['Gross per Used Vehicle', 'Aged Stock %', 'Total used department profitability', 'Inventory investment ROI']
      }
    },
    de: {
      title: 'Auktionsrentabilität %',
      definition: 'Prozentsatz der bei Auktionen gekauften Fahrzeuge, die anschließend mit Gewinn verkauft werden.',
      whyItMatters: 'Misst die Effektivität der Auktionseinkaufsstrategie.',
      benchmark: '75-85%'
    }
  },
  unitsPerUsedCarManager: {
    en: {
      title: 'Units Sold per Used Car Manager',
      definition: 'The average number of used vehicles retailed per month per used car sales manager or team leader.',
      executiveSummary: 'This productivity metric measures management effectiveness in the used vehicle department. Best-practice managers oversee 40-60 units per month through effective team leadership, inventory management, and deal desking.',
      whyItMatters: 'Measures management leverage and team effectiveness. Higher ratios indicate efficient leadership and well-structured teams.',
      formula: 'Units per Manager = Total Used Vehicles Retailed per Month / Number of Used Car Managers',
      inclusions: ['All retail used vehicle sales', 'Both internet and floor sales'],
      exclusions: ['Wholesale dispositions', 'Internal transfers between locations'],
      unitOfMeasure: 'Units/Month',
      benchmark: '40-60 units/month',
      department: 'used-vehicle-sales',
      rootCauseDiagnostics: {
        people: 'Manager spending too much time on non-sales activities, poor delegation, insufficient coaching of sales staff',
        process: 'Manager involved in every decision (bottleneck), no structured daily management routine, excessive administrative burden',
        tools: 'Poor deal desking tools, inadequate CRM workflow, manual reporting taking management time',
        structure: 'Too many direct reports per manager, unclear role boundaries between sales manager and used car manager',
        incentives: 'Manager compensation not aligned with team productivity, no accountability for team development'
      },
      improvementLevers: [
        'Implement structured daily management routine (morning meeting, desk time, coaching)',
        'Delegate administrative tasks to support staff or BDC',
        'Set clear team productivity targets with weekly reviews',
        'Provide deal desking tools that reduce time per transaction',
        'Create tiered decision authority so managers focus on high-value decisions',
        'Track units per manager monthly with peer benchmarking'
      ],
      interdependencies: {
        upstreamDrivers: ['Sales team size and skill level', 'Lead volume', 'Inventory quality and selection', 'Process efficiency'],
        downstreamImpacts: ['Total used vehicle volume', 'Gross per used vehicle', 'Used department total gross', 'Staff morale and retention']
      }
    },
    de: {
      title: 'Einheiten pro GW-Manager',
      definition: 'Durchschnittliche Anzahl monatlich verkaufter Gebrauchtwagen pro GW-Verkaufsleiter.',
      whyItMatters: 'Misst die Managementeffizienz und Teameffektivität.',
      benchmark: '40-60 Einheiten/Monat'
    }
  },
  reconditioningCostPerUnit: {
    en: {
      title: 'Reconditioning Cost per Unit',
      definition: 'The average total cost to recondition a used vehicle from acquisition condition to retail-ready status.',
      executiveSummary: 'Reconditioning cost directly reduces gross profit per unit. Best-practice dealers maintain average recon costs of €800-€1,200 through disciplined inspection, competitive parts sourcing, and standardized repair protocols. Cost overruns often stem from poor appraisal accuracy.',
      whyItMatters: 'Directly subtracts from gross profit. Controlling reconditioning costs without sacrificing quality is essential for used vehicle profitability.',
      formula: 'Recon Cost per Unit = Total Reconditioning Costs / Number of Vehicles Reconditioned',
      inclusions: ['All mechanical repairs, body work, paint, tires, detail, photography costs'],
      exclusions: ['Goodwill or warranty repairs', 'Dealer-added accessories beyond standard reconditioning'],
      unitOfMeasure: 'Currency (€)',
      benchmark: '€800-€1,200',
      department: 'used-vehicle-sales',
      rootCauseDiagnostics: {
        people: 'Technicians over-repairing vehicles, lack of cost awareness, no standardized repair-vs-replace guidelines',
        process: 'No pre-approval recon budget, scope creep during reconditioning, no cost tracking by category (mechanical, body, detail)',
        tools: 'No reconditioning cost tracking software, manual cost estimation, poor visibility into cost-per-unit trends',
        structure: 'Service department treating recon as profit center (marking up parts/labor) rather than cost center',
        incentives: 'Service advisors incentivized to maximize recon RO revenue, no penalty for exceeding recon budgets'
      },
      improvementLevers: [
        'Set maximum reconditioning budget by vehicle value tier (e.g., max 10% of retail price)',
        'Implement pre-approval process for repairs exceeding standard budget',
        'Negotiate internal labor and parts rates for reconditioning work',
        'Track reconditioning cost by category to identify cost drivers',
        'Create standardized reconditioning checklists by vehicle type',
        'Source competitive aftermarket parts where quality is equivalent',
        'Review high-cost recon units weekly to identify preventable overruns'
      ],
      interdependencies: {
        upstreamDrivers: ['Appraisal Accuracy Rate', 'Vehicle acquisition quality', 'Parts pricing and availability', 'Technician efficiency'],
        downstreamImpacts: ['Gross per Used Vehicle', 'Price to Market Ratio competitiveness', 'Used department profitability', 'Reconditioning Cycle Time']
      }
    },
    de: {
      title: 'Aufbereitungskosten pro Einheit',
      definition: 'Durchschnittliche Gesamtkosten für die Aufbereitung eines Gebrauchtwagens bis zur Verkaufsbereitschaft.',
      whyItMatters: 'Reduziert direkt den Bruttogewinn pro Einheit.',
      benchmark: '€800-€1.200'
    }
  },
  digitalLeadToSaleConversion: {
    en: {
      title: 'Digital Lead to Sale Conversion (Used)',
      definition: 'The percentage of digital leads specifically for used vehicles that convert to a completed sale.',
      executiveSummary: 'With 80%+ of used vehicle buyers starting online, digital lead conversion is critical. Best-practice dealers convert 8-12% of used vehicle digital leads through rapid response, transparent pricing, and seamless online-to-showroom transitions.',
      whyItMatters: 'Measures the effectiveness of digital sales processes for used vehicles. Higher conversion reduces customer acquisition cost and maximizes digital marketing investment.',
      formula: 'Digital Lead Conversion = (Used Vehicle Sales from Digital Leads / Total Digital Leads for Used Vehicles) × 100',
      inclusions: ['All digital lead sources (website, third-party, social media)', 'Used vehicle-specific inquiries'],
      exclusions: ['Walk-in traffic', 'Phone calls not originated from digital source', 'Service inquiries'],
      unitOfMeasure: 'Percentage (%)',
      benchmark: '8-12%',
      department: 'used-vehicle-sales',
      rootCauseDiagnostics: {
        people: 'BDC not trained on used vehicle specifics, poor follow-up on used vehicle inquiries, inability to handle price objections digitally',
        process: 'Slow response to used vehicle leads, no video walkaround process, poor online-to-showroom handoff',
        tools: 'Inadequate online inventory merchandising, no video capabilities, limited digital retailing tools for used vehicles',
        structure: 'No dedicated used vehicle internet team, used leads mixed with new vehicle leads without specialization',
        incentives: 'BDC compensation not differentiated for used vs. new leads, no bonus for digital conversion improvement'
      },
      improvementLevers: [
        'Respond to used vehicle leads within 5 minutes with personalized vehicle information',
        'Create video walkaround for every used vehicle listing',
        'Implement transparent "market-based" pricing online to build trust',
        'Develop dedicated used vehicle BDC specialist role',
        'Enable digital retailing (online deposit, credit application, trade-in valuation)',
        'Track conversion by lead source to optimize digital marketing spend',
        'Create multi-touch follow-up sequence tailored to used vehicle buyers'
      ],
      interdependencies: {
        upstreamDrivers: ['Website merchandising quality', 'Lead Response Time', 'Online pricing transparency', 'Digital marketing effectiveness'],
        downstreamImpacts: ['Used vehicle volume', 'Customer acquisition cost', 'Gross per Used Vehicle', 'Marketing ROI']
      }
    },
    de: {
      title: 'Digitale Lead-Konversion (GW)',
      definition: 'Prozentsatz der digitalen Gebrauchtwagen-Leads, die zu einem Verkauf führen.',
      whyItMatters: 'Misst die Effektivität digitaler Verkaufsprozesse für Gebrauchtwagen.',
      benchmark: '8-12%'
    }
  },
  wholesaleLeakage: {
    en: {
      title: 'Wholesale Leakage %',
      definition: 'The percentage of acquired used vehicles that are wholesaled rather than retailed, representing lost retail gross profit opportunity.',
      executiveSummary: 'Every wholesale disposition represents a vehicle that was acquired but could not be profitably retailed. Best-practice dealers keep wholesale leakage below 15% through disciplined acquisition, effective reconditioning, and competitive pricing.',
      whyItMatters: 'Wholesale transactions typically lose €500-€1,500 per unit vs. potential retail profit. Reducing leakage directly improves used department gross.',
      formula: 'Wholesale Leakage = (Number of Vehicles Wholesaled / Total Vehicles Acquired) × 100',
      inclusions: ['All vehicles sold at wholesale (auction, dealer-to-dealer, wholesalers)'],
      exclusions: ['Vehicles intentionally acquired for wholesale (if tracked separately)', 'Manufacturer buybacks'],
      unitOfMeasure: 'Percentage (%)',
      benchmark: '<15%',
      department: 'used-vehicle-sales',
      rootCauseDiagnostics: {
        people: 'Poor appraisal decisions leading to bad acquisitions, reluctance to invest in reconditioning fixable vehicles',
        process: 'No analysis of why vehicles are wholesaled, no feedback loop to acquisition process, late-stage reconditioning surprises',
        tools: 'Insufficient vehicle inspection tools during acquisition, no predictive analytics for retail viability',
        structure: 'Wholesale decision made by used car manager without cross-functional input, no escalation process before wholesale',
        incentives: 'No penalty for excessive wholesale rates, volume-based acquisition bonuses encouraging poor purchases'
      },
      improvementLevers: [
        'Implement "wholesale review" requiring approval before any unit is wholesaled',
        'Analyze wholesale patterns monthly to identify preventable causes',
        'Improve pre-acquisition inspection to avoid acquiring units unlikely to retail',
        'Create retail save process: repricing, additional marketing, or cross-location transfer before wholesale',
        'Track wholesale leakage rate by acquisition source to identify problem channels',
        'Tie acquisition team compensation to retail success rate, not just purchase volume'
      ],
      interdependencies: {
        upstreamDrivers: ['Appraisal Accuracy Rate', 'Reconditioning Cost per Unit', 'Market demand alignment', 'Stocking criteria discipline'],
        downstreamImpacts: ['Gross per Used Vehicle (department average)', 'Total used department profitability', 'Inventory investment efficiency', 'Auction expense ratio']
      }
    },
    de: {
      title: 'Großhandels-Verlust %',
      definition: 'Prozentsatz der akquirierten Gebrauchtwagen, die im Großhandel statt im Einzelhandel verkauft werden.',
      whyItMatters: 'Großhandelstransaktionen verlieren typischerweise €500-€1.500 pro Einheit vs. potenziellem Einzelhandelsgewinn.',
      benchmark: '<15%'
    }
  },

  // =====================================================
  // SERVICE / AFTERSALES KPIs (38-51)
  // =====================================================
  technicianProductivityPct: {
    en: {
      title: 'Technician Productivity %',
      definition: 'The ratio of hours a technician spends on productive work (billable jobs) versus total hours available (clocked in).',
      executiveSummary: 'Technician productivity is the single most impactful metric for service department profitability. A 5% improvement in productivity across 10 technicians can generate €100,000+ in additional annual revenue. Industry benchmarks: 90-110% for productive shops.',
      whyItMatters: 'Directly determines service department revenue capacity. Higher productivity means more jobs completed per day, more revenue per technician, and better customer throughput.',
      formula: 'Technician Productivity % = (Total Hours Produced / Total Hours Available) × 100',
      inclusions: ['All hours clocked on repair orders (customer pay, warranty, internal)', 'Flat-rate and actual time basis'],
      exclusions: ['Training hours', 'Unpaid breaks', 'Non-productive waiting time (track separately)'],
      unitOfMeasure: 'Percentage (%)',
      benchmark: '90-110%',
      department: 'service-performance',
      rootCauseDiagnostics: {
        people: 'Low technician skill levels, poor work habits, excessive personal time, lack of motivation',
        process: 'Inefficient work distribution, excessive wait time for parts or authorization, poor dispatching, inadequate bay setup',
        tools: 'Outdated diagnostic equipment, insufficient specialty tools, poor workshop layout reducing efficiency',
        structure: 'Too many technicians for available work, poor mix of work types (all complex, no quick jobs), inadequate bay allocation',
        incentives: 'Flat salary with no productivity bonus, no visibility into individual performance, lack of skill-based pay progression'
      },
      improvementLevers: [
        'Implement real-time productivity tracking visible to technicians and managers',
        'Optimize work dispatch to match technician skill levels with job complexity',
        'Reduce parts wait time through better inventory management and pre-ordering',
        'Create productivity-based pay structure (flat-rate or bonus system)',
        'Improve bay organization and tool accessibility (5S methodology)',
        'Schedule mix of quick service and complex jobs to maintain flow',
        'Provide regular skill development training to increase capability on higher-value work'
      ],
      interdependencies: {
        upstreamDrivers: ['Work mix and volume', 'Parts Fill Rate', 'Dispatching efficiency', 'Technician skill level', 'Equipment condition'],
        downstreamImpacts: ['Revenue per Technician', 'Labor Utilization Rate', 'Customer wait times', 'Service capacity and throughput']
      }
    },
    de: {
      title: 'Technikerproduktivität %',
      definition: 'Verhältnis der produktiven Arbeitsstunden eines Technikers zur Gesamtverfügbarkeit.',
      whyItMatters: 'Bestimmt direkt die Umsatzkapazität der Serviceabteilung.',
      benchmark: '90-110%'
    }
  },
  technicianEfficiencyPct: {
    en: {
      title: 'Technician Efficiency %',
      definition: 'The ratio of standard (flat-rate) hours earned to actual hours worked on those jobs. Measures how quickly technicians complete work relative to published time standards.',
      executiveSummary: 'Efficiency above 100% means technicians are completing jobs faster than standard time — a sign of skill mastery and good processes. Top shops achieve 105-120% efficiency, generating additional revenue from the same labor hours.',
      whyItMatters: 'Higher efficiency means more billable hours produced in the same clock time, directly increasing revenue per technician without additional labor cost.',
      formula: 'Technician Efficiency % = (Standard Hours Earned / Actual Hours Worked on Jobs) × 100',
      inclusions: ['All repair orders with flat-rate time standards', 'Customer pay, warranty, and internal work'],
      exclusions: ['Come-back/rework jobs (track separately)', 'Jobs without published time standards'],
      unitOfMeasure: 'Percentage (%)',
      benchmark: '105-120%',
      department: 'service-performance',
      rootCauseDiagnostics: {
        people: 'Insufficient training on specific repair procedures, low skill levels on newer vehicle technology, poor time management habits',
        process: 'Excessive diagnostic time due to inadequate information, frequent interruptions, poor pre-staging of parts and tools',
        tools: 'Outdated or insufficient diagnostic equipment, slow scan tools, lack of manufacturer-specific specialty tools',
        structure: 'Technicians working on unfamiliar vehicle types, no specialization matching, excessive administrative requirements',
        incentives: 'No efficiency bonus, flat hourly pay regardless of output, no recognition for high-efficiency performers'
      },
      improvementLevers: [
        'Implement skill-based work assignment matching technician expertise to job type',
        'Pre-stage parts and tools for scheduled appointments to reduce setup time',
        'Invest in latest diagnostic equipment and training',
        'Create efficiency-based bonus structure rewarding above-standard performance',
        'Reduce administrative burden on technicians (digital inspection, voice-to-text)',
        'Track efficiency by technician and job type to identify training opportunities'
      ],
      interdependencies: {
        upstreamDrivers: ['Technician training and skill level', 'Tool and equipment quality', 'Parts availability', 'Job complexity mix'],
        downstreamImpacts: ['Revenue per Technician', 'Technician Productivity %', 'Labor sales per RO', 'Service department gross profit']
      }
    },
    de: {
      title: 'Technikereffizienz %',
      definition: 'Verhältnis der Standardstunden (Flat-Rate) zu den tatsächlich aufgewendeten Stunden.',
      whyItMatters: 'Höhere Effizienz bedeutet mehr abrechenbare Stunden bei gleicher Arbeitszeit.',
      benchmark: '105-120%'
    }
  },
  laborUtilizationRate: {
    en: {
      title: 'Labor Utilization Rate',
      definition: 'The percentage of total available technician hours that are sold to customers (billed), reflecting how much of the labor capacity is being monetized.',
      executiveSummary: 'Labor utilization combines productivity and efficiency into a revenue-generation measure. Best-practice shops achieve 85-95% utilization, meaning nearly all available labor hours are converted to revenue.',
      whyItMatters: 'Measures overall labor revenue generation effectiveness. Low utilization means paying for technician time that generates no revenue.',
      formula: 'Labor Utilization Rate = (Total Hours Sold to Customers / Total Available Technician Hours) × 100',
      inclusions: ['All billed hours (customer pay, warranty, internal at internal rate)'],
      exclusions: ['Unpaid training time', 'Non-productive time', 'Comebacks/rework hours'],
      unitOfMeasure: 'Percentage (%)',
      benchmark: '85-95%',
      department: 'service-performance',
      rootCauseDiagnostics: {
        people: 'Underperforming technicians dragging down average, uneven workload distribution, absenteeism',
        process: 'Insufficient appointment scheduling, poor work-in-progress management, service advisor not selling full job scope',
        tools: 'No real-time utilization tracking, poor scheduling software, lack of capacity planning tools',
        structure: 'Overstaffed relative to demand, no flexible staffing model, poor shift design',
        incentives: 'No team-level utilization targets, individual focus without collective accountability'
      },
      improvementLevers: [
        'Implement capacity-based appointment scheduling matching available tech hours to booked work',
        'Train service advisors on comprehensive vehicle inspection and recommendation selling',
        'Create real-time utilization dashboard visible to service manager',
        'Right-size technician staff to match demand patterns (seasonal adjustment)',
        'Develop "next day preparation" process ensuring work is queued for every technician',
        'Implement flexible scheduling with staggered start times to cover demand peaks'
      ],
      interdependencies: {
        upstreamDrivers: ['Appointment volume and scheduling', 'Technician Productivity %', 'Technician Efficiency %', 'Service advisor upselling'],
        downstreamImpacts: ['Service department revenue', 'Revenue per Technician', 'Fixed absorption ratio', 'Service department profitability']
      }
    },
    de: {
      title: 'Arbeitsauslastungsrate',
      definition: 'Prozentsatz der verfügbaren Technikerstunden, die an Kunden verkauft werden.',
      whyItMatters: 'Misst die gesamte Effektivität der Arbeitsumsatzgenerierung.',
      benchmark: '85-95%'
    }
  },
  laborSalesPerRO: {
    en: {
      title: 'Labor Sales per RO',
      definition: 'The average labor revenue generated per repair order, indicating the depth of service performed on each visit.',
      executiveSummary: 'Higher labor sales per RO indicate effective service advisor upselling, thorough vehicle inspection, and comprehensive service recommendations. Best-practice dealers achieve €250-€400 labor per RO through systematic multi-point inspection and menu presentation.',
      whyItMatters: 'Maximizes revenue from each customer visit without requiring additional traffic. Reflects service advisor effectiveness and inspection thoroughness.',
      formula: 'Labor Sales per RO = Total Labor Revenue / Total Number of Repair Orders',
      inclusions: ['All labor charges on customer pay, warranty, and internal repair orders'],
      exclusions: ['Parts revenue (tracked separately)', 'Sublet charges', 'Quick lube/express service if tracked separately'],
      unitOfMeasure: 'Currency (€)',
      benchmark: '€250-€400',
      department: 'service-performance',
      rootCauseDiagnostics: {
        people: 'Service advisors not performing thorough inspections, fear of "overselling," poor presentation skills',
        process: 'No standardized multi-point inspection, no menu presentation, inconsistent service recommendations',
        tools: 'No digital inspection tools (tablet-based with photos/video), no automated service recommendation engine',
        structure: 'Service advisors handling too many customers, insufficient time for thorough consultation',
        incentives: 'Flat compensation for advisors, no bonus for labor sales improvement, no tracking of inspection completion'
      },
      improvementLevers: [
        'Implement mandatory multi-point digital inspection on every visit',
        'Train service advisors on consultative service selling with photo/video evidence',
        'Create service menu packages (Good/Better/Best) for common visits',
        'Set labor-per-RO targets with daily tracking and coaching',
        'Use tablet-based inspection tools that generate customer-facing reports with photos',
        'Implement declined service follow-up process for work customers initially refuse'
      ],
      interdependencies: {
        upstreamDrivers: ['Service advisor training and skill', 'Multi-point inspection completion rate', 'Customer trust and relationship', 'Vehicle age and condition'],
        downstreamImpacts: ['Service department revenue', 'Customer retention (perception of value)', 'Parts sales per RO', 'Gross profit per RO']
      }
    },
    de: {
      title: 'Arbeitsumsatz pro Auftrag',
      definition: 'Durchschnittlicher Arbeitsumsatz pro Reparaturauftrag.',
      whyItMatters: 'Maximiert den Umsatz pro Kundenbesuch.',
      benchmark: '€250-€400'
    }
  },
  revenuePerTechnician: {
    en: {
      title: 'Revenue per Technician',
      definition: 'Total service department revenue (labor + parts) generated per technician per month.',
      executiveSummary: 'Revenue per technician is the ultimate productivity measure combining labor efficiency, parts attachment, and work volume. Best-practice shops generate €15,000-€25,000 per technician per month.',
      whyItMatters: 'Comprehensive measure of individual and team revenue generation. Directly impacts service department profitability and technician compensation potential.',
      formula: 'Revenue per Technician = Total Service Revenue (Labor + Parts) / Number of Active Technicians',
      inclusions: ['All labor and parts revenue from customer pay, warranty, and internal work'],
      exclusions: ['Sublet revenue', 'Body shop revenue (if separate department)', 'Towing/recovery revenue'],
      unitOfMeasure: 'Currency (€/month)',
      benchmark: '€15,000-€25,000/month',
      department: 'service-performance',
      rootCauseDiagnostics: {
        people: 'Low skill levels limiting job types, poor efficiency, technician absenteeism reducing available hours',
        process: 'Insufficient work volume per technician, poor parts attachment rate, inefficient dispatching',
        tools: 'Outdated equipment slowing down work, insufficient specialty tools, poor diagnostic capabilities',
        structure: 'Overstaffed relative to demand, poor work mix (too much low-revenue work), inadequate bay allocation',
        incentives: 'No revenue-per-tech targets, compensation not tied to revenue generation, no team-level goals'
      },
      improvementLevers: [
        'Optimize technician staffing to match demand (right-size team)',
        'Improve parts-to-labor ratio through better inspection and recommendation processes',
        'Invest in training to enable technicians to handle higher-complexity, higher-revenue work',
        'Implement effective dispatching to minimize downtime between jobs',
        'Set monthly revenue-per-tech targets with visible tracking',
        'Create career path linking revenue generation to pay progression'
      ],
      interdependencies: {
        upstreamDrivers: ['Technician Productivity %', 'Technician Efficiency %', 'Labor Sales per RO', 'Work volume and mix', 'Parts attachment rate'],
        downstreamImpacts: ['Service department total revenue', 'Fixed absorption ratio', 'Technician compensation satisfaction', 'Service department profitability']
      }
    },
    de: {
      title: 'Umsatz pro Techniker',
      definition: 'Gesamter Serviceabteilungsumsatz pro Techniker pro Monat.',
      whyItMatters: 'Umfassendes Maß für individuelle und Team-Umsatzgenerierung.',
      benchmark: '€15.000-€25.000/Monat'
    }
  },
  firstTimeFixRate: {
    en: {
      title: 'First-Time Fix Rate',
      definition: 'The percentage of repair orders that are completed correctly on the first visit without the customer needing to return for the same issue.',
      executiveSummary: 'First-Time Fix Rate is a critical quality and customer satisfaction metric. Each comeback costs €200-€500 in rework, lost bay time, and customer goodwill. Best-practice shops achieve 95%+ first-time fix rates through thorough diagnosis, proper repair procedures, and quality checks.',
      whyItMatters: 'Comebacks are the most expensive service failure — they consume bay time, erode customer trust, and generate no revenue. Improving first-time fix directly improves profitability and CSI.',
      formula: 'First-Time Fix Rate = (ROs Completed Without Comeback / Total ROs Completed) × 100',
      inclusions: ['All repair orders across customer pay, warranty, and internal work'],
      exclusions: ['Scheduled multi-visit repairs', 'Parts-on-order returns (pre-planned)', 'Customer-requested follow-up for different issues'],
      unitOfMeasure: 'Percentage (%)',
      benchmark: '95%+',
      department: 'service-performance',
      rootCauseDiagnostics: {
        people: 'Insufficient diagnostic skills, rushing through repairs, poor attention to detail, technician skill gaps on newer technology',
        process: 'Inadequate diagnostic procedures, no root cause analysis protocol, missing quality control check before delivery',
        tools: 'Outdated or missing diagnostic equipment, insufficient access to technical service bulletins, poor repair information systems',
        structure: 'Technicians working on unfamiliar vehicle types, no specialization, excessive workload pressure sacrificing quality',
        incentives: 'Flat-rate pay incentivizing speed over quality, no penalty for comebacks, no quality bonus'
      },
      improvementLevers: [
        'Implement mandatory quality control inspection before vehicle release',
        'Create comeback tracking and root cause analysis process',
        'Match technicians to repairs matching their skill certification level',
        'Invest in latest diagnostic tools and repair information subscriptions',
        'Add quality bonus to technician compensation (reduce pay for comebacks)',
        'Conduct weekly comeback review meetings to identify systemic issues',
        'Implement road test protocol for drivability complaints before release'
      ],
      interdependencies: {
        upstreamDrivers: ['Technician training and skill level', 'Diagnostic equipment quality', 'Parts quality', 'Work pressure and time constraints'],
        downstreamImpacts: ['Comeback Rate', 'CSI – Service', 'Service Retention Rate', 'Service department profitability', 'Net Promoter Score']
      }
    },
    de: {
      title: 'Erstbehebungsquote',
      definition: 'Prozentsatz der Reparaturaufträge, die beim ersten Besuch korrekt abgeschlossen werden.',
      whyItMatters: 'Nacharbeiten sind der teuerste Servicefehler — sie verbrauchen Kapazität und erodieren Kundenvertrauen.',
      benchmark: '95%+'
    }
  },
  comebackRate: {
    en: {
      title: 'Comeback Rate',
      definition: 'The percentage of repair orders where the customer returns within 30 days for the same or related repair issue.',
      executiveSummary: 'Comeback Rate is the inverse quality metric of First-Time Fix. Each comeback costs the dealership €200-€500 in direct rework costs plus immeasurable customer trust damage. Best-practice target is below 2%.',
      whyItMatters: 'Direct measure of repair quality failures. High comeback rates indicate systemic quality issues requiring immediate intervention.',
      formula: 'Comeback Rate = (Number of Comeback ROs within 30 Days / Total ROs Completed) × 100',
      inclusions: ['All returns for same or related symptoms within 30 days of original repair'],
      exclusions: ['Scheduled follow-up visits', 'Unrelated new issues', 'Customer-requested rechecks with no actual problem found'],
      unitOfMeasure: 'Percentage (%)',
      benchmark: '<2%',
      department: 'service-performance',
      rootCauseDiagnostics: {
        people: 'Technician skill deficiencies, rushing to meet productivity targets, poor diagnostic discipline',
        process: 'No quality control check before vehicle release, inadequate repair verification, poor communication of repair scope',
        tools: 'Insufficient diagnostic tools, outdated repair information, lack of manufacturer technical training access',
        structure: 'Excessive workload preventing thorough repairs, no dedicated quality inspector role',
        incentives: 'Productivity-focused pay penalizing thoroughness, no financial consequence for comebacks'
      },
      improvementLevers: [
        'Implement mandatory road test and quality check before every vehicle release',
        'Track comebacks by technician to identify training needs',
        'Create financial accountability: deduct comeback repair time from technician productivity',
        'Conduct root cause analysis on every comeback and share learnings',
        'Establish technician mentoring program pairing junior techs with masters',
        'Invest in ongoing OEM technical training and certification'
      ],
      interdependencies: {
        upstreamDrivers: ['First-Time Fix Rate', 'Technician training', 'Diagnostic tool quality', 'Quality control processes'],
        downstreamImpacts: ['CSI – Service', 'Service Retention Rate', 'Net Promoter Score', 'Service department profitability', 'Online review scores']
      }
    },
    de: {
      title: 'Nacharbeitsquote',
      definition: 'Prozentsatz der Reparaturaufträge, bei denen der Kunde innerhalb von 30 Tagen für dasselbe Problem zurückkehrt.',
      whyItMatters: 'Direktes Maß für Reparaturqualitätsfehler.',
      benchmark: '<2%'
    }
  },
  csiService: {
    en: {
      title: 'CSI – Service',
      definition: 'Customer Satisfaction Index score specifically for the service department, typically measured through post-visit surveys on a scale of 1-100 or 1-10.',
      executiveSummary: 'Service CSI is the primary customer experience metric tracked by OEMs and directly impacts dealer incentive payments, franchise standing, and customer retention. Top-performing dealers achieve 90+ scores through consistent process execution and proactive communication.',
      whyItMatters: 'Directly linked to OEM incentive payments, customer retention, and repeat purchase probability. Low CSI can trigger OEM franchise actions.',
      formula: 'CSI – Service = Average of Post-Service Survey Scores across all surveyed customers',
      inclusions: ['All OEM-administered service surveys', 'Internal post-visit surveys'],
      exclusions: ['Body shop-only visits', 'Quick lube visits not triggering OEM surveys', 'Warranty-only visits with no customer contact'],
      unitOfMeasure: 'Score (1-100)',
      benchmark: '90+',
      department: 'service-performance',
      rootCauseDiagnostics: {
        people: 'Poor service advisor communication, lack of empathy, failure to set expectations, technician/advisor disconnect',
        process: 'No proactive status updates, unclear pickup time estimates, surprise charges, slow vehicle return process',
        tools: 'No automated status notification system, poor digital communication (text/email updates), no online scheduling',
        structure: 'Service advisors overloaded with too many customers, insufficient staff during peak times, poor waiting area',
        incentives: 'No CSI component in advisor compensation, volume focus over customer experience, no recognition for top CSI performers'
      },
      improvementLevers: [
        'Implement proactive customer communication at key touchpoints (received, diagnosed, in-progress, ready)',
        'Train service advisors on empathetic communication and expectation setting',
        'Create automated status update system via text/email',
        'Address top 3 complaint drivers identified through survey analysis',
        'Set CSI targets with compensation tied to performance',
        'Implement post-visit follow-up call within 24 hours',
        'Create comfortable waiting area with Wi-Fi, refreshments, and workspace'
      ],
      interdependencies: {
        upstreamDrivers: ['First-Time Fix Rate', 'Communication quality', 'Wait time management', 'Price transparency', 'Facility experience'],
        downstreamImpacts: ['Service Retention Rate', 'Net Promoter Score', 'OEM incentive payments', 'Online reviews', 'Repeat purchase probability']
      }
    },
    de: {
      title: 'CSI – Service',
      definition: 'Kundenzufriedenheitsindex speziell für die Serviceabteilung.',
      whyItMatters: 'Direkt verknüpft mit OEM-Incentive-Zahlungen und Kundenbindung.',
      benchmark: '90+'
    }
  },
  npsService: {
    en: {
      title: 'Net Promoter Score (Service)',
      definition: 'The likelihood of a service customer to recommend the dealership to friends and family, measured on a 0-10 scale and calculated as % Promoters (9-10) minus % Detractors (0-6).',
      executiveSummary: 'NPS is the gold standard for measuring customer loyalty and advocacy. A positive NPS (>0) means more promoters than detractors. Best-practice dealerships achieve NPS of 60-80 through consistently exceeding expectations.',
      whyItMatters: 'Predicts future customer behavior better than satisfaction scores. Promoters generate referrals and repeat business; detractors damage reputation through negative word-of-mouth.',
      formula: 'NPS = % Promoters (9-10 score) − % Detractors (0-6 score)',
      inclusions: ['All service customers surveyed post-visit'],
      exclusions: ['Internal/employee surveys', 'Non-respondents (track response rate separately)'],
      unitOfMeasure: 'Score (-100 to +100)',
      benchmark: '60-80',
      department: 'service-performance',
      rootCauseDiagnostics: {
        people: 'Inconsistent customer experience across advisors, lack of personalization, failure to create memorable positive experiences',
        process: 'No structured service experience design, inconsistent delivery standards, no recovery process for dissatisfied customers',
        tools: 'No customer preference tracking, limited CRM integration for personalized service, no feedback loop for detractor recovery',
        structure: 'No dedicated customer experience role, no service recovery authority at advisor level',
        incentives: 'No NPS-linked compensation, no program recognizing promoter-generating staff, no accountability for detractor creation'
      },
      improvementLevers: [
        'Implement detractor recovery program: immediate follow-up on any score below 7',
        'Create "wow moments" in the service experience (personal touches, exceeding expectations)',
        'Track NPS by service advisor to identify best practices and coaching needs',
        'Establish NPS targets with team and individual accountability',
        'Design referral program leveraging promoters for new customer acquisition',
        'Analyze detractor feedback themes and systematically address top issues'
      ],
      interdependencies: {
        upstreamDrivers: ['CSI – Service', 'First-Time Fix Rate', 'Overall customer experience quality', 'Value perception'],
        downstreamImpacts: ['Referral volume', 'Online review generation', 'Service Retention Rate', 'Repeat Purchase Rate', 'Revenue growth through advocacy']
      }
    },
    de: {
      title: 'Net Promoter Score (Service)',
      definition: 'Wahrscheinlichkeit, dass ein Servicekunde das Autohaus weiterempfiehlt.',
      whyItMatters: 'Prognostiziert zukünftiges Kundenverhalten besser als Zufriedenheitswerte.',
      benchmark: '60-80'
    }
  },
  appointmentLeadTime: {
    en: {
      title: 'Appointment Lead Time',
      definition: 'The average number of days between when a customer requests a service appointment and the earliest available slot.',
      executiveSummary: 'Long appointment lead times signal capacity constraints and drive customers to competitors. Best-practice dealers maintain 1-3 day lead times through effective capacity management, express service lanes, and flexible scheduling.',
      whyItMatters: 'Excessive wait times for appointments cause customer defection to independent shops. Impacts customer satisfaction and service retention.',
      formula: 'Appointment Lead Time = Σ(Appointment Date − Request Date) / Number of Appointments Booked',
      inclusions: ['All customer-initiated appointment requests', 'Both phone and online bookings'],
      exclusions: ['Customer-requested future dates', 'Recall-specific appointments with parts-on-order delays'],
      unitOfMeasure: 'Days',
      benchmark: '1-3 days',
      department: 'service-performance',
      rootCauseDiagnostics: {
        people: 'Scheduler not offering alternative times, advisors blocking capacity for preferred customers, poor capacity awareness',
        process: 'No express service lane, inefficient scheduling grid, over-promising on appointment duration blocking follow-up slots',
        tools: 'Manual scheduling without capacity optimization, no online booking option, no waitlist management',
        structure: 'Insufficient service bay capacity, technician shortage, no staggered shift scheduling to extend hours',
        incentives: 'No targets for appointment availability, schedulers not measured on customer access metrics'
      },
      improvementLevers: [
        'Implement online scheduling with real-time capacity visibility',
        'Create express service lane for routine maintenance (no appointment needed)',
        'Optimize scheduling grid to maximize daily capacity utilization',
        'Extend service hours (early bird drop-off, Saturday, evening hours)',
        'Track and manage appointment lead time weekly with corrective actions',
        'Implement waitlist and cancellation fill process'
      ],
      interdependencies: {
        upstreamDrivers: ['Service bay capacity', 'Technician staffing levels', 'Scheduling efficiency', 'Express service availability'],
        downstreamImpacts: ['Service Retention Rate', 'CSI – Service', 'Revenue per Customer', 'Customer defection to independent shops']
      }
    },
    de: {
      title: 'Terminvorlaufzeit',
      definition: 'Durchschnittliche Tage zwischen Terminanfrage und frühestem verfügbarem Slot.',
      whyItMatters: 'Lange Wartezeiten treiben Kunden zu Wettbewerbern.',
      benchmark: '1-3 Tage'
    }
  },
  serviceRetentionRateEnriched: {
    en: {
      title: 'Service Retention Rate',
      definition: 'The percentage of customers who return to the dealership for service within a defined period (typically 12 months) after their previous service visit or vehicle purchase.',
      executiveSummary: 'Service retention is the foundation of aftersales profitability. Retained customers have 6x lower acquisition cost, higher labor per RO, and greater parts attachment. Each 1% improvement in retention can add €20,000-€50,000 in annual service revenue for a mid-size dealership.',
      whyItMatters: 'Retained customers are the most profitable segment. They spend more per visit, accept more recommendations, and generate referrals.',
      formula: 'Service Retention Rate = (Customers with Service Visit in Last 12 Months / Total Customers in Database Who Should Have Serviced) × 100',
      inclusions: ['All customers who purchased vehicles or had service within the defined period'],
      exclusions: ['Vehicles sold/traded away', 'Customers who moved out of service area', 'Fleet vehicles serviced elsewhere by contract'],
      unitOfMeasure: 'Percentage (%)',
      benchmark: '60-75%',
      department: 'service-performance',
      rootCauseDiagnostics: {
        people: 'No proactive outreach to overdue customers, poor follow-up on declined services, service experience driving customers away',
        process: 'No service reminder system, weak rebooking at checkout, no lost customer recovery program',
        tools: 'Inadequate CRM for service marketing, no automated reminder system (email/SMS), poor database hygiene',
        structure: 'No dedicated customer retention role, service department focused on "who walks in" rather than proactive outreach',
        incentives: 'No retention targets for service team, compensation based on daily throughput not long-term relationships'
      },
      improvementLevers: [
        'Implement automated service reminder program (30/60/90 days before service due)',
        'Create "next appointment booking" process at every service checkout',
        'Launch lost customer recovery campaign targeting customers overdue by 6+ months',
        'Develop loyalty program with service benefits (discounts, priority scheduling)',
        'Track retention by advisor with accountability for customer return rates',
        'Send declined service follow-up offers at 30 and 60 days',
        'Create competitive service pricing and maintenance packages vs. independent shops'
      ],
      interdependencies: {
        upstreamDrivers: ['CSI – Service', 'First-Time Fix Rate', 'Service pricing competitiveness', 'Communication quality', 'Appointment Lead Time'],
        downstreamImpacts: ['Service department revenue', 'Parts department revenue', 'Fixed absorption ratio', 'Repeat Purchase Rate', 'Lifetime customer value']
      }
    },
    de: {
      title: 'Servicebindungsrate',
      definition: 'Prozentsatz der Kunden, die innerhalb von 12 Monaten zum Service zurückkehren.',
      whyItMatters: 'Gebundene Kunden haben 6x niedrigere Akquisitionskosten und höheren Lebenszeitwert.',
      benchmark: '60-75%'
    }
  },
  revenuePerCustomer: {
    en: {
      title: 'Revenue per Customer (Service)',
      definition: 'The average total revenue generated per unique service customer per visit, including labor, parts, and any additional services.',
      executiveSummary: 'Revenue per customer reflects the depth of engagement during each service visit. Higher revenue per customer comes from thorough inspections, effective service menu presentation, and trust-based recommendations. Best-practice dealers achieve €350-€600 per customer visit.',
      whyItMatters: 'Maximizes revenue from existing customer base without requiring additional traffic. Reflects service advisor effectiveness and customer trust.',
      formula: 'Revenue per Customer = Total Service Revenue / Number of Unique Customers Served',
      inclusions: ['All labor, parts, and accessory revenue per customer visit'],
      exclusions: ['Warranty labor at internal rate (unless customer-facing)', 'Sublet/outsourced work'],
      unitOfMeasure: 'Currency (€)',
      benchmark: '€350-€600',
      department: 'service-performance',
      rootCauseDiagnostics: {
        people: 'Service advisors not performing thorough needs assessment, fear of overselling, poor product knowledge',
        process: 'No standardized inspection or menu presentation, inconsistent upselling approach, no tiered service packages',
        tools: 'No digital inspection tools, limited ability to show customers evidence of needed repairs, no video inspection',
        structure: 'Advisors handling too many customers per day reducing quality of consultation, insufficient appointment time allocation',
        incentives: 'No revenue-per-customer targets, flat advisor compensation, no bonus for increasing average ticket'
      },
      improvementLevers: [
        'Implement comprehensive multi-point digital inspection with photo/video evidence',
        'Create tiered service packages (Good/Better/Best) for every common service type',
        'Train advisors on consultative service selling with focus on vehicle safety and value preservation',
        'Set revenue-per-customer targets with tracking and coaching',
        'Develop seasonal and mileage-based service recommendations',
        'Implement digital vehicle health report shared with customer via email/text'
      ],
      interdependencies: {
        upstreamDrivers: ['Service advisor training', 'Multi-point inspection completion', 'Customer trust level', 'Vehicle age and mileage', 'Parts availability'],
        downstreamImpacts: ['Service department total revenue', 'Parts department revenue', 'Service department profitability', 'Customer satisfaction (if value perceived)']
      }
    },
    de: {
      title: 'Umsatz pro Kunde (Service)',
      definition: 'Durchschnittlicher Gesamtumsatz pro einzigartigem Servicekunden pro Besuch.',
      whyItMatters: 'Maximiert den Umsatz aus bestehender Kundenbasis.',
      benchmark: '€350-€600'
    }
  },
  menuSellingPenetration: {
    en: {
      title: 'Menu Selling Penetration',
      definition: 'The percentage of service customers who are presented with a structured service menu offering tiered options (maintenance packages, protection plans, value-added services).',
      executiveSummary: 'Menu selling transforms service advising from reactive order-taking to consultative selling. When presented with structured options, customers consistently choose higher-value packages. Best-practice dealers achieve 80%+ menu presentation rate with 40-60% upgrade acceptance.',
      whyItMatters: 'Structured choice architecture increases average ticket value while maintaining customer satisfaction through perceived control over spending decisions.',
      formula: 'Menu Selling Penetration = (Service Visits with Menu Presented / Total Service Visits) × 100',
      inclusions: ['All scheduled maintenance visits', 'Multi-point inspection presentations', 'Tire and brake service consultations'],
      exclusions: ['Emergency/tow-in repairs', 'Warranty-only visits', 'Quick oil changes with no upsell opportunity'],
      unitOfMeasure: 'Percentage (%)',
      benchmark: '80%+ presentation, 40-60% upgrade acceptance',
      department: 'service-performance',
      rootCauseDiagnostics: {
        people: 'Advisors uncomfortable with menu presentation, lack of training on value-based selling, fear of customer pushback',
        process: 'No standardized menu design, inconsistent presentation across advisors, no tracking of menu presentation rate',
        tools: 'No digital menu tools, paper-based presentation limiting impact, no integrated pricing in DMS for packages',
        structure: 'Advisors too busy to present menus properly, insufficient appointment time allocated for consultation',
        incentives: 'No bonus for menu presentation or upgrade acceptance, compensation not tied to average ticket value'
      },
      improvementLevers: [
        'Design professional service menus with 3 tiers (Essential/Recommended/Complete) for each service type',
        'Implement digital menu presentation on tablet or screen in service drive',
        'Train all advisors on menu presentation technique with role-playing',
        'Track menu presentation rate by advisor with weekly scorecard',
        'Tie advisor compensation to average ticket value and menu upgrade rates',
        'Create seasonal and mileage-based menu packages for proactive recommendation'
      ],
      interdependencies: {
        upstreamDrivers: ['Service advisor training', 'Menu design quality', 'Digital tools availability', 'Appointment scheduling (time allowance)'],
        downstreamImpacts: ['Labor Sales per RO', 'Revenue per Customer', 'Parts sales per RO', 'Service department gross profit', 'Customer perception of value']
      }
    },
    de: {
      title: 'Menüverkaufs-Durchdringung',
      definition: 'Prozentsatz der Servicekunden, denen ein strukturiertes Servicemenü präsentiert wird.',
      whyItMatters: 'Erhöht den durchschnittlichen Auftragswert bei gleichzeitiger Kundenzufriedenheit.',
      benchmark: '80%+ Präsentation'
    }
  },
  maintenancePlanPenetration: {
    en: {
      title: 'Maintenance Plan Penetration',
      definition: 'The percentage of eligible vehicle sales or service visits where a prepaid maintenance plan is sold to the customer.',
      executiveSummary: 'Prepaid maintenance plans lock in customer retention for 2-5 years, guarantee service revenue, and dramatically increase the probability of repeat purchase. Best-practice dealers achieve 30-50% penetration on new vehicle sales and 15-25% on used.',
      whyItMatters: 'Creates predictable recurring revenue, guarantees customer retention through the plan period, and increases the likelihood of vehicle repurchase at the selling dealership.',
      formula: 'Maintenance Plan Penetration = (Maintenance Plans Sold / Eligible Vehicle Sales or Service Visits) × 100',
      inclusions: ['All prepaid maintenance plans sold at point of sale or service drive', 'Both OEM and dealer-branded plans'],
      exclusions: ['OEM-included maintenance (complimentary plans)', 'Extended warranty products (tracked separately in F&I)'],
      unitOfMeasure: 'Percentage (%)',
      benchmark: '30-50% (new), 15-25% (used)',
      department: 'service-performance',
      rootCauseDiagnostics: {
        people: 'F&I managers not trained on maintenance plan presentation, service advisors unaware of plan availability, weak value proposition communication',
        process: 'Maintenance plan not included in standard F&I menu, no service drive presentation process, no renewal program at plan expiration',
        tools: 'No plan comparison calculator, limited integration between plan provider and DMS, no automated eligibility identification',
        structure: 'Plan presentation split between F&I (sales) and service (renewals) without coordination, no ownership of retention outcome',
        incentives: 'Low commission on maintenance plans vs. other F&I products, no service department bonus for plan utilization'
      },
      improvementLevers: [
        'Include maintenance plans in every F&I menu presentation as a standard product',
        'Train service advisors to offer plans during service visits for vehicles without coverage',
        'Create compelling value comparison (plan cost vs. individual service cost over same period)',
        'Implement automated renewal program contacting customers 60/30 days before plan expiration',
        'Track penetration by F&I manager and service advisor with coaching',
        'Develop service drive presentation process for "plan-less" vehicles identified during check-in'
      ],
      interdependencies: {
        upstreamDrivers: ['F&I process quality', 'Service advisor awareness and training', 'Plan pricing competitiveness', 'Customer trust'],
        downstreamImpacts: ['Service Retention Rate', 'Predictable recurring revenue', 'Repeat Purchase Rate', 'Customer lifetime value', 'Fixed absorption ratio']
      }
    },
    de: {
      title: 'Wartungsplan-Durchdringung',
      definition: 'Prozentsatz der berechtigten Fahrzeugverkäufe oder Servicebesuche, bei denen ein Wartungsplan verkauft wird.',
      whyItMatters: 'Schafft vorhersagbare wiederkehrende Einnahmen und garantiert Kundenbindung.',
      benchmark: '30-50% (Neuwagen)'
    }
  },

  // =====================================================
  // PARTS & INVENTORY KPIs (52-60)
  // =====================================================
  warrantyVsRetailMix: {
    en: {
      title: 'Warranty vs Retail Mix %',
      definition: 'The ratio of warranty labor hours to customer-pay (retail) labor hours in the service department, expressed as a percentage split.',
      executiveSummary: 'A healthy warranty-to-retail mix ensures the service department is not overly dependent on warranty work, which typically has lower labor rates and margins. Best-practice dealers maintain a 30/70 warranty-to-retail split or better.',
      whyItMatters: 'Over-dependence on warranty work reduces service department profitability due to lower reimbursement rates. A strong retail mix indicates customer loyalty and effective service marketing.',
      formula: 'Warranty Mix % = (Warranty Labor Hours / Total Labor Hours) × 100; Retail Mix % = 100 − Warranty Mix %',
      inclusions: ['All warranty claims (manufacturer, extended, goodwill)', 'All customer-pay repair orders'],
      exclusions: ['Internal work', 'Sublet labor', 'Body shop warranty claims'],
      unitOfMeasure: 'Percentage (%)',
      benchmark: '70%+ retail, <30% warranty',
      department: 'parts-inventory',
      rootCauseDiagnostics: {
        people: 'Service advisors not actively selling maintenance/repair work, technicians prefer warranty work (guaranteed time), weak customer retention',
        process: 'No proactive service marketing, insufficient inspection driving retail recommendations, poor declined service follow-up',
        tools: 'No CRM-based service marketing campaigns, insufficient digital inspection tools to generate retail work',
        structure: 'Service department capacity filled with warranty leaving no room for retail growth, no separate warranty processing team',
        incentives: 'Advisors paid equally on warranty vs. retail (no incentive to grow retail), no retention bonus'
      },
      improvementLevers: [
        'Implement comprehensive multi-point inspection generating retail repair recommendations',
        'Launch targeted service marketing campaigns to drive retail traffic',
        'Create express service lane capturing routine maintenance work',
        'Develop declined service follow-up process converting future retail revenue',
        'Incentivize advisors with higher commission on retail vs. warranty work',
        'Negotiate improved warranty labor rates with manufacturer'
      ],
      interdependencies: {
        upstreamDrivers: ['Service Retention Rate', 'Customer base size and loyalty', 'Service marketing effectiveness', 'Vehicle park age distribution'],
        downstreamImpacts: ['Service department gross margin', 'Effective labor rate', 'Service department profitability', 'Fixed absorption ratio']
      }
    },
    de: {
      title: 'Garantie- vs. Einzelhandelsmix %',
      definition: 'Verhältnis von Garantie- zu Kundenarbeitsstunden in der Serviceabteilung.',
      whyItMatters: 'Überabhängigkeit von Garantiearbeit reduziert die Rentabilität.',
      benchmark: '70%+ Einzelhandel'
    }
  },
  partsGrossMarginPct: {
    en: {
      title: 'Parts Gross Margin %',
      definition: 'The percentage of parts revenue retained as gross profit after deducting the cost of parts sold.',
      executiveSummary: 'Parts gross margin is the primary profitability metric for the parts department. Effective matrix pricing, discount control, and sourcing optimization can significantly impact margins. Best-practice dealers achieve 40-45% parts gross margin.',
      whyItMatters: 'Parts is often the highest-margin department in the dealership. Optimizing parts pricing directly impacts overall dealership profitability.',
      formula: 'Parts Gross Margin % = ((Parts Revenue − Cost of Parts Sold) / Parts Revenue) × 100',
      inclusions: ['All parts sold (retail, wholesale, internal, warranty)'],
      exclusions: ['Accessories and aftermarket products (may track separately)', 'Core charges and returns'],
      unitOfMeasure: 'Percentage (%)',
      benchmark: '40-45%',
      department: 'parts-inventory',
      rootCauseDiagnostics: {
        people: 'Counter staff discounting excessively, poor pricing knowledge, lack of confidence in value-based pricing',
        process: 'No pricing matrix, inconsistent discount policies, pricing too many parts at wholesale to body shops',
        tools: 'No automated pricing matrix in DMS, manual pricing decisions, poor competitor pricing visibility',
        structure: 'Over-reliance on wholesale business with low margins, insufficient retail counter traffic, too many discount levels',
        incentives: 'Parts staff compensated on volume not margin, no penalty for excessive discounting, wholesale bonuses eroding margin'
      },
      improvementLevers: [
        'Implement automated parts pricing matrix with tiered markup by part category and customer type',
        'Establish discount authority levels and maximum discount percentages',
        'Review and renegotiate wholesale account pricing quarterly',
        'Source competitive aftermarket alternatives where quality is equivalent',
        'Train counter staff on value-based selling and reducing unnecessary discounts',
        'Track margin by parts category and customer type to identify low-margin areas'
      ],
      interdependencies: {
        upstreamDrivers: ['Parts sourcing and cost', 'Pricing matrix effectiveness', 'Customer mix (retail vs. wholesale)', 'Discount discipline'],
        downstreamImpacts: ['Parts department profitability', 'Total dealership gross profit', 'Fixed absorption ratio', 'Service department competitiveness']
      }
    },
    de: {
      title: 'Teile-Bruttomarge %',
      definition: 'Prozentsatz des Teileumsatzes, der als Bruttogewinn einbehalten wird.',
      whyItMatters: 'Teile ist oft die Abteilung mit der höchsten Marge.',
      benchmark: '40-45%'
    }
  },
  partsInventoryTurn: {
    en: {
      title: 'Parts Inventory Turn',
      definition: 'The number of times the parts inventory is sold and replaced over a 12-month period.',
      executiveSummary: 'Parts inventory turn measures how efficiently capital invested in parts inventory is being utilized. Higher turns mean less capital tied up in parts while still meeting customer demand. Best-practice dealers achieve 6-8 turns per year.',
      whyItMatters: 'Higher turns reduce carrying costs, minimize obsolescence risk, and improve cash flow. Low turns indicate overstocking or poor demand forecasting.',
      formula: 'Parts Inventory Turn = Annual Parts Cost of Goods Sold / Average Parts Inventory Value',
      inclusions: ['All parts categories (mechanical, body, accessories)', 'Cost basis valuation'],
      exclusions: ['Consignment inventory', 'Special-order parts received and immediately sold'],
      unitOfMeasure: 'Turns per year',
      benchmark: '6-8 turns/year',
      department: 'parts-inventory',
      rootCauseDiagnostics: {
        people: 'Parts manager hoarding "safety stock," reluctance to return excess inventory, over-ordering based on gut feel',
        process: 'No systematic stock review, no return policy utilization, poor demand forecasting, manual ordering',
        tools: 'No demand forecasting software, manual min/max settings, poor DMS inventory reporting',
        structure: 'No accountability for inventory investment levels, purchasing decisions not connected to financial targets',
        incentives: 'Parts manager not measured on turn rate, no penalty for excess inventory, fill rate prioritized over efficiency'
      },
      improvementLevers: [
        'Implement automated demand forecasting and replenishment system',
        'Establish monthly stock review process to identify non-moving parts',
        'Maximize manufacturer return allowances for slow-moving inventory',
        'Set turn rate targets by parts category with monthly tracking',
        'Create phase-out process for declining-demand parts',
        'Implement just-in-time ordering for predictable maintenance parts'
      ],
      interdependencies: {
        upstreamDrivers: ['Demand forecasting accuracy', 'Ordering policies', 'Return allowance utilization', 'Inventory review discipline'],
        downstreamImpacts: ['Parts obsolescence cost', 'Carrying cost / floor plan interest', 'Cash flow', 'Fill Rate (inverse pressure)', 'Parts department ROI']
      }
    },
    de: {
      title: 'Teile-Bestandsumschlag',
      definition: 'Anzahl der Male, die der Teilebestand pro Jahr verkauft und ersetzt wird.',
      whyItMatters: 'Höherer Umschlag reduziert Lagerkosten und Obsoleszenzrisiko.',
      benchmark: '6-8 Umschläge/Jahr'
    }
  },
  partsObsolescence: {
    en: {
      title: 'Parts Obsolescence %',
      definition: 'The percentage of total parts inventory value consisting of parts that have had no demand (zero sales) for 12+ months.',
      executiveSummary: 'Obsolete parts represent dead capital generating zero revenue. Best-practice dealers maintain obsolescence below 5% through aggressive return programs, proactive phase-out processes, and disciplined initial stocking decisions.',
      whyItMatters: 'Obsolete inventory is a direct financial write-off risk. Every euro invested in obsolete parts could be generating 6-8x return if invested in fast-moving stock.',
      formula: 'Parts Obsolescence % = (Value of Parts with No Sales in 12+ Months / Total Parts Inventory Value) × 100',
      inclusions: ['All parts with zero demand for 12+ months', 'Superseded part numbers with no cross-reference demand'],
      exclusions: ['Seasonal parts with predictable annual demand', 'Insurance/safety stock required by regulation'],
      unitOfMeasure: 'Percentage (%)',
      benchmark: '<5%',
      department: 'parts-inventory',
      rootCauseDiagnostics: {
        people: 'Parts manager emotionally attached to inventory, belief that "we might need it someday," resistance to write-offs',
        process: 'No systematic obsolescence review, missed manufacturer return windows, no phase-out process for declining models',
        tools: 'Poor reporting on no-sale parts, no automated alerts for approaching obsolescence thresholds',
        structure: 'No financial accountability for obsolete inventory, write-off approval process too bureaucratic',
        incentives: 'No penalty for high obsolescence rates, parts manager bonus not tied to inventory health metrics'
      },
      improvementLevers: [
        'Maximize manufacturer return programs (typically 2-4x per year)',
        'Implement 90/180/365-day no-sale alerts with automatic review triggers',
        'Create regular obsolescence disposal process (quarterly auction/surplus sale)',
        'Avoid initial stocking of slow-moving parts categories for aging vehicle models',
        'Cross-reference obsolete parts with other dealers for inter-dealer sales',
        'Track obsolescence % monthly with improvement targets and accountability'
      ],
      interdependencies: {
        upstreamDrivers: ['Initial stocking decisions', 'Return program utilization', 'Vehicle model lifecycle', 'Demand forecasting accuracy'],
        downstreamImpacts: ['Parts Inventory Turn', 'Parts department ROI', 'Cash flow', 'Write-off risk', 'Overall parts profitability']
      }
    },
    de: {
      title: 'Teile-Obsoleszenz %',
      definition: 'Prozentsatz des Teilebestandswerts, der seit 12+ Monaten keine Nachfrage hatte.',
      whyItMatters: 'Veraltete Teile repräsentieren totes Kapital ohne Umsatzgenerierung.',
      benchmark: '<5%'
    }
  },
  fillRateEnriched: {
    en: {
      title: 'Fill Rate %',
      definition: 'The percentage of parts orders that can be fulfilled immediately from existing on-hand inventory.',
      executiveSummary: 'Fill rate directly impacts service department efficiency and customer satisfaction. When parts are not available, repairs are delayed, technicians sit idle, and customers wait. Best-practice dealers achieve 92-95% fill rate by balancing inventory investment with demand forecasting.',
      whyItMatters: 'Parts availability is the #1 constraint on service throughput. A 5% fill rate improvement can reduce customer wait times by 15-20% and increase technician productivity.',
      formula: 'Fill Rate = (Parts Lines Filled from Stock / Total Parts Lines Requested) × 100',
      inclusions: ['All parts requests from service, body shop, and counter sales'],
      exclusions: ['Special-order parts (customer-requested non-stock items)', 'Back-ordered manufacturer parts'],
      unitOfMeasure: 'Percentage (%)',
      benchmark: '92-95%',
      department: 'parts-inventory',
      rootCauseDiagnostics: {
        people: 'Poor demand anticipation, insufficient pre-ordering for scheduled appointments, counter staff not suggesting alternatives',
        process: 'No appointment-based parts pre-staging, reactive ordering instead of proactive forecasting, slow stock replenishment',
        tools: 'Inadequate demand forecasting, manual min/max settings not updated, poor DMS perpetual inventory accuracy',
        structure: 'Insufficient inventory investment budget, too few vendor sources, poor parts department hours limiting emergency ordering',
        incentives: 'Parts manager incentivized to minimize inventory (cost focus) rather than maximize availability (service focus)'
      },
      improvementLevers: [
        'Implement pre-appointment parts check process to identify and order needed parts before customer arrival',
        'Use automated demand forecasting to optimize stock levels',
        'Conduct regular physical inventory counts to ensure DMS accuracy',
        'Establish same-day or next-day delivery arrangements with key suppliers',
        'Review and adjust min/max levels monthly based on actual demand patterns',
        'Create emergency sourcing network with nearby dealers for urgent needs'
      ],
      interdependencies: {
        upstreamDrivers: ['Demand forecasting accuracy', 'Inventory investment level', 'Supplier reliability', 'DMS stock accuracy'],
        downstreamImpacts: ['Technician Productivity', 'Service throughput', 'Customer wait times', 'CSI – Service', 'Revenue per Customer']
      }
    },
    de: {
      title: 'Erfüllungsrate %',
      definition: 'Prozentsatz der Teilebestellungen, die sofort aus dem vorhandenen Bestand erfüllt werden können.',
      whyItMatters: 'Teileverfügbarkeit ist die größte Einschränkung für den Servicedurchsatz.',
      benchmark: '92-95%'
    }
  },
  lostSalesPct: {
    en: {
      title: 'Lost Sales %',
      definition: 'The percentage of customer parts requests that result in a lost sale because the part was not in stock and the customer chose not to wait for it.',
      executiveSummary: 'Lost sales represent immediate revenue loss and potential permanent customer defection. Every lost sale is revenue that goes to a competitor. Best-practice dealers keep lost sales below 5% through excellent fill rates and rapid sourcing alternatives.',
      whyItMatters: 'Direct revenue loss plus risk of losing customer to competitor permanently. Lost sales data reveals stocking gaps and customer demand patterns.',
      formula: 'Lost Sales % = (Parts Requests Lost / Total Parts Requests) × 100',
      inclusions: ['All customer-facing parts requests where customer left without purchasing'],
      exclusions: ['Internal requisitions deferred (not lost)', 'Customer price-shopping without intent to buy'],
      unitOfMeasure: 'Percentage (%)',
      benchmark: '<5%',
      department: 'parts-inventory',
      rootCauseDiagnostics: {
        people: 'Counter staff not offering alternatives, poor customer communication on availability timeline, giving up too quickly',
        process: 'No lost sale tracking process, no sourcing protocol when part is out of stock, slow response to customer inquiries',
        tools: 'No inter-dealer parts network, limited aftermarket sourcing options, slow parts lookup systems',
        structure: 'Parts counter hours not aligned with customer demand, insufficient counter staffing during peak times',
        incentives: 'No tracking or accountability for lost sales, counter staff not penalized for lost transactions'
      },
      improvementLevers: [
        'Implement mandatory lost sale tracking in DMS with reason codes',
        'Create sourcing protocol: check 3+ sources before telling customer "not available"',
        'Develop inter-dealer parts network for rapid emergency sourcing',
        'Offer next-day delivery option rather than losing the sale entirely',
        'Review lost sale data monthly to identify stocking gaps',
        'Extend parts counter hours to capture after-hours demand'
      ],
      interdependencies: {
        upstreamDrivers: ['Fill Rate %', 'Counter staff training', 'Sourcing network breadth', 'Parts counter accessibility'],
        downstreamImpacts: ['Parts department revenue', 'Customer satisfaction', 'Customer retention (parts counter)', 'Market share in local parts market']
      }
    },
    de: {
      title: 'Verlorene Verkäufe %',
      definition: 'Prozentsatz der Kundenteile-Anfragen, die zu einem verlorenen Verkauf führen.',
      whyItMatters: 'Direkter Umsatzverlust plus Risiko, den Kunden dauerhaft an Wettbewerber zu verlieren.',
      benchmark: '<5%'
    }
  },
  counterSalesRatio: {
    en: {
      title: 'Counter Sales Ratio',
      definition: 'The percentage of total parts revenue generated from over-the-counter retail and wholesale customers versus internal service department consumption.',
      executiveSummary: 'A healthy counter sales ratio indicates the parts department is a revenue center attracting external customers, not just supporting internal service. Best-practice dealers achieve 25-35% of parts revenue from external counter sales.',
      whyItMatters: 'External counter sales diversify parts revenue sources, increase parts turn, and generate higher margins than internal transfers.',
      formula: 'Counter Sales Ratio = (External Counter Parts Revenue / Total Parts Revenue) × 100',
      inclusions: ['Walk-in retail customers', 'Wholesale/body shop accounts', 'Online parts sales'],
      exclusions: ['Internal service department parts consumption', 'Warranty parts reimbursement'],
      unitOfMeasure: 'Percentage (%)',
      benchmark: '25-35%',
      department: 'parts-inventory',
      rootCauseDiagnostics: {
        people: 'Counter staff not actively marketing to walk-in trade, poor product knowledge for DIY customers, unfriendly counter experience',
        process: 'No external customer marketing program, limited counter hours, no wholesale account development strategy',
        tools: 'No online parts ordering system, poor parts catalog search for non-technical customers, limited delivery capability',
        structure: 'Counter designed for service internal use, not customer-friendly, no dedicated wholesale sales representative',
        incentives: 'No counter sales targets, staff not incentivized to grow external business'
      },
      improvementLevers: [
        'Launch online parts store for retail customers',
        'Develop wholesale account program targeting local body shops and independent garages',
        'Create retail-friendly counter area with product displays and signage',
        'Implement parts delivery service for wholesale accounts',
        'Extend counter hours to capture after-hours DIY demand',
        'Train counter staff on customer service and product recommendation'
      ],
      interdependencies: {
        upstreamDrivers: ['Parts marketing efforts', 'Counter accessibility and hours', 'Pricing competitiveness', 'Delivery capability'],
        downstreamImpacts: ['Parts department total revenue', 'Parts Inventory Turn', 'Parts Gross Margin %', 'Market share in local aftermarket']
      }
    },
    de: {
      title: 'Thekenverkaufsquote',
      definition: 'Prozentsatz des Teileumsatzes aus externen Thekenkunden vs. internem Serviceverbrauch.',
      whyItMatters: 'Externe Thekenverkäufe diversifizieren die Umsatzquellen und generieren höhere Margen.',
      benchmark: '25-35%'
    }
  },
  internalVsExternalMix: {
    en: {
      title: 'Internal vs External Mix %',
      definition: 'The percentage split between parts consumed internally (service department, reconditioning) and parts sold externally (counter, wholesale, online).',
      executiveSummary: 'This ratio reveals the parts department\'s dependency on internal service work versus external revenue generation. Best-practice dealers maintain 60/40 or 65/35 internal/external split, ensuring parts revenue grows beyond just supporting the service department.',
      whyItMatters: 'A balanced mix reduces vulnerability to service volume fluctuations and maximizes parts department contribution to dealership profitability.',
      formula: 'Internal Mix = (Internal Parts Revenue / Total Parts Revenue) × 100; External Mix = 100 − Internal Mix',
      inclusions: ['All parts transactions categorized by customer type'],
      exclusions: ['Warranty parts (may be classified separately by DMS)'],
      unitOfMeasure: 'Percentage (%)',
      benchmark: '60/40 internal/external',
      department: 'parts-inventory',
      rootCauseDiagnostics: {
        people: 'Parts team focused only on filling service orders, no business development capability, limited external customer relationships',
        process: 'No wholesale growth strategy, no external marketing program, no online sales channel',
        tools: 'No e-commerce capability, limited delivery fleet, poor wholesale account management tools',
        structure: 'Parts department structured as service support function rather than profit center, no dedicated wholesale representative',
        incentives: 'Parts manager measured on fill rate only, no targets for external revenue growth'
      },
      improvementLevers: [
        'Set external revenue growth targets with quarterly milestones',
        'Hire dedicated wholesale account representative',
        'Launch e-commerce parts sales channel',
        'Develop competitive wholesale pricing program for body shops and independents',
        'Create parts delivery service to serve external accounts efficiently',
        'Track internal/external mix monthly with trend reporting'
      ],
      interdependencies: {
        upstreamDrivers: ['Wholesale account development', 'E-commerce capability', 'Parts marketing investment', 'Pricing competitiveness'],
        downstreamImpacts: ['Parts department total revenue', 'Parts department profitability', 'Revenue diversification', 'Parts Inventory Turn']
      }
    },
    de: {
      title: 'Interner vs. externer Mix %',
      definition: 'Prozentuale Aufteilung zwischen intern verbrauchten und extern verkauften Teilen.',
      whyItMatters: 'Ausgewogener Mix reduziert Anfälligkeit für Servicevolumen-Schwankungen.',
      benchmark: '60/40 intern/extern'
    }
  },
  partsDaysOnHand: {
    en: {
      title: 'Parts Days on Hand',
      definition: 'The average number of days of parts supply on hand based on current sales velocity.',
      executiveSummary: 'Parts Days on Hand measures inventory efficiency in terms of how many days the current stock would last at current sales rates. Best-practice dealers maintain 45-60 days of supply, balancing availability with capital efficiency.',
      whyItMatters: 'Too many days on hand means excess capital tied up; too few means frequent stockouts. Optimal days on hand balances fill rate requirements with inventory investment.',
      formula: 'Parts Days on Hand = (Current Parts Inventory Value / Average Daily Parts Cost of Sales)',
      inclusions: ['All parts inventory at cost', 'All daily parts sales at cost'],
      exclusions: ['Consignment inventory', 'Special-order parts pending customer pickup'],
      unitOfMeasure: 'Days',
      benchmark: '45-60 days',
      department: 'parts-inventory',
      rootCauseDiagnostics: {
        people: 'Parts manager over-ordering for comfort, poor demand sensing, failure to adjust for seasonal patterns',
        process: 'No systematic inventory review, manual reorder processes, no seasonal adjustment in ordering',
        tools: 'No demand forecasting tools, manual calculations, poor visibility into aging inventory',
        structure: 'No financial constraints on parts ordering, purchasing not connected to budget targets',
        incentives: 'Parts manager rewarded for fill rate, not inventory efficiency, no capital cost accountability'
      },
      improvementLevers: [
        'Implement automated reorder point calculations based on demand velocity',
        'Review days on hand by parts category monthly',
        'Create seasonal ordering adjustments for known demand pattern changes',
        'Set days-on-hand targets by category with accountability',
        'Implement just-in-time ordering for fast-moving predictable parts',
        'Track and reduce carrying cost as percentage of parts revenue'
      ],
      interdependencies: {
        upstreamDrivers: ['Ordering frequency and accuracy', 'Demand forecasting', 'Supplier lead times', 'Return program utilization'],
        downstreamImpacts: ['Parts Inventory Turn', 'Fill Rate %', 'Carrying cost', 'Cash flow', 'Parts Obsolescence %']
      }
    },
    de: {
      title: 'Teile-Tagesreichweite',
      definition: 'Durchschnittliche Anzahl der Tage des Teilevorrats basierend auf der aktuellen Verkaufsgeschwindigkeit.',
      whyItMatters: 'Balance zwischen Verfügbarkeit und Kapitaleffizienz.',
      benchmark: '45-60 Tage'
    }
  },

  // =====================================================
  // CUSTOMER SATISFACTION KPIs (61-66)
  // =====================================================
  overallCSI: {
    en: {
      title: 'Overall CSI',
      definition: 'The composite Customer Satisfaction Index score across all dealership touchpoints (sales, service, parts, F&I), typically measured through manufacturer-administered surveys.',
      executiveSummary: 'Overall CSI is the master customer experience metric. It directly influences OEM incentive payments, franchise awards, allocation priority, and long-term brand reputation. Top-performing dealers treat CSI as a strategic business driver, not just a survey score.',
      whyItMatters: 'Impacts OEM incentive eligibility (often 1-3% of revenue), vehicle allocation priority, franchise standing, and customer retention.',
      formula: 'Overall CSI = Weighted Average of Department CSI Scores (per OEM methodology)',
      inclusions: ['All OEM-surveyed customer interactions', 'Sales, service, and delivery experiences'],
      exclusions: ['Third-party review scores (tracked separately)', 'Internal surveys not part of OEM program'],
      unitOfMeasure: 'Score (varies by OEM)',
      benchmark: 'Top Quartile (OEM-specific)',
      department: 'customer-satisfaction',
      rootCauseDiagnostics: {
        people: 'Inconsistent customer experience across departments, individual poor performers dragging down scores, lack of customer-first culture',
        process: 'No standardized customer experience process, inconsistent follow-up, surprise charges or delays, poor interdepartmental handoffs',
        tools: 'No real-time CSI tracking, delayed survey results (weeks/months), no early warning system for dissatisfied customers',
        structure: 'No dedicated customer experience manager, no cross-departmental CX standards, siloed department operations',
        incentives: 'CSI not weighted enough in compensation, no immediate consequence for poor scores, department competition over collaboration'
      },
      improvementLevers: [
        'Create unified customer experience standards across all departments',
        'Implement real-time survey feedback system for immediate intervention',
        'Establish CSI as significant component of all staff compensation (10-20%)',
        'Create cross-departmental customer journey mapping and optimization',
        'Implement detractor recovery program with immediate management follow-up',
        'Conduct monthly CSI review meetings with all department heads',
        'Train all customer-facing staff on OEM survey methodology and customer expectations'
      ],
      interdependencies: {
        upstreamDrivers: ['Sales CSI', 'Service CSI', 'F&I experience', 'Delivery experience', 'Facility quality'],
        downstreamImpacts: ['OEM incentive payments', 'Vehicle allocation', 'Franchise standing', 'Customer retention', 'Online reputation', 'Referral volume']
      }
    },
    de: {
      title: 'Gesamt-CSI',
      definition: 'Zusammengesetzter Kundenzufriedenheitsindex über alle Autohaus-Touchpoints.',
      whyItMatters: 'Beeinflusst OEM-Incentives, Fahrzeugzuteilung und Franchise-Standing.',
      benchmark: 'Oberstes Quartil (OEM-spezifisch)'
    }
  },
  salesCSI: {
    en: {
      title: 'Sales CSI',
      definition: 'Customer Satisfaction Index score specifically for the vehicle purchase and delivery experience.',
      executiveSummary: 'Sales CSI reflects how well the dealership handles the buying journey from first contact through delivery. Key drivers include salesperson professionalism, negotiation transparency, delivery experience quality, and follow-up consistency.',
      whyItMatters: 'Directly impacts repeat purchase probability, referral generation, and OEM sales incentive eligibility.',
      formula: 'Sales CSI = Average of Post-Purchase Survey Scores (per OEM methodology)',
      inclusions: ['All new and used vehicle purchase surveys', 'Delivery experience ratings'],
      exclusions: ['Service-related surveys', 'Lease return experiences'],
      unitOfMeasure: 'Score (varies by OEM)',
      benchmark: 'Top Quartile (OEM-specific)',
      department: 'customer-satisfaction',
      rootCauseDiagnostics: {
        people: 'Pushy sales tactics, poor product knowledge, lack of follow-up after sale, F&I pressure tactics',
        process: 'Lengthy and opaque negotiation, poor delivery preparation, no structured post-sale follow-up',
        tools: 'Slow document processing, no digital retailing options, poor customer communication during waiting periods',
        structure: 'Excessive handoffs between departments during purchase, customer feeling "processed" rather than valued',
        incentives: 'Volume-focused compensation encouraging pressure tactics, no CSI component in sales compensation'
      },
      improvementLevers: [
        'Implement transparent, no-pressure sales process',
        'Create exceptional delivery experience (vehicle presentation, feature tutorial)',
        'Establish structured post-sale follow-up program (day 1, 3, 7, 30)',
        'Streamline purchase process to reduce time-to-delivery',
        'Train sales team on consultative selling approach',
        'Add CSI component to sales compensation (10-15% of total)'
      ],
      interdependencies: {
        upstreamDrivers: ['Sales process quality', 'Salesperson skill and professionalism', 'F&I experience', 'Vehicle delivery preparation'],
        downstreamImpacts: ['Overall CSI', 'Repeat Purchase Rate', 'Referral volume', 'Online review scores', 'OEM sales incentives']
      }
    },
    de: {
      title: 'Verkaufs-CSI',
      definition: 'Kundenzufriedenheitsindex speziell für das Kauf- und Auslieferungserlebnis.',
      whyItMatters: 'Beeinflusst direkt die Wiederkaufwahrscheinlichkeit und Empfehlungsgenerierung.',
      benchmark: 'Oberstes Quartil (OEM-spezifisch)'
    }
  },
  serviceCsiDetailed: {
    en: {
      title: 'Service CSI (Detailed)',
      definition: 'Customer Satisfaction Index score specifically for the after-sales service experience, capturing appointment booking, advisor interaction, repair quality, communication, and vehicle return.',
      executiveSummary: 'Service CSI is the most critical customer experience metric for long-term dealership profitability because service visits are far more frequent than purchases. Key drivers include communication quality, repair timeliness, first-time fix rate, and price transparency.',
      whyItMatters: 'Drives service retention, OEM service incentives, and long-term customer loyalty. Service CSI often has a stronger impact on overall CSI than sales CSI.',
      formula: 'Service CSI = Average of Post-Service Survey Scores (per OEM methodology)',
      inclusions: ['All OEM-surveyed service visits', 'Scheduled maintenance and repair visits'],
      exclusions: ['Body shop-only visits', 'Warranty-only visits with no customer interaction'],
      unitOfMeasure: 'Score (varies by OEM)',
      benchmark: 'Top Quartile (OEM-specific)',
      department: 'customer-satisfaction',
      rootCauseDiagnostics: {
        people: 'Service advisors too busy for proper customer consultation, poor communication skills, lack of empathy, technician quality issues',
        process: 'No proactive status updates, unclear completion time estimates, surprise charges, slow vehicle return process, poor follow-up',
        tools: 'No automated status notifications, poor online scheduling, no digital inspection reports for transparency',
        structure: 'Advisors handling too many customers, insufficient express service options, poor waiting area experience',
        incentives: 'No CSI component in service staff compensation, productivity focus overwhelming customer experience focus'
      },
      improvementLevers: [
        'Implement multi-touchpoint proactive communication (received, diagnosed, progressing, ready)',
        'Create transparent pricing with written estimates before work begins',
        'Establish comfortable waiting area with amenities and Wi-Fi',
        'Train advisors on customer communication excellence',
        'Set CSI targets with compensation linkage for advisors',
        'Implement same-day service completion for routine maintenance',
        'Create automated feedback collection immediately after vehicle return'
      ],
      interdependencies: {
        upstreamDrivers: ['First-Time Fix Rate', 'Comeback Rate', 'Appointment Lead Time', 'Communication quality', 'Price transparency'],
        downstreamImpacts: ['Overall CSI', 'Service Retention Rate', 'NPS', 'OEM service incentives', 'Online reviews']
      }
    },
    de: {
      title: 'Service-CSI (Detailliert)',
      definition: 'Kundenzufriedenheitsindex speziell für das Aftersales-Serviceerlebnis.',
      whyItMatters: 'Treibt Servicebindung, OEM-Incentives und langfristige Kundentreue.',
      benchmark: 'Oberstes Quartil (OEM-spezifisch)'
    }
  },
  onlineReviewScore: {
    en: {
      title: 'Online Review Score',
      definition: 'The average star rating across all major online review platforms (Google, Facebook, manufacturer sites, automotive portals).',
      executiveSummary: 'Online reviews are the modern word-of-mouth. 88% of consumers trust online reviews as much as personal recommendations. A 0.5-star improvement can increase revenue by 5-9%. Best-practice dealers maintain 4.5+ stars with 50+ reviews per month.',
      whyItMatters: 'Directly impacts customer acquisition. Prospective buyers check reviews before visiting the dealership. Low scores reduce showroom traffic.',
      formula: 'Online Review Score = Average Star Rating across All Platforms (weighted by platform importance)',
      inclusions: ['Google Business Reviews', 'Facebook ratings', 'OEM review platforms', 'Automotive portals'],
      exclusions: ['Internal survey scores', 'Anonymous/unverifiable reviews'],
      unitOfMeasure: 'Stars (1-5)',
      benchmark: '4.5+ stars',
      department: 'customer-satisfaction',
      rootCauseDiagnostics: {
        people: 'Staff not asking for reviews, poor customer experiences generating negative reviews, no response to negative reviews',
        process: 'No systematic review solicitation, no negative review response protocol, no internal escalation for complaints',
        tools: 'No review management platform, no automated review request system, poor monitoring across platforms',
        structure: 'No one responsible for online reputation management, reactive approach to reviews, no integration with CX strategy',
        incentives: 'No recognition for review generation, no accountability for negative reviews, no team targets for online reputation'
      },
      improvementLevers: [
        'Implement automated review solicitation within 24 hours of purchase/service',
        'Create review response protocol: respond to ALL reviews within 24 hours',
        'Train all staff to request reviews at point of experience completion',
        'Establish escalation process for negative reviews with management follow-up',
        'Monitor all platforms daily using reputation management tools',
        'Create internal program recognizing staff mentioned positively in reviews'
      ],
      interdependencies: {
        upstreamDrivers: ['Overall customer experience quality', 'Review solicitation effort', 'Response management quality', 'Complaint resolution speed'],
        downstreamImpacts: ['Website traffic and leads', 'Showroom traffic', 'Customer acquisition cost', 'Brand reputation', 'SEO ranking']
      }
    },
    de: {
      title: 'Online-Bewertungsscore',
      definition: 'Durchschnittliche Sternebewertung auf allen wichtigen Online-Bewertungsplattformen.',
      whyItMatters: 'Beeinflusst direkt die Kundenakquise. Interessenten prüfen Bewertungen vor dem Besuch.',
      benchmark: '4,5+ Sterne'
    }
  },
  complaintResolutionTime: {
    en: {
      title: 'Complaint Resolution Time',
      definition: 'The average time from customer complaint registration to satisfactory resolution.',
      executiveSummary: 'Speed of complaint resolution directly predicts whether a dissatisfied customer becomes a detractor or a recovered promoter. Research shows complaints resolved within 24 hours retain 70%+ of at-risk customers, while delays beyond 72 hours lose most permanently.',
      whyItMatters: 'Fast resolution preserves customer relationships, prevents negative reviews, and demonstrates organizational responsiveness.',
      formula: 'Complaint Resolution Time = Σ(Resolution Date − Complaint Date) / Number of Complaints Resolved',
      inclusions: ['All formal customer complaints across departments', 'Phone, email, in-person, and online complaints'],
      exclusions: ['Informal feedback not escalated to complaint status', 'Warranty claims processed through normal channels'],
      unitOfMeasure: 'Hours',
      benchmark: '<24 hours',
      department: 'customer-satisfaction',
      rootCauseDiagnostics: {
        people: 'Frontline staff lacking authority to resolve complaints, poor empathy skills, avoidance behavior on difficult conversations',
        process: 'No complaint tracking system, unclear escalation procedures, resolution requiring multiple approvals, no follow-up verification',
        tools: 'No CRM complaint tracking module, manual complaint logs, no automated alerts for aging complaints',
        structure: 'No dedicated customer relations role, complaints bounced between departments, no single point of accountability',
        incentives: 'No targets for resolution speed, no consequence for unresolved complaints, no recognition for effective complaint handling'
      },
      improvementLevers: [
        'Empower frontline staff with resolution authority (up to defined value)',
        'Implement complaint tracking system with automatic escalation timers',
        'Create 24-hour resolution target with management alert at 12 hours',
        'Establish complaint resolution playbook with pre-approved remedies',
        'Follow up after resolution to verify customer satisfaction',
        'Track complaint patterns to identify and fix root causes'
      ],
      interdependencies: {
        upstreamDrivers: ['Staff empowerment level', 'Complaint tracking process', 'Management availability', 'Resolution authority structure'],
        downstreamImpacts: ['CSI scores', 'Online Review Score', 'Customer retention', 'NPS', 'Legal/regulatory risk']
      }
    },
    de: {
      title: 'Beschwerderlösungszeit',
      definition: 'Durchschnittliche Zeit von der Beschwerderegistrierung bis zur zufriedenstellenden Lösung.',
      whyItMatters: 'Schnelle Lösung bewahrt Kundenbeziehungen und verhindert negative Bewertungen.',
      benchmark: '<24 Stunden'
    }
  },
  repeatPurchaseRate: {
    en: {
      title: 'Repeat Purchase Rate',
      definition: 'The percentage of vehicle purchases made by customers who have previously purchased from the same dealership.',
      executiveSummary: 'Repeat purchases represent the highest-value transactions: no acquisition cost, higher gross potential, and customers who already trust the dealership. Best-practice dealers achieve 35-50% repeat purchase rates through systematic CRM, exceptional service experiences, and proactive engagement.',
      whyItMatters: 'Repeat customers cost nothing to acquire, have higher closing rates, accept higher gross, and generate referrals. Improving repeat rate is the most profitable growth strategy.',
      formula: 'Repeat Purchase Rate = (Vehicle Sales to Previous Customers / Total Vehicle Sales) × 100',
      inclusions: ['All new and used vehicle purchases by customers with prior purchase history'],
      exclusions: ['First-time purchases', 'Fleet/commercial repeat orders', 'Household members without own prior purchase'],
      unitOfMeasure: 'Percentage (%)',
      benchmark: '35-50%',
      department: 'customer-satisfaction',
      rootCauseDiagnostics: {
        people: 'No ongoing customer relationship management, salespeople leave and take relationships, poor post-purchase engagement',
        process: 'No equity mining or lifecycle marketing, no proactive outreach at replacement timing, no ownership experience program',
        tools: 'Poor CRM data quality, no equity analysis tools, limited customer communication capabilities',
        structure: 'Sales team turnover breaking customer relationships, no customer retention program ownership, no loyalty program',
        incentives: 'No additional bonus for repeat business, sales compensation not differentiated for returning customers, no retention accountability'
      },
      improvementLevers: [
        'Implement equity mining program identifying customers in positive equity position',
        'Create loyalty program with tangible benefits for returning customers',
        'Develop lifecycle marketing automation (anniversary, service milestones, replacement timing)',
        'Assign permanent relationship owner for each customer (beyond individual salesperson)',
        'Create premium exchange/upgrade program for existing customers',
        'Track repeat purchase rate by salesperson and original purchase year cohort'
      ],
      interdependencies: {
        upstreamDrivers: ['Sales CSI', 'Service Retention Rate', 'Ongoing customer engagement', 'Customer equity position', 'Salesperson relationship quality'],
        downstreamImpacts: ['Customer acquisition cost', 'Total dealership sales volume', 'Average gross per vehicle', 'Referral generation', 'Lifetime customer value']
      }
    },
    de: {
      title: 'Wiederkaufrate',
      definition: 'Prozentsatz der Fahrzeugkäufe durch Kunden, die zuvor beim selben Autohaus gekauft haben.',
      whyItMatters: 'Stammkunden kosten nichts in der Akquise und haben höhere Abschlussraten.',
      benchmark: '35-50%'
    }
  },

  // =====================================================
  // MARKETING & DIGITAL KPIs (67-73)
  // =====================================================
  costPerLead: {
    en: {
      title: 'Cost per Lead',
      definition: 'The total marketing and advertising expenditure divided by the number of qualified leads generated across all channels.',
      executiveSummary: 'Cost per Lead (CPL) is the primary efficiency metric for marketing spend. It reveals which channels deliver the best return on marketing investment. Best-practice dealers achieve €30-€80 CPL depending on market and brand positioning.',
      whyItMatters: 'Directly determines marketing efficiency and customer acquisition cost. Optimizing CPL enables more leads from the same budget or same leads for less spend.',
      formula: 'Cost per Lead = Total Marketing & Advertising Spend / Total Qualified Leads Generated',
      inclusions: ['All marketing spend (digital, print, broadcast, event, sponsorship)', 'All qualified leads generated'],
      exclusions: ['Organic/referral leads (zero acquisition cost)', 'Co-op/manufacturer-funded marketing'],
      unitOfMeasure: 'Currency (€)',
      benchmark: '€30-€80',
      department: 'marketing-digital',
      rootCauseDiagnostics: {
        people: 'Marketing team lacking digital skills, agency dependency without performance accountability, poor lead qualification criteria',
        process: 'No channel attribution tracking, budget allocation based on tradition not performance, no A/B testing discipline',
        tools: 'No marketing analytics platform, poor conversion tracking, limited CRM-to-marketing integration',
        structure: 'Marketing budget set annually without flexibility, no rapid reallocation capability, disconnected from sales outcomes',
        incentives: 'Marketing measured on spend or reach, not lead generation; no cost-per-lead targets by channel'
      },
      improvementLevers: [
        'Implement full-funnel attribution tracking across all marketing channels',
        'Shift budget to highest-performing channels based on CPL data',
        'Establish channel-specific CPL targets with monthly review',
        'Develop in-house digital marketing capabilities to reduce agency fees',
        'Create lead qualification criteria to focus on qualified leads, not just contacts',
        'Test and optimize campaigns continuously (A/B testing, audience targeting)',
        'Leverage manufacturer co-op programs to reduce net CPL'
      ],
      interdependencies: {
        upstreamDrivers: ['Marketing budget allocation', 'Channel mix strategy', 'Creative quality', 'Audience targeting accuracy'],
        downstreamImpacts: ['Lead volume', 'Cost per Sale', 'Marketing ROI', 'Total customer acquisition cost', 'Sales volume']
      }
    },
    de: {
      title: 'Kosten pro Lead',
      definition: 'Gesamte Marketing-/Werbeausgaben geteilt durch die Anzahl qualifizierter Leads.',
      whyItMatters: 'Bestimmt direkt die Marketingeffizienz und Kundenakquisitionskosten.',
      benchmark: '€30-€80'
    }
  },
  costPerSale: {
    en: {
      title: 'Cost per Sale',
      definition: 'The total marketing and advertising expenditure divided by the number of vehicles sold, representing the marketing cost to generate each sale.',
      executiveSummary: 'Cost per Sale (CPS) is the ultimate marketing effectiveness metric, combining lead generation efficiency with sales conversion effectiveness. Best-practice dealers achieve €300-€600 CPS through optimized marketing spend and strong conversion rates.',
      whyItMatters: 'Reveals true cost of customer acquisition. When CPS exceeds gross profit per vehicle, the dealership is spending more to acquire customers than they earn.',
      formula: 'Cost per Sale = Total Marketing & Advertising Spend / Total Vehicles Sold',
      inclusions: ['All marketing spend', 'All new and used vehicle sales'],
      exclusions: ['Manufacturer-funded advertising (track separately)', 'F&I product sales'],
      unitOfMeasure: 'Currency (€)',
      benchmark: '€300-€600',
      department: 'marketing-digital',
      rootCauseDiagnostics: {
        people: 'Marketing team not aligned with sales outcomes, poor communication between marketing and sales, agency not accountable for sales',
        process: 'No closed-loop reporting (marketing to sale), budget not tied to sales targets, no channel effectiveness analysis',
        tools: 'No CRM-marketing integration for attribution, inability to track lead-to-sale journey by channel, poor reporting',
        structure: 'Marketing and sales operating in silos, no shared KPIs, marketing budget not flexible based on performance',
        incentives: 'Marketing team measured on impressions/clicks not sales, no shared accountability for cost per sale'
      },
      improvementLevers: [
        'Implement closed-loop CRM reporting tracking every lead from source to sale',
        'Calculate CPS by channel to identify most efficient acquisition paths',
        'Set CPS targets and reallocate budget from high-CPS to low-CPS channels',
        'Improve sales conversion rate to reduce CPS without cutting marketing spend',
        'Leverage organic/referral channels to bring down blended CPS',
        'Negotiate performance-based contracts with marketing agencies'
      ],
      interdependencies: {
        upstreamDrivers: ['Cost per Lead', 'Lead Conversion Rate', 'Marketing budget level', 'Channel mix effectiveness'],
        downstreamImpacts: ['Dealership profitability per vehicle', 'Marketing ROI', 'Budget allocation decisions', 'Growth investment capacity']
      }
    },
    de: {
      title: 'Kosten pro Verkauf',
      definition: 'Gesamte Marketing-/Werbeausgaben geteilt durch die Anzahl verkaufter Fahrzeuge.',
      whyItMatters: 'Zeigt die tatsächlichen Kosten der Kundenakquise.',
      benchmark: '€300-€600'
    }
  },
  websiteConversionRate: {
    en: {
      title: 'Website Conversion Rate',
      definition: 'The percentage of website visitors who complete a desired action (lead form submission, phone call, chat initiation, appointment booking, or trade-in valuation).',
      executiveSummary: 'Website conversion rate measures how effectively the dealership website turns browsers into leads. Best-practice automotive websites convert 2-5% of visitors. A 1% improvement on 10,000 monthly visitors generates 100 additional leads per month.',
      whyItMatters: 'Maximizes ROI on all digital marketing driving website traffic. Higher conversion means more leads from the same traffic, reducing cost per lead.',
      formula: 'Website Conversion Rate = (Website Lead Actions / Total Website Visitors) × 100',
      inclusions: ['Form submissions, phone calls, chat leads, online appointments, trade-in valuations'],
      exclusions: ['Service scheduling (separate funnel)', 'Parts ordering', 'Job applications'],
      unitOfMeasure: 'Percentage (%)',
      benchmark: '2-5%',
      department: 'marketing-digital',
      rootCauseDiagnostics: {
        people: 'Marketing team lacking UX/conversion optimization skills, poor understanding of customer digital journey',
        process: 'No A/B testing program, no conversion rate optimization strategy, website redesigns without data basis',
        tools: 'No heatmap/user behavior analytics, poor website speed, non-mobile-optimized experience, limited conversion opportunities',
        structure: 'Website managed by external agency with slow update cycles, no in-house ability to make rapid changes',
        incentives: 'Website performance not tracked or tied to marketing team goals, no conversion targets'
      },
      improvementLevers: [
        'Implement conversion rate optimization program with regular A/B testing',
        'Add multiple low-friction conversion points (chat, text, quick-quote, trade-in tool)',
        'Optimize website speed (sub-3-second load time)',
        'Ensure fully mobile-responsive design with mobile-specific CTAs',
        'Create vehicle-specific landing pages for paid advertising campaigns',
        'Use heatmap and session recording tools to identify user behavior patterns',
        'Implement exit-intent offers to capture leaving visitors'
      ],
      interdependencies: {
        upstreamDrivers: ['Website traffic quality', 'Website UX and design', 'Inventory merchandising quality', 'Page load speed', 'Mobile optimization'],
        downstreamImpacts: ['Cost per Lead', 'Total lead volume', 'Marketing ROI', 'Digital Appointment Ratio', 'Overall sales volume']
      }
    },
    de: {
      title: 'Website-Konversionsrate',
      definition: 'Prozentsatz der Website-Besucher, die eine gewünschte Aktion abschließen.',
      whyItMatters: 'Maximiert den ROI aller digitalen Marketingaktivitäten.',
      benchmark: '2-5%'
    }
  },
  digitalAppointmentRatio: {
    en: {
      title: 'Digital Appointment Ratio',
      definition: 'The percentage of total sales and service appointments that are booked through digital channels (website, app, email, social media) versus traditional channels (phone, walk-in).',
      executiveSummary: 'Digital appointment booking reduces operational costs, provides 24/7 availability, and captures data for better customer engagement. Best-practice dealers achieve 40-60% digital appointment booking rates.',
      whyItMatters: 'Digital bookings are lower cost, available 24/7, reduce phone staff requirements, and provide better data for preparation and follow-up.',
      formula: 'Digital Appointment Ratio = (Appointments Booked Digitally / Total Appointments Booked) × 100',
      inclusions: ['Online scheduling tools, app bookings, email appointment requests, social media bookings'],
      exclusions: ['Phone appointments', 'Walk-in appointments', 'Internal/fleet appointments'],
      unitOfMeasure: 'Percentage (%)',
      benchmark: '40-60%',
      department: 'marketing-digital',
      rootCauseDiagnostics: {
        people: 'Staff directing customers to phone instead of online tools, poor promotion of digital booking options',
        process: 'No online booking system, digital booking not integrated with dealership scheduling, complicated online forms',
        tools: 'No user-friendly online scheduling tool, poor mobile experience, no integration with DMS calendar',
        structure: 'Digital booking implemented but not promoted, phone booking still the default path',
        incentives: 'No targets for digital booking adoption, staff not incentivized to promote digital channels'
      },
      improvementLevers: [
        'Implement user-friendly online scheduling with real-time availability',
        'Promote digital booking across all customer touchpoints (email, SMS, website, in-store)',
        'Offer incentives for customers who book digitally (priority scheduling, discount)',
        'Ensure mobile-optimized booking experience',
        'Integrate digital booking with DMS for seamless scheduling',
        'Track digital booking ratio with monthly improvement targets'
      ],
      interdependencies: {
        upstreamDrivers: ['Online scheduling tool quality', 'Digital promotion efforts', 'Customer digital literacy', 'Mobile experience quality'],
        downstreamImpacts: ['Appointment volume', 'BDC/phone staff requirements', 'Customer data quality', 'Service department capacity utilization']
      }
    },
    de: {
      title: 'Digitale Terminquote',
      definition: 'Prozentsatz der Termine, die über digitale Kanäle gebucht werden.',
      whyItMatters: 'Digitale Buchungen sind kostengünstiger und rund um die Uhr verfügbar.',
      benchmark: '40-60%'
    }
  },
  socialMediaEngagementToLead: {
    en: {
      title: 'Social Media Engagement to Lead',
      definition: 'The conversion rate of social media engagements (likes, comments, shares, clicks) into qualified dealership leads.',
      executiveSummary: 'Social media is increasingly important for dealership marketing, but engagement without conversion is vanity metrics. Best-practice dealers convert 1-3% of social engagements into qualified leads through targeted content and clear CTAs.',
      whyItMatters: 'Measures the business value of social media investment. Without lead conversion tracking, social media spend cannot be justified against other channels.',
      formula: 'Social Engagement to Lead = (Leads from Social Media / Total Social Media Engagements) × 100',
      inclusions: ['All social platforms (Facebook, Instagram, TikTok, LinkedIn, YouTube)', 'Both organic and paid social'],
      exclusions: ['Bot engagements', 'Employee engagements', 'Unqualified contacts'],
      unitOfMeasure: 'Percentage (%)',
      benchmark: '1-3%',
      department: 'marketing-digital',
      rootCauseDiagnostics: {
        people: 'Social media managed by untrained staff, content not aligned with buying intent, poor response to social inquiries',
        process: 'No content strategy, posting without purpose, no lead capture process from social interactions, no response SLA',
        tools: 'No social media management platform, poor analytics, limited advertising targeting capabilities',
        structure: 'Social media as afterthought, no dedicated resource, not integrated with BDC/sales process',
        incentives: 'Social media success measured by follower count, not lead generation; no conversion targets'
      },
      improvementLevers: [
        'Develop content strategy aligned with customer purchase journey stages',
        'Include clear CTAs in every social post (link to inventory, booking, trade-in tool)',
        'Implement social media lead capture and routing to BDC',
        'Respond to all social inquiries within 30 minutes',
        'Use targeted social advertising to reach in-market audiences',
        'Track lead generation by platform and content type to optimize strategy'
      ],
      interdependencies: {
        upstreamDrivers: ['Content quality and relevance', 'Social ad targeting', 'Community management quality', 'Platform algorithm understanding'],
        downstreamImpacts: ['Cost per Lead (social channel)', 'Brand awareness', 'Website traffic', 'Customer acquisition cost', 'Online reputation']
      }
    },
    de: {
      title: 'Social-Media-Engagement zu Lead',
      definition: 'Konversionsrate von Social-Media-Interaktionen in qualifizierte Leads.',
      whyItMatters: 'Misst den Geschäftswert der Social-Media-Investition.',
      benchmark: '1-3%'
    }
  },
  marketingROI: {
    en: {
      title: 'Marketing ROI',
      definition: 'The return on investment for total marketing and advertising spend, calculated as the revenue or gross profit generated per euro invested in marketing.',
      executiveSummary: 'Marketing ROI is the ultimate accountability metric for marketing effectiveness. Best-practice dealers achieve 5:1 to 10:1 marketing ROI (€5-€10 gross profit for every €1 spent on marketing).',
      whyItMatters: 'Determines whether marketing spend is generating positive returns and how to allocate budget for maximum impact.',
      formula: 'Marketing ROI = (Gross Profit Attributed to Marketing − Marketing Cost) / Marketing Cost × 100',
      inclusions: ['All marketing and advertising expenditure', 'Revenue/gross profit attributed to marketing-generated leads'],
      exclusions: ['Organic/walk-in revenue (not marketing-generated)', 'Manufacturer co-op reimbursement (net out)'],
      unitOfMeasure: 'Ratio or Percentage',
      benchmark: '5:1 to 10:1',
      department: 'marketing-digital',
      rootCauseDiagnostics: {
        people: 'Marketing team not connected to revenue outcomes, poor analytical skills, agency not held to ROI standards',
        process: 'No attribution model, unable to connect marketing spend to sales outcomes, budget set without performance basis',
        tools: 'No marketing analytics platform, poor CRM integration, limited ability to track customer journey from ad to sale',
        structure: 'Marketing operates independently from sales, no feedback loop on lead quality, no shared metrics',
        incentives: 'Marketing measured on activity (campaigns run, impressions) rather than outcomes (leads, sales, ROI)'
      },
      improvementLevers: [
        'Implement multi-touch attribution model connecting marketing channels to sales',
        'Calculate ROI by channel and reallocate budget to highest-performing channels',
        'Set minimum ROI thresholds for continued spending on each channel',
        'Create shared marketing-sales dashboard with closed-loop reporting',
        'Test new channels with limited budgets before committing large spend',
        'Negotiate performance-based contracts with marketing vendors and agencies'
      ],
      interdependencies: {
        upstreamDrivers: ['Cost per Lead', 'Lead Conversion Rate', 'Channel mix effectiveness', 'Attribution model accuracy'],
        downstreamImpacts: ['Marketing budget allocation', 'Overall dealership profitability', 'Customer acquisition strategy', 'Growth investment capacity']
      }
    },
    de: {
      title: 'Marketing-ROI',
      definition: 'Return on Investment für Marketing- und Werbeausgaben.',
      whyItMatters: 'Bestimmt, ob Marketingausgaben positive Renditen generieren.',
      benchmark: '5:1 bis 10:1'
    }
  },
  paidVsOrganicLeadMix: {
    en: {
      title: 'Paid vs Organic Lead Mix',
      definition: 'The ratio of leads generated through paid advertising channels versus organic (non-paid) channels such as SEO, referrals, walk-ins, and direct traffic.',
      executiveSummary: 'A healthy lead mix balances paid acquisition (scalable but costly) with organic sources (free but harder to grow). Best-practice dealers maintain 40-50% organic leads, reducing dependency on paid channels and improving overall customer acquisition cost.',
      whyItMatters: 'Over-reliance on paid leads creates margin pressure and vulnerability to advertising cost increases. Building organic lead sources creates sustainable competitive advantage.',
      formula: 'Paid Lead % = (Paid Channel Leads / Total Leads) × 100; Organic Lead % = 100 − Paid Lead %',
      inclusions: ['All lead sources categorized as paid (PPC, display, social ads, third-party) or organic (SEO, referral, walk-in, direct)'],
      exclusions: ['Internal leads (lease maturities, equity mining)', 'Manufacturer-provided leads'],
      unitOfMeasure: 'Percentage (%)',
      benchmark: '50/50 to 40/60 paid/organic',
      department: 'marketing-digital',
      rootCauseDiagnostics: {
        people: 'Marketing team over-reliant on paid advertising, insufficient SEO/content skills, no referral program management',
        process: 'No organic growth strategy, poor SEO implementation, no referral program, no content marketing plan',
        tools: 'Poor website SEO foundation, no content management system, limited social media organic reach capabilities',
        structure: 'All marketing budget allocated to paid channels, no investment in organic growth, no resource for content creation',
        incentives: 'Marketing team rewarded for lead volume (easy to buy with paid) rather than lead cost (incentivizes organic growth)'
      },
      improvementLevers: [
        'Invest in SEO optimization to grow organic search traffic',
        'Develop content marketing strategy (blog, video, social) to attract organic leads',
        'Create structured referral program with incentives for customers and staff',
        'Build Google Business Profile with regular posts, photos, and review management',
        'Develop email marketing nurture programs for database leads',
        'Track lead source attribution to measure organic vs. paid trends over time'
      ],
      interdependencies: {
        upstreamDrivers: ['SEO investment and quality', 'Content marketing effort', 'Referral program effectiveness', 'Brand reputation and awareness'],
        downstreamImpacts: ['Cost per Lead (blended)', 'Marketing ROI', 'Customer acquisition cost sustainability', 'Marketing budget flexibility']
      }
    },
    de: {
      title: 'Bezahlter vs. organischer Lead-Mix',
      definition: 'Verhältnis der Leads aus bezahlten vs. organischen Kanälen.',
      whyItMatters: 'Überabhängigkeit von bezahlten Leads schafft Margendruck.',
      benchmark: '50/50 bis 40/60 bezahlt/organisch'
    }
  },

  // =====================================================
  // WORKFORCE & HR KPIs (74-80)
  // =====================================================
  employeeTurnoverRate: {
    en: {
      title: 'Employee Turnover Rate',
      definition: 'The percentage of total employees who voluntarily or involuntarily leave the organization within a 12-month period.',
      executiveSummary: 'Employee turnover is one of the most costly operational challenges in automotive retail. Each departing employee costs 50-200% of their annual salary in recruitment, training, and lost productivity. Best-practice dealers maintain below 30% annual turnover through competitive compensation, career development, and positive culture.',
      whyItMatters: 'High turnover disrupts customer relationships, increases training costs, reduces institutional knowledge, and lowers team morale.',
      formula: 'Employee Turnover Rate = (Number of Departures in 12 Months / Average Total Headcount) × 100',
      inclusions: ['All voluntary and involuntary terminations', 'All departments and positions'],
      exclusions: ['Internal transfers between departments', 'Seasonal/temporary workers', 'Retirements (track separately)'],
      unitOfMeasure: 'Percentage (%)',
      benchmark: '<30%',
      department: 'workforce-hr',
      rootCauseDiagnostics: {
        people: 'Poor management practices, toxic culture, lack of recognition, insufficient development opportunities',
        process: 'No structured onboarding, weak performance review process, no career pathing, poor work-life balance policies',
        tools: 'No employee engagement survey tools, limited HR analytics, poor communication platforms',
        structure: 'Flat organization with no advancement path, geographic/commute challenges, excessive hours expectations',
        incentives: 'Below-market compensation, unpredictable income, poor benefits, no retention bonuses for tenure'
      },
      improvementLevers: [
        'Conduct annual compensation benchmarking and adjust to market',
        'Implement structured career development plans for all positions',
        'Create employee engagement survey program with action on results',
        'Develop mentoring and buddy programs for new hires',
        'Establish recognition programs for tenure and performance',
        'Improve work-life balance through scheduling flexibility and reasonable hours',
        'Conduct exit interviews to identify and address root causes of departure'
      ],
      interdependencies: {
        upstreamDrivers: ['Compensation competitiveness', 'Management quality', 'Culture and work environment', 'Career development opportunities'],
        downstreamImpacts: ['Customer relationship continuity', 'Training costs', 'Institutional knowledge retention', 'Team productivity', 'CSI scores']
      }
    },
    de: {
      title: 'Mitarbeiter-Fluktuationsrate',
      definition: 'Prozentsatz der Gesamtbelegschaft, die innerhalb von 12 Monaten das Unternehmen verlässt.',
      whyItMatters: 'Hohe Fluktuation unterbricht Kundenbeziehungen und erhöht Schulungskosten.',
      benchmark: '<30%'
    }
  },
  salesStaffTurnover: {
    en: {
      title: 'Sales Staff Turnover',
      definition: 'The annual turnover rate specifically for sales department personnel, including sales executives, BDC staff, and sales managers.',
      executiveSummary: 'Sales staff turnover is particularly destructive because customers develop relationships with individual salespeople. Industry average is 67% annually — meaning the average sales team replaces two-thirds of its members every year. Top dealers retain 80%+ of sales staff.',
      whyItMatters: 'Each departing salesperson takes customer relationships, product knowledge, and pipeline with them. New salespeople take 6-12 months to reach full productivity.',
      formula: 'Sales Staff Turnover = (Number of Sales Staff Departures in 12 Months / Average Sales Headcount) × 100',
      inclusions: ['All sales department departures (voluntary and involuntary)'],
      exclusions: ['Transfers to other departments', 'Promotions within sales hierarchy'],
      unitOfMeasure: 'Percentage (%)',
      benchmark: '<25%',
      department: 'workforce-hr',
      rootCauseDiagnostics: {
        people: 'Poor sales management, inadequate training for new hires, unrealistic expectations, lack of coaching and mentoring',
        process: 'No structured onboarding program, "sink or swim" training approach, unclear performance expectations',
        tools: 'No sales enablement tools, poor CRM adoption, insufficient lead distribution systems',
        structure: 'Commission-only compensation creating financial instability, excessive hours, no career advancement path',
        incentives: 'Income unpredictability, unfair lead distribution, poor base salary, no loyalty incentives'
      },
      improvementLevers: [
        'Provide guaranteed base salary plus commission structure for income stability',
        'Create 90-day structured onboarding program with mentor assignment',
        'Implement fair and transparent lead distribution system',
        'Develop sales career path (junior → senior → management)',
        'Provide ongoing training and professional development opportunities',
        'Establish retention bonuses at 1-year, 3-year, and 5-year milestones',
        'Conduct quarterly stay interviews to identify and address concerns early'
      ],
      interdependencies: {
        upstreamDrivers: ['Compensation structure', 'Management quality', 'Training program effectiveness', 'Work environment and hours'],
        downstreamImpacts: ['Lead Conversion Rate', 'Repeat Purchase Rate', 'Customer relationship continuity', 'Training investment waste', 'Team morale']
      }
    },
    de: {
      title: 'Vertriebspersonal-Fluktuation',
      definition: 'Jährliche Fluktuationsrate speziell für Vertriebsmitarbeiter.',
      whyItMatters: 'Jeder abgehende Verkäufer nimmt Kundenbeziehungen und Pipeline mit.',
      benchmark: '<25%'
    }
  },
  technicianRetentionRate: {
    en: {
      title: 'Technician Retention Rate',
      definition: 'The percentage of certified technicians retained over a 12-month period.',
      executiveSummary: 'The automotive industry faces a severe technician shortage. Losing a skilled technician costs €30,000-€50,000 in recruitment, training, and lost productivity. Best-practice dealers retain 85%+ of technicians through competitive pay, modern facilities, and career development.',
      whyItMatters: 'Technician shortage is the #1 operational challenge for service departments. Retention is far cheaper than recruitment in a tight labor market.',
      formula: 'Technician Retention Rate = ((Technicians at Year Start − Departures) / Technicians at Year Start) × 100',
      inclusions: ['All certified and apprentice technicians'],
      exclusions: ['Retirements (track separately)', 'Temporary/seasonal workers'],
      unitOfMeasure: 'Percentage (%)',
      benchmark: '85%+',
      department: 'workforce-hr',
      rootCauseDiagnostics: {
        people: 'Poor service manager leadership, lack of recognition, limited career advancement, physical work conditions',
        process: 'No career development plan, insufficient training investment, outdated equipment frustrating technicians',
        tools: 'Outdated diagnostic and repair equipment, poor workshop conditions, inadequate personal tools program',
        structure: 'No clear advancement path from apprentice to master, limited specialization opportunities',
        incentives: 'Below-market pay, flat-rate system disadvantaging during slow periods, poor benefits, no tool allowance'
      },
      improvementLevers: [
        'Benchmark and adjust technician compensation annually to remain competitive',
        'Invest in modern diagnostic equipment and workshop conditions',
        'Create clear technician career path (apprentice → journeyman → master → specialist)',
        'Provide tool allowance or tool purchase program',
        'Offer sign-on bonuses and retention bonuses at tenure milestones',
        'Develop apprenticeship pipeline with local technical schools',
        'Conduct regular engagement surveys specific to technician satisfaction'
      ],
      interdependencies: {
        upstreamDrivers: ['Compensation competitiveness', 'Equipment and facility quality', 'Management quality', 'Career development opportunities', 'Work-life balance'],
        downstreamImpacts: ['Service department capacity', 'Technician Productivity', 'Repair quality', 'Customer wait times', 'Recruitment costs']
      }
    },
    de: {
      title: 'Techniker-Bindungsrate',
      definition: 'Prozentsatz der zertifizierten Techniker, die über einen 12-Monats-Zeitraum gehalten werden.',
      whyItMatters: 'Technikermangel ist die größte operative Herausforderung für Serviceabteilungen.',
      benchmark: '85%+'
    }
  },
  absenteeismRate: {
    en: {
      title: 'Absenteeism Rate',
      definition: 'The percentage of scheduled work days lost to unplanned absences (sick days, personal days, no-shows) across the dealership workforce.',
      executiveSummary: 'Unplanned absenteeism disrupts operations, overloads remaining staff, and reduces customer service quality. Best-practice dealers maintain absenteeism below 3% through positive work culture, reasonable scheduling, and attendance management programs.',
      whyItMatters: 'Each absent employee creates coverage gaps, overtime costs, and potential customer service failures. Chronic absenteeism is often a symptom of deeper engagement issues.',
      formula: 'Absenteeism Rate = (Unplanned Absent Days / Total Scheduled Work Days) × 100',
      inclusions: ['Unplanned sick days, personal days, no-shows, early departures'],
      exclusions: ['Approved vacation/PTO', 'Training days', 'Jury duty/bereavement leave'],
      unitOfMeasure: 'Percentage (%)',
      benchmark: '<3%',
      department: 'workforce-hr',
      rootCauseDiagnostics: {
        people: 'Low morale and engagement, burnout from excessive hours, personal issues, management relationship problems',
        process: 'No absence tracking system, inconsistent attendance policies, no return-to-work process, no wellness program',
        tools: 'Manual attendance tracking, no automated alerts for patterns, poor scheduling software',
        structure: 'Excessive shift length, weekend/holiday requirements without adequate rotation, no flexibility options',
        incentives: 'No attendance bonus, no consequence for chronic absenteeism, sick day policy encouraging misuse'
      },
      improvementLevers: [
        'Implement attendance tracking system with pattern analysis',
        'Create attendance incentive program (perfect attendance bonus)',
        'Address root causes through employee engagement and wellness programs',
        'Establish clear attendance policy with progressive discipline',
        'Offer flexible scheduling where possible to improve work-life balance',
        'Train managers on having supportive conversations with frequently absent employees'
      ],
      interdependencies: {
        upstreamDrivers: ['Employee engagement and morale', 'Work-life balance', 'Management quality', 'Workplace culture', 'Compensation satisfaction'],
        downstreamImpacts: ['Service capacity', 'Customer wait times', 'Overtime costs', 'Team morale (overloaded colleagues)', 'Overall productivity']
      }
    },
    de: {
      title: 'Abwesenheitsrate',
      definition: 'Prozentsatz der geplanten Arbeitstage, die durch ungeplante Abwesenheiten verloren gehen.',
      whyItMatters: 'Ungeplante Abwesenheit stört den Betrieb und überlastet verbleibende Mitarbeiter.',
      benchmark: '<3%'
    }
  },
  trainingHoursPerEmployee: {
    en: {
      title: 'Training Hours per Employee',
      definition: 'The average number of formal training hours invested per employee per year, including both internal and external training programs.',
      executiveSummary: 'Training investment directly correlates with employee performance, retention, and customer satisfaction. Best-practice dealers invest 40-60 hours per employee per year in structured training. Under-investment leads to skill gaps, lower productivity, and higher turnover.',
      whyItMatters: 'Continuous skill development drives performance improvement across all departments. OEM certification requirements also mandate minimum training levels.',
      formula: 'Training Hours per Employee = Total Training Hours Delivered / Total Number of Employees',
      inclusions: ['All formal training: classroom, online, workshops, OEM programs, certifications'],
      exclusions: ['Informal on-the-job learning', 'Self-directed reading', 'Meeting attendance without training content'],
      unitOfMeasure: 'Hours/Year',
      benchmark: '40-60 hours/year',
      department: 'workforce-hr',
      rootCauseDiagnostics: {
        people: 'Employees resistant to training, managers not releasing staff for training, no training champion/coordinator',
        process: 'No annual training plan, reactive training only, no skills gap analysis driving training priorities',
        tools: 'No learning management system, limited online training access, poor tracking of completed training',
        structure: 'No training budget, no dedicated training facility/room, production demands preventing training time',
        incentives: 'No recognition for completing training, no link between certifications and pay, no training requirements for advancement'
      },
      improvementLevers: [
        'Create annual training plan based on skills gap analysis and department needs',
        'Implement learning management system for tracking and delivery',
        'Allocate dedicated training budget (minimum 1-2% of payroll)',
        'Schedule regular training blocks that are protected from operational demands',
        'Link training completion and certifications to career advancement and pay',
        'Leverage OEM-provided training programs and online platforms',
        'Create peer learning and mentoring programs to supplement formal training'
      ],
      interdependencies: {
        upstreamDrivers: ['Training budget allocation', 'Management commitment to development', 'Available training resources', 'Employee willingness to learn'],
        downstreamImpacts: ['Employee performance metrics', 'Customer satisfaction', 'Employee retention', 'OEM certification compliance', 'Service quality']
      }
    },
    de: {
      title: 'Schulungsstunden pro Mitarbeiter',
      definition: 'Durchschnittliche Anzahl formaler Schulungsstunden pro Mitarbeiter pro Jahr.',
      whyItMatters: 'Kontinuierliche Kompetenzentwicklung treibt Leistungsverbesserung in allen Abteilungen.',
      benchmark: '40-60 Stunden/Jahr'
    }
  },
  revenuePerEmployee: {
    en: {
      title: 'Revenue per Employee',
      definition: 'Total dealership revenue divided by the total number of full-time equivalent employees.',
      executiveSummary: 'Revenue per employee is the primary workforce productivity metric, measuring how effectively human capital is deployed to generate revenue. Best-practice dealers generate €300,000-€500,000 per employee per year.',
      whyItMatters: 'Indicates overall organizational efficiency and staffing optimization. Low revenue per employee suggests overstaffing or underperformance.',
      formula: 'Revenue per Employee = Total Dealership Revenue / Number of Full-Time Equivalent Employees',
      inclusions: ['All revenue sources (vehicle sales, service, parts, F&I)', 'All FTE employees (including part-time converted to FTE)'],
      exclusions: ['Outsourced/contracted workers', 'Temporary staff'],
      unitOfMeasure: 'Currency (€/year)',
      benchmark: '€300,000-€500,000/year',
      department: 'workforce-hr',
      rootCauseDiagnostics: {
        people: 'Underperforming employees, skill gaps limiting productivity, excess management layers',
        process: 'Inefficient workflows requiring more staff, manual processes that could be automated, poor resource allocation',
        tools: 'Insufficient automation, outdated systems requiring manual workarounds, poor technology adoption',
        structure: 'Overstaffed departments, duplicate roles across functions, inefficient organizational design',
        incentives: 'No productivity targets at individual or team level, no consequence for underperformance'
      },
      improvementLevers: [
        'Benchmark staffing ratios against industry standards and peer dealerships',
        'Identify and automate manual processes to reduce headcount needs',
        'Implement productivity targets by department and role',
        'Cross-train employees to handle multiple functions during low-demand periods',
        'Review organizational structure for redundancies and inefficiencies',
        'Set revenue-per-employee targets with quarterly tracking'
      ],
      interdependencies: {
        upstreamDrivers: ['Total dealership revenue', 'Headcount optimization', 'Process efficiency', 'Technology adoption', 'Employee productivity'],
        downstreamImpacts: ['Dealership profitability', 'Compensation capacity', 'Competitive positioning', 'Investment capacity']
      }
    },
    de: {
      title: 'Umsatz pro Mitarbeiter',
      definition: 'Gesamtumsatz des Autohauses geteilt durch die Anzahl der Vollzeitäquivalente.',
      whyItMatters: 'Zeigt die organisatorische Gesamteffizienz und Personaloptimierung an.',
      benchmark: '€300.000-€500.000/Jahr'
    }
  },
  salesPerHeadcount: {
    en: {
      title: 'Sales per Headcount',
      definition: 'The total number of vehicles sold divided by the total dealership headcount, measuring how efficiently the entire organization supports vehicle sales.',
      executiveSummary: 'Sales per headcount reveals organizational efficiency in converting human capital into sales output. Best-practice dealers achieve 15-25 units per total employee per year, reflecting lean operations and effective support structures.',
      whyItMatters: 'Holistic efficiency metric revealing whether the organization is right-sized for its sales volume. Lower ratios suggest operational bloat.',
      formula: 'Sales per Headcount = Total Vehicles Sold / Total Number of Employees (FTE)',
      inclusions: ['All new and used vehicle retail sales', 'All FTE employees across all departments'],
      exclusions: ['Wholesale units', 'Fleet deliveries not requiring full sales process'],
      unitOfMeasure: 'Units/Employee/Year',
      benchmark: '15-25 units/employee/year',
      department: 'workforce-hr',
      rootCauseDiagnostics: {
        people: 'Underperforming sales team, excessive support staff, poor cross-departmental collaboration',
        process: 'Inefficient sales process requiring excess support, manual processes in F&I and delivery, poor lead management',
        tools: 'Limited automation in documentation, manual data entry consuming staff time, poor CRM efficiency',
        structure: 'Too many organizational layers, support functions overstaffed relative to volume, poor span of control',
        incentives: 'No organizational-level efficiency targets, department budgets not tied to sales volume'
      },
      improvementLevers: [
        'Streamline sales process to reduce support staffing requirements',
        'Implement technology solutions to automate administrative tasks',
        'Cross-train employees for multi-role capability',
        'Benchmark total headcount against peer dealerships at similar volume',
        'Align departmental staffing budgets to sales volume targets',
        'Track units-per-employee quarterly with improvement targets'
      ],
      interdependencies: {
        upstreamDrivers: ['Total sales volume', 'Organizational efficiency', 'Process automation level', 'Staffing optimization'],
        downstreamImpacts: ['Per-employee compensation capacity', 'Dealership profitability', 'Competitive cost structure', 'Operational scalability']
      }
    },
    de: {
      title: 'Verkäufe pro Mitarbeiterzahl',
      definition: 'Gesamtanzahl verkaufter Fahrzeuge geteilt durch die Gesamtbelegschaft.',
      whyItMatters: 'Zeigt, ob die Organisation für ihr Verkaufsvolumen richtig dimensioniert ist.',
      benchmark: '15-25 Einheiten/Mitarbeiter/Jahr'
    }
  },

  // =====================================================
  // LEGACY / SHALLOW KPIs (existing entries below)
  // =====================================================
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
