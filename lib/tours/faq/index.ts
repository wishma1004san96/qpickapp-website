import type { TourFaq } from "../types";

export const TOUR_FAQS: TourFaq[] = [
  {
    id: "hub-customize",
    question: "Can I customise a Q Pick tour package?",
    answer:
      "Yes. Published packages are starting points. Choose destinations, days, vehicle, and preferences in the planner — our desk refines the route after you submit a request.",
  },
  {
    id: "hub-price",
    question: "How does pricing work?",
    answer:
      "We show Pricing Available Upon Request until your itinerary is reviewed. After you submit a tour request, Q Pick confirms a written private-chauffeur quote. Entrance fees, safari jeeps, accommodation, and meals are typically separate unless stated in writing.",
  },
  {
    id: "hub-airport",
    question: "Do you offer airport pickup with tours?",
    answer:
      "Yes. Bandaranaike International (CMB) pickup and drop-off can be arranged with your tour or via our dedicated airport transfer service.",
  },
  {
    id: "hub-group",
    question: "Which vehicle should I choose?",
    answer:
      "Sedans suit couples; SUVs and vans fit families; luxury vans and mini coaches serve larger groups. Select capacity in the planner — we confirm the final vehicle after reviewing luggage and route.",
  },
  {
    id: "hub-payment",
    question: "How do payments and confirmation work?",
    answer:
      "Submit a tour request online. Our team reviews availability, confirms an outline and quote, then shares next steps for payment and chauffeur assignment. You receive a reference code for tracking.",
  },
  {
    id: "pkg-3d-pace",
    question: "Is three days enough for the Cultural Triangle?",
    answer:
      "Three days can cover Sigiriya, Dambulla, and either Anuradhapura or Polonnaruwa at a composed private pace. Longer stays allow Mihintale, safari add-ons, or a Kandy extension.",
  },
  {
    id: "pkg-5d-train",
    question: "Can we include the Ella train?",
    answer:
      "Yes. Many guests ride a scenic rail segment while the chauffeur transfers luggage by road. Tell us your preference when requesting a quote.",
  },
  {
    id: "pkg-5d-weather",
    question: "What is the weather like in the hill country?",
    answer:
      "Nuwara Eliya and Ella are cooler than the coast, with misty mornings and possible light rain. Pack layers; your private vehicle keeps transfers comfortable between viewpoints.",
  },
  {
    id: "pkg-7d-fitness",
    question: "How much walking is involved on the 7-day tour?",
    answer:
      "Sigiriya and temple visits involve steps; Ella offers optional short walks. Your chauffeur times the day so strenuous segments can be shortened without losing the highlights.",
  },
  {
    id: "pkg-10d-safari",
    question: "Is a Yala safari included in the wildlife adventure?",
    answer:
      "Safari jeep hire and park entry are arranged as add-ons with clear timing. Wildlife sightings are never guaranteed — we plan for the best seasonal window after your request.",
  },
  {
    id: "pkg-14d-pace",
    question: "Is fourteen days too much driving?",
    answer:
      "With a private chauffeur and spaced overnight stops, daily driving stays manageable. We design rest beach days so the itinerary feels immersive, not rushed.",
  },
  {
    id: "pkg-21d-season",
    question: "When is the best season for a grand island tour?",
    answer:
      "West and south coasts favour December–March; the east often shines around May–September. A 21-day plan can follow the drier shore — we advise based on your travel month.",
  },
];

export const HUB_FAQ_IDS = [
  "hub-customize",
  "hub-price",
  "hub-airport",
  "hub-group",
  "hub-payment",
] as const;
