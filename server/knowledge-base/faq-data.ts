export interface FaqEntry {
  id: string;
  category: string;
  question: string;
  keywords: string[];
  answer: string;
  suggestions?: string[];
}

// Sourced from the site's own About/Services/Sell/Contact pages so answers
// never drift from what's actually published. Nothing here is invented -
// anything not stated on the site (e.g. commission rates) is answered by
// pointing the user to an agent instead of guessing a number.
export const FAQ_ENTRIES: FaqEntry[] = [
  {
    id: "contact-phone",
    category: "contact",
    question: "What's your phone number?",
    keywords: [
      "phone number", "call you", "phone you", "telephone", "contact number",
      "how do i call", "give you a call", "office number"
    ],
    answer: "You can reach us by phone:\n\n" +
      "• Office: +27 10 142 6931\n" +
      "• Peter Spurgeon (Managing Director): 084 208 9307\n" +
      "• Louis Smit: 083 677 3748\n\n" +
      "Phone lines are staffed 7 days a week, 8AM - 8PM.",
    suggestions: ["What's your email address?", "Where is your office?", "What are your business hours?"]
  },
  {
    id: "contact-email",
    category: "contact",
    question: "What's your email address?",
    keywords: ["email address", "email you", "send an email", "email support"],
    answer: "You can email us directly:\n\n" +
      "• Peter@spurgeonproperty.com (Peter Spurgeon, Managing Director)\n" +
      "• louissm@spurgeonproperty.com (Louis Smit)\n\n" +
      "We respond within 2-4 hours during business days.",
    suggestions: ["What's your phone number?", "Can I chat on WhatsApp?"]
  },
  {
    id: "contact-whatsapp",
    category: "contact",
    question: "Can I contact you on WhatsApp?",
    keywords: ["whatsapp", "chat on whatsapp", "message you", "text you"],
    answer: "Yes - you can chat with us directly on WhatsApp for instant responses: wa.me/27842089307",
    suggestions: ["What's your phone number?", "What are your business hours?"]
  },
  {
    id: "contact-address",
    category: "contact",
    question: "Where is your office located?",
    keywords: [
      "office location", "where are you based", "your address", "visit your office",
      "physical address", "office address"
    ],
    answer: "Our office is at:\n\nEastlands Office Park\nBentel Avenue, Jansen Park\nBoksburg\nRegus Building, First Floor",
    suggestions: ["What are your business hours?", "What's your phone number?"]
  },
  {
    id: "business-hours",
    category: "contact",
    question: "What are your business hours?",
    keywords: [
      "business hours", "office hours", "opening hours", "when are you open",
      "what time do you open", "what time do you close"
    ],
    answer: "Our office hours are:\n\n" +
      "• Monday - Friday: 8:00 AM - 6:00 PM\n" +
      "• Saturday: 9:00 AM - 4:00 PM\n" +
      "• Sunday: By appointment only\n\n" +
      "Our phone lines are staffed every day, 8AM - 8PM.",
    suggestions: ["What's your phone number?", "Can I book a viewing?"]
  },
  {
    id: "sell-process",
    category: "selling",
    question: "How do I sell my property with you?",
    keywords: [
      "sell my property", "sell my house", "how to sell", "selling process",
      "list my property", "want to sell"
    ],
    answer: "Selling with us is a 4-step process:\n\n" +
      "1. Free Property Valuation - a professional assessment using recent sales data and market analysis\n" +
      "2. Marketing Strategy - professional photography, online listings, and targeted advertising\n" +
      "3. Buyer Management - pre-qualified buyers, scheduled viewings, and offer negotiations\n" +
      "4. Legal & Transfer - full legal support from sale agreement through to transfer completion\n\n" +
      "On average, properties sell within 45 days. Head to our Sell Property page or contact us to get started with a free valuation.",
    suggestions: ["What documents do I need to sell?", "Is the valuation free?", "How long does it take to sell?"]
  },
  {
    id: "sell-timeline",
    category: "selling",
    question: "How long does it take to sell a property?",
    keywords: ["how long to sell", "selling timeline", "how fast can you sell", "average time to sell"],
    answer: "Our average selling time is 45 days, thanks to our proven marketing and buyer-management process. Timelines vary depending on price, location, and market conditions.",
    suggestions: ["How do I sell my property?", "What documents do I need to sell?"]
  },
  {
    id: "free-valuation",
    category: "selling",
    question: "Is a property valuation free?",
    keywords: ["free valuation", "cost of valuation", "valuation fee", "how much is a valuation"],
    answer: "Yes - property valuations are completely free. We assess your property using recent sales data and current market analysis, with no obligation.",
    suggestions: ["How do I sell my property?", "What documents do I need to sell?"]
  },
  {
    id: "sell-documents",
    category: "selling",
    question: "What documents do I need to sell my property?",
    keywords: [
      "documents to sell", "paperwork to sell", "what documents do i need",
      "required documents", "title deed", "compliance certificate"
    ],
    answer: "To speed up the selling process, it helps to have these ready:\n\n" +
      "• Title Deed or Sectional Plan\n" +
      "• Municipal Rates & Taxes Account\n" +
      "• Electrical Certificate of Compliance\n" +
      "• Water Certificate of Compliance\n" +
      "• Building Plans (if applicable)",
    suggestions: ["How do I sell my property?", "Is the valuation free?"]
  },
  {
    id: "commission",
    category: "selling",
    question: "What commission do you charge?",
    keywords: ["commission", "agent fees", "how much do you charge", "your fees", "cost to sell"],
    answer: "Commission is agreed per listing based on the property and services required. Contact Peter Spurgeon (084 208 9307, Peter@spurgeonproperty.com) or Louis Smit (083 677 3748) for a tailored quote.",
    suggestions: ["What's your phone number?", "How do I sell my property?"]
  },
  {
    id: "services-overview",
    category: "services",
    question: "What services do you offer?",
    keywords: [
      "what services", "what do you offer", "what can you help with", "services you provide"
    ],
    answer: "We offer a full range of real estate and property investment services:\n\n" +
      "• Property & Investment Management\n" +
      "• Financial Planning & Advisory\n" +
      "• Home Loans & Financing\n" +
      "• Property Auctions\n" +
      "• Property Acquisitions\n" +
      "• Commercial & Industrial Development\n" +
      "• Business Planning & Tax Advisory\n" +
      "• Business Capital Funding\n\n" +
      "Ask me about any of these and I can give you more detail.",
    suggestions: ["Do you help with home loans?", "Do you handle commercial properties?", "Do you offer property auctions?"]
  },
  {
    id: "home-loans",
    category: "services",
    question: "Do you help with home loans or mortgages?",
    keywords: [
      "home loan", "mortgage", "bond", "financing", "pre-approval",
      "first-time buyer", "refinance", "refinancing"
    ],
    answer: "Yes - we offer comprehensive home loan and financing solutions, including:\n\n" +
      "• First-time buyer assistance\n" +
      "• Refinancing and debt consolidation\n" +
      "• Investment property loans\n" +
      "• Commercial property financing\n\n" +
      "We help from pre-approval right through to settlement.",
    suggestions: ["What services do you offer?", "What's your phone number?"]
  },
  {
    id: "auctions",
    category: "services",
    question: "Do you offer property auctions?",
    keywords: ["auction", "auctions", "bidding", "auction property"],
    answer: "Yes - we run professional auction services for both buyers and sellers, including pre-auction valuations, auction preparation and marketing, bidding strategy consultation, and post-auction settlement support.",
    suggestions: ["What services do you offer?", "How do I sell my property?"]
  },
  {
    id: "commercial",
    category: "services",
    question: "Do you handle commercial or industrial properties?",
    keywords: [
      "commercial property", "industrial property", "commercial development",
      "commercial real estate", "office space", "warehouse"
    ],
    answer: "Yes - we provide end-to-end commercial and industrial development services, from site feasibility studies and development project management to zoning/compliance assistance and commercial leasing strategies.",
    suggestions: ["What services do you offer?", "Do you offer investment management?"]
  },
  {
    id: "investment-management",
    category: "services",
    question: "Do you offer investment or portfolio management?",
    keywords: [
      "investment management", "portfolio management", "property investment",
      "rental yield", "investment strategy", "wealth planning"
    ],
    answer: "Yes - our Property & Investment Management service covers portfolio analysis and optimization, market research and investment strategies, rental yield calculations, and ongoing property performance monitoring. We also offer financial planning and tax-efficient investment structuring.",
    suggestions: ["What services do you offer?", "Do you help with home loans?"]
  },
  {
    id: "rentals-general",
    category: "renting",
    question: "Do you handle rental properties?",
    keywords: ["rentals", "renting", "rent a property", "rental listings", "rent a house", "rent an apartment"],
    answer: "Yes - we list rental properties alongside our sales listings. Ask me to find rentals in a specific area, price range, or number of bedrooms and I'll pull up live listings for you, or browse the Rentals page directly.",
    suggestions: ["Find 2 bedroom apartments for rent", "What areas do you cover?"]
  },
  {
    id: "areas-covered",
    category: "company",
    question: "What areas do you cover?",
    keywords: [
      "areas do you cover", "which areas", "which cities", "locations you cover",
      "regions you cover", "where do you operate"
    ],
    answer: "We cover 50+ areas across South Africa, including Johannesburg, Cape Town, Durban, Pretoria, Port Elizabeth, Bloemfontein, and Boksburg where our office is based. Ask me about a specific suburb or city and I'll check our current listings there.",
    suggestions: ["Find properties in Johannesburg", "Find properties in Cape Town"]
  },
  {
    id: "company-about",
    category: "company",
    question: "Tell me about Spurgeon Property",
    keywords: [
      "about spurgeon property", "who are you", "about your company", "company background",
      "your mission", "what is spurgeon property"
    ],
    answer: "Spurgeon Property is a South African real estate company with 15+ years of experience, dedicated to connecting buyers, sellers, and agents through a comprehensive, user-friendly platform. We've listed 500+ properties, served 200+ happy clients, and transacted over R2.5 billion in property value, with a 98% client satisfaction rate.",
    suggestions: ["What services do you offer?", "Who are your agents?"]
  },
  {
    id: "agents",
    category: "company",
    question: "Who are your agents?",
    keywords: ["your agents", "who is peter spurgeon", "who is louis smit", "managing director", "meet the team"],
    answer: "Peter Spurgeon is our Managing Director, leading Spurgeon Property with extensive experience in the South African real estate market (084 208 9307, Peter@spurgeonproperty.com). Louis Smit is also part of our agent team (083 677 3748, louissm@spurgeonproperty.com).",
    suggestions: ["What's your phone number?", "How do I book a viewing?"]
  },
  {
    id: "book-viewing",
    category: "buying",
    question: "How do I book a property viewing?",
    keywords: [
      "book a viewing", "schedule a viewing", "arrange a viewing", "see a property",
      "view a property", "book a visit"
    ],
    answer: "You can book a viewing by calling us on +27 10 142 6931, WhatsApping 084 208 9307, or emailing Peter@spurgeonproperty.com. You can also reach out directly from any property's listing page on the site and an agent will arrange a time with you.",
    suggestions: ["What's your phone number?", "What are your business hours?"]
  }
];
