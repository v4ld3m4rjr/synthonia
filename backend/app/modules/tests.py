from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class JumpTestInput(BaseModel):
    jump_height_cm: float
    body_weight_kg: float
    base_jump_cm: float = 40.0 # Média histórica do atleta

@router.post("/jump_analysis")
def analyze_jump(data: JumpTestInput):
    """
    Implementação Python do Teste de Salto (Jump Test).
    Define a prontidão neuromuscular e ajusta a carga de treino do dia.
    """
    delta = (data.jump_height_cm - data.base_jump_cm) / data.base_jump_cm
    percent_change = delta * 100
    
    # Lógica de Decisão
    status = "Normal"
    training_recommendation = "Treino conforme planejado (100%)"
    
    if percent_change < -10:
        status = "Fadiga Alta"
        training_recommendation = "Reduzir volume/intensidade em 20-30% ou Day Off"
    elif percent_change < -5:
        status = "Fadiga Leve"
        training_recommendation = "Reduzir carga em 10% (Autorregulação)"
    elif percent_change > 5:
        status = "Potenciação (PAP)"
        training_recommendation = "Aumentar intensidade! (105-110%)"

    # Estimativa de Potência (Fórmula de Sayers et al.)
    # Peak Power (W) = 60.7 * jump_height(cm) + 45.3 * body_mass(kg) - 2055
    peak_power = (60.7 * data.jump_height_cm) + (45.3 * data.body_weight_kg) - 2055

    return {
        "status": status,
        "percent_change": round(percent_change, 1),
        "recommendation": training_recommendation,
        "estimated_peak_power_watts": round(peak_power, 1)
    }
