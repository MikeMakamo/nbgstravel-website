const LOCATION_HIERARCHY = {
  Africa: {
    Algeria: ["Adrar", "Algiers", "Constantine", "Oran", "Tamanrasset"],
    Angola: ["Benguela", "Huambo", "Huila", "Luanda"],
    Benin: ["Alibori", "Atlantique", "Borgou", "Littoral", "Oueme"],
    Botswana: ["Central District", "Gaborone", "Kgatleng", "North-East", "North-West", "South-East"],
    "Burkina Faso": ["Boucle du Mouhoun", "Centre", "Centre-Est", "Hauts-Bassins", "Sahel"],
    Burundi: ["Bujumbura Mairie", "Bujumbura Rural", "Gitega", "Ngozi"],
    "Cabo Verde": ["Boa Vista", "Maio", "Praia", "Sal", "Sao Vicente"],
    Cameroon: ["Centre", "Far North", "Littoral", "North-West", "South-West"],
    "Central African Republic": ["Bangui", "Ombella-M'Poko", "Ouaka"],
    Chad: ["Batha", "Ennedi-Ouest", "Logone Occidental", "N'Djamena"],
    Comoros: ["Anjouan", "Grande Comore", "Moheli"],
    "Congo (Republic of the Congo)": ["Brazzaville", "Kouilou", "Pointe-Noire"],
    "Democratic Republic of the Congo": ["Haut-Katanga", "Kinshasa", "Kongo Central", "Nord-Kivu"],
    Djibouti: ["Ali Sabieh", "Arta", "Djibouti", "Tadjourah"],
    Egypt: ["Alexandria Governorate", "Cairo Governorate", "Giza Governorate", "Red Sea Governorate", "South Sinai"],
    "Equatorial Guinea": ["Annobon", "Bioko Norte", "Centro Sur", "Litoral"],
    Eritrea: ["Anseba", "Central", "Gash-Barka", "Southern Red Sea"],
    Eswatini: ["Hhohho", "Lubombo", "Manzini", "Shiselweni"],
    Ethiopia: ["Addis Ababa", "Amhara", "Dire Dawa", "Oromia", "Southern Nations, Nationalities and Peoples"],
    Gabon: ["Estuaire", "Haut-Ogooue", "Ngounie", "Ogooue-Maritime"],
    Gambia: ["Banjul", "Kanifing", "Lower River", "West Coast"],
    Ghana: ["Ashanti", "Central", "Eastern", "Greater Accra", "Western"],
    Guinea: ["Boke", "Conakry", "Kankan", "Kindia", "Nzerekore"],
    "Guinea-Bissau": ["Bafata", "Biombo", "Bolama", "Cacheu"],
    "Cote d'Ivoire": ["Bas-Sassandra", "Lagunes", "Savanes", "Vallee du Bandama", "Yamoussoukro"],
    Kenya: ["Kiambu County", "Kisumu County", "Kwale County", "Mombasa County", "Nairobi County", "Nakuru County", "Uasin Gishu County"],
    Lesotho: ["Berea", "Leribe", "Maseru", "Mokhotlong"],
    Liberia: ["Bomi", "Grand Bassa", "Montserrado", "Nimba"],
    Libya: ["Benghazi", "Misrata", "Murqub", "Tripoli"],
    Madagascar: ["Analamanga", "Atsinanana", "Boeny", "Diana", "Haute Matsiatra"],
    Malawi: ["Central Region", "Lilongwe", "Northern Region", "Southern Region"],
    Mali: ["Bamako", "Kayes", "Mopti", "Sikasso"],
    Mauritania: ["Adrar", "Dakhlet Nouadhibou", "Hodh Ech Chargui", "Nouakchott-Nord"],
    Mauritius: ["Black River", "Flacq", "Grand Port", "Moka", "Pamplemousses", "Plaines Wilhems", "Port Louis", "Riviere du Rempart", "Savanne"],
    Morocco: ["Casablanca-Settat", "Fes-Meknes", "Marrakech-Safi", "Rabat-Sale-Kenitra", "Souss-Massa", "Tangier-Tetouan-Al Hoceima"],
    Mozambique: ["Cabo Delgado", "Gaza", "Inhambane", "Maputo", "Nampula", "Sofala"],
    Namibia: ["Erongo", "Hardap", "Khomas", "Kunene", "Oshana", "Otjozondjupa"],
    Niger: ["Agadez", "Diffa", "Maradi", "Niamey", "Tillaberi"],
    Nigeria: ["Abuja Federal Capital Territory", "Kano", "Lagos", "Ogun", "Rivers"],
    Rwanda: ["Eastern Province", "Kigali", "Northern Province", "Western Province"],
    "Sao Tome and Principe": ["Principe", "Sao Tome", "Agua Grande", "Me-Zochi"],
    Senegal: ["Dakar", "Saint-Louis", "Saly", "Thies", "Ziguinchor"],
    Seychelles: ["Anse Boileau", "Beau Vallon", "Bel Air", "English River", "Grand Anse Mahe", "La Digue and Inner Islands"],
    "Sierra Leone": ["Bombali", "Freetown", "Kenema", "Western Area Urban"],
    Somalia: ["Banadir", "Bari", "Lower Juba", "Mudug"],
    "South Africa": ["Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal", "Limpopo", "Mpumalanga", "North West", "Northern Cape", "Western Cape"],
    "South Sudan": ["Central Equatoria", "Eastern Equatoria", "Jonglei", "Upper Nile"],
    Sudan: ["Khartoum", "North Darfur", "Red Sea", "River Nile"],
    Tanzania: ["Arusha", "Dar es Salaam", "Kilimanjaro", "Manyara", "Pemba North", "Zanzibar North", "Zanzibar South and Central", "Zanzibar Urban West"],
    Togo: ["Kara", "Maritime", "Plateaux", "Savanes"],
    Tunisia: ["Ariana", "Medenine", "Sfax", "Sousse", "Tunis"],
    Uganda: ["Central Region", "Eastern Region", "Kampala", "Northern Region", "Western Region"],
    Zambia: ["Central Province", "Copperbelt Province", "Livingstone", "Lusaka Province", "Southern Province"],
    Zimbabwe: ["Bulawayo", "Harare", "Manicaland", "Matabeleland North", "Mashonaland West"]
  },
  Asia: {
    Cambodia: ["Kampot", "Phnom Penh", "Preah Sihanouk", "Siem Reap"],
    China: ["Beijing", "Guangdong", "Shanghai", "Sichuan", "Zhejiang"],
    Indonesia: ["Bali", "Jakarta", "Riau Islands", "West Java", "West Nusa Tenggara", "Yogyakarta"],
    Japan: ["Hokkaido", "Kyoto", "Osaka", "Okinawa", "Tokyo"],
    Malaysia: ["Johor", "Kuala Lumpur", "Penang", "Sabah", "Selangor"],
    Maldives: ["Alifu Dhaalu", "Baa", "Kaafu", "Noonu", "Raa"],
    Singapore: ["Central Region", "East Region", "North Region", "North-East Region", "West Region"],
    "South Korea": ["Busan", "Gangwon", "Jeju", "Seoul"],
    "Sri Lanka": ["Central", "Southern", "Uva", "Western"],
    Thailand: ["Bangkok", "Chiang Mai", "Krabi", "Phang Nga", "Phuket", "Surat Thani"],
    Vietnam: ["Da Nang", "Hanoi", "Ho Chi Minh City", "Khanh Hoa", "Quang Nam"]
  },
  Europe: {
    Croatia: ["Dubrovnik-Neretva", "Istria", "Split-Dalmatia", "Zagreb"],
    France: ["Auvergne-Rhone-Alpes", "Ile-de-France", "Occitanie", "Provence-Alpes-Cote d'Azur"],
    Germany: ["Bavaria", "Berlin", "Hamburg", "Hesse", "North Rhine-Westphalia"],
    Greece: ["Attica", "Central Macedonia", "Crete", "South Aegean"],
    Italy: ["Campania", "Lazio", "Lombardy", "Sardinia", "Sicily", "Tuscany", "Veneto"],
    Netherlands: ["North Brabant", "North Holland", "South Holland", "Utrecht", "Zeeland"],
    Portugal: ["Azores", "Faro", "Lisbon", "Madeira", "Porto"],
    Spain: ["Andalusia", "Balearic Islands", "Canary Islands", "Catalonia", "Community of Madrid", "Valencian Community"],
    Switzerland: ["Bern", "Geneva", "Graubunden", "Valais", "Zurich"],
    Turkey: ["Antalya", "Istanbul", "Izmir", "Mugla"],
    "United Kingdom": ["England", "Northern Ireland", "Scotland", "Wales"]
  },
  "Middle East": {
    Bahrain: ["Capital", "Muharraq", "Northern", "Southern"],
    Jordan: ["Aqaba", "Amman", "Balqa", "Irbid"],
    Oman: ["Al Batinah North", "Dhofar", "Muscat"],
    Qatar: ["Al Rayyan", "Al Wakrah", "Doha"],
    "Saudi Arabia": ["Eastern Province", "Makkah", "Medina", "Riyadh"],
    "United Arab Emirates": ["Abu Dhabi", "Ajman", "Dubai", "Fujairah", "Ras Al Khaimah", "Sharjah"]
  },
  "North America": {
    Bahamas: ["Bimini", "Exuma", "New Providence", "Paradise Island"],
    Canada: ["Alberta", "British Columbia", "Ontario", "Quebec"],
    Mexico: ["Baja California Sur", "Jalisco", "Mexico City", "Quintana Roo"],
    "United States": ["California", "Florida", "Hawaii", "Nevada", "New York", "Texas"]
  },
  Oceania: {
    Australia: ["New South Wales", "Queensland", "Tasmania", "Victoria", "Western Australia"],
    Fiji: ["Central Division", "Northern Division", "Western Division"],
    "New Zealand": ["Auckland", "Canterbury", "Otago", "Wellington"]
  },
  "South America": {
    Argentina: ["Buenos Aires", "Cordoba", "Mendoza"],
    Brazil: ["Bahia", "Pernambuco", "Rio de Janeiro", "Santa Catarina", "Sao Paulo"],
    Chile: ["Magallanes", "Metropolitan Region", "Valparaiso"],
    Colombia: ["Antioquia", "Bolivar", "Cundinamarca", "Magdalena"],
    Peru: ["Arequipa", "Cusco", "Lima"]
  }
};

