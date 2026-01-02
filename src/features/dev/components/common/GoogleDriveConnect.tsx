import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { HardDrive, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useStore } from '@/features/dev/lib/store';

declare global {
  interface Window {
    google: any;
  }
}

export const GoogleDriveConnect = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { isGoogleDriveConnected, setGoogleDriveConnected } = useStore();
  const [tokenClient, setTokenClient] = useState<any>(null);

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  // Check session storage on mount to sync global state
  useEffect(() => {
    const token = sessionStorage.getItem('google_access_token');
    if (token && !isGoogleDriveConnected) {
      setGoogleDriveConnected(true);
    }
  }, [isGoogleDriveConnected, setGoogleDriveConnected]);

  useEffect(() => {
    const loadGoogleScript = () => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogleAuth;
      document.body.appendChild(script);
    };

    const initializeGoogleAuth = () => {
      if (!clientId) {
        console.error('Google Client ID is missing');
        return;
      }

      if (window.google) {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'https://www.googleapis.com/auth/drive.file',
          callback: (response: any) => {
            if (response.access_token) {
              handleAuthSuccess(response.access_token);
            } else {
              handleAuthError(response);
            }
          },
        });
        setTokenClient(client);
      }
    };

    if (!window.google) {
      loadGoogleScript();
    } else {
      initializeGoogleAuth();
    }
  }, [clientId]);

  const handleAuthSuccess = (accessToken: string) => {
    setGoogleDriveConnected(true);
    setIsLoading(false);
    sessionStorage.setItem('google_access_token', accessToken);
    toast.success('Successfully connected to Google Drive');
  };

  const handleAuthError = (error: any) => {
    setIsLoading(false);
    console.error('Google Auth Error:', error);
    toast.error('Failed to connect to Google Drive');
  };

  const handleConnect = () => {
    if (!tokenClient) {
      toast.error('Google Auth is not initialized yet. Please try again in a moment.');
      return;
    }

    setIsLoading(true);
    tokenClient.requestAccessToken({ prompt: 'consent' });
  };

  if (isGoogleDriveConnected) {
    return (
      <Button variant="outline" className="gap-2 text-green-600 border-green-200 hover:bg-green-50 pointer-events-none">
        <CheckCircle2 className="h-4 w-4" />
        Drive Connected
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      onClick={handleConnect}
      disabled={isLoading}
      className="gap-2"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <HardDrive className="h-4 w-4" />
      )}
      Connect Google Drive
    </Button>
  );
};
