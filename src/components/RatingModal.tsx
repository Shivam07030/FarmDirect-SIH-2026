import React, { useState, useEffect } from 'react';
import { 
  X, 
  Star, 
  Sparkles, 
  Truck, 
  Leaf, 
  ThumbsUp,
  MessageSquare
} from 'lucide-react';
import { Order } from '../types';
import { useApp } from '../context/AppContext';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  isHindi?: boolean;
}

const QUICK_TAGS = [
  'Farm Fresh & Crisp',
  'Strict 4°C Cold-Chain',
  'Premium Grade-A Quality',
  'Fast & Punctual Dispatch',
  'Accurate Weight & Crate',
  'Direct From Farmer',
  'Zero Spoilage',
  'Well Packed'
];

export const RatingModal: React.FC<RatingModalProps> = ({
  isOpen,
  onClose,
  order,
  isHindi = false,
}) => {
  const { rateOrder } = useApp();

  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [produceRating, setProduceRating] = useState<number>(5);
  const [logisticsRating, setLogisticsRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (order) {
      setRating(order.rating || 5);
      setProduceRating(order.produceRating || order.rating || 5);
      setLogisticsRating(order.logisticsRating || order.rating || 5);
      setReviewComment(order.reviewComment || '');
      setSelectedTags([]);
    }
  }, [order, isOpen]);

  if (!isOpen || !order) return null;

  const handleToggleTag = (tag: string) => {
    let nextTags: string[];
    if (selectedTags.includes(tag)) {
      nextTags = selectedTags.filter((t) => t !== tag);
    } else {
      nextTags = [...selectedTags, tag];
    }
    setSelectedTags(nextTags);

    if (!reviewComment.includes(tag)) {
      setReviewComment((prev) => (prev ? `${prev.trim()} · ${tag}` : tag));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    setSubmitting(true);
    try {
      await rateOrder(order.id, {
        rating,
        produceRating,
        logisticsRating,
        reviewComment: reviewComment.trim(),
      });
      onClose();
    } catch {
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const getScoreLabel = (score: number) => {
    switch (score) {
      case 5:
        return isHindi ? 'उत्कृष्ट गुणवत्ता व ताजगी' : 'Exceptional Quality & Freshness';
      case 4:
        return isHindi ? 'बहुत अच्छी फसल और सेवा' : 'Very Good Produce & Delivery';
      case 3:
        return isHindi ? 'संतोषजनक' : 'Average / Acceptable';
      case 2:
        return isHindi ? 'सुधार की आवश्यकता' : 'Below Expectations';
      case 1:
        return isHindi ? 'खराब गुणवत्ता' : 'Poor / Unacceptable';
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-stone-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
              </div>
              <h2 className="text-lg font-bold text-stone-900 font-serif">
                {isHindi ? 'ऑर्डर और गुणवत्ता रेटिंग' : 'Rate Produce & Delivery'}
              </h2>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Order <span className="font-mono font-medium text-stone-800">#{order.id}</span> · {order.quantity} kg {order.productName} from <span className="font-medium text-stone-800">{order.farmerName}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 p-1.5 rounded-xl hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Main 5-Star Selector */}
          <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl text-center space-y-2">
            <div className="text-xs font-bold text-amber-950 uppercase tracking-wider">
              {isHindi ? 'समग्र अनुभव (Overall Experience)' : 'Overall Order Satisfaction'}
            </div>

            {/* Interactive Big Stars */}
            <div className="flex items-center justify-center gap-2 py-1">
              {[1, 2, 3, 4, 5].map((starVal) => {
                const isFilled = (hoverRating || rating) >= starVal;
                return (
                  <button
                    key={starVal}
                    type="button"
                    onMouseEnter={() => setHoverRating(starVal)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(starVal)}
                    className="p-1 transition-transform hover:scale-120 cursor-pointer focus:outline-none"
                    aria-label={`Rate ${starVal} stars`}
                  >
                    <Star
                      className={`w-8 h-8 transition-colors ${
                        isFilled
                          ? 'fill-amber-400 text-amber-500 drop-shadow-xs'
                          : 'text-stone-300'
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            <div className="text-xs font-semibold text-amber-900 h-5">
              {getScoreLabel(hoverRating || rating)} ({hoverRating || rating}/5)
            </div>
          </div>

          {/* Sub-Criteria: Produce Freshness & Cold Chain Logistics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Freshness */}
            <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-2xl space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-800 flex items-center gap-1.5">
                  <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isHindi ? 'फसल ताजगी' : 'Produce Freshness'}</span>
                </span>
                <span className="text-xs font-mono font-bold text-emerald-700">{produceRating}.0</span>
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setProduceRating(num)}
                    className="p-1 cursor-pointer focus:outline-none"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        produceRating >= num ? 'fill-emerald-500 text-emerald-600' : 'text-stone-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Cold-Chain / Logistics */}
            <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-2xl space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-800 flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-blue-600" />
                  <span>{isHindi ? 'कोल्ड-चेन व डिलीवरी' : 'Cold-Chain & Speed'}</span>
                </span>
                <span className="text-xs font-mono font-bold text-blue-700">{logisticsRating}.0</span>
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setLogisticsRating(num)}
                    className="p-1 cursor-pointer focus:outline-none"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        logisticsRating >= num ? 'fill-blue-500 text-blue-600' : 'text-stone-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Quick Feedback Chips */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{isHindi ? 'त्वरित प्रतिक्रिया टैग' : 'Quick Quality Highlights'}</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleToggleTag(tag)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
                      isSelected
                        ? 'bg-emerald-700 text-white border-emerald-800'
                        : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
                    }`}
                  >
                    {isSelected ? `✓ ${tag}` : `+ ${tag}`}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Review Comments */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-stone-700 flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5 text-stone-400" />
                <span>{isHindi ? 'समीक्षा व अनुभव (वैकल्पिक)' : 'Written Review & Comments'}</span>
              </label>
              <span className="text-[10px] text-stone-400">Verified Buyer Review</span>
            </div>
            <textarea
              rows={3}
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="e.g. Tomatoes were firm, fresh harvest. Temperature was chilled inside reefer crates. Great harvest from Agra Cluster!"
              className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-emerald-600 transition-colors resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-stone-600 hover:text-stone-800 text-xs font-semibold rounded-xl hover:bg-stone-100 transition-colors cursor-pointer"
            >
              {isHindi ? 'रद्द करें' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>{submitting ? 'Submitting...' : isHindi ? 'रेटिंग सबमिट करें' : 'Submit Review & Rating'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
