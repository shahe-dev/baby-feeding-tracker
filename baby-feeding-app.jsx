const { useState, useEffect } = React;
const { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } = Recharts;

// Simple SVG icon components (replacing lucide-react which has no browser UMD)
const Icon = ({ d, className = '', size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className={className}>
    <path d={d} />
  </svg>
);

const Calendar = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const TrendingUp = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
  </svg>
);

const BookOpen = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </svg>
);

const CheckCircle = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const Plus = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const Info = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
  </svg>
);

const Menu = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);

const Baby = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9 12h.01"/><path d="M15 12h.01"/><path d="M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5"/>
    <path d="M19 6.3a9 9 0 0 1 1.8 3.9 2 2 0 0 1 0 3.6 9 9 0 0 1-17.6 0 2 2 0 0 1 0-3.6A9 9 0 0 1 12 3c2 0 3.5 1.1 3.5 2.5s-.9 2.5-2 2.5c-.8 0-1.5-.4-1.5-1"/>
  </svg>
);

const Scale = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/>
    <path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>
  </svg>
);

const Ruler = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z"/>
    <path d="m14.5 12.5 2-2"/><path d="m11.5 9.5 2-2"/><path d="m8.5 6.5 2-2"/><path d="m17.5 15.5 2-2"/>
  </svg>
);

const Clock = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);

const Apple = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z"/>
    <path d="M10 2c1 .5 2 2 2 5"/>
  </svg>
);

const ChevronDown = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

const ChevronRight = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

const ExternalLink = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
  </svg>
);

