import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, TrendingUp, BookOpen, CheckCircle, Plus, Info, Menu, Baby, Scale, Ruler, Clock, Apple, ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';

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
          {
            time: 'Breakfast',
            options: [
              { foods: ['egg', 'avocado', 'peanutButter'], description: 'Scrambled egg with avocado and peanut butter' }
            ]
          },
          {
            time: 'Lunch',
            options: [
              { foods: ['beef', 'sweetPotato', 'spinach', 'oliveOil'], description: 'Ground beef with sweet potato, spinach, olive oil' }
            ]
          },
          {
            time: 'Dinner',
            options: [
              { foods: ['chicken', 'broccoli', 'tahini'], description: 'Chicken with broccoli and tahini' }
            ]
          }
        ]
      }
    ]
  },
  'month2': {
    name: 'Month 2: Age 7 Months',
    ageRange: '7 months',
    goals: ['Three meals daily', 'Daily animal food', 'Maintain allergen exposure'],
    days: []
  }
};

// Main App Component
export default function BabyFeedingTracker() {
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
