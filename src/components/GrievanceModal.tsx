import React, { useState, useEffect } from 'react';
import { 
  X, 
  LifeBuoy, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  Send, 
  Package, 
  Thermometer, 
  IndianRupee, 
  Scale, 
  ShieldAlert, 
  Clock 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TicketCategory, TicketPriority } from '../types';

interface GrievanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultOrderId?: string;
  defaultSubject?: string;
  defaultCategory?: TicketCategory;
}

export const GrievanceModal: React.FC<GrievanceModalProps> = ({
  isOpen,
  onClose,
  defaultOrderId = '',
  defaultSubject = '',
  defaultCategory = 'DAMAGED_PRODUCE'
}) => {
  const { createTicket, role, farmerName, buyerName, orders } = useApp();

  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<TicketCategory>('DAMAGED_PRODUCE');
  const [orderId, setOrderId] = useState('');
  const [priority, setPriority] = useState<TicketPriority>('MEDIUM');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [createdTicketNumber, setCreatedTicketNumber] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSubject(defaultSubject);
      setCategory(defaultCategory);
      setOrderId(defaultOrderId);
      setPriority(defaultCategory === 'COLD_CHAIN_TEMP_BREACH' || defaultCategory === 'BUYER_UNRESPONSIVE' ? 'HIGH' : 'MEDIUM');
      setDescription('');
      setCreatedTicketNumber(null);
    }
  }, [isOpen, defaultOrderId, defaultSubject, defaultCategory]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;

    setSubmitting(true);
    try {
      const res = await createTicket({
        orderId: orderId.trim() || undefined,
        subject: subject.trim(),
        category,
        description: description.trim(),
        priority,
      });

      if (res) {
        setCreatedTicketNumber(res.ticketNumber);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const relevantOrders = orders.filter((o) => {
    const fName = farmerName.toLowerCase();
    const bName = buyerName.toLowerCase();
    if (role === 'FARMER') {
      return o.farmerName.toLowerCase().includes(fName) || o.farmerName.toLowerCase().includes('rajesh') || o.farmerName.toLowerCase().includes('you');
    }
    return o.buyerName.toLowerCase().includes(bName) || o.buyerName.toLowerCase().includes('direct') || o.buyerName.toLowerCase().includes('freshbasket');
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 space-y-4 shadow-xl border border-stone-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center shrink-0">
              <LifeBuoy className="w-4 h-4 text-amber-800" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-stone-900 font-serif">
                Raise Grievance / Dispute Ticket
              </h2>
              <p className="text-xs text-stone-500">
                Log a formal dispute for Admin audit, escrow hold, or logistics inspection
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {createdTicketNumber ? (
          <div className="py-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-stone-900">Grievance Ticket Logged!</h3>
              <p className="text-xs text-stone-500">
                Your ticket has been forwarded to the Marketplace Compliance Desk.
              </p>
              <div className="inline-block mt-2 font-mono text-sm font-bold px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg">
                Ticket ID: {createdTicketNumber}
              </div>
            </div>
            <p className="text-[11px] text-stone-400 max-w-xs mx-auto">
              An investigator will review telematics and contact the cold-chain driver or counterparty within 2 hours.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 px-6 py-2.5 bg-[#0E3B2B] hover:bg-[#144E39] text-white text-xs font-semibold rounded-xl cursor-pointer"
            >
              Done & Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Subject */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700">
                Issue Headline / Subject <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                placeholder="e.g. Temperature breach logged at Mathura cross-dock"
                className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#0E3B2B]/20"
              />
            </div>

            {/* Category and Priority Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-700">Dispute Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as TicketCategory)}
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0E3B2B]/20"
                >
                  <option value="DAMAGED_PRODUCE">Damaged / Bruised Produce</option>
                  <option value="COLD_CHAIN_TEMP_BREACH">Cold-Chain Temp Breach (&gt;6°C)</option>
                  <option value="BUYER_UNRESPONSIVE">Buyer Unresponsive / Gate Detention (&gt;30m)</option>
                  <option value="PAYMENT_ESCROW">Payment / Escrow Payout Delay</option>
                  <option value="WEIGHMENT_DISCREPANCY">Weighment Discrepancy</option>
                  <option value="MIDDLEMAN_SUSPICION">Middleman Impersonation</option>
                  <option value="DELIVERY_DELAY">Transit Delay (&gt;2h)</option>
                  <option value="OTHER">Other Query</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-700">Severity Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TicketPriority)}
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0E3B2B]/20"
                >
                  <option value="LOW">Low (Informational / Query)</option>
                  <option value="MEDIUM">Medium (Minor Discrepancy)</option>
                  <option value="HIGH">High (Temp Breach / Damage)</option>
                  <option value="CRITICAL">Critical (Total Loss / Fraud)</option>
                </select>
              </div>
            </div>

            {/* Linked Order ID */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700 flex items-center justify-between">
                <span>Related Order Reference (Optional)</span>
                {orderId && (
                  <span className="text-[10px] font-mono text-stone-400">
                    Linked: {orderId}
                  </span>
                )}
              </label>
              {relevantOrders.length > 0 ? (
                <select
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0E3B2B]/20"
                >
                  <option value="">-- Select related order (or leave empty) --</option>
                  {relevantOrders.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.id} · {o.quantity}kg {o.productName} (₹{o.finalAmount})
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="e.g. ORD-8812"
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl font-mono focus:outline-hidden focus:ring-2 focus:ring-[#0E3B2B]/20"
                />
              )}
            </div>

            {/* Detailed Description */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700">
                Detailed Grievance Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                placeholder="Provide exact details: crate condition, temperature readings, weighbridge receipts, or carrier communication..."
                className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#0E3B2B]/20 resize-none"
              />
            </div>

            {/* Action Bar */}
            <div className="pt-2 flex items-center justify-end gap-2 border-t border-stone-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-50 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !subject.trim() || !description.trim()}
                className="px-5 py-2.5 bg-amber-800 hover:bg-amber-900 disabled:opacity-50 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Logging Dispute...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>File Grievance Ticket</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