// Comprehensive food database with benefits and research
const FOOD_DATABASE = {
  beef: {
    name: 'Beef (ground or pureed)',
    benefits: ['Highest bioavailable iron (25% absorption)', 'Complete protein', 'Zinc for growth', 'Vitamin B12 for brain development'],
    sources: ['WHO 2023: Daily animal foods required', 'Meat consumption reduced stunting by 39% (Global Network Studies)'],
    allergens: [],
    servingSize: { '6-7mo': '1-2 tbsp', '8-9mo': '2-3 tbsp', '10-12mo': '1-2 oz' }
  },
  lamb: {
    name: 'Lamb (ground or pureed)',
    benefits: ['Excellent iron source', 'High in zinc', 'Rich in B vitamins', 'Alternative to beef for variety'],
    sources: ['WHO 2023: Animal source foods imperative', 'Mediterranean diet research'],
    allergens: [],
    servingSize: { '6-7mo': '1-2 tbsp', '8-9mo': '2-3 tbsp', '10-12mo': '1-2 oz' }
  },
  chicken: {
    name: 'Chicken thigh or breast',
    benefits: ['Lean protein', 'Good iron source', 'B vitamins', 'Easily digestible'],
    sources: ['WHO 2023: Animal foods daily', 'Scandinavian infant feeding guidelines'],
    allergens: [],
    servingSize: { '6-7mo': '1-2 tbsp', '8-9mo': '2-3 tbsp', '10-12mo': '1-2 oz' }
  },
  salmon: {
    name: 'Salmon (wild-caught preferred)',
    benefits: ['DHA omega-3 for brain development', 'High-quality protein', 'Vitamin D', 'Anti-inflammatory'],
    sources: ['Scandinavian ABIS: Early fish reduced eczema', 'Brain development research: DHA critical for 260% growth spurt'],
    allergens: ['fish'],
    servingSize: { '6-7mo': '1-2 tbsp', '8-9mo': '2-3 tbsp', '10-12mo': '1-2 oz' }
  },
  mackerel: {
    name: 'Mackerel',
    benefits: ['Very high DHA omega-3', 'Excellent protein', 'Vitamin B12', 'Sustainable fish choice'],
    sources: ['Scandinavian research: Fatty fish 2x weekly', 'Omega-3 neuroscience research'],
    allergens: ['fish'],
    servingSize: { '6-7mo': '1-2 tbsp', '8-9mo': '2-3 tbsp', '10-12mo': '1-2 oz' }
  },
  whitefish: {
    name: 'White fish (cod, haddock)',
    benefits: ['Mild flavor for introduction', 'Lean protein', 'Low mercury', 'Digestible'],
    sources: ['WHO 2023: Fish as animal food source', 'Israeli LEAP: Early fish introduction'],
    allergens: ['fish'],
    servingSize: { '6-7mo': '1-2 tbsp', '8-9mo': '2-3 tbsp', '10-12mo': '1-2 oz' }
  },
  sardines: {
    name: 'Sardines (with soft bones)',
    benefits: ['DHA omega-3', 'Calcium from bones', 'Vitamin D', 'Sustainable'],
    sources: ['Scandinavian fatty fish research', 'Calcium alternative to dairy'],
    allergens: ['fish'],
    servingSize: { '6-7mo': '1-2 tbsp', '8-9mo': '2-3 tbsp', '10-12mo': '1-2 oz' }
  },
  egg: {
    name: 'Egg (whole, well-cooked)',
    benefits: ['Complete protein', 'Choline for brain', 'Lutein and zeaxanthin', 'DHA in yolk', 'Highly bioavailable iron'],
    sources: ['Israeli LEAP extension: Early egg introduction', 'WHO 2023: Eggs as animal food', 'Brain development: 75% of brain carotenoids from eggs'],
    allergens: ['egg'],
    servingSize: { '6-7mo': '1/2-1 egg', '8-9mo': '1 egg', '10-12mo': '1-2 eggs' }
  },
  peanutButter: {
    name: 'Peanut butter (smooth, thinned)',
    benefits: ['Allergy prevention (81% reduction)', 'Protein', 'Healthy fats', 'Vitamin E'],
    sources: ['Israeli LEAP Study: 81% peanut allergy reduction', 'Early introduction 4-6 months with sustained exposure'],
    allergens: ['peanut'],
    servingSize: { '6-7mo': '1/4-1/2 tsp', '8-9mo': '1/2-1 tsp', '10-12mo': '1-2 tsp' }
  },
  bamba: {
    name: 'Bamba (Israeli peanut snack)',
    benefits: ['Allergy prevention', '25% peanut protein', 'Sustained allergen exposure', 'Easy to dissolve or serve'],
    sources: ['Israeli observation: 10x lower peanut allergy vs UK', 'LEAP Study basis: Regular Bamba consumption'],
    allergens: ['peanut'],
    servingSize: { '6-7mo': 'Dissolved', '8-9mo': '3-5 pieces', '10-12mo': '5-10 pieces' }
  },
  tahini: {
    name: 'Tahini (sesame paste)',
    benefits: ['Excellent calcium source', 'Healthy fats', 'Sesame allergen exposure', 'Iron and magnesium'],
    sources: ['Israeli Mediterranean approach', 'Calcium alternative to dairy', 'Early sesame introduction'],
    allergens: ['sesame'],
    servingSize: { '6-7mo': '1/4-1/2 tsp', '8-9mo': '1/2-1 tsp', '10-12mo': '1-2 tsp' }
  },
  almondButter: {
    name: 'Almond butter (thinned)',
    benefits: ['Tree nut allergen exposure', 'Vitamin E', 'Healthy fats', 'Magnesium'],
    sources: ['Extended LEAP principles to all allergens', 'Early tree nut introduction safe'],
    allergens: ['tree nuts'],
    servingSize: { '6-7mo': '1/4-1/2 tsp', '8-9mo': '1/2-1 tsp', '10-12mo': '1-2 tsp' }
  },
  hummus: {
    name: 'Hummus (thinned)',
    benefits: ['Plant protein from chickpeas', 'Sesame from tahini', 'Fiber', 'Iron with vitamin C'],
    sources: ['Israeli traditional weaning food', 'Legumes + tahini combination'],
    allergens: ['sesame'],
    servingSize: { '6-7mo': '1-2 tbsp', '8-9mo': '2-3 tbsp', '10-12mo': '3-4 tbsp' }
  },
  avocado: {
    name: 'Avocado',
    benefits: ['Healthy monounsaturated fats', 'Brain development', 'Easy to digest', 'High energy density'],
    sources: ['WHO 2023: No fat restriction under age 2', 'BLISS: Energy-dense food at every meal'],
    allergens: [],
    servingSize: { '6-7mo': '1-2 tbsp', '8-9mo': '2-3 tbsp', '10-12mo': '1/4 avocado' }
  },
  oliveOil: {
    name: 'Extra virgin olive oil',
    benefits: ['Monounsaturated fats', 'Antioxidants', 'Anti-inflammatory', 'Mediterranean diet staple'],
    sources: ['Israeli Mediterranean approach', 'WHO 2023: Healthy fats essential'],
    allergens: [],
    servingSize: { '6-7mo': '1/2-1 tsp', '8-9mo': '1-2 tsp', '10-12mo': '1-2 tsp' }
  },
  sweetPotato: {
    name: 'Sweet potato',
    benefits: ['Vitamin A', 'Fiber', 'Complex carbohydrates', 'Beta-carotene'],
    sources: ['Universal first food across cultures', 'WHO 2023: Variety of vegetables'],
    allergens: [],
    servingSize: { '6-7mo': '1-2 tbsp', '8-9mo': '2-4 tbsp', '10-12mo': '4-6 tbsp' }
  },
  spinach: {
    name: 'Spinach',
    benefits: ['Iron (non-heme)', 'Calcium', 'Folate', 'Vitamin K'],
    sources: ['Scandinavian vegetable variety', 'Calcium source for dairy-free'],
    allergens: [],
    servingSize: { '6-7mo': '1-2 tbsp', '8-9mo': '2-3 tbsp', '10-12mo': '3-4 tbsp' }
  },
  broccoli: {
    name: 'Broccoli',
    benefits: ['Vitamin C (enhances iron absorption)', 'Calcium', 'Fiber', 'Antioxidants'],
    sources: ['Scandinavian emphasis on vegetables', 'Calcium alternative to dairy'],
    allergens: [],
    servingSize: { '6-7mo': '1-2 tbsp', '8-9mo': '2-3 tbsp', '10-12mo': '3-4 tbsp' }
  },
  carrots: {
    name: 'Carrots',
    benefits: ['Vitamin A', 'Beta-carotene', 'Fiber', 'Eye health'],
    sources: ['Universal vegetable', 'WHO 2023: Variety important'],
    allergens: [],
    servingSize: { '6-7mo': '1-2 tbsp', '8-9mo': '2-4 tbsp', '10-12mo': '4-6 tbsp' }
  },
  lentils: {
    name: 'Lentils (well-cooked)',
    benefits: ['Plant protein', 'Iron (with vitamin C)', 'Fiber', 'Folate'],
    sources: ['WHO 2023: Legumes acceptable', 'Combine with vitamin C for iron absorption'],
    allergens: [],
    servingSize: { '6-7mo': '1-2 tbsp', '8-9mo': '2-3 tbsp', '10-12mo': '3-4 tbsp' }
  },
  butternutSquash: {
    name: 'Butternut squash',
    benefits: ['Vitamin A', 'Beta-carotene', 'Fiber', 'Naturally sweet flavor'],
    sources: ['WHO 2023: Variety of vegetables', 'Universal first food across cultures'],
    allergens: [],
    servingSize: { '6-7mo': '1-2 tbsp', '8-9mo': '2-4 tbsp', '10-12mo': '4-6 tbsp' }
  },
  peas: {
    name: 'Peas',
    benefits: ['Plant protein', 'Vitamin C enhances iron absorption', 'Fiber', 'Vitamin K'],
    sources: ['WHO 2023: Variety of vegetables', 'Scandinavian vegetable variety'],
    allergens: [],
    servingSize: { '6-7mo': '1-2 tbsp', '8-9mo': '2-3 tbsp', '10-12mo': '3-4 tbsp' }
  },
  kale: {
    name: 'Kale',
    benefits: ['Calcium source for dairy-free', 'Vitamin K', 'Vitamin C', 'Antioxidants'],
    sources: ['Scandinavian vegetable emphasis', 'Calcium alternative to dairy'],
    allergens: [],
    servingSize: { '6-7mo': '1-2 tbsp', '8-9mo': '2-3 tbsp', '10-12mo': '3-4 tbsp' }
  },
  turkey: {
    name: 'Turkey',
    benefits: ['Lean protein', 'Iron source', 'B vitamins', 'Zinc'],
    sources: ['WHO 2023: Animal foods daily', 'Variety of protein sources recommended'],
    allergens: [],
    servingSize: { '6-7mo': '1-2 tbsp', '8-9mo': '2-3 tbsp', '10-12mo': '1-2 oz' }
  },
  chickenLiver: {
    name: 'Chicken liver pate',
    benefits: ['Most concentrated bioavailable iron', 'Vitamin A', 'B12', 'Folate'],
    sources: ['WHO 2023: Organ meats nutrient-dense', 'Highest iron bioavailability of any food'],
    allergens: [],
    servingSize: { '6-7mo': '1 tsp', '8-9mo': '1-2 tsp', '10-12mo': '1-2 tbsp' }
  },
  cashewButter: {
    name: 'Cashew butter (thinned)',
    benefits: ['Tree nut allergen exposure', 'Healthy fats', 'Magnesium', 'Iron'],
    sources: ['Extended LEAP principles to all allergens', 'Tree nut variety for sustained exposure'],
    allergens: ['tree nuts'],
    servingSize: { '6-7mo': '1/4-1/2 tsp', '8-9mo': '1/2-1 tsp', '10-12mo': '1-2 tsp' }
  },
  mushrooms: {
    name: 'Mushrooms (cooked)',
    benefits: ['Vitamin D', 'B vitamins', 'Selenium', 'Umami flavor development'],
    sources: ['WHO 2023: Variety of vegetables', 'Vitamin D source for dairy-free'],
    allergens: [],
    servingSize: { '6-7mo': '1-2 tbsp', '8-9mo': '2-3 tbsp', '10-12mo': '3-4 tbsp' }
  },
  quinoa: {
    name: 'Quinoa',
    benefits: ['Complete plant protein', 'Iron', 'Fiber', 'Gluten-free grain alternative'],
    sources: ['WHO 2023: Grains supplementary not foundational', 'Complete amino acid profile'],
    allergens: [],
    servingSize: { '6-7mo': '1-2 tbsp', '8-9mo': '2-4 tbsp', '10-12mo': '4-6 tbsp' }
  }
};

