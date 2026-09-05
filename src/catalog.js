// Food IDs are stable: existing diary and backup entries refer to these keys.
const source = (label, url) => ({ label, url });
const toddler = source(
  "NHS: food after 12 months",
  "https://www.nhs.uk/best-start-in-life/baby/weaning/what-to-feed-your-baby/over-12-months/",
);
const youngChildren = source(
  "NHS: foods and drinks for young children",
  "https://www.nhs.uk/baby/weaning-and-feeding/what-to-feed-young-children/",
);
const infant = source(
  "NHS: feeding at 7–9 months",
  "https://www.nhs.uk/best-start-in-life/baby/weaning/what-to-feed-your-baby/7-to-9-months/",
);
const allergy = source(
  "NHS: introducing foods and food allergies",
  "https://www.nhs.uk/baby/weaning-and-feeding/food-allergies-in-babies-and-young-children/",
);
const choking = source(
  "CDC: food preparation and choking hazards",
  "https://www.cdc.gov/infant-toddler-nutrition/foods-and-drinks/choking-hazards.html",
);
const hunger = source(
  "CDC: hunger and fullness cues",
  "https://www.cdc.gov/infant-toddler-nutrition/mealtime/signs-your-child-is-hungry-or-full.html",
);
const fish = source(
  "FDA/EPA: choosing fish lower in mercury",
  "https://www.fda.gov/food/consumers/advice-about-eating-fish",
);
const meat = source(
  "NHS: meat, liver and cooking safely",
  "https://www.nhs.uk/live-well/eat-well/food-types/meat-nutrition/",
);
const leap = source(
  "LEAP: trial of peanut consumption in high-risk infants",
  "https://pubmed.ncbi.nlm.nih.gov/25705822/",
);

export const SOURCES = [
  toddler,
  youngChildren,
  infant,
  allergy,
  choking,
  hunger,
  fish,
  meat,
  leap,
];

// These are recording labels, not an exhaustive list of possible food allergies.
// Almond and cashew are separate: eating one does not establish tolerance to both.
export const ALLERGENS = [
  { id: "peanut", label: "Peanut" },
  { id: "egg", label: "Egg" },
  { id: "sesame", label: "Sesame" },
  { id: "fish", label: "Fish" },
  { id: "almond", label: "Almond" },
  { id: "cashew", label: "Cashew" },
  { id: "milk", label: "Milk" },
  { id: "wheat", label: "Wheat" },
  { id: "soy", label: "Soy" },
  { id: "shellfish", label: "Shellfish" },
  { id: "barley", label: "Barley" },
  { id: "oats", label: "Oats" },
  { id: "rye", label: "Rye" },
];

// Practical starting offers, never an amount the child must finish.
// Texture and hunger cues matter as well as calendar age.
const portions = {
  "6-7mo": "A few small tastes; increase with interest",
  "8-9mo": "Start with 1–2 tablespoons; offer more if wanted",
  "10-12mo": "Start with a few spoonfuls or soft pieces",
  "12-24mo": "A small helping of the family meal; offer more if wanted",
};
const spreadPortions = {
  "6-7mo": "A small taste, well thinned into familiar food",
  "8-9mo": "A little, well thinned into food",
  "10-12mo": "A little, thinned or spread thinly",
  "12-24mo": "A thin spread or a little mixed into food",
};
const makeFood = (
  name,
  category,
  allergens,
  preparation,
  sources = [infant, toddler],
  servingSize = portions,
) => ({
  name,
  category,
  allergens,
  preparation,
  sources,
  servingSize: { ...servingSize },
});
const vegetables = "Vegetables";
const fruit = "Fruit";
const grains = "Grains & Starches";
const spreads = "Nuts, Seeds & Spreads";

