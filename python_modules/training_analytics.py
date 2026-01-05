# Training Analytics Module
# Modulo Python para Análise de Treino
# Responsável por calcular Carga, TSB e Progressão

class TrainingAnalytics:
    def __init__(self):
        pass

    def calculate_session_load(self, duration_mins, rpe):
        """
        Calcula a Carga da Sessão (sRPE)
        Carga = Duração (min) * RPE (0-10)
        """
        return duration_mins * rpe

    def analyze_volume_progression(self, history_loads):
        """
        Analisa a progressão de volume (ACWR - Acute:Chronic Workload Ratio)
        Simulação simplificada.
        """
        if len(history_loads) < 7:
            return {"status": "Insufficient Data", "acwr": None}

        recent_load = sum(history_loads[-7:]) / 7  # Média 7 dias (Aguda)
        chronic_load = sum(history_loads) / len(history_loads) # Média total (Crônica - simplificada)

        acwr = recent_load / chronic_load if chronic_load > 0 else 0

        risk = "Optimal"
        if acwr > 1.5:
            risk = "High Injury Risk (Spike)"
        elif acwr < 0.8:
            risk = "Detraining"

        return {
            "acute_load": recent_load,
            "chronic_load": chronic_load,
            "acwr": round(acwr, 2),
            "risk_status": risk
        }

# Exemplo de uso
if __name__ == "__main__":
    analytics = TrainingAnalytics()
    
    # Simulação de cargas das últimas 4 semanas
    loads = [300, 320, 310, 350, 400, 280, 300, 310, 320, 600] # O último é um pico
    
    print(f"Session Load (60min @ RPE 5): {analytics.calculate_session_load(60, 5)}")
    print("Progression Analysis:")
    print(analytics.analyze_volume_progression(loads))
