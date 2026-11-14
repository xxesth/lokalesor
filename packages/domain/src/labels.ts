import type { Budget, CityId, DistrictId, Topic } from "@lokale/contracts";

export const TOPIC_LABELS: Record<Topic, string> = {
  hidden_gem: "Gizli mekân",
  local_food: "Yerel yemek",
  budget: "Uygun fiyat",
  route: "Rota",
  nightlife: "Gece hayatı",
  safe_places: "Güvenli yerler",
};

export const BUDGET_LABELS: Record<Budget, string> = {
  low: "₺",
  mid: "₺₺",
  high: "₺₺₺",
};

export const CITIES: { id: CityId; name: string; districts: { id: DistrictId; name: string }[] }[] = [
  {
    id: "istanbul",
    name: "İstanbul",
    districts: [
      { id: "kadikoy", name: "Kadıköy" },
      { id: "moda", name: "Moda" },
      { id: "besiktas", name: "Beşiktaş" },
      { id: "beyoglu", name: "Beyoğlu" },
      { id: "uskudar", name: "Üsküdar" },
      { id: "sariyer", name: "Sarıyer" },
      { id: "fatih", name: "Fatih" },
    ],
  },
  {
    id: "ankara",
    name: "Ankara",
    districts: [
      { id: "cankaya", name: "Çankaya" },
      { id: "kizilay", name: "Kızılay" },
    ],
  },
  {
    id: "izmir",
    name: "İzmir",
    districts: [
      { id: "alsancak", name: "Alsancak" },
      { id: "karsiyaka", name: "Karşıyaka" },
    ],
  },
];

export function cityName(id: CityId): string {
  return CITIES.find((c) => c.id === id)?.name ?? id;
}

export function districtName(id: DistrictId | null | undefined): string | null {
  if (!id) return null;
  for (const c of CITIES) {
    const d = c.districts.find((x) => x.id === id);
    if (d) return d.name;
  }
  return id;
}

/** "İstanbul" → "İstanbul'dasın" için Türkçe bulunma eki (-da/-de/-ta/-te). */
export function locativeSuffix(word: string): string {
  const lower = word.toLocaleLowerCase("tr");
  const vowels = [...lower].filter((ch) => "aeıioöuü".includes(ch));
  const last = vowels[vowels.length - 1] ?? "a";
  const front = "eiöü".includes(last);
  const hard = "fstkçşhp".includes(lower[lower.length - 1] ?? "");
  return `'${hard ? "t" : "d"}${front ? "e" : "a"}`;
}
