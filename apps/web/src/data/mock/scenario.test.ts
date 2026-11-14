// Brief 5. bölüm demo senaryosu, mock arka uç üzerinde uçtan uca.
import { beforeEach, describe, expect, it } from "vitest";

class MemStorage {
  private m = new Map<string, string>();
  getItem(k: string) { return this.m.get(k) ?? null; }
  setItem(k: string, v: string) { this.m.set(k, v); }
  removeItem(k: string) { this.m.delete(k); }
  clear() { this.m.clear(); }
}
const g = globalThis as unknown as { localStorage: MemStorage; sessionStorage: MemStorage };
g.localStorage = new MemStorage();
g.sessionStorage = new MemStorage();

const { mockAuth } = await import("./mock-auth");
const { mockRepository: repo, mockDemoControls: demo, runExpireDue } = await import("./mock-repository");

const as = (id: string) => mockAuth.signInAsDemoUser(id);

describe("demo senaryosu", () => {
  beforeEach(async () => {
    g.localStorage.clear();
    g.sessionStorage.clear();
    await demo.resetDemo();
  });

  it("sor → Mert → süre dolar → Zeynep → cevap → değerlendirme → profil güncellenir", async () => {
    // 1-2. Elif İstanbul'da turist, soru sorar
    const s = await as("elif");
    expect(s.currentCity).toBe("istanbul");
    const before = await repo.getLocalProfile("zeynep");

    const asked = await repo.askQuestion({
      city: "istanbul",
      district: "kadikoy",
      text: "Kadıköy'de öğrenci bütçesine uygun, turistik olmayan bir akşam yemeği yeri?",
      topic: "local_food",
      budget: "low",
    });
    // 3. Mert'e atanır + otomatik mesaj
    expect(asked.currentAssignment?.localId).toBe("mert");
    let thread = await repo.getQuestionThread(asked.question.id);
    expect(thread.items[0]).toMatchObject({ type: "system", message: { kind: "assigned" } });
    expect(thread.items[0]?.type === "system" && thread.items[0].message.text).toMatch(/^Sorun Mert'e iletildi\. Genelde ~\d+ dk içinde yanıt veriyor\.$/);

    // 4. Mert cevap vermez, T (1 dk) dolar → Zeynep'e yeniden atanır
    await demo.advanceTime(61_000);
    await runExpireDue();
    thread = await repo.getQuestionThread(asked.question.id);
    expect(thread.currentAssignment?.localId).toBe("zeynep");
    expect(thread.assignments.map((a) => [a.localId, a.status])).toEqual([["mert", "expired"], ["zeynep", "pending"]]);
    expect(thread.items.some((i) => i.type === "system" && i.message.kind === "reassigned")).toBe(true);
    const elifNotes = await repo.listNotifications();
    expect(elifNotes[0]?.kind).toBe("question_reassigned");

    // 5. Zeynep gelen kutusunda görür (kapasite 1/2), şablonla cevaplar, arşive ekler
    await as("zeynep");
    const inbox = await repo.getInbox();
    expect(inbox.pending).toHaveLength(1);
    expect(inbox.capacity).toEqual({ used: 1, limit: 2 });
    const zNotes = await repo.listNotifications();
    expect(zNotes[0]?.kind).toBe("new_question");
    await repo.submitAnswer({
      assignmentId: inbox.pending[0]!.assignment.id,
      text: "Şu semte bak: Kadıköy Çarşı'nın arka sokakları (neden: esnaf lokantaları ucuz, turist az).",
      templateId: "district",
      archive: true,
    });
    expect((await repo.getInbox()).answeredToday).toHaveLength(1);

    // 6. Elif cevabı görür ve değerlendirir
    await as("elif");
    thread = await repo.getQuestionThread(asked.question.id);
    expect(thread.question.status).toBe("answered");
    const answer = thread.items.find((i) => i.type === "answer");
    expect(answer?.type === "answer" && answer.local.id).toBe("zeynep");
    const rated = await repo.rateAnswer({ answerId: answer!.type === "answer" ? answer!.answer.id : "", useful: true, upToDate: true, trustworthy: null });
    expect(rated.localScore).not.toBeNull();
    await expect(repo.rateAnswer({ answerId: rated.rating.answerId, useful: true, upToDate: null, trustworthy: null })).rejects.toMatchObject({ code: "ALREADY_RATED" });

    // 7. Zeynep'in profil istatistikleri güncellenir
    const after = await repo.getLocalProfile("zeynep");
    expect(after.stats.answeredCount).toBe(before.stats.answeredCount + 1);
    expect(after.stats.ratedCount).toBe(before.stats.ratedCount + 1);

    // 8. Benzer soru sorulurken Zeynep'in arşivdeki cevabı önerilir
    const similar = await repo.findSimilarAnswers({ city: "istanbul", text: "Kadıköy'de öğrenci bütçesine uygun akşam yemeği" });
    expect(similar.map((x) => x.answer.id)).toContain(rated.rating.answerId);
  });

  it("3 denemeden sonra açık havuz; Bilmiyorum hemen yeniden atar", async () => {
    await as("elif");
    const q = await repo.askQuestion({ city: "istanbul", district: "kadikoy", text: "Kadıköy'de gece güvenli bir rota var mı acaba?", topic: "safe_places", budget: "mid" });
    const first = q.currentAssignment!.localId;
    await as(first);
    const inbox = await repo.getInbox();
    await repo.declineAssignment(inbox.pending[0]!.assignment.id);
    await as("elif");
    let t = await repo.getQuestionThread(q.question.id);
    expect(t.assignments[0]?.status).toBe("declined");
    expect(t.currentAssignment?.attempt).toBe(2);
    await demo.advanceTime(61_000);
    await demo.advanceTime(61_000);
    t = await repo.getQuestionThread(q.question.id);
    expect(t.question.status).toBe("open_pool");
    expect(t.assignments).toHaveLength(3);
    expect(t.items.at(-1)).toMatchObject({ type: "system", message: { kind: "open_pool" } });
  });

  it("güvenlik: başkasının atamasına cevap veremez, süre dolunca cevap reddedilir, giriş zorunlu", async () => {
    await as("elif");
    const q = await repo.askQuestion({ city: "istanbul", district: "kadikoy", text: "Kadıköy'de öğrenci bütçesine uygun bir yer?", topic: "local_food", budget: "low" });
    const aid = q.currentAssignment!.id;
    await as("zeynep");
    await expect(repo.submitAnswer({ assignmentId: aid, text: "Deneme cevabı", templateId: null, archive: false })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await as("mert");
    await demo.setReassignAfterMinutes(1);
    // zamanlayıcı çalışmadan önce süre dolmuşsa
    const { getStore } = await import("./store");
    await getStore().transact((s) => { s.offsetMs += 61_000; });
    await expect(repo.submitAnswer({ assignmentId: aid, text: "Geç kalan cevap", templateId: null, archive: false })).rejects.toMatchObject({ code: "ASSIGNMENT_EXPIRED" });
    await mockAuth.signOut();
    await expect(repo.getInbox()).rejects.toMatchObject({ code: "UNAUTHENTICATED" });
    await expect(as("elif").then(() => repo.askQuestion({ city: "istanbul", district: null, text: "kısa", topic: "route", budget: "low" }))).rejects.toMatchObject({ code: "VALIDATION" });
  });
});
