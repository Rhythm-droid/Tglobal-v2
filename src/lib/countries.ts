/* ─── Country dataset ─────────────────────────────────────────────
 *
 * Single source of truth for the phone-number country picker used in
 * CTA.tsx. The list is split into two tiers:
 *
 *   POPULAR (top 22) — the markets TGlobal sees the most inbound
 *   inquiries from. Each entry has a hand-tuned national-format mask
 *   ("##### #####" for IN, "(###) ###-####" for US, etc.) so the
 *   input shows familiar grouping as the user types.
 *
 *   REST (~200) — the long tail of every other ISO 3166-1 country
 *   and major dependency. We use a generic "### ### ####" mask and
 *   permissive 6–15 digit bounds. Format precision matters less here
 *   because volume is low and the receiving inbox can normalise.
 *
 * Both tiers share the same `Country` shape so the picker and form
 * logic don't need to know the difference. Validation is uniform —
 * `isValidPhoneForCountry` simply enforces the per-row min/max.
 *
 * Why not a third-party lib (libphonenumber-js, etc.):
 *   • Adds 200KB+ to the client bundle for a single form.
 *   • The hand-tuned masks for popular countries already give the
 *     user the formatting feedback that matters most.
 *   • Real validation happens server-side anyway.
 *
 * Order:
 *   • IN first (default — most TGlobal traffic).
 *   • US, GB, AU, JP, DE, FR, AE, SG, CN, KR, BR, ZA, NL, ES, IT,
 *     SE, NO, FI, CH, AT, BE — the boss's curated "popular" list.
 *   • Everything else alphabetical by display name. */

export interface Country {
  /** ISO 3166-1 alpha-2 code, lowercase. Used for flag CDN URL and
   *  as the stable identifier in form state. */
  iso2: string;
  /** Display name (English). */
  name: string;
  /** International dial code, with leading "+". */
  dial: string;
  /** National display mask — "#" = digit slot, other chars are
   *  literal separators (space, dash, paren). */
  format: string;
  /** Minimum national digit count for a valid number. */
  minDigits: number;
  /** Maximum national digit count. */
  maxDigits: number;
  /** Example formatted national number, used as the input placeholder
   *  so users see the expected shape per country. */
  placeholder: string;
}

/* Helper for the long-tail entries — keeps the array compact and
 * makes per-country tweaks (override min/max if needed) trivial. */
const GENERIC_FORMAT = "### ### ####";
const GENERIC_PLACEHOLDER = "123 456 7890";

function std(
  iso2: string,
  name: string,
  dial: string,
  minDigits = 6,
  maxDigits = 15,
): Country {
  return {
    iso2,
    name,
    dial,
    format: GENERIC_FORMAT,
    minDigits,
    maxDigits,
    placeholder: GENERIC_PLACEHOLDER,
  };
}

