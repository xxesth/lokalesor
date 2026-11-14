export interface AnswerTemplate {
  id: string;
  /** çipte görünen kısa ad */
  label: string;
  /** metin alanına eklenen kalıp */
  text: string;
}

export const ANSWER_TEMPLATES: AnswerTemplate[] = [
  { id: "open_now", label: "Bu saatte açık", text: "Bu saatte açık, şuraya git: …" },
  { id: "district", label: "Şu semte bak", text: "Şu semte bak: … (neden: …)" },
  { id: "touristy", label: "Turistik mi?", text: "Turistik ama değer: … / Turistik, gitme: …" },
  { id: "budget", label: "Bütçe dostu", text: "Bütçe dostu alternatif: …" },
  { id: "not_sure", label: "Emin değilim", text: "Tam emin değilim, ama şuna bak: …" },
  { id: "answered_before", label: "Daha önce cevapladım", text: "Bu soruyu daha önce cevaplamıştım: …" },
];
