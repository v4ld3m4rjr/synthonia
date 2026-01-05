# Spravato Analytics Module
# Modulo de Análise de Sessões de Spravato

import pandas as pd
import json

class SpravatoAnalytics:
    def __init__(self):
        self.data = []

    def add_session(self, dose_mg, dissociation, mood_after):
        self.data.append({
            "dose_mg": dose_mg,
            "dissociation": dissociation,
            "mood_after": mood_after
        })

    def analyze_trends(self):
        if not self.data:
            return {"error": "No data"}
            
        df = pd.DataFrame(self.data)
        
        # Correlação entre Dissociação e Melhora do Humor
        correlation = df['dissociation'].corr(df['mood_after'])
        
        # Dose média eficaz
        avg_dose = df['dose_mg'].mean()
        
        return {
            "total_sessions": len(df),
            "correlation_dissociation_mood": correlation,
            "avg_dose": avg_dose,
            "best_session": df.loc[df['mood_after'].idxmax()].to_dict() if not df.empty else None
        }

# Exemplo de uso simulado
if __name__ == "__main__":
    analytics = SpravatoAnalytics()
    analytics.add_session(56, 8, 4) # Dose 56mg, Dissoc 8, Humor +4
    analytics.add_session(56, 4, 1) # Dose 56mg, Dissoc 4, Humor +1
    analytics.add_session(84, 9, 5) # Dose 84mg, Dissoc 9, Humor +5
    
    print(json.dumps(analytics.analyze_trends(), indent=2))
