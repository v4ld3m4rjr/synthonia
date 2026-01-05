# Evaluation Module (Python Logic)
# Modulo de Avaliação com calculo de controle de percentual de treino em função de salto

class JumpTestAnalyzer:
    def __init__(self, base_jump_cm: float = 40.0):
        """
        Inicializa o analisador com um salto base (média do atleta).
        :param base_jump_cm: Altura média do salto em cm (ex: CMJ - Counter Movement Jump)
        """
        self.base_jump_cm = base_jump_cm

    def calculate_training_load(self, current_jump_cm: float) -> dict:
        """
        Calcula o percentual de carga de treino recomendado baseado na fadiga neuromuscular (salto).
        
        Lógica:
        - Queda > 10%: Alta Fadiga -> Reduzir carga para 80% (Recuperação/Técnico)
        - Queda entre 5-10%: Fadiga Leve -> Manter ou reduzir levemente (90-100%)
        - Variação +/- 5%: Homeostase -> Treino Normal (100%)
        - Aumento > 5%: Potenciação -> Aumentar carga (105-110%)
        """
        
        delta = (current_jump_cm - self.base_jump_cm) / self.base_jump_cm
        percent_change = delta * 100
        
        recommendation = {
            "current_jump": current_jump_cm,
            "delta_percent": round(percent_change, 2),
            "training_load_percent": 100,
            "status": "Normal",
            "action": "Maintain planned session"
        }

        if percent_change < -10:
            recommendation["training_load_percent"] = 80
            recommendation["status"] = "High Fatigue"
            recommendation["action"] = "Reduce volume/intensity significantly. Focus on recovery."
        elif percent_change < -5:
            recommendation["training_load_percent"] = 90
            recommendation["status"] = "Mild Fatigue"
            recommendation["action"] = "Autoregulate: Reduce sets or load slightly."
        elif percent_change > 5:
            recommendation["training_load_percent"] = 110
            recommendation["status"] = "High Readiness"
            recommendation["action"] = "Increase intensity. Go for PRs or higher complexity."
            
        return recommendation

# Exemplo de uso
if __name__ == "__main__":
    analyzer = JumpTestAnalyzer(base_jump_cm=40.0)
    
    # Simulação
    test_jumps = [35.0, 39.0, 40.0, 43.0]
    
    print(f"{'Jump (cm)':<10} | {'Status':<15} | {'Load %':<10}")
    print("-" * 40)
    
    for jump in test_jumps:
        res = analyzer.calculate_training_load(jump)
        print(f"{res['current_jump']:<10} | {res['status']:<15} | {res['training_load_percent']}%")
