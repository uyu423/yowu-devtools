import { toast } from 'sonner';

export async function copyToClipboard(text: string, successMessage = 'Copied to clipboard.') {
  try {
    await navigator.clipboard?.writeText(text);
    toast.success(successMessage);
  } catch (error) {
    console.error('copy failed', error);
    toast.error('Unable to copy to clipboard.');
  }
}
