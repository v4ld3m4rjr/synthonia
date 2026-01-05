from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import datetime

router = APIRouter()

# --- Modelos de Dados ---
class UserProfile(BaseModel):
    id: str
    role: str # 'subject', 'doctor', 'coach'
    full_name: str

class DashboardSummary(BaseModel):
    date: str
    status: str
    alerts: List[str]
    recommendations: List[str]

# --- Lógica do Módulo ---
@router.post("/summary", response_model=DashboardSummary)
def get_daily_summary(user: UserProfile, mental_score: int = 0, physical_readiness: int = 0):
    """
    Gera o resumo do painel inicial.
    Aqui é onde você implementará algoritmos complexos de correlação entre
    os dados do usuário para mostrar insights na Home.
    """
    today = datetime.date.today()
    summary = {
        "date": str(today),
        "status": "Normal",
        "alerts": [],
        "recommendations": []
    }

    # Exemplo de Lógica Python: Detecção de Risco de Mania
    # Se o paciente relata energia muito alta (ex: > 8) mas dormiu pouco, é um alerta.
    if mental_score > 80: # Exemplo arbitrário
        summary['status'] = "Atenção"
        summary['alerts'].append("Risco Elevado de Mania Detectado")
        summary['recommendations'].append("Contate seu médico imediatamente.")

    # Lógica para Treino
    if physical_readiness > 8:
        summary['recommendations'].append("Alta prontidão física! Dia bom para carga alta.")
    elif physical_readiness < 4:
        summary['recommendations'].append("Corpo fadigado. Considere descanso ativo.")

    return summary

@router.get("/menu")
def get_user_menu(role: str):
    """
    Retorna as opções de menu baseadas no perfil (Role Based Access Control).
    """
    menu = [
        {"name": "Home", "path": "/dashboard", "icon": "home"},
    ]
    
    # Todos têm acesso a Spravato e Testes? Depende da regra de negócio.
    # Vamos assumir que sim por enquanto.
    menu.append({"name": "Spravato", "path": "/spravato/new", "icon": "syringe"})
    menu.append({"name": "Testes (Avaliação)", "path": "/assessment", "icon": "activity"})
    menu.append({"name": "Treinamento", "path": "/training/new", "icon": "dumbbell"})

    if role == 'doctor':
        menu.append({"name": "Pacientes", "path": "/patients", "icon": "users"})
    
    return menu