/* ─── Tier 1: popular markets, hand-tuned formats ───────────── */
const POPULAR: Country[] = [
  { iso2: "in", name: "India", dial: "+91", format: "##### #####", minDigits: 10, maxDigits: 10, placeholder: "98765 43210" },
  { iso2: "us", name: "United States", dial: "+1", format: "(###) ###-####", minDigits: 10, maxDigits: 10, placeholder: "(555) 555-5555" },
  { iso2: "gb", name: "United Kingdom", dial: "+44", format: "##### ######", minDigits: 10, maxDigits: 11, placeholder: "07911 123456" },
  { iso2: "au", name: "Australia", dial: "+61", format: "### ### ###", minDigits: 9, maxDigits: 9, placeholder: "412 345 678" },
  { iso2: "jp", name: "Japan", dial: "+81", format: "##-####-####", minDigits: 10, maxDigits: 10, placeholder: "90-1234-5678" },
  { iso2: "de", name: "Germany", dial: "+49", format: "### ########", minDigits: 10, maxDigits: 11, placeholder: "151 12345678" },
  { iso2: "fr", name: "France", dial: "+33", format: "# ## ## ## ##", minDigits: 9, maxDigits: 9, placeholder: "6 12 34 56 78" },
  { iso2: "ae", name: "UAE", dial: "+971", format: "## ### ####", minDigits: 8, maxDigits: 9, placeholder: "50 123 4567" },
  { iso2: "sg", name: "Singapore", dial: "+65", format: "#### ####", minDigits: 8, maxDigits: 8, placeholder: "9876 5432" },
  { iso2: "cn", name: "China", dial: "+86", format: "### #### ####", minDigits: 11, maxDigits: 11, placeholder: "138 1234 5678" },
  { iso2: "kr", name: "South Korea", dial: "+82", format: "##-####-####", minDigits: 9, maxDigits: 10, placeholder: "10-1234-5678" },
  { iso2: "br", name: "Brazil", dial: "+55", format: "(##) #####-####", minDigits: 10, maxDigits: 11, placeholder: "(11) 91234-5678" },
  { iso2: "za", name: "South Africa", dial: "+27", format: "## ### ####", minDigits: 9, maxDigits: 9, placeholder: "82 123 4567" },
  { iso2: "nl", name: "Netherlands", dial: "+31", format: "# ## ## ## ##", minDigits: 9, maxDigits: 9, placeholder: "6 12 34 56 78" },
  { iso2: "es", name: "Spain", dial: "+34", format: "### ### ###", minDigits: 9, maxDigits: 9, placeholder: "612 345 678" },
  { iso2: "it", name: "Italy", dial: "+39", format: "### ### ####", minDigits: 9, maxDigits: 10, placeholder: "312 123 4567" },
  { iso2: "se", name: "Sweden", dial: "+46", format: "## ### ## ##", minDigits: 8, maxDigits: 9, placeholder: "70 123 45 67" },
  { iso2: "no", name: "Norway", dial: "+47", format: "### ## ###", minDigits: 8, maxDigits: 8, placeholder: "412 34 567" },
  { iso2: "fi", name: "Finland", dial: "+358", format: "## ### ####", minDigits: 9, maxDigits: 10, placeholder: "40 123 4567" },
  { iso2: "ch", name: "Switzerland", dial: "+41", format: "## ### ## ##", minDigits: 9, maxDigits: 9, placeholder: "76 123 45 67" },
  { iso2: "at", name: "Austria", dial: "+43", format: "### ### ###", minDigits: 9, maxDigits: 11, placeholder: "664 123 456" },
  { iso2: "be", name: "Belgium", dial: "+32", format: "### ## ## ##", minDigits: 9, maxDigits: 9, placeholder: "470 12 34 56" },
];

/* ─── Tier 2: long tail, alphabetical by display name ────────
 * Per-country digit bounds are tuned where they meaningfully differ
 * from the default (6–15). The format mask is the generic
 * "### ### ####" — good enough for a contact form; precise national
 * formatting is a server-side concern. */
