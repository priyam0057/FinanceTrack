
const GOOGLE_DRIVE_API_URL = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
const GOOGLE_DRIVE_API_BASE_URL = 'https://www.googleapis.com/drive/v3/files';

export interface GoogleDriveFile {
    id: string;
    name: string;
    mimeType: string;
    size?: string;
    createdTime?: string;
    webViewLink?: string;
}

/**
 * Searches for a folder by name, optionally within a parent folder.
 * If not found, creates it.
 */
export async function findOrCreateFolder(
    folderName: string,
    accessToken: string,
    parentId?: string
): Promise<string> {
    let query = `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false`;
    if (parentId) {
        query += ` and '${parentId}' in parents`;
    }

    const searchResponse = await fetch(
        `${GOOGLE_DRIVE_API_BASE_URL}?q=${encodeURIComponent(query)}`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }
    );

    if (!searchResponse.ok) {
        if (searchResponse.status === 403) {
            throw new Error('403 Forbidden: Insufficient permissions');
        }
        throw new Error(`Failed to search for folder in Google Drive: ${searchResponse.status}`);
    }

    const searchData = await searchResponse.json();

    if (searchData.files && searchData.files.length > 0) {
        return searchData.files[0].id;
    }

    // Create folder if not found
    const createResponse = await fetch(GOOGLE_DRIVE_API_BASE_URL, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name: folderName,
            mimeType: 'application/vnd.google-apps.folder',
            parents: parentId ? [parentId] : undefined,
        }),
    });

    if (!createResponse.ok) {
        if (createResponse.status === 403) {
            throw new Error('403 Forbidden: Insufficient permissions to create folder');
        }
        throw new Error(`Failed to create folder in Google Drive: ${createResponse.status}`);
    }

    const createData = await createResponse.json();
    return createData.id;
}

/**
 * Uploads a file to Google Drive to a specific folder.
 */
export async function uploadFile(
    file: File,
    accessToken: string,
    folderId: string,
    description?: string
): Promise<GoogleDriveFile> {
    const metadata = {
        name: file.name,
        description: description,
        parents: [folderId],
    };

    const formData = new FormData();
    formData.append(
        'metadata',
        new Blob([JSON.stringify(metadata)], { type: 'application/json' })
    );
    formData.append('file', file);

    const response = await fetch(GOOGLE_DRIVE_API_URL, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to upload file to Google Drive: ${errorText}`);
    }

    return response.json();
}

/**
 * Lists files in a specific Google Drive folder.
 */
export async function listFiles(
    folderId: string,
    accessToken: string
): Promise<GoogleDriveFile[]> {
    const query = `'${folderId}' in parents and trashed=false`;
    const fields = 'files(id, name, mimeType, size, createdTime, webViewLink, description)';

    const response = await fetch(
        `${GOOGLE_DRIVE_API_BASE_URL}?q=${encodeURIComponent(query)}&fields=${encodeURIComponent(fields)}`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }
    );

    if (!response.ok) {
        if (response.status === 403) {
            throw new Error('403 Forbidden: Insufficient permissions to list files');
        }
        throw new Error(`Failed to list files: ${response.status}`);
    }

    const data = await response.json();
    return data.files || [];
}

/**
 * Deletes a file from Google Drive.
 */
export async function deleteFile(
    fileId: string,
    accessToken: string
): Promise<void> {
    const response = await fetch(`${GOOGLE_DRIVE_API_BASE_URL}/${fileId}`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        if (response.status === 403) {
            throw new Error('403 Forbidden: Insufficient permissions to delete file');
        }
        throw new Error(`Failed to delete file: ${response.status}`);
    }
}
