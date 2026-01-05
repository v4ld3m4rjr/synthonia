import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { PatientDashboard } from '../modules/home/PatientDashboard';
import { DoctorDashboard } from '../components/dashboard/DoctorDashboard';
import { Button } from '../components/ui/Button';
import { SkeletonCard } from '../components/ui/Skeleton';

export default function Dashboard() {
    const navigate = useNavigate();
    const { profile, loading, signOut } = useAuth();

    const handleLogout = async () => {
        await signOut();
        navigate('/auth');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 md:p-8">
                <div className="max-w-6xl mx-auto space-y-6">
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 font-medium mb-4">Erro ao carregar perfil</p>
                    <Button onClick={() => window.location.reload()}>Recarregar</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
             <div className="flex justify-end mb-4">
                <Button variant="outline" onClick={handleLogout} size="sm">
                    Sair
                </Button>
            </div>

            {profile.role === 'doctor' ? (
                <DoctorDashboard userProfile={profile} />
            ) : (
                <PatientDashboard userProfile={profile} />
            )}
        </div>
    );
}