export const FOOD_DATABASE = {
  beef: makeFood(
    "Beef",
    "Meat & Eggs",
    [],
    "Cook thoroughly; serve moist and finely minced or shredded.",
    [meat, choking],
  ),
  lamb: makeFood(
    "Lamb",
    "Meat & Eggs",
    [],
    "Remove bones and gristle; cook until tender and shred finely.",
    [meat, choking],
  ),
  chicken: makeFood(
    "Chicken",
    "Meat & Eggs",
    [],
    "Cook through, remove bones and skin, then shred into soft pieces.",
    [meat, choking],
  ),
  turkey: makeFood(
    "Turkey",
    "Meat & Eggs",
    [],
    "Cook through; keep minced or shredded meat moist.",
    [meat, choking],
  ),
  chickenLiver: makeFood(
    "Chicken liver (fully cooked)",
    "Meat & Eggs",
    [],
    "Cook through and mash. Liver is rich in vitamin A; discuss an appropriate amount and frequency with your clinician.",
    [meat],
    {
      ...portions,
      "6-7mo": "Use clinician guidance for amount",
      "8-9mo": "Use clinician guidance for amount",
      "10-12mo": "Use clinician guidance for amount",
      "12-24mo": "Use clinician guidance for amount",
    },
  ),
  egg: makeFood(
    "Egg (fully cooked)",
    "Meat & Eggs",
    ["egg"],
    "Cook white and yolk until firm; mash or cut to a manageable texture.",
    [allergy, infant],
  ),
  salmon: makeFood(
    "Salmon",
    "Fish & Shellfish",
    ["fish"],
    "Cook thoroughly and carefully remove all bones; flake.",
    [fish, choking],
  ),
  mackerel: makeFood(
    "Atlantic mackerel",
    "Fish & Shellfish",
    ["fish"],
    "Choose Atlantic mackerel, not king mackerel. Cook through, debone and flake.",
    [fish, choking],
  ),
  whitefish: makeFood(
    "White fish (cod or haddock)",
    "Fish & Shellfish",
    ["fish"],
    "Cook through and remove all bones; serve in soft flakes.",
    [fish, choking],
  ),
  sardines: makeFood(
    "Sardines",
    "Fish & Shellfish",
    ["fish"],
    "Choose lower-salt sardines; remove bones and mash the flesh.",
    [youngChildren, choking],
  ),
  shrimp: makeFood(
    "Prawns or shrimp (fully cooked)",
    "Fish & Shellfish",
    ["shellfish"],
    "Cook thoroughly; remove shell and tail, then finely chop.",
    [allergy, choking],
  ),
  peanutButter: makeFood(
    "Smooth peanut butter",
    spreads,
    ["peanut"],
    "Mix with water or food to thin; never offer a thick spoonful. Check the label for other ingredients.",
    [allergy, choking, leap],
    spreadPortions,
  ),
  bamba: makeFood(
    "Peanut puffs (Bamba)",
    spreads,
    ["peanut"],
    "Check the exact product label for milk and other allergens. Soften fully with water; do not serve hard pieces.",
    [allergy, choking, leap],
    spreadPortions,
  ),
  tahini: makeFood(
    "Tahini (sesame paste)",
    spreads,
    ["sesame"],
    "Stir into food or thin with water until runny.",
    [allergy, choking],
    spreadPortions,
  ),
  almondButter: makeFood(
    "Smooth almond butter",
    spreads,
    ["almond"],
    "Thin into food or spread very thinly; check ingredients for other nuts.",
    [allergy, choking],
    spreadPortions,
  ),
  cashewButter: makeFood(
    "Smooth cashew butter",
    spreads,
    ["cashew"],
    "Thin into food or spread very thinly; check ingredients for other nuts.",
    [allergy, choking],
    spreadPortions,
  ),
  sunflowerButter: makeFood(
    "Smooth sunflower seed butter",
    spreads,
    [],
    "Thin into food or spread very thinly. Check labels for added allergens.",
    [allergy, choking],
    spreadPortions,
  ),
  hummus: makeFood(
    "Hummus (with tahini)",
    "Beans & Pulses",
    ["sesame"],
    "Choose a smooth, lower-salt version; check the ingredients. This entry assumes chickpeas and tahini.",
    [allergy, youngChildren],
    spreadPortions,
  ),
  lentils: makeFood(
    "Lentils",
    "Beans & Pulses",
    [],
    "Cook until soft; mash as needed.",
    [infant],
  ),
  chickpeas: makeFood(
    "Chickpeas",
    "Beans & Pulses",
    [],
    "Cook until very soft; mash before serving.",
    [infant, choking],
  ),
  beans: makeFood(
    "Beans",
    "Beans & Pulses",
    [],
    "Cook until soft and mash; choose no-added-salt beans.",
    [infant, choking],
  ),
  tofu: makeFood(
    "Tofu",
    "Beans & Pulses",
    ["soy"],
    "Use plain tofu; heat according to its instructions and mash or cut softly.",
    [allergy, youngChildren],
  ),
  avocado: makeFood(
    "Avocado",
    fruit,
    [],
    "Use ripe flesh; mash or cut into manageable soft pieces.",
    [infant],
  ),
  banana: makeFood(
    "Banana",
    fruit,
    [],
    "Use ripe fruit; mash or cut into soft pieces.",
    [infant],
  ),
  apple: makeFood(
    "Apple",
    fruit,
    [],
    "Remove the core. Cook until soft or grate finely; avoid hard raw chunks.",
    [infant, choking],
  ),
  pear: makeFood(
    "Pear",
    fruit,
    [],
    "Remove the core; use very ripe pear or cook until soft.",
    [infant],
  ),
  berries: makeFood(
    "Berries",
    fruit,
    [],
    "Wash, remove stalks and mash or flatten; do not serve round berries whole.",
    [infant, choking],
  ),
  mango: makeFood(
    "Mango",
    fruit,
    [],
    "Peel and remove the stone; use ripe, soft flesh.",
    [infant],
  ),
  orange: makeFood(
    "Orange",
    fruit,
    [],
    "Remove peel, seeds and tough membranes; chop flesh.",
    [infant],
  ),
  oliveOil: makeFood(
    "Olive oil",
    "Fats & Oils",
    [],
    "Mix a little into cooked food.",
    [youngChildren],
    {
      "6-7mo": "A little mixed into food",
      "8-9mo": "A little mixed into food",
      "10-12mo": "A little mixed into food",
      "12-24mo": "A little used in cooking or mixed into food",
    },
  ),
  sweetPotato: makeFood(
    "Sweet potato",
    grains,
    [],
    "Cook until soft enough to mash easily.",
    [infant],
  ),
  potato: makeFood(
    "Potato",
    grains,
    [],
    "Cook until soft; mash without added salt.",
    [infant],
  ),
  spinach: makeFood("Spinach", vegetables, [], "Cook and chop leaves finely.", [
    infant,
  ]),
  broccoli: makeFood(
    "Broccoli",
    vegetables,
    [],
    "Steam until tender; mash or offer soft florets as skills allow.",
    [infant],
  ),
  carrots: makeFood(
    "Carrots",
    vegetables,
    [],
    "Cook until soft; avoid hard raw sticks or coin-shaped pieces.",
    [infant, choking],
  ),
  butternutSquash: makeFood(
    "Butternut squash",
    vegetables,
    [],
    "Remove skin and seeds; cook the flesh until soft.",
    [infant],
  ),
  peas: makeFood("Peas", vegetables, [], "Cook and mash or flatten.", [
    infant,
    choking,
  ]),
  kale: makeFood(
    "Kale",
    vegetables,
    [],
    "Remove tough stems; cook and chop finely.",
    [infant],
  ),
  mushrooms: makeFood(
    "Mushrooms",
    vegetables,
    [],
    "Cook until tender and chop finely; use shop-bought edible mushrooms.",
    [toddler],
  ),
  cucumber: makeFood(
    "Cucumber",
    vegetables,
    [],
    "Peel if tough; finely grate or soften for children who cannot manage the texture.",
    [choking],
  ),
  tomato: makeFood(
    "Tomato",
    vegetables,
    [],
    "Cook and chop into sauce; never serve cherry tomatoes whole.",
    [choking],
  ),
  courgette: makeFood(
    "Courgette (zucchini)",
    vegetables,
    [],
    "Cook until tender and cut to suit feeding skills.",
    [infant],
  ),
  cauliflower: makeFood(
    "Cauliflower",
    vegetables,
    [],
    "Cook until soft; mash or cut into tender pieces.",
    [infant],
  ),
  quinoa: makeFood(
    "Quinoa",
    grains,
    [],
    "Rinse, cook until soft, then mix into moist food.",
    [infant],
  ),
  oats: makeFood(
    "Oats or porridge",
    grains,
    ["oats"],
    "Cook into soft porridge with water; record any milk or other ingredients separately.",
    [infant, allergy],
  ),
  rice: makeFood(
    "Rice",
    grains,
    [],
    "Cook until soft; serve as part of a moist meal.",
    [infant],
  ),
  bread: makeFood(
    "Bread or toast (wheat)",
    grains,
    ["wheat"],
    "Choose seed-free bread without milk. Lightly toast; check all ingredients and adapt the size.",
    [infant, choking, allergy],
  ),
  pasta: makeFood(
    "Pasta (wheat, egg-free)",
    grains,
    ["wheat"],
    "Cook until soft and cut as needed. Check the label; record egg pasta or dairy sauces separately.",
    [infant, allergy],
  ),
  chapati: makeFood(
    "Chapati (wheat, dairy-free)",
    grains,
    ["wheat"],
    "Use a simple wheat-and-water recipe; serve soft pieces with a moist meal.",
    [infant, allergy],
  ),
  barley: makeFood(
    "Barley",
    grains,
    ["barley"],
    "Cook until very soft and mash into a moist dish.",
    [allergy, choking],
  ),
  ryeBread: makeFood(
    "Rye bread (with wheat)",
    grains,
    ["rye", "wheat"],
    "Choose seed-free, dairy-free bread; lightly toast and check the full ingredient label.",
    [allergy, choking],
  ),
  milk: makeFood(
    "Pasteurised whole cow’s milk",
    "Milk & Drinks",
    ["milk"],
    "Main drink only from 12 months if appropriate for your child. A milk allergy still requires the existing clinical plan.",
    [youngChildren, allergy],
    {
      "6-7mo": "Cooking ingredient only; not a main drink",
      "8-9mo": "Cooking ingredient only; not a main drink",
      "10-12mo": "Before 12 months: cooking ingredient only",
      "12-24mo":
        "Record the amount actually drunk; follow your child’s dietary plan",
    },
  ),
  yogurt: makeFood(
    "Plain full-fat yoghurt",
    "Dairy",
    ["milk"],
    "Use pasteurised, unsweetened yoghurt only if milk is suitable for your child.",
    [youngChildren, allergy],
  ),
  cheese: makeFood(
    "Pasteurised cheese",
    "Dairy",
    ["milk"],
    "Grate mild pasteurised cheese; check that milk is suitable for your child.",
    [youngChildren, choking, allergy],
  ),
  soyYogurt: makeFood(
    "Fortified plain soy yoghurt",
    "Dairy Alternatives",
    ["soy"],
    "Choose unsweetened and calcium-fortified; check the label and your child’s dietary plan.",
    [youngChildren, allergy],
  ),
  fortifiedSoyDrink: makeFood(
    "Unsweetened fortified soy drink",
    "Milk & Drinks",
    ["soy"],
    "From 12 months; discuss suitability with your clinician if milk is avoided. Plant drinks differ nutritionally.",
    [youngChildren, allergy],
    {
      "6-7mo": "Not a replacement for breast milk or infant formula",
      "8-9mo": "Not a replacement for breast milk or infant formula",
      "10-12mo": "Before 12 months: not a main drink",
      "12-24mo":
        "Record actual intake; use a clinician-approved alternative if needed",
    },
  ),
  water: makeFood(
    "Water",
    "Milk & Drinks",
    [],
    "Offer from an open or free-flow cup with meals.",
    [infant, toddler],
    {
      "6-7mo": "Offer sips with meals",
      "8-9mo": "Offer sips with meals",
      "10-12mo": "Offer sips with meals",
      "12-24mo": "Offer throughout the day; record the amount if useful",
    },
  ),
  breastMilk: makeFood(
    "Breast milk",
    "Milk & Drinks",
    [],
    "Breastfeeding can continue alongside family foods for as long as you both want.",
    [infant, toddler],
    {
      "6-7mo": "Feed responsively",
      "8-9mo": "Feed responsively",
      "10-12mo": "Feed responsively",
      "12-24mo": "Feed responsively; duration can be logged instead of volume",
    },
  ),
  infantFormula: makeFood(
    "Standard cow’s-milk infant formula",
    "Milk & Drinks",
    ["milk"],
    "Prepare exactly as directed. If prescribed a different formula, create a custom entry using its actual label and your clinician’s plan.",
    [allergy, infant],
    {
      "6-7mo": "Follow feeding cues and product preparation instructions",
      "8-9mo": "Follow feeding cues and product preparation instructions",
      "10-12mo": "Follow feeding cues and product preparation instructions",
      "12-24mo":
        "Record prescribed feeds according to the existing clinical plan",
    },
  ),
};

export const FOOD_CATEGORIES = Object.entries(FOOD_DATABASE).reduce(
  (categories, [id, food]) => {
    (categories[food.category] ??= []).push(id);
    return categories;
  },
  {},
);
