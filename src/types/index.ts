export interface PricingPlan {
  name: string;
  price: number;
  currency: string;
  delivery: string;
  features: string[];
  message: string;
}

export interface HomepageFeature {
  title: string;
  tag: string;
  tone: 'emerald' | 'blue' | 'purple' | 'amber';
  highlights: string[];
}

export interface Service {
  id: string;
  slug: string;
  name: string;
  detailTitle?: string;
  group: 'featured' | 'digital';
  description: string;
  heroText: string;
  fichePath: string;
  ficheTitle: string;
  ficheMetaDescription: string;
  ficheLongDescription?: string;
  image: string;
  imageAlt: string;
  icon: string;
  detailInfo?: string;
  pricing: PricingPlan[] | null;
  pricingLabel: string;
  cardNote?: string;
  message: string;
  relatedIds: string[];
  homepageFeature?: HomepageFeature;
}

export interface IdeaProposal {
  businessName: string;
  sector: string;
  objective: string;
  targetAudience: string;
  visualStyle: string;
  colorsSuggested: string;
  pageStructure: string[];
  functionalities: string[];
  callToAction: string;
  pendingInfo: string;
}
