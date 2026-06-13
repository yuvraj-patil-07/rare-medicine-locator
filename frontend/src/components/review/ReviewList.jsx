import { HiStar, HiThumbUp, HiCheckCircle } from 'react-icons/hi';
import { formatRelativeTime, getStarArray } from '../../utils/helpers';

const ReviewList = ({ reviews, onMarkHelpful }) => {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-surface-500">No reviews yet. Be the first to review!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review._id} className="glass-card p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center text-white font-bold text-sm">
                {review.user?.name?.charAt(0) || '?'}
              </div>
              <div>
                <p className="font-medium text-sm flex items-center gap-2">
                  {review.user?.name || 'Anonymous User'}
                  {review.isVerifiedPurchase && (
                    <span className="text-green-500 flex items-center gap-0.5 text-xs font-normal" title="Verified Purchase">
                      <HiCheckCircle className="w-3.5 h-3.5" />
                      Verified
                    </span>
                  )}
                </p>
                <p className="text-xs text-surface-500">{formatRelativeTime(review.createdAt)}</p>
              </div>
            </div>
            
            <div className="flex">
              {getStarArray(review.rating).map((star, i) => (
                <HiStar
                  key={i}
                  className={`w-4 h-4 ${star === 'full' ? 'text-amber-400' : 'text-surface-300 dark:text-surface-700'}`}
                />
              ))}
            </div>
          </div>

          {review.title && <h4 className="font-semibold text-sm mb-1">{review.title}</h4>}
          <p className="text-sm text-surface-600 dark:text-surface-300 leading-relaxed">
            {review.comment}
          </p>

          {onMarkHelpful && (
            <div className="mt-4 pt-4 border-t border-surface-200 dark:border-surface-700 flex justify-end">
              <button
                onClick={() => onMarkHelpful(review._id)}
                className="flex items-center gap-1.5 text-xs text-surface-500 hover:text-primary-500 transition-colors"
              >
                <HiThumbUp className="w-4 h-4" />
                Helpful ({review.helpful || 0})
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ReviewList;
