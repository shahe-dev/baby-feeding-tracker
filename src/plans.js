import { getCompletedMonths, localDateKey } from "./domain.js";
import { getEvidenceSource } from "./evidence.js";

const meal = (time, foods, description, extra = {}) => ({
  time,
  options: [{ foods, description }],
  ...extra,
});
const sharedGuidance = [
  "Menu ideas are optional. Use foods suitable for your child and keep existing allergy restrictions.",
  "Check ingredient labels; adjust every recipe for feeding skills and confirmed dietary needs.",
  "Start with a small helping and offer more when wanted; stop when your child signals fullness.",
  "Keep your child seated upright and supervise eating. Prepare food to suit their chewing and swallowing skills.",
];
const infantGuidance = [
  ...sharedGuidance,
  "These are recipe ideas retained from the earlier plan. Numbered days are choices, not a required timetable for introducing foods or allergens.",
  "Complementary foods begin around six months. Adapt the number of meals and texture to feeding experience, appetite and your child's individual advice.",
  "Continue usual breast milk or prescribed formula feeds. These recipes do not assess the complete diet or replace a feeding plan.",
  "Use allergen-containing recipes only when that ingredient is already tolerated under your child's individual plan. The menu does not instruct first introductions.",
];
const planSourceIds = ["who2023", "whoResponsive", "blissProtocol", "leap"];
const planSources = planSourceIds.map(getEvidenceSource);
const infantEvidenceNote =
  "The recipes, portions, numbered days and meal times are practical adaptations retained from the project, not a validated WHO, LEAP or BLISS menu. Sources support specific principles, not this exact schedule.";
const toddlerSourceIds = [
  "who2023", "whoResponsive", "blissProtocol", "leap", "nordic2023", "otis",
];
const snackFruitPreparation = {
  banana: "Peel a ripe banana and mash the soft flesh.",
  pear: "Peel and core the pear; cook until soft and mash.",
  apple: "Peel and core the apple; cook until soft and mash.",
};
const optionalPeanutSnack = (fruitId, fruitDescription) => ({
  time: "Afternoon snack",
  optional: true,
  options: [
    {
      foods: [fruitId, "peanutButter"],
      title: `${fruitId[0].toUpperCase()}${fruitId.slice(1)} and peanut butter`,
      steps: [
        snackFruitPreparation[fruitId],
        "Only if peanut is already tolerated, stir smooth peanut butter through the fruit until well thinned with no sticky lumps.",
      ],
      description: `${fruitDescription} with smooth peanut butter well thinned into food, only if peanut is already tolerated`,
    },
    {
      foods: [fruitId, "avocado"],
      title: `${fruitId[0].toUpperCase()}${fruitId.slice(1)} and avocado`,
      steps: [
        snackFruitPreparation[fruitId],
        "Remove the avocado skin and stone, mash the soft flesh and serve with the fruit.",
      ],
      description: `${fruitDescription} with soft mashed avocado`,
    },
  ],
});

