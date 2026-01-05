from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
import numpy as np # Exemplo: Python é ótimo para estatística

router = APIRouter()

class SpravatoSession(BaseModel):
    dose_mg: float
    dissociation_level: int
    mood_24h_after: int

class SpravatoAnalysis(BaseModel):
    avg_dose: float
    efficacy_score: float
    recommendation: str

@router.post("/analyze", response_model=SpravatoAnalysis)
def analyze_session(session: SpravatoSession):
    """
    Analisa uma sessão de Spravato individualmente.
    """
    # Lógica de Eficácia: (Dissociação * Humor) / Custo Biológico (Dose)
    # Isso é apenas um exemplo matemático fictício
    efficacy = (session.dissociation_level * (session.mood_24h_after + 5)) / (session.dose_mg / 10)
    
    rec = "Manter dose"
    if efficacy < 5:
        rec = "Reavaliar protocolo (baixa resposta)"
    elif efficacy > 15:
        rec = "Excelente resposta!"

    return {
        "avg_dose": session.dose_mg,
        "efficacy_score": round(efficacy, 2),
        "recommendation": rec
    }

@router.post("/predict_next_dose")
def predict_next_dose(history: list[SpravatoSession]):
    """
    Usa histórico para sugerir a próxima dose (Exemplo de onde entraria Machine Learning).
    """
    if not history:
        return {"suggested_dose": 56} # Dose inicial padrão
        
    # Exemplo simples: Se a última teve boa resposta, mantém. Se não, sugere aumento.
    last = history[-1]
    if last.mood_24h_after < 0:
        return {"suggested_dose": min(84, last.dose_mg + 28), "reason": "Baixa melhora no humor"}
    
    return {"suggested_dose": last.dose_mg, "reason": "Manutenção de resposta positiva"}