const REST: Country[] = [
  std("af", "Afghanistan", "+93", 9, 9),
  std("al", "Albania", "+355", 8, 9),
  std("dz", "Algeria", "+213", 8, 9),
  std("as", "American Samoa", "+1", 10, 10),
  std("ad", "Andorra", "+376", 6, 9),
  std("ao", "Angola", "+244", 9, 9),
  std("ai", "Anguilla", "+1", 10, 10),
  std("ag", "Antigua and Barbuda", "+1", 10, 10),
  std("ar", "Argentina", "+54", 10, 11),
  std("am", "Armenia", "+374", 8, 8),
  std("aw", "Aruba", "+297", 7, 7),
  std("az", "Azerbaijan", "+994", 9, 9),
  std("bs", "Bahamas", "+1", 10, 10),
  std("bh", "Bahrain", "+973", 8, 8),
  std("bd", "Bangladesh", "+880", 10, 10),
  std("bb", "Barbados", "+1", 10, 10),
  std("by", "Belarus", "+375", 9, 9),
  std("bz", "Belize", "+501", 7, 7),
  std("bj", "Benin", "+229", 8, 8),
  std("bm", "Bermuda", "+1", 10, 10),
  std("bt", "Bhutan", "+975", 7, 8),
  std("bo", "Bolivia", "+591", 8, 8),
  std("ba", "Bosnia and Herzegovina", "+387", 8, 9),
  std("bw", "Botswana", "+267", 7, 8),
  std("io", "British Indian Ocean Territory", "+246", 7, 7),
  std("vg", "British Virgin Islands", "+1", 10, 10),
  std("bn", "Brunei", "+673", 7, 7),
  std("bg", "Bulgaria", "+359", 8, 9),
  std("bf", "Burkina Faso", "+226", 8, 8),
  std("bi", "Burundi", "+257", 8, 8),
  std("kh", "Cambodia", "+855", 8, 9),
  std("cm", "Cameroon", "+237", 9, 9),
  std("ca", "Canada", "+1", 10, 10),
  std("cv", "Cape Verde", "+238", 7, 7),
  std("ky", "Cayman Islands", "+1", 10, 10),
  std("cf", "Central African Republic", "+236", 8, 8),
  std("td", "Chad", "+235", 8, 8),
  std("cl", "Chile", "+56", 8, 9),
  std("co", "Colombia", "+57", 10, 10),
  std("km", "Comoros", "+269", 7, 7),
  std("cg", "Republic of the Congo", "+242", 9, 9),
  std("cd", "DR Congo", "+243", 9, 9),
  std("ck", "Cook Islands", "+682", 5, 5),
  std("cr", "Costa Rica", "+506", 8, 8),
  std("ci", "Côte d'Ivoire", "+225", 8, 10),
  std("hr", "Croatia", "+385", 8, 9),
  std("cu", "Cuba", "+53", 8, 8),
  std("cw", "Curaçao", "+599", 7, 8),
  std("cy", "Cyprus", "+357", 8, 8),
  std("cz", "Czech Republic", "+420", 9, 9),
  std("dk", "Denmark", "+45", 8, 8),
  std("dj", "Djibouti", "+253", 8, 8),
  std("dm", "Dominica", "+1", 10, 10),
  std("do", "Dominican Republic", "+1", 10, 10),
  std("ec", "Ecuador", "+593", 8, 9),
  std("eg", "Egypt", "+20", 9, 10),
  std("sv", "El Salvador", "+503", 8, 8),
  std("gq", "Equatorial Guinea", "+240", 9, 9),
  std("er", "Eritrea", "+291", 7, 7),
  std("ee", "Estonia", "+372", 7, 8),
  std("sz", "Eswatini", "+268", 8, 8),
  std("et", "Ethiopia", "+251", 9, 9),
  std("fk", "Falkland Islands", "+500", 5, 5),
  std("fo", "Faroe Islands", "+298", 6, 6),
  std("fj", "Fiji", "+679", 7, 7),
  std("gf", "French Guiana", "+594", 9, 9),
  std("pf", "French Polynesia", "+689", 6, 8),
  std("ga", "Gabon", "+241", 7, 8),
  std("gm", "Gambia", "+220", 7, 7),
  std("ge", "Georgia", "+995", 9, 9),
  std("gh", "Ghana", "+233", 9, 9),
  std("gi", "Gibraltar", "+350", 8, 8),
  std("gr", "Greece", "+30", 10, 10),
  std("gl", "Greenland", "+299", 6, 6),
  std("gd", "Grenada", "+1", 10, 10),
  std("gp", "Guadeloupe", "+590", 9, 9),
  std("gu", "Guam", "+1", 10, 10),
  std("gt", "Guatemala", "+502", 8, 8),
  std("gg", "Guernsey", "+44", 10, 10),
  std("gn", "Guinea", "+224", 8, 9),
  std("gw", "Guinea-Bissau", "+245", 7, 7),
  std("gy", "Guyana", "+592", 7, 7),
  std("ht", "Haiti", "+509", 8, 8),
  std("hn", "Honduras", "+504", 8, 8),
  std("hk", "Hong Kong", "+852", 8, 8),
  std("hu", "Hungary", "+36", 8, 9),
  std("is", "Iceland", "+354", 7, 9),
  std("id", "Indonesia", "+62", 9, 12),
  std("ir", "Iran", "+98", 10, 10),
  std("iq", "Iraq", "+964", 10, 10),
  std("ie", "Ireland", "+353", 9, 9),
  std("im", "Isle of Man", "+44", 10, 10),
  std("il", "Israel", "+972", 9, 9),
  std("jm", "Jamaica", "+1", 10, 10),
  std("je", "Jersey", "+44", 10, 10),
  std("jo", "Jordan", "+962", 9, 9),
  std("kz", "Kazakhstan", "+7", 10, 10),
  std("ke", "Kenya", "+254", 9, 10),
  std("ki", "Kiribati", "+686", 8, 8),
  std("xk", "Kosovo", "+383", 8, 9),
  std("kw", "Kuwait", "+965", 8, 8),
  std("kg", "Kyrgyzstan", "+996", 9, 9),
  std("la", "Laos", "+856", 8, 10),
  std("lv", "Latvia", "+371", 8, 8),
  std("lb", "Lebanon", "+961", 7, 8),
  std("ls", "Lesotho", "+266", 8, 8),
  std("lr", "Liberia", "+231", 7, 9),
  std("ly", "Libya", "+218", 9, 10),
  std("li", "Liechtenstein", "+423", 7, 9),
  std("lt", "Lithuania", "+370", 8, 8),
  std("lu", "Luxembourg", "+352", 8, 11),
  std("mo", "Macau", "+853", 8, 8),
  std("mg", "Madagascar", "+261", 9, 9),
  std("mw", "Malawi", "+265", 9, 9),
  std("my", "Malaysia", "+60", 9, 10),
  std("mv", "Maldives", "+960", 7, 7),
  std("ml", "Mali", "+223", 8, 8),
  std("mt", "Malta", "+356", 8, 8),
  std("mh", "Marshall Islands", "+692", 7, 7),
  std("mq", "Martinique", "+596", 9, 9),
  std("mr", "Mauritania", "+222", 8, 8),
  std("mu", "Mauritius", "+230", 7, 8),
  std("mx", "Mexico", "+52", 10, 10),
  std("fm", "Micronesia", "+691", 7, 7),
  std("md", "Moldova", "+373", 8, 8),
  std("mc", "Monaco", "+377", 8, 9),
  std("mn", "Mongolia", "+976", 8, 8),
  std("me", "Montenegro", "+382", 8, 9),
  std("ms", "Montserrat", "+1", 10, 10),
  std("ma", "Morocco", "+212", 9, 9),
  std("mz", "Mozambique", "+258", 9, 9),
  std("mm", "Myanmar", "+95", 8, 10),
  std("na", "Namibia", "+264", 8, 10),
  std("nr", "Nauru", "+674", 7, 7),
  std("np", "Nepal", "+977", 10, 10),
  std("nc", "New Caledonia", "+687", 6, 6),
  std("nz", "New Zealand", "+64", 8, 10),
  std("ni", "Nicaragua", "+505", 8, 8),
  std("ne", "Niger", "+227", 8, 8),
  std("ng", "Nigeria", "+234", 10, 10),
  std("nu", "Niue", "+683", 4, 4),
  std("kp", "North Korea", "+850", 8, 13),
  std("mk", "North Macedonia", "+389", 8, 8),
  std("om", "Oman", "+968", 8, 8),
  std("pk", "Pakistan", "+92", 10, 10),
  std("pw", "Palau", "+680", 7, 7),
  std("ps", "Palestine", "+970", 9, 9),
  std("pa", "Panama", "+507", 7, 8),
  std("pg", "Papua New Guinea", "+675", 7, 8),
  std("py", "Paraguay", "+595", 9, 9),
  std("pe", "Peru", "+51", 8, 9),
  std("ph", "Philippines", "+63", 10, 10),
  std("pl", "Poland", "+48", 9, 9),
  std("pt", "Portugal", "+351", 9, 9),
  std("pr", "Puerto Rico", "+1", 10, 10),
  std("qa", "Qatar", "+974", 8, 8),
  std("re", "Réunion", "+262", 9, 9),
  std("ro", "Romania", "+40", 9, 9),
  std("ru", "Russia", "+7", 10, 10),
  std("rw", "Rwanda", "+250", 9, 9),
  std("kn", "Saint Kitts and Nevis", "+1", 10, 10),
  std("lc", "Saint Lucia", "+1", 10, 10),
  std("vc", "Saint Vincent and the Grenadines", "+1", 10, 10),
  std("ws", "Samoa", "+685", 5, 7),
  std("sm", "San Marino", "+378", 6, 10),
  std("st", "São Tomé and Príncipe", "+239", 7, 7),
  std("sa", "Saudi Arabia", "+966", 9, 9),
  std("sn", "Senegal", "+221", 9, 9),
  std("rs", "Serbia", "+381", 8, 10),
  std("sc", "Seychelles", "+248", 7, 7),
  std("sl", "Sierra Leone", "+232", 8, 8),
  std("sk", "Slovakia", "+421", 9, 9),
  std("si", "Slovenia", "+386", 8, 8),
  std("sb", "Solomon Islands", "+677", 5, 7),
  std("so", "Somalia", "+252", 7, 8),
  std("ss", "South Sudan", "+211", 9, 9),
  std("lk", "Sri Lanka", "+94", 9, 9),
  std("sd", "Sudan", "+249", 9, 9),
  std("sr", "Suriname", "+597", 6, 7),
  std("sy", "Syria", "+963", 9, 9),
  std("tw", "Taiwan", "+886", 9, 9),
  std("tj", "Tajikistan", "+992", 9, 9),
  std("tz", "Tanzania", "+255", 9, 9),
  std("th", "Thailand", "+66", 8, 9),
  std("tl", "Timor-Leste", "+670", 7, 8),
  std("tg", "Togo", "+228", 8, 8),
  std("to", "Tonga", "+676", 5, 7),
  std("tt", "Trinidad and Tobago", "+1", 10, 10),
  std("tn", "Tunisia", "+216", 8, 8),
  std("tr", "Turkey", "+90", 10, 10),
  std("tm", "Turkmenistan", "+993", 8, 8),
  std("tc", "Turks and Caicos", "+1", 10, 10),
  std("tv", "Tuvalu", "+688", 5, 6),
  std("ug", "Uganda", "+256", 9, 9),
  std("ua", "Ukraine", "+380", 9, 9),
  std("uy", "Uruguay", "+598", 8, 9),
  std("uz", "Uzbekistan", "+998", 9, 9),
  std("vu", "Vanuatu", "+678", 5, 7),
  std("va", "Vatican City", "+39", 10, 10),
  std("ve", "Venezuela", "+58", 10, 10),
  std("vn", "Vietnam", "+84", 9, 10),
  std("ye", "Yemen", "+967", 9, 9),
  std("zm", "Zambia", "+260", 9, 9),
  std("zw", "Zimbabwe", "+263", 9, 10),
];

