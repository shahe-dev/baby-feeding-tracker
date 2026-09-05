import { getCompletedMonths, localDateKey } from "./domain.js";
import { SOURCES } from "./catalog.js";

const meal = (time, foods, description, extra = {}) => ({
  time,
  options: [{ foods, description }],
  ...extra,
});
const sourceByLabel = (prefix) =>
  SOURCES.find((item) => item.label.startsWith(prefix));
const sharedGuidance = [
  "Menu ideas are optional. Use foods suitable for your child and keep existing allergy restrictions.",
  "Check ingredient labels; adjust every recipe for feeding skills and confirmed dietary needs.",
  "Start with a small helping and offer more when wanted; stop when your child signals fullness.",
  "Keep your child seated upright and supervise eating. Prepare food to suit their chewing and swallowing skills.",
];
const infantGuidance = [
  ...sharedGuidance,
  "Breast milk or suitable infant formula remains the main drink before 12 months. Continue prescribed feeds.",
  "Offer small tastes when starting solids around six months, then build meals gradually. Between meals under one, offer milk feeds if hungry.",
  "Introduce new allergens one at a time. With an existing food allergy or eczema, seek advice before introducing foods.",
];
const planSources = [
  sourceByLabel("NHS: feeding"),
  sourceByLabel("NHS: introducing"),
  sourceByLabel("CDC: food"),
  sourceByLabel("CDC: hunger"),
];

