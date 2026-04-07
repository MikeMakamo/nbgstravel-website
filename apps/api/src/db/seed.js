import bcrypt from "bcryptjs";
import { query } from "./pool.js";
import { slugify } from "@nbgstravel/shared";

async function upsertRole(name, description) {
  await query(
    `
      INSERT INTO roles (name, description)
      VALUES (:name, :description)
      ON DUPLICATE KEY UPDATE description = VALUES(description)
    `,
    { name, description }
  );
}

async function getRoleId(name) {
  const rows = await query("SELECT id FROM roles WHERE name = :name LIMIT 1", { name });
  return rows[0]?.id;
}

async function seedAdmin() {
  const roleId = await getRoleId("super_admin");
  const email = process.env.SEED_SUPER_ADMIN_EMAIL || "admin@nbgstravel.local";
  const password = process.env.SEED_SUPER_ADMIN_PASSWORD || "admin123";
  const firstName = process.env.SEED_SUPER_ADMIN_FIRST_NAME || "System";
  const lastName = process.env.SEED_SUPER_ADMIN_LAST_NAME || "Owner";
  const phoneNumber = process.env.SEED_SUPER_ADMIN_PHONE || "+27000000000";
  const passwordHash = await bcrypt.hash(password, 10);

  await query(
    `
      INSERT INTO admins (role_id, first_name, last_name, email, phone_number, password_hash, is_active)
      VALUES (:roleId, :firstName, :lastName, :email, :phoneNumber, :passwordHash, 1)
      ON DUPLICATE KEY UPDATE role_id = VALUES(role_id), password_hash = VALUES(password_hash), is_active = VALUES(is_active)
    `,
    { roleId, firstName, lastName, email, phoneNumber, passwordHash }
  );
}

async function seedTerms() {
  await query(
    `
      INSERT INTO terms_documents (document_key, title, version_label, is_current, content, is_active)
      VALUES
      ('package_terms', 'Package Booking Terms', 'v1', 1, 'Bookings submitted on the website are lead requests. An NBGS Travel agent will follow up with you to confirm pricing, availability, and next steps.', 1),
      ('visa_terms', 'Visa Application Terms', 'v1', 1, 'Visa applications submitted on the website will be reviewed by NBGS Travel. Payment is collected through PayFast and application processing begins once payment and required documents are confirmed.', 1)
      ON DUPLICATE KEY UPDATE title = VALUES(title), version_label = VALUES(version_label), is_current = VALUES(is_current), content = VALUES(content), is_active = VALUES(is_active)
    `
  );
}