// Weekly meal plan templates
const MEAL_PLANS = {
  'week1-2': {
    name: 'Weeks 1-2: Foundation & Allergen Introduction',
    ageRange: '5-6 months',
    goals: ['Establish iron-rich foods', 'Introduce all major allergens', 'Begin feeding routine'],
    days: [
      {
        day: 1,
        meals: [
          {
            time: 'Mid-morning',
            options: [
              { foods: ['beef', 'sweetPotato', 'oliveOil'], description: 'Pureed beef with sweet potato and olive oil' },
              { foods: ['lamb', 'sweetPotato', 'oliveOil'], description: 'Pureed lamb with sweet potato and olive oil' }
            ],
            allergenIntro: { food: 'peanutButter', note: 'First peanut introduction - 1/4 tsp thinned with breastmilk' }
          }
        ]
      },
      {
        day: 2,
        meals: [
          {
            time: 'Mid-morning',
            options: [
              { foods: ['chicken', 'carrots', 'peanutButter'], description: 'Pureed chicken with carrots, peanut butter mixed in' }
            ],
            allergenIntro: { food: 'peanutButter', note: 'Continue peanut - increase to 1/2 tsp' }
          }
        ]
      },
      {
        day: 3,
        meals: [
          {
            time: 'Mid-morning',
            options: [
              { foods: ['beef', 'sweetPotato', 'peanutButter'], description: 'Beef with sweet potato and peanut butter' }
            ],
            allergenIntro: { food: 'peanutButter', note: 'Peanut day 3 - monitor for reactions' }
          }
        ]
      },
      {
        day: 4,
        meals: [
          {
            time: 'Mid-morning',
            options: [
              { foods: ['lamb', 'carrots', 'oliveOil'], description: 'Lamb with carrots and olive oil' }
            ],
            allergenIntro: { food: 'egg', note: 'First egg introduction - 1/4 hard-boiled egg yolk mashed' }
          },
          {
            time: 'Afternoon',
            options: [
              { foods: ['chicken', 'sweetPotato', 'peanutButter'], description: 'Chicken with sweet potato, peanut butter' }
            ]
          }
        ]
      },
      {
        day: 5,
        meals: [
          {
            time: 'Mid-morning',
            options: [
              { foods: ['beef', 'sweetPotato', 'egg'], description: 'Beef with sweet potato and egg yolk' }
            ],
            allergenIntro: { food: 'egg', note: 'Egg day 2 - increase to 1/2 egg' }
          },
          {
            time: 'Afternoon',
            options: [
              { foods: ['chicken', 'carrots', 'peanutButter'], description: 'Chicken with carrots and peanut butter' }
            ]
          }
        ]
      },
      {
        day: 6,
        meals: [
          {
            time: 'Mid-morning',
            options: [
              { foods: ['lamb', 'carrots', 'egg'], description: 'Lamb with carrots and whole scrambled egg' }
            ],
            allergenIntro: { food: 'egg', note: 'Whole egg - now well-established' }
          },
          {
            time: 'Afternoon',
            options: [
              { foods: ['beef', 'sweetPotato', 'peanutButter'], description: 'Beef with sweet potato and peanut butter' }
            ]
          }
        ]
      },
      {
        day: 7,
        meals: [
          {
            time: 'Mid-morning',
            options: [
              { foods: ['chicken', 'sweetPotato', 'tahini'], description: 'Chicken with sweet potato and tahini' }
            ],
            allergenIntro: { food: 'tahini', note: 'First sesame introduction - 1/4 tsp tahini' }
          },
          {
            time: 'Afternoon',
            options: [
              { foods: ['beef', 'carrots', 'egg'], description: 'Beef with carrots and egg' }
            ]
          }
        ]
      }
    ]
  },
  'week3-4': {
    name: 'Weeks 3-4: Expansion & Rotation',
    ageRange: '6.5-7 months',
    goals: ['Increase to 2-3 meals daily', 'Expand food variety', 'Establish allergen rotation'],
    days: [
      {
        day: 1,
        meals: [
          { time: 'Breakfast', options: [{ foods: ['egg', 'avocado', 'peanutButter'], description: 'Scrambled egg with avocado and peanut butter' }] },
          { time: 'Lunch', options: [{ foods: ['beef', 'sweetPotato', 'spinach', 'oliveOil'], description: 'Ground beef with sweet potato, spinach, olive oil' }] },
          { time: 'Dinner', options: [{ foods: ['chicken', 'broccoli', 'tahini'], description: 'Chicken with broccoli and tahini' }] }
        ]
      },
      {
        day: 2,
        meals: [
          { time: 'Breakfast', options: [{ foods: ['beef', 'avocado'], description: 'Pureed beef mixed into mashed avocado' }] },
          { time: 'Lunch', options: [{ foods: ['salmon', 'carrots', 'oliveOil'], description: 'Salmon with carrots and olive oil' }] },
          { time: 'Dinner', options: [{ foods: ['egg', 'spinach', 'almondButter'], description: 'Scrambled egg with spinach and almond butter' }] }
        ]
      },
      {
        day: 3,
        meals: [
          { time: 'Breakfast', options: [{ foods: ['egg', 'avocado'], description: 'Mashed egg yolk with avocado' }] },
          { time: 'Lunch', options: [{ foods: ['lamb', 'butternutSquash', 'tahini'], description: 'Lamb with butternut squash and tahini' }] },
          { time: 'Dinner', options: [{ foods: ['whitefish', 'peas', 'oliveOil'], description: 'White fish with peas and olive oil' }] }
        ]
      },
      {
        day: 4,
        meals: [
          { time: 'Breakfast', options: [{ foods: ['chicken', 'sweetPotato', 'peanutButter'], description: 'Ground chicken with sweet potato and peanut butter' }] },
          { time: 'Lunch', options: [{ foods: ['lentils', 'spinach', 'oliveOil'], description: 'Lentils (very soft) with spinach and olive oil' }] },
          { time: 'Dinner', options: [{ foods: ['egg', 'carrots', 'tahini'], description: 'Scrambled egg with vegetables and tahini' }] }
        ]
      },
      {
        day: 5,
        meals: [
          { time: 'Breakfast', options: [{ foods: ['egg', 'avocado', 'tahini'], description: 'Egg with avocado and tahini' }] },
          { time: 'Lunch', options: [{ foods: ['beef', 'broccoli', 'oliveOil'], description: 'Ground beef with broccoli and olive oil' }] },
          { time: 'Dinner', options: [{ foods: ['mackerel', 'sweetPotato', 'peanutButter'], description: 'Mackerel with sweet potato and peanut butter' }] }
        ]
      },
      {
        day: 6,
        meals: [
          { time: 'Breakfast', options: [{ foods: ['egg', 'spinach', 'almondButter'], description: 'Scrambled egg with spinach and almond butter' }] },
          { time: 'Lunch', options: [{ foods: ['lamb', 'carrots', 'hummus'], description: 'Lamb with carrots and hummus' }] },
          { time: 'Dinner', options: [{ foods: ['sardines', 'sweetPotato', 'oliveOil'], description: 'Sardines (mashed) with sweet potato and olive oil' }] }
        ]
      },
      {
        day: 7,
        meals: [
          { time: 'Breakfast', options: [{ foods: ['egg', 'avocado', 'peanutButter'], description: 'Scrambled egg with avocado and peanut butter' }] },
          { time: 'Lunch', options: [{ foods: ['chicken', 'butternutSquash', 'tahini'], description: 'Chicken with butternut squash and tahini' }] },
          { time: 'Dinner', options: [{ foods: ['whitefish', 'broccoli', 'oliveOil'], description: 'White fish with broccoli and olive oil' }] }
        ]
      }
    ]
  },
  'month2': {
    name: 'Month 2: Age 7 Months',
    ageRange: '7 months',
    goals: ['Three meals daily established', 'Daily animal-source food (WHO)', 'Maintain all allergen exposures 3x weekly', 'Increase texture complexity'],
    days: [
      {
        day: 1,
        meals: [
          { time: 'Breakfast', options: [{ foods: ['egg', 'avocado', 'peanutButter'], description: 'Scrambled egg with avocado and peanut butter' }] },
          { time: 'Lunch', options: [{ foods: ['beef', 'sweetPotato', 'kale', 'oliveOil'], description: 'Ground beef with sweet potato, kale, and olive oil' }] },
          { time: 'Dinner', options: [{ foods: ['salmon', 'butternutSquash', 'tahini'], description: 'Salmon with butternut squash and tahini drizzle' }] }
        ]
      },
      {
        day: 2,
        meals: [
          { time: 'Breakfast', options: [{ foods: ['egg', 'avocado', 'almondButter'], description: 'Hard-boiled egg mashed with avocado and almond butter' }] },
          { time: 'Lunch', options: [{ foods: ['chickenLiver', 'sweetPotato', 'oliveOil'], description: 'Chicken liver pate (1-2 tsp) with sweet potato and olive oil' }] },
          { time: 'Dinner', options: [{ foods: ['lentils', 'spinach', 'carrots', 'tahini'], description: 'Lentils with spinach, carrots, and tahini' }] }
        ]
      },
      {
        day: 3,
        meals: [
          { time: 'Breakfast', options: [{ foods: ['egg', 'spinach', 'tahini'], description: 'Scrambled egg with spinach and tahini' }] },
          { time: 'Lunch', options: [{ foods: ['mackerel', 'peas', 'oliveOil'], description: 'Mackerel (fatty fish) with peas and olive oil' }] },
          { time: 'Dinner', options: [{ foods: ['lamb', 'carrots', 'peanutButter'], description: 'Ground lamb with vegetables and peanut butter mixed in' }] }
        ]
      },
      {
        day: 4,
        meals: [
          { time: 'Breakfast', options: [{ foods: ['egg', 'avocado'], description: 'Mashed egg yolk with avocado' }] },
          { time: 'Lunch', options: [{ foods: ['beef', 'butternutSquash', 'almondButter'], description: 'Ground beef with butternut squash and almond butter' }] },
          { time: 'Dinner', options: [{ foods: ['whitefish', 'broccoli', 'oliveOil'], description: 'White fish with broccoli and olive oil' }] }
        ]
      },
      {
        day: 5,
        meals: [
          { time: 'Breakfast', options: [{ foods: ['egg', 'carrots', 'peanutButter'], description: 'Scrambled egg with vegetables and peanut butter' }] },
          { time: 'Lunch', options: [{ foods: ['salmon', 'sweetPotato', 'egg'], description: 'Salmon patty (salmon + potato + egg binder) with vegetables' }] },
          { time: 'Dinner', options: [{ foods: ['chicken', 'sweetPotato', 'tahini'], description: 'Chicken with sweet potato and tahini' }] }
        ]
      },
      {
        day: 6,
        meals: [
          { time: 'Breakfast', options: [{ foods: ['egg', 'avocado', 'bamba'], description: 'Hard-boiled egg with avocado and Bamba (crushed)' }] },
          { time: 'Lunch', options: [{ foods: ['lamb', 'carrots', 'hummus'], description: 'Ground lamb with vegetables and hummus' }] },
          { time: 'Dinner', options: [{ foods: ['sardines', 'sweetPotato', 'oliveOil'], description: 'Sardines (mashed) with sweet potato and olive oil' }] }
        ]
      },
      {
        day: 7,
        meals: [
          { time: 'Breakfast', options: [{ foods: ['egg', 'avocado'], description: 'Omelet with avocado (if baby handles texture)' }] },
          { time: 'Lunch', options: [{ foods: ['beef', 'spinach', 'almondButter'], description: 'Beef with vegetables and almond butter' }] },
          { time: 'Dinner', options: [{ foods: ['whitefish', 'peas', 'tahini'], description: 'White fish with peas and tahini' }] }
        ]
      }
    ]
  },
  'month3': {
    name: 'Month 3: Age 8 Months',
    ageRange: '8 months',
    goals: ['Increase texture complexity toward chopped foods', 'Transition to family meal adaptations', 'Expand vegetable variety significantly'],
    days: [
      {
        day: 1,
        meals: [
          { time: 'Breakfast', options: [{ foods: ['egg', 'spinach'], description: 'Omelet strips with spinach (finger food)' }] },
          { time: 'Lunch', options: [{ foods: ['beef', 'egg', 'carrots', 'tahini'], description: 'Meatballs (beef + egg binder) with roasted vegetable strips and tahini dip' }] },
          { time: 'Dinner', options: [{ foods: ['salmon', 'broccoli', 'oliveOil'], description: 'Salmon fishcake with steamed broccoli and olive oil' }] }
        ]
      },
      {
        day: 2,
        meals: [
          { time: 'Breakfast', options: [{ foods: ['egg', 'avocado', 'bamba'], description: 'Scrambled egg with avocado and Bamba on the side' }] },
          { time: 'Lunch', options: [{ foods: ['chicken', 'hummus'], description: 'Chicken thigh (very tender, shredded) with hummus and cucumber' }] },
          { time: 'Dinner', options: [{ foods: ['lamb', 'sweetPotato', 'almondButter'], description: 'Ground lamb with sweet potato mash and almond butter' }] }
        ]
      },
      {
        day: 3,
        meals: [
          { time: 'Breakfast', options: [{ foods: ['egg', 'avocado', 'peanutButter'], description: 'Hard-boiled egg with avocado slices and peanut butter' }] },
          { time: 'Lunch', options: [{ foods: ['whitefish', 'tahini', 'carrots'], description: 'White fish with tahini sauce and vegetables' }] },
          { time: 'Dinner', options: [{ foods: ['beef', 'broccoli', 'oliveOil'], description: 'Beef with soft-cooked vegetables and olive oil' }] }
        ]
      },
      {
        day: 4,
        meals: [
          { time: 'Breakfast', options: [{ foods: ['egg', 'carrots', 'almondButter'], description: 'Scrambled egg with vegetables and almond butter' }] },
          { time: 'Lunch', options: [{ foods: ['sardines', 'avocado'], description: 'Sardines (mashed) with avocado on soft bread' }] },
          { time: 'Dinner', options: [{ foods: ['chicken', 'butternutSquash', 'tahini'], description: 'Chicken meatballs with vegetables and tahini' }] }
        ]
      },
      {
        day: 5,
        meals: [
          { time: 'Breakfast', options: [{ foods: ['egg', 'avocado'], description: 'Egg patty (scrambled egg formed into patty) with avocado' }] },
          { time: 'Lunch', options: [{ foods: ['beef', 'sweetPotato', 'peanutButter'], description: 'Ground beef with vegetables and peanut butter' }] },
          { time: 'Dinner', options: [{ foods: ['mackerel', 'peas', 'oliveOil'], description: 'Mackerel with mashed potato and peas, olive oil' }] }
        ]
      },
      {
        day: 6,
        meals: [
          { time: 'Breakfast', options: [{ foods: ['egg', 'spinach', 'tahini'], description: 'Omelet with vegetables and tahini' }] },
          { time: 'Lunch', options: [{ foods: ['lamb', 'chickenLiver', 'carrots'], description: 'Lamb meatloaf (with small amount liver) with vegetables' }] },
          { time: 'Dinner', options: [{ foods: ['salmon', 'quinoa', 'oliveOil'], description: 'Salmon with quinoa and olive oil' }] }
        ]
      },
      {
        day: 7,
        meals: [
          { time: 'Breakfast', options: [{ foods: ['egg', 'salmon', 'avocado'], description: 'Scrambled egg with smoked fish and avocado' }] },
          { time: 'Lunch', options: [{ foods: ['beef', 'sweetPotato', 'almondButter'], description: 'Slow-cooked beef (shredded) with root vegetables and almond butter' }] },
          { time: 'Dinner', options: [{ foods: ['lentils', 'oliveOil'], description: 'Lentil dal with olive oil and soft chapati' }] }
        ]
      }
    ]
  },
  'month4-6': {
    name: 'Months 4-6: Ages 9-12 Months',
    ageRange: '9-12 months',
    goals: ['Transition to family meals', 'Maintain daily animal-source food', 'Sustain allergen exposures through toddlerhood', 'Establish healthy eating patterns'],
    days: [
      {
        day: 1,
        meals: [
          { time: 'Breakfast', options: [{ foods: ['egg', 'spinach', 'mushrooms', 'avocado'], description: 'Egg scramble with spinach, mushrooms, avocado' }] },
          { time: 'Lunch', options: [{ foods: ['beef', 'carrots', 'oliveOil'], description: 'Beef stew with root vegetables, bone broth, olive oil' }] },
          { time: 'Dinner', options: [{ foods: ['salmon', 'sweetPotato', 'broccoli'], description: 'Salmon with sweet potato mash and broccoli trees' }] },
          { time: 'Snack', options: [{ foods: ['egg', 'almondButter'], description: 'Hard-boiled egg with almond butter' }] }
        ]
      },
      {
        day: 2,
        meals: [
          { time: 'Breakfast', options: [{ foods: ['egg', 'peanutButter', 'avocado'], description: 'Scrambled egg with peanut butter and avocado' }] },
          { time: 'Lunch', options: [{ foods: ['chicken', 'hummus', 'carrots'], description: 'Chicken thighs (shredded) with hummus and vegetables' }] },
          { time: 'Dinner', options: [{ foods: ['lamb', 'tahini', 'butternutSquash'], description: 'Lamb meatballs with tahini sauce and roasted vegetables' }] },
          { time: 'Snack', options: [{ foods: ['avocado', 'bamba'], description: 'Avocado slices, Bamba' }] }
        ]
      },
      {
        day: 3,
        meals: [
          { time: 'Breakfast', options: [{ foods: ['egg', 'carrots', 'tahini'], description: 'Omelet with vegetables and tahini' }] },
          { time: 'Lunch', options: [{ foods: ['lentils', 'oliveOil'], description: 'Lentil soup (thick) with olive oil and soft bread' }] },
          { time: 'Dinner', options: [{ foods: ['whitefish', 'peas', 'carrots'], description: 'White fish with pea puree and carrot sticks' }] },
          { time: 'Snack', options: [{ foods: ['egg'], description: 'Hard-boiled egg with sunflower seed butter' }] }
        ]
      },
      {
        day: 4,
        meals: [
          { time: 'Breakfast', options: [{ foods: ['egg', 'beef', 'spinach'], description: 'Egg muffins (baked with vegetables and ground beef)' }] },
          { time: 'Lunch', options: [{ foods: ['turkey', 'butternutSquash', 'almondButter'], description: 'Ground turkey with butternut squash and almond butter' }] },
          { time: 'Dinner', options: [{ foods: ['sardines', 'avocado'], description: 'Sardines mashed with avocado on toast' }] },
          { time: 'Snack', options: [{ foods: ['hummus', 'carrots'], description: 'Hummus with soft vegetable sticks' }] }
        ]
      },
      {
        day: 5,
        meals: [
          { time: 'Breakfast', options: [{ foods: ['egg', 'salmon', 'avocado'], description: 'Scrambled eggs with smoked salmon and avocado' }] },
          { time: 'Lunch', options: [{ foods: ['mackerel', 'peas', 'oliveOil'], description: 'Mackerel (fatty fish) with mashed potato and peas' }] },
          { time: 'Dinner', options: [{ foods: ['chicken', 'sweetPotato', 'oliveOil'], description: 'Slow-cooked chicken with vegetables and olive oil' }] },
          { time: 'Snack', options: [{ foods: ['cashewButter'], description: 'Cashew butter on banana slices' }] }
        ]
      },
      {
        day: 6,
        meals: [
          { time: 'Breakfast', options: [{ foods: ['egg', 'spinach', 'broccoli'], description: 'Egg and vegetable frittata (baked)' }] },
          { time: 'Lunch', options: [{ foods: ['beef', 'carrots', 'oliveOil'], description: 'Beef and vegetable casserole with bone broth' }] },
          { time: 'Dinner', options: [{ foods: ['whitefish', 'sweetPotato', 'oliveOil'], description: 'Fish pie (white fish, potato, olive oil)' }] },
          { time: 'Snack', options: [{ foods: ['avocado', 'peanutButter'], description: 'Avocado with peanut butter' }] }
        ]
      },
      {
        day: 7,
        meals: [
          { time: 'Breakfast', options: [{ foods: ['egg', 'chickenLiver', 'spinach'], description: 'Scrambled eggs with chicken liver (small amount) and vegetables' }] },
          { time: 'Lunch', options: [{ foods: ['lamb', 'carrots', 'butternutSquash'], description: 'Lamb stew with barley and vegetables' }] },
          { time: 'Dinner', options: [{ foods: ['salmon', 'broccoli', 'peas'], description: 'Salmon fishcakes with steamed vegetables' }] },
          { time: 'Snack', options: [{ foods: ['egg', 'almondButter'], description: 'Hard-boiled egg, almond butter on apple slices' }] }
        ]
      }
    ]
  }
};