const CITY_SUGGESTIONS = {
  Africa: {
    Botswana: {
      __all__: ["Gaborone", "Kasane", "Maun", "Palapye"]
    },
    Egypt: {
      __all__: ["Alexandria", "Aswan", "Cairo", "Giza", "Hurghada", "Luxor", "Sharm El Sheikh"]
    },
    Kenya: {
      __all__: ["Diani", "Kisumu", "Mombasa", "Nairobi", "Naivasha", "Nakuru"]
    },
    Mauritius: {
      __all__: ["Belle Mare", "Flic en Flac", "Grand Baie", "Le Morne", "Port Louis", "Trou aux Biches"]
    },
    Morocco: {
      __all__: ["Agadir", "Casablanca", "Fes", "Marrakesh", "Rabat", "Tangier"]
    },
    Namibia: {
      __all__: ["Swakopmund", "Walvis Bay", "Windhoek"]
    },
    Seychelles: {
      __all__: ["Beau Vallon", "La Digue", "Victoria"]
    },
    "South Africa": {
      "Western Cape": ["Cape Town", "Franschhoek", "George", "Hermanus", "Paarl", "Stellenbosch"],
      Gauteng: ["Johannesburg", "Pretoria", "Sandton", "Soweto"],
      "KwaZulu-Natal": ["Ballito", "Durban", "Pietermaritzburg", "Umhlanga"],
      "Eastern Cape": ["East London", "Gqeberha", "Jeffreys Bay"],
      Limpopo: ["Hoedspruit", "Polokwane"],
      Mpumalanga: ["Hazyview", "Mbombela", "White River"],
      "North West": ["Hartbeespoort", "Sun City"],
      "Northern Cape": ["Kimberley", "Upington"],
      "Free State": ["Bloemfontein", "Clarens"]
    },
    Tanzania: {
      __all__: ["Arusha", "Dar es Salaam", "Moshi", "Nungwi", "Paje", "Stone Town"],
      "Zanzibar Urban West": ["Stone Town"],
      "Zanzibar North": ["Nungwi", "Kendwa"],
      "Zanzibar South and Central": ["Jambiani", "Paje"]
    },
    Zambia: {
      __all__: ["Livingstone", "Lusaka", "Ndola"]
    },
    Zimbabwe: {
      __all__: ["Harare", "Hwange", "Victoria Falls"]
    }
  },
  Asia: {
    Indonesia: {
      Bali: ["Canggu", "Nusa Dua", "Seminyak", "Ubud", "Uluwatu"],
      __all__: ["Jakarta", "Lombok", "Ubud"]
    },
    Japan: {
      __all__: ["Kyoto", "Osaka", "Sapporo", "Tokyo"]
    },
    Maldives: {
      __all__: ["Ari Atoll", "Baa Atoll", "Male"]
    },
    Singapore: {
      __all__: ["Sentosa", "Singapore"]
    },
    Thailand: {
      Bangkok: ["Bangkok"],
      Phuket: ["Patong", "Phuket Town", "Rawai"],
      Krabi: ["Ao Nang", "Krabi Town", "Railay Beach"],
      __all__: ["Bangkok", "Chiang Mai", "Koh Samui", "Phuket"]
    },
    Vietnam: {
      __all__: ["Da Nang", "Hanoi", "Hoi An", "Ho Chi Minh City", "Nha Trang"]
    }
  },
  Europe: {
    France: {
      __all__: ["Cannes", "Lyon", "Nice", "Paris"]
    },
    Greece: {
      __all__: ["Athens", "Crete", "Mykonos", "Santorini", "Thessaloniki"]
    },
    Italy: {
      __all__: ["Florence", "Milan", "Naples", "Rome", "Venice"]
    },
    Portugal: {
      __all__: ["Albufeira", "Funchal", "Lisbon", "Porto"]
    },
    Spain: {
      Catalonia: ["Barcelona", "Girona", "Lloret de Mar", "Sitges", "Tarragona"],
      Andalusia: ["Granada", "Malaga", "Marbella", "Seville"],
      "Balearic Islands": ["Ibiza", "Palma de Mallorca"],
      "Canary Islands": ["Costa Adeje", "Las Palmas", "Puerto del Carmen"],
      "Community of Madrid": ["Madrid"],
      "Valencian Community": ["Alicante", "Benidorm", "Valencia"],
      __all__: ["Barcelona", "Ibiza", "Madrid", "Malaga", "Palma de Mallorca", "Seville", "Valencia"]
    },
    Turkey: {
      Antalya: ["Antalya", "Belek", "Kemer"],
      Istanbul: ["Istanbul"],
      Mugla: ["Bodrum", "Fethiye", "Marmaris"],
      __all__: ["Antalya", "Bodrum", "Istanbul"]
    },
    "United Kingdom": {
      England: ["London", "Manchester"],
      Scotland: ["Edinburgh", "Glasgow"],
      __all__: ["Edinburgh", "London", "Manchester"]
    }
  },
  "Middle East": {
    Oman: {
      __all__: ["Muscat", "Salalah"]
    },
    Qatar: {
      __all__: ["Doha", "Lusail"]
    },
    "Saudi Arabia": {
      __all__: ["Jeddah", "Mecca", "Medina", "Riyadh"]
    },
    "United Arab Emirates": {
      Dubai: ["Dubai", "Jumeirah", "Palm Jumeirah"],
      "Abu Dhabi": ["Abu Dhabi", "Yas Island"],
      Sharjah: ["Sharjah"],
      __all__: ["Abu Dhabi", "Dubai", "Ras Al Khaimah", "Sharjah"]
    }
  },
  "North America": {
    Bahamas: {
      __all__: ["Nassau", "Paradise Island"]
    },
    Mexico: {
      "Quintana Roo": ["Cancun", "Playa del Carmen", "Tulum"],
      "Baja California Sur": ["Cabo San Lucas"],
      __all__: ["Cancun", "Cabo San Lucas", "Mexico City", "Playa del Carmen", "Tulum"]
    },
    "United States": {
      California: ["Los Angeles", "San Diego", "San Francisco"],
      Florida: ["Miami", "Orlando"],
      Hawaii: ["Honolulu", "Maui"],
      Nevada: ["Las Vegas"],
      "New York": ["New York City"],
      __all__: ["Las Vegas", "Los Angeles", "Miami", "New York City", "Orlando"]
    }
  },
  Oceania: {
    Australia: {
      "New South Wales": ["Sydney"],
      Queensland: ["Brisbane", "Gold Coast", "Cairns"],
      Victoria: ["Melbourne"],
      "Western Australia": ["Perth"],
      __all__: ["Brisbane", "Melbourne", "Perth", "Sydney"]
    },
    Fiji: {
      __all__: ["Denarau Island", "Nadi", "Suva"]
    },
    "New Zealand": {
      __all__: ["Auckland", "Christchurch", "Queenstown", "Wellington"]
    }
  },
  "South America": {
    Brazil: {
      "Rio de Janeiro": ["Buzios", "Copacabana", "Rio de Janeiro"],
      "Sao Paulo": ["Sao Paulo"],
      __all__: ["Rio de Janeiro", "Salvador", "Sao Paulo"]
    },
    Peru: {
      __all__: ["Cusco", "Lima", "Machu Picchu"]
    }
  }
};