async function seedPackages() {
  const packages = [
    {
      title: "Visit Zanzibar 2026",
      packageCategory: "group_trip",
      destination: "Zanzibar",
      country: "Tanzania",
      continent: "Africa",
      tripType: "Group Trip",
      durationLabel: "5 Nights / 6 Days",
      basePrice: 12999,
      pricingModel: "per_person_sharing",
      quotedFromLabel: "From",
      depositAmount: 3000,
      hasFixedTravelDates: 1,
      fixedTravelStartDate: "2026-07-10",
      fixedTravelEndDate: "2026-07-15",
      shortDescription: "Island escapes, curated excursions, and a relaxed luxury group experience.",
      fullDescription:
        "A polished group escape covering flights guidance, accommodation, curated island experiences, and guided support from the NBGS team.",
      status: "published",
      adminMeta: {
        travelDateLabel: "10 - 15 Jul 2026",
        bio: "Island escapes, curated excursions, and a relaxed luxury group experience.",
        backgroundListingImage: "https://nbgstravel.co.za/wp-content/uploads/2025/07/222782-Zanzibar.jpg.webp",
        describeTrip:
          "Enjoy Zanzibar with a guided NBGS Travel group departure designed for travelers who want a polished island experience with accommodation, curated activities, and ongoing support.",
        tripPolicy:
          "All prices are subject to availability and change until confirmed.\nA non-refundable deposit secures your booking.\nFinal confirmation is handled by NBGS Travel after follow-up.",
        gallery: [
          "https://nbgstravel.co.za/wp-content/uploads/2025/02/472998936_18052737236487047_7230927518770349952_n-1024x576.jpg",
          "https://nbgstravel.co.za/wp-content/uploads/2025/02/480224362_642660051481760_5361578353347056917_n-e1740481322317.jpg"
        ],
        nights: 5,
        isLocalTrip: false,
        mainTripType: "Group",
        includes: ["Accommodation", "Selected activities", "Dedicated group support"],
        excludes: ["Flights", "Personal expenses", "Travel insurance"]
      }
    },
    {
      title: "Dubai Couples Escape",
      packageCategory: "package",
      destination: "Dubai",
      country: "United Arab Emirates",
      continent: "Asia",
      tripType: "Couples Package",
      durationLabel: "4 Nights / 5 Days",
      basePrice: 24999,
      pricingModel: "per_couple",
      quotedFromLabel: "Per Couple",
      depositAmount: 5000,
      hasFixedTravelDates: 0,
      shortDescription: "A romantic city break package designed for couples who want flexibility and polished planning.",
      fullDescription:
        "An upscale couples package covering hotel stay guidance, transfer recommendations, and itinerary support tailored by NBGS Travel.",
      status: "published",
      adminMeta: {
        travelDateLabel: "Own travel date",
        bio: "A romantic Dubai package with flexible dates and premium planning support.",
        backgroundListingImage: "https://nbgstravel.co.za/wp-content/uploads/2025/05/ishan-seefromthesky-rj8fMHNPXbg-unsplash-1-scaled.jpg",
        describeTrip:
          "This couples package gives travelers a polished Dubai experience with curated accommodation, itinerary guidance, and direct NBGS Travel support from planning through confirmation.",
        tripPolicy:
          "Prices remain subject to supplier availability.\nPackage confirmation happens after an NBGS Travel consultant follows up.\nDeposits are handled manually by the team.",
        gallery: [
          "https://nbgstravel.co.za/wp-content/uploads/2025/05/ishan-seefromthesky-rj8fMHNPXbg-unsplash-1-scaled.jpg",
          "https://nbgstravel.co.za/wp-content/uploads/2025/02/480224362_642660051481760_5361578353347056917_n-e1740481322317.jpg"
        ],
        nights: 4,
        isLocalTrip: false,
        mainTripType: "Couples",
        includes: ["Accommodation", "Transfer guidance", "NBGS itinerary support"],
        excludes: ["Visa fees", "Meals not specified", "Travel insurance"]
      }
    },
    {
      title: "Cape Town Getaway",
      packageCategory: "package",
      destination: "Cape Town",
      country: "South Africa",
      continent: "Africa",
      tripType: "Local Package",
      durationLabel: "3 Nights / 4 Days",
      basePrice: 8999,
      pricingModel: "per_person_sharing",
      quotedFromLabel: "From",
      depositAmount: 2000,
      hasFixedTravelDates: 0,
      shortDescription: "A local city escape with flexible dates, scenic stays, and curated support.",
      fullDescription:
        "A refined Cape Town getaway that combines accommodation guidance, local activity recommendations, and NBGS support for couples or small groups.",
      status: "published",
      adminMeta: {
        travelDateLabel: "Own travel date",
        bio: "Flexible Cape Town travel with curated local experiences and comfortable stays.",
        backgroundListingImage: "https://nbgstravel.co.za/wp-content/uploads/2025/02/472998936_18052737236487047_7230927518770349952_n.jpg",
        describeTrip:
          "Cape Town Getaway is designed for travelers who want a smooth local trip with comfortable accommodation, recommended activities, and direct NBGS Travel follow-up.",
        tripPolicy:
          "Local package pricing is subject to availability.\nQuotes are confirmed by an NBGS Travel consultant.\nTravel insurance remains the traveler's responsibility.",
        gallery: [
          "https://nbgstravel.co.za/wp-content/uploads/2025/02/472998936_18052737236487047_7230927518770349952_n.jpg",
          "https://nbgstravel.co.za/wp-content/uploads/2025/05/ishan-seefromthesky-rj8fMHNPXbg-unsplash-1-scaled.jpg"
        ],
        nights: 3,
        isLocalTrip: true,
        mainTripType: "Local",
        includes: ["Accommodation", "Selected local experiences", "NBGS support"],
        excludes: ["Flights", "Personal expenses"]
      }
    }
  ];

  for (const item of packages) {
    const slug = slugify(item.title);
    await query(
      `
        INSERT INTO packages (
          title, slug, package_category, destination, country, continent, trip_type, duration_label,
          base_price, pricing_model, quoted_from_label, deposit_amount, has_fixed_travel_dates,
          fixed_travel_start_date, fixed_travel_end_date, short_description, full_description, status, admin_meta_json
        )
        VALUES (
          :title, :slug, :packageCategory, :destination, :country, :continent, :tripType, :durationLabel,
          :basePrice, :pricingModel, :quotedFromLabel, :depositAmount, :hasFixedTravelDates,
          :fixedTravelStartDate, :fixedTravelEndDate, :shortDescription, :fullDescription, :status, :adminMetaJson
        )
        ON DUPLICATE KEY UPDATE
          destination = VALUES(destination),
          country = VALUES(country),
          continent = VALUES(continent),
          trip_type = VALUES(trip_type),
          duration_label = VALUES(duration_label),
          base_price = VALUES(base_price),
          pricing_model = VALUES(pricing_model),
          quoted_from_label = VALUES(quoted_from_label),
          deposit_amount = VALUES(deposit_amount),
          has_fixed_travel_dates = VALUES(has_fixed_travel_dates),
          fixed_travel_start_date = VALUES(fixed_travel_start_date),
          fixed_travel_end_date = VALUES(fixed_travel_end_date),
          short_description = VALUES(short_description),
          full_description = VALUES(full_description),
          status = VALUES(status),
          admin_meta_json = VALUES(admin_meta_json)
      `,
      {
        ...item,
        slug,
        fixedTravelStartDate: item.fixedTravelStartDate || null,
        fixedTravelEndDate: item.fixedTravelEndDate || null,
        adminMetaJson: JSON.stringify(item.adminMeta || {})
      }
    );

    const packageRows = await query(`SELECT id FROM packages WHERE slug = :slug LIMIT 1`, { slug });
    const packageId = packageRows[0]?.id;

    if (!packageId) {
      continue;
    }

    await query(`DELETE FROM package_inclusions WHERE package_id = :packageId`, { packageId });
    await query(`DELETE FROM package_exclusions WHERE package_id = :packageId`, { packageId });

    for (const [index, inclusion] of (item.adminMeta?.includes || []).entries()) {
      await query(
        `INSERT INTO package_inclusions (package_id, item_text, sort_order) VALUES (:packageId, :itemText, :sortOrder)`,
        {
          packageId,
          itemText: inclusion,
          sortOrder: index
        }
      );
    }

    for (const [index, exclusion] of (item.adminMeta?.excludes || []).entries()) {
      await query(
        `INSERT INTO package_exclusions (package_id, item_text, sort_order) VALUES (:packageId, :itemText, :sortOrder)`,
        {
          packageId,
          itemText: exclusion,
          sortOrder: index
        }
      );
    }
  }
}

