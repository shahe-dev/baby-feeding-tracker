# Feeding guidance and source notes

This document replaces the original fixed introduction schedule. The app now selects an age stage using the saved birthday and treats meal plans as editable examples. An age stage does not establish developmental readiness or override medical restrictions.

## After the first birthday

The toddler plan includes family meals, food variety and optional snacks. It uses small starting offers and lets the parent record appetite instead of setting an amount the child must finish. See [NHS guidance after 12 months](https://www.nhs.uk/best-start-in-life/baby/weaning/what-to-feed-your-baby/over-12-months/) and [CDC hunger and fullness cues](https://www.cdc.gov/infant-toddler-nutrition/mealtime/signs-your-child-is-hungry-or-full.html).

The sample recipes preserve the earlier dairy-free approach. Dairy avoidance is now an explicit profile setting. A first birthday does not remove a milk allergy; suitable milk choices and nutritional needs should follow the child's clinical plan. The app does not infer nutritional adequacy from a list of foods.

## Allergens and reaction records

A diary entry is an observation, not a diagnosis. Food restrictions and suspected reactions affect suggestions. Historical reactions remain visible, and a later reaction can flag a food again after a previous status review. When several ingredients were present, the app cannot identify which one caused a symptom.

The app counts a food allergen once per confirmed eating occasion. Food that was only offered, refused, or has no recorded intake does not count as a confirmed exposure. Eating almond does not establish tolerance to cashew. The recorded allergen labels are not an exhaustive list of all possible food allergies.

[NHS food-allergy guidance](https://www.nhs.uk/baby/weaning-and-feeding/food-allergies-in-babies-and-young-children/) distinguishes tolerated foods from foods that require avoidance or medical review. Follow appropriate advice before changing a suspected or diagnosed allergy status.

## What LEAP establishes

The [original LEAP trial](https://pubmed.ncbi.nlm.nih.gov/25705822/) investigated peanut consumption in infants at high risk of peanut allergy. It is not a trial of fish, sesame, egg or every tree nut, and it does not establish a universal three-times-per-week target for every allergen. The app therefore no longer presents such a target or an allergy-prevention success score.

## Preparation

Age alone does not make a food safe to eat. Preparation notes cover softening hard produce, thinning nut and seed butters, removing bones and adapting textures. The [CDC choking guidance](https://www.cdc.gov/infant-toddler-nutrition/foods-and-drinks/choking-hazards.html) also emphasizes supervised, seated eating. Check the exact ingredients in packaged foods; a generic recipe name is not a guarantee that it excludes an allergen.

## Maintaining guidance

`src/catalog.js` contains the food source links; `src/plans.js` contains the example plans. Update those files and rebuild together. Keep source claims distinct from recipe suggestions. Do not label the application or a personal meal plan as clinically validated without a corresponding review.
