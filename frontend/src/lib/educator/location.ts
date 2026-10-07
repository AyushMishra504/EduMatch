import { INDIAN_STATES } from "./constants";

/**
 * Curated city → state map for the most common locations. Used only to
 * *suggest* a state after the user picks a known city — the user can always
 * change it, and unknown cities leave the state untouched. Never invent
 * data beyond this static list.
 */
export const CITY_STATE_MAP: Record<string, string> = {
  // Metros & major cities
  Mumbai: "Maharashtra",
  Delhi: "Delhi",
  "New Delhi": "Delhi",
  Bengaluru: "Karnataka",
  Bangalore: "Karnataka",
  Hyderabad: "Telangana",
  Chennai: "Tamil Nadu",
  Kolkata: "West Bengal",
  Pune: "Maharashtra",
  Ahmedabad: "Gujarat",
  Surat: "Gujarat",
  Jaipur: "Rajasthan",
  Lucknow: "Uttar Pradesh",
  Kanpur: "Uttar Pradesh",
  Nagpur: "Maharashtra",
  Indore: "Madhya Pradesh",
  Bhopal: "Madhya Pradesh",
  Patna: "Bihar",
  Kochi: "Kerala",
  Cochin: "Kerala",
  Thiruvananthapuram: "Kerala",
  Kozhikode: "Kerala",
  Coimbatore: "Tamil Nadu",
  Madurai: "Tamil Nadu",
  Vijayawada: "Andhra Pradesh",
  Visakhapatnam: "Andhra Pradesh",
  Bhubaneswar: "Odisha",
  Guwahati: "Assam",
  Chandigarh: "Chandigarh",
  Dehradun: "Uttarakhand",
  Shimla: "Himachal Pradesh",
  Srinagar: "Jammu and Kashmir",
  Jammu: "Jammu and Kashmir",
  Ranchi: "Jharkhand",
  Raipur: "Chhattisgarh",
  Panaji: "Goa",
  Mysuru: "Karnataka",
  Mysore: "Karnataka",
  Mangaluru: "Karnataka",
  Mangalore: "Karnataka",
  Hubballi: "Karnataka",
  Belagavi: "Karnataka",
  Nashik: "Maharashtra",
  Aurangabad: "Maharashtra",
  "Chhatrapati Sambhajinagar": "Maharashtra",
  Thane: "Maharashtra",
  "Navi Mumbai": "Maharashtra",
  Kolhapur: "Maharashtra",
  Amravati: "Maharashtra",
  Solapur: "Maharashtra",
  Noida: "Uttar Pradesh",
  Ghaziabad: "Uttar Pradesh",
  Agra: "Uttar Pradesh",
  Varanasi: "Uttar Pradesh",
  Meerut: "Uttar Pradesh",
  Allahabad: "Uttar Pradesh",
  Prayagraj: "Uttar Pradesh",
  Gurugram: "Haryana",
  Gurgaon: "Haryana",
  Faridabad: "Haryana",
  Ludhiana: "Punjab",
  Amritsar: "Punjab",
  Jalandhar: "Punjab",
  Udaipur: "Rajasthan",
  Jodhpur: "Rajasthan",
  Kota: "Rajasthan",
  Ajmer: "Rajasthan",
  Gwalior: "Madhya Pradesh",
  Jabalpur: "Madhya Pradesh",
  Ujjain: "Madhya Pradesh",
  Vadodara: "Gujarat",
  Rajkot: "Gujarat",
  Gandhinagar: "Gujarat",
  Tiruchirappalli: "Tamil Nadu",
  Trichy: "Tamil Nadu",
  Salem: "Tamil Nadu",
  Tirunelveli: "Tamil Nadu",
  Warangal: "Telangana",
  Guntur: "Andhra Pradesh",
  Tirupati: "Andhra Pradesh",
  Cuttack: "Odisha",
  Rourkela: "Odisha",
  Dhanbad: "Jharkhand",
  Jamshedpur: "Jharkhand",
  Bokaro: "Jharkhand",
  Durgapur: "West Bengal",
  Howrah: "West Bengal",
  Siliguri: "West Bengal",
  "Salt Lake": "West Bengal",
  Shillong: "Meghalaya",
  Aizawl: "Mizoram",
  Kohima: "Nagaland",
  Imphal: "Manipur",
  Agartala: "Tripura",
  Itanagar: "Arunachal Pradesh",
  Gangtok: "Sikkim",
  Puducherry: "Puducherry",
  Pondicherry: "Puducherry",
  "Port Blair": "Andaman and Nicobar Islands",
  "Sri Vijaya Puram": "Andaman and Nicobar Islands",
  Leh: "Ladakh",
  Kavaratti: "Lakshadweep",
  Daman: "Dadra and Nagar Haveli and Daman and Diu",
  Silvassa: "Dadra and Nagar Haveli and Daman and Diu",
};

export const KNOWN_CITIES = Object.keys(CITY_STATE_MAP).sort();

/** Popular locations offered as quick suggestions (all map to a state). */
export const POPULAR_CITIES = [
  "Bengaluru",
  "Mumbai",
  "Delhi",
  "Hyderabad",
  "Chennai",
  "Pune",
  "Kolkata",
  "Ahmedabad",
  "Jaipur",
  "Lucknow",
  "Kochi",
  "Chandigarh",
];

/** Look up the state for a known city (case-insensitive). */
export function stateForCity(city: string): string | null {
  const needle = city.trim().toLowerCase();
  if (!needle) return null;
  for (const [name, state] of Object.entries(CITY_STATE_MAP)) {
    if (name.toLowerCase() === needle) return state;
  }
  return null;
}

/** Guard that a state value is one of the schema-accepted states. */
export function isKnownState(state: string): boolean {
  return (INDIAN_STATES as readonly string[]).includes(state);
}
