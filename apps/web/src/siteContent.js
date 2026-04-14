import { resolveApiAssetUrl } from "./utils/media.js";

function uploadImage(path) {
  return resolveApiAssetUrl(path);
}

export const liveMedia = {
  homeHero: uploadImage("/uploads/imported/live-packages/afronation-portugal-2026/05-praia-marinha-beach-lagoa-algarve-1024x683.jpg"),
  introLeft: uploadImage("/uploads/imported/live-packages/visit-zanzibar-2026/01-222782-zanzibar-jpg-1024x576.webp"),
  introRight: uploadImage("/uploads/imported/live-packages/discover-thailand-2026/03-screenshot-241-1024x368.png"),
  packagesHero: uploadImage("/uploads/imported/live-packages/visit-spain-2026/01-aa5231d66880b52a4ad043b59d1585b2-1024x683.jpg"),
  zanzibarHero: uploadImage("/uploads/imported/live-packages/visit-zanzibar-2026/01-222782-zanzibar-jpg-1024x576.webp"),
  continents: [
    {
      title: "AFRICA",
      subtitle: "VISIT AFRICA TODAY",
      image: uploadImage("/uploads/imported/live-packages/visit-zanzibar-2026/02-ali-abdul-rahman-cqbslz-lp00-unsplash-820x1024.jpg")
    },
    {
      title: "AUSTRALIA",
      subtitle: "VISIT AUSTRALIA!",
      image: "/assets/images/355464106_930846967974321_4531387690846332912_n.jpg"
    },
    {
      title: "THE AMERICAS",
      subtitle: "SEE & VISIT THE AMERICAN CONTINENT",
      image: uploadImage("/uploads/imported/live-packages/discover-brazil-2026/02-screenshot-243.png")
    },
    {
      title: "ASIA",
      subtitle: "VISIT ASIA",
      image: uploadImage("/uploads/imported/live-packages/discover-tokyo-2026/02-tokyo-for-digital-nomads-1024x683.jpg")
    },
    {
      title: "EUROPE",
      subtitle: "SEE EUROPEAN PACKAGES",
      image: uploadImage("/uploads/imported/live-packages/discover-greece-2026/01-gettyimages-773131123-5c27f7c346e0fb000179ee94-1024x680.jpg")
    }
  ],
  previousTrips: [
    uploadImage("/uploads/imported/live-packages/visit-zanzibar-2026/03-colin-watts-m1obxvswvhy-unsplash-1024x685.jpg"),
    uploadImage("/uploads/imported/live-packages/discover-greece-2026/02-intrepid-travel-greece-mykonos-tavern-by-sea-2-1024x684.jpg"),
    uploadImage("/uploads/imported/live-packages/afronation-portugal-2026/04-dsc04503-768x512.jpg"),
    "/assets/images/profile picture 1.jpg",
    "/assets/images/profile picture 2.jpg",
    "/assets/images/profile picture 3.jpg",
    "/assets/images/profile picture 4.jpg"
  ]
};

export const homeServices = [
  {
    title: "Travel destinations and deals",
    description:
      "Our travel agents love finding the best travel deals. We help you choose a destination that suits your preferences and budget."
  },
  {
    title: "Travel transportation",
    description:
      "Our agents handle transportation bookings including flights, cruises, trains, and rental cars to streamline your journey there and back."
  },
  {
    title: "Visa Services",
    description:
      "We guide travelers through visa application requirements with a structured process and secure payment flow where needed."
  }
];

