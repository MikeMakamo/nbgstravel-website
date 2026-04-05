export function calculatePackageQuote(pkg, numberOfPersons) {
  const persons = Number(numberOfPersons || 1);
  const basePrice = Number(pkg.base_price || 0);

  switch (pkg.pricing_model) {
    case "per_person_sharing":
    case "child_rate":
    case "single_supplement":
      return basePrice * persons;
    case "per_couple": {
      const pairs = Math.ceil(persons / 2);
      return basePrice * pairs;
    }
    case "custom":
    default:
      return basePrice * persons;
  }
}
