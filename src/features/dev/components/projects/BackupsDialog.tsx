import { useState, useRef, useEffect } from 'react';
import { useStore } from '@/features/dev/lib/store';
import { Project, Backup } from '@/features/dev/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { formatDateTime, formatFileSize } from '@/features/dev/lib/constants';
import {
  Upload,
  Download,
  Trash2,
  HardDrive,
  Cloud,
  AlertCircle,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
// GoogleDriveConnect removed
import { findOrCreateFolder, uploadFile, listFiles, deleteFile as deleteFileApi } from '@/features/dev/lib/googleDrive';

interface BackupsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project;
}

export function BackupsDialog({
  open,
  onOpenChange,
  project,
}: BackupsDialogProps) {
  const { backups, addBackup, deleteBackup, isGoogleDriveConnected, setGoogleDriveConnected } = useStore();
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleConnect = () => {
    setGoogleDriveConnected(!isGoogleDriveConnected);
    toast.success(isGoogleDriveConnected ? 'Google Drive disconnected' : 'Google Drive connected');
  };

  const syncBackups = async () => {
    if (!isGoogleDriveConnected) return;

    const accessToken = sessionStorage.getItem('google_access_token');
    if (!accessToken) return;

    try {
      setIsSyncing(true);
      // 1. Find root and project folders
      const rootFolderId = await findOrCreateFolder('Finace Backups', accessToken);
      const projectFolderId = await findOrCreateFolder(project.name, accessToken, rootFolderId);

      // 2. List files
      const driveFiles = await listFiles(projectFolderId, accessToken);

      // 3. Update store (update/merge strategy)
      driveFiles.forEach(file => {
        const exists = backups.some(b => b.googleDriveFileId === file.id);
        if (!exists) {
          addBackup({
            projectId: project.id,
            fileName: file.name,
            fileSize: parseInt(file.size || '0'),
            description: undefined,
            googleDriveFileId: file.id,
            webViewLink: file.webViewLink,
            uploadedAt: file.createdTime ? new Date(file.createdTime) : new Date(),
          });
        }
      });

    } catch (error) {
      console.error('Failed to sync backups:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    if (open && isGoogleDriveConnected) {
      syncBackups();
    }
  }, [open, isGoogleDriveConnected]);

  const projectBackups = backups
    .filter((b) => b.projectId === project.id)
    .sort(
      (a, b) =>
        new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (isGoogleDriveConnected) {
      const accessToken = sessionStorage.getItem('google_access_token');
      if (!accessToken) {
        toast.error('Google Access Token missing. Please reconnect.');
        return;
      }

      try {
        setIsUploading(true);
        toast.info('Starting upload to Google Drive...');

        const rootFolderId = await findOrCreateFolder('Finace Backups', accessToken);
        const projectFolderId = await findOrCreateFolder(project.name, accessToken, rootFolderId);

        const driveFile = await uploadFile(
          file,
          accessToken,
          projectFolderId,
          description
        );

        addBackup({
          projectId: project.id,
          fileName: file.name,
          fileSize: file.size,
          description: description || undefined,
          googleDriveFileId: driveFile.id,
          webViewLink: driveFile.webViewLink,
          uploadedAt: driveFile.createdTime ? new Date(driveFile.createdTime) : new Date(),
        });

        toast.success('Backup uploaded to Google Drive successfully');
        syncBackups();
      } catch (error: any) {
        console.error('Upload failed:', error);
        if (error.message?.includes('403') || error.message?.includes('Insufficient permissions')) {
          toast.error('Permission denied. Please disconnect and reconnect Google Drive.');
          setGoogleDriveConnected(false);
          sessionStorage.removeItem('google_access_token');
        } else {
          toast.error('Failed to upload to Google Drive.');
        }
      } finally {
        setIsUploading(false);
      }
    } else {
      addBackup({
        projectId: project.id,
        fileName: file.name,
        fileSize: file.size,
        description: description || undefined,
        uploadedAt: new Date(),
      });
      toast.success('Backup added locally (Not synced to Drive)');
    }

    setDescription('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownload = (backup: Backup) => {
    if (backup.webViewLink) {
      window.open(backup.webViewLink, '_blank');
    } else {
      toast.info('This backup does not have a valid download link (Local only).');
    }
  };

  const handleDelete = async (id: string) => {
    const backup = backups.find(b => b.id === id);
    if (!backup) return;

    if (backup.googleDriveFileId && isGoogleDriveConnected) {
      try {
        const accessToken = sessionStorage.getItem('google_access_token');
        if (accessToken) {
          toast.info('Deleting from Google Drive...');
          await deleteFileApi(backup.googleDriveFileId, accessToken);
        }
      } catch (error: any) {
        console.error('Failed to delete from Drive:', error);
        toast.error('Failed to delete file from Google Drive');
      }
    }

    deleteBackup(id);
    toast.success('Backup removed');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="font-mono flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Backups - {project.name}
          </DialogTitle>
          <DialogDescription>
            Manage your project backups and sync with Google Drive.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Google Drive Connection */}
          <div className="p-4 rounded-lg bg-card border border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Cloud
                  className={`h-5 w-5 ${isGoogleDriveConnected ? 'text-success' : 'text-muted-foreground'
                    }`}
                />
                <div>
                  <p className="font-medium text-foreground">
                    Google Drive {isGoogleDriveConnected ? 'Connected' : 'Not Connected'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isGoogleDriveConnected
                      ? 'Backups will be stored in "Dev Backups" folder'
                      : 'Connect to sync backups to cloud'}
                  </p>
                </div>
              </div>
              <Button
                variant={isGoogleDriveConnected ? 'outline' : 'default'}
                onClick={handleConnect}
              >
                {isGoogleDriveConnected ? 'Disconnect' : 'Connect Google Drive'}
              </Button>
            </div>
          </div>

          {/* Info Banner */}
          <div className="flex items-start gap-3 p-4 rounded-lg bg-info/10 border border-info/30">
            <AlertCircle className="h-5 w-5 text-info mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">
                About Backups
              </p>
              <p>
                Backups are stored in Google Drive under{' '}
                <code className="text-primary">Dev Backups/{project.name}/</code>.
                Each project has its own folder. {isGoogleDriveConnected ? 'Cloud sync enabled.' : 'Connect Google Drive to enable cloud sync.'}
              </p>
            </div>
          </div>

          {/* Upload Section */}
          <div className="space-y-3">
            <Label>Upload New Backup</Label>
            <div className="flex gap-3">
              <Input
                placeholder="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="flex-1"
              />
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                accept=".zip,.tar,.gz,.7z"
              />
              <Button onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                {isUploading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                {isUploading ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Supported formats: .zip, .tar, .gz, .7z
            </p>
          </div>

          {/* Backups List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>
                Backups ({projectBackups.length})
              </Label>
              {isGoogleDriveConnected && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={syncBackups}
                  disabled={isSyncing}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                  {isSyncing ? 'Syncing...' : 'Sync Now'}
                </Button>
              )}
            </div>

            {projectBackups.length > 0 ? (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {projectBackups.map((backup) => (
                  <Card key={backup.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="font-mono font-medium text-foreground truncate">
                            {backup.fileName}
                          </p>
                          {backup.description && (
                            <p className="text-sm text-muted-foreground">
                              {backup.description}
                            </p>
                          )}
                          <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                            <span>{formatFileSize(backup.fileSize)}</span>
                            <span>{formatDateTime(backup.uploadedAt)}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDownload(backup)}
                            title="Download / Open from Drive"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => handleDelete(backup.id)}
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card/50 py-8">
                <HardDrive className="h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  No backups yet
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