export const servicesPageContent = {
  heroTitle: "Our Services",
  introTitle: "Travel support designed around the way you actually move.",
  introCopy:
    "NBGS Travel offers personalized domestic and international travel support for leisure, group, and business travelers. From the first idea to the final travel documents, we help structure the journey clearly and professionally.",
  introActions: [
    { label: "Contact Us", href: "/contact", variant: "accent" },
    { label: "Visa Services", href: "/visa", variant: "secondary" }
  ],
  services: [
    {
      title: "Tailored International & Domestic Packages",
      description:
        "We design personalized travel packages that include tours, activities, and experiences for solo travelers, couples, families, and groups."
    },
    {
      title: "Flight Booking",
      description:
        "We facilitate flight bookings and assist with important travel information such as flight schedules through Galileo and general flight status support."
    },
    {
      title: "Accommodation",
      description:
        "From luxury resorts to boutique hotels and business-friendly lodgings, we secure the right stay to match your preferences and travel goals."
    },
    {
      title: "Transfers",
      description:
        "We arrange reliable airport and local transfers including shuttle services, private taxis, and group transport options."
    },
    {
      title: "Car Rental",
      description:
        "Car rental reservations are available for both leisure and corporate clients who need added flexibility during their trip."
    },
    {
      title: "Train",
      description:
        "We assist with online train ticket reservations, including schedule guidance and ticket fee information."
    },
    {
      title: "Cruises",
      description:
        "Explore cruise deals through our trusted partners, from short getaways to premium voyages at competitive rates."
    },
    {
      title: "Activities & Excursions",
      description:
        "We can arrange a wide variety of activities including half-day, full-day, over-day, overnight, and multi-day tours."
    },
    {
      title: "Customized Tours",
      description:
        "You can create a programmed tour built around your own preferences or choose from one of our itinerary-based travel packages."
    },
    {
      title: "Vacation Packages",
      description:
        "Choose from travel deals for families, honeymooners, adventure and wildlife experiences, cultural vacations, and more."
    },
    {
      title: "Corporate Travel Management",
      description:
        "Our corporate travel solutions support efficient and cost-effective planning for businesses, including group bookings, incentive travel, and event support."
    },
    {
      title: "Group Travel",
      description:
        "We organize group travel for schools, religious groups, sports teams, company retreats, and special-interest tours with full coordination support."
    },
    {
      title: "Travel Insurance",
      description:
        "A variety of competitively priced travel insurance options are available to help protect your trip."
    },
    {
      title: "Travel Documentation",
      description:
        "We help ensure quick and secure generation of essential travel documents including itineraries, e-tickets, confirmations, and visa support documents."
    },
    {
      title: "Visa Services",
      description:
        "We assist with visa applications for different destinations by guiding requirements, compiling documents, and managing submissions for a smoother process."
    }
  ]
};

