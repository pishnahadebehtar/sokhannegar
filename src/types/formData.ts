export interface FormData {
  campaignName: string; // Campaign name
  awarenessStage: string; // Customer awareness stage
  emotion: string; // Primary emotion
  marketingChannel: string; // Marketing channel
  gender: string; // Target gender
  customerPains: string[]; // Customer pain points
  customerDesires: string[]; // Customer desires
  ageGroup: string; // Target age group
  uniqueSellingPoint: string; // Unique selling proposition
  productFeatures: { feature: string; benefit: string }[]; // Product features and benefits
  mainIdea: string; // Main copywriting idea
  offerType: string; // Type of offer
  offerCategory: string; // Offer category
  offerMagnets: string[]; // Offer magnets
  urgency: string; // Urgency factor
  cta: string; // Call to action
  brandVoice: string; // Brand tone (e.g., formal, friendly)
  targetLocation: string; // Geographic target
  customerIncomeLevel: string; // Income level of target audience
  campaignGoal: string; // Goal of the campaign (e.g., sales, awareness)
  keywords: string[]; // SEO or campaign keywords
  competitors: string[]; // Main competitors
  productPriceRange: string; // Price range of the product
  customerHobbies: string[]; // Hobbies/interests of target audience
}
