import { EVIDENCE_SOURCES, getEvidenceSource } from "./evidence.js";

// Food IDs are stable: existing diary and backup entries refer to these keys.
export const SOURCES = EVIDENCE_SOURCES;

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

// Authored planning prompts, not study-prescribed portions or intake targets.
// Texture and hunger cues matter as well as calendar age.
const portions = {
  "6-7mo": "A few small tastes; increase with interest",
  "8-9mo": "Offer a little soft food; offer more if wanted",
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
  servingSize = portions,
) => ({
  name,
  category,
  allergens,
  preparation,
  servingSize: { ...servingSize },
});
const vegetables = "Vegetables";
const fruit = "Fruit";
const grains = "Grains & Starches";
const spreads = "Nuts, Seeds & Spreads";

const FOOD_ITEMS = {
  beef: makeFood(
    "Beef",
    "Meat & Eggs",
    [],
    "Cook thoroughly; serve moist and finely minced or shredded.",
  ),
  lamb: makeFood(
    "Lamb",
    "Meat & Eggs",
    [],
    "Remove bones and gristle; cook until tender and shred finely.",
  ),
  chicken: makeFood(
    "Chicken",
    "Meat & Eggs",
    [],
    "Cook through, remove bones and skin, then shred into soft pieces.",
  ),
  turkey: makeFood(
    "Turkey",
    "Meat & Eggs",
    [],
    "Cook through; keep minced or shredded meat moist.",
  ),
  chickenLiver: makeFood(
    "Chicken liver (fully cooked)",
    "Meat & Eggs",
    [],
    "Cook through and mash. No routine liver amount or frequency has been set from the reviewed sources; use an individual dietary plan.",
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
  ),
  salmon: makeFood(
    "Salmon",
    "Fish & Shellfish",
    ["fish"],
    "Cook thoroughly and carefully remove all bones; flake.",
  ),
  mackerel: makeFood(
    "Atlantic mackerel",
    "Fish & Shellfish",
    ["fish"],
    "For the Atlantic mackerel recorded here, cook through, carefully remove bones and flake. The reviewed fish studies do not establish species-specific contaminant advice.",
  ),
  whitefish: makeFood(
    "White fish (cod or haddock)",
    "Fish & Shellfish",
    ["fish"],
    "Cook through and remove all bones; serve in soft flakes.",
  ),
  sardines: makeFood(
    "Sardines",
    "Fish & Shellfish",
    ["fish"],
    "Choose lower-salt sardines; remove bones and mash the flesh.",
  ),
  shrimp: makeFood(
    "Prawns or shrimp (fully cooked)",
    "Fish & Shellfish",
    ["shellfish"],
    "Cook thoroughly; remove shell and tail, then finely chop.",
  ),
  peanutButter: makeFood(
    "Smooth peanut butter",
    spreads,
    ["peanut"],
    "Mix with water or food to thin; never offer a thick spoonful. Check the label for other ingredients.",
    spreadPortions,
  ),
  bamba: makeFood(
    "Peanut puffs (Bamba)",
    spreads,
    ["peanut"],
    "Check the exact product label for milk and other allergens. Soften fully with water; do not serve hard pieces.",
    spreadPortions,
  ),
  tahini: makeFood(
    "Tahini (sesame paste)",
    spreads,
    ["sesame"],
    "Stir into food or thin with water until runny.",
    spreadPortions,
  ),
  almondButter: makeFood(
    "Smooth almond butter",
    spreads,
    ["almond"],
    "Thin into food or spread very thinly; check ingredients for other nuts.",
    spreadPortions,
  ),
  cashewButter: makeFood(
    "Smooth cashew butter",
    spreads,
    ["cashew"],
    "Thin into food or spread very thinly; check ingredients for other nuts.",
    spreadPortions,
  ),
  sunflowerButter: makeFood(
    "Smooth sunflower seed butter",
    spreads,
    [],
    "Thin into food or spread very thinly. Check labels for added allergens.",
    spreadPortions,
  ),
  hummus: makeFood(
    "Hummus (with tahini)",
    "Beans & Pulses",
    ["sesame"],
    "Choose a smooth, lower-salt version; check the ingredients. This entry assumes chickpeas and tahini.",
    spreadPortions,
  ),
  lentils: makeFood(
    "Lentils",
    "Beans & Pulses",
    [],
    "Cook until soft; mash as needed.",
  ),
  chickpeas: makeFood(
    "Chickpeas",
    "Beans & Pulses",
    [],
    "Cook until very soft; mash before serving.",
  ),
  beans: makeFood(
    "Beans",
    "Beans & Pulses",
    [],
    "Cook until soft and mash; choose no-added-salt beans.",
  ),
  tofu: makeFood(
    "Tofu",
    "Beans & Pulses",
    ["soy"],
    "Use plain tofu; heat according to its instructions and mash or cut softly.",
  ),
  avocado: makeFood(
    "Avocado",
    fruit,
    [],
    "Use ripe flesh; mash or cut into manageable soft pieces.",
  ),
  banana: makeFood(
    "Banana",
    fruit,
    [],
    "Use ripe fruit; mash or cut into soft pieces.",
  ),
  apple: makeFood(
    "Apple",
    fruit,
    [],
    "Remove the core. Cook until soft or grate finely; avoid hard raw chunks.",
  ),
  pear: makeFood(
    "Pear",
    fruit,
    [],
    "Remove the core; use very ripe pear or cook until soft.",
  ),
  berries: makeFood(
    "Berries",
    fruit,
    [],
    "Wash, remove stalks and mash or flatten; do not serve round berries whole.",
  ),
  mango: makeFood(
    "Mango",
    fruit,
    [],
    "Peel and remove the stone; use ripe, soft flesh.",
  ),
  orange: makeFood(
    "Orange",
    fruit,
    [],
    "Remove peel, seeds and tough membranes; chop flesh.",
  ),
  oliveOil: makeFood(
    "Olive oil",
    "Fats & Oils",
    [],
    "Mix a little into cooked food.",
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
  ),
  potato: makeFood(
    "Potato",
    grains,
    [],
    "Cook until soft; mash without added salt.",
  ),
  spinach: makeFood("Spinach", vegetables, [], "Cook and chop leaves finely."),
  broccoli: makeFood(
    "Broccoli",
    vegetables,
    [],
    "Steam until tender; mash or offer soft florets as skills allow.",
  ),
  carrots: makeFood(
    "Carrots",
    vegetables,
    [],
    "Cook until soft; avoid hard raw sticks or coin-shaped pieces.",
  ),
  butternutSquash: makeFood(
    "Butternut squash",
    vegetables,
    [],
    "Remove skin and seeds; cook the flesh until soft.",
  ),
  peas: makeFood("Peas", vegetables, [], "Cook and mash or flatten."),
  kale: makeFood(
    "Kale",
    vegetables,
    [],
    "Remove tough stems; cook and chop finely.",
  ),
  mushrooms: makeFood(
    "Mushrooms",
    vegetables,
    [],
    "Cook until tender and chop finely; use shop-bought edible mushrooms.",
  ),
  cucumber: makeFood(
    "Cucumber",
    vegetables,
    [],
    "Peel if tough; finely grate or soften for children who cannot manage the texture.",
  ),
  tomato: makeFood(
    "Tomato",
    vegetables,
    [],
    "Cook and chop into sauce; never serve cherry tomatoes whole.",
  ),
  courgette: makeFood(
    "Courgette (zucchini)",
    vegetables,
    [],
    "Cook until tender and cut to suit feeding skills.",
  ),
  cauliflower: makeFood(
    "Cauliflower",
    vegetables,
    [],
    "Cook until soft; mash or cut into tender pieces.",
  ),
  quinoa: makeFood(
    "Quinoa",
    grains,
    [],
    "Rinse, cook until soft, then mix into moist food.",
  ),
  oats: makeFood(
    "Oats or porridge",
    grains,
    ["oats"],
    "Cook into soft porridge with water; record any milk or other ingredients separately.",
  ),
  rice: makeFood(
    "Rice",
    grains,
    [],
    "Cook until soft; serve as part of a moist meal.",
  ),
  bread: makeFood(
    "Bread or toast (wheat)",
    grains,
    ["wheat"],
    "Choose seed-free bread without milk. Lightly toast; check all ingredients and adapt the size.",
  ),
  pasta: makeFood(
    "Pasta (wheat, egg-free)",
    grains,
    ["wheat"],
    "Cook until soft and cut as needed. Check the label; record egg pasta or dairy sauces separately.",
  ),
  chapati: makeFood(
    "Chapati (wheat, dairy-free)",
    grains,
    ["wheat"],
    "Use a simple wheat-and-water recipe; serve soft pieces with a moist meal.",
  ),
  barley: makeFood(
    "Barley",
    grains,
    ["barley"],
    "Cook until very soft and mash into a moist dish.",
  ),
  ryeBread: makeFood(
    "Rye bread (with wheat)",
    grains,
    ["rye", "wheat"],
    "Choose seed-free, dairy-free bread; lightly toast and check the full ingredient label.",
  ),
  milk: makeFood(
    "Pasteurised whole cow’s milk",
    "Milk & Drinks",
    ["milk"],
    "Record only if cow’s milk is already appropriate under your child’s dietary plan. Keep the existing milk-allergy restriction; this entry does not recommend a change of feeds.",
    {
      "6-7mo": "Record only as permitted by the existing feeding plan",
      "8-9mo": "Record only as permitted by the existing feeding plan",
      "10-12mo": "Record only as permitted by the existing feeding plan",
      "12-24mo":
        "Record the amount actually drunk; follow your child’s dietary plan",
    },
  ),
  yogurt: makeFood(
    "Plain full-fat yoghurt",
    "Dairy",
    ["milk"],
    "Use pasteurised, unsweetened yoghurt only if milk is suitable for your child.",
  ),
  cheese: makeFood(
    "Pasteurised cheese",
    "Dairy",
    ["milk"],
    "Grate mild pasteurised cheese; check that milk is suitable for your child.",
  ),
  soyYogurt: makeFood(
    "Fortified plain soy yoghurt",
    "Dairy Alternatives",
    ["soy"],
    "Record the actual product and check its ingredients against your child’s dietary plan. Fortification varies; this entry does not establish a dairy replacement.",
  ),
  fortifiedSoyDrink: makeFood(
    "Unsweetened fortified soy drink",
    "Milk & Drinks",
    ["soy"],
    "Record only a product already included in your child’s dietary plan. The selected evidence does not establish a suitable plant-drink replacement for milk allergy.",
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
    "WHO recommends continued breastfeeding up to 2 years or beyond, alongside complementary foods. Feed responsively.",
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
    {
      "6-7mo": "Follow feeding cues and product preparation instructions",
      "8-9mo": "Follow feeding cues and product preparation instructions",
      "10-12mo": "Follow feeding cues and product preparation instructions",
      "12-24mo":
        "Record prescribed feeds according to the existing clinical plan",
    },
  ),
};

