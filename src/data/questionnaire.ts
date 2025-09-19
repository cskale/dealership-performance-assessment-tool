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
}

export interface Section {
  id: string;
  title: string;
  description: string;
  icon: string;
  questions: Question[];
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
      questions: [
        {
          id: "nvs-1",
          text: "What is your average monthly new vehicle sales volume?",
          description: "Consider your last 12 months performance",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["<20 units", "21-50 units", "51-100 units", "101-200 units", ">200 units"] },
          weight: 1.2,
          category: "volume",
          purpose: "Measures your dealership's scale and market presence in new vehicle sales, which directly correlates with revenue potential and operational efficiency.",
          situationAnalysis: "Higher volume indicates stronger market position, better inventory management, and more consistent customer flow. It helps identify if you're maximizing your market opportunity.",
          linkedKPIs: ["Monthly Revenue", "Market Share", "Sales Growth Rate", "Inventory Turnover"],
          benefits: "Optimizing sales volume leads to better economies of scale, stronger manufacturer relationships, increased negotiating power, and higher overall profitability."
        },
        {
          id: "nvs-2",
          text: "How would you rate your sales team's closing ratio?",
          description: "Percentage of leads that convert to sales",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["<10%", "10-15%", "16-20%", "21-25%", ">25%"] },
          weight: 1.5,
          category: "conversion",
          purpose: "Evaluates sales team effectiveness and the quality of your sales process from lead generation to final purchase decision.",
          situationAnalysis: "Low closing ratios indicate potential issues in sales training, lead quality, pricing strategy, or customer experience that need immediate attention.",
          linkedKPIs: ["Lead Conversion Rate", "Sales Efficiency", "Cost Per Acquisition", "Revenue Per Lead"],
          benefits: "Improving closing ratios directly increases revenue without additional marketing spend, reduces customer acquisition costs, and maximizes the ROI of your lead generation efforts."
        },
        {
          id: "nvs-3",
          text: "Customer satisfaction score for new vehicle sales process",
          description: "Based on customer surveys and feedback",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["Poor (1-2)", "Fair (3-4)", "Good (5-6)", "Very Good (7-8)", "Excellent (9-10)"] },
          weight: 1.3,
          category: "satisfaction",
          purpose: "Measures customer experience quality during the sales process, which directly impacts repeat business, referrals, and brand reputation.",
          situationAnalysis: "Customer satisfaction is a leading indicator of future sales performance, customer loyalty, and word-of-mouth marketing effectiveness.",
          linkedKPIs: ["Net Promoter Score", "Customer Retention Rate", "Referral Rate", "Online Review Ratings"],
          benefits: "High customer satisfaction leads to increased referrals, repeat customers, positive online reviews, and reduced marketing costs through organic growth."
        },
        {
          id: "nvs-4",
          text: "Average gross profit per new vehicle sold",
          description: "Profit margin analysis",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["<$1,000", "$1,000-$2,000", "$2,000-$3,500", "$3,500-$5,000", ">$5,000"] },
          weight: 1.4,
          category: "profitability",
          purpose: "Assesses pricing strategy effectiveness and negotiation skills, directly impacting dealership profitability and financial sustainability.",
          situationAnalysis: "Profit margins indicate your competitive positioning, pricing power, and ability to add value during the sales process.",
          linkedKPIs: ["Gross Profit Margin", "Price Realization", "Discount Rate", "Profitability Per Unit"],
          benefits: "Optimizing gross profit per unit significantly improves overall dealership profitability, cash flow, and ability to invest in growth initiatives."
        },
        {
          id: "nvs-5",
          text: "Time from customer inquiry to delivery",
          description: "Average delivery time for new vehicles",
          type: "scale",
          scale: { min: 1, max: 5, labels: [">30 days", "21-30 days", "14-20 days", "7-13 days", "<7 days"] },
          weight: 1.1,
          category: "efficiency",
          purpose: "Evaluates process efficiency and customer experience quality, impacting customer satisfaction and competitive advantage.",
          situationAnalysis: "Faster delivery times improve customer satisfaction, reduce deal fallout, and enhance competitive positioning in the market.",
          linkedKPIs: ["Cycle Time", "Process Efficiency", "Customer Wait Time", "Deal Completion Rate"],
          benefits: "Reducing delivery time increases customer satisfaction, reduces cancellations, improves cash flow, and creates competitive differentiation."
        },
        {
          id: "nvs-6",
          text: "Digital lead conversion rate",
          description: "Online leads converting to showroom visits",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["<5%", "5-10%", "11-15%", "16-20%", ">20%"] },
          weight: 1.2,
          category: "digital",
          purpose: "Measures the effectiveness of your digital marketing strategy and online customer engagement capabilities.",
          situationAnalysis: "Digital lead conversion indicates how well your online presence and digital sales funnel are performing in today's digital-first marketplace.",
          linkedKPIs: ["Digital Marketing ROI", "Online Lead Quality", "Website Conversion Rate", "Digital Channel Performance"],
          benefits: "Improving digital conversion reduces marketing costs, increases lead quality, and positions you ahead of competitors in the digital space."
        },
        {
          id: "nvs-7",
          text: "Sales team training frequency",
          description: "Regular training and skill development",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["Rarely", "Annually", "Bi-annually", "Quarterly", "Monthly"] },
          weight: 1.0,
          category: "training",
          purpose: "Assesses investment in team development and continuous improvement, which directly correlates with sales performance and customer satisfaction.",
          situationAnalysis: "Regular training ensures your team stays updated with product knowledge, sales techniques, and industry best practices.",
          linkedKPIs: ["Sales Performance", "Employee Retention", "Skill Development Index", "Training ROI"],
          benefits: "Consistent training improves sales results, reduces staff turnover, enhances customer experience, and builds long-term competitive advantage."
        },
        {
          id: "nvs-8",
          text: "Inventory turnover rate",
          description: "How quickly new vehicle inventory moves",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["<6 times/year", "6-8 times/year", "9-11 times/year", "12-15 times/year", ">15 times/year"] },
          weight: 1.3,
          category: "inventory",
          purpose: "Measures inventory management efficiency and demand forecasting accuracy, directly impacting cash flow and carrying costs.",
          situationAnalysis: "Fast inventory turnover indicates good demand planning, effective pricing, and strong sales execution.",
          linkedKPIs: ["Inventory Days Supply", "Carrying Costs", "Cash Flow", "Working Capital Efficiency"],
          benefits: "Optimizing inventory turnover improves cash flow, reduces interest expenses, minimizes obsolescence risk, and increases profitability."
        },
        {
          id: "nvs-9",
          text: "Finance & Insurance penetration rate",
          description: "Percentage of customers who purchase F&I products",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["<40%", "40-55%", "56-70%", "71-85%", ">85%"] },
          weight: 1.2,
          category: "financial",
          purpose: "Evaluates the effectiveness of your F&I department in adding value and generating additional revenue per transaction.",
          situationAnalysis: "High F&I penetration indicates strong customer relationship building and effective product presentation skills.",
          linkedKPIs: ["F&I Revenue Per Unit", "Product Penetration Rate", "Customer Protection Rate", "Profit Per Deal"],
          benefits: "Increasing F&I penetration significantly boosts per-unit profitability, enhances customer protection, and creates recurring revenue streams."
        },
        {
          id: "nvs-10",
          text: "CRM system utilization effectiveness",
          description: "How well your team uses CRM for lead management",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["Poor", "Fair", "Good", "Very Good", "Excellent"] },
          weight: 1.1,
          category: "technology",
          purpose: "Assesses your team's ability to leverage technology for customer relationship management and sales process optimization.",
          situationAnalysis: "Effective CRM usage indicates systematic approach to customer management, improved follow-up processes, and data-driven decision making.",
          linkedKPIs: ["Lead Management Efficiency", "Follow-up Rate", "Customer Data Quality", "Sales Process Consistency"],
          benefits: "Better CRM utilization improves lead conversion, enhances customer relationships, increases repeat business, and provides valuable insights for growth."
        }
      ]
    },
    {
      id: "used-vehicle-sales",
      title: "Used Vehicle Sales Performance",
      description: "Assess your used vehicle operations, pricing strategies, and market positioning",
      icon: "car",
      questions: [
        {
          id: "uvs-1",
          text: "Used vehicle inventory turnover rate",
          description: "Average days to sell used vehicles",
          type: "scale",
          scale: { min: 1, max: 5, labels: [">60 days", "46-60 days", "31-45 days", "21-30 days", "<21 days"] },
          weight: 1.4,
          category: "turnover",
          purpose: "Measures the efficiency of your used vehicle operations and pricing strategy, directly impacting profitability and cash flow.",
          situationAnalysis: "Fast turnover indicates effective market pricing, good vehicle selection, and strong sales execution in the used vehicle market.",
          linkedKPIs: ["Days in Inventory", "Carrying Costs", "Interest Expense", "Market Share"],
          benefits: "Faster turnover reduces carrying costs, improves cash flow, minimizes depreciation losses, and increases inventory ROI."
        },
        {
          id: "uvs-2",
          text: "Used vehicle gross profit margins",
          description: "Average profit per used vehicle",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["<$1,500", "$1,500-$2,500", "$2,500-$3,500", "$3,500-$4,500", ">$4,500"] },
          weight: 1.5,
          category: "profitability",
          purpose: "Evaluates pricing strategy effectiveness and market positioning for used vehicles, crucial for overall dealership profitability.",
          situationAnalysis: "Higher margins indicate strong appraisal skills, effective reconditioning processes, and successful value proposition communication.",
          linkedKPIs: ["Gross Profit Per Unit", "Margin Percentage", "Price Realization", "Competitive Positioning"],
          benefits: "Optimizing used vehicle margins significantly improves dealership profitability and provides flexibility for competitive pricing strategies."
        },
        {
          id: "uvs-3",
          text: "Trade-in appraisal accuracy",
          description: "Accuracy of initial trade valuations vs final selling price",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["<70%", "70-75%", "76-80%", "81-85%", ">85%"] },
          weight: 1.2,
          category: "accuracy",
          purpose: "Measures the effectiveness of your appraisal process and market knowledge, impacting both acquisition costs and profitability.",
          situationAnalysis: "Accurate appraisals indicate strong market knowledge, effective valuation tools, and experienced appraisal staff.",
          linkedKPIs: ["Appraisal Accuracy Rate", "Acquisition Cost Variance", "Profit Margin Consistency", "Market Value Alignment"],
          benefits: "Improved appraisal accuracy reduces financial risk, enhances customer satisfaction, and increases predictable profit margins."
        },
        {
          id: "uvs-4",
          text: "Reconditioning cost control",
          description: "Average reconditioning cost per used vehicle",
          type: "scale",
          scale: { min: 1, max: 5, labels: [">$2,000", "$1,500-$2,000", "$1,000-$1,499", "$500-$999", "<$500"] },
          weight: 1.3,
          category: "costs",
          purpose: "Evaluates operational efficiency in vehicle preparation and cost management, directly affecting unit profitability.",
          situationAnalysis: "Lower reconditioning costs indicate efficient processes, good vendor relationships, and effective quality control.",
          linkedKPIs: ["Reconditioning Cost Per Unit", "Time to Market", "Quality Standards", "Vendor Performance"],
          benefits: "Controlling reconditioning costs improves margins, reduces time to sale, and enhances overall operational efficiency."
        },
        {
          id: "uvs-5",
          text: "Online listing optimization",
          description: "Quality and effectiveness of online vehicle listings",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["Poor", "Fair", "Good", "Very Good", "Excellent"] },
          weight: 1.1,
          category: "digital",
          purpose: "Assesses digital marketing effectiveness for used vehicles, crucial in today's online-driven car shopping environment.",
          situationAnalysis: "Quality online listings drive more qualified leads, reduce time to sale, and improve competitive positioning.",
          linkedKPIs: ["Online Lead Generation", "Listing View Rate", "Inquiry Conversion", "Digital Market Penetration"],
          benefits: "Optimized online listings increase visibility, attract more qualified buyers, and accelerate sales velocity."
        },
        {
          id: "uvs-6",
          text: "Auction purchase success rate",
          description: "Profitable vehicles purchased from auctions",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["<60%", "60-70%", "71-80%", "81-90%", ">90%"] },
          weight: 1.2,
          category: "sourcing",
          purpose: "Measures procurement efficiency and market knowledge in wholesale acquisition, affecting inventory quality and profitability.",
          situationAnalysis: "High success rates indicate strong market knowledge, disciplined buying practices, and effective inventory planning.",
          linkedKPIs: ["Acquisition Success Rate", "Purchase Cost Accuracy", "Inventory Quality", "Sourcing Efficiency"],
          benefits: "Improved auction success reduces acquisition risks, ensures quality inventory, and maintains consistent profit margins."
        },
        {
          id: "uvs-7",
          text: "Customer satisfaction with used vehicle purchases",
          description: "Post-purchase satisfaction scores",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["Poor (1-2)", "Fair (3-4)", "Good (5-6)", "Very Good (7-8)", "Excellent (9-10)"] },
          weight: 1.3,
          category: "satisfaction",
          purpose: "Evaluates customer experience quality for used vehicle sales, impacting reputation, referrals, and repeat business.",
          situationAnalysis: "High satisfaction in used vehicle sales builds trust, generates referrals, and establishes long-term customer relationships.",
          linkedKPIs: ["Customer Satisfaction Score", "Repeat Customer Rate", "Referral Rate", "Online Review Ratings"],
          benefits: "Excellent customer satisfaction drives organic growth through referrals, improves online reputation, and increases customer lifetime value."
        },
        {
          id: "uvs-8",
          text: "Warranty and service contract penetration",
          description: "Extended warranty sales on used vehicles",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["<20%", "20-35%", "36-50%", "51-65%", ">65%"] },
          weight: 1.1,
          category: "penetration",
          purpose: "Measures ability to add value and generate additional revenue while providing customer protection on used vehicle sales.",
          situationAnalysis: "Higher penetration rates indicate effective value communication and strong customer relationship building.",
          linkedKPIs: ["Product Penetration Rate", "Revenue Per Unit", "Customer Protection Rate", "Profit Margin Enhancement"],
          benefits: "Increased warranty penetration boosts profitability, enhances customer confidence, and creates additional revenue streams."
        },
        {
          id: "uvs-9",
          text: "Vehicle pricing competitiveness",
          description: "Pricing compared to market competition",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["Above market", "Slightly above", "At market", "Slightly below", "Below market"] },
          weight: 1.2,
          category: "pricing",
          purpose: "Evaluates market positioning and pricing strategy effectiveness in the competitive used vehicle marketplace.",
          situationAnalysis: "Competitive pricing ensures market relevance while maintaining profitability and sales velocity.",
          linkedKPIs: ["Price Competitiveness Index", "Market Position", "Sales Velocity", "Profit Margin"],
          benefits: "Optimal pricing balances profitability with competitiveness, maximizing both sales volume and unit profits."
        },
        {
          id: "uvs-10",
          text: "Aged inventory management",
          description: "Strategy for vehicles over 60 days in inventory",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["No strategy", "Reactive", "Basic plan", "Good plan", "Excellent plan"] },
          weight: 1.3,
          category: "inventory",
          purpose: "Assesses risk management and inventory optimization strategies, crucial for maintaining healthy cash flow and profitability.",
          situationAnalysis: "Effective aged inventory management prevents excessive carrying costs and minimizes depreciation losses.",
          linkedKPIs: ["Aged Inventory Percentage", "Carrying Cost Management", "Loss Prevention", "Cash Flow Optimization"],
          benefits: "Proactive aged inventory management reduces financial risk, improves cash flow, and maintains inventory freshness."
        }
      ]
    },
    {
      id: "service-performance",
      title: "Service Performance",
      description: "Evaluate your service department efficiency, customer satisfaction, and profitability",
      icon: "wrench",
      questions: [
        {
          id: "svc-1",
          text: "Service department labor efficiency",
          description: "Percentage of productive labor hours",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["<60%", "60-70%", "71-80%", "81-90%", ">90%"] },
          weight: 1.5,
          category: "efficiency",
          purpose: "Measures how effectively your service department utilizes technician time, directly impacting profitability and customer satisfaction.",
          situationAnalysis: "Higher efficiency indicates better workflow management, adequate staffing, and optimized processes.",
          linkedKPIs: ["Labor Utilization Rate", "Productive Hours", "Technician Efficiency", "Revenue Per Hour"],
          benefits: "Improved labor efficiency increases profitability, reduces customer wait times, and maximizes revenue potential from existing resources."
        },
        {
          id: "svc-2",
          text: "Customer pay labor rate utilization",
          description: "Effective labor rate compared to posted rate",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["<80%", "80-85%", "86-90%", "91-95%", ">95%"] },
          weight: 1.4,
          category: "pricing",
          purpose: "Evaluates pricing strategy effectiveness and market positioning for service labor, crucial for service department profitability.",
          situationAnalysis: "High rate utilization indicates strong value proposition, competitive pricing, and effective customer communication.",
          linkedKPIs: ["Effective Labor Rate", "Price Realization", "Service Revenue", "Profit Margin"],
          benefits: "Maximizing labor rate utilization significantly improves service department profitability and competitive positioning."
        },
        {
          id: "svc-3",
          text: "Service appointment availability",
          description: "Average wait time for service appointments",
          type: "scale",
          scale: { min: 1, max: 5, labels: [">14 days", "8-14 days", "4-7 days", "2-3 days", "Same/next day"] },
          weight: 1.3,
          category: "availability",
          purpose: "Measures customer convenience and operational capacity, directly affecting customer satisfaction and retention.",
          situationAnalysis: "Short wait times indicate optimal capacity management and strong operational efficiency.",
          linkedKPIs: ["Appointment Lead Time", "Capacity Utilization", "Customer Convenience", "Service Accessibility"],
          benefits: "Better appointment availability improves customer satisfaction, increases service retention, and enhances competitive advantage."
        },
        {
          id: "svc-4",
          text: "First-time fix rate",
          description: "Percentage of repairs completed correctly first time",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["<75%", "75-80%", "81-85%", "86-92%", ">92%"] },
          weight: 1.4,
          category: "quality",
          purpose: "Evaluates service quality and diagnostic accuracy, impacting customer trust, efficiency, and profitability.",
          situationAnalysis: "High first-time fix rates indicate skilled technicians, proper diagnostic procedures, and quality parts.",
          linkedKPIs: ["Quality Index", "Rework Rate", "Customer Satisfaction", "Diagnostic Accuracy"],
          benefits: "Improving first-time fix rates enhances customer trust, reduces costs, increases efficiency, and builds long-term loyalty."
        },
        {
          id: "svc-5",
          text: "Service customer satisfaction scores",
          description: "Overall service experience rating",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["Poor (1-2)", "Fair (3-4)", "Good (5-6)", "Very Good (7-8)", "Excellent (9-10)"] },
          weight: 1.5,
          category: "satisfaction",
          purpose: "Measures overall service experience quality, crucial for customer retention and referral generation.",
          situationAnalysis: "High satisfaction scores indicate excellent customer experience, quality work, and effective communication.",
          linkedKPIs: ["Net Promoter Score", "Customer Retention Rate", "Referral Rate", "Service Loyalty"],
          benefits: "Excellent service satisfaction drives customer loyalty, generates referrals, and creates sustainable competitive advantage."
        },
        {
          id: "svc-6",
          text: "Warranty recovery rate",
          description: "Percentage of warranty claims successfully recovered",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["<85%", "85-90%", "91-94%", "95-97%", ">97%"] },
          weight: 1.2,
          category: "warranty",
          purpose: "Evaluates administrative efficiency and process compliance, directly impacting service department profitability.",
          situationAnalysis: "High recovery rates indicate proper documentation, process compliance, and effective manufacturer relationships.",
          linkedKPIs: ["Warranty Recovery Rate", "Process Compliance", "Administrative Efficiency", "Profit Recovery"],
          benefits: "Maximizing warranty recovery improves profitability, ensures proper compensation for work performed, and maintains cash flow."
        },
        {
          id: "svc-7",
          text: "Technician certification levels",
          description: "Percentage of ASE certified technicians",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["<50%", "50-65%", "66-80%", "81-90%", ">90%"] },
          weight: 1.1,
          category: "certification",
          purpose: "Assesses technical competency and professional development investment, impacting service quality and customer confidence.",
          situationAnalysis: "Higher certification levels indicate investment in training, technical competency, and professional standards.",
          linkedKPIs: ["Certification Rate", "Technical Competency", "Training Investment", "Service Quality"],
          benefits: "Higher certification levels improve service quality, enhance customer confidence, and support premium pricing strategies."
        },
        {
          id: "svc-8",
          text: "Service retention rate",
          description: "Customers returning for service within 12 months",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["<40%", "40-50%", "51-60%", "61-70%", ">70%"] },
          weight: 1.3,
          category: "retention",
          purpose: "Measures customer loyalty and service experience quality, crucial for long-term revenue and profitability.",
          situationAnalysis: "High retention rates indicate satisfied customers, quality service, and effective customer relationship management.",
          linkedKPIs: ["Customer Retention Rate", "Service Loyalty", "Repeat Business", "Customer Lifetime Value"],
          benefits: "Strong service retention creates predictable revenue, reduces marketing costs, and builds sustainable business growth."
        },
        {
          id: "svc-9",
          text: "Parts availability for service",
          description: "Percentage of parts available when needed",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["<85%", "85-90%", "91-94%", "95-97%", ">97%"] },
          weight: 1.2,
          category: "parts",
          purpose: "Evaluates inventory management effectiveness and customer convenience, impacting service efficiency and satisfaction.",
          situationAnalysis: "High parts availability indicates effective inventory planning, supplier relationships, and demand forecasting.",
          linkedKPIs: ["Parts Fill Rate", "Service Efficiency", "Customer Wait Time", "Inventory Management"],
          benefits: "Better parts availability improves service efficiency, reduces customer wait times, and enhances overall satisfaction."
        },
        {
          id: "svc-10",
          text: "Digital service communication",
          description: "Use of digital tools for customer updates",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["None", "Basic", "Good", "Very Good", "Excellent"] },
          weight: 1.0,
          category: "digital",
          purpose: "Assesses adoption of modern communication tools, enhancing customer experience and operational efficiency.",
          situationAnalysis: "Digital communication tools improve customer experience, reduce phone calls, and enhance transparency.",
          linkedKPIs: ["Digital Adoption Rate", "Customer Communication", "Process Efficiency", "Customer Experience"],
          benefits: "Digital communication improves customer experience, increases efficiency, and differentiates your service offering."
        },
        {
          id: "svc-11",
          text: "Service advisor productivity",
          description: "Average repair orders per advisor per day",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["<8 ROs", "8-10 ROs", "11-13 ROs", "14-16 ROs", ">16 ROs"] },
          weight: 1.3,
          category: "productivity",
          purpose: "Measures front-end efficiency and customer handling capacity, directly impacting service department revenue.",
          situationAnalysis: "Higher productivity indicates efficient processes, good training, and effective customer management systems.",
          linkedKPIs: ["Advisor Productivity", "Service Capacity", "Revenue Per Advisor", "Customer Throughput"],
          benefits: "Improved advisor productivity increases revenue capacity, reduces wait times, and maximizes staff efficiency."
        },
        {
          id: "svc-12",
          text: "Express service efficiency",
          description: "Quick service lane utilization and throughput",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["Poor", "Fair", "Good", "Very Good", "Excellent"] },
          weight: 1.1,
          category: "express",
          purpose: "Evaluates quick service operations efficiency, important for customer convenience and service department productivity.",
          situationAnalysis: "Efficient express service improves customer convenience, increases throughput, and enhances competitive positioning.",
          linkedKPIs: ["Express Service Volume", "Customer Convenience", "Service Speed", "Operational Efficiency"],
          benefits: "Optimized express service increases customer satisfaction, improves efficiency, and captures more quick-turn business."
        }
      ]
    },
    {
      id: "parts-inventory",
      title: "Parts and Inventory Performance",
      description: "Analyze your parts department efficiency, inventory management, and profitability",
      icon: "package",
      questions: [
        {
          id: "pts-1",
          text: "Parts inventory turnover rate",
          description: "Number of times inventory turns per year",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["<4 times", "4-5 times", "6-7 times", "8-10 times", ">10 times"] },
          weight: 1.5,
          category: "turnover",
          purpose: "Measures inventory management efficiency and demand forecasting accuracy, directly impacting cash flow and profitability.",
          situationAnalysis: "Higher turnover indicates effective inventory management, better cash utilization, and reduced carrying costs.",
          linkedKPIs: ["Inventory Turnover Rate", "Cash Flow", "Carrying Costs", "Working Capital Efficiency"],
          benefits: "Faster inventory turnover improves cash flow, reduces carrying costs, and maximizes return on inventory investment."
        },
        {
          id: "pts-2",
          text: "Parts fill rate",
          description: "Percentage of parts requests filled from stock",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["<80%", "80-85%", "86-90%", "91-95%", ">95%"] },
          weight: 1.4,
          category: "availability",
          purpose: "Evaluates inventory planning effectiveness and customer service capability, impacting service efficiency and satisfaction.",
          situationAnalysis: "High fill rates indicate effective demand planning, appropriate stock levels, and good supplier relationships.",
          linkedKPIs: ["Parts Availability", "Service Efficiency", "Customer Satisfaction", "Stock-out Rate"],
          benefits: "Higher fill rates improve service efficiency, enhance customer satisfaction, and reduce service completion delays."
        },
        {
          id: "pts-3",
          text: "Parts gross profit margin",
          description: "Average profit margin on parts sales",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["<25%", "25-30%", "31-35%", "36-40%", ">40%"] },
          weight: 1.5,
          category: "profitability",
          purpose: "Evaluates pricing strategy effectiveness and market positioning for parts, crucial for parts department profitability.",
          situationAnalysis: "Higher margins indicate effective pricing strategies, good supplier negotiations, and strong market positioning.",
          linkedKPIs: ["Gross Profit Margin", "Price Realization", "Competitive Position", "Parts Revenue"],
          benefits: "Optimizing parts margins significantly improves department profitability and overall dealership financial performance."
        },
        {
          id: "pts-4",
          text: "Obsolete parts percentage",
          description: "Percentage of inventory considered obsolete",
          type: "scale",
          scale: { min: 1, max: 5, labels: [">15%", "11-15%", "6-10%", "3-5%", "<3%"] },
          weight: 1.3,
          category: "obsolete",
          purpose: "Measures inventory management effectiveness and risk control, impacting profitability and cash flow.",
          situationAnalysis: "Lower obsolete percentages indicate effective demand planning, good inventory rotation, and market awareness.",
          linkedKPIs: ["Obsolete Inventory Rate", "Inventory Risk", "Cash Flow Impact", "Inventory Quality"],
          benefits: "Reducing obsolete inventory improves cash flow, reduces write-offs, and increases inventory ROI."
        },
        {
          id: "pts-5",
          text: "Parts ordering accuracy",
          description: "Accuracy of parts orders (right part, right quantity)",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["<85%", "85-90%", "91-94%", "95-97%", ">97%"] },
          weight: 1.2,
          category: "accuracy",
          purpose: "Evaluates process efficiency and staff competency, impacting customer satisfaction and operational costs.",
          situationAnalysis: "High accuracy indicates well-trained staff, effective systems, and good process controls.",
          linkedKPIs: ["Order Accuracy Rate", "Process Efficiency", "Error Reduction", "Customer Satisfaction"],
          benefits: "Improved ordering accuracy reduces costs, enhances customer satisfaction, and improves operational efficiency."
        },
        {
          id: "pts-6",
          text: "Wholesale parts sales performance",
          description: "External parts sales to other shops/customers",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["Poor", "Fair", "Good", "Very Good", "Excellent"] },
          weight: 1.1,
          category: "wholesale",
          purpose: "Assesses market expansion opportunities and additional revenue generation from parts inventory.",
          situationAnalysis: "Strong wholesale performance indicates market knowledge, competitive pricing, and relationship building capabilities.",
          linkedKPIs: ["Wholesale Revenue", "Market Share", "Customer Base Expansion", "Revenue Diversification"],
          benefits: "Growing wholesale business increases revenue, improves inventory turnover, and diversifies customer base."
        },
        {
          id: "pts-7",
          text: "Parts return rate",
          description: "Percentage of parts returned due to wrong orders",
          type: "scale",
          scale: { min: 1, max: 5, labels: [">10%", "6-10%", "3-5%", "1-2%", "<1%"] },
          weight: 1.2,
          category: "returns",
          purpose: "Measures process quality and accuracy, impacting profitability and customer satisfaction.",
          situationAnalysis: "Low return rates indicate accurate ordering, good process controls, and effective staff training.",
          linkedKPIs: ["Return Rate", "Process Quality", "Customer Satisfaction", "Operational Costs"],
          benefits: "Reducing return rates improves profitability, enhances customer satisfaction, and reduces operational inefficiencies."
        },
        {
          id: "pts-8",
          text: "Emergency parts procurement",
          description: "Ability to quickly source urgent parts",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["Poor", "Fair", "Good", "Very Good", "Excellent"] },
          weight: 1.1,
          category: "emergency",
          purpose: "Evaluates supply chain relationships and problem-solving capabilities, crucial for customer service excellence.",
          situationAnalysis: "Strong emergency procurement capabilities indicate good supplier relationships and effective logistics management.",
          linkedKPIs: ["Emergency Response Time", "Supplier Relationships", "Service Completion Rate", "Customer Satisfaction"],
          benefits: "Better emergency procurement improves customer satisfaction, reduces service delays, and enhances competitive advantage."
        },
        {
          id: "pts-9",
          text: "Parts counter efficiency",
          description: "Average time to process parts requests",
          type: "scale",
          scale: { min: 1, max: 5, labels: [">10 min", "6-10 min", "3-5 min", "1-2 min", "<1 min"] },
          weight: 1.0,
          category: "efficiency",
          purpose: "Measures operational efficiency and customer service speed, impacting customer satisfaction and productivity.",
          situationAnalysis: "Fast parts counter service indicates efficient systems, trained staff, and streamlined processes.",
          linkedKPIs: ["Processing Time", "Customer Wait Time", "Staff Productivity", "Service Efficiency"],
          benefits: "Improved counter efficiency enhances customer satisfaction, increases productivity, and reduces operational bottlenecks."
        },
        {
          id: "pts-10",
          text: "Vendor relationship management",
          description: "Quality of relationships with parts suppliers",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["Poor", "Fair", "Good", "Very Good", "Excellent"] },
          weight: 1.1,
          category: "vendor",
          purpose: "Evaluates supply chain management effectiveness, impacting costs, availability, and service quality.",
          situationAnalysis: "Strong vendor relationships ensure better pricing, priority service, and supply chain reliability.",
          linkedKPIs: ["Supplier Performance", "Cost Management", "Supply Reliability", "Partnership Quality"],
          benefits: "Excellent vendor relationships improve pricing, ensure supply availability, and enhance overall operational effectiveness."
        }
      ]
    },
    {
      id: "financial-operations",
      title: "Financial Operations & Overall Performance",
      description: "Evaluate overall financial health, operational efficiency, and business management",
      icon: "dollar-sign",
      questions: [
        {
          id: "fin-1",
          text: "Overall dealership profitability trend",
          description: "Net profit trend over the last 12 months",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["Declining", "Stable/Low", "Moderate", "Good", "Excellent"] },
          weight: 2.0,
          category: "profitability",
          purpose: "Evaluates overall business performance and sustainability, the ultimate measure of dealership success.",
          situationAnalysis: "Profitability trends indicate business health, market position effectiveness, and operational efficiency.",
          linkedKPIs: ["Net Profit Margin", "ROI", "Revenue Growth", "Operating Efficiency"],
          benefits: "Strong profitability ensures business sustainability, enables growth investments, and provides financial security."
        },
        {
          id: "fin-2",
          text: "Cash flow management",
          description: "Consistency and predictability of cash flow",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["Poor", "Fair", "Good", "Very Good", "Excellent"] },
          weight: 1.8,
          category: "cashflow",
          purpose: "Assesses financial management effectiveness and business stability, crucial for operational continuity.",
          situationAnalysis: "Consistent cash flow indicates effective financial management, predictable operations, and good planning.",
          linkedKPIs: ["Cash Flow Consistency", "Working Capital", "Liquidity Ratios", "Financial Stability"],
          benefits: "Stable cash flow ensures operational continuity, enables strategic investments, and reduces financial stress."
        },
        {
          id: "fin-3",
          text: "Floor plan management efficiency",
          description: "Optimization of floor plan interest costs",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["Poor", "Fair", "Good", "Very Good", "Excellent"] },
          weight: 1.5,
          category: "floorplan",
          purpose: "Evaluates inventory financing efficiency, directly impacting profitability and cash management.",
          situationAnalysis: "Efficient floor plan management reduces interest costs and optimizes inventory investment.",
          linkedKPIs: ["Interest Cost Management", "Inventory Efficiency", "Days in Stock", "Financing Optimization"],
          benefits: "Optimized floor plan management reduces costs, improves cash flow, and maximizes inventory ROI."
        },
        {
          id: "fin-4",
          text: "Cost control effectiveness",
          description: "Management of operational expenses",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["Poor", "Fair", "Good", "Very Good", "Excellent"] },
          weight: 1.6,
          category: "costs",
          purpose: "Measures operational efficiency and expense management, crucial for maintaining profitability and competitiveness.",
          situationAnalysis: "Effective cost control ensures competitive pricing capability while maintaining service quality.",
          linkedKPIs: ["Operating Expense Ratio", "Cost Per Unit", "Expense Management", "Operational Efficiency"],
          benefits: "Superior cost control improves profitability, enables competitive pricing, and provides operational flexibility."
        },
        {
          id: "fin-5",
          text: "Employee productivity metrics",
          description: "Revenue per employee performance",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["Below industry", "At industry", "Above industry", "Well above", "Exceptional"] },
          weight: 1.4,
          category: "productivity",
          purpose: "Evaluates human resource effectiveness and operational efficiency, impacting overall business performance.",
          situationAnalysis: "High employee productivity indicates effective management, good systems, and motivated workforce.",
          linkedKPIs: ["Revenue Per Employee", "Staff Efficiency", "Productivity Index", "Human Resource ROI"],
          benefits: "Higher employee productivity improves profitability, enhances competitiveness, and creates better work environment."
        },
        {
          id: "fin-6",
          text: "Technology investment ROI",
          description: "Return on technology and equipment investments",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["Poor", "Fair", "Good", "Very Good", "Excellent"] },
          weight: 1.2,
          category: "technology",
          purpose: "Assesses technology investment effectiveness and digital transformation success, crucial for future competitiveness.",
          situationAnalysis: "Strong technology ROI indicates effective digital strategy, good vendor selection, and successful implementation.",
          linkedKPIs: ["Technology ROI", "Digital Efficiency", "System Utilization", "Innovation Index"],
          benefits: "Effective technology investment improves efficiency, enhances customer experience, and builds competitive advantage."
        },
        {
          id: "fin-7",
          text: "Facility utilization efficiency",
          description: "Optimal use of showroom and service bay space",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["Poor", "Fair", "Good", "Very Good", "Excellent"] },
          weight: 1.3,
          category: "facility",
          purpose: "Evaluates physical asset utilization and operational design effectiveness, impacting productivity and costs.",
          situationAnalysis: "Efficient facility utilization maximizes productivity, enhances customer experience, and optimizes space investment.",
          linkedKPIs: ["Facility Utilization Rate", "Space Productivity", "Asset Efficiency", "Layout Optimization"],
          benefits: "Optimized facility utilization improves productivity, reduces costs, and enhances customer experience."
        },
        {
          id: "fin-8",
          text: "Customer database value",
          description: "Quality and utilization of customer data",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["Poor", "Fair", "Good", "Very Good", "Excellent"] },
          weight: 1.1,
          category: "data",
          purpose: "Assesses data asset quality and utilization effectiveness, crucial for customer relationship management and business intelligence.",
          situationAnalysis: "High-quality customer data enables better decision making, targeted marketing, and improved customer service.",
          linkedKPIs: ["Data Quality Index", "Customer Insights", "Marketing Effectiveness", "Business Intelligence"],
          benefits: "Valuable customer data improves marketing ROI, enhances customer relationships, and enables data-driven decision making."
        }
      ]
    }
  ]
};