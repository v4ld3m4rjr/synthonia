from fastapi import APIRouter
from pydantic import BaseModel
from typing import List

router = APIRouter()

class Exercise(BaseModel):
    name: str
    sets: int
    reps: int
    load_kg: float

class TrainingSession(BaseModel):
    duration_minutes: int
    rpe: int # 0-10
    exercises: List[Exercise]

@router.post("/calculate_load")
def calculate_load(session: TrainingSession):
    """
    Calcula a Carga da Sessão (Session RPE) e Tonelagem.
    """
    # Carga Interna (sRPE)
    internal_load = session.duration_minutes * session.rpe
    
    # Carga Externa (Volume Load / Tonelagem)
    volume_load = sum([ex.sets * ex.reps * ex.load_kg for ex.exercises])
    
    classification = "Moderado"
    if internal_load > 600:
        classification = "Extremo (Risco de Overreaching)"
    elif internal_load < 300:
        classification = "Recuperativo / Leve"

    return {
        "internal_load_arbitrary_units": internal_load,
        "volume_load_kg": volume_load,
        "classification": classification
    }

@router.post("/acwr")
def calculate_acwr(recent_loads: List[float]):
    """
    Calcula o Acute:Chronic Workload Ratio (ACWR) para prevenção de lesões.
    Ideal: 0.8 a 1.3
    Perigo: > 1.5
    """
    if len(recent_loads) < 28:
        return {"error": "Dados insuficientes para cálculo preciso de crônica (precisa de 4 semanas)"}
        
    acute = sum(recent_loads[-7:]) / 7 # Última semana
    chronic = sum(recent_loads[-28:]) / 28 # Últimas 4 semanas
    
    ratio = acute / chronic if chronic > 0 else 0
    
    risk_level = "Baixo"
    if ratio > 1.5:
        risk_level = "ALTO (Pico de carga)"
    elif ratio < 0.8:
        risk_level = "Destreinamento (Cuidado ao retornar)"
        
    return {
        "acute_load": round(acute, 1),
        "chronic_load": round(chronic, 1),
        "acwr": round(ratio, 2),
        "risk_level": risk_level
    }