// These labels describe a possible role in a meal, not analysed nutrient amounts.
// "animal" is the WHO meat/fish/egg check; milk feeds do not fulfil that check.
const GROUP_EVIDENCE = {
  "Meat & Eggs": {
    roles: ["iron", "animal"],
    sourceIds: ["who2023", "blissProtocol", "blissIron"],
    evidenceNote: "Can supply the animal-food component of the day and contribute to a meal’s iron-rich component. WHO supports daily meat, fish or eggs; BLISS does not establish a fixed meat portion or guarantee iron adequacy.",
  },
  "Fish & Shellfish": {
    roles: ["animal"],
    sourceIds: ["who2023", "blissProtocol"],
    evidenceNote: "Contributes to animal-food variety. The reviewed sources do not provide a species-specific toddler serving, contaminant limit or individual allergy plan.",
  },
  "Beans & Pulses": {
    roles: ["iron"],
    sourceIds: ["who2023", "blissProtocol", "blissIron"],
    evidenceNote: "A plant-food contribution to the iron-rich component of a varied meal. WHO supports frequent pulses and BLISS includes plant iron options; a food label alone cannot establish adequate iron intake.",
  },
  Fruit: {
    roles: ["produce"],
    sourceIds: ["who2023", "blissProtocol", "blissVariety"],
    evidenceNote: "Contributes fruit variety and the easy-to-eat produce component of a meal. The reviewed evidence does not establish a vegetable-to-fruit ratio or a required sequence for offering foods.",
  },
  Vegetables: {
    roles: ["produce"],
    sourceIds: ["who2023", "blissProtocol", "blissVariety"],
    evidenceNote: "Contributes vegetable variety and the easy-to-eat produce component of a meal. Add suitable iron-rich and energy-rich components; vegetables alone do not establish a complete meal.",
  },
  "Grains & Starches": {
    roles: ["energy"],
    sourceIds: ["who2023", "blissProtocol", "nordic2023"],
    evidenceNote: "Can contribute energy within a varied meal. WHO cautions against starch-dominated diets and prefers whole grains when used; the reviewed evidence does not require grain-free toddler meals.",
  },
  "Nuts, Seeds & Spreads": {
    roles: ["energy"],
    sourceIds: ["who2023", "blissProtocol", "leapSpecificity"],
    evidenceNote: "Can add energy when already suitable for the child. WHO includes nuts and seeds in dietary variety; LEAP does not establish a three-times-weekly quota for this allergen.",
  },
  "Fats & Oils": {
    roles: ["energy"],
    sourceIds: ["blissProtocol", "nordic2023"],
    evidenceNote: "Can add an energy-rich component to a meal. NNR2023 gives a 30–40% range for fat as a share of total energy at 12–23 months, including milk feeds; this is not a per-meal quota or unrestricted-fat advice.",
  },
  Dairy: {
    roles: ["energy"],
    sourceIds: ["who2023", "whoMilk", "nordicIntakes"],
    evidenceNote: "Available for recording only when suitable under the child’s existing dietary plan. Default menus remain dairy-free; the reviewed evidence does not resolve an individual milk-allergy plan.",
  },
  "Dairy Alternatives": {
    roles: [],
    sourceIds: ["whoMilk", "nordicIntakes"],
    evidenceNote: "Product composition and fortification vary. The selected evidence does not certify this food as an adequate dairy substitute or determine the child’s calcium intake.",
  },
  "Milk & Drinks": {
    roles: [],
    sourceIds: ["who2023", "whoMilk"],
    evidenceNote: "Keep the current individual feeding plan. The WHO milk evidence does not establish a milk-allergy treatment or choose a replacement drink for this child.",
  },
};

