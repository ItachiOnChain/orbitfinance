import { useCreateAccount } from '../hooks/useCreateAccount';

export function CreateAccountButton() {
    const { createAccount, isPending, isSuccess } = useCreateAccount();

    const handleCreate = async () => {
        try {
            await createAccount();
        } catch (error) {
            console.error('Account creation failed:', error);
            alert('Account creation failed');
        }
    };

    if (isSuccess) {
        return (
            <div className="text-emerald-400 text-sm">
                ✓ Account created! Refresh the page to continue.
            </div>
        );
    }

    return (
        <button
            onClick={handleCreate}
            disabled={isPending}
            className="w-full px-6 py-3 bg-gold text-black rounded-lg font-light hover:bg-gold/90 transition-colors disabled:opacity-50"
        >
            {isPending ? 'Creating Account...' : 'Create Account'}
        </button>
    );
}