export const visaPageContent = {
  heroTitle: "Visa Services",
  introTitle: "Apply for your visa quickly and securely.",
  introCopy:
    "Simply select your destination, complete the form, and make payment. NBGS Travel will handle the next steps with a structured and reliable visa support process.",
  paymentNote: "Fast, reliable visa processing made easy.",
  visas: [
    {
      title: "UAE Tourist Visa",
      apiAliases: ["UAE Tourist Visa", "Dubai Visa"],
      country: "United Arab Emirates",
      countryCode: "ae",
      feeNote: "Service Fee and Visa fee",
      processingTimeLabel: "24 - 72 Hours",
      applicationFee: 2500,
      currencyCode: "ZAR",
      description: "Tourist visa support with guided application handling for UAE travel."
    },
    {
      title: "Turkey E-Visa",
      apiAliases: ["Turkey E-Visa", "Turkey Visa"],
      country: "Turkey",
      countryCode: "tr",
      feeNote: "Service Fee and Visa fee",
      processingTimeLabel: "24 Hours",
      applicationFee: 500,
      currencyCode: "ZAR",
      description: "Fast visa support for Turkey travel with a streamlined online application flow."
    },
    {
      title: "Indonesian Visa",
      apiAliases: ["Indonesian Visa"],
      country: "Indonesia",
      countryCode: "id",
      feeNote: "Service Fee and Visa fee",
      processingTimeLabel: "24 Hours",
      applicationFee: 1000,
      currencyCode: "ZAR",
      description: "Structured visa application support for Indonesia-bound travel."
    },
    {
      title: "Kenyan Visa",
      apiAliases: ["Kenyan Visa"],
      country: "Kenya",
      countryCode: "ke",
      feeNote: "Service Fee and Visa fee",
      processingTimeLabel: "24 Hours",
      applicationFee: 500,
      currencyCode: "ZAR",
      description: "Visa support for Kenya travel with quick application guidance."
    },
    {
      title: "UK Visa",
      apiAliases: ["UK Visa"],
      country: "United Kingdom",
      countryCode: "gb",
      feeNote: "Service Fee (Visa fee not Included)",
      processingTimeLabel: "5 - 15 working days",
      applicationFee: 2000,
      currencyCode: "ZAR",
      description: "Application support for UK visa submissions and required document guidance."
    },
    {
      title: "Schengen Visa",
      apiAliases: ["Schengen Visa"],
      country: "Europe",
      imageUrl: uploadImage("/uploads/imported/live-packages/discover-greece-2026/03-05-parthenonacropolis-38687611-1-768x512.webp"),
      feeNote: "Service Fee (Visa fee not Included)",
      processingTimeLabel: "5 - 15 working days",
      applicationFee: 2500,
      currencyCode: "ZAR",
      description: "Schengen visa support for travelers applying for eligible European destinations."
    }
  ],
  terms: [
    {
      title: "Service Overview",
      points: [
        "NBGS Travel assists with visa preparation, submission, and processing support.",
        "Visa approval remains subject to the relevant embassy or consulate."
      ]
    },
    {
      title: "Service Fees",
      points: [
        "Administrative and handling charges are payable in advance unless otherwise agreed.",
        "Visa fees, courier fees, and embassy charges remain the client's responsibility where excluded.",
        "Fees become non-refundable once an application has been submitted."
      ]
    },
    {
      title: "Client Responsibilities",
      points: [
        "Clients must submit complete and accurate information with all required supporting documents.",
        "Passports must have the required validity and at least three blank pages where applicable.",
        "Delays caused by incomplete or incorrect information are not the responsibility of NBGS Travel."
      ]
    },
    {
      title: "Processing, Changes & Liability",
      points: [
        "Processing times are estimates and may vary based on embassy, consulate, or third-party delays.",
        "Visa outcomes remain at the sole discretion of the issuing authority.",
        "Changes after submission may result in extra costs, and NBGS Travel is not liable for resulting travel losses."
      ]
    }
  ]
};

export const contactPageContent = {
  heroTitle: "Contact Us",
  introTitle: "Let’s talk about your next trip.",
  introCopy: "Contact us today to schedule a consultation or to learn more about our services.",
  sectionTitle: "Locate and visit us or send us a message for your next project.",
  email: "info@nbgstravel.co.za",
  phoneNumbers: ["+27645033461", "+27798377302"],
  address: "8 Incubation Drive Riverside View, Fourways, Midrand, 2021",
  mapEmbedUrl:
    "https://maps.google.com/maps?q=8%20Incubation%20Drive%20Riverside%20View%2C%20Fourways%2C%20Midrand%2C%202021&t=m&z=8&output=embed&iwloc=near",
  socials: [
    {
      label: "Facebook",
      href: "https://www.facebook.com/nbgstravel/"
    },
    {
      label: "Instagram",
      href: "https://www.instagram.com/nbgs_travelza/"
    },
    {
      label: "WhatsApp",
      href: "https://api.whatsapp.com/send/?phone=27798377302"
    }
  ]
};

export const aboutContent = {
  heroTitle: "About Us",
  sectionKicker: "Who We Are",
  heading: "Travel planning that feels personal, polished, and fully taken care of.",
  paragraphs: [
    "At NBGS Travel, we believe that travel is more than just reaching a destination. It is about creating unforgettable experiences.",
    "As a proudly 100% Black female-owned agency based in Midrand, South Africa, we are passionate about curating seamless, personalized travel solutions for both leisure and corporate clients.",
    "With years of industry experience, we offer a full spectrum of travel services including flight bookings, hotel accommodations, cruises, rail journeys, and ground transportation, both locally and internationally.",
    "Whether you are planning a relaxing holiday, a business trip, or a group getaway, our dedicated team is here to take care of every detail.",
    "We are proud to be accredited by ASATA, the Association of Southern African Travel Agents, which reflects our commitment to ethical practices, service excellence, and industry professionalism.",
    "What sets us apart is our passion for travel, our reliability, and our attention to detail. At NBGS Travel, we do not just plan trips, we craft journeys that inspire, connect, and elevate."
  ],
  highlightTitle: "NBGS At A Glance",
  highlights: [
    "100% Black female-owned travel agency",
    "Based in Midrand, South Africa",
    "Leisure and corporate travel support",
    "Flights, hotels, cruises, rail, and ground transport",
    "Local and international travel planning",
    "ASATA accredited"
  ],
  closingLine: "Let us bring your next adventure to life."
};

export const manualReviews = [
  {
    id: 1,
    reviewer_name: "Oscar Ntlanganiso",
    review_age: "9 Sept 2024",
    rating: 5,
    avatar_letter: "O",
    avatar_tone: "#ef3f78",
    review_text:
      "Awesome experience tailored by Ntokozo and kept communicating/checking in on us, really enjoyed our stay in Livingstone. The hotel proposed top tier :-)"
  },
  {
    id: 2,
    reviewer_name: "Carol Matlale",
    review_age: "10 Aug 2024",
    rating: 5,
    avatar_letter: "C",
    avatar_tone: "#6a4639",
    review_text:
      "I said I want an out of this world experience for my 40th. Ntokozo from NBGS Travel said no more. I went to Zanzibar and I had the time of my life. As a solo traveler I was worried, but I was never alone. Ntokozo organised drivers to take me everywhere, always checked up on me, and booked the best activities and hotels for me. I would recommend NBGS and I'll definitely use them again."
  },
  {
    id: 3,
    reviewer_name: "Malebo Winny",
    review_age: "4 Aug 2024",
    rating: 5,
    avatar_letter: "M",
    avatar_tone: "#7c22b3",
    review_text:
      "Your agency made my birthday trip so special, I loved how you were always there and everything ran so smoothly. I will definitely recommend you and use it for my future trips. Thank you so much."
  },
  {
    id: 4,
    reviewer_name: "Inga Dyani",
    review_age: "30 Apr 2024",
    rating: 5,
    avatar_letter: "I",
    avatar_tone: "#0b7f87",
    review_text:
      "I was thoroughly impressed with their service. Ntokozo is extremely helpful and quick to answer messages. When I missed an activity booked for me, they swiftly arranged another experience to make up for it. She is not only efficient but also incredibly friendly. I can't fault them on anything; the customer service is top-notch, and I would highly recommend them for any travel needs."
  },
  {
    id: 5,
    reviewer_name: "Gugu Nyembe",
    review_age: "4 Jul 2024",
    rating: 5,
    avatar_letter: "G",
    avatar_tone: "#d2902a",
    review_text:
      "Satisfied with the travel agency and services received. Will definitely be using the agency again since I don't keep track of everything. It's perfect because I get reminded of the itineraries/flights and also get recommendations of things I can do. Perfect for solo, couples, or group traveling from what I saw."
  },
  {
    id: 6,
    reviewer_name: "natasha moshoeu",
    review_age: "10 Jul 2024",
    rating: 5,
    avatar_letter: "N",
    avatar_tone: "#f07b57",
    review_text:
      "Had the time of my life... The flights, itinerary, the accommodation, THE ACCOMMODATION which can make or break a vacation... Top tier. Thank you for dealing and handling things that I didn't want to deal with. See you soon."
  },
  {
    id: 7,
    reviewer_name: "Jennifer Rens",
    review_age: "1 May 2024",
    rating: 5,
    avatar_letter: "J",
    avatar_tone: "#3c6ee8",
    review_text:
      "Enjoyed every moment of my stay at Sun City. Thank you so much NBGS. The Sun City hotel was indeed 4-star."
  },
  {
    id: 8,
    reviewer_name: "Wendy Mogano",
    review_age: "42 weeks ago",
    rating: 5,
    avatar_letter: "W",
    avatar_tone: "#4d7f3a",
    review_text:
      "Seamless as they can be. Not even one hurdle. From checking in to free entry to the Valley of the Waves. Couldn't ask for more."
  },
  {
    id: 9,
    reviewer_name: "mo",
    review_age: "4 Jul 2024",
    rating: 5,
    avatar_letter: "M",
    avatar_tone: "#3d8f98",
    review_text:
      "I used the services for my Afronation trip and the whole experience was amazing. I highly recommend."
  },
  {
    id: 10,
    reviewer_name: "lillian williams",
    review_age: "6 Jun 2024",
    rating: 5,
    avatar_letter: "L",
    avatar_tone: "#8a5a1d",
    review_text:
      "She's the best. I always use her and she's reliable."
  }
];