const FISH_EVIDENCE = {
  sourceIds: ["who2023", "abisFish", "swedenEczema", "blissProtocol"],
  evidenceNote: "Fish contributes animal-food variety. Swedish cohort associations concern infant introduction, not a tested toddler fish dose, species choice or prevention of existing asthma/eczema. Species-specific contaminant advice was not established in this review.",
};
const PEANUT_EVIDENCE = {
  sourceIds: ["leap", "leapOn", "leapSpecificity", "blissProtocol"],
  evidenceNote: "LEAP used 6 g of peanut protein weekly across at least three meals, from infant introduction to age 5. This is research context for already tolerated peanut, not peanut-butter weight, a first-introduction instruction at this age or a rule for other allergens.",
};
const FOOD_EVIDENCE = {
  egg: {
    roles: ["iron", "energy", "animal"],
    sourceIds: ["who2023", "blissProtocol", "leapSpecificity", "preventadall"],
    evidenceNote: "Provides an animal-food option within a varied day. PreventADALL studied early infant egg introduction as part of a combined intervention; neither it nor LEAP establishes a three-times-weekly toddler egg quota.",
  },
  chickenLiver: {
    evidenceNote: "Liver was an iron-food option in the BLISS intervention materials. This review does not establish a routine toddler liver portion or frequency; it is kept for recording and individual planning, not scheduled automatically.",
  },
  salmon: { ...FISH_EVIDENCE, roles: ["energy", "animal"] },
  mackerel: { ...FISH_EVIDENCE, roles: ["energy", "animal"] },
  whitefish: FISH_EVIDENCE,
  sardines: { ...FISH_EVIDENCE, roles: ["iron", "energy", "animal"] },
  peanutButter: PEANUT_EVIDENCE,
  bamba: {
    ...PEANUT_EVIDENCE,
    evidenceNote: `${PEANUT_EVIDENCE.evidenceNote} Product labels determine peanut protein and any milk ingredients; a puff count alone is not a verified dose.`,
  },
  sunflowerButter: {
    sourceIds: ["who2023", "blissProtocol"],
    evidenceNote: "Can contribute energy and seed variety when suitable for the child. The reviewed studies do not establish a sunflower-specific allergy-prevention regimen.",
  },
  hummus: { roles: ["iron", "energy"] },
  avocado: { roles: ["produce", "energy"] },
  sweetPotato: { roles: ["produce", "energy"] },
  potato: { roles: ["produce", "energy"] },
  oats: {
    evidenceNote: "A grain option for energy within a varied meal. Plain oats are not the same as iron-fortified infant cereal; record the actual product and other ingredients without assuming fortification.",
  },
  water: {
    sourceIds: ["who2023"],
    evidenceNote: "A drink-recording option. The app does not infer an individual fluid requirement or replace the child’s usual milk/feed plan.",
  },
  breastMilk: {
    sourceIds: ["who2023", "whoResponsive"],
    evidenceNote: "WHO recommends breastfeeding to 2 years or beyond, with very-low-certainty evidence for that recommendation. Breastfeeding and complementary foods are considered together; minutes logged do not determine milk volume or nutrient intake.",
  },
  infantFormula: {
    evidenceNote: "This stable diary entry means standard cow’s-milk formula, which contains milk protein. Preserve prescribed feeds and use a custom entry for a different product; the reviewed sources do not recommend an automatic change at the first birthday.",
  },
};

export const FOOD_DATABASE = Object.fromEntries(
  Object.entries(FOOD_ITEMS).map(([id, food]) => {
    const research = {
      ...GROUP_EVIDENCE[food.category],
      ...FOOD_EVIDENCE[id],
    };
    const isDrink = food.category === "Milk & Drinks";
    return [id, {
      ...food,
      roles: [...research.roles],
      evidenceNote: research.evidenceNote,
      preparationBasis: isDrink
        ? "Recording guidance; product instructions and the existing individual feeding plan determine preparation and suitability."
        : "Practical preparation adapted to the child’s skills, using BLISS principles of manageable texture and supervised, upright eating. These exact cuts, recipes and starting offers were not individually tested by the cited studies.",
      sources: research.sourceIds.map(getEvidenceSource),
    }];
  }),
);

export const FOOD_CATEGORIES = Object.entries(FOOD_DATABASE).reduce(
  (categories, [id, food]) => {
    (categories[food.category] ??= []).push(id);
    return categories;
  },
  {},
);
