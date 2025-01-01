import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CreditCard } from "lucide-react"

interface PaywallDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const PaywallDialog = ({ isOpen, onClose }: PaywallDialogProps) => {
  const handleUpgrade = () => {
    // TODO: Implement actual payment integration
    console.log('Upgrade clicked - implement payment integration');
    window.open('https://buy.stripe.com/test_yourlink', '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-purple-600" />
            Upgrade to Premium
          </DialogTitle>
          <DialogDescription>
            You've reached the limit of 3 free voice recordings. Upgrade to premium for unlimited recordings and more features!
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <h3 className="font-medium">Premium Features:</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Unlimited voice recordings</li>
              <li>Priority processing</li>
              <li>Advanced tone customization</li>
              <li>Premium support</li>
            </ul>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Maybe Later
            </Button>
            <Button onClick={handleUpgrade}>
              Upgrade Now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaywallDialog;