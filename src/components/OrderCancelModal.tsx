import React, { useState } from 'react';
import { 
  X, 
  AlertTriangle, 
  RotateCcw, 
  CheckCircle2, 
  ShieldCheck, 
  Loader2, 
  IndianRupee,
  Package
} from 'lucide-react';
import { Order } from '../types';
import { useApp } from '../context/AppContext';

interface OrderCancelModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onCancelled?: (orderId: string) => void;
}

const CANCELLATION_REASONS = [
  'Order placed by mistake / need quantity change',
  'Produce freshness photo / SLA concern',
  'Delivery timeline no longer suitable',
  'Procured alternative batch locally',
  'Other reason'
];

export const OrderCancelModal: React.FC<OrderCancelModalProps> = ({
  order,
  isOpen,
  onClose,
  onCancelled
}) => {
  const { cancelOrder, marketRules, role } = useApp();
  const [selectedReason, setSelectedReason] = useState<string>(CANCELLATION_REASONS[0]);
  const [customNote, setCustomNote] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !order) return null;

  const isPreShipment = order.status === 'Pending' || order.status === 'Confirmed';
  const refundPercent = marketRules.cancellationRefundPercent ?? 100;
  const refundAmount = ((Number(order.finalAmount) * refundPercent) / 100).toFixed(2);

  const handleCancelSubmit = async () => {
    if (!isPreShipment) {
      setError('Orders already in transit or delivered cannot be cancelled.');
      return;
    }

    if (!marketRules.allowPreShipmentCancellation) {
      setError('Pre-shipment order cancellation is currently disabled by administrator policy.');
      return;
    }

    const fullReason = selectedReason === 'Other reason' && customNote.trim()
      ? `Other: ${customNote.trim()}`
      : selectedReason;

    setSubmitting(true);
    setError(null);

    try {
      const cancelledBy = role === 'BUYER' ? 'Buyer' : role === 'FARMER' ? 'Farmer' : 'Admin';
      await cancelOrder(order.id, fullReason, cancelledBy);
      setSuccess(`Order #${order.id} cancelled. ₹${refundAmount} (${refundPercent}%) escrow refund initiated.`);
      setTimeout(() => {
        setSuccess(null);
        if (onCancelled) onCancelled(order.id);
        onClose();
      }, 1400);
    } catch (err: any) {
      setError(err?.message || 'Failed to cancel order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 bg-rose-500/10 dark:bg-rose-950/20">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Cancel Order & Refund Escrow
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                आदेश रद्द करें · Order #{order.id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Order Summary */}
          <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2.5">
              <Package className="w-4 h-4 text-zinc-500" />
              <div>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">{order.productName}</span>
                <span className="text-zinc-500 dark:text-zinc-400 block">{order.quantity} kg · ₹{order.pricePerKg}/kg</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-zinc-500 dark:text-zinc-400 block text-[10px]">Total Paid</span>
              <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">₹{order.finalAmount}</span>
            </div>
          </div>

          {/* Refund Notice */}
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-xl text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-300">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Full Escrow Protection ({refundPercent}% Refund)</span>
            </div>
            <p className="text-emerald-700 dark:text-emerald-300/90 text-[11px] leading-relaxed">
              Because this order is still in pre-shipment status (<strong>{order.status}</strong>), <span className="font-bold">₹{refundAmount}</span> will be instantly returned to your payment balance. The reserved stock ({order.quantity} kg) will be automatically returned to the farmer's listing.
            </p>
          </div>

          {/* Reason Selection */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
              Reason for Cancellation / रद्द करने का कारण
            </label>
            <div className="space-y-1.5">
              {CANCELLATION_REASONS.map((r, i) => (
                <label
                  key={i}
                  className={`flex items-center p-2 rounded-lg border text-xs cursor-pointer transition ${
                    selectedReason === r
                      ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200 font-medium'
                      : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="cancelReason"
                    value={r}
                    checked={selectedReason === r}
                    onChange={() => setSelectedReason(r)}
                    className="mr-2 text-rose-600 focus:ring-rose-500"
                  />
                  <span>{r}</span>
                </label>
              ))}
            </div>
          </div>

          {selectedReason === 'Other reason' && (
            <div>
              <textarea
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder="Please describe why you are cancelling..."
                rows={2}
                className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          )}

          {error && (
            <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-lg text-rose-700 dark:text-rose-300 text-xs flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            Keep Order
          </button>
          <button
            type="button"
            disabled={submitting || !!success || !isPreShipment}
            onClick={handleCancelSubmit}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Cancelling...
              </>
            ) : (
              <>
                <RotateCcw className="w-4 h-4" />
                Confirm Cancellation (₹{refundAmount} Refund)
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
