import React from 'react';
import { numberToWords } from '../utils/numberToWords';

export default function InvoiceTemplate({ invoice, storeData, companySettings }) {
  if (!invoice) return null;

  const invoiceDate = new Date(invoice.createdAt).toLocaleDateString('en-GB');

  // Use backend calculated amounts if available, otherwise fallback
  const subtotal = invoice.subtotalAmount || invoice.items.reduce((acc, item) => acc + ((item.quantity || 1) * (item.sellingPrice || 0)), 0);
  const total = invoice.amount || subtotal;
  const taxAmount = total - subtotal;
  const gstMultiplier = subtotal > 0 ? (total / subtotal) : 1;

  const amountInWords = `INR ${numberToWords(Math.round(total))} Only`;
  const taxInWords = `INR ${numberToWords(Math.round(taxAmount))} Only`;

  return (
    <div className="w-full bg-white text-black p-4 text-xs font-sans" id="invoice-print-area">
      <h1 className="text-center text-xl font-bold mb-4 uppercase tracking-wider">Invoice</h1>

      <div className="border-2 border-black w-full flex flex-col">

        {/* Top Section */}
        <div className="flex w-full border-b-2 border-black">
          {/* Company Details */}
          <div className="w-[60%] p-2 border-r-2 border-black flex flex-col justify-between">
            <div>
              <h2 className="font-bold text-sm mb-1">{storeData?.storeName || 'AK Solutions Retail'}</h2>
              <p className="leading-tight">
                {storeData?.address || 'REGD. OFF-SHI 8/27A-K-3 GILAT BAZAR BYPASS\nSHIVPURKOT, VARANASI, UP-221002'}
              </p>
              <p className="mt-1">GSTIN/UIN: {storeData?.gst || 'N/A'}</p>
              <p>State Name: {storeData?.state || 'Uttar Pradesh'}</p>
              <p>Contact: {storeData?.phone || storeData?.contact || '+91-7607650206 , 9711888951'}</p>
              <p>E-Mail: {storeData?.email || 'finance@AK Solutions.com'}</p>
            </div>
          </div>

          {/* Invoice Meta */}
          <div className="w-[40%] flex flex-col">
            <div className="flex border-b-2 border-black">
              <div className="w-1/2 p-2 border-r-2 border-black">
                <p className="text-[10px] text-gray-600">Invoice No.</p>
                <p className="font-bold">{invoice.invoiceNumber}</p>
              </div>
              <div className="w-1/2 p-2">
                <p className="text-[10px] text-gray-600">Dated</p>
                <p className="font-bold">{invoiceDate}</p>
              </div>
            </div>
            <div className="flex border-b-2 border-black">
              <div className="w-1/2 p-2 border-r-2 border-black">
                <p className="text-[10px] text-gray-600">Order ID</p>
                <p className="font-bold truncate" title={invoice._id || invoice.id}>{invoice._id || invoice.id || 'N/A'}</p>
              </div>
              <div className="w-1/2 p-2">
                <p className="text-[10px] text-gray-600">Mode/Terms of Payment</p>
                <p className="font-bold">Paid</p>
              </div>
            </div>
            <div className="p-2 flex-1">
              <p>Country: <span className="font-bold">India</span></p>
            </div>
          </div>
        </div>

        {/* Buyer (Bill to) */}
        <div className="p-2 border-b-2 border-black">
          <p className="text-[10px] text-gray-600 mb-1">Buyer (Bill to)</p>
          <h3 className="font-bold">{invoice.customerName}</h3>
          <p>Contact: {invoice.customerPhone}</p>
        </div>

        {/* Items Table */}
        <div className="w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-black font-bold">
                <th className="p-2 border-r-2 border-black text-center w-8">Sl No.</th>
                <th className="p-2 border-r-2 border-black">Item / Category</th>
                <th className="p-2 border-r-2 border-black">Brand</th>
                <th className="p-2 border-r-2 border-black">Model</th>
                <th className="p-2 border-r-2 border-black">Specification</th>
                <th className="p-2 border-r-2 border-black text-center">Qty</th>
                <th className="p-2 border-r-2 border-black text-right">Rate</th>
                <th className="p-2 border-r-2 border-black text-right">GST Amount</th>
                <th className="p-2 text-right">Total Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, idx) => {
                const itemTotal = (item.quantity || 1) * (item.sellingPrice || 0);
                const baseRate = (item.sellingPrice || 0) / gstMultiplier;
                const itemBaseTotal = baseRate * (item.quantity || 1);
                const itemTax = itemTotal - itemBaseTotal;
                return (
                  <tr key={idx} className="border-b border-black last:border-b-2">
                    <td className="p-2 border-r-2 border-black text-center align-top">{idx + 1}</td>
                    <td className="p-2 border-r-2 border-black align-top">
                      <p className="font-bold">{item.name}</p>
                      {item.serialNumbers && item.serialNumbers.length > 0 && (
                        <p className="text-[10px] mt-1 text-gray-600">SN: {item.serialNumbers.join(', ')}</p>
                      )}
                    </td>
                    <td className="p-2 border-r-2 border-black align-top">{item.brand || '-'}</td>
                    <td className="p-2 border-r-2 border-black align-top">{item.model || '-'}</td>
                    <td className="p-2 border-r-2 border-black align-top">
                      {(() => {
                        if (!item.specs) return '-';
                        if (typeof item.specs !== 'string') {
                          try { return JSON.stringify(item.specs); } catch (e) { return '-'; }
                        }
                        try {
                          const parsed = JSON.parse(item.specs);
                          if (parsed.Specs) return parsed.Specs;
                          return Object.values(parsed).filter(Boolean).join(', ');
                        } catch (e) {
                          return item.specs;
                        }
                      })()}
                    </td>
                    <td className="p-2 border-r-2 border-black align-top text-center">{item.quantity}</td>
                    <td className="p-2 border-r-2 border-black align-top text-right">{baseRate.toFixed(2)}</td>
                    <td className="p-2 border-r-2 border-black align-top text-right">{itemTax.toFixed(2)}</td>
                    <td className="p-2 align-top text-right font-bold">{itemTotal.toFixed(2)}</td>
                  </tr>
                );
              })}
              {/* Total Row */}
              <tr className="border-b-2 border-black font-bold">
                <td colSpan="5" className="p-2 border-r-2 border-black text-right">Total</td>
                <td className="p-2 border-r-2 border-black text-center">
                  {invoice.items.reduce((acc, item) => acc + item.quantity, 0)}
                </td>
                <td className="p-2 border-r-2 border-black"></td>
                <td className="p-2 border-r-2 border-black text-right">Rs. {taxAmount.toFixed(2)}</td>
                <td className="p-2 text-right">Rs. {total.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Buyer Details & Tax Info */}
        <div className="border-b-2 border-black">
          <div className="p-2 border-b border-black">
            <h3 className="font-bold text-sm mb-2">Buyer Details</h3>
            <div className="flex flex-wrap">
              <div className="w-1/2 flex mb-1">
                <span className="w-24 text-gray-600">Buyer Name:</span>
                <span className="font-bold">{invoice.customerName}</span>
              </div>
              <div className="w-1/2 flex mb-1">
                <span className="w-24 text-gray-600">Phone:</span>
                <span className="font-bold">{invoice.customerPhone}</span>
              </div>
            </div>
          </div>

          <div className="p-2 border-b border-black flex justify-between items-center">
            <div>
              <p className="text-[10px] text-gray-600">Amount Chargeable (in words)</p>
              <p className="font-bold mt-1">{amountInWords}</p>
            </div>
            <div className="text-right italic font-bold">E. & O.E</div>
          </div>

          <div className="p-2 flex justify-between items-center bg-gray-50">
            <p>Tax Amount (in words) : <span className="font-bold">{taxInWords}</span></p>
            <p>Taxable Value: <span className="font-bold">Rs. {subtotal.toFixed(2)}</span></p>
          </div>
        </div>

        {/* Footer Section */}
        <div className="flex w-full min-h-[120px]">
          {/* Declaration */}
          <div className="w-1/2 p-2 border-r-2 border-black">
            <p className="text-[10px] text-gray-600 mb-1">Declaration</p>
            <p>We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.</p>
          </div>

          {/* Signatory */}
          <div className="w-1/2 flex flex-col">
            <div className="p-2 text-right flex flex-col justify-between min-h-[120px]">
              <p className="font-bold">for {storeData?.storeName || 'AK Solutions Retail'}</p>
              <div className="mt-8">
                <p className="text-[10px]">Verified by & Authorised Signatory</p>
                <p className="text-[10px]">Company Secretary</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      <div className="text-center mt-2 text-[10px] text-gray-500">
        This is a Computer Generated Invoice
      </div>
    </div>
  );
}
