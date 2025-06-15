from supabase import create_client
from dotenv import load_dotenv
import os

load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Autenticação
def sign_up(email: str, password: str):
    return client.auth.sign_up({"email": email, "password": password})

def sign_in(email: str, password: str):
    return client.auth.sign_in({"email": email, "password": password})

def reset_password(email: str):
    return client.auth.api.reset_password_for_email(email)

# Dados Gerais
def insert_daily_data(table: str, data: dict):
    return client.table(table).insert(data).execute().data

def fetch_series(table: str, column: str, days: int = None):
    q = client.table(table).select(f"{column},date").order("date", desc=False)
    if days:
        from datetime import date, timedelta
        cutoff = (date.today() - timedelta(days=days)).isoformat()
        q = q.filter("date", ">=", cutoff)
    return q.execute().data