function sortValues(values) {
  return [...new Set(values)].sort((left, right) => left.localeCompare(right));
}

function withCurrentValue(values, currentValue = "") {
  const cleanedCurrentValue = String(currentValue || "").trim();
  const nextValues = sortValues(values);

  if (cleanedCurrentValue && !nextValues.includes(cleanedCurrentValue)) {
    return [cleanedCurrentValue, ...nextValues];
  }

  return nextValues;
}

export function getContinentOptions(currentValue = "") {
  return withCurrentValue(Object.keys(LOCATION_HIERARCHY), currentValue);
}

export function getCountryOptions(continent, currentValue = "") {
  const countries = continent && LOCATION_HIERARCHY[continent] ? Object.keys(LOCATION_HIERARCHY[continent]) : [];
  return withCurrentValue(countries, currentValue);
}

export function getRegionOptions(continent, country, currentValue = "") {
  const regions = continent && country && LOCATION_HIERARCHY[continent]?.[country] ? LOCATION_HIERARCHY[continent][country] : [];
  return withCurrentValue(regions, currentValue);
}

export function getCityOptions(continent, country, region, currentValue = "") {
  const countryCities = CITY_SUGGESTIONS[continent]?.[country] || {};
  const scopedCities = [
    ...(countryCities.__all__ || []),
    ...(region ? countryCities[region] || [] : [])
  ];

  return withCurrentValue(scopedCities, currentValue);
}

export function getAllCountryOptions(currentValue = "") {
  const countrySet = new Set();

  Object.values(LOCATION_HIERARCHY).forEach((countries) => {
    Object.keys(countries).forEach((country) => {
      countrySet.add(country);
    });
  });

  return withCurrentValue([...countrySet], currentValue);
}

export default LOCATION_HIERARCHY;
