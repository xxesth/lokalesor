import { describe, expect, it } from "vitest";
import { DEFAULT_CONFIG } from "./config";
import { filterEligible, pickNextLocal, rankCandidates } from "./matching";
import { cand, question, user } from "./fixtures.test-utils";

const mert = user({ id: "mert", homeDistrict: "kadikoy", interests: ["local_food", "nightlife"] });
const zeynep = user({ id: "zeynep", homeDistrict: "moda", interests: ["hidden_gem", "local_food"] });
const deniz = user({ id: "deniz", homeDistrict: "besiktas", interests: ["nightlife"] });
const ankaraLi = user({ id: "ali", homeCity: "ankara", homeDistrict: "cankaya", interests: ["local_food"] });
const elif = user({ id: "elif", homeCity: "ankara" });

describe("matching", () => {
  const all = [cand(zeynep, 25), cand(deniz, 10), cand(mert, 20), cand(ankaraLi, 5), cand(elif, 5)];

  it("demo senaryosu: önce Mert, sonra Zeynep", () => {
    const q = question();
    const ranked = rankCandidates(q, filterEligible(q, all, []), DEFAULT_CONFIG).map((c) => c.user.id);
    expect(ranked).toEqual(["mert", "zeynep", "deniz"]);
    expect(pickNextLocal(q, all, ["mert"], DEFAULT_CONFIG)?.user.id).toBe("zeynep");
  });

  it("başka şehirdekileri, soranı ve daha önce atananları eler", () => {
    const q = question({ touristId: "mert" });
    const ids = filterEligible(q, all, ["zeynep"]).map((c) => c.user.id);
    expect(ids).toEqual(["deniz"]);
  });

  it("kapasitesi dolan lokali eler", () => {
    const q = question();
    expect(pickNextLocal(q, [cand(mert, 20, 2), cand(zeynep, 25, 1)], [], DEFAULT_CONFIG)?.user.id).toBe("zeynep");
  });

  it("uygun lokal yoksa null", () => {
    expect(pickNextLocal(question(), [cand(mert, 20, 2)], [], DEFAULT_CONFIG)).toBeNull();
  });

  it("eşitlikte deterministik (id sırası)", () => {
    const a = user({ id: "a" });
    const b = user({ id: "b" });
    const q = question({ topic: "route", district: null });
    expect(rankCandidates(q, [cand(b, null), cand(a, null)], DEFAULT_CONFIG).map((c) => c.user.id)).toEqual(["a", "b"]);
  });
});
