/**
 * Bangladesh Administrative Location Dataset
 * Canonical dataset for all 8 divisions, 64 districts, and upazilas/thanas
 * with English and Bengali (Bangla) names, IDs, and postal codes.
 */

export type DivisionItem = {
  id: string;
  name: string;
  nameBn: string;
};

export type DistrictItem = {
  id: string;
  divisionId: string;
  name: string;
  nameBn: string;
  defaultPostalCode?: string;
};

export type UpazilaItem = {
  id: string;
  districtId: string;
  divisionId: string;
  name: string;
  nameBn: string;
  postalCodes?: string[];
  unions?: Array<{ id: string; name: string; nameBn: string }>;
};

export const BANGLADESH_DIVISIONS: DivisionItem[] = [
  { id: "dhaka", name: "Dhaka", nameBn: "ঢাকা" },
  { id: "chattogram", name: "Chattogram", nameBn: "চট্টগ্রাম" },
  { id: "rajshahi", name: "Rajshahi", nameBn: "রাজশাহী" },
  { id: "khulna", name: "Khulna", nameBn: "খুলনা" },
  { id: "barishal", name: "Barishal", nameBn: "বরিশাল" },
  { id: "sylhet", name: "Sylhet", nameBn: "সিলেট" },
  { id: "rangpur", name: "Rangpur", nameBn: "রংপুর" },
  { id: "mymensingh", name: "Mymensingh", nameBn: "ময়মনসিংহ" },
];

