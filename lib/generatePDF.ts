import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface CompanyData {
  companyName: string;
  industry?: string;
  orgType?: string;
  hq?: string;
  revenue?: string;
  stature?: string;
  operationalFocus?: string;
  itSignal?: string;
  ticker?: string;
  stockPrice?: number;
  priceChange?: string;
  targets?: any[];
  secFilings?: any[];
  hiringData?: {
    engineering: number;
    sales: number;
    marketing: number;
    total: number;
  };
  events?: any[];
  leadership?: any[];
  news?: any[];
}

export function generateCompanyIntelligencePDF(data: CompanyData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;

  // Helper function to add page break if needed
  const checkPageBreak = (requiredSpace: number = 30) => {
    if (yPosition + requiredSpace > pageHeight - 20) {
      doc.addPage();
      yPosition = 20;
      return true;
    }
    return false;
  };

  // ========== HEADER ==========
  doc.setFillColor(0, 122, 255);
  doc.rect(0, 0, pageWidth, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('RECON', 14, 20);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Sales Intelligence Report', 14, 28);

  // Date
  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  doc.text(date, pageWidth - 14, 28, { align: 'right' });

  yPosition = 50;
  doc.setTextColor(0, 0, 0);

  // ========== COMPANY NAME ==========
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(data.companyName, 14, yPosition);
  yPosition += 10;

  // ========== COMPANY OVERVIEW ==========
  if (data.industry || data.orgType) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`${data.industry || ''} ${data.orgType ? '• ' + data.orgType : ''}`, 14, yPosition);
    yPosition += 8;
  }

  doc.setDrawColor(200, 200, 200);
  doc.line(14, yPosition, pageWidth - 14, yPosition);
  yPosition += 10;

  // ========== KEY METRICS SECTION ==========
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('KEY METRICS', 14, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  const metrics = [
    { label: 'Headquarters', value: data.hq },
    { label: 'Revenue', value: data.revenue },
    { label: 'Organization Type', value: data.orgType },
    { label: 'Market Stature', value: data.stature },
    { label: 'Stock Ticker', value: data.ticker },
  ].filter(m => m.value);

  metrics.forEach(metric => {
    checkPageBreak();
    doc.setTextColor(100, 100, 100);
    doc.text(metric.label + ':', 14, yPosition);
    doc.setTextColor(0, 0, 0);
    doc.text(metric.value || '', 80, yPosition);
    yPosition += 6;
  });

  yPosition += 8;

  // ========== OPERATIONAL FOCUS ==========
  if (data.operationalFocus) {
    checkPageBreak(30);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('OPERATIONAL FOCUS', 14, yPosition);
    yPosition += 8;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(data.operationalFocus, pageWidth - 28);
    lines.forEach((line: string) => {
      checkPageBreak();
      doc.text(line, 14, yPosition);
      yPosition += 5;
    });
    yPosition += 8;
  }

  // ========== IT SIGNAL ==========
  if (data.itSignal) {
    checkPageBreak(30);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('IT SIGNAL / NEWS', 14, yPosition);
    yPosition += 8;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(data.itSignal, pageWidth - 28);
    lines.forEach((line: string) => {
      checkPageBreak();
      doc.text(line, 14, yPosition);
      yPosition += 5;
    });
    yPosition += 8;
  }

  // ========== STOCK PERFORMANCE ==========
  if (data.ticker && data.stockPrice) {
    checkPageBreak(20);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('STOCK PERFORMANCE', 14, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Ticker: ${data.ticker}`, 14, yPosition);
    yPosition += 6;
    doc.text(`Current Price: $${data.stockPrice.toFixed(2)}`, 14, yPosition);
    yPosition += 6;
    if (data.priceChange) {
      doc.text(`1-Year Change: ${data.priceChange}`, 14, yPosition);
      yPosition += 6;
    }
    yPosition += 8;
  }

  // ========== HIRING INTELLIGENCE ==========
  if (data.hiringData && data.hiringData.total > 0) {
    checkPageBreak(40);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('HIRING INTELLIGENCE', 14, yPosition);
    yPosition += 8;

    const hiringTableData = [
      ['Engineering', data.hiringData.engineering.toString()],
      ['Sales', data.hiringData.sales.toString()],
      ['Marketing', data.hiringData.marketing.toString()],
      ['Total Open Positions', data.hiringData.total.toString()],
    ];

    autoTable(doc, {
      startY: yPosition,
      head: [['Department', 'Open Positions']],
      body: hiringTableData,
      theme: 'grid',
      headStyles: { fillColor: [0, 122, 255], textColor: 255 },
      margin: { left: 14, right: 14 },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;
  }

  // ========== KEY CONTACTS ==========
  if (data.targets && data.targets.length > 0) {
    checkPageBreak(50);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('KEY CONTACTS', 14, yPosition);
    yPosition += 8;

    const contactsData = data.targets.slice(0, 10).map(target => [
      target.name || '',
      target.title || '',
      target.location || '',
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Name', 'Title', 'Location']],
      body: contactsData,
      theme: 'grid',
      headStyles: { fillColor: [0, 122, 255], textColor: 255 },
      margin: { left: 14, right: 14 },
      styles: { fontSize: 8 },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;
  }

  // ========== RECENT EVENTS ==========
  if (data.events && data.events.length > 0) {
    checkPageBreak(50);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('NETWORKING & EVENTS', 14, yPosition);
    yPosition += 8;

    const eventsData = data.events.slice(0, 10).map(event => [
      event.name || '',
      event.type || '',
      event.date || '',
      event.location || '',
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Event', 'Type', 'Date', 'Location']],
      body: eventsData,
      theme: 'grid',
      headStyles: { fillColor: [0, 122, 255], textColor: 255 },
      margin: { left: 14, right: 14 },
      styles: { fontSize: 8 },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;
  }

  // ========== SEC FILINGS ==========
  if (data.secFilings && data.secFilings.length > 0) {
    checkPageBreak(50);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('RECENT SEC FILINGS', 14, yPosition);
    yPosition += 8;

    const filingsData = data.secFilings.slice(0, 5).map(filing => [
      filing.form_type || '',
      filing.filing_date || '',
      filing.description || '',
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Form Type', 'Filing Date', 'Description']],
      body: filingsData,
      theme: 'grid',
      headStyles: { fillColor: [0, 122, 255], textColor: 255 },
      margin: { left: 14, right: 14 },
      styles: { fontSize: 8 },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;
  }

  // ========== STRATEGIC NEWS ==========
  if (data.news && data.news.length > 0) {
    checkPageBreak(50);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('STRATEGIC NEWS', 14, yPosition);
    yPosition += 8;

    const newsData = data.news.slice(0, 10).map(item => [
      item.title || '',
      item.date || '',
      item.category || '',
      item.impact || '',
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Title', 'Date', 'Category', 'Impact']],
      body: newsData,
      theme: 'grid',
      headStyles: { fillColor: [0, 122, 255], textColor: 255 },
      margin: { left: 14, right: 14 },
      styles: { fontSize: 7 },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 30 },
        2: { cellWidth: 30 },
        3: { cellWidth: 25 },
      },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;
  }

  // ========== FOOTER ON LAST PAGE ==========
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
    doc.text(
      'Generated by RECON Sales Intelligence Platform',
      pageWidth - 14,
      pageHeight - 10,
      { align: 'right' }
    );
  }

  // ========== SAVE PDF ==========
  const fileName = `${data.companyName.replace(/[^a-z0-9]/gi, '_')}_Intelligence_Report_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}
