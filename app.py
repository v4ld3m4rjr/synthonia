import streamlit as st
from auth import show_auth
from supabase_client import insert_daily_data, fetch_series
from calculations import (
    recovery_score, recovery_percent,
    trimp, tss_from_trimp,
    calculate_atl, calculate_ctl, tsb,
    daily_pain, emotional_score
)
import pandas as pd
import numpy as np

st.set_page_config(
    page_title="SynthonIA Dashboard",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Logo
st.sidebar.image("assets/logo.png", use_column_width=True)

# Autenticação
user = show_auth()
if not user:
    st.stop()

# Menu
tab = st.sidebar.radio("Selecione módulo", [
    "Dados do Dia", "Recuperação", "Carga de Treino",
    "Saúde & Dor", "Dashboard"
])

if tab == "Dados do Dia":
    st.header("📅 Dados do Dia")
    st.write("Aqui você registra sono, energia, estresse, humor, dor e treino.")
    date = st.date_input("Data")
    sleep = st.slider("Sono (0–10)", 0, 10, 5)
    energy = st.slider("Energia (0–10)", 0, 10, 5)
    stress = st.slider("Estresse (0–10)", 0, 10, 5)
    mood = st.slider("Humor (0–10)", 0, 10, 5)
    pain_scores = st.multiselect("Dor (0–10) por região", list(range(11)), default=[0])
    rpe = st.slider("RPE (0–10)", 0, 10, 5)
    duration = st.number_input("Duração treino (min)", 0, 300, 60)
    if st.button("Salvar Dados"):
        data = {"date": date.isoformat(), "sleep": sleep, "energy": energy,
                "stress": stress, "mood": mood,
                "pain": daily_pain(pain_scores), "rpe": rpe, "duration": duration}
        insert_daily_data("daily_metrics", data)
        st.success("Dados salvos com sucesso!")

elif tab == "Recuperação":
    st.header("🔄 Recuperação")
    st.write("Avalie sua prontidão muscular, mental e de sono.")
    muscular = st.slider("Muscular (0–10)", 0, 10, 5)
    mental = st.slider("Mental (0–10)", 0, 10, 5)
    sleep_rec = st.slider("Sono (0–10)", 0, 10, 5)
    if st.button("Calcular Recovery"):
        score = recovery_score(muscular, mental, sleep_rec)
        pct = recovery_percent(score)
        st.metric("Score", f"{score:.1f}")
        st.metric("% Recuperação", f"{pct:.0f}%")

elif tab == "Carga de Treino":
    st.header("🏋️ Carga de Treino")
    st.write("Calcule TRIMP, TSS e veja ATL/CTL/TSB.")
    rpe = st.slider("RPE (0–10)", 0, 10, 5)
    duration = st.number_input("Duração (min)", 0, 300, 60)
    if st.button("Executar Cálculos"):
        tr = trimp(rpe, duration)
        tss = tss_from_trimp(tr)
        hist = np.array([d['TSS'] for d in fetch_series("daily_training","TSS", days=42)])
        atl = calculate_atl(hist)
        ctl = calculate_ctl(hist)
        tsb_vals = tsb(ctl, atl)
        st.write(f"TRIMP: {tr:.1f}")
        st.write(f"TSS: {tss:.1f}")
        st.line_chart(pd.DataFrame({'ATL': atl, 'CTL': ctl, 'TSB': tsb_vals}))

elif tab == "Saúde & Dor":
    st.header("🩺 Saúde & Dor")
    st.write("Mapa de dor e estado emocional.")
    pain_scores = st.multiselect("Dor (0–10)", list(range(11)), default=[0])
    b = st.slider("Bem-estar (0–10)", 0, 10, 5)
    v = st.slider("Motivação (0–10)", 0, 10, 5)
    f = st.slider("Foco (0–10)", 0, 10, 5)
    e = st.slider("Estresse (0–10)", 0, 10, 5)
    a = st.slider("Ansiedade (0–10)", 0, 10, 5)
    if st.button("Calcular Saúde & Dor"):
        pain = daily_pain(pain_scores)
        emo = emotional_score(b, v, f, e, a)
        st.metric("Dor Média", f"{pain:.1f}")
        st.metric("Emocional", f"{emo:.1f}")

else:
    st.header("📊 Dashboard")
    st.write("Visualize tendências dos últimos 30 dias.")
    opts = st.multiselect("Variáveis", ["Recovery","TSS","Dor","Emocional"], default=["Recovery"])
    dfs = {opt: pd.DataFrame(fetch_series("daily_metrics", opt, days=30)) for opt in opts}
    df = pd.concat(dfs.values(), axis=1)
    st.line_chart(df)
    st.write("Insights automáticos em breve...")