// Main App Component
function BabyFeedingTracker() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [babyProfile, setBabyProfile] = useState(() => {
    const saved = localStorage.getItem('babyProfile');
    return saved ? JSON.parse(saved) : {
      name: '',
      birthDate: '',
      weight: [],
      height: []
    };
  });
  
  const [feedingLog, setFeedingLog] = useState(() => {
    const saved = localStorage.getItem('feedingLog');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedWeek, setSelectedWeek] = useState('week1-2');
  const [expandedFood, setExpandedFood] = useState(null);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('babyProfile', JSON.stringify(babyProfile));
  }, [babyProfile]);

  useEffect(() => {
    localStorage.setItem('feedingLog', JSON.stringify(feedingLog));
  }, [feedingLog]);

  // Calculate baby's age in months
  const getAgeInMonths = () => {
    if (!babyProfile.birthDate) return 0;
    const birth = new Date(babyProfile.birthDate);
    const now = new Date();
    const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
    return months;
  };

  // Get appropriate serving size based on age
  const getServingSize = (foodId) => {
    const ageMonths = getAgeInMonths();
    const food = FOOD_DATABASE[foodId];
    if (!food) return '';
    
    if (ageMonths >= 10) return food.servingSize['10-12mo'];
    if (ageMonths >= 8) return food.servingSize['8-9mo'];
    return food.servingSize['6-7mo'];
  };

  // Add feeding entry
  const addFeedingEntry = (mealData) => {
    const entry = {
      id: Date.now(),
      date: new Date().toISOString(),
      ...mealData
    };
    setFeedingLog([entry, ...feedingLog]);
  };

  // Get allergen tracking data
  const getAllergenStats = () => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const recentFeeds = feedingLog.filter(log => new Date(log.date) >= weekAgo);
    
    const allergenCounts = {
      peanut: 0,
      egg: 0,
      sesame: 0,
      fish: 0,
      'tree nuts': 0
    };
    
    recentFeeds.forEach(feed => {
      feed.foods?.forEach(foodId => {
        const food = FOOD_DATABASE[foodId];
        food?.allergens.forEach(allergen => {
          allergenCounts[allergen] = (allergenCounts[allergen] || 0) + 1;
        });
      });
    });
    
    return allergenCounts;
  };

  // Dashboard View
  const DashboardView = () => {
    const ageMonths = getAgeInMonths();
    const allergenStats = getAllergenStats();
    const latestWeight = babyProfile.weight[babyProfile.weight.length - 1];
    const latestHeight = babyProfile.height[babyProfile.height.length - 1];

    return (
      <div className="p-4 space-y-6">
        {/* Baby Profile Card */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <Baby className="w-8 h-8 text-indigo-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{babyProfile.name || 'Baby'}</h2>
              <p className="text-gray-600">{ageMonths} months old</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Scale className="w-5 h-5 text-indigo-600" />
                <span className="text-sm text-gray-600">Weight</span>
              </div>
              <p className="text-2xl font-bold text-gray-800">
                {latestWeight ? `${latestWeight.value} kg` : '-'}
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Ruler className="w-5 h-5 text-indigo-600" />
                <span className="text-sm text-gray-600">Height</span>
              </div>
              <p className="text-2xl font-bold text-gray-800">
                {latestHeight ? `${latestHeight.value} cm` : '-'}
              </p>
            </div>
          </div>
        </div>

        {/* Weekly Allergen Tracker */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-green-600" />
            Allergen Exposure (Last 7 Days)
          </h3>
          
          <div className="space-y-3">
            {Object.entries(allergenStats).map(([allergen, count]) => (
              <div key={allergen}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium capitalize">{allergen}</span>
                  <span className={`text-sm font-bold ${count >= 3 ? 'text-green-600' : 'text-orange-600'}`}>
                    {count}/3 minimum
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${count >= 3 ? 'bg-green-600' : 'bg-orange-400'}`}
                    style={{ width: `${Math.min((count / 3) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Feeds */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Clock className="w-6 h-6 text-indigo-600" />
            Recent Feeds
          </h3>
          
          {feedingLog.slice(0, 5).map(feed => (
            <div key={feed.id} className="border-b border-gray-100 py-3 last:border-0">
              <div className="flex justify-between items-start mb-1">
                <span className="text-sm font-medium text-gray-800">{feed.mealType}</span>
                <span className="text-xs text-gray-500">
                  {new Date(feed.date).toLocaleDateString()} {new Date(feed.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
              <p className="text-sm text-gray-600">{feed.description}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <button
          onClick={() => setCurrentView('log')}
          className="w-full bg-indigo-600 text-white rounded-xl py-4 font-semibold shadow-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-5 h-5 inline mr-2" />
          Log New Feed
        </button>
      </div>
    );
  };

  // Meal Plan View
  const MealPlanView = () => {
    const plan = MEAL_PLANS[selectedWeek];
    
    return (
      <div className="p-4 space-y-4">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
          <h2 className="text-2xl font-bold mb-2">{plan.name}</h2>
          <p className="text-indigo-100 mb-4">Age: {plan.ageRange}</p>
          
          <div className="space-y-2">
            <p className="font-semibold">Goals:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {plan.goals.map((goal, idx) => (
                <li key={idx}>{goal}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Week Selection */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {Object.entries(MEAL_PLANS).map(([key, value]) => (
            <button
              key={key}
              onClick={() => setSelectedWeek(key)}
              className={`px-4 py-2 rounded-xl whitespace-nowrap font-medium transition-colors ${
                selectedWeek === key
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {value.name.split(':')[0]}
            </button>
          ))}
        </div>

        {/* Daily Meals */}
        <div className="space-y-4">
          {plan.days.map(day => (
            <div key={day.day} className="bg-white rounded-2xl p-5 shadow-lg">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Day {day.day}</h3>
              
              {day.meals.map((meal, mealIdx) => (
                <div key={mealIdx} className="mb-4 last:mb-0">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-5 h-5 text-indigo-600" />
                    <span className="font-semibold text-gray-700">{meal.time}</span>
                  </div>
                  
                  {meal.allergenIntro && (
                    <div className="bg-orange-50 border-l-4 border-orange-400 p-3 mb-3 rounded">
                      <p className="text-sm font-semibold text-orange-800 mb-1">
                        Allergen Introduction: {FOOD_DATABASE[meal.allergenIntro.food]?.name}
                      </p>
                      <p className="text-xs text-orange-700">{meal.allergenIntro.note}</p>
                    </div>
                  )}
                  
                  <div className="space-y-3">
                    {meal.options.map((option, optIdx) => (
                      <div key={optIdx} className="bg-gray-50 rounded-xl p-4">
                        <p className="font-medium text-gray-800 mb-2">{option.description}</p>
                        
                        <div className="space-y-2">
                          {option.foods.map(foodId => {
                            const food = FOOD_DATABASE[foodId];
                            return (
                              <div key={foodId}>
                                <button
                                  onClick={() => setExpandedFood(expandedFood === foodId ? null : foodId)}
                                  className="w-full flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
                                >
                                  <div className="flex items-center gap-2">
                                    <Apple className="w-4 h-4 text-green-600" />
                                    <span className="text-sm font-medium">{food.name}</span>
                                    {food.allergens.length > 0 && (
                                      <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                                        Allergen
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-600">{getServingSize(foodId)}</span>
                                    {expandedFood === foodId ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                  </div>
                                </button>
                                
                                {expandedFood === foodId && (
                                  <div className="mt-2 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                                    <div className="mb-3">
                                      <p className="text-xs font-semibold text-indigo-900 mb-1">Benefits:</p>
                                      <ul className="list-disc list-inside space-y-1">
                                        {food.benefits.map((benefit, idx) => (
                                          <li key={idx} className="text-xs text-gray-700">{benefit}</li>
                                        ))}
                                      </ul>
                                    </div>
                                    
                                    <div>
                                      <p className="text-xs font-semibold text-indigo-900 mb-1">Research Sources:</p>
                                      <ul className="space-y-1">
                                        {food.sources.map((source, idx) => (
                                          <li key={idx} className="text-xs text-gray-700 flex items-start gap-1">
                                            <ExternalLink className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                            <span>{source}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Feed Logging View
  const LogFeedView = () => {
    const [mealType, setMealType] = useState('breakfast');
    const [selectedFoods, setSelectedFoods] = useState([]);
    const [amount, setAmount] = useState('');
    const [notes, setNotes] = useState('');

    const handleSubmit = () => {
      if (selectedFoods.length === 0) return;
      
      const description = selectedFoods.map(id => FOOD_DATABASE[id].name).join(', ');
      
      addFeedingEntry({
        mealType,
        foods: selectedFoods,
        amount,
        notes,
        description
      });
      
      // Reset form
      setSelectedFoods([]);
      setAmount('');
      setNotes('');
      setCurrentView('dashboard');
    };

    return (
      <div className="p-4 space-y-4">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
          <h2 className="text-2xl font-bold mb-2">Log Feed</h2>
          <p className="text-green-100">Track what your baby ate</p>
        </div>

        {/* Meal Type */}
        <div className="bg-white rounded-2xl p-5 shadow-lg">
          <label className="block text-sm font-semibold text-gray-700 mb-3">Meal Type</label>
          <div className="grid grid-cols-3 gap-2">
            {['breakfast', 'lunch', 'dinner', 'snack'].map(type => (
              <button
                key={type}
                onClick={() => setMealType(type)}
                className={`py-3 rounded-xl font-medium capitalize transition-colors ${
                  mealType === type
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Food Selection */}
        <div className="bg-white rounded-2xl p-5 shadow-lg">
          <label className="block text-sm font-semibold text-gray-700 mb-3">Foods Consumed</label>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {Object.entries(FOOD_DATABASE).map(([id, food]) => (
              <button
                key={id}
                onClick={() => {
                  if (selectedFoods.includes(id)) {
                    setSelectedFoods(selectedFoods.filter(f => f !== id));
                  } else {
                    setSelectedFoods([...selectedFoods, id]);
                  }
                }}
                className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                  selectedFoods.includes(id)
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-800">{food.name}</span>
                  <span className="text-xs text-gray-600">{getServingSize(id)}</span>
                </div>
                {food.allergens.length > 0 && (
                  <div className="mt-1">
                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                      {food.allergens.join(', ')}
                    </span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Amount & Notes */}
        <div className="bg-white rounded-2xl p-5 shadow-lg space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Approximate Amount</label>
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g., 2 tbsp, most of the serving, ½ bowl"
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any observations, reactions, preferences..."
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={selectedFoods.length === 0}
          className="w-full bg-green-600 text-white rounded-xl py-4 font-semibold shadow-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Save Feed Entry
        </button>
      </div>
    );
  };

  // Progress/Analytics View
  const ProgressView = () => {
    const weightData = babyProfile.weight.map(w => ({
      date: new Date(w.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      weight: w.value
    }));

    const heightData = babyProfile.height.map(h => ({
      date: new Date(h.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      height: h.value
    }));

    // Allergen exposure over time
    const allergenData = Object.entries(getAllergenStats()).map(([allergen, count]) => ({
      allergen: allergen.charAt(0).toUpperCase() + allergen.slice(1),
      exposures: count,
      target: 3
    }));

    return (
      <div className="p-4 space-y-6">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white shadow-lg">
          <h2 className="text-2xl font-bold mb-2">Growth & Progress</h2>
          <p className="text-purple-100">Track your baby's development</p>
        </div>

        {/* Weight Chart */}
        {weightData.length > 0 && (
          <div className="bg-white rounded-2xl p-5 shadow-lg">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Weight Trend</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={weightData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" style={{ fontSize: '12px' }} />
                <YAxis style={{ fontSize: '12px' }} />
                <Tooltip />
                <Line type="monotone" dataKey="weight" stroke="#6366f1" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Height Chart */}
        {heightData.length > 0 && (
          <div className="bg-white rounded-2xl p-5 shadow-lg">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Height Trend</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={heightData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" style={{ fontSize: '12px' }} />
                <YAxis style={{ fontSize: '12px' }} />
                <Tooltip />
                <Line type="monotone" dataKey="height" stroke="#10b981" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Allergen Exposure Chart */}
        <div className="bg-white rounded-2xl p-5 shadow-lg">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Weekly Allergen Exposure</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={allergenData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="allergen" style={{ fontSize: '12px' }} />
              <YAxis style={{ fontSize: '12px' }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="exposures" fill="#6366f1" name="Actual" />
              <Bar dataKey="target" fill="#22c55e" name="Target (3x)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Add Measurements */}
        <div className="bg-white rounded-2xl p-5 shadow-lg space-y-4">
          <h3 className="text-lg font-bold text-gray-800">Add Measurements</h3>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Weight (kg)</label>
            <input
              type="number"
              step="0.1"
              placeholder="e.g., 7.5"
              className="w-full p-3 border border-gray-300 rounded-xl"
              onBlur={(e) => {
                if (e.target.value) {
                  setBabyProfile({
                    ...babyProfile,
                    weight: [...babyProfile.weight, { date: new Date().toISOString(), value: parseFloat(e.target.value) }]
                  });
                  e.target.value = '';
                }
              }}
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Height (cm)</label>
            <input
              type="number"
              step="0.1"
              placeholder="e.g., 67.5"
              className="w-full p-3 border border-gray-300 rounded-xl"
              onBlur={(e) => {
                if (e.target.value) {
                  setBabyProfile({
                    ...babyProfile,
                    height: [...babyProfile.height, { date: new Date().toISOString(), value: parseFloat(e.target.value) }]
                  });
                  e.target.value = '';
                }
              }}
            />
          </div>
        </div>
      </div>
    );
  };

  // Profile Settings View
  const ProfileView = () => {
    return (
      <div className="p-4 space-y-4">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-6 text-white shadow-lg">
          <h2 className="text-2xl font-bold mb-2">Baby Profile</h2>
          <p className="text-blue-100">Manage your baby's information</p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-lg space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Baby's Name</label>
            <input
              type="text"
              value={babyProfile.name}
              onChange={(e) => setBabyProfile({ ...babyProfile, name: e.target.value })}
              placeholder="Enter name"
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Birth Date</label>
            <input
              type="date"
              value={babyProfile.birthDate}
              onChange={(e) => setBabyProfile({ ...babyProfile, birthDate: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Info Cards */}
        <div className="bg-blue-50 rounded-2xl p-5 border-l-4 border-blue-600">
          <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
            <Info className="w-5 h-5" />
            About This App
          </h3>
          <p className="text-sm text-blue-800">
            This app is based on evidence from Israeli LEAP study, WHO 2023 guidelines, Scandinavian research, and New Zealand BLISS study. All recommendations prioritize early allergen introduction, daily iron-rich animal foods, and healthy fats for brain development.
          </p>
        </div>
      </div>
    );
  };

  // Bottom Navigation
  const BottomNav = () => {
    const navItems = [
      { id: 'dashboard', icon: TrendingUp, label: 'Dashboard' },
      { id: 'meals', icon: Apple, label: 'Meals' },
      { id: 'log', icon: Plus, label: 'Log' },
      { id: 'progress', icon: Calendar, label: 'Progress' },
      { id: 'profile', icon: Baby, label: 'Profile' }
    ];

    return (
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="flex justify-around items-center h-16">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                currentView === item.id
                  ? 'text-indigo-600'
                  : 'text-gray-500'
              }`}
            >
              <item.icon className="w-6 h-6" />
              <span className="text-xs mt-1">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 shadow-lg">
        <h1 className="text-2xl font-bold">Baby Feeding Tracker</h1>
        <p className="text-indigo-100 text-sm">Evidence-based nutrition for your baby</p>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto">
        {currentView === 'dashboard' && <DashboardView />}
        {currentView === 'meals' && <MealPlanView />}
        {currentView === 'log' && <LogFeedView />}
        {currentView === 'progress' && <ProgressView />}
        {currentView === 'profile' && <ProfileView />}
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}

// Mount the app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<BabyFeedingTracker />);
