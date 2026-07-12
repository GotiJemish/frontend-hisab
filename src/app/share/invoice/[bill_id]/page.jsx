"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { Printer, AlertCircle } from "lucide-react";

export default function PublicInvoicePage() {
  const params = useParams();
  const bill_id = params?.bill_id || "";
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!bill_id) return;
    const fetchPublicInvoice = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/invoices/public/${bill_id}/`);
        if (res.data.success) {
          setData(res.data.data);
        } else {
          setError(res.data.message || "Failed to load invoice.");
        }
      } catch (err) {
        setError(err.response?.data?.message || "Invoice document not found or sharing has been disabled.");
      } finally {
        setLoading(false);
      }
    };
    fetchPublicInvoice();
  }, [bill_id]);

  const formatCurrency = (val) => {
    const num = parseFloat(val) || 0;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(num);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-[#0B1220]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-sm text-gray-500">Loading document details...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-[#0B1220] p-4 text-center">
        <div className="p-4 bg-rose-50 dark:bg-rose-950/20 rounded-full text-rose-500 mb-4">
          <AlertCircle className="h-10 w-10" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Access Error</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-6">
          {error || "Could not retrieve the requested invoice details."}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-750 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const { invoice, contact, company } = data;
  const activeGstType = invoice?.internal_note?.startsWith("[GST_TYPE:inter]") ? "inter" : "intra";

  return (
    <div className="bg-slate-50 dark:bg-[#0B1220] min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <style dangerouslySetInnerHTML={{__html: `
          @media print {
            .print-hide {
              display: none !important;
            }
            body {
              background-color: white !important;
            }
          }
        `}} />
        
        {/* Isolated Action Toolbar */}
        <div className="flex justify-between items-center mb-6 print-hide bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">HISAAB Shared Link</span>
          </div>
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-500/10 transition-transform active:scale-95 cursor-pointer"
          >
            <Printer className="h-4 w-4" />
            Print / Save PDF
          </button>
        </div>

        {/* Printable invoice container */}
        <div id="printable-invoice" className="bg-white text-slate-800 p-8 rounded-2xl border border-slate-250 dark:border-slate-850 dark:bg-slate-900 dark:text-slate-100 shadow-xl space-y-6">
          {/* TOP HEADER */}
          <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-6">
            <div>
              <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3.5 py-1.5 rounded-full text-xs font-black tracking-wider uppercase">
                Tax Invoice
              </span>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-4">{company?.name || "Vendor Company"}</h2>
              {company?.gstin && <p className="text-xs text-slate-500 mt-1 font-semibold">GSTIN: {company.gstin}</p>}
              {company?.pan && <p className="text-xs text-slate-500 mt-0.5 font-semibold">PAN: {company.pan}</p>}
              {company?.address && <p className="text-xs text-slate-400 mt-1 max-w-xs">{company.address}</p>}
            </div>
            <div className="text-right space-y-1 text-sm font-medium">
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Invoice Details</p>
              <p className="text-slate-900 dark:text-slate-100 font-extrabold">Bill ID: {invoice?.bill_id}</p>
              <p className="text-slate-600 dark:text-slate-400">Invoice #: {invoice?.invoice_number || "N/A"}</p>
              <p className="text-slate-600 dark:text-slate-400">Date: {invoice?.invoice_date}</p>
            </div>
          </div>

          {/* TWO COLUMN INFO */}
          <div id="printable-invoice-info-grid" className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/60">
            <div>
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Billed To</h3>
              <p className="font-extrabold text-lg text-slate-900 dark:text-slate-100">{contact?.name || "Client Contact"}</p>
              {contact && (
                <div className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 space-y-0.5 font-medium">
                  {contact.mobile && <p>Mobile: {contact.mobile}</p>}
                  {contact.billing_address && <p>Address: {contact.billing_address}</p>}
                  {contact.billing_state && <p>State: {contact.billing_state}</p>}
                  {contact.gst && <p className="font-extrabold text-slate-700 dark:text-slate-350 mt-1">GSTIN: {contact.gst}</p>}
                </div>
              )}
            </div>
            
            <div id="printable-invoice-info-grid-right" className="md:border-l md:border-slate-200 dark:md:border-slate-800 md:pl-6 space-y-3">
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Challan Information</h3>
              <div className="text-sm font-medium">
                <div>
                  <p className="text-xs text-slate-450">Party Challan No.</p>
                  <p className="text-slate-800 dark:text-slate-200 font-bold mt-0.5">{invoice?.party_challan_no || "N/A"}</p>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 italic">Delivery Challan numbers are listed per item below.</p>
              </div>
            </div>
          </div>

          {/* ITEMS TABLE */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900/10">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                <tr>
                  <th className="px-4 py-3 font-bold text-center w-12">Sr.</th>
                  <th className="px-4 py-3 font-bold">Item Description</th>
                  <th className="px-4 py-3 font-bold w-28">DC No.</th>
                  <th className="px-4 py-3 font-bold text-right w-20">Qty</th>
                  <th className="px-4 py-3 font-bold text-right w-28">Rate</th>
                  <th className="px-4 py-3 font-bold text-right w-20">GST</th>
                  <th className="px-4 py-3 font-bold text-right w-24">GST Amt</th>
                  <th className="px-4 py-3 font-bold text-right w-32">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-850 dark:text-slate-200">
                {invoice?.items?.map((item, idx) => {
                  const qty = parseFloat(item.quantity) || 0;
                  const rate = parseFloat(item.rate) || 0;
                  const gstPerc = parseFloat(item.gst_percentage) || 5;
                  const taxable = qty * rate;
                  const gstAmt = parseFloat(item.tax_amount) || (taxable * gstPerc / 100);
                  const itemTotal = parseFloat(item.total) || (taxable + gstAmt);

                  return (
                    <tr key={idx} className="bg-white dark:bg-slate-900/10 hover:bg-slate-50/50 dark:hover:bg-slate-850/50">
                      <td className="px-4 py-3 text-center text-slate-400 font-medium">{idx + 1}</td>
                      <td className="px-4 py-3">
                        <p className="font-extrabold text-slate-900 dark:text-white">{item.description || "Product/Service"}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{item.delivery_challan_no || "-"}</span>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">{qty}</td>
                      <td className="px-4 py-3 text-right font-medium">{formatCurrency(rate)}</td>
                      <td className="px-4 py-3 text-right font-semibold">{gstPerc}%</td>
                      <td className="px-4 py-3 text-right font-medium text-slate-500 dark:text-slate-400">{formatCurrency(gstAmt)}</td>
                      <td className="px-4 py-3 text-right font-black text-slate-900 dark:text-white">{formatCurrency(itemTotal)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* CALCULATION SUMMARY PANEL */}
          <div id="printable-invoice-bottom-flex" className="flex flex-col md:flex-row justify-between items-start pt-4 gap-6">
            {/* Notes & Terms */}
            <div className="flex-1 space-y-4 max-w-md w-full">
              {invoice?.notes && (
                <div className="bg-slate-50 dark:bg-slate-800/20 p-4 rounded-xl border border-slate-100 dark:border-slate-800/60">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-widest">Customer Notes</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 whitespace-pre-wrap leading-relaxed">{invoice?.notes}</p>
                </div>
              )}
              <div className="h-24 border border-dashed border-slate-200 dark:border-slate-850 rounded-2xl flex items-end justify-center p-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-slate-50/50 dark:bg-slate-900/10">
                Authorized Signatory
              </div>
            </div>

            {/* Financial Summary */}
            <div className="w-full md:w-80 bg-slate-50 dark:bg-slate-850/40 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-3 shadow-sm text-sm">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b pb-2 mb-2">GST Summary</h4>
              
              {(() => {
                const gstSum = invoice?.gst_summary || {};
                const subtotal = parseFloat(gstSum.subtotal) || 0;
                const totalGst = parseFloat(gstSum.total_gst) || 0;
                const cgst = parseFloat(gstSum.cgst) || (totalGst / 2);
                const sgst = parseFloat(gstSum.sgst) || (totalGst / 2);
                const igst = parseFloat(gstSum.igst) || totalGst;
                const grandTotal = parseFloat(gstSum.grand_total) || (subtotal + totalGst);

                return (
                  <div className="space-y-2.5 font-medium">
                    <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                      <span>Subtotal (Before Tax)</span>
                      <span className="text-slate-900 dark:text-white font-extrabold">{formatCurrency(subtotal)}</span>
                    </div>

                    {activeGstType === "intra" ? (
                      <>
                        <div className="flex justify-between items-center text-slate-500 pl-3 border-l border-slate-200 dark:border-slate-700">
                          <span>CGST</span>
                          <span>{formatCurrency(cgst)}</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-500 pl-3 border-l border-slate-200 dark:border-slate-700">
                          <span>SGST</span>
                          <span>{formatCurrency(sgst)}</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex justify-between items-center text-slate-500 pl-3 border-l border-slate-200 dark:border-slate-700">
                        <span>IGST</span>
                        <span>{formatCurrency(igst)}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center text-slate-600 dark:text-slate-400 pt-1.5 border-t border-slate-200 dark:border-slate-800">
                      <span>Total GST Amount</span>
                      <span className="text-slate-900 dark:text-white font-bold">{formatCurrency(totalGst)}</span>
                    </div>

                    <div className="pt-3 border-t border-slate-300 dark:border-slate-700 mt-1">
                      <div className="flex justify-between items-center bg-emerald-50 dark:bg-emerald-950/20 p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-900/30 text-base font-black">
                        <span className="text-slate-800 dark:text-emerald-300">Grand Total</span>
                        <span className="text-emerald-600 dark:text-emerald-400">{formatCurrency(grandTotal)}</span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
