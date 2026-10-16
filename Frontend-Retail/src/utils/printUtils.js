import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { numberToWords } from './numberToWords';

export const printInvoice = ({ invoice, companySettings, user, rfp, preview = false }) => {
  if (!invoice) return;

  const doc = new jsPDF();

  // Set fonts and styles
  doc.setFont('helvetica');

  // -----------------------------------------
  // Header Section: Company vs Invoice Meta
  // -----------------------------------------

  // Title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', 105, 15, { align: 'center' });

  doc.setLineWidth(0.5);
  doc.line(14, 20, 196, 20); // Top boundary line

  // Left Side: Company Details
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  const compName = companySettings?.companyName || 'AK Solutions Retail';
  doc.text(compName, 15, 26);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const addr = companySettings?.registeredAddress || 'REGD. OFF-SHI 8/27A-K-3 GILAT BAZAR BYPASS\nSHIVPURKOT, VARANASI, UP-221002';
  doc.text(addr, 15, 31);

  let currentY = 38;
  doc.text(`GSTIN/UIN: ${companySettings?.gstin || ''}`, 15, currentY); currentY += 4;
  doc.text(`State Name: ${companySettings?.stateName || ''}`, 15, currentY); currentY += 4;
  doc.text(`Contact: ${companySettings?.contactNumber || ''}`, 15, currentY); currentY += 4;
  doc.text(`E-Mail: ${companySettings?.email || ''}`, 15, currentY); currentY += 4;

  // Vertical line separating company info and invoice meta
  doc.line(110, 20, 110, 60);

  // Right Side: Invoice Meta Details
  doc.setFontSize(8);
  doc.text('Invoice No.', 112, 26);
  doc.setFont('helvetica', 'bold');
  doc.text(invoice.documentNo || invoice.invoiceNo || invoice.invoiceNumber || invoice.invoiceId || invoice.id || invoice._id || 'N/A', 112, 30);

  doc.line(155, 20, 155, 34); // vertical line for Dated
  doc.setFont('helvetica', 'normal');
  doc.text('Dated', 157, 26);
  doc.setFont('helvetica', 'bold');

  let formattedDate = 'N/A';
  if (invoice.date) {
    const d = new Date(invoice.date);
    formattedDate = isNaN(d.getTime()) ? invoice.date : d.toLocaleDateString('en-GB');
  } else if (invoice.createdAt) {
    formattedDate = new Date(invoice.createdAt).toLocaleDateString('en-GB');
  } else {
    formattedDate = new Date().toLocaleDateString('en-GB');
  }
  doc.text(formattedDate, 157, 30);

  doc.line(110, 34, 196, 34); // horizontal line

  doc.setFont('helvetica', 'normal');
  doc.text('Related Order', 112, 40);
  doc.setFont('helvetica', 'bold');
  const orderRef = invoice.requestId || invoice.orderId || invoice.orderRequestId || invoice.orderReference?.orderId || invoice.orderReference?.orderNumber || (typeof invoice.orderReference === 'string' ? invoice.orderReference : '');
  doc.text(orderRef || 'N/A', 112, 44);

  doc.line(155, 34, 155, 48); // vertical line for Payment mode
  doc.setFont('helvetica', 'normal');
  doc.text('Mode/Terms of Payment', 157, 40);
  doc.setFont('helvetica', 'bold');
  doc.text(invoice.paymentStatus || invoice.status || 'Pending', 157, 44);

  doc.line(110, 48, 196, 48); // horizontal line
  doc.setFont('helvetica', 'normal');
  doc.text('Country: ', 112, 54);
  doc.setFont('helvetica', 'bold');
  doc.text('India', 125, 54);

  doc.line(14, 60, 196, 60); // Bottom boundary of header section

  // -----------------------------------------
  // Buyer Section
  // -----------------------------------------
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Buyer (Bill to)', 15, 65);
  doc.setFont('helvetica', 'bold');
  const buyerName = user?.companyName || 'AK Solutions Retail Pvt Ltd';
  doc.text(buyerName, 15, 70);
  doc.setFont('helvetica', 'normal');
  const userAddr = user?.address || '123 Business Avenue, Tech Park, Bangalore 560001';
  // basic address wrapping
  const splitAddr = doc.splitTextToSize(userAddr, 90);
  doc.text(splitAddr, 15, 74);

  // -----------------------------------------
  // Product Table
  // -----------------------------------------

  const invoiceItems = invoice.items || rfp?.products || [];

  // Calculate an assumed rate per item if it's missing (for mock data or legacy invoices)
  const totalQtyAcrossAllItems = invoiceItems.reduce((acc, item) => acc + (item.quantity || 1), 0);
  const totalAmountFromInvoice = invoice.amount || 0;
  const globalGst = companySettings?.globalGstPercentage ?? 18;
  const gstMultiplier = 1 + (globalGst / 100);
  // Assume GST from global settings, so base amount is Total / gstMultiplier
  const assumedRate = totalQtyAcrossAllItems > 0 ? (totalAmountFromInvoice / gstMultiplier) / totalQtyAcrossAllItems : 0;

  const tableData = invoiceItems.map((item, index) => {
    const rate = item.rate || item.unitPrice || assumedRate;
    const qty = item.quantity || 0;
    const gstRate = item.taxRate || globalGst;
    const taxableValue = rate * qty;
    const gstAmount = taxableValue * (gstRate / 100);
    const totalAmount = taxableValue + gstAmount;

    const purchaseDate = item.purchaseDate || invoice.date || invoice.createdAt || Date.now();

    const configStr = (() => {
      if (typeof item.configuration === 'string' && item.configuration) return item.configuration;
      if (item.specs && typeof item.specs === 'object' && Object.keys(item.specs).length > 0) {
        return Object.entries(item.specs)
          .map(([k, v]) => `${k}: ${v}`)
          .join(', ');
      }
      if (item.configuration && typeof item.configuration === 'object') {
        return JSON.stringify(item.configuration);
      }
      return '-';
    })();

    return [
      index + 1,
      item.name || item.productName || item.category || '-',
      item.brand || '-',
      item.model || item.productName || '-',
      configStr,
      new Date(purchaseDate).toLocaleDateString('en-GB'),
      qty,
      `Rs. ${rate.toFixed(2)}`,
      `Rs. ${gstAmount.toFixed(2)}`,
      `Rs. ${totalAmount.toFixed(2)}`
    ];
  });

  let totalQty = 0;
  let totalGstAmt = 0;
  let finalAmt = 0;

  invoiceItems.forEach(item => {
    const rate = item.rate || item.unitPrice || assumedRate;
    const qty = item.quantity || 0;
    const gstRate = item.taxRate || globalGst;
    const taxableValue = rate * qty;
    const gstAmount = taxableValue * (gstRate / 100);
    const totalAmount = taxableValue + gstAmount;

    totalQty += qty;
    totalGstAmt += gstAmount;
    finalAmt += totalAmount;
  });

  if (invoice.amount && invoiceItems.length === 0) {
    // Only use invoice.amount directly if there are no items to sum from
    finalAmt = invoice.amount;
  }

  // Adding the Totals row to the table data
  tableData.push([
    '', '', '', '', '', 'Total',
    totalQty.toString(),
    '',
    `Rs. ${totalGstAmt.toFixed(2)}`,
    `Rs. ${finalAmt.toFixed(2)}`
  ]);

  autoTable(doc, {
    startY: 85,
    margin: { left: 14, right: 14 },
    head: [['Sl No.', 'Item / Category', 'Brand', 'Model', 'Configuration', 'Purchase Date', 'Qty', 'Base Price', 'GST Amount', 'Total Amount']],
    body: tableData,
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 2, textColor: [0, 0, 0], lineColor: [0, 0, 0], lineWidth: 0.2 },
    headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' }, // Sl No
      1: { cellWidth: 22 }, // Item
      2: { cellWidth: 15 }, // Brand
      3: { cellWidth: 15 }, // Model
      4: { cellWidth: 34 }, // Config
      5: { cellWidth: 16 }, // Date
      6: { cellWidth: 10, halign: 'center' }, // Qty
      7: { cellWidth: 20, halign: 'right' }, // Rate
      8: { cellWidth: 20, halign: 'right' }, // GST
      9: { cellWidth: 22, halign: 'right' }, // Total
    },
    didParseCell: function (data) {
      if (data.row.index === tableData.length - 1) {
        data.cell.styles.fontStyle = 'bold';
        if (data.column.index === 5) data.cell.styles.halign = 'right';
      }
    }
  });

  let finalY = doc.lastAutoTable.finalY;

  // -----------------------------------------
  // Product Details Section (with fallback to RFP products)
  // -----------------------------------------
  const baseProdList = (invoice.productDetails && invoice.productDetails.length > 0)
    ? invoice.productDetails
    : (invoice.items && invoice.items.length > 0)
      ? invoice.items
      : (rfp?.products || []);

  const prodList = baseProdList.map(p => {
    const perItemRate = p.rate || p.unitPrice || assumedRate;
    const gst = p.gstAmount || (perItemRate * (p.taxRate || globalGst) / 100);

    let serialStr = p.serialNumber || '-';
    if (p.assignedSerials && p.assignedSerials.length > 0) {
      serialStr = p.assignedSerials.join(', ');
    }

    const configStr = (() => {
      if (typeof p.configuration === 'string' && p.configuration) return p.configuration;
      if (p.specs && typeof p.specs === 'object' && Object.keys(p.specs).length > 0) {
        return Object.entries(p.specs).map(([k, v]) => `${k}: ${v}`).join(', ');
      }
      if (p.configuration && typeof p.configuration === 'object') {
        return JSON.stringify(p.configuration);
      }
      return '-';
    })();

    return {
      productName: p.name || p.productName || p.category || '-',
      brand: p.brand || '-',
      model: p.model || '-',
      configuration: configStr,
      serialNumber: serialStr,
      rate: perItemRate,
      gstAmount: gst,
      totalAmount: p.totalAmount || (perItemRate + gst)
    };
  });

  if (prodList.length > 0) {
    finalY += 4;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Product Details', 15, finalY + 4);

    const prodTableData = prodList.map(p => {
      const r = p.rate || p.unitPrice || 0;
      const qty = p.quantity || 1;
      const gstRate = p.taxRate || globalGst;
      const taxableValue = r * qty;
      const g = p.gstAmount || (taxableValue * (gstRate / 100));
      const t = p.totalAmount || (taxableValue + g);
      return [
        p.productName || p.category || '-',
        p.brand || '-',
        p.model || '-',
        p.configuration || '-',
        p.serialNumber || '-',
        `Rs. ${r.toFixed(2)}`,
        `Rs. ${g.toFixed(2)}`,
        `Rs. ${t.toFixed(2)}`
      ];
    });

    autoTable(doc, {
      startY: finalY + 7,
      margin: { left: 14, right: 14 },
      head: [['Product Name', 'Brand', 'Model', 'Configuration', 'Serial Number', 'Base Price', 'GST Amount', 'Total Amount']],
      body: prodTableData,
      theme: 'grid',
      styles: { fontSize: 7, cellPadding: 2, textColor: [0, 0, 0], lineColor: [0, 0, 0], lineWidth: 0.2 },
      headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' },
      columnStyles: {
        5: { halign: 'right' },
        6: { halign: 'right' },
        7: { halign: 'right' },
      }
    });

    finalY = doc.lastAutoTable.finalY;
  }

  // -----------------------------------------
  // Buyer Details Section (with fallback to user context)
  // -----------------------------------------
  const buyer = (invoice.buyerDetails && invoice.buyerDetails.buyerId)
    ? invoice.buyerDetails
    : {
      buyerId: user?.userId || invoice.userId || '-',
      productId: rfp?.rfpId || invoice.orderReference?.orderNumber || '-',
      buyerName: user?.companyName || 'AK Solutions Retail Pvt Ltd',
      paymentDetails: (user?.totalCredit > 0) ? 'Credit Limit' : 'Advance Payment'
    };

  finalY += 4;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Buyer Details', 15, finalY + 4);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Buyer ID: ${buyer.buyerId || '-'}`, 15, finalY + 10);
  doc.text(`Product ID: ${buyer.productId || '-'}`, 100, finalY + 10);
  doc.text(`Buyer Name: ${buyer.buyerName || '-'}`, 15, finalY + 15);
  doc.text('Payment Details:', 100, finalY + 15);
  doc.setFont('helvetica', 'bold');
  doc.text(buyer.paymentDetails || 'Advance Payment', 132, finalY + 15);

  finalY += 20;

  // -----------------------------------------
  // Summary & Amount in Words
  // -----------------------------------------

  doc.setLineWidth(0.2);
  // Amount Chargeable in words
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Amount Chargeable (in words)', 15, finalY + 5);
  doc.setFont('helvetica', 'bold');
  doc.text(`INR ${numberToWords(Math.round(finalAmt))} Only`, 15, finalY + 10);

  doc.setFont('helvetica', 'italic');
  doc.text('E. & O.E', 195, finalY + 10, { align: 'right' });

  finalY += 14;
  doc.line(14, finalY, 196, finalY);

  // Taxable Value
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const taxableValue = invoiceItems.reduce((acc, item) => acc + ((item.rate || item.unitPrice || assumedRate) * (item.quantity || 0)), 0);
  doc.text(`Tax Amount (in words) : INR ${numberToWords(Math.round(totalGstAmt))} Only`, 15, finalY + 5);

  doc.text('Taxable Value:', 150, finalY + 5);
  doc.setFont('helvetica', 'bold');
  doc.text(`Rs. ${taxableValue.toFixed(2)}`, 195, finalY + 5, { align: 'right' });

  finalY += 8;
  doc.line(14, finalY, 196, finalY);

  // -----------------------------------------
  // Footer: Bank & Declaration
  // -----------------------------------------

  const footerHeight = 45;
  doc.line(110, finalY, 110, finalY + footerHeight); // Vertical separator

  // Declaration (Left Side)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Declaration', 15, finalY + 5, { underline: true });
  const declarationText = companySettings?.declaration || 'We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.';
  const splitDec = doc.splitTextToSize(declarationText, 90);
  doc.text(splitDec, 15, finalY + 10);

  // Bank Details (Right Side Top)
  doc.text("Company's Bank Details", 112, finalY + 5, { underline: true });
  let bankY = finalY + 10;

  const drawBankDetail = (label, value) => {
    doc.setFont('helvetica', 'normal');
    doc.text(label, 112, bankY);
    doc.text(":", 145, bankY);
    doc.setFont('helvetica', 'bold');

    // Max width from x=147 to x=194 is 47
    const splitValue = doc.splitTextToSize(value, 47);
    doc.text(splitValue, 147, bankY);

    // increment bankY based on number of lines
    bankY += (splitValue.length * 3.5) + 0.5;
  };

  drawBankDetail("A/c Holder's Name", companySettings?.bankDetails?.accountHolderName || 'N/A');
  drawBankDetail("Bank Name", companySettings?.bankDetails?.bankName || 'N/A');
  drawBankDetail("A/c No.", companySettings?.bankDetails?.accountNo || 'N/A');
  drawBankDetail("Branch & IFS Code", companySettings?.bankDetails?.branchName ? `${companySettings.bankDetails.branchName}, ${companySettings.bankDetails.ifscCode || ''}` : (companySettings?.bankDetails?.ifscCode || 'N/A'));

  // Horizontal line separating Bank Details and Signatory (Right Side Only)
  doc.line(110, finalY + 28, 196, finalY + 28);

  // Signatory (Right Side Bottom)
  const signatoryText = companySettings?.authorizedSignatoryText || 'Verified by & Authorised Signatory\nCompany Secretary';
  doc.setFont('helvetica', 'bold');
  doc.text(`for ${compName}`, 195, finalY + 33, { align: 'right' });
  doc.setFont('helvetica', 'normal');

  // Split signatory text into multiple lines and right align
  const sigLines = signatoryText.split('\n');
  let sigY = finalY + 40;
  if (sigLines.length > 1) {
    sigY = finalY + 39;
    doc.text(sigLines[0], 195, sigY, { align: 'right' });
    doc.text(sigLines[1], 195, sigY + 4, { align: 'right' });
  } else {
    doc.text(signatoryText, 195, sigY, { align: 'right' });
  }

  // Border for the whole bottom block
  doc.line(14, finalY + footerHeight, 196, finalY + footerHeight); // bottom boundary
  doc.line(14, 20, 14, finalY + footerHeight); // global left boundary
  doc.line(196, 20, 196, finalY + footerHeight); // global right boundary

  doc.setFontSize(7);
  doc.text('This is a Computer Generated Invoice', 105, finalY + 50, { align: 'center' });

  if (preview) {
    window.open(doc.output('bloburl'), '_blank');
  } else {
    doc.save(`${invoice.invoiceNumber || invoice.invoiceId || 'Invoice'}.pdf`);
  }
};

export const printReport = (reportTitle, data) => {
  const doc = new jsPDF();

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(reportTitle, 14, 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 28);

  if (data && data.length > 0) {
    const headers = Object.keys(data[0]);
    const body = data.map(row => Object.values(row));

    autoTable(doc, {
      startY: 35,
      head: [headers],
      body: body,
      theme: 'striped'
    });
  } else {
    doc.text('No data available for this report.', 14, 40);
  }

  doc.save(`${reportTitle.replace(/\s+/g, '_')}.pdf`);
};