export const faqs = [
  {
    question: "Does NBGS Travel require the travel payments all at once?",
    answer:
      "No. NBGS Travel offers flexible payment options to suit your financial planning. You can pay in full or use a structured payment plan. To confirm your booking, NBGS Travel generally requires a 25% deposit of the total package amount, although some packages may state a different deposit requirement."
  },
  {
    question: "Can I request a customized package if I don't see the destination I want on the page?",
    answer:
      "Yes. NBGS Travel can create a customized travel package if your preferred destination is not listed. The team can help design a more personal itinerary with your chosen destination, tailored activities and experiences, and accommodation and transportation that fit your style and budget."
  },
  {
    question: "Can I choose my own travel dates?",
    answer:
      "Yes. NBGS Travel allows travelers to choose their own travel dates for private trips and customized packages. Group trips usually run on a set schedule, but if you are interested in a group-style experience with different dates, the team can guide you on alternative options."
  },
  {
    question: "What Is the group size for your trips?",
    answer:
      "NBGS Travel group sizes typically range from 8 to 12 participants. This allows for a more engaging travel experience while still giving travelers more personal support throughout the trip."
  },
  {
    question: "Can I request a private trip if I can't join the group trips?",
    answer:
      "Absolutely. NBGS Travel offers private trip options for travelers who cannot join a scheduled group trip. Private trips can be tailored around your interests, preferred pace, and travel goals while still giving you dedicated planning support and flexibility."
  },
  {
    question: "Is it safe to use my banking information on your travel site?",
    answer:
      "Yes. NBGS Travel uses trusted payment processing solutions designed to protect customer information. Transactions are handled through secure systems that use encryption and recognized payment-security standards."
  },
  {
    question: "What if I am unable to travel after booking?",
    answer:
      "If you are unable to travel after booking, the cancellation policy for your package will apply. Depending on timing, NBGS Travel may be able to assist with a partial refund or a transfer to another date, subject to package terms and availability. It is best to contact the team as soon as possible if your plans change."
  },
  {
    question: "Is travel insurance included in the packages?",
    answer:
      "Travel insurance is not included in standard packages unless it is specifically stated. NBGS Travel strongly recommends that travelers purchase comprehensive travel insurance to cover unexpected events before departure."
  }
];

export const categoryCards = [
  {
    title: "Packages",
    kicker: "TRIPS",
    subtitle: "VACATION PACKAGES",
    href: "/packages"
  },
  {
    title: "Int'l Group Trips",
    kicker: "TRIPS",
    subtitle: "GROUP TRIPS",
    href: "/group-trips"
  }
];

export function getPackageVisual(pkg) {
  if (!pkg) return liveMedia.packagesHero;
  if (pkg.adminMeta?.backgroundListingImage) return resolveApiAssetUrl(pkg.adminMeta.backgroundListingImage);
  if (pkg.slug === "visit-zanzibar-2026") return liveMedia.zanzibarHero;
  if ((pkg.package_category || "").toLowerCase().includes("group")) return liveMedia.packagesHero;
  return liveMedia.homeHero;
}
