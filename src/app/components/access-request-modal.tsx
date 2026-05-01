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
import { GitPullRequest, AlertCircle } from 'lucide-react';

interface AccessRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  resourceTitle: string;
  onSubmit: (message: string) => void;
  currentPoints: number;
}

export function AccessRequestModal({
  isOpen,
  onClose,
  resourceTitle,
  onSubmit,
  currentPoints,
}: AccessRequestModalProps) {
  const [message, setMessage] = useState('');
  const accessCost = 4;
  const hasEnoughPoints = currentPoints >= accessCost;

  const handleSubmit = () => {
    if (hasEnoughPoints) {
      onSubmit(message);
      setMessage('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 break-words pr-8">
            <GitPullRequest className="h-5 w-5 shrink-0" />
            <span>Request Access</span>
          </DialogTitle>
          <DialogDescription className="break-words">
            Send an access request for "{resourceTitle}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!hasEnoughPoints && (
            <div className="flex items-start gap-3 p-3 sm:p-4 rounded-lg bg-red-500/10 border border-red-500/20">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-red-500 break-words">
                  Insufficient Points
                </p>
                <p className="text-xs text-red-500/80 mt-1 break-words">
                  You need {accessCost} points to access this resource. Current balance: {currentPoints}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between p-3 sm:p-4 rounded-lg bg-muted gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium break-words">Access Cost</p>
              <p className="text-xs text-muted-foreground break-words">
                This will be deducted upon approval
              </p>
            </div>
            <span className="text-lg font-bold shrink-0">{accessCost} points</span>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">
              Request Message (Optional)
            </Label>
            <Textarea
              id="message"
              placeholder="Explain why you need access to this resource..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!hasEnoughPoints} className="w-full sm:w-auto">
            Send Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}