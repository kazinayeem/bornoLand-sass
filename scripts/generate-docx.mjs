import {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  AlignmentType, TabStopType, TableOfContents, PageBreak,
  Header, Footer, PageNumber, NumberFormat
} from "docx";
import { writeFileSync, readFileSync } from "fs";

const md = readFileSync("docs/bornoland-master-system-report.md", "utf-8");

function parseMarkdown(md) {
  const lines = md.split("\n");
  const children = [];
  let inTable = false;
  let tableRows = [];
  let inCodeBlock = false;
  let codeLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code blocks
    if (line.startsWith("```")) {
      if (inCodeBlock) {
        children.push(new Paragraph({
          children: [new TextRun({ text: codeLines.join("\n"), font: "Courier New", size: 18 })],
          spacing: { after: 200 },
        }));
        codeLines = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }
    if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }

    // Table handling
    if (line.includes("|") && line.trim().startsWith("|")) {
      if (!inTable) {
        inTable = true;
        tableRows = [];
      }
      const cells = line.split("|").filter(c => c.trim()).map(c => c.trim());
      if (cells.every(c => c.match(/^[-:]+$/))) continue; // separator row
      tableRows.push(cells);
      continue;
    } else if (inTable) {
      // Flush table
      if (tableRows.length > 0) {
        const headerRow = tableRows[0];
        const numCols = headerRow.length;
        const colWidth = Math.floor(9000 / numCols);

        children.push(new Paragraph({
          children: headerRow.map(h => new TextRun({ text: h, bold: true, size: 20, font: "Arial" })),
          spacing: { before: 200, after: 100 },
        }));
        for (let r = 1; r < tableRows.length; r++) {
          children.push(new Paragraph({
            children: tableRows[r].map(c => new TextRun({ text: c, size: 18, font: "Arial" })),
            spacing: { after: 50 },
          }));
        }
      }
      inTable = false;
      tableRows = [];
      // Process current line normally
    }

    // Empty lines
    if (line.trim() === "") {
      continue;
    }

    // Headings
    if (line.startsWith("# ")) {
      children.push(new Paragraph({
        children: [new TextRun({ text: line.replace(/^#\s*/, ""), bold: true, size: 32, font: "Arial" })],
        heading: HeadingLevel.TITLE,
        spacing: { before: 400, after: 200 },
      }));
      continue;
    }
    if (line.startsWith("## ")) {
      children.push(new Paragraph({
        children: [new TextRun({ text: line.replace(/^##\s*/, ""), bold: true, size: 26, font: "Arial" })],
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 360, after: 160 },
      }));
      continue;
    }
    if (line.startsWith("### ")) {
      children.push(new Paragraph({
        children: [new TextRun({ text: line.replace(/^###\s*/, ""), bold: true, size: 22, font: "Arial" })],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 240, after: 120 },
      }));
      continue;
    }
    if (line.startsWith("#### ")) {
      children.push(new Paragraph({
        children: [new TextRun({ text: line.replace(/^####\s*/, ""), bold: true, size: 20, font: "Arial" })],
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 200, after: 100 },
      }));
      continue;
    }

    // Blockquotes
    if (line.startsWith("> ")) {
      children.push(new Paragraph({
        children: [new TextRun({ text: line.replace(/^>\s*/, ""), italics: true, size: 20, font: "Arial", color: "666666" })],
        indent: { left: 720 },
        spacing: { after: 100 },
      }));
      continue;
    }

    // Horizontal rules
    if (line.match(/^---+$/)) {
      children.push(new Paragraph({
        children: [new TextRun({ text: "─".repeat(80), color: "CCCCCC", size: 16 })],
        spacing: { before: 200, after: 200 },
      }));
      continue;
    }

    // List items
    if (line.match(/^[-*]\s/)) {
      const text = line.replace(/^[-*]\s/, "");
      children.push(new Paragraph({
        children: parseInlineFormatting("  • " + text),
        spacing: { after: 60 },
      }));
      continue;
    }

    // Numbered list
    if (line.match(/^\d+\.\s/)) {
      children.push(new Paragraph({
        children: parseInlineFormatting(line),
        spacing: { after: 60 },
      }));
      continue;
    }

    // Regular paragraphs
    children.push(new Paragraph({
      children: parseInlineFormatting(line),
      spacing: { after: 100 },
    }));
  }

  return children;
}

function parseInlineFormatting(text) {
  const runs = [];
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`|(\$\$.+?\$\$))/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      runs.push(new TextRun({ text: text.slice(lastIndex, match.index), size: 20, font: "Arial" }));
    }
    if (match[2]) {
      runs.push(new TextRun({ text: match[2], bold: true, size: 20, font: "Arial" }));
    } else if (match[3]) {
      runs.push(new TextRun({ text: match[3], italics: true, size: 20, font: "Arial" }));
    } else if (match[4]) {
      runs.push(new TextRun({ text: match[4], font: "Courier New", size: 18 }));
    } else if (match[5]) {
      runs.push(new TextRun({ text: match[5].replace(/\$\$/g, ""), italics: true, font: "Cambria Math", size: 20 }));
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    runs.push(new TextRun({ text: text.slice(lastIndex), size: 20, font: "Arial" }));
  }

  if (runs.length === 0) {
    runs.push(new TextRun({ text, size: 20, font: "Arial" }));
  }

  return runs;
}

const children = parseMarkdown(md);

const doc = new Document({
  creator: "BornoLand System Documentation",
  title: "BornoLand Master System Report",
  description: "Comprehensive system documentation generated from codebase audit",
  features: { updateFields: true },
  sections: [{
    properties: {
      page: {
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
      },
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          children: [new TextRun({ text: "BornoLand Master System Report", size: 18, color: "999999", font: "Arial" })],
          alignment: AlignmentType.RIGHT,
        })],
      }),
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          children: [
            new TextRun({ text: "Page ", size: 18, font: "Arial" }),
            new TextRun({ children: [PageNumber.CURRENT], size: 18, font: "Arial" }),
            new TextRun({ text: " of ", size: 18, font: "Arial" }),
            new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18, font: "Arial" }),
          ],
          alignment: AlignmentType.CENTER,
        })],
      }),
    },
    children,
  }],
});

const buffer = await Packer.toBuffer(doc);
writeFileSync("docs/bornoland-master-system-report.docx", buffer);
console.log("DOCX generated successfully:", buffer.length, "bytes");
