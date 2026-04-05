export const liveMedia = {
  homeHero: "https://nbgstravel.co.za/wp-content/uploads/2025/05/ishan-seefromthesky-rj8fMHNPXbg-unsplash-1-scaled.jpg",
  introLeft: "https://nbgstravel.co.za/wp-content/uploads/2025/02/472998936_18052737236487047_7230927518770349952_n-1024x576.jpg",
  introRight: "https://nbgstravel.co.za/wp-content/uploads/2025/02/480224362_642660051481760_5361578353347056917_n-e1740481322317.jpg",
  packagesHero: "https://nbgstravel.co.za/wp-content/uploads/2025/02/472998936_18052737236487047_7230927518770349952_n.jpg",
  zanzibarHero: "https://nbgstravel.co.za/wp-content/uploads/2025/07/222782-Zanzibar.jpg.webp",
  continents: [
    {
      title: "AFRICA",
      subtitle: "VISIT AFRICA TODAY",
      image: "https://nbgstravel.co.za/wp-content/uploads/2025/03/travel-vacation-Poster-4.jpg"
    },
    {
      title: "AUSTRALIA",
      subtitle: "VISIT AUSTRALIA!",
      image: "https://nbgstravel.co.za/wp-content/uploads/2025/04/premium_photo-1666983888610-2362b2433009.webp"
    },
    {
      title: "THE AMERICAS",
      subtitle: "SEE & VISIT THE AMERICAN CONTINENT",
      image: "https://nbgstravel.co.za/wp-content/uploads/2025/04/Black-Green-Graffiti-Arts-Street-Culture-Logo-8.webp"
    },
    {
      title: "ASIA",
      subtitle: "VISIT ASIA",
      image: "https://nbgstravel.co.za/wp-content/uploads/2025/03/travel-vacation-Poster-3.jpg"
    },
    {
      title: "EUROPE",
      subtitle: "SEE EUROPEAN PACKAGES",
      image: "https://nbgstravel.co.za/wp-content/uploads/2025/03/travel-vacation-Poster-2.jpg"
    }
  ],
  previousTrips: [
    "https://nbgstravel.co.za/wp-content/uploads/2025/02/472998936_18052737236487047_7230927518770349952_n-1024x576.jpg",
    "https://nbgstravel.co.za/wp-content/uploads/2025/02/480224362_642660051481760_5361578353347056917_n-e1740481322317.jpg",
    "https://nbgstravel.co.za/wp-content/uploads/2025/05/ishan-seefromthesky-rj8fMHNPXbg-unsplash-1-scaled.jpg"
  ]
};

export const homeServices = [
  {
    title: "Travel destinations and deals",
    description:
      "Our travel agents love to find the best travel deals, we’ll help you choose a destination that suits your preferences and budget."
  },
  {
    title: "Travel transportation",
    description:
      "Our agents can handle all the transportation bookings, including flights, cruises, trains, and rental cars. We manage everything to streamline your journey there and back."
  },
  {
    title: "Visa Services",
    description:
      "Do you know who’s offering vacation packages? We do! We make it our business to know all about the best packages and deals to share with our clients."
  }
];

export const faqs = [
  {
    question: "Does NBGS Travel require the travel payments all at once?",
    answer:
      "No, NBGS Travel does not require you to pay for your trip all at once. We offer flexible payment options to suit your financial planning. You can pay in full or use a structured installment plan. To confirm your booking, we generally require a deposit, but some packages may state a different amount."
  },
  { question: "Can I request a customized package if I don't see the destination I want on the page?" },
  { question: "Can I choose my own travel dates?" },
  { question: "What Is the group size for your trips?" },
  { question: "Can I request a private trip if I can’t join the group trips?" },
  { question: "Is it safe to use my banking information on your travel site?" },
  { question: "What if I am unable to travel after booking?" },
  { question: "Is travel insurance included in the packages?" }
];

export const categoryCards = [
  {
    title: "Packages",
    kicker: "TRIPS",
    subtitle: "PACKAGES",
    href: "/packages"
  },
  {
    title: "Int'l Group Trips",
    kicker: "TRIPS",
    subtitle: "GROUP TRIPS",
    href: "/packages"
  }
];

export function getPackageVisual(pkg) {
  if (!pkg) return liveMedia.packagesHero;
  if (pkg.slug === "visit-zanzibar-2026") return liveMedia.zanzibarHero;
  if ((pkg.package_category || "").toLowerCase().includes("group")) return liveMedia.packagesHero;
  return liveMedia.homeHero;
}
