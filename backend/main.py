from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.modules import home, spravato, training, tests

app = FastAPI(title="Synthonia API", description="Backend em Python para Lógica Avançada de Saúde")

# Configuração de CORS para permitir que o Frontend React acesse
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Em produção, troque pelo domínio do Netlify
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclusão das Rotas (Módulos)
app.include_router(home.router, prefix="/api/home", tags=["Home"])
app.include_router(spravato.router, prefix="/api/spravato", tags=["Spravato"])
app.include_router(training.router, prefix="/api/training", tags=["Treinamento"])
app.include_router(tests.router, prefix="/api/tests", tags=["Testes"])

@app.get("/")
def read_root():
    return {"message": "Synthonia Python Backend is Running 🚀"}
