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
          category: "volume"
        },
        {
          id: "nvs-2",
          text: "How would you rate your sales team's closing ratio?",
          description: "Percentage of leads that convert to sales",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["<10%", "10-15%", "16-20%", "21-25%", ">25%"] },
          weight: 1.5,
          category: "conversion"
        },
        {
          id: "nvs-3",
          text: "Customer satisfaction score for new vehicle sales process",
          description: "Based on customer surveys and feedback",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["Poor (1-2)", "Fair (3-4)", "Good (5-6)", "Very Good (7-8)", "Excellent (9-10)"] },
          weight: 1.3,
          category: "satisfaction"
        },
        {
          id: "nvs-4",
          text: "Average gross profit per new vehicle sold",
          description: "Profit margin analysis",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["<$1,000", "$1,000-$2,000", "$2,000-$3,500", "$3,500-$5,000", ">$5,000"] },
          weight: 1.4,
          category: "profitability"
        },
        {
          id: "nvs-5",
          text: "Time from customer inquiry to delivery",
          description: "Average delivery time for new vehicles",
          type: "scale",
          scale: { min: 1, max: 5, labels: [">30 days", "21-30 days", "14-20 days", "7-13 days", "<7 days"] },
          weight: 1.1,
          category: "efficiency"
        },
        {
          id: "nvs-6",
          text: "Digital lead conversion rate",
          description: "Online leads converting to showroom visits",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["<5%", "5-10%", "11-15%", "16-20%", ">20%"] },
          weight: 1.2,
          category: "digital"
        },
        {
          id: "nvs-7",
          text: "Sales team training frequency",
          description: "Regular training and skill development",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["Rarely", "Annually", "Bi-annually", "Quarterly", "Monthly"] },
          weight: 1.0,
          category: "training"
        },
        {
          id: "nvs-8",
          text: "Inventory turnover rate",
          description: "How quickly new vehicle inventory moves",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["<6 times/year", "6-8 times/year", "9-11 times/year", "12-15 times/year", ">15 times/year"] },
          weight: 1.3,
          category: "inventory"
        },
        {
          id: "nvs-9",
          text: "Finance & Insurance penetration rate",
          description: "Percentage of customers who purchase F&I products",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["<40%", "40-55%", "56-70%", "71-85%", ">85%"] },
          weight: 1.2,
          category: "financial"
        },
        {
          id: "nvs-10",
          text: "CRM system utilization effectiveness",
          description: "How well your team uses CRM for lead management",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["Poor", "Fair", "Good", "Very Good", "Excellent"] },
          weight: 1.1,
          category: "technology"
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
          category: "turnover"
        },
        {
          id: "uvs-2",
          text: "Used vehicle gross profit margins",
          description: "Average profit per used vehicle",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["<$1,500", "$1,500-$2,500", "$2,500-$3,500", "$3,500-$4,500", ">$4,500"] },
          weight: 1.5,
          category: "profitability"
        },
        {
          id: "uvs-3",
          text: "Trade-in appraisal accuracy",
          description: "Accuracy of initial trade valuations vs final selling price",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["<70%", "70-75%", "76-80%", "81-85%", ">85%"] },
          weight: 1.2,
          category: "accuracy"
        },
        {
          id: "uvs-4",
          text: "Reconditioning cost control",
          description: "Average reconditioning cost per used vehicle",
          type: "scale",
          scale: { min: 1, max: 5, labels: [">$2,000", "$1,500-$2,000", "$1,000-$1,499", "$500-$999", "<$500"] },
          weight: 1.3,
          category: "costs"
        },
        {
          id: "uvs-5",
          text: "Online listing optimization",
          description: "Quality and effectiveness of online vehicle listings",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["Poor", "Fair", "Good", "Very Good", "Excellent"] },
          weight: 1.1,
          category: "digital"
        },
        {
          id: "uvs-6",
          text: "Auction purchase success rate",
          description: "Profitable vehicles purchased from auctions",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["<60%", "60-70%", "71-80%", "81-90%", ">90%"] },
          weight: 1.2,
          category: "sourcing"
        },
        {
          id: "uvs-7",
          text: "Customer satisfaction with used vehicle purchases",
          description: "Post-purchase satisfaction scores",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["Poor (1-2)", "Fair (3-4)", "Good (5-6)", "Very Good (7-8)", "Excellent (9-10)"] },
          weight: 1.3,
          category: "satisfaction"
        },
        {
          id: "uvs-8",
          text: "Warranty and service contract penetration",
          description: "Extended warranty sales on used vehicles",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["<20%", "20-35%", "36-50%", "51-65%", ">65%"] },
          weight: 1.1,
          category: "penetration"
        },
        {
          id: "uvs-9",
          text: "Vehicle pricing competitiveness",
          description: "Pricing compared to market competition",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["Above market", "Slightly above", "At market", "Slightly below", "Below market"] },
          weight: 1.2,
          category: "pricing"
        },
        {
          id: "uvs-10",
          text: "Aged inventory management",
          description: "Strategy for vehicles over 60 days in inventory",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["No strategy", "Reactive", "Basic plan", "Good plan", "Excellent plan"] },
          weight: 1.3,
          category: "inventory"
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
          category: "efficiency"
        },
        {
          id: "svc-2",
          text: "Customer pay labor rate utilization",
          description: "Effective labor rate compared to posted rate",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["<80%", "80-85%", "86-90%", "91-95%", ">95%"] },
          weight: 1.4,
          category: "pricing"
        },
        {
          id: "svc-3",
          text: "Service appointment availability",
          description: "Average wait time for service appointments",
          type: "scale",
          scale: { min: 1, max: 5, labels: [">14 days", "8-14 days", "4-7 days", "2-3 days", "Same/next day"] },
          weight: 1.3,
          category: "availability"
        },
        {
          id: "svc-4",
          text: "First-time fix rate",
          description: "Percentage of repairs completed correctly first time",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["<75%", "75-80%", "81-85%", "86-92%", ">92%"] },
          weight: 1.4,
          category: "quality"
        },
        {
          id: "svc-5",
          text: "Service customer satisfaction scores",
          description: "Overall service experience rating",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["Poor (1-2)", "Fair (3-4)", "Good (5-6)", "Very Good (7-8)", "Excellent (9-10)"] },
          weight: 1.5,
          category: "satisfaction"
        },
        {
          id: "svc-6",
          text: "Warranty recovery rate",
          description: "Percentage of warranty claims successfully recovered",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["<85%", "85-90%", "91-94%", "95-97%", ">97%"] },
          weight: 1.2,
          category: "warranty"
        },
        {
          id: "svc-7",
          text: "Technician certification levels",
          description: "Percentage of ASE certified technicians",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["<50%", "50-65%", "66-80%", "81-90%", ">90%"] },
          weight: 1.1,
          category: "certification"
        },
        {
          id: "svc-8",
          text: "Service retention rate",
          description: "Customers returning for service within 12 months",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["<40%", "40-50%", "51-60%", "61-70%", ">70%"] },
          weight: 1.3,
          category: "retention"
        },
        {
          id: "svc-9",
          text: "Parts availability for service",
          description: "Percentage of parts available when needed",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["<85%", "85-90%", "91-94%", "95-97%", ">97%"] },
          weight: 1.2,
          category: "parts"
        },
        {
          id: "svc-10",
          text: "Digital service communication",
          description: "Use of digital tools for customer updates",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["None", "Basic", "Good", "Very Good", "Excellent"] },
          weight: 1.0,
          category: "digital"
        },
        {
          id: "svc-11",
          text: "Service advisor productivity",
          description: "Average repair orders per advisor per day",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["<8 ROs", "8-10 ROs", "11-13 ROs", "14-16 ROs", ">16 ROs"] },
          weight: 1.3,
          category: "productivity"
        },
        {
          id: "svc-12",
          text: "Express service efficiency",
          description: "Quick service lane utilization and throughput",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["Poor", "Fair", "Good", "Very Good", "Excellent"] },
          weight: 1.1,
          category: "express"
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
          category: "turnover"
        },
        {
          id: "pts-2",
          text: "Parts fill rate",
          description: "Percentage of parts requests filled from stock",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["<80%", "80-85%", "86-90%", "91-95%", ">95%"] },
          weight: 1.4,
          category: "availability"
        },
        {
          id: "pts-3",
          text: "Parts gross profit margin",
          description: "Average profit margin on parts sales",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["<25%", "25-30%", "31-35%", "36-40%", ">40%"] },
          weight: 1.5,
          category: "profitability"
        },
        {
          id: "pts-4",
          text: "Obsolete parts percentage",
          description: "Percentage of inventory considered obsolete",
          type: "scale",
          scale: { min: 1, max: 5, labels: [">15%", "11-15%", "6-10%", "3-5%", "<3%"] },
          weight: 1.3,
          category: "obsolete"
        },
        {
          id: "pts-5",
          text: "Parts ordering accuracy",
          description: "Accuracy of parts orders (right part, right quantity)",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["<85%", "85-90%", "91-94%", "95-97%", ">97%"] },
          weight: 1.2,
          category: "accuracy"
        },
        {
          id: "pts-6",
          text: "Wholesale parts sales performance",
          description: "External parts sales to other shops/customers",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["Poor", "Fair", "Good", "Very Good", "Excellent"] },
          weight: 1.1,
          category: "wholesale"
        },
        {
          id: "pts-7",
          text: "Parts return rate",
          description: "Percentage of parts returned due to wrong orders",
          type: "scale",
          scale: { min: 1, max: 5, labels: [">10%", "6-10%", "3-5%", "1-2%", "<1%"] },
          weight: 1.2,
          category: "returns"
        },
        {
          id: "pts-8",
          text: "Emergency parts procurement",
          description: "Ability to quickly source urgent parts",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["Poor", "Fair", "Good", "Very Good", "Excellent"] },
          weight: 1.1,
          category: "emergency"
        },
        {
          id: "pts-9",
          text: "Parts counter efficiency",
          description: "Average time to process parts requests",
          type: "scale",
          scale: { min: 1, max: 5, labels: [">10 min", "6-10 min", "3-5 min", "1-2 min", "<1 min"] },
          weight: 1.0,
          category: "efficiency"
        },
        {
          id: "pts-10",
          text: "Vendor relationship management",
          description: "Quality of relationships with parts suppliers",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["Poor", "Fair", "Good", "Very Good", "Excellent"] },
          weight: 1.1,
          category: "vendor"
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
          category: "profitability"
        },
        {
          id: "fin-2",
          text: "Cash flow management",
          description: "Consistency and predictability of cash flow",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["Poor", "Fair", "Good", "Very Good", "Excellent"] },
          weight: 1.8,
          category: "cashflow"
        },
        {
          id: "fin-3",
          text: "Floor plan management efficiency",
          description: "Optimization of floor plan interest costs",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["Poor", "Fair", "Good", "Very Good", "Excellent"] },
          weight: 1.5,
          category: "floorplan"
        },
        {
          id: "fin-4",
          text: "Cost control effectiveness",
          description: "Management of operational expenses",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["Poor", "Fair", "Good", "Very Good", "Excellent"] },
          weight: 1.6,
          category: "costs"
        },
        {
          id: "fin-5",
          text: "Employee productivity metrics",
          description: "Revenue per employee performance",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["Below industry", "At industry", "Above industry", "Well above", "Exceptional"] },
          weight: 1.4,
          category: "productivity"
        },
        {
          id: "fin-6",
          text: "Technology investment ROI",
          description: "Return on technology and equipment investments",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["Poor", "Fair", "Good", "Very Good", "Excellent"] },
          weight: 1.2,
          category: "technology"
        },
        {
          id: "fin-7",
          text: "Facility utilization efficiency",
          description: "Optimal use of showroom and service bay space",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["Poor", "Fair", "Good", "Very Good", "Excellent"] },
          weight: 1.3,
          category: "facility"
        },
        {
          id: "fin-8",
          text: "Customer database value",
          description: "Quality and utilization of customer data",
          type: "scale",
          scale: { min: 1, max: 5, labels: ["Poor", "Fair", "Good", "Very Good", "Excellent"] },
          weight: 1.1,
          category: "data"
        }
      ]
    }
  ]
};