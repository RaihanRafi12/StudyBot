import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { useState } from 'react';
import { Star } from 'lucide-react';
import { motion } from 'motion/react';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  resourceTitle: string;
  onSubmit: (rating: number, comment: string) => void;
}

export function RatingModal({
  isOpen,
  onClose,
  resourceTitle,
  onSubmit,
}: RatingModalProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    if (rating > 0 && comment.trim()) {
      onSubmit(rating, comment);
      setRating(0);
      setComment('');
      onClose();
    }
  };

  const displayRating = hoveredRating || rating;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="break-words pr-8">Rate & Review</DialogTitle>
          <DialogDescription className="break-words">
            Share your experience with "{resourceTitle}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Star Rating */}
          <div className="space-y-2">
            <Label>Your Rating</Label>
            <div className="flex items-center gap-2 flex-wrap">
              {[1, 2, 3, 4, 5].map((star) => (
                <motion.button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  className="focus:outline-none"
                >
                  <Star
                    className={`h-8 w-8 transition-colors ${
                      star <= displayRating
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-muted-foreground'
                    }`}
                  />
                </motion.button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-sm text-muted-foreground whitespace-nowrap">
                  {rating} {rating === 1 ? 'star' : 'stars'}
                </span>
              )}
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment">
              Your Review <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="comment"
              placeholder="Write your review here... (required)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              required
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground break-words">
              A comment is required to submit your rating
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={rating === 0 || !comment.trim()}
            className="w-full sm:w-auto"
          >
            Submit Review
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}