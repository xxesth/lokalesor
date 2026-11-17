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

  it("sor → Mert → süre dolar → Nevin → cevap → değerlendirme → profil güncellenir", async () => {
    // 1-2. Efe İstanbul'da turist, soru sorar
    const s = await as("efe");
    expect(s.currentCity).toBe("istanbul");
    const before = await repo.getLocalProfile("nevin");

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
    expect(thread.items[0]?.type === "system" && thread.items[0].message.text).toMatch(/^Sorun Mert Özçelik'e iletildi\. Genelde ~\d+ dk içinde yanıt veriyor\.$/);

    // 4. Mert cevap vermez, T (3 dk) dolar → Nevin'e yeniden atanır
    await demo.advanceTime(181_000);
    await runExpireDue();
    thread = await repo.getQuestionThread(asked.question.id);
    expect(thread.currentAssignment?.localId).toBe("nevin");
    expect(thread.assignments.map((a) => [a.localId, a.status])).toEqual([["mert", "expired"], ["nevin", "pending"]]);
    expect(thread.items.some((i) => i.type === "system" && i.message.kind === "reassigned")).toBe(true);
    const elifNotes = await repo.listNotifications();
    expect(elifNotes[0]?.kind).toBe("question_reassigned");

    // 5. Nevin gelen kutusunda görür (kapasite 1/2), şablonla cevaplar, arşive ekler
    await as("nevin");
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

    // 6. Efe cevabı görür ve değerlendirir
    await as("efe");
    thread = await repo.getQuestionThread(asked.question.id);
    expect(thread.question.status).toBe("answered");
    const answer = thread.items.find((i) => i.type === "answer");
    expect(answer?.type === "answer" && answer.local.id).toBe("nevin");
    const rated = await repo.rateAnswer({ answerId: answer!.type === "answer" ? answer!.answer.id : "", useful: true, upToDate: true, trustworthy: null });
    expect(rated.localScore).not.toBeNull();
    await expect(repo.rateAnswer({ answerId: rated.rating.answerId, useful: true, upToDate: null, trustworthy: null })).rejects.toMatchObject({ code: "ALREADY_RATED" });

    // 7. Nevin'in profil istatistikleri güncellenir
    const after = await repo.getLocalProfile("nevin");
    expect(after.stats.answeredCount).toBe(before.stats.answeredCount + 1);
    expect(after.stats.ratedCount).toBe(before.stats.ratedCount + 1);

    // 8. Benzer soru sorulurken Nevin'in arşivdeki cevabı önerilir
    const similar = await repo.findSimilarAnswers({ city: "istanbul", text: "Kadıköy'de öğrenci bütçesine uygun akşam yemeği" });
    expect(similar.map((x) => x.answer.id)).toContain(rated.rating.answerId);
  });

  it("3 denemeden sonra açık havuz; Bilmiyorum hemen yeniden atar", async () => {
    await as("efe");
    const q = await repo.askQuestion({ city: "istanbul", district: "kadikoy", text: "Kadıköy'de gece güvenli bir rota var mı acaba?", topic: "safe_places", budget: "mid" });
    const first = q.currentAssignment!.localId;
    await as(first);
    const inbox = await repo.getInbox();
    await repo.declineAssignment(inbox.pending[0]!.assignment.id);
    await as("efe");
    let t = await repo.getQuestionThread(q.question.id);
    expect(t.assignments[0]?.status).toBe("declined");
    expect(t.currentAssignment?.attempt).toBe(2);
    await demo.advanceTime(181_000);
    await demo.advanceTime(181_000);
    t = await repo.getQuestionThread(q.question.id);
    expect(t.question.status).toBe("open_pool");
    expect(t.assignments).toHaveLength(3);
    expect(t.items.at(-1)).toMatchObject({ type: "system", message: { kind: "open_pool" } });
  });

  it("güvenlik: başkasının atamasına cevap veremez, süre dolunca cevap reddedilir, giriş zorunlu", async () => {
    await as("efe");
    const q = await repo.askQuestion({ city: "istanbul", district: "kadikoy", text: "Kadıköy'de öğrenci bütçesine uygun bir yer?", topic: "local_food", budget: "low" });
    const aid = q.currentAssignment!.id;
    await as("nevin");
    await expect(repo.submitAnswer({ assignmentId: aid, text: "Deneme cevabı", templateId: null, archive: false })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await as("mert");
    await demo.setReassignAfterMinutes(1);
    // zamanlayıcı çalışmadan önce süre dolmuşsa
    const { getStore } = await import("./store");
    await getStore().transact((s) => { s.offsetMs += 181_000; });
    await expect(repo.submitAnswer({ assignmentId: aid, text: "Geç kalan cevap", templateId: null, archive: false })).rejects.toMatchObject({ code: "ASSIGNMENT_EXPIRED" });
    await mockAuth.signOut();
    await expect(repo.getInbox()).rejects.toMatchObject({ code: "UNAUTHENTICATED" });
    await expect(as("efe").then(() => repo.askQuestion({ city: "istanbul", district: null, text: "kısa", topic: "route", budget: "low" }))).rejects.toMatchObject({ code: "VALIDATION" });
  });
  it("açık havuz: şehrin lokali görür, ilk cevap kazanır, ikinci QUESTION_CLOSED alır", async () => {
    await as("mert");
    const pool = await repo.listOpenPool();
    expect(pool.map((p) => p.touristName)).toEqual(["Taylan Poyraz Kalfalar", "Ökkeş Donbaloğlu"]); // eskiden yeniye
    const qid = pool[0]!.question.id;
    const ans = await repo.answerFromPool({ questionId: qid, text: "Kabataş'tan Adalar vapuruna bin, dönüşte Üsküdar'a geç.", templateId: null, archive: true });
    expect(ans.localId).toBe("mert");
    // gönüllü cevap kapasiteyi harcamaz
    expect((await repo.getInbox()).capacity.used).toBe(0);

    await as("nevin");
    expect((await repo.listOpenPool()).map((p) => p.question.id)).not.toContain(qid);
    await expect(repo.answerFromPool({ questionId: qid, text: "Geç kalan cevap", templateId: null, archive: false })).rejects.toMatchObject({ code: "QUESTION_CLOSED" });

    await as("taylan");
    const t = await repo.getQuestionThread(qid);
    expect(t.question.status).toBe("answered");
    expect(t.items.at(-1)).toMatchObject({ type: "answer", local: { id: "mert" } });
    expect((await repo.listNotifications())[0]?.kind).toBe("answer_received");

    // başka şehrin lokali havuzu görmez, cevaplayamaz
    await as("gulcin");
    expect(await repo.listOpenPool()).toEqual([]);
    await expect(repo.answerFromPool({ questionId: pool[1]!.question.id, text: "Paris'ten cevap", templateId: null, archive: false })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("engelleme: iki yönlü; eşleştirme ve havuz engelli kişiyi atlar, kaldırınca geri gelir", async () => {
    await as("efe");
    await repo.blockUser("mert");
    await repo.blockUser("mert"); // idempotent
    expect((await repo.listBlocked()).map((b) => b.user.id)).toEqual(["mert"]);
    expect((await repo.listAvailableLocals("istanbul")).map((l) => l.id)).not.toContain("mert");
    const q = await repo.askQuestion({ city: "istanbul", district: "kadikoy", text: "Kadıköy'de öğrenci bütçesine uygun bir yer?", topic: "local_food", budget: "low" });
    expect(q.currentAssignment?.localId).toBe("nevin"); // Mert atlandı

    // ters yön: Ökkeş, Çağlar'ı engellerse Çağlar, Ökkeş'in havuzdaki sorusunu görmez
    await as("okkes");
    await repo.blockUser("caglar");
    await as("caglar");
    expect((await repo.listOpenPool()).map((p) => p.touristName)).not.toContain("Ökkeş Donbaloğlu");

    await as("efe");
    await repo.unblockUser("mert");
    expect(await repo.listBlocked()).toEqual([]);
    await expect(repo.blockUser("efe")).rejects.toMatchObject({ code: "VALIDATION" });
  });
});
