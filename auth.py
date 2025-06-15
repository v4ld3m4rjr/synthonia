import streamlit as st
from supabase_client import sign_in, sign_up, reset_password

# Exibe telas de autenticação e retorna usuário se logado
def show_auth():
    if 'user' not in st.session_state:
        st.session_state['user'] = None
    choice = st.sidebar.selectbox(
        "Autenticação", ["Login", "Cadastro", "Recuperar Senha"]
    )
    if choice == "Login":
        st.subheader("🔑 Login")
        st.write("Entre com seu e-mail e senha para acessar o aplicativo.")
        email = st.text_input("E-mail")
        password = st.text_input("Senha", type="password")
        if st.button("Entrar"):
            res = sign_in(email, password)
            if res.get("user"):
                st.session_state['user'] = res['user']
                st.success("Login realizado com sucesso!")
            else:
                st.error("Falha no login. Verifique e-mail e senha.")
    elif choice == "Cadastro":
        st.subheader("📝 Cadastro")
        st.write("Crie sua conta para começar a registrar seus dados.")
        email = st.text_input("E-mail", key="signup_email")
        password = st.text_input("Senha", type="password", key="signup_pass")
        if st.button("Cadastrar"):
            res = sign_up(email, password)
            if res.get("user"):
                st.success("Conta criada! Verifique seu e-mail para confirmação.")
            else:
                st.error("Falha no cadastro. Tente novamente.")
    else:
        st.subheader("🔄 Recuperar Senha")
        st.write("Forneça seu e-mail para receber o link de redefinição.")
        email = st.text_input("E-mail", key="reset_email")
        if st.button("Enviar Link"):
            res = reset_password(email)
            if res:
                st.success("Link de recuperação enviado ao seu e-mail.")
            else:
                st.error("Falha ao enviar o link. Tente novamente.")
    return st.session_state['user']