export const MEAL_PLANS = {
  "week1-2": {
    name: "First tastes at 6 months",
    ageRange: "6 months",
    goals: [
      "Start solids when developmentally ready",
      "Try small tastes and soft textures",
      "Introduce new allergens individually with appropriate advice",
    ],
    guidance: [...infantGuidance],
    sources: planSources,
    days: [
      {
        day: 1,
        meals: [
          {
            time: "Mid-morning",
            options: [
              {
                foods: ["beef", "sweetPotato", "oliveOil", "peanutButter"],
                description:
                  "Pureed beef with sweet potato and olive oil; optional thinned peanut butter",
              },
              {
                foods: ["lamb", "sweetPotato", "oliveOil", "peanutButter"],
                description:
                  "Pureed lamb with sweet potato and olive oil; optional thinned peanut butter",
              },
            ],
            allergenIntro: {
              food: "peanutButter",
              note: "Optional only if suitable for your child. Introduce one new allergen at a time. With an existing allergy or eczema, follow your clinician’s advice. Confirm what was actually eaten when logging.",
            },
          },
        ],
      },
      {
        day: 2,
        meals: [
          meal(
            "Mid-morning",
            ["chicken", "carrots", "peanutButter"],
            "Pureed chicken with carrots, peanut butter mixed in",
            {
              allergenIntro: {
                food: "peanutButter",
                note: "Optional only if suitable for your child. Introduce one new allergen at a time. With an existing allergy or eczema, follow your clinician’s advice. Confirm what was actually eaten when logging.",
              },
            },
          ),
        ],
      },
      {
        day: 3,
        meals: [
          meal(
            "Mid-morning",
            ["beef", "sweetPotato", "peanutButter"],
            "Beef with sweet potato and peanut butter",
            {
              allergenIntro: {
                food: "peanutButter",
                note: "Optional only if suitable for your child. Introduce one new allergen at a time. With an existing allergy or eczema, follow your clinician’s advice. Confirm what was actually eaten when logging.",
              },
            },
          ),
        ],
      },
      {
        day: 4,
        meals: [
          meal(
            "Mid-morning",
            ["lamb", "carrots", "oliveOil", "egg"],
            "Lamb with carrots and olive oil; optional fully cooked egg",
            {
              allergenIntro: {
                food: "egg",
                note: "Optional only if suitable for your child. Introduce one new allergen at a time. With an existing allergy or eczema, follow your clinician’s advice. Confirm what was actually eaten when logging.",
              },
            },
          ),
          meal(
            "Afternoon",
            ["chicken", "sweetPotato", "peanutButter"],
            "Chicken with sweet potato, peanut butter",
          ),
        ],
      },
      {
        day: 5,
        meals: [
          meal(
            "Mid-morning",
            ["beef", "sweetPotato", "egg"],
            "Beef with sweet potato and fully cooked whole egg",
            {
              allergenIntro: {
                food: "egg",
                note: "Optional only if suitable for your child. Introduce one new allergen at a time. With an existing allergy or eczema, follow your clinician’s advice. Confirm what was actually eaten when logging.",
              },
            },
          ),
          meal(
            "Afternoon",
            ["chicken", "carrots", "peanutButter"],
            "Chicken with carrots and peanut butter",
          ),
        ],
      },
      {
        day: 6,
        meals: [
          meal(
            "Mid-morning",
            ["lamb", "carrots", "egg"],
            "Lamb with carrots and whole scrambled egg",
            {
              allergenIntro: {
                food: "egg",
                note: "Optional only if suitable for your child. Introduce one new allergen at a time. With an existing allergy or eczema, follow your clinician’s advice. Confirm what was actually eaten when logging.",
              },
            },
          ),
          meal(
            "Afternoon",
            ["beef", "sweetPotato", "peanutButter"],
            "Beef with sweet potato and peanut butter",
          ),
        ],
      },
      {
        day: 7,
        meals: [
          meal(
            "Mid-morning",
            ["chicken", "sweetPotato", "tahini"],
            "Chicken with sweet potato and tahini",
            {
              allergenIntro: {
                food: "tahini",
                note: "Optional only if suitable for your child. Introduce one new allergen at a time. With an existing allergy or eczema, follow your clinician’s advice. Confirm what was actually eaten when logging.",
              },
            },
          ),
          meal(
            "Afternoon",
            ["beef", "carrots", "egg"],
            "Beef with carrots and egg",
          ),
        ],
      },
    ],
  },
  "week3-4": {
    name: "Building variety at 6 months",
    ageRange: "6 months, after the first two weeks of solids",
    goals: [
      "Choose meals to fit readiness and appetite",
      "Add a wider range of foods",
      "Repeat tolerated foods without a fixed exposure quota",
    ],
    guidance: [
      ...infantGuidance,
      ...[
        "Choose from these meal ideas as your baby gains experience; there is no requirement to complete every meal.",
      ],
    ],
    sources: planSources,
    days: [
      {
        day: 1,
        meals: [
          meal(
            "Breakfast",
            ["egg", "avocado", "peanutButter"],
            "Scrambled egg with avocado and peanut butter",
          ),
          meal(
            "Lunch",
            ["beef", "sweetPotato", "spinach", "oliveOil"],
            "Ground beef with sweet potato, spinach, olive oil",
          ),
          meal(
            "Dinner",
            ["chicken", "broccoli", "tahini"],
            "Chicken with broccoli and tahini",
          ),
        ],
      },
      {
        day: 2,
        meals: [
          meal(
            "Breakfast",
            ["beef", "avocado"],
            "Pureed beef mixed into mashed avocado",
          ),
          meal(
            "Lunch",
            ["salmon", "carrots", "oliveOil"],
            "Salmon with carrots and olive oil",
          ),
          meal(
            "Dinner",
            ["egg", "spinach", "almondButter"],
            "Scrambled egg with spinach and almond butter",
          ),
        ],
      },
      {
        day: 3,
        meals: [
          meal(
            "Breakfast",
            ["egg", "avocado"],
            "Mashed fully cooked whole egg with avocado",
          ),
          meal(
            "Lunch",
            ["lamb", "butternutSquash", "tahini"],
            "Lamb with butternut squash and tahini",
          ),
          meal(
            "Dinner",
            ["whitefish", "peas", "oliveOil"],
            "White fish with peas and olive oil",
          ),
        ],
      },
      {
        day: 4,
        meals: [
          meal(
            "Breakfast",
            ["chicken", "sweetPotato", "peanutButter"],
            "Ground chicken with sweet potato and peanut butter",
          ),
          meal(
            "Lunch",
            ["lentils", "spinach", "oliveOil"],
            "Lentils (very soft) with spinach and olive oil",
          ),
          meal(
            "Dinner",
            ["egg", "carrots", "tahini"],
            "Scrambled egg with vegetables and tahini",
          ),
        ],
      },
      {
        day: 5,
        meals: [
          meal(
            "Breakfast",
            ["egg", "avocado", "tahini"],
            "Egg with avocado and tahini",
          ),
          meal(
            "Lunch",
            ["beef", "broccoli", "oliveOil"],
            "Ground beef with broccoli and olive oil",
          ),
          meal(
            "Dinner",
            ["lentils", "sweetPotato", "peanutButter"],
            "Soft lentils with sweet potato and thinned peanut butter",
          ),
        ],
      },
      {
        day: 6,
        meals: [
          meal(
            "Breakfast",
            ["egg", "spinach", "almondButter"],
            "Scrambled egg with spinach and almond butter",
          ),
          meal(
            "Lunch",
            ["lamb", "carrots", "hummus"],
            "Lamb with carrots and hummus",
          ),
          meal(
            "Dinner",
            ["turkey", "sweetPotato", "oliveOil"],
            "Tender minced turkey with sweet potato and olive oil",
          ),
        ],
      },
      {
        day: 7,
        meals: [
          meal(
            "Breakfast",
            ["egg", "avocado", "peanutButter"],
            "Scrambled egg with avocado and peanut butter",
          ),
          meal(
            "Lunch",
            ["chicken", "butternutSquash", "tahini"],
            "Chicken with butternut squash and tahini",
          ),
          meal(
            "Dinner",
            ["beans", "broccoli", "oliveOil"],
            "Mashed beans with soft broccoli and olive oil",
          ),
        ],
      },
    ],
  },
  month2: {
    name: "Meals at 7 months",
    ageRange: "7 months",
    goals: [
      "Gradually work towards three meals",
      "Offer varied protein foods and starches",
      "Build confidence with soft textures",
    ],
    guidance: [...infantGuidance],
    sources: planSources,
    days: [
      {
        day: 1,
        meals: [
          meal(
            "Breakfast",
            ["egg", "avocado", "peanutButter"],
            "Scrambled egg with avocado and peanut butter",
          ),
          meal(
            "Lunch",
            ["beef", "sweetPotato", "kale", "oliveOil"],
            "Ground beef with sweet potato, kale, and olive oil",
          ),
          meal(
            "Dinner",
            ["salmon", "butternutSquash", "tahini"],
            "Salmon with butternut squash and tahini drizzle",
          ),
        ],
      },
      {
        day: 2,
        meals: [
          meal(
            "Breakfast",
            ["egg", "avocado", "almondButter"],
            "Hard-boiled egg mashed with avocado and almond butter",
          ),
          meal(
            "Lunch",
            ["chicken", "sweetPotato", "oliveOil"],
            "Finely shredded chicken with sweet potato and olive oil",
          ),
          meal(
            "Dinner",
            ["lentils", "spinach", "carrots", "tahini"],
            "Lentils with spinach, carrots, and tahini",
          ),
        ],
      },
      {
        day: 3,
        meals: [
          meal(
            "Breakfast",
            ["egg", "spinach", "tahini"],
            "Scrambled egg with spinach and tahini",
          ),
          meal(
            "Lunch",
            ["mackerel", "peas", "oliveOil"],
            "Mackerel (fatty fish) with peas and olive oil",
          ),
          meal(
            "Dinner",
            ["lamb", "carrots", "peanutButter"],
            "Ground lamb with vegetables and peanut butter mixed in",
          ),
        ],
      },
      {
        day: 4,
        meals: [
          meal(
            "Breakfast",
            ["egg", "avocado"],
            "Mashed fully cooked whole egg with avocado",
          ),
          meal(
            "Lunch",
            ["beef", "butternutSquash", "almondButter"],
            "Ground beef with butternut squash and almond butter",
          ),
          meal(
            "Dinner",
            ["tofu", "broccoli", "oliveOil"],
            "Soft tofu with broccoli and olive oil",
          ),
        ],
      },
      {
        day: 5,
        meals: [
          meal(
            "Breakfast",
            ["egg", "carrots", "peanutButter"],
            "Scrambled egg with vegetables and peanut butter",
          ),
          meal(
            "Lunch",
            ["chicken", "potato", "egg", "broccoli"],
            "Soft chicken and potato patty bound with fully cooked egg, with broccoli",
          ),
          meal(
            "Dinner",
            ["chicken", "sweetPotato", "tahini"],
            "Chicken with sweet potato and tahini",
          ),
        ],
      },
      {
        day: 6,
        meals: [
          meal(
            "Breakfast",
            ["egg", "avocado", "bamba"],
            "Hard-boiled egg with avocado and fully softened peanut puffs",
          ),
          meal(
            "Lunch",
            ["lamb", "carrots", "hummus"],
            "Ground lamb with vegetables and hummus",
          ),
          meal(
            "Dinner",
            ["lentils", "sweetPotato", "oliveOil"],
            "Soft lentils with sweet potato and olive oil",
          ),
        ],
      },
      {
        day: 7,
        meals: [
          meal(
            "Breakfast",
            ["egg", "avocado"],
            "Omelet with avocado (if baby handles texture)",
          ),
          meal(
            "Lunch",
            ["beef", "spinach", "almondButter"],
            "Beef with vegetables and almond butter",
          ),
          meal(
            "Dinner",
            ["turkey", "peas", "tahini"],
            "Tender turkey with mashed peas and thinned tahini",
          ),
        ],
      },
    ],
  },
  month3: {
    name: "Meals at 8 months",
    ageRange: "8 months",
    goals: [
      "Adapt family recipes to feeding skills",
      "Practise soft finger foods and self-feeding",
      "Offer varied tastes without pressure",
    ],
    guidance: [...infantGuidance],
    sources: planSources,
    days: [
      {
        day: 1,
        meals: [
          meal(
            "Breakfast",
            ["egg", "spinach"],
            "Omelet strips with spinach (finger food)",
          ),
          meal(
            "Lunch",
            ["beef", "egg", "carrots", "tahini"],
            "Soft beef-and-egg patty, broken up, with cooked carrots and thinned tahini",
          ),
          meal(
            "Dinner",
            ["salmon", "potato", "egg", "broccoli", "oliveOil"],
            "Soft salmon, potato and fully cooked egg fishcake, broken up, with broccoli and olive oil",
          ),
        ],
      },
      {
        day: 2,
        meals: [
          meal(
            "Breakfast",
            ["egg", "avocado", "bamba"],
            "Scrambled egg with avocado and fully softened peanut puffs",
          ),
          meal(
            "Lunch",
            ["chicken", "hummus", "cucumber"],
            "Very tender shredded chicken with hummus and finely grated cucumber",
          ),
          meal(
            "Dinner",
            ["lamb", "sweetPotato", "almondButter"],
            "Ground lamb with sweet potato mash and almond butter",
          ),
        ],
      },
      {
        day: 3,
        meals: [
          meal(
            "Breakfast",
            ["egg", "avocado", "peanutButter"],
            "Hard-boiled egg with avocado slices and peanut butter",
          ),
          meal(
            "Lunch",
            ["whitefish", "tahini", "carrots"],
            "White fish with tahini sauce and vegetables",
          ),
          meal(
            "Dinner",
            ["beef", "broccoli", "oliveOil"],
            "Beef with soft-cooked vegetables and olive oil",
          ),
        ],
      },
      {
        day: 4,
        meals: [
          meal(
            "Breakfast",
            ["egg", "carrots", "almondButter"],
            "Scrambled egg with vegetables and almond butter",
          ),
          meal(
            "Lunch",
            ["hummus", "avocado", "bread"],
            "Hummus and mashed avocado on seed-free, lightly toasted wheat bread",
          ),
          meal(
            "Dinner",
            ["chicken", "butternutSquash", "tahini"],
            "Tender minced chicken with soft butternut squash and thinned tahini",
          ),
        ],
      },
      {
        day: 5,
        meals: [
          meal(
            "Breakfast",
            ["egg", "avocado"],
            "Egg patty (scrambled egg formed into patty) with avocado",
          ),
          meal(
            "Lunch",
            ["beef", "sweetPotato", "peanutButter"],
            "Ground beef with vegetables and peanut butter",
          ),
          meal(
            "Dinner",
            ["lentils", "potato", "peas", "oliveOil"],
            "Soft lentils with mashed potato, flattened peas and olive oil",
          ),
        ],
      },
      {
        day: 6,
        meals: [
          meal(
            "Breakfast",
            ["egg", "spinach", "tahini"],
            "Omelet with vegetables and tahini",
          ),
          meal(
            "Lunch",
            ["lamb", "carrots"],
            "Moist minced lamb with soft cooked carrots",
          ),
          meal(
            "Dinner",
            ["turkey", "quinoa", "oliveOil"],
            "Tender turkey with moist quinoa and olive oil",
          ),
        ],
      },
      {
        day: 7,
        meals: [
          meal(
            "Breakfast",
            ["egg", "tomato", "avocado"],
            "Fully cooked scrambled egg with soft tomato and avocado",
          ),
          meal(
            "Lunch",
            ["beef", "sweetPotato", "almondButter"],
            "Slow-cooked beef (shredded) with root vegetables and almond butter",
          ),
          meal(
            "Dinner",
            ["lentils", "oliveOil", "chapati"],
            "Thick mashed lentils with olive oil and softened dairy-free wheat chapati",
          ),
        ],
      },
    ],
  },
  "month4-6": {
    name: "Meals at 9–11 months",
    ageRange: "9–11 months",
    goals: [
      "Offer three meals alongside milk feeds",
      "Adapt textures to your child’s ability",
      "Keep food variety and familiar favourites",
    ],
    guidance: [...infantGuidance],
    sources: planSources,
    days: [
      {
        day: 1,
        meals: [
          {
            time: "Breakfast",
            options: [
              {
                foods: ["egg", "spinach", "mushrooms", "avocado"],
                description: "Egg scramble with spinach, mushrooms, avocado",
              },
              {
                foods: ["egg", "almondButter"],
                description: "Hard-boiled egg with almond butter",
              },
            ],
          },
          meal(
            "Lunch",
            ["beef", "carrots", "potato", "oliveOil"],
            "Beef stew with soft carrots, potato and olive oil, cooked in water without added salt",
          ),
          meal(
            "Dinner",
            ["salmon", "sweetPotato", "broccoli"],
            "Salmon with sweet potato mash and broccoli trees",
          ),
        ],
      },
      {
        day: 2,
        meals: [
          {
            time: "Breakfast",
            options: [
              {
                foods: ["egg", "peanutButter", "avocado"],
                description: "Scrambled egg with peanut butter and avocado",
              },
              {
                foods: ["avocado", "bamba"],
                description: "Avocado slices, fully softened peanut puffs",
              },
            ],
          },
          meal(
            "Lunch",
            ["chicken", "hummus", "carrots"],
            "Chicken thighs (shredded) with hummus and vegetables",
          ),
          meal(
            "Dinner",
            ["lamb", "tahini", "butternutSquash"],
            "Tender minced lamb with thinned tahini and soft roasted squash",
          ),
        ],
      },
      {
        day: 3,
        meals: [
          {
            time: "Breakfast",
            options: [
              {
                foods: ["egg", "carrots", "tahini"],
                description: "Omelet with vegetables and tahini",
              },
              {
                foods: ["egg", "sunflowerButter"],
                description:
                  "Fully cooked egg with thinned sunflower seed butter",
              },
            ],
          },
          meal(
            "Lunch",
            ["lentils", "oliveOil", "bread"],
            "Thick lentil soup with olive oil and seed-free, lightly toasted wheat bread",
          ),
          meal(
            "Dinner",
            ["whitefish", "peas", "carrots"],
            "Cooked, deboned white fish with mashed peas and soft cooked carrot pieces",
          ),
        ],
      },
      {
        day: 4,
        meals: [
          {
            time: "Breakfast",
            options: [
              {
                foods: ["egg", "beef", "spinach"],
                description:
                  "Egg muffins (baked with vegetables and ground beef)",
              },
              {
                foods: ["hummus", "carrots"],
                description: "Hummus with soft vegetable sticks",
              },
            ],
          },
          meal(
            "Lunch",
            ["turkey", "butternutSquash", "almondButter"],
            "Ground turkey with butternut squash and almond butter",
          ),
          meal(
            "Dinner",
            ["beans", "avocado", "bread"],
            "Mashed beans and avocado on seed-free, lightly toasted wheat bread",
          ),
        ],
      },
      {
        day: 5,
        meals: [
          {
            time: "Breakfast",
            options: [
              {
                foods: ["egg", "tomato", "avocado"],
                description:
                  "Fully cooked scrambled egg with soft tomato and avocado",
              },
              {
                foods: ["cashewButter", "banana"],
                description:
                  "Ripe banana with cashew butter spread very thinly",
              },
            ],
          },
          meal(
            "Lunch",
            ["lentils", "potato", "peas", "oliveOil"],
            "Soft lentils with mashed potato, flattened peas and olive oil",
          ),
          meal(
            "Dinner",
            ["chicken", "sweetPotato", "oliveOil"],
            "Slow-cooked chicken with vegetables and olive oil",
          ),
        ],
      },
      {
        day: 6,
        meals: [
          {
            time: "Breakfast",
            options: [
              {
                foods: ["egg", "spinach", "broccoli"],
                description: "Egg and vegetable frittata (baked)",
              },
              {
                foods: ["avocado", "peanutButter"],
                description: "Avocado with peanut butter",
              },
            ],
          },
          meal(
            "Lunch",
            ["beef", "carrots", "oliveOil"],
            "Tender beef and carrot casserole with olive oil, cooked in water without added salt",
          ),
          meal(
            "Dinner",
            ["chicken", "potato", "oliveOil"],
            "Tender shredded chicken with mashed potato and olive oil",
          ),
        ],
      },
      {
        day: 7,
        meals: [
          {
            time: "Breakfast",
            options: [
              {
                foods: ["egg", "tomato", "spinach"],
                description:
                  "Fully cooked scrambled egg with soft tomato and finely chopped spinach",
              },
              {
                foods: ["egg", "almondButter", "apple"],
                description:
                  "Fully cooked egg and soft cooked apple with a thin almond-butter spread",
              },
            ],
          },
          meal(
            "Lunch",
            ["lamb", "carrots", "butternutSquash", "barley"],
            "Lamb stew with very soft mashed barley, carrots and butternut squash",
          ),
          meal(
            "Dinner",
            ["chickpeas", "potato", "egg", "broccoli", "peas"],
            "Mashed chickpea and potato patty bound with fully cooked egg, with soft broccoli and flattened peas",
          ),
        ],
      },
    ],
  },
  "toddler12-24": {
    name: "Family meals at 12–24 months",
    ageRange: "12–23 completed months",
    goals: [
      "Three meals with optional snacks",
      "Practise cups, spoons and self-feeding",
      "Include familiar foods alongside variety",
    ],
    guidance: [
      ...sharedGuidance,
      "Offer three meals, with up to two snacks when hungry. These example recipes use no dairy; check every packaged ingredient.",
      "Offer water from a cup. Breastfeeding can continue; follow your existing plan for any prescribed formula or milk alternative.",
      "A first birthday does not remove a milk allergy. Discuss suitable milk alternatives and nutritional needs with your clinician.",
      "Use small servings of family food without added salt or sugar; portions shown are starting offers, not intake targets.",
    ],
    sources: [
      sourceByLabel("NHS: food after"),
      sourceByLabel("NHS: foods and drinks"),
      sourceByLabel("NHS: introducing"),
      sourceByLabel("CDC: food"),
      sourceByLabel("CDC: hunger"),
    ],
    days: [
      {
        day: 1,
        meals: [
          meal(
            "Breakfast",
            ["oats", "banana", "peanutButter"],
            "Soft porridge cooked in water with mashed banana and smooth peanut butter stirred through",
          ),
          meal(
            "Lunch",
            ["pasta", "lentils", "tomato", "courgette", "oliveOil"],
            "Soft egg-free wheat pasta with lentil, tomato and courgette sauce",
          ),
          meal(
            "Dinner",
            ["chicken", "potato", "broccoli", "oliveOil"],
            "Tender shredded chicken with potato mash and soft broccoli",
          ),
          meal(
            "Morning snack",
            ["pear"],
            "Soft ripe pear, peeled and cut as needed",
            { optional: true },
          ),
          meal(
            "Afternoon snack",
            ["bread", "hummus"],
            "Seed-free, lightly toasted wheat bread with a thin hummus spread",
            { optional: true },
          ),
        ],
      },
      {
        day: 2,
        meals: [
          meal(
            "Breakfast",
            ["egg", "bread", "avocado"],
            "Fully cooked scrambled egg with avocado and seed-free wheat toast",
          ),
          meal(
            "Lunch",
            ["chickpeas", "rice", "carrots", "tomato", "oliveOil"],
            "Soft mashed chickpeas in tomato sauce with rice and tender carrots",
          ),
          meal(
            "Dinner",
            ["beef", "potato", "peas", "oliveOil"],
            "Moist minced beef and potato bake with flattened peas",
          ),
          meal("Morning snack", ["banana"], "Soft ripe banana pieces", {
            optional: true,
          }),
          meal(
            "Afternoon snack",
            ["soyYogurt", "berries"],
            "Plain fortified soy yoghurt with mashed berries, if soy is suitable",
            { optional: true },
          ),
        ],
      },
      {
        day: 3,
        meals: [
          meal(
            "Breakfast",
            ["oats", "apple", "almondButter"],
            "Porridge cooked in water with soft cooked apple and smooth almond butter stirred through",
          ),
          meal(
            "Lunch",
            ["salmon", "rice", "broccoli", "oliveOil"],
            "Cooked, deboned salmon flakes with soft rice and broccoli",
          ),
          meal(
            "Dinner",
            ["lentils", "sweetPotato", "spinach", "chapati"],
            "Thick lentil and sweet potato stew with finely chopped spinach and softened dairy-free wheat chapati",
          ),
          meal(
            "Morning snack",
            ["mango"],
            "Soft ripe mango pieces without skin or stone",
            { optional: true },
          ),
          meal(
            "Afternoon snack",
            ["avocado", "bread"],
            "Avocado on seed-free, lightly toasted wheat bread",
            { optional: true },
          ),
        ],
      },
      {
        day: 4,
        meals: [
          meal(
            "Breakfast",
            ["egg", "spinach", "bread"],
            "Fully cooked spinach omelette cut to suit feeding skills, with wheat toast",
          ),
          meal(
            "Lunch",
            ["tofu", "pasta", "courgette", "tomato", "oliveOil"],
            "Soft tofu and egg-free wheat pasta in courgette and tomato sauce",
          ),
          meal(
            "Dinner",
            ["turkey", "rice", "carrots", "peas", "oliveOil"],
            "Tender minced turkey with soft rice, carrots and flattened peas",
          ),
          meal("Morning snack", ["pear"], "Soft ripe pear pieces", {
            optional: true,
          }),
          meal(
            "Afternoon snack",
            ["hummus", "carrots"],
            "Hummus with soft cooked carrot pieces",
            { optional: true },
          ),
        ],
      },
      {
        day: 5,
        meals: [
          meal(
            "Breakfast",
            ["bread", "cashewButter", "banana"],
            "Seed-free wheat toast with a very thin cashew-butter spread and soft banana",
          ),
          meal(
            "Lunch",
            ["beans", "potato", "tomato", "oliveOil"],
            "Soft potato topped with mashed beans and cooked tomato",
          ),
          meal(
            "Dinner",
            ["lamb", "quinoa", "butternutSquash", "oliveOil"],
            "Tender minced lamb with moist quinoa and soft butternut squash",
          ),
          meal(
            "Morning snack",
            ["soyYogurt", "mango"],
            "Plain fortified soy yoghurt with soft mango, if soy is suitable",
            { optional: true },
          ),
          meal(
            "Afternoon snack",
            ["apple", "tahini"],
            "Soft cooked apple with a little thinned tahini",
            { optional: true },
          ),
        ],
      },
      {
        day: 6,
        meals: [
          meal(
            "Breakfast",
            ["oats", "pear", "peanutButter"],
            "Porridge cooked in water with soft pear and smooth peanut butter stirred through",
          ),
          meal(
            "Lunch",
            ["whitefish", "potato", "peas", "oliveOil"],
            "Cooked, deboned white fish with potato mash and flattened peas",
          ),
          meal(
            "Dinner",
            ["chickpeas", "rice", "cauliflower", "tomato", "oliveOil"],
            "Mashed chickpeas with soft cauliflower and tomato, served over rice",
          ),
          meal(
            "Morning snack",
            ["berries", "banana"],
            "Mashed berries and soft banana",
            { optional: true },
          ),
          meal(
            "Afternoon snack",
            ["bread", "avocado"],
            "Avocado on seed-free, lightly toasted wheat bread",
            { optional: true },
          ),
        ],
      },
      {
        day: 7,
        meals: [
          meal(
            "Breakfast",
            ["egg", "tomato", "bread"],
            "Fully cooked scrambled egg with soft tomato and seed-free wheat toast",
          ),
          meal(
            "Lunch",
            ["pasta", "chicken", "broccoli", "oliveOil"],
            "Soft egg-free wheat pasta with finely shredded chicken and broccoli",
          ),
          meal(
            "Dinner",
            ["lentils", "rice", "carrots", "spinach", "oliveOil"],
            "Soft lentil and rice pot with tender carrots and finely chopped spinach",
          ),
          meal(
            "Morning snack",
            ["orange"],
            "Chopped orange flesh with seeds and tough membranes removed",
            { optional: true },
          ),
          meal(
            "Afternoon snack",
            ["soyYogurt", "pear"],
            "Plain fortified soy yoghurt with soft pear, if soy is suitable",
            { optional: true },
          ),
        ],
      },
    ],
  },
};

function calendarDayNumber(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    return null;
  const stamp = Date.parse(`${value}T00:00:00Z`);
  if (
    !Number.isFinite(stamp) ||
    new Date(stamp).toISOString().slice(0, 10) !== value
  )
    return null;
  return stamp / 86400000;
}

// Age sets the stage; elapsed solids time is only used within the first month.
// Delaying the start of solids must not keep a toddler on the infant plan.
export function getRecommendedPlanKey(profile, now = new Date()) {
  const age = getCompletedMonths(profile?.birthDate, now);
  if (!Number.isInteger(age) || age < 6 || age >= 24) return null;
  if (age >= 12) return "toddler12-24";
  if (age >= 9) return "month4-6";
  if (age === 8) return "month3";
  if (age === 7) return "month2";
  const start = calendarDayNumber(profile?.solidStartDate);
  const today = calendarDayNumber(localDateKey(now));
  return start !== null && today !== null && today - start >= 14
    ? "week3-4"
    : "week1-2";
}
