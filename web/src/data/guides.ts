import type { QuotaCategory } from "../types";

export interface ProductGuide {
  id: string;
  title: string;
  description: string;
  category: QuotaCategory;
  format: string;
}

export const PRODUCT_GUIDES: ProductGuide[] = [
  {
    id: "guide-imoveis",
    title: "Cartilha de imóveis",
    description:
      "Orientações oficiais para o uso do crédito no produto imobiliário.",
    category: "imobiliario",
    format: "PDF",
  },
  {
    id: "guide-construcao",
    title: "Cartilha de orientações para construção, reforma ou ampliação",
    description:
      "Material oficial com orientações para construção, reforma ou ampliação.",
    category: "imobiliario",
    format: "PDF",
  },
  {
    id: "guide-fgts",
    title: "Cartilha de uso do FGTS no Consórcio Imobiliário",
    description:
      "Orientações oficiais sobre a utilização do FGTS no consórcio imobiliário.",
    category: "imobiliario",
    format: "PDF",
  },
  {
    id: "guide-veiculos-leves",
    title: "Cartilha de veículos leves",
    description:
      "Orientações oficiais para o uso do crédito em veículos leves.",
    category: "veiculos_leves",
    format: "PDF",
  },
  {
    id: "guide-veiculos-pesados",
    title: "Cartilha de veículos pesados",
    description:
      "Orientações oficiais para o uso do crédito em veículos pesados.",
    category: "veiculos_pesados",
    format: "PDF",
  },
];

export function guidesForCategory(category: QuotaCategory | null) {
  if (!category) return [];
  return PRODUCT_GUIDES.filter((guide) => guide.category === category);
}

function toPdfText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[()\\]/g, " ")
    .replace(/[^\x20-\x7E]/g, "");
}

function wrapLines(text: string, maxChars: number) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }

  if (current) lines.push(current);
  return lines;
}

/** Gera um PDF mínimo válido para visualização/download no protótipo. */
export function createGuidePdfBlob(guide: ProductGuide): Blob {
  const titleLines = wrapLines(toPdfText(guide.title), 68);
  const descriptionLines = wrapLines(toPdfText(guide.description), 78);
  const footerLines = [
    "Este material e um placeholder do prototipo.",
    "Substitua pelo PDF oficial da cartilha quando disponivel.",
    "CAIXA Consorcio",
  ];

  const ops: string[] = [
    "BT",
    "/F1 18 Tf",
    "50 740 Td",
    "(CAIXA CONSORCIO) Tj",
  ];

  titleLines.forEach((line, index) => {
    ops.push(index === 0 ? "0 -32 Td" : "0 -18 Td", "/F1 14 Tf", `(${line}) Tj`);
  });

  descriptionLines.forEach((line, index) => {
    ops.push(index === 0 ? "0 -28 Td" : "0 -16 Td", "/F1 11 Tf", `(${line}) Tj`);
  });

  footerLines.forEach((line, index) => {
    ops.push(index === 0 ? "0 -36 Td" : "0 -16 Td", "/F1 11 Tf", `(${line}) Tj`);
  });

  ops.push("ET");

  const stream = ops.join("\n");
  const objects = [
    "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
    "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n",
    `4 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}\nendstream\nendobj\n`,
    "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n",
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  for (const object of objects) {
    offsets.push(pdf.length);
    pdf += object;
  }

  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (let i = 1; i <= objects.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\n`;
  pdf += `startxref\n${xrefStart}\n%%EOF`;

  return new Blob([pdf], { type: "application/pdf" });
}

export function createGuidePdfUrl(guide: ProductGuide) {
  return URL.createObjectURL(createGuidePdfBlob(guide));
}

export function downloadGuideContent(guide: ProductGuide) {
  const blob = createGuidePdfBlob(guide);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${guide.id}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
