export interface KYCSubmission {
    userAddress: string;
    fullName: string;
    country: string;
    address: string;
    idDocumentName: string;
    idDocumentData: string; // Base64 encoded file data
    status: 'pending' | 'approved' | 'rejected';
    submittedAt: number;
    rejectionReason?: string;
}

const STORAGE_KEY = 'kyc_submissions';

function getSubmissions(): KYCSubmission[] {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

function saveSubmissions(submissions: KYCSubmission[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(submissions));
}

export const kycService = {
    /**
     * Submit a new KYC application
     */
    submitKYC: async (data: {
        userAddress: string;
        fullName: string;
        country: string;
        address: string;
        idDocument: File;
    }): Promise<KYCSubmission> => {
        try {
            // Don't store the actual file data to avoid localStorage quota issues
            // In production, this would upload to a backend server
            const submission: KYCSubmission = {
                userAddress: data.userAddress,
                fullName: data.fullName,
                country: data.country,
                address: data.address,
                idDocumentName: data.idDocument.name,
                idDocumentData: '', // Empty to avoid quota issues
                status: 'pending',
                submittedAt: Date.now(),
            };

            const submissions = getSubmissions();

            // Remove any existing submission for this address
            const filtered = submissions.filter(
                s => s.userAddress.toLowerCase() !== data.userAddress.toLowerCase()
            );

            filtered.push(submission);
            saveSubmissions(filtered);

            return submission;
        } catch (error) {
            console.error('KYC submission error:', error);
            throw new Error('Failed to submit KYC application');
        }
    },

    /**
     * Get all pending KYC submissions
     */
    getPendingSubmissions: async (): Promise<KYCSubmission[]> => {
        return getSubmissions().filter(s => s.status === 'pending');
    },

    /**
     * Get KYC submission for a specific user
     */
    getUserSubmission: async (address: string): Promise<KYCSubmission | null> => {
        const submissions = getSubmissions();
        return submissions.find(s =>
            s.userAddress.toLowerCase() === address.toLowerCase()
        ) || null;
    },

    /**
     * Update KYC submission status
     */
    updateStatus: async (
        userAddress: string,
        status: 'approved' | 'rejected',
        rejectionReason?: string
    ): Promise<void> => {
        const submissions = getSubmissions();
        const submission = submissions.find(
            s => s.userAddress.toLowerCase() === userAddress.toLowerCase()
        );

        if (submission) {
            submission.status = status;
            if (rejectionReason) {
                submission.rejectionReason = rejectionReason;
            }
            saveSubmissions(submissions);
        }
    },

    /**
     * Get all submissions (for admin)
     */
    getAllSubmissions: async (): Promise<KYCSubmission[]> => {
        return getSubmissions();
    },
};