/* The exported list — popular countries first (in their hand-curated
 * order so frequent-use markets stay one-tap away), then the rest
 * already alphabetical above. */
export const COUNTRIES: Country[] = [...POPULAR, ...REST];

/** Default country shown in the picker on first paint. India because
 *  the bulk of TGlobal traffic is IN-based. */
export const DEFAULT_COUNTRY_ISO2 = "in";

/** O(1) lookup; built once at module load. */
const BY_ISO = new Map(COUNTRIES.map((c) => [c.iso2, c]));

export function findCountry(iso2: string): Country {
  return BY_ISO.get(iso2) ?? COUNTRIES[0]!;
}

/** Strip everything except digits. Used both when reading user input
 *  and before re-formatting on country switch. */
export function digitsOnly(value: string): string {
  return value.replace(/\D+/g, "");
}

/** Apply a country's format mask to a digit string.
 *  • `#` slots consume one digit each.
 *  • Other characters in the mask are literal separators that only
 *    appear once at least one digit lands in the next slot — this
 *    avoids dangling "(" or "-" prefixes when the field is empty.
 *  • Digits beyond the mask's slot count are appended with a single
 *    space separator (rather than dropped) so users typing a longer
 *    valid number for a country with variable length still see their
 *    input.
 *
 * Returns the formatted display string. Caller should also trim
 * digits to `country.maxDigits` BEFORE calling, so the input never
 * accepts more than the country allows. */
export function formatPhone(country: Country, digits: string): string {
  if (!digits) return "";
  const trimmed = digits.slice(0, country.maxDigits);
  let out = "";
  let i = 0;
  for (const ch of country.format) {
    if (i >= trimmed.length) break;
    if (ch === "#") {
      out += trimmed[i]!;
      i++;
    } else {
      out += ch;
    }
  }
  // Spillover digits (rare — only when format mask has fewer # than
  // maxDigits, e.g. countries with variable national length).
  if (i < trimmed.length) {
    out += (out.endsWith(" ") ? "" : " ") + trimmed.slice(i);
  }
  return out;
}

/** True when `digits` falls within the country's accepted length range.
 *  Empty input returns false (let the "required" check own emptiness). */
export function isValidPhoneForCountry(country: Country, digits: string): boolean {
  const len = digits.length;
  return len >= country.minDigits && len <= country.maxDigits;
}

/** Flag CDN URL — flagcdn.com serves crisp SVG flags by ISO 3166
 *  alpha-2, free, no auth, Cloudflare-backed. The CSP in
 *  next.config.ts has `https://flagcdn.com` on `img-src` so these
 *  load in production. */
export function flagUrl(iso2: string): string {
  return `https://flagcdn.com/${iso2}.svg`;
}
