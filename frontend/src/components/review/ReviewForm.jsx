import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { HiStar, HiX } from 'react-icons/hi';
import Modal from '../common/Modal';

const ReviewForm = ({ isOpen, onClose, onSubmit, type = 'medicine' }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  const handleFormSubmit = async (data) => {
    if (rating === 0) return;
    await onSubmit({ ...data, rating });
    reset();
    setRating(0);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Review ${type === 'medicine' ? 'Medicine' : 'Pharmacy'}`}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {/* Rating Stars */}
        <div className="flex flex-col items-center mb-6">
          <p className="text-sm text-surface-500 mb-2">Tap a star to rate</p>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="p-1 focus:outline-none transition-transform hover:scale-110"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
              >
                <HiStar
                  className={`w-10 h-10 transition-colors ${
                    star <= (hover || rating) ? 'text-amber-400' : 'text-surface-300 dark:text-surface-700'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Title (Optional)</label>
          <input
            {...register('title', { maxLength: 100 })}
            className="input-field"
            placeholder="Sum up your experience"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Review <span className="text-red-500">*</span></label>
          <textarea
            {...register('comment', { required: 'Please write a review', maxLength: 500 })}
            className="input-field min-h-[120px]"
            placeholder="Tell others what you think..."
          ></textarea>
          {errors.comment && <p className="text-red-500 text-xs mt-1">{errors.comment.message}</p>}
        </div>

        <div className="pt-4 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="btn-ghost flex-1"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || rating === 0}
            className="btn-primary flex-1"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ReviewForm;
