import { AuthForm } from '../components/auth/AuthForm';

export default function AuthPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background -z-10" />
            <AuthForm />
        </div>
    );
}
