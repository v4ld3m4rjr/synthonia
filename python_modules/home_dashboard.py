# Home Dashboard Analytics
# Modulo Python para a Página Inicial (Dashboard)
# Responsável por agregar dados e gerar insights diários

import datetime

class HomeDashboardAnalytics:
    def __init__(self, user_profile):
        self.user = user_profile

    def get_daily_summary(self, physical_metrics, mental_metrics):
        """
        Gera um resumo do dia baseado nas métricas recebidas.
        """
        today = datetime.date.today()
        
        summary = {
            "date": str(today),
            "status": "Normal",
            "alerts": [],
            "recommendations": []
        }

        # Lógica de Alerta de Mania (Exemplo)
        if mental_metrics.get('stress_score_app', 0) > 80 and mental_metrics.get('energy_level', 0) > 8:
            summary['status'] = "Warning"
            summary['alerts'].append("High Risk of Mania Detected")
            summary['recommendations'].append("Avoid stimulants and prioritize sleep.")

        # Lógica de Recuperação Física
        readiness = physical_metrics.get('readiness_to_train', 5)
        if readiness < 4:
            summary['recommendations'].append("Low readiness. Consider a rest day.")
        elif readiness > 8:
            summary['recommendations'].append("High readiness! Good day for intensity.")

        return summary

# Exemplo de uso
if __name__ == "__main__":
    dashboard = HomeDashboardAnalytics({"name": "Valdemar", "type": "Athlete"})
    
    # Dados simulados
    phys_data = {"readiness_to_train": 9, "sleep_quality": 8}
    mental_data = {"stress_score_app": 85, "energy_level": 9}
    
    print("Dashboard Summary:")
    print(dashboard.get_daily_summary(phys_data, mental_data))