export const MEAL_PLANS = {
  "week1-2": {
    name: "Early meal ideas at 6 months",
    ageRange: "6 months",
    goals: [
      "Start solids when developmentally ready",
      "Try small tastes and soft textures",
      "Use tolerated foods and follow individual allergy advice",
    ],
    guidance: [...infantGuidance],
    evidenceNote: infantEvidenceNote,
    sourceIds: planSourceIds,
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
              note: "Use this recipe only if the named allergen is already tolerated under your child’s individual plan. Numbered days do not set an introduction schedule. Confirm what was actually eaten when logging.",
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
                note: "Use this recipe only if the named allergen is already tolerated under your child’s individual plan. Numbered days do not set an introduction schedule. Confirm what was actually eaten when logging.",
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
                note: "Use this recipe only if the named allergen is already tolerated under your child’s individual plan. Numbered days do not set an introduction schedule. Confirm what was actually eaten when logging.",
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
                note: "Use this recipe only if the named allergen is already tolerated under your child’s individual plan. Numbered days do not set an introduction schedule. Confirm what was actually eaten when logging.",
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
                note: "Use this recipe only if the named allergen is already tolerated under your child’s individual plan. Numbered days do not set an introduction schedule. Confirm what was actually eaten when logging.",
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
                note: "Use this recipe only if the named allergen is already tolerated under your child’s individual plan. Numbered days do not set an introduction schedule. Confirm what was actually eaten when logging.",
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
                note: "Use this recipe only if the named allergen is already tolerated under your child’s individual plan. Numbered days do not set an introduction schedule. Confirm what was actually eaten when logging.",
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
    ageRange: "6 months, with some feeding experience",
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
    evidenceNote: infantEvidenceNote,
    sourceIds: planSourceIds,
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
      "Build regular meals around appetite and feeding experience",
      "Offer varied protein foods and starches",
      "Build confidence with soft textures",
    ],
    guidance: [...infantGuidance],
    evidenceNote: infantEvidenceNote,
    sourceIds: planSourceIds,
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
    evidenceNote: infantEvidenceNote,
    sourceIds: planSourceIds,
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
      "Offer manageable meals alongside usual milk feeds",
      "Adapt textures to your child’s ability",
      "Keep food variety and familiar favourites",
    ],
    guidance: [...infantGuidance],
    evidenceNote: infantEvidenceNote,
    sourceIds: planSourceIds,
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
    name: "Family meals at 12–23 months",
    ageRange: "12–23 completed months",
    goals: [
      "Include an iron-rich food, an energy-rich food and fruit or vegetables at main meals",
      "Include meat, fish or eggs across the day, with varied legumes and grains",
      "Support self-feeding and appetite-led portions",
    ],
    guidance: [
      ...sharedGuidance,
      "The three meal slots and two optional snacks are a planning convenience. Move, skip or adapt them to appetite and your usual routine.",
      "Each main meal includes foods chosen for iron, energy and fruit or vegetable variety. Ingredient checks describe composition; they cannot establish nutrient adequacy.",
      "These recipes use no dairy. Check every packaged ingredient and keep the existing milk-allergy restriction and prescribed feeding plan.",
      "Breastfeeding can continue. These sources do not establish an individual milk replacement or supplement plan for a child with milk allergy.",
      "Use small servings, offer more when wanted and avoid pressure to finish. Prepare meals without added salt or sugar.",
      "Peanut is an optional snack choice on three separate days only for children already tolerating it. Choose the avocado alternative when peanut is unsuitable. No first introduction or catch-up schedule is prescribed.",
      "LEAP used 6 g of peanut protein per week across at least three meals after infant introduction. Three meal ticks do not establish that dose; this menu does not calculate or prescribe it, or set a quota for other allergens.",
    ],
    evidenceNote:
      "These exact recipes, portions and meal times are practical adaptations, not a validated study menu or a nutritionally assessed individual diet. WHO and BLISS inform composition; LEAP supplies peanut-specific context. NNR2023 and OTIS are newly reviewed Nordic sources, not confirmed original documents.",
    sourceIds: toddlerSourceIds,
    sources: toddlerSourceIds.map(getEvidenceSource),
    days: [
      {
        day: 1,
        meals: [
          meal(
            "Breakfast",
            ["egg", "spinach", "avocado", "bread"],
            "Fully cooked scrambled egg with finely chopped cooked spinach, mashed avocado and seed-free wheat toast",
            {
              title: "Spinach eggs and avocado toast",
              steps: [
                "Cook the spinach until soft and chop finely. Scramble with the egg until fully cooked.",
                "Mash the avocado and spread onto lightly toasted, seed-free wheat bread.",
                "Serve the eggs alongside, with textures and pieces adjusted to feeding skills.",
              ],
            },
          ),
          meal(
            "Lunch",
            ["beef", "sweetPotato", "broccoli", "oliveOil"],
            "Moist minced beef with sweet potato mash, soft broccoli and olive oil",
            {
              title: "Beef and sweet potato mash",
              steps: [
                "Cook the minced beef thoroughly, keeping it moist and breaking up firm pieces.",
                "Cook the sweet potato and broccoli until soft; mash the sweet potato.",
                "Stir olive oil through the mash and serve with the beef and soft broccoli.",
              ],
            },
          ),
          meal(
            "Dinner",
            ["lentils", "carrots", "courgette", "rice", "oliveOil"],
            "Thick lentil, carrot and courgette stew with soft rice and olive oil",
            {
              title: "Lentil and vegetable rice bowl",
              steps: [
                "Cook the lentils, carrots and courgette until very soft, then mash or chop as needed.",
                "Cook the rice until soft and keep it moist.",
                "Stir olive oil into the lentils and vegetables and serve with the rice.",
              ],
            },
          ),
          meal(
            "Morning snack",
            ["pear"],
            "Soft ripe pear, peeled and cut to suit feeding skills",
            {
              title: "Soft pear pieces",
              steps: [
                "Peel a soft ripe pear and remove the core and seeds.",
                "Cut into manageable pieces, or mash if needed for feeding skills.",
              ],
              optional: true,
            },
          ),
          optionalPeanutSnack("banana", "Mashed ripe banana"),
        ],
      },
      {
        day: 2,
        meals: [
          meal(
            "Breakfast",
            ["chickpeas", "tomato", "avocado", "bread"],
            "Mashed chickpeas and avocado on seed-free wheat toast, with soft cooked tomato",
            {
              title: "Chickpea and avocado toast",
              steps: [
                "Cook the chickpeas until very soft and mash with ripe avocado.",
                "Cook the tomato until soft and cut or mash as needed.",
                "Spread the chickpea mixture thinly onto lightly toasted, seed-free wheat bread; serve with tomato.",
              ],
            },
          ),
          meal(
            "Lunch",
            ["salmon", "lentils", "broccoli", "oliveOil"],
            "Cooked, carefully deboned salmon with soft lentils, broccoli and olive oil",
            {
              title: "Salmon with lentils and broccoli",
              steps: [
                "Cook the salmon through, remove the skin and check carefully for bones before flaking.",
                "Cook the lentils and broccoli until soft enough to mash.",
                "Stir olive oil into the lentils and serve with the salmon flakes and broccoli.",
              ],
            },
          ),
          meal(
            "Dinner",
            ["chicken", "sweetPotato", "peas", "oliveOil"],
            "Tender shredded chicken with sweet potato, flattened peas and olive oil",
            {
              title: "Chicken and sweet potato bowl",
              steps: [
                "Cook the chicken thoroughly until tender; remove bones and skin and shred finely.",
                "Cook the sweet potato and peas until soft, then mash the potato and flatten the peas.",
                "Mix olive oil into the sweet potato and serve with the chicken and peas.",
              ],
            },
          ),
          meal(
            "Morning snack",
            ["banana"],
            "Soft ripe banana pieces",
            {
              title: "Ripe banana pieces",
              steps: [
                "Peel a ripe banana and check that the flesh is soft.",
                "Cut into manageable pieces or mash to suit feeding skills.",
              ],
              optional: true,
            },
          ),
          meal(
            "Afternoon snack",
            ["hummus", "carrots"],
            "A thin hummus spread on soft cooked carrot pieces, if its ingredients are tolerated",
            {
              title: "Soft carrots with hummus",
              steps: [
                "Cook the carrots until soft enough to mash and cut into manageable pieces.",
                "Check the hummus ingredients against existing restrictions, then use it as a thin spread on the carrots.",
              ],
              optional: true,
            },
          ),
        ],
      },
      {
        day: 3,
        meals: [
          meal(
            "Breakfast",
            ["tofu", "spinach", "avocado", "bread"],
            "Soft tofu with finely chopped cooked spinach, mashed avocado and seed-free wheat toast",
            {
              title: "Tofu and spinach with avocado toast",
              steps: [
                "Cook the spinach until soft and chop finely; warm the soft tofu and break it into manageable pieces.",
                "Mash ripe avocado and spread onto lightly toasted, seed-free wheat bread.",
                "Serve the tofu and spinach alongside the toast.",
              ],
            },
          ),
          meal(
            "Lunch",
            ["lamb", "quinoa", "butternutSquash", "oliveOil"],
            "Tender minced lamb with moist quinoa, soft butternut squash and olive oil",
            {
              title: "Lamb and squash with quinoa",
              steps: [
                "Cook the minced lamb thoroughly until tender, breaking up firm pieces.",
                "Cook the quinoa and peeled butternut squash until soft; keep the quinoa moist.",
                "Mash or chop the squash as needed and stir in olive oil before serving with the lamb and quinoa.",
              ],
            },
          ),
          meal(
            "Dinner",
            ["beans", "potato", "tomato", "oliveOil"],
            "Mashed beans and soft potato with cooked tomato and olive oil",
            {
              title: "Beans and potato with tomato",
              steps: [
                "Cook the beans fully until very soft and mash; cook the potato until soft.",
                "Cook the tomato until soft and stir through olive oil.",
                "Spoon the beans and tomato over the potato, mashing or breaking it up as needed.",
              ],
            },
          ),
          meal(
            "Morning snack",
            ["mango"],
            "Soft ripe mango pieces without skin or stone",
            {
              title: "Soft mango pieces",
              steps: [
                "Peel a ripe mango and remove the stone.",
                "Cut soft flesh into manageable pieces or mash to suit feeding skills.",
              ],
              optional: true,
            },
          ),
          meal(
            "Afternoon snack",
            ["apple", "almondButter"],
            "Soft cooked apple with smooth almond butter well thinned into it, if almond is tolerated",
            {
              title: "Apple and almond butter",
              steps: [
                "Peel and core the apple; cook until soft and mash.",
                "If almond is already tolerated, stir smooth almond butter through the apple until well thinned with no sticky lumps.",
              ],
              optional: true,
            },
          ),
        ],
      },
      {
        day: 4,
        meals: [
          meal(
            "Breakfast",
            ["egg", "tomato", "bread", "oliveOil"],
            "Fully cooked scrambled egg with soft tomato and olive oil, served with seed-free wheat toast",
            {
              title: "Tomato eggs with toast",
              steps: [
                "Cook the tomato in olive oil until soft.",
                "Add beaten egg and scramble until fully cooked.",
                "Serve with lightly toasted, seed-free wheat bread, cut to suit feeding skills.",
              ],
            },
          ),
          meal(
            "Lunch",
            ["lentils", "sweetPotato", "spinach", "oliveOil"],
            "Thick lentil and sweet potato stew with finely chopped cooked spinach and olive oil",
            {
              title: "Lentil and sweet potato stew",
              steps: [
                "Cook the lentils and peeled sweet potato until very soft.",
                "Add finely chopped spinach and cook until soft.",
                "Mash to the desired texture and stir through olive oil.",
              ],
            },
          ),
          meal(
            "Dinner",
            ["turkey", "barley", "peas", "carrots", "oliveOil"],
            "Tender minced turkey with very soft mashed barley, flattened peas, tender carrots and olive oil",
            {
              title: "Turkey and barley with vegetables",
              steps: [
                "Cook the minced turkey thoroughly until tender and break up firm pieces.",
                "Cook the barley, peas and carrots until very soft; mash the barley, flatten the peas and cut or mash the carrots.",
                "Stir through olive oil and serve together, keeping the mixture moist.",
              ],
            },
          ),
          meal(
            "Morning snack",
            ["berries"],
            "Soft berries, mashed or flattened as needed",
            {
              title: "Mashed berries",
              steps: [
                "Wash the berries and remove any stems or hard parts.",
                "Mash or flatten the soft fruit to suit feeding skills.",
              ],
              optional: true,
            },
          ),
          optionalPeanutSnack("pear", "Soft cooked pear, mashed"),
        ],
      },
      {
        day: 5,
        meals: [
          meal(
            "Breakfast",
            ["chickpeas", "avocado", "tomato", "bread"],
            "Mashed chickpeas with avocado and soft cooked tomato, served with seed-free wheat toast",
            {
              title: "Chickpea and avocado bowl",
              steps: [
                "Cook the chickpeas until very soft and mash with ripe avocado.",
                "Cook the tomato until soft and cut or mash as needed.",
                "Serve together with lightly toasted, seed-free wheat bread.",
              ],
            },
          ),
          meal(
            "Lunch",
            ["beef", "pasta", "courgette", "tomato", "oliveOil"],
            "Moist minced beef and courgette in cooked tomato and olive-oil sauce, with soft egg-free wheat pasta",
            {
              title: "Beef and courgette pasta",
              steps: [
                "Cook the minced beef thoroughly, breaking it up, with the courgette until tender.",
                "Add tomato and olive oil and cook until the vegetables are soft and the sauce is moist.",
                "Cook the egg-free wheat pasta until soft; cut as needed and mix with the sauce.",
              ],
            },
          ),
          meal(
            "Dinner",
            ["whitefish", "beans", "broccoli", "potato", "oliveOil"],
            "Cooked, carefully deboned white fish with mashed beans, soft potato, broccoli and olive oil",
            {
              title: "White fish with bean and potato mash",
              steps: [
                "Cook the fish through, remove the skin and check carefully for bones before flaking.",
                "Cook the beans fully until very soft; cook the potato and broccoli until soft.",
                "Mash the beans and potato with olive oil and serve with fish flakes and soft broccoli.",
              ],
            },
          ),
          meal(
            "Morning snack",
            ["orange"],
            "Chopped orange flesh with seeds and tough membranes removed",
            {
              title: "Soft orange pieces",
              steps: [
                "Peel the orange and remove seeds and tough membranes.",
                "Chop the soft flesh into manageable pieces.",
              ],
              optional: true,
            },
          ),
          meal(
            "Afternoon snack",
            ["avocado", "bread"],
            "Mashed avocado on seed-free wheat toast",
            {
              title: "Avocado toast",
              steps: [
                "Remove the avocado skin and stone and mash the soft flesh.",
                "Spread thinly on lightly toasted, seed-free wheat bread and cut to suit feeding skills.",
              ],
              optional: true,
            },
          ),
        ],
      },
      {
        day: 6,
        meals: [
          meal(
            "Breakfast",
            ["egg", "spinach", "avocado"],
            "Fully cooked spinach omelette, cut to suit feeding skills, with soft avocado",
            {
              title: "Spinach omelette with avocado",
              steps: [
                "Cook the spinach until soft, chop finely and mix with beaten egg.",
                "Cook the omelette until fully set, then cut into manageable pieces.",
                "Serve with ripe avocado, mashed or cut as needed.",
              ],
            },
          ),
          meal(
            "Lunch",
            ["beans", "rice", "cauliflower", "tomato", "oliveOil"],
            "Mashed beans with soft cauliflower and tomato, served with moist rice and olive oil",
            {
              title: "Bean and cauliflower rice bowl",
              steps: [
                "Cook the beans fully until very soft and mash; cook the rice until soft and keep it moist.",
                "Cook the cauliflower and tomato until soft and mash or chop as needed.",
                "Stir olive oil into the beans and vegetables and serve with the rice.",
              ],
            },
          ),
          meal(
            "Dinner",
            ["chicken", "lentils", "sweetPotato", "oliveOil"],
            "Tender shredded chicken in a thick lentil and sweet potato stew with olive oil",
            {
              title: "Chicken and lentil stew",
              steps: [
                "Cook the chicken thoroughly until tender; remove bones and skin and shred finely.",
                "Cook the lentils and peeled sweet potato until very soft, then mash as needed.",
                "Stir in the chicken and olive oil, keeping the stew moist.",
              ],
            },
          ),
          meal(
            "Morning snack",
            ["mango"],
            "Soft ripe mango pieces without skin or stone",
            {
              title: "Soft mango pieces",
              steps: [
                "Peel a ripe mango and remove the stone.",
                "Cut soft flesh into manageable pieces or mash to suit feeding skills.",
              ],
              optional: true,
            },
          ),
          optionalPeanutSnack("apple", "Soft cooked apple, mashed"),
        ],
      },
      {
        day: 7,
        meals: [
          meal(
            "Breakfast",
            ["oats", "banana", "egg", "almondButter"],
            "Soft porridge cooked in water with mashed banana and smooth almond butter stirred through, with fully cooked egg alongside",
            {
              title: "Banana and almond porridge with egg",
              steps: [
                "Cook the oats in water until soft; mash the ripe banana and stir it through.",
                "Mix smooth almond butter thoroughly into the porridge until well thinned with no sticky lumps.",
                "Cook the egg until the white and yolk are firm; mash or cut and serve alongside.",
              ],
            },
          ),
          meal(
            "Lunch",
            ["lamb", "carrots", "potato", "oliveOil"],
            "Moist minced lamb stew with tender carrots, soft potato and olive oil",
            {
              title: "Lamb, carrot and potato stew",
              steps: [
                "Cook the minced lamb thoroughly, breaking up firm pieces.",
                "Add peeled potato and carrots and cook until the meat is tender and vegetables are very soft.",
                "Mash or cut as needed and stir through olive oil, keeping the stew moist.",
              ],
            },
          ),
          meal(
            "Dinner",
            ["lentils", "courgette", "spinach", "chapati", "oliveOil"],
            "Thick lentils with soft courgette, finely chopped cooked spinach and olive oil, with softened dairy-free wheat chapati",
            {
              title: "Lentils and greens with chapati",
              steps: [
                "Cook the lentils, courgette and finely chopped spinach until soft.",
                "Mash as needed and stir through olive oil.",
                "Check the wheat chapati is dairy-free, soften it with the lentil mixture and cut to suit feeding skills.",
              ],
            },
          ),
          meal(
            "Morning snack",
            ["berries", "pear"],
            "Mashed berries with soft ripe pear pieces",
            {
              title: "Pear and berries",
              steps: [
                "Wash the berries; peel and core a soft ripe pear.",
                "Mash the berries and cut or mash the pear to suit feeding skills, then serve together.",
              ],
              optional: true,
            },
          ),
          meal(
            "Afternoon snack",
            ["hummus", "carrots"],
            "A thin hummus spread on soft cooked carrot pieces, if its ingredients are tolerated",
            {
              title: "Soft carrots with hummus",
              steps: [
                "Cook the carrots until soft enough to mash and cut into manageable pieces.",
                "Check the hummus ingredients against existing restrictions, then use it as a thin spread on the carrots.",
              ],
              optional: true,
            },
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
