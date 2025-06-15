import numpy as np

def recovery_score(muscular: float, mental: float, sleep: float) -> float:
    return (muscular + mental + sleep) / 3

def recovery_percent(score: float) -> float:
    return (score / 10) * 100

def trimp(rpe: float, duration: float) -> float:
    return rpe * duration

def tss_from_trimp(trimp_val: float, trimp_max: float = 600) -> float:
    return (trimp_val / trimp_max) * 100

def exponential_moving_average(values: np.ndarray, alpha: float) -> np.ndarray:
    ema = np.zeros_like(values)
    ema[0] = values[0]
    for t in range(1, len(values)):
        ema[t] = alpha * values[t] + (1 - alpha) * ema[t-1]
    return ema

def calculate_atl(ts_s: np.ndarray) -> np.ndarray:
    alpha_a = 1 - np.exp(-1/7)
    return exponential_moving_average(ts_s, alpha_a)

def calculate_ctl(ts_s: np.ndarray) -> np.ndarray:
    alpha_c = 1 - np.exp(-1/42)
    return exponential_moving_average(ts_s, alpha_c)

def tsb(ctl: np.ndarray, atl: np.ndarray) -> np.ndarray:
    return ctl - atl

def daily_pain(scores: list) -> float:
    return float(np.mean(scores))

def emotional_score(b: float, v: float, f: float, e: float, a: float) -> float:
    return ((b + v + f) - (e + a)) / 5 + 5

def dass21_subscore(items: list) -> float:
    return 2 * sum(items)

def flow_score(raw_scores: list) -> float:
    s = sum(raw_scores)
    return (s - 9) / 36 * 10
