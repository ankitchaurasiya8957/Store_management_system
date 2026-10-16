import React, { useState, useRef } from 'react';
import * as htmlToImage from 'html-to-image';
import { Printer, Share2, Download, MessageCircle, X, CheckCircle2, Loader2 } from 'lucide-react';

/**
 * InvoiceActions — Renders the invoice modal footer with Print, Download, and WhatsApp share.
 * 
 * Props:
 *  - invoice: The invoice data object
 *  - storeData: Store profile data (for store name in the WhatsApp message)
 *  - invoiceRef: A React ref pointing to the invoice DOM element to capture
 */
export default function InvoiceActions({ invoice, storeData, invoiceRef, companySettings }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  // ─── Print ──────────────────────────────────────────────────────────
  const handlePrint = () => {
    window.print();
  };

  // ─── Generate Invoice Image ─────────────────────────────────────────
  const generateInvoiceImage = async () => {
    const element = invoiceRef?.current || document.getElementById('invoice-print-area');
    if (!element) return null;

    try {
      // html-to-image uses native browser rendering via SVG foreignObject,
      // which fully supports modern CSS like oklch natively.
      const dataUrl = await htmlToImage.toPng(element, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        width: element.scrollWidth,
        height: element.scrollHeight,
        style: {
          transform: 'none',
          margin: '0'
        }
      });
      return dataUrl;
    } catch (error) {
      console.error('html-to-image error:', error);
      return null;
    }
  };

  // ─── Download as Image ──────────────────────────────────────────────
  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const dataUrl = await generateInvoiceImage();
      if (!dataUrl) return;

      const link = document.createElement('a');
      link.download = `${invoice.invoiceNumber || 'Invoice'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Failed to generate invoice image:', error);
      alert('Failed to generate invoice image. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // ─── Share on WhatsApp ──────────────────────────────────────────────
  const handleWhatsAppShare = async () => {
    setIsGenerating(true);
    try {
      const dataUrl = await generateInvoiceImage();
      if (!dataUrl) return;

      // Build a formatted text summary of the invoice
      const storeName = storeData?.storeName || 'AK Solutions Retail';
      const invoiceDate = new Date(invoice.createdAt).toLocaleDateString('en-GB');
      const total = invoice.amount || 0;
      const subtotal = invoice.subtotalAmount || 0;
      const taxAmount = total - subtotal;

      const itemLines = invoice.items.map((item, i) => {
        const lineTotal = item.quantity * item.sellingPrice;
        return `${i + 1}. ${item.name}${item.brand ? ` (${item.brand})` : ''} — Qty: ${item.quantity} × ₹${item.sellingPrice.toLocaleString()} = ₹${lineTotal.toLocaleString()}`;
      }).join('\n');

      const message = `📄 *INVOICE — ${invoice.invoiceNumber}*
━━━━━━━━━━━━━━━━━━
🏪 *${storeName}*
📅 Date: ${invoiceDate}

👤 *Customer:* ${invoice.customerName}
📞 Phone: ${invoice.customerPhone}

🛒 *Items:*
${itemLines}

━━━━━━━━━━━━━━━━━━
💰 Subtotal: ₹${subtotal.toLocaleString()}
🧾 GST (${companySettings?.globalGstPercentage ?? 18}%): ₹${taxAmount.toFixed(2)}
✅ *Grand Total: ₹${total.toFixed(2)}*
━━━━━━━━━━━━━━━━━━
Payment Status: ✅ Paid

_Thank you for your purchase!_`;

      // Try Web Share API first (works on mobile with file sharing)
      if (navigator.share && navigator.canShare) {
        try {
          const fetchRes = await fetch(dataUrl);
          const blob = await fetchRes.blob();
          const file = new File([blob], `${invoice.invoiceNumber}.png`, { type: 'image/png' });

          const shareData = {
            title: `Invoice ${invoice.invoiceNumber}`,
            text: message,
            files: [file]
          };

          if (navigator.canShare(shareData)) {
            try {
              await navigator.share(shareData);
              setIsGenerating(false);
              return;
            } catch (shareErr) {
              if (shareErr.name === 'AbortError') {
                setIsGenerating(false);
                return;
              }
            }
          }
        } catch (e) {
          console.error("Web share failed", e);
        }
      }

      // Desktop fallback: download image + open WhatsApp Web with text
      downloadAndOpenWhatsApp(dataUrl, message);

    } catch (error) {
      console.error('Failed to share invoice:', error);
      alert('Failed to generate invoice for sharing. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadAndOpenWhatsApp = (dataUrl, message) => {
    // Step 1: Auto-download the invoice image
    const link = document.createElement('a');
    link.download = `${invoice.invoiceNumber || 'Invoice'}.png`;
    link.href = dataUrl;
    link.click();

    // Step 2: Open WhatsApp with pre-filled customer phone + invoice text
    const phone = invoice.customerPhone?.replace(/[^0-9]/g, '') || '';
    const fullPhone = phone.startsWith('91') ? phone : `91${phone}`;
    const encodedMessage = encodeURIComponent(message);

    // Small delay so the download starts first
    setTimeout(() => {
      window.open(`https://wa.me/${fullPhone}?text=${encodedMessage}`, '_blank');
    }, 500);

    setIsGenerating(false);
  };

  return (
    <>
      {/* Download as Image */}
      <button
        onClick={handleDownload}
        disabled={isGenerating}
        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-100 transition-all shadow-sm disabled:opacity-50"
      >
        <Download size={18} />
        <span className="hidden sm:inline">Download</span>
      </button>

      {/* Share on WhatsApp */}
      <button
        onClick={handleWhatsAppShare}
        disabled={isGenerating}
        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#25D366] text-white font-medium rounded-xl hover:bg-[#1fb855] transition-all shadow-sm shadow-green-200 disabled:opacity-50"
      >
        {isGenerating ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <MessageCircle size={18} />
        )}
        <span>{isGenerating ? 'Generating...' : 'WhatsApp'}</span>
      </button>

      {/* Print Invoice */}
      <button
        onClick={handlePrint}
        disabled={isGenerating}
        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200 disabled:opacity-50"
      >
        <Printer size={18} />
        <span>Print Invoice</span>
      </button>
    </>
  );
}