export const BANGLADESH_DISTRICTS: DistrictItem[] = [
  // ── Dhaka Division (13 Districts) ──
  { id: "dhaka", divisionId: "dhaka", name: "Dhaka", nameBn: "ঢাকা", defaultPostalCode: "1000" },
  { id: "gazipur", divisionId: "dhaka", name: "Gazipur", nameBn: "গাজীপুর", defaultPostalCode: "1700" },
  { id: "narayanganj", divisionId: "dhaka", name: "Narayanganj", nameBn: "নারায়ণগঞ্জ", defaultPostalCode: "1400" },
  { id: "tangail", divisionId: "dhaka", name: "Tangail", nameBn: "টাঙ্গাইল", defaultPostalCode: "1900" },
  { id: "narsingdi", divisionId: "dhaka", name: "Narsingdi", nameBn: "নরসিংদী", defaultPostalCode: "1600" },
  { id: "munshiganj", divisionId: "dhaka", name: "Munshiganj", nameBn: "মুন্সীগঞ্জ", defaultPostalCode: "1500" },
  { id: "manikganj", divisionId: "dhaka", name: "Manikganj", nameBn: "মানিকগঞ্জ", defaultPostalCode: "1800" },
  { id: "faridpur", divisionId: "dhaka", name: "Faridpur", nameBn: "ফরিদপুর", defaultPostalCode: "7800" },
  { id: "gopalganj", divisionId: "dhaka", name: "Gopalganj", nameBn: "গোপালগঞ্জ", defaultPostalCode: "8100" },
  { id: "madaripur", divisionId: "dhaka", name: "Madaripur", nameBn: "মাদারীপুর", defaultPostalCode: "7900" },
  { id: "rajbari", divisionId: "dhaka", name: "Rajbari", nameBn: "রাজবাড়ী", defaultPostalCode: "7700" },
  { id: "shariatpur", divisionId: "dhaka", name: "Shariatpur", nameBn: "শরীয়তপুর", defaultPostalCode: "8000" },
  { id: "kishoreganj", divisionId: "dhaka", name: "Kishoreganj", nameBn: "কিশোরগঞ্জ", defaultPostalCode: "2300" },

  // ── Chattogram Division (11 Districts) ──
  { id: "chattogram", divisionId: "chattogram", name: "Chattogram", nameBn: "চট্টগ্রাম", defaultPostalCode: "4000" },
  { id: "coxs-bazar", divisionId: "chattogram", name: "Cox's Bazar", nameBn: "কক্সবাজার", defaultPostalCode: "4700" },
  { id: "cumilla", divisionId: "chattogram", name: "Cumilla", nameBn: "কুমিল্লা", defaultPostalCode: "3500" },
  { id: "feni", divisionId: "chattogram", name: "Feni", nameBn: "ফেনী", defaultPostalCode: "3900" },
  { id: "brahmanbaria", divisionId: "chattogram", name: "Brahmanbaria", nameBn: "ব্রাহ্মণবাড়িয়া", defaultPostalCode: "3400" },
  { id: "noakhali", divisionId: "chattogram", name: "Noakhali", nameBn: "নোয়াখালী", defaultPostalCode: "3800" },
  { id: "chandpur", divisionId: "chattogram", name: "Chandpur", nameBn: "চাঁদপুর", defaultPostalCode: "3600" },
  { id: "lakshmipur", divisionId: "chattogram", name: "Lakshmipur", nameBn: "লক্ষ্মীপুর", defaultPostalCode: "3700" },
  { id: "rangamati", divisionId: "chattogram", name: "Rangamati", nameBn: "রাঙ্গামাটি", defaultPostalCode: "4500" },
  { id: "bandarban", divisionId: "chattogram", name: "Bandarban", nameBn: "বান্দরবান", defaultPostalCode: "4600" },
  { id: "khagrachhari", divisionId: "chattogram", name: "Khagrachhari", nameBn: "খাগড়াছড়ি", defaultPostalCode: "4400" },

  // ── Rajshahi Division (8 Districts) ──
  { id: "rajshahi", divisionId: "rajshahi", name: "Rajshahi", nameBn: "রাজশাহী", defaultPostalCode: "6000" },
  { id: "bogura", divisionId: "rajshahi", name: "Bogura", nameBn: "বগুড়া", defaultPostalCode: "5800" },
  { id: "pabna", divisionId: "rajshahi", name: "Pabna", nameBn: "পাবনা", defaultPostalCode: "6600" },
  { id: "sirajganj", divisionId: "rajshahi", name: "Sirajganj", nameBn: "সিরাজগঞ্জ", defaultPostalCode: "6700" },
  { id: "naogaon", divisionId: "rajshahi", name: "Naogaon", nameBn: "নওগাঁ", defaultPostalCode: "6500" },
  { id: "natore", divisionId: "rajshahi", name: "Natore", nameBn: "নাটোর", defaultPostalCode: "6400" },
  { id: "chapainawabganj", divisionId: "rajshahi", name: "Chapainawabganj", nameBn: "চাঁপাইনবাবগঞ্জ", defaultPostalCode: "6300" },
  { id: "joypurhat", divisionId: "rajshahi", name: "Joypurhat", nameBn: "জয়পুরহাট", defaultPostalCode: "5900" },

  // ── Khulna Division (10 Districts) ──
  { id: "khulna", divisionId: "khulna", name: "Khulna", nameBn: "খুলনা", defaultPostalCode: "9000" },
  { id: "jashore", divisionId: "khulna", name: "Jashore", nameBn: "যশোর", defaultPostalCode: "7400" },
  { id: "kushtia", divisionId: "khulna", name: "Kushtia", nameBn: "কুষ্টিয়া", defaultPostalCode: "7000" },
  { id: "satkhira", divisionId: "khulna", name: "Satkhira", nameBn: "সাতক্ষীরা", defaultPostalCode: "9400" },
  { id: "bagerhat", divisionId: "khulna", name: "Bagerhat", nameBn: "বাগেরহাট", defaultPostalCode: "9300" },
  { id: "jhenaidah", divisionId: "khulna", name: "Jhenaidah", nameBn: "ঝিনাইদহ", defaultPostalCode: "7300" },
  { id: "chuadanga", divisionId: "khulna", name: "Chuadanga", nameBn: "চুয়াডাঙ্গা", defaultPostalCode: "7200" },
  { id: "meherpur", divisionId: "khulna", name: "Meherpur", nameBn: "মেহেরপুর", defaultPostalCode: "7100" },
  { id: "narail", divisionId: "khulna", name: "Narail", nameBn: "নড়াইল", defaultPostalCode: "7500" },
  { id: "magura", divisionId: "khulna", name: "Magura", nameBn: "মাগুরা", defaultPostalCode: "7600" },

  // ── Barishal Division (6 Districts) ──
  { id: "barishal", divisionId: "barishal", name: "Barishal", nameBn: "বরিশাল", defaultPostalCode: "8200" },
  { id: "bhola", divisionId: "barishal", name: "Bhola", nameBn: "ভোলা", defaultPostalCode: "8300" },
  { id: "patuakhali", divisionId: "barishal", name: "Patuakhali", nameBn: "পটুয়াখালী", defaultPostalCode: "8600" },
  { id: "pirojpur", divisionId: "barishal", name: "Pirojpur", nameBn: "পিরোজপুর", defaultPostalCode: "8500" },
  { id: "jhalokati", divisionId: "barishal", name: "Jhalokati", nameBn: "ঝালকাঠি", defaultPostalCode: "8400" },
  { id: "barguna", divisionId: "barishal", name: "Barguna", nameBn: "বরগুনা", defaultPostalCode: "8700" },

  // ── Sylhet Division (4 Districts) ──
  { id: "sylhet", divisionId: "sylhet", name: "Sylhet", nameBn: "সিলেট", defaultPostalCode: "3100" },
  { id: "moulvibazar", divisionId: "sylhet", name: "Moulvibazar", nameBn: "মৌলভীবাজার", defaultPostalCode: "3200" },
  { id: "habiganj", divisionId: "sylhet", name: "Habiganj", nameBn: "হবিগঞ্জ", defaultPostalCode: "3300" },
  { id: "sunamganj", divisionId: "sylhet", name: "Sunamganj", nameBn: "সুনামগঞ্জ", defaultPostalCode: "3000" },

  // ── Rangpur Division (8 Districts) ──
  { id: "rangpur", divisionId: "rangpur", name: "Rangpur", nameBn: "রংপুর", defaultPostalCode: "5400" },
  { id: "dinajpur", divisionId: "rangpur", name: "Dinajpur", nameBn: "দিনাজপুর", defaultPostalCode: "5200" },
  { id: "gaibandha", divisionId: "rangpur", name: "Gaibandha", nameBn: "গাইবান্ধা", defaultPostalCode: "5700" },
  { id: "kurigram", divisionId: "rangpur", name: "Kurigram", nameBn: "কুড়িগ্রাম", defaultPostalCode: "5600" },
  { id: "lalmonirhat", divisionId: "rangpur", name: "Lalmonirhat", nameBn: "লালমনিরহাট", defaultPostalCode: "5500" },
  { id: "nilphamari", divisionId: "rangpur", name: "Nilphamari", nameBn: "নীলফামারী", defaultPostalCode: "5300" },
  { id: "panchagarh", divisionId: "rangpur", name: "Panchagarh", nameBn: "পঞ্চগড়", defaultPostalCode: "5000" },
  { id: "thakurgaon", divisionId: "rangpur", name: "Thakurgaon", nameBn: "ঠাকুরগাঁও", defaultPostalCode: "5100" },

  // ── Mymensingh Division (4 Districts) ──
  { id: "mymensingh", divisionId: "mymensingh", name: "Mymensingh", nameBn: "ময়মনসিংহ", defaultPostalCode: "2200" },
  { id: "jamalpur", divisionId: "mymensingh", name: "Jamalpur", nameBn: "জামালপুর", defaultPostalCode: "2000" },
  { id: "netrokona", divisionId: "mymensingh", name: "Netrokona", nameBn: "নেত্রকোণা", defaultPostalCode: "2400" },
  { id: "sherpur", divisionId: "mymensingh", name: "Sherpur", nameBn: "শেরপুর", defaultPostalCode: "2100" },
];