async function seedVisas() {
  const visas = [
    {
      title: "UAE Tourist Visa",
      aliases: ["Dubai Visa", "UAE Tourist Visa"],
      country: "United Arab Emirates",
      processingTimeLabel: "24 - 72 Hours",
      applicationFee: 2500,
      description: "Tourist visa support with guided application handling for UAE travel.",
      status: "published"
    },
    {
      title: "Turkey E-Visa",
      aliases: ["Turkey Visa", "Turkey E-Visa"],
      country: "Turkey",
      processingTimeLabel: "24 Hours",
      applicationFee: 500,
      description: "Fast visa support for Turkey travel with a streamlined online application flow.",
      status: "published"
    },
    {
      title: "Indonesian Visa",
      aliases: ["Indonesian Visa"],
      country: "Indonesia",
      processingTimeLabel: "24 Hours",
      applicationFee: 1000,
      description: "Structured visa application support for Indonesia-bound travel.",
      status: "published"
    },
    {
      title: "Kenyan Visa",
      aliases: ["Kenyan Visa"],
      country: "Kenya",
      processingTimeLabel: "24 Hours",
      applicationFee: 500,
      description: "Visa support for Kenya travel with quick application guidance.",
      status: "published"
    },
    {
      title: "UK Visa",
      aliases: ["UK Visa"],
      country: "United Kingdom",
      processingTimeLabel: "5 - 15 working days",
      applicationFee: 2000,
      description: "Application support for UK visa submissions and required document guidance.",
      status: "published"
    },
    {
      title: "Schengen Visa",
      aliases: ["Schengen Visa"],
      country: "Europe",
      processingTimeLabel: "5 - 15 working days",
      applicationFee: 2500,
      description: "Schengen visa support for travelers applying for eligible European destinations.",
      status: "published"
    }
  ];

  for (const item of visas) {
    let existing = null;

    for (const alias of item.aliases) {
      const rows = await query(`SELECT id FROM visa_offerings WHERE title = :title LIMIT 1`, { title: alias });
      if (rows[0]) {
        existing = rows[0];
        break;
      }
    }

    if (!existing) {
      const countryMatch = await query(`SELECT id FROM visa_offerings WHERE country = :country LIMIT 1`, {
        country: item.country
      });
      existing = countryMatch[0] || null;
    }

    if (existing) {
      await query(
        `
          UPDATE visa_offerings
          SET title = :title,
              slug = :slug,
              country = :country,
              processing_time_label = :processingTimeLabel,
              application_fee = :applicationFee,
              description = :description,
              status = :status,
              updated_at = NOW()
          WHERE id = :id
        `,
        {
          ...item,
          id: existing.id,
          slug: slugify(item.title)
        }
      );
      continue;
    }

    await query(
      `
        INSERT INTO visa_offerings (title, slug, country, processing_time_label, application_fee, description, status)
        VALUES (:title, :slug, :country, :processingTimeLabel, :applicationFee, :description, :status)
      `,
      {
        ...item,
        slug: slugify(item.title)
      }
    );
  }
}

async function run() {
  await upsertRole("super_admin", "Full control over the web app and operations");
  await upsertRole("admin", "Client-facing operations and content management");
  await seedAdmin();
  await seedTerms();
  await seedPackages();
  await seedVisas();
}

run()
  .then(() => {
    console.log("Seed complete");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seed failed", error);
    process.exit(1);
  });
