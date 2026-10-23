// Small, dependency-free helpers for laying out simple tabular reports
// with pdfkit. Keeping this generic means every report controller can
// reuse the same header/table/footer look instead of re-implementing
// coordinate math three times.

const PAGE_MARGIN = 50;

function drawDocumentHeader(doc, { title, subtitle, generatedBy }) {
  doc
    .fillColor('#14232D')
    .fontSize(20)
    .text('LabTrack', PAGE_MARGIN, PAGE_MARGIN, { continued: false })
    .fontSize(10)
    .fillColor('#5B6B6A')
    .text('Laboratory Sample & Experiment Management System');

  doc.moveDown(1.2);
  doc.fillColor('#14232D').fontSize(15).text(title);
  if (subtitle) {
    doc.fontSize(10).fillColor('#5B6B6A').text(subtitle);
  }
  doc
    .fontSize(9)
    .fillColor('#8D99AE')
    .text(`Generated ${new Date().toLocaleString()}${generatedBy ? ` by ${generatedBy}` : ''}`);

  doc.moveDown(0.6);
  doc
    .strokeColor('#C9CFC9')
    .lineWidth(1)
    .moveTo(PAGE_MARGIN, doc.y)
    .lineTo(doc.page.width - PAGE_MARGIN, doc.y)
    .stroke();
  doc.moveDown(0.8);
}

/**
 * Draws a simple table. `columns` is an array of { header, width, key }.
 * Widths are in points and should sum to roughly the usable page width.
 */
function drawTable(doc, columns, rows) {
  const startX = PAGE_MARGIN;
  const usableWidth = doc.page.width - PAGE_MARGIN * 2;
  const rowHeight = 22;

  const ensureSpace = (needed) => {
    if (doc.y + needed > doc.page.height - PAGE_MARGIN) {
      doc.addPage();
      doc.y = PAGE_MARGIN;
    }
  };

  const drawHeaderRow = () => {
    ensureSpace(rowHeight + 4);
    let x = startX;
    doc.fontSize(9).fillColor('#F6F5F1');
    doc.rect(startX, doc.y, usableWidth, rowHeight).fill('#14232D');
    doc.fillColor('#F6F5F1');
    const headerY = doc.y + 6;
    columns.forEach((col) => {
      doc.text(col.header, x + 6, headerY, { width: col.width - 8, ellipsis: true });
      x += col.width;
    });
    doc.y += rowHeight;
  };

  drawHeaderRow();

  rows.forEach((row, idx) => {
    ensureSpace(rowHeight);
    let x = startX;
    const bg = idx % 2 === 0 ? '#FFFFFF' : '#F1F3F2';
    doc.rect(startX, doc.y, usableWidth, rowHeight).fill(bg);
    doc.fillColor('#14232D').fontSize(9);
    const rowY = doc.y + 6;
    columns.forEach((col) => {
      const value = row[col.key] === undefined || row[col.key] === null ? '-' : String(row[col.key]);
      doc.text(value, x + 6, rowY, { width: col.width - 8, ellipsis: true });
      x += col.width;
    });
    doc.y += rowHeight;
  });

  doc
    .strokeColor('#C9CFC9')
    .lineWidth(1)
    .moveTo(startX, doc.y)
    .lineTo(startX + usableWidth, doc.y)
    .stroke();
}

module.exports = { drawDocumentHeader, drawTable, PAGE_MARGIN };