export const BANGLADESH_UPAZILAS: UpazilaItem[] = [
  // ── Dhaka District Thanas & Upazilas ──
  { id: "dhanmondi", districtId: "dhaka", divisionId: "dhaka", name: "Dhanmondi", nameBn: "ধানমন্ডি", postalCodes: ["1209"] },
  { id: "gulshan", districtId: "dhaka", divisionId: "dhaka", name: "Gulshan", nameBn: "গুলশান", postalCodes: ["1212"] },
  { id: "banani", districtId: "dhaka", divisionId: "dhaka", name: "Banani", nameBn: "বনানী", postalCodes: ["1213"] },
  { id: "uttara", districtId: "dhaka", divisionId: "dhaka", name: "Uttara", nameBn: "উত্তরা", postalCodes: ["1230"] },
  { id: "mirpur", districtId: "dhaka", divisionId: "dhaka", name: "Mirpur", nameBn: "মিরপুর", postalCodes: ["1216"] },
  { id: "mohammadpur", districtId: "dhaka", divisionId: "dhaka", name: "Mohammadpur", nameBn: "মোহাম্মদপুর", postalCodes: ["1207"] },
  { id: "motijheel", districtId: "dhaka", divisionId: "dhaka", name: "Motijheel", nameBn: "মতিঝিল", postalCodes: ["1000"] },
  { id: "badda", districtId: "dhaka", divisionId: "dhaka", name: "Badda", nameBn: "বাড্ডা", postalCodes: ["1212"] },
  { id: "khilkhet", districtId: "dhaka", divisionId: "dhaka", name: "Khilkhet", nameBn: "খিলক্ষেত", postalCodes: ["1229"] },
  { id: "ramna", districtId: "dhaka", divisionId: "dhaka", name: "Ramna", nameBn: "রমনা", postalCodes: ["1217"] },
  { id: "shahbagh", districtId: "dhaka", divisionId: "dhaka", name: "Shahbagh", nameBn: "শাহবাগ", postalCodes: ["1000"] },
  { id: "paltan", districtId: "dhaka", divisionId: "dhaka", name: "Paltan", nameBn: "পল্টন", postalCodes: ["1000"] },
  { id: "tejgaon", districtId: "dhaka", divisionId: "dhaka", name: "Tejgaon", nameBn: "তেজগাঁও", postalCodes: ["1208"] },
  { id: "rampura", districtId: "dhaka", divisionId: "dhaka", name: "Rampura", nameBn: "রামপুরা", postalCodes: ["1219"] },
  { id: "jatrabari", districtId: "dhaka", divisionId: "dhaka", name: "Jatrabari", nameBn: "যাত্রাবাড়ী", postalCodes: ["1204"] },
  { id: "lalbagh", districtId: "dhaka", divisionId: "dhaka", name: "Lalbagh", nameBn: "লালবাগ", postalCodes: ["1211"] },
  { id: "chawkbazar", districtId: "dhaka", divisionId: "dhaka", name: "Chawkbazar", nameBn: "চকবাজার", postalCodes: ["1211"] },
  { id: "kotwali-dhaka", districtId: "dhaka", divisionId: "dhaka", name: "Kotwali", nameBn: "কোতোয়ালি", postalCodes: ["1100"] },
  { id: "sutrapur", districtId: "dhaka", divisionId: "dhaka", name: "Sutrapur", nameBn: "সূত্রাপুর", postalCodes: ["1100"] },
  { id: "wari", districtId: "dhaka", divisionId: "dhaka", name: "Wari", nameBn: "ওয়ারী", postalCodes: ["1203"] },
  { id: "adabor", districtId: "dhaka", divisionId: "dhaka", name: "Adabor", nameBn: "আদাবর", postalCodes: ["1207"] },
  { id: "hazaribagh", districtId: "dhaka", divisionId: "dhaka", name: "Hazaribagh", nameBn: "হাজারীবাগ", postalCodes: ["1209"] },
  { id: "pallabi", districtId: "dhaka", divisionId: "dhaka", name: "Pallabi", nameBn: "পল্লবী", postalCodes: ["1216"] },
  { id: "kafrul", districtId: "dhaka", divisionId: "dhaka", name: "Kafrul", nameBn: "কাফরুল", postalCodes: ["1216"] },
  { id: "cantonment", districtId: "dhaka", divisionId: "dhaka", name: "Cantonment", nameBn: "সেনানিবাস", postalCodes: ["1206"] },
  { id: "demra", districtId: "dhaka", divisionId: "dhaka", name: "Demra", nameBn: "ডেমরা", postalCodes: ["1360"] },
  { id: "savar", districtId: "dhaka", divisionId: "dhaka", name: "Savar", nameBn: "সাভার", postalCodes: ["1340"], unions: [
    { id: "aminbazar", name: "Aminbazar", nameBn: "আমিনবাজার" },
    { id: "ashulia", name: "Ashulia", nameBn: "আশুলিয়া" },
    { id: "birulia", name: "Birulia", nameBn: "বিরুলিয়া" },
    { id: "dhamsona", name: "Dhamsona", nameBn: "ধামসোনা" },
    { id: "tetuljhora", name: "Tetuljhora", nameBn: "তেঁতুলঝোড়া" },
    { id: "vakurta", name: "Vakurta", nameBn: "ভাকুর্তা" },
  ]},
  { id: "keraniganj", districtId: "dhaka", divisionId: "dhaka", name: "Keraniganj", nameBn: "কেরানীগঞ্জ", postalCodes: ["1310"] },
  { id: "dhamrai", districtId: "dhaka", divisionId: "dhaka", name: "Dhamrai", nameBn: "ধামরাই", postalCodes: ["1350"] },
  { id: "dohar", districtId: "dhaka", divisionId: "dhaka", name: "Dohar", nameBn: "দোহার", postalCodes: ["1330"] },
  { id: "nawabganj-dhaka", districtId: "dhaka", divisionId: "dhaka", name: "Nawabganj", nameBn: "নবাবগঞ্জ", postalCodes: ["1320"] },

  // ── Gazipur District ──
  { id: "gazipur-sadar", districtId: "gazipur", divisionId: "dhaka", name: "Gazipur Sadar", nameBn: "গাজীপুর সদর", postalCodes: ["1700"] },
  { id: "kaliakair", districtId: "gazipur", divisionId: "dhaka", name: "Kaliakair", nameBn: "কালিয়াকৈর", postalCodes: ["1750"] },
  { id: "kapasia", districtId: "gazipur", divisionId: "dhaka", name: "Kapasia", nameBn: "কাপাসিয়া", postalCodes: ["1730"] },
  { id: "sreepur-gazipur", districtId: "gazipur", divisionId: "dhaka", name: "Sreepur", nameBn: "শ্রীপুর", postalCodes: ["1740"] },
  { id: "kaliganj-gazipur", districtId: "gazipur", divisionId: "dhaka", name: "Kaliganj", nameBn: "কালীগঞ্জ", postalCodes: ["1720"] },
  { id: "tongi", districtId: "gazipur", divisionId: "dhaka", name: "Tongi", nameBn: "টঙ্গী", postalCodes: ["1710"] },

  // ── Narayanganj District ──
  { id: "narayanganj-sadar", districtId: "narayanganj", divisionId: "dhaka", name: "Narayanganj Sadar", nameBn: "নারায়ণগঞ্জ সদর", postalCodes: ["1400"] },
  { id: "bandar", districtId: "narayanganj", divisionId: "dhaka", name: "Bandar", nameBn: "বন্দর", postalCodes: ["1410"] },
  { id: "rupganj", districtId: "narayanganj", divisionId: "dhaka", name: "Rupganj", nameBn: "রূপগঞ্জ", postalCodes: ["1460"] },
  { id: "sonargaon", districtId: "narayanganj", divisionId: "dhaka", name: "Sonargaon", nameBn: "সোনারগাঁও", postalCodes: ["1440"] },
  { id: "araihazar", districtId: "narayanganj", divisionId: "dhaka", name: "Araihazar", nameBn: "আড়াইহাজার", postalCodes: ["1450"] },

  // ── Tangail District ──
  { id: "tangail-sadar", districtId: "tangail", divisionId: "dhaka", name: "Tangail Sadar", nameBn: "টাঙ্গাইল সদর", postalCodes: ["1900"] },
  { id: "mirzapur", districtId: "tangail", divisionId: "dhaka", name: "Mirzapur", nameBn: "মির্জাপুর", postalCodes: ["1940"] },
  { id: "sakhipur", districtId: "tangail", divisionId: "dhaka", name: "Sakhipur", nameBn: "সখিপুর", postalCodes: ["1950"] },
  { id: "delduar", districtId: "tangail", divisionId: "dhaka", name: "Delduar", nameBn: "দেলদুয়ার", postalCodes: ["1918"] },
  { id: "ghatail", districtId: "tangail", divisionId: "dhaka", name: "Ghatail", nameBn: "ঘাটাইল", postalCodes: ["1980"] },
  { id: "madhupur", districtId: "tangail", divisionId: "dhaka", name: "Madhupur", nameBn: "মধুপুর", postalCodes: ["1996"] },
  { id: "gopalpur-tangail", districtId: "tangail", divisionId: "dhaka", name: "Gopalpur", nameBn: "গোপালপুর", postalCodes: ["1990"] },
  { id: "kalihati", districtId: "tangail", divisionId: "dhaka", name: "Kalihati", nameBn: "কালিহাতী", postalCodes: ["1970"] },
  { id: "bhuapur", districtId: "tangail", divisionId: "dhaka", name: "Bhuapur", nameBn: "ভূঞাপুর", postalCodes: ["1960"] },
  { id: "basail", districtId: "tangail", divisionId: "dhaka", name: "Basail", nameBn: "বাসাইল", postalCodes: ["1920"] },
  { id: "nagarpur", districtId: "tangail", divisionId: "dhaka", name: "Nagarpur", nameBn: "নাগরপুর", postalCodes: ["1936"] },
  { id: "dhanbari", districtId: "tangail", divisionId: "dhaka", name: "Dhanbari", nameBn: "ধনবাড়ী", postalCodes: ["1997"] },

  // ── Chattogram District ──
  { id: "kotwali-ctg", districtId: "chattogram", divisionId: "chattogram", name: "Kotwali", nameBn: "কোতোয়ালি", postalCodes: ["4000"] },
  { id: "panchlaish", districtId: "chattogram", divisionId: "chattogram", name: "Panchlaish", nameBn: "পাঁচলাইশ", postalCodes: ["4203"] },
  { id: "agrabad", districtId: "chattogram", divisionId: "chattogram", name: "Agrabad", nameBn: "আগ্রাবাদ", postalCodes: ["4100"] },
  { id: "halishahar", districtId: "chattogram", divisionId: "chattogram", name: "Halishahar", nameBn: "হালিশহর", postalCodes: ["4216"] },
  { id: "pahartali", districtId: "chattogram", divisionId: "chattogram", name: "Pahartali", nameBn: "পাহাড়তলী", postalCodes: ["4202"] },
  { id: "bakalia", districtId: "chattogram", divisionId: "chattogram", name: "Bakalia", nameBn: "বাকলিয়া", postalCodes: ["4218"] },
  { id: "khulshi", districtId: "chattogram", divisionId: "chattogram", name: "Khulshi", nameBn: "খুলশী", postalCodes: ["4225"] },
  { id: "chandgaon", districtId: "chattogram", divisionId: "chattogram", name: "Chandgaon", nameBn: "চান্দগাঁও", postalCodes: ["4212"] },
  { id: "double-mooring", districtId: "chattogram", divisionId: "chattogram", name: "Double Mooring", nameBn: "ডবলমুরিং", postalCodes: ["4100"] },
  { id: "patenga", districtId: "chattogram", divisionId: "chattogram", name: "Patenga", nameBn: "পতেঙ্গা", postalCodes: ["4204"] },
  { id: "sitakunda", districtId: "chattogram", divisionId: "chattogram", name: "Sitakunda", nameBn: "সীতাকুণ্ড", postalCodes: ["4310"] },
  { id: "mirsharai", districtId: "chattogram", divisionId: "chattogram", name: "Mirsharai", nameBn: "মীরসরাই", postalCodes: ["4320"] },
  { id: "hathazari", districtId: "chattogram", divisionId: "chattogram", name: "Hathazari", nameBn: "হাটহাজারী", postalCodes: ["4330"] },
  { id: "raozan", districtId: "chattogram", divisionId: "chattogram", name: "Raozan", nameBn: "রাউজান", postalCodes: ["4340"] },
  { id: "rangunia", districtId: "chattogram", divisionId: "chattogram", name: "Rangunia", nameBn: "রাঙ্গুনিয়া", postalCodes: ["4360"] },
  { id: "boalkhali", districtId: "chattogram", divisionId: "chattogram", name: "Boalkhali", nameBn: "বোয়ালখালী", postalCodes: ["4366"] },
  { id: "patiya", districtId: "chattogram", divisionId: "chattogram", name: "Patiya", nameBn: "পটিয়া", postalCodes: ["4370"] },
  { id: "anwara", districtId: "chattogram", divisionId: "chattogram", name: "Anwara", nameBn: "আনোয়ারা", postalCodes: ["4376"] },
  { id: "chandanaish", districtId: "chattogram", divisionId: "chattogram", name: "Chandanaish", nameBn: "চন্দনাইশ", postalCodes: ["4380"] },
  { id: "satkania", districtId: "chattogram", divisionId: "chattogram", name: "Satkania", nameBn: "সাতকানিয়া", postalCodes: ["4386"] },
  { id: "lohaghar-ctg", districtId: "chattogram", divisionId: "chattogram", name: "Lohagara", nameBn: "লোহাগাড়া", postalCodes: ["4396"] },
  { id: "banskhali", districtId: "chattogram", divisionId: "chattogram", name: "Banshkhali", nameBn: "বাঁশখালী", postalCodes: ["4390"] },
  { id: "sandwip", districtId: "chattogram", divisionId: "chattogram", name: "Sandwip", nameBn: "সন্দ্বীপ", postalCodes: ["4300"] },

  // ── Cox's Bazar ──
  { id: "coxs-bazar-sadar", districtId: "coxs-bazar", divisionId: "chattogram", name: "Cox's Bazar Sadar", nameBn: "কক্সবাজার সদর", postalCodes: ["4700"] },
  { id: "chakaria", districtId: "coxs-bazar", divisionId: "chattogram", name: "Chakaria", nameBn: "চকোরিয়া", postalCodes: ["4740"] },
  { id: "teknaf", districtId: "coxs-bazar", divisionId: "chattogram", name: "Teknaf", nameBn: "টেকনাফ", postalCodes: ["4760"] },
  { id: "ukhiya", districtId: "coxs-bazar", divisionId: "chattogram", name: "Ukhiya", nameBn: "উখিয়া", postalCodes: ["4750"] },
  { id: "ramu", districtId: "coxs-bazar", divisionId: "chattogram", name: "Ramu", nameBn: "রামু", postalCodes: ["4730"] },
  { id: "maheshkhali", districtId: "coxs-bazar", divisionId: "chattogram", name: "Maheshkhali", nameBn: "মহেশখালী", postalCodes: ["4710"] },
  { id: "kutubdia", districtId: "coxs-bazar", divisionId: "chattogram", name: "Kutubdia", nameBn: "কুতুবদিয়া", postalCodes: ["4720"] },
  { id: "pekua", districtId: "coxs-bazar", divisionId: "chattogram", name: "Pekua", nameBn: "পেকুয়া", postalCodes: ["4742"] },

  // ── Cumilla ──
  { id: "cumilla-adarsha-sadar", districtId: "cumilla", divisionId: "chattogram", name: "Cumilla Adarsha Sadar", nameBn: "কুমিল্লা আদর্শ সদর", postalCodes: ["3500"] },
  { id: "cumilla-sadar-south", districtId: "cumilla", divisionId: "chattogram", name: "Cumilla Sadar South", nameBn: "কুমিল্লা সদর দক্ষিণ", postalCodes: ["3501"] },
  { id: "daudkandi", districtId: "cumilla", divisionId: "chattogram", name: "Daudkandi", nameBn: "দাউদকান্দি", postalCodes: ["3516"] },
  { id: "chandina", districtId: "cumilla", divisionId: "chattogram", name: "Chandina", nameBn: "চান্দিনা", postalCodes: ["3510"] },
  { id: "burichang", districtId: "cumilla", divisionId: "chattogram", name: "Burichang", nameBn: "বুড়িচং", postalCodes: ["3520"] },
  { id: "debidwar", districtId: "cumilla", divisionId: "chattogram", name: "Debidwar", nameBn: "দেবিদ্বার", postalCodes: ["3530"] },
  { id: "laksham", districtId: "cumilla", divisionId: "chattogram", name: "Laksham", nameBn: "লাকসাম", postalCodes: ["3570"] },
  { id: "barura", districtId: "cumilla", divisionId: "chattogram", name: "Barura", nameBn: "বরুড়া", postalCodes: ["3560"] },
  { id: "brahmanpara", districtId: "cumilla", divisionId: "chattogram", name: "Brahmanpara", nameBn: "ব্রাহ্মণপাড়া", postalCodes: ["3526"] },
  { id: "chauddagram", districtId: "cumilla", divisionId: "chattogram", name: "Chauddagram", nameBn: "চৌদ্দগ্রাম", postalCodes: ["3550"] },
  { id: "homna", districtId: "cumilla", divisionId: "chattogram", name: "Homna", nameBn: "হোমনা", postalCodes: ["3546"] },
  { id: "muradnagar", districtId: "cumilla", divisionId: "chattogram", name: "Muradnagar", nameBn: "মুরাদনগর", postalCodes: ["3540"] },

  // ── Rajshahi District ──
  { id: "boalia", districtId: "rajshahi", divisionId: "rajshahi", name: "Boalia", nameBn: "বোয়ালিয়া", postalCodes: ["6000"] },
  { id: "motihar", districtId: "rajshahi", divisionId: "rajshahi", name: "Motihar", nameBn: "মতিহার", postalCodes: ["6204"] },
  { id: "rajpara", districtId: "rajshahi", divisionId: "rajshahi", name: "Rajpara", nameBn: "রাজপাড়া", postalCodes: ["6000"] },
  { id: "shah-makhdum", districtId: "rajshahi", divisionId: "rajshahi", name: "Shah Makhdum", nameBn: "শাহ মখদুম", postalCodes: ["6203"] },
  { id: "paba", districtId: "rajshahi", divisionId: "rajshahi", name: "Paba", nameBn: "পবা", postalCodes: ["6210"] },
  { id: "durgapur-rajshahi", districtId: "rajshahi", divisionId: "rajshahi", name: "Durgapur", nameBn: "দুর্গাপুর", postalCodes: ["6240"] },
  { id: "godagari", districtId: "rajshahi", divisionId: "rajshahi", name: "Godagari", nameBn: "গোদাগাড়ী", postalCodes: ["6290"] },
  { id: "charghat", districtId: "rajshahi", divisionId: "rajshahi", name: "Charghat", nameBn: "চারঘাট", postalCodes: ["6270"] },
  { id: "bagha", districtId: "rajshahi", divisionId: "rajshahi", name: "Bagha", nameBn: "বাঘা", postalCodes: ["6280"] },
  { id: "bagmara", districtId: "rajshahi", divisionId: "rajshahi", name: "Bagmara", nameBn: "বাগমারা", postalCodes: ["6250"] },
  { id: "mohonpur", districtId: "rajshahi", divisionId: "rajshahi", name: "Mohonpur", nameBn: "মোহনপুর", postalCodes: ["6220"] },
  { id: "tanore", districtId: "rajshahi", divisionId: "rajshahi", name: "Tanore", nameBn: "তানোর", postalCodes: ["6230"] },

  // ── Bogura District ──
  { id: "bogura-sadar", districtId: "bogura", divisionId: "rajshahi", name: "Bogura Sadar", nameBn: "বগুড়া সদর", postalCodes: ["5800"] },
  { id: "shajahanpur", districtId: "bogura", divisionId: "rajshahi", name: "Shajahanpur", nameBn: "শাজাহানপুর", postalCodes: ["5801"] },
  { id: "sherpur-bogura", districtId: "bogura", divisionId: "rajshahi", name: "Sherpur", nameBn: "শেরপুর", postalCodes: ["5840"] },
  { id: "shibganj-bogura", districtId: "bogura", divisionId: "rajshahi", name: "Shibganj", nameBn: "শিবগঞ্জ", postalCodes: ["5810"] },
  { id: "gabtali", districtId: "bogura", divisionId: "rajshahi", name: "Gabtali", nameBn: "গাবতলী", postalCodes: ["5820"] },
  { id: "dhunat", districtId: "bogura", divisionId: "rajshahi", name: "Dhunat", nameBn: "ধুনট", postalCodes: ["5850"] },
  { id: "sariakandi", districtId: "bogura", divisionId: "rajshahi", name: "Sariakandi", nameBn: "সারিয়াকান্দি", postalCodes: ["5830"] },
  { id: "sonatala", districtId: "bogura", divisionId: "rajshahi", name: "Sonatala", nameBn: "সোনাতলা", postalCodes: ["5826"] },
  { id: "kahaloo", districtId: "bogura", divisionId: "rajshahi", name: "Kahaloo", nameBn: "কাহালু", postalCodes: ["5870"] },
  { id: "dupchanchia", districtId: "bogura", divisionId: "rajshahi", name: "Dupchanchia", nameBn: "দুপচাঁচিয়া", postalCodes: ["5880"] },
  { id: "adamdighi", districtId: "bogura", divisionId: "rajshahi", name: "Adamdighi", nameBn: "আদমদিঘি", postalCodes: ["5890"] },
  { id: "nandigram", districtId: "bogura", divisionId: "rajshahi", name: "Nandigram", nameBn: "নন্দীগ্রাম", postalCodes: ["5860"] },

  // ── Khulna District ──
  { id: "khulna-sadar", districtId: "khulna", divisionId: "khulna", name: "Khulna Sadar", nameBn: "খুলনা সদর", postalCodes: ["9000"] },
  { id: "sonadanga", districtId: "khulna", divisionId: "khulna", name: "Sonadanga", nameBn: "সোনাডাঙ্গা", postalCodes: ["9100"] },
  { id: "khalishpur", districtId: "khulna", divisionId: "khulna", name: "Khalishpur", nameBn: "খালিশপুর", postalCodes: ["9000"] },
  { id: "daulatpur-khulna", districtId: "khulna", divisionId: "khulna", name: "Daulatpur", nameBn: "দৌলতপুর", postalCodes: ["9202"] },
  { id: "khan-jahan-ali", districtId: "khulna", divisionId: "khulna", name: "Khan Jahan Ali", nameBn: "খান জাহান আলী", postalCodes: ["9203"] },
  { id: "dumuria", districtId: "khulna", divisionId: "khulna", name: "Dumuria", nameBn: "ডুমুরিয়া", postalCodes: ["9250"] },
  { id: "batiaghata", districtId: "khulna", divisionId: "khulna", name: "Batiaghata", nameBn: "বটিয়াঘাটা", postalCodes: ["9260"] },
  { id: "dacope", districtId: "khulna", divisionId: "khulna", name: "Dacope", nameBn: "দাকোপ", postalCodes: ["9270"] },
  { id: "paikgachha", districtId: "khulna", divisionId: "khulna", name: "Paikgachha", nameBn: "পাইকগাছা", postalCodes: ["9280"] },
  { id: "koyra", districtId: "khulna", divisionId: "khulna", name: "Koyra", nameBn: "কয়রা", postalCodes: ["9290"] },
  { id: "phultala", districtId: "khulna", divisionId: "khulna", name: "Phultala", nameBn: "ফুলতলা", postalCodes: ["9210"] },
  { id: "dighalia", districtId: "khulna", divisionId: "khulna", name: "Dighalia", nameBn: "দিঘলিয়া", postalCodes: ["9220"] },
  { id: "terokhada", districtId: "khulna", divisionId: "khulna", name: "Terokhada", nameBn: "তেরখাদা", postalCodes: ["9240"] },
  { id: "rupsha", districtId: "khulna", divisionId: "khulna", name: "Rupsha", nameBn: "রূপসা", postalCodes: ["9241"] },

  // ── Sylhet District ──
  { id: "sylhet-sadar", districtId: "sylhet", divisionId: "sylhet", name: "Sylhet Sadar", nameBn: "সিলেট সদর", postalCodes: ["3100"] },
  { id: "south-surma", districtId: "sylhet", divisionId: "sylhet", name: "South Surma", nameBn: "দক্ষিণ সুরমা", postalCodes: ["3101"] },
  { id: "beanibazar", districtId: "sylhet", divisionId: "sylhet", name: "Beanibazar", nameBn: "বিয়ানীবাজার", postalCodes: ["3170"] },
  { id: "golapganj", districtId: "sylhet", divisionId: "sylhet", name: "Golapganj", nameBn: "গোলাপগঞ্জ", postalCodes: ["3160"] },
  { id: "bishwanath", districtId: "sylhet", divisionId: "sylhet", name: "Bishwanath", nameBn: "বিশ্বনাথ", postalCodes: ["3130"] },
  { id: "osmani-nagar", districtId: "sylhet", divisionId: "sylhet", name: "Osmani Nagar", nameBn: "ওসমানী নগর", postalCodes: ["3120"] },
  { id: "balaganj", districtId: "sylhet", divisionId: "sylhet", name: "Balaganj", nameBn: "বালাগঞ্জ", postalCodes: ["3120"] },
  { id: "fenchuganj", districtId: "sylhet", divisionId: "sylhet", name: "Fenchuganj", nameBn: "ফেঞ্চুগঞ্জ", postalCodes: ["3116"] },
  { id: "zakiganj", districtId: "sylhet", divisionId: "sylhet", name: "Zakiganj", nameBn: "জকিগঞ্জ", postalCodes: ["3190"] },
  { id: "kanaighat", districtId: "sylhet", divisionId: "sylhet", name: "Kanaighat", nameBn: "কানাইঘাট", postalCodes: ["3180"] },
  { id: "gowainghat", districtId: "sylhet", divisionId: "sylhet", name: "Gowainghat", nameBn: "গোয়াইনঘাট", postalCodes: ["3150"] },
  { id: "jaintiapur", districtId: "sylhet", divisionId: "sylhet", name: "Jaintiapur", nameBn: "জৈন্তাপুর", postalCodes: ["3156"] },
  { id: "companiganj-sylhet", districtId: "sylhet", divisionId: "sylhet", name: "Companiganj", nameBn: "কোম্পানীগঞ্জ", postalCodes: ["3140"] },

  // ── Barishal District ──
  { id: "barishal-sadar", districtId: "barishal", divisionId: "barishal", name: "Barishal Sadar (Kotwali)", nameBn: "বরিশাল সদর", postalCodes: ["8200"] },
  { id: "bakerganj", districtId: "barishal", divisionId: "barishal", name: "Bakerganj", nameBn: "বাকেরগঞ্জ", postalCodes: ["8280"] },
  { id: "babuganj", districtId: "barishal", divisionId: "barishal", name: "Babuganj", nameBn: "বাবুগঞ্জ", postalCodes: ["8210"] },
  { id: "wazirpur", districtId: "barishal", divisionId: "barishal", name: "Wazirpur", nameBn: "উজিরপুর", postalCodes: ["8220"] },
  { id: "banaripara", districtId: "barishal", divisionId: "barishal", name: "Banaripara", nameBn: "বানারীপাড়া", postalCodes: ["8230"] },
  { id: "gournadi", districtId: "barishal", divisionId: "barishal", name: "Gournadi", nameBn: "গৌরনদী", postalCodes: ["8250"] },
  { id: "agailjhara", districtId: "barishal", divisionId: "barishal", name: "Agailjhara", nameBn: "আগৈলঝাড়া", postalCodes: ["8240"] },
  { id: "mehendiganj", districtId: "barishal", divisionId: "barishal", name: "Mehendiganj", nameBn: "মেহেন্দিগঞ্জ", postalCodes: ["8270"] },
  { id: "muladi", districtId: "barishal", divisionId: "barishal", name: "Muladi", nameBn: "মুলাদী", postalCodes: ["8260"] },
  { id: "hizla", districtId: "barishal", divisionId: "barishal", name: "Hizla", nameBn: "হিজলা", postalCodes: ["8271"] },

  // ── Rangpur District ──
  { id: "rangpur-sadar", districtId: "rangpur", divisionId: "rangpur", name: "Rangpur Sadar", nameBn: "রংপুর সদর", postalCodes: ["5400"] },
  { id: "gangachara", districtId: "rangpur", divisionId: "rangpur", name: "Gangachara", nameBn: "গঙ্গাচড়া", postalCodes: ["5410"] },
  { id: "taraganj", districtId: "rangpur", divisionId: "rangpur", name: "Taraganj", nameBn: "তারাগঞ্জ", postalCodes: ["5420"] },
  { id: "badarganj", districtId: "rangpur", divisionId: "rangpur", name: "Badarganj", nameBn: "বদরগঞ্জ", postalCodes: ["5430"] },
  { id: "mithapukur", districtId: "rangpur", divisionId: "rangpur", name: "Mithapukur", nameBn: "মিঠাপুকুর", postalCodes: ["5460"] },
  { id: "pirganj-rangpur", districtId: "rangpur", divisionId: "rangpur", name: "Pirganj", nameBn: "পীরগঞ্জ", postalCodes: ["5470"] },
  { id: "kaunia", districtId: "rangpur", divisionId: "rangpur", name: "Kaunia", nameBn: "কাউনিয়া", postalCodes: ["5440"] },
  { id: "pirgachha", districtId: "rangpur", divisionId: "rangpur", name: "Pirgachha", nameBn: "পীরগাছা", postalCodes: ["5450"] },

  // ── Mymensingh District ──
  { id: "mymensingh-sadar", districtId: "mymensingh", divisionId: "mymensingh", name: "Mymensingh Sadar", nameBn: "ময়মনসিংহ সদর", postalCodes: ["2200"] },
  { id: "muktagachha", districtId: "mymensingh", divisionId: "mymensingh", name: "Muktagachha", nameBn: "মুক্তাগাছা", postalCodes: ["2210"] },
  { id: "fulbaria", districtId: "mymensingh", divisionId: "mymensingh", name: "Fulbaria", nameBn: "ফুলবাড়িয়া", postalCodes: ["2216"] },
  { id: "trishal", districtId: "mymensingh", divisionId: "mymensingh", name: "Trishal", nameBn: "ত্রিশাল", postalCodes: ["2220"] },
  { id: "bhaluka", districtId: "mymensingh", divisionId: "mymensingh", name: "Bhaluka", nameBn: "ভালুকা", postalCodes: ["2240"] },
  { id: "gaffargaon", districtId: "mymensingh", divisionId: "mymensingh", name: "Gaffargaon", nameBn: "গফরগাঁও", postalCodes: ["2230"] },
  { id: "nandail", districtId: "mymensingh", divisionId: "mymensingh", name: "Nandail", nameBn: "নান্দাইল", postalCodes: ["2290"] },
  { id: "iswarganj", districtId: "mymensingh", divisionId: "mymensingh", name: "Iswarganj", nameBn: "ঈশ্বরগঞ্জ", postalCodes: ["2280"] },
  { id: "gouripur", districtId: "mymensingh", divisionId: "mymensingh", name: "Gouripur", nameBn: "গৌরীপুর", postalCodes: ["2270"] },
  { id: "phulpur", districtId: "mymensingh", divisionId: "mymensingh", name: "Phulpur", nameBn: "ফুলপুর", postalCodes: ["2250"] },
  { id: "tarakanda", districtId: "mymensingh", divisionId: "mymensingh", name: "Tarakanda", nameBn: "তারাকান্দা", postalCodes: ["2251"] },
  { id: "haluaghat", districtId: "mymensingh", divisionId: "mymensingh", name: "Haluaghat", nameBn: "হালুয়াঘাট", postalCodes: ["2260"] },
  { id: "dhobaura", districtId: "mymensingh", divisionId: "mymensingh", name: "Dhobaura", nameBn: "ধোবাউড়া", postalCodes: ["2265"] },
];

/** Index maps for O(1) lookups */
export const DIVISION_MAP = new Map<string, DivisionItem>(
  BANGLADESH_DIVISIONS.map((d) => [d.id.toLowerCase(), d])
);

export const DISTRICT_MAP = new Map<string, DistrictItem>(
  BANGLADESH_DISTRICTS.map((d) => [d.id.toLowerCase(), d])
);

export const UPAZILA_MAP = new Map<string, UpazilaItem>(
  BANGLADESH_UPAZILAS.map((u) => [u.id.toLowerCase(), u])
);
