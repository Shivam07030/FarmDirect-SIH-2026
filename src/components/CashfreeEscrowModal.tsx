import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  CreditCard,
  Building2,
  QrCode,
  Zap,
  Sparkles,
  Loader2,
  PlusCircle,
  IndianRupee,
  Receipt,
  FileCheck,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { Product } from '../types';

interface CashfreeEscrowModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'CHECKOUT' | 'TOPUP';
  product?: Product | null;
  quantity?: number;
  produceAmount?: number;
  logisticsFee?: number;
  totalAmount?: number;
  buyerEscrowBalance: number;
  isHindi?: boolean;
  onConfirmEscrowPayment?: (paymentDetails: {
    method: 'UPI' | 'NETBANKING' | 'ESCROW_VAULT';
    escrowId: string;
    cfPaymentId: string;
  }) => void;
  onAddFunds?: (amount: number, method: string) => void;
}

export const CashfreeEscrowModal: React.FC<CashfreeEscrowModalProps> = ({
  isOpen,
  onClose,
  mode = 'CHECKOUT',
  product,
  quantity = 10,
  produceAmount = 240,
  logisticsFee = 25,
  totalAmount = 265,
  buyerEscrowBalance,
  isHindi = false,
  onConfirmEscrowPayment,
  onAddFunds,
}) => {
  const [activeTab, setActiveTab] = useState<'UPI' | 'ESCROW_VAULT' | 'NETBANKING'>(
    buyerEscrowBalance >= totalAmount ? 'ESCROW_VAULT' : 'UPI'
  );
  const [upiId, setUpiId] = useState('buyer@okhdfcbank');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [topupAmount, setTopupAmount] = useState<number>(10000);
  const [topupSuccess, setTopupSuccess] = useState(false);

  if (!isOpen) return null;

  const escrowMandateId = `CF_ESC_${Date.now().toString().slice(-6)}`;
  const hasSufficientBalance = buyerEscrowBalance >= totalAmount;

  const handleAuthorize = async () => {
    setIsProcessing(true);

    setProcessingStep(
      isHindi
        ? 'कैशफ्री नोडल एस्क्रो गेटवे से 256-बिट सुरक्षित कनेक्शन...'
        : 'Establishing 256-bit TLS handshake with Cashfree Nodal Server...'
    );
    await new Promise((res) => setTimeout(res, 600));

    setProcessingStep(
      isHindi
        ? `आरबीआई नोडल वर्चुअल एस्क्रो खाता #${escrowMandateId} सृजित किया गया...`
        : `Allocating RBI Nodal Escrow Virtual Mandate #${escrowMandateId}...`
    );
    await new Promise((res) => setTimeout(res, 700));

    setProcessingStep(
      isHindi
        ? `₹${totalAmount.toLocaleString('en-IN')} एस्क्रो में सुरक्षित लॉक हुआ। डिलीवरी सत्यापन तक किसान को भुगतान रोके रखा जाएगा...`
        : `₹${totalAmount.toLocaleString('en-IN')} locked safely in escrow vault. Payout guarded until OTP verification...`
    );
    await new Promise((res) => setTimeout(res, 600));

    setIsProcessing(false);
    if (onConfirmEscrowPayment) {
      onConfirmEscrowPayment({
        method: activeTab,
        escrowId: escrowMandateId,
        cfPaymentId: `CF_PAY_${Date.now().toString().slice(-6)}`,
      });
    }
  };

  const handleTopupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (topupAmount <= 0) return;
    setIsProcessing(true);
    setProcessingStep(
      isHindi ? 'कैशफ्री बैंकिंग नेटवर्क से एस्क्रो टॉप-अप जारी...' : 'Processing Cashfree Escrow Nodal Deposit...'
    );
    await new Promise((res) => setTimeout(res, 800));
    setIsProcessing(false);
    setTopupSuccess(true);
    if (onAddFunds) {
      onAddFunds(topupAmount, 'UPI Instant Pay');
    }
    setTimeout(() => {
      setTopupSuccess(false);
      if (mode === 'TOPUP') {
        onClose();
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 font-sans overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-stone-200 animate-in fade-in zoom-in duration-200 my-auto">
        
        {/* Cashfree Official Trust Header */}
        <div className="bg-gradient-to-r from-[#0E3B2B] to-[#175c43] p-5 text-white relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold tracking-wider uppercase flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-300" />
              <span>Cashfree Smart Escrow · RBI Nodal Account</span>
            </span>
          </div>

          <h2 className="text-xl font-bold font-serif">
            {mode === 'CHECKOUT'
              ? isHindi ? 'सुरक्षित एस्क्रो भुगतान एवं लॉक' : 'Cashfree Escrow Mandate'
              : isHindi ? 'एस्क्रो वॉलेट में राशि जोड़ें' : 'Manage Escrow Vault & Add Funds'}
          </h2>
          <p className="text-xs text-emerald-100/80 mt-1">
            {isHindi
              ? 'किसान व खरीदार दोनों की सुरक्षा: 4-अंकीय डिलीवरी ओटीपी सत्यापन के बाद ही राशि किसान के खाते में जाती है।'
              : 'Zero counterparty risk: Funds remain locked in escrow until you verify physical delivery with your OTP.'}
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4">
          
          {/* If Mode is CHECKOUT: Show Order Breakdown */}
          {mode === 'CHECKOUT' && product && (
            <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-2 text-xs">
              <div className="flex items-center justify-between font-bold text-stone-900 border-b border-stone-200/80 pb-2">
                <span className="flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{quantity} kg {product.name} ({product.farmerName})</span>
                </span>
                <span className="font-mono text-stone-700">₹{produceAmount.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex items-center justify-between text-stone-500">
                <span>{isHindi ? 'कोल्ड-चेन लॉजिस्टिक्स (Reefer Freight):' : 'Reefer Cold-Chain Logistics:'}</span>
                <span className="font-mono text-stone-700">₹{logisticsFee.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex items-center justify-between text-stone-900 font-bold pt-1.5 border-t border-stone-200">
                <span className="text-sm">{isHindi ? 'एस्क्रो में लॉक की जाने वाली कुल राशि:' : 'Total Amount to Lock in Escrow:'}</span>
                <span className="font-mono text-base text-emerald-900 font-extrabold">₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          )}

          {/* Current Pre-Funded Escrow Vault Balance Pill */}
          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <IndianRupee className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-stone-500 text-[10px] block uppercase font-bold">
                  {isHindi ? 'वर्तमान उपलब्ध एस्क्रो बैलेंस' : 'Available Escrow Vault Balance'}
                </span>
                <span className="font-mono font-bold text-stone-900 text-sm">
                  ₹{buyerEscrowBalance.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {mode === 'CHECKOUT' && !hasSufficientBalance && (
              <button
                type="button"
                onClick={() => setActiveTab('UPI')}
                className="text-[11px] text-emerald-800 font-bold hover:underline cursor-pointer"
              >
                + Top Up via UPI
              </button>
            )}
          </div>

          {/* Payment Method Selector Tabs (For CHECKOUT) */}
          {mode === 'CHECKOUT' && (
            <div className="space-y-3">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                {isHindi ? 'एस्क्रो डिपॉजिट विधि चुनें:' : 'Select Escrow Funding Source:'}
              </label>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveTab('ESCROW_VAULT')}
                  className={`p-2.5 rounded-xl border text-center font-semibold transition-all cursor-pointer ${
                    activeTab === 'ESCROW_VAULT'
                      ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 shadow-xs'
                      : 'border-stone-200 hover:bg-stone-50 text-stone-600'
                  }`}
                >
                  <Lock className="w-4 h-4 mx-auto mb-1 text-emerald-700" />
                  <span>Escrow Float</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('UPI')}
                  className={`p-2.5 rounded-xl border text-center font-semibold transition-all cursor-pointer ${
                    activeTab === 'UPI'
                      ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 shadow-xs'
                      : 'border-stone-200 hover:bg-stone-50 text-stone-600'
                  }`}
                >
                  <Zap className="w-4 h-4 mx-auto mb-1 text-amber-600" />
                  <span>UPI Autopay</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('NETBANKING')}
                  className={`p-2.5 rounded-xl border text-center font-semibold transition-all cursor-pointer ${
                    activeTab === 'NETBANKING'
                      ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 shadow-xs'
                      : 'border-stone-200 hover:bg-stone-50 text-stone-600'
                  }`}
                >
                  <Building2 className="w-4 h-4 mx-auto mb-1 text-blue-600" />
                  <span>NetBanking</span>
                </button>
              </div>

              {/* Tab Content 1: Pre-Funded Escrow Vault */}
              {activeTab === 'ESCROW_VAULT' && (
                <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50 space-y-2 text-xs">
                  {hasSufficientBalance ? (
                    <div className="flex items-start gap-2 text-emerald-900">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">Instant Escrow Lock Available:</span>
                        <p className="text-[11px] text-stone-600 mt-0.5">
                          ₹{totalAmount.toLocaleString('en-IN')} will be deducted from your pre-funded escrow float and locked in mandate #{escrowMandateId}.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-amber-900 text-xs">
                        ⚠️ Insufficient float balance (Needed: ₹{totalAmount.toLocaleString('en-IN')}, Available: ₹{buyerEscrowBalance.toLocaleString('en-IN')}).
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setTopupAmount(Math.max(5000, totalAmount - buyerEscrowBalance));
                          setActiveTab('UPI');
                        }}
                        className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs cursor-pointer"
                      >
                        + Top-Up Escrow via UPI & Complete Order
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Tab Content 2: UPI */}
              {activeTab === 'UPI' && (
                <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50 space-y-2 text-xs">
                  <label className="block font-semibold text-stone-700">UPI Virtual Payment Address (VPA)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="e.g. buyer@okaxis"
                      className="flex-1 px-3 py-2 border border-stone-200 rounded-lg bg-white font-mono text-xs focus:outline-none focus:border-emerald-600"
                    />
                    <button
                      type="button"
                      onClick={() => setUpiId('freshbasket@okhdfcbank')}
                      className="px-2.5 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-lg text-[10px] font-bold cursor-pointer"
                    >
                      Use Sample
                    </button>
                  </div>
                  <p className="text-[10px] text-stone-500">
                    Supports Google Pay, PhonePe, Paytm, and BHIM UPI Auto-mandate.
                  </p>
                </div>
              )}

              {/* Tab Content 3: NetBanking */}
              {activeTab === 'NETBANKING' && (
                <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50 space-y-2 text-xs">
                  <label className="block font-semibold text-stone-700">Select Commercial Bank</label>
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg bg-white text-xs focus:outline-none"
                  >
                    <option value="HDFC Bank">HDFC Bank (Commercial Corporate)</option>
                    <option value="State Bank of India">State Bank of India (SBI Agri)</option>
                    <option value="ICICI Bank">ICICI Bank Wholesale</option>
                    <option value="Axis Bank">Axis Bank Nodal Escrow</option>
                  </select>
                  <p className="text-[10px] text-stone-500">
                    Direct RBI-regulated e-Mandate integration for commercial wholesale orders.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* If Mode is TOPUP: Standalone Add Funds Interface */}
          {mode === 'TOPUP' && (
            <form onSubmit={handleTopupSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                  {isHindi ? 'जमा की जाने वाली राशि चुनें:' : 'Select Deposit Amount:'}
                </label>

                {/* Quick amount chips */}
                <div className="grid grid-cols-4 gap-2">
                  {[5000, 10000, 25000, 50000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setTopupAmount(amt)}
                      className={`py-2 px-1 rounded-xl border text-center font-mono font-bold text-xs transition-all cursor-pointer ${
                        topupAmount === amt
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 shadow-xs'
                          : 'border-stone-200 hover:bg-stone-50 text-stone-600'
                      }`}
                    >
                      +₹{(amt / 1000)}k
                    </button>
                  ))}
                </div>

                <div className="relative mt-2">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 font-bold">₹</span>
                  <input
                    type="number"
                    value={topupAmount}
                    onChange={(e) => setTopupAmount(Number(e.target.value))}
                    min={500}
                    step={500}
                    required
                    className="w-full pl-8 pr-3 py-2.5 border border-stone-200 rounded-xl text-sm font-mono font-bold focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl text-xs space-y-1 text-blue-950">
                <div className="flex items-center gap-1.5 font-bold">
                  <FileCheck className="w-3.5 h-3.5 text-blue-700" />
                  <span>Instant UPI & NEFT Virtual Escrow Account</span>
                </div>
                <p className="text-[11px] text-blue-800 leading-tight">
                  Funds deposited into your escrow account remain under your control and earn zero counterparty risk until orders are OTP-verified.
                </p>
              </div>

              <button
                type="submit"
                disabled={isProcessing || topupAmount <= 0}
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing Deposit...</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4" />
                    <span>Deposit ₹{topupAmount.toLocaleString('en-IN')} into Escrow Vault</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Processing Animation Overlay */}
          {isProcessing && (
            <div className="p-4 bg-emerald-950 text-white rounded-2xl space-y-2 text-center animate-in fade-in">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-400 mx-auto" />
              <div className="text-xs font-bold text-emerald-300 font-mono tracking-wide">
                Cashfree Nodal Handshake Active
              </div>
              <p className="text-[11px] text-emerald-100">{processingStep}</p>
            </div>
          )}

          {/* Topup Success Message */}
          {topupSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs flex items-center gap-2 font-bold animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>₹{topupAmount.toLocaleString('en-IN')} successfully credited to your Cashfree Escrow Vault!</span>
            </div>
          )}

          {/* Action Button for CHECKOUT mode */}
          {mode === 'CHECKOUT' && (
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleAuthorize}
                disabled={isProcessing || (activeTab === 'ESCROW_VAULT' && !hasSufficientBalance)}
                className="w-full py-3.5 bg-gradient-to-r from-[#0E3B2B] to-[#144E39] hover:from-[#114532] hover:to-[#185e45] text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Lock className="w-4 h-4 text-emerald-400" />
                <span>
                  {isHindi
                    ? `₹${totalAmount.toLocaleString('en-IN')} एस्क्रो में अधिकृत और लॉक करें →`
                    : `Authorize & Lock ₹${totalAmount.toLocaleString('en-IN')} in Escrow →`}
                </span>
              </button>

              <div className="text-[10px] text-stone-400 text-center flex items-center justify-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>Cashfree Payments India Pvt Ltd · Licensed RBI Payment Aggregator</span>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
