"use client";

import { Download, Eye, X } from "lucide-react";
import jsPDF from "jspdf";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface InvoiceProps {
  order: {
    id: string;
    created_at: string;
    total?: number;
    total_price?: number;
    payment_method: string;
    payment_option?: string;
    amount_paid?: number;
    remaining_balance?: number;
    status?: string;
    payment_status?: string;
    customer_name: string;
    customer_email: string;
    customer_phone?: string;
    shipping_address?: any;
    notes?: string;
    items?: any;
  };
}

export default function Invoice({ order }: InvoiceProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [paymentMethodDetails, setPaymentMethodDetails] = useState<{
    name: string;
    details: string;
  } | null>(null);
  const isConfirmed = (order.status || order.payment_status || 'pending').toLowerCase() === 'confirmed';
  
  // Fetch payment method details from database
  useEffect(() => {
    const fetchPaymentMethodDetails = async () => {
      if (!order.payment_method) return;
      
      try {
        const { data, error } = await supabase
          .from('payment_methods')
          .select('name, details')
          .eq('method_id', order.payment_method)
          .single();
        
        if (error) throw error;
        if (data) {
          setPaymentMethodDetails(data);
        }
      } catch (error) {
        console.error('Error fetching payment method details:', error);
        // Fallback to default
        setPaymentMethodDetails({
          name: order.payment_method,
          details: 'N/A'
        });
      }
    };
    
    fetchPaymentMethodDetails();
  }, [order.payment_method]);
  
  // Format shipping address
  const formatAddress = (address: any): string => {
    if (!address) return 'N/A';
    if (typeof address === 'string') return address;
    
    const addr = address;
    return `${addr.address || ''}\n${addr.city || ''}, ${addr.state || ''} ${addr.zipCode || ''}`.trim();
  };

  const generateInvoicePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header - Company Name
    doc.setFontSize(24);
    doc.setTextColor(79, 70, 229); // Primary color
    doc.text("USA FURNITURES", pageWidth / 2, 20, { align: "center" });
    
    // Subheader
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("Quality Furniture for Your Home", pageWidth / 2, 27, { align: "center" });
    
    // Invoice Title
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.text("INVOICE", pageWidth / 2, 40, { align: "center" });
    
    // Line separator
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 45, pageWidth - 20, 45);
    
    // Invoice Details
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    
    let yPos = 55;
    
    // Left Column - Invoice Info
    doc.setFont("helvetica", "bold");
    doc.text("Invoice Details:", 20, yPos);
    doc.setFont("helvetica", "normal");
    yPos += 7;
    doc.text(`Invoice #: ${order.id.substring(0, 8).toUpperCase()}`, 20, yPos);
    yPos += 6;
    doc.text(`Date: ${new Date(order.created_at).toLocaleDateString()}`, 20, yPos);
    yPos += 6;
    doc.text(`Status: ${(order.status || order.payment_status || 'pending').toUpperCase()}`, 20, yPos);
    
    // Right Column - Customer Info
    yPos = 55;
    doc.setFont("helvetica", "bold");
    doc.text("Customer Information:", pageWidth / 2 + 10, yPos);
    doc.setFont("helvetica", "normal");
    yPos += 7;
    doc.text(`Name: ${order.customer_name}`, pageWidth / 2 + 10, yPos);
    yPos += 6;
    doc.text(`Email: ${order.customer_email}`, pageWidth / 2 + 10, yPos);
    if (order.customer_phone) {
      yPos += 6;
      doc.text(`Phone: ${order.customer_phone}`, pageWidth / 2 + 10, yPos);
    }
    
    // Shipping Address
    if (order.shipping_address) {
      yPos += 10;
      doc.setFont("helvetica", "bold");
      doc.text("Shipping Address:", 20, yPos);
      doc.setFont("helvetica", "normal");
      yPos += 7;
      
      // Format address properly
      const formattedAddress = formatAddress(order.shipping_address);
      const addressLines = formattedAddress.split('\n');
      addressLines.forEach(line => {
        doc.text(line, 20, yPos);
        yPos += 6;
      });
    }
    
    // Payment Details Section
    yPos += 10;
    doc.setDrawColor(200, 200, 200);
    doc.line(20, yPos, pageWidth - 20, yPos);
    yPos += 10;
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Payment Information", 20, yPos);
    doc.setFontSize(10);
    yPos += 10;
    
    // Create payment table
    const totalAmount = order.total || order.total_price || 0;
    const amountPaid = order.amount_paid || totalAmount;
    const remainingBalance = order.remaining_balance || 0;
    const paymentOption = order.payment_option || 'full';
    
    doc.setFont("helvetica", "normal");
    
    // Payment Plan
    doc.text("Payment Plan:", 20, yPos);
    doc.text(paymentOption.toUpperCase(), pageWidth - 60, yPos);
    yPos += 8;
    
    // Total Amount
    doc.text("Total Amount:", 20, yPos);
    doc.text(`$${totalAmount.toFixed(2)}`, pageWidth - 60, yPos);
    yPos += 8;
    
    // Amount Paid
    doc.setFont("helvetica", "bold");
    doc.text("Amount Paid:", 20, yPos);
    doc.setTextColor(34, 197, 94); // Green color
    doc.text(`$${amountPaid.toFixed(2)}`, pageWidth - 60, yPos);
    doc.setTextColor(0, 0, 0);
    yPos += 8;
    
    // Remaining Balance
    if (remainingBalance > 0) {
      doc.setFont("helvetica", "bold");
      doc.text("Remaining Balance:", 20, yPos);
      doc.setTextColor(239, 68, 68); // Red color
      doc.text(`$${remainingBalance.toFixed(2)}`, pageWidth - 60, yPos);
      doc.setTextColor(0, 0, 0);
      yPos += 8;
    }
    
    // Payment Method
    doc.setFont("helvetica", "normal");
    doc.text("Payment Method:", 20, yPos);
    doc.text(order.payment_method.toUpperCase(), pageWidth - 60, yPos);
    yPos += 10;
    
    // Payment Made To Section (dynamic from database)
    if (paymentMethodDetails) {
      doc.setDrawColor(79, 70, 229); // Primary color
      doc.setLineWidth(0.5);
      doc.rect(20, yPos, pageWidth - 40, 20);
      yPos += 7;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text("Payment Made To:", 25, yPos);
      yPos += 6;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(79, 70, 229); // Primary color
      doc.text(`${paymentMethodDetails.details} - ${paymentMethodDetails.name}`, 25, yPos);
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      yPos += 10;
    }
    
    // Notes Section
    if (order.notes) {
      doc.setDrawColor(200, 200, 200);
      doc.line(20, yPos, pageWidth - 20, yPos);
      yPos += 10;
      doc.setFont("helvetica", "bold");
      doc.text("Additional Notes:", 20, yPos);
      yPos += 7;
      doc.setFont("helvetica", "normal");
      const notesLines = doc.splitTextToSize(order.notes, pageWidth - 40);
      doc.text(notesLines, 20, yPos);
      yPos += notesLines.length * 6;
    }
    
    // Footer
    const footerY = doc.internal.pageSize.getHeight() - 30;
    doc.setDrawColor(200, 200, 200);
    doc.line(20, footerY, pageWidth - 20, footerY);
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text("Thank you for your business!", pageWidth / 2, footerY + 10, { align: "center" });
    doc.text("For inquiries, please contact: support@usafurnitures.com", pageWidth / 2, footerY + 16, { align: "center" });
    
    // Confirmed Stamp
    if (isConfirmed) {
      doc.setFontSize(40);
      doc.setTextColor(34, 197, 94, 0.2); // Green with opacity
      doc.setFont("helvetica", "bold");
      doc.text("CONFIRMED", pageWidth / 2, doc.internal.pageSize.getHeight() / 2, {
        align: "center",
        angle: 45
      });
    }
    
    // Save PDF
    doc.save(`invoice-${order.id.substring(0, 8)}.pdf`);
  };

  return (
    <>
      {/* Preview and Download Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowPreview(true)}
          disabled={!isConfirmed}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            isConfirmed
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          title={!isConfirmed ? 'Invoice available after order confirmation' : 'Preview Invoice'}
        >
          <Eye className="w-4 h-4" />
          <span>Preview Invoice</span>
        </button>
        
        <button
          onClick={generateInvoicePDF}
          disabled={!isConfirmed}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            isConfirmed
              ? 'bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          title={!isConfirmed ? 'Invoice available after order confirmation' : 'Download Invoice'}
        >
          <Download className="w-4 h-4" />
          <span>Download</span>
        </button>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
              <h2 className="text-lg sm:text-2xl font-bold">Invoice Preview</h2>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Invoice Content */}
            <div className="p-4 sm:p-8">
              {/* Header */}
              <div className="text-center mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-primary-600 mb-2">USA FURNITURES</h1>
                <p className="text-gray-600 text-xs sm:text-sm">Quality Furniture for Your Home</p>
                <h2 className="text-xl sm:text-2xl font-bold mt-4">INVOICE</h2>
              </div>

              <hr className="mb-4 sm:mb-6" />

              {/* Invoice Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
                {/* Left Column */}
                <div>
                  <h3 className="font-bold mb-3">Invoice Details:</h3>
                  <p className="text-xs sm:text-sm mb-1">
                    <span className="font-semibold">Invoice #:</span> {order.id.substring(0, 8).toUpperCase()}
                  </p>
                  <p className="text-xs sm:text-sm mb-1">
                    <span className="font-semibold">Date:</span> {new Date(order.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-xs sm:text-sm">
                    <span className="font-semibold">Status:</span>{' '}
                    <span className="inline-block px-2 py-1 rounded bg-green-100 text-green-800 text-xs font-semibold">
                      {(order.status || order.payment_status || 'pending').toUpperCase()}
                    </span>
                  </p>
                </div>

                {/* Right Column */}
                <div>
                  <h3 className="font-bold mb-3">Customer Information:</h3>
                  <p className="text-xs sm:text-sm mb-1 break-words">
                    <span className="font-semibold">Name:</span> {order.customer_name}
                  </p>
                  <p className="text-xs sm:text-sm mb-1 break-all">
                    <span className="font-semibold">Email:</span> {order.customer_email}
                  </p>
                  {order.customer_phone && (
                    <p className="text-xs sm:text-sm">
                      <span className="font-semibold">Phone:</span> {order.customer_phone}
                    </p>
                  )}
                </div>
              </div>

              {/* Shipping Address */}
              {order.shipping_address && (
                <div className="mb-6 sm:mb-8">
                  <h3 className="font-bold mb-3">Shipping Address:</h3>
                  <div className="bg-gray-50 p-3 sm:p-4 rounded whitespace-pre-line text-xs sm:text-sm">
                    {formatAddress(order.shipping_address)}
                  </div>
                </div>
              )}

              <hr className="mb-4 sm:mb-6" />

              {/* Payment Information */}
              <div className="mb-6 sm:mb-8">
                <h3 className="font-bold text-base sm:text-lg mb-4">Payment Information</h3>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="font-semibold">Payment Plan:</span>
                    <span>{(order.payment_option || 'full').toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between text-base sm:text-lg">
                    <span className="font-semibold">Total Amount:</span>
                    <span>${(order.total || order.total_price || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-base sm:text-lg">
                    <span className="font-semibold">Amount Paid:</span>
                    <span className="text-green-600 font-bold">
                      ${(order.amount_paid || order.total || order.total_price || 0).toFixed(2)}
                    </span>
                  </div>
                  {(order.remaining_balance || 0) > 0 && (
                    <div className="flex justify-between text-base sm:text-lg">
                      <span className="font-semibold">Remaining Balance:</span>
                      <span className="text-red-600 font-bold">
                        ${(order.remaining_balance || 0).toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="font-semibold">Payment Method:</span>
                    <span className="uppercase">{order.payment_method}</span>
                  </div>
                  
                  {/* Payment Made To Tag - Dynamic from Database */}
                  {paymentMethodDetails && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="bg-primary-50 border-2 border-primary-200 rounded-lg p-3 sm:p-4">
                        <p className="text-xs sm:text-sm text-gray-600 mb-2">Payment Made To:</p>
                        <p className="font-bold text-primary-700 text-sm sm:text-base">{paymentMethodDetails.details}</p>
                        <p className="text-xs text-gray-500 mt-1">{paymentMethodDetails.name}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              {order.notes && (
                <>
                  <hr className="mb-4 sm:mb-6" />
                  <div className="mb-6 sm:mb-8">
                    <h3 className="font-bold mb-3">Additional Notes:</h3>
                    <p className="text-xs sm:text-sm text-gray-700">{order.notes}</p>
                  </div>
                </>
              )}

              <hr className="mb-4 sm:mb-6" />

              {/* Footer */}
              <div className="text-center text-gray-600 text-xs sm:text-sm">
                <p className="mb-1">Thank you for your business!</p>
                <p>For inquiries, please contact: support@usafurnitures.com</p>
              </div>

              {/* Confirmed Watermark */}
              {isConfirmed && (
                <div className="text-center mt-8">
                  <span className="inline-block text-4xl sm:text-6xl font-bold text-green-500 opacity-20 transform rotate-12">
                    CONFIRMED
                  </span>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-3 sm:py-2 btn-secondary"
              >
                Close
              </button>
              <button
                onClick={() => {
                  generateInvoicePDF();
                  setShowPreview(false);
                }}
                className="px-4 py-3 sm:py-2 btn-primary flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
