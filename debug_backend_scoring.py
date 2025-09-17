#!/usr/bin/env python3

STATIC_QUESTIONS = [
    # Extraversion (E) vs Introversion (I)
    "You gain energy more from being with people than spending time alone.",
    "You feel comfortable walking up to a stranger and starting a conversation.",
    "You enjoy participating in team-based activities more than solitary ones.",
    "At social gatherings, you usually wait for others to approach you first.",  # reverse polarity

    # Sensing (S) vs Intuition (N)
    "You trust facts and details more than abstract theories.",
    "Complex and novel ideas excite you more than simple and straightforward ones.",
    "You prefer practical discussions over highly theoretical ones.",
    "You enjoy exploring unfamiliar ideas and future possibilities.",

    # Thinking (T) vs Feeling (F)
    "You prioritize logic and fairness over personal feelings when making decisions.",
    "People's stories and emotions speak louder to you than numbers or data.",
    "In disagreements, you focus more on proving your point than preserving harmony.",
    "You usually find yourself following your heart rather than pure facts.",

    # Judging (J) vs Perceiving (P)
    "You like to have your day planned out with lists and schedules.",
    "You often allow the day to unfold without any fixed plan.",
    "You prefer to finish tasks well before the deadline.",
    "Your work style is closer to spontaneous bursts of energy than consistent routines.",
]

def map_answers_to_mbti_likert(answers):
    # Initialize axis totals
    E = I = S = N = T = F = J = P = 0

    # Index sets per axis (0-based indices in STATIC_QUESTIONS)
    ei_e_indices = {0, 1, 2}  # E phrased
    ei_i_indices = {3}        # I phrased (reverse of E)

    sn_s_indices = {4, 6}     # S phrased
    sn_n_indices = {5, 7}     # N phrased

    tf_t_indices = {8, 10}    # T phrased
    tf_f_indices = {9, 11}    # F phrased

    jp_j_indices = {12, 14}   # J phrased
    jp_p_indices = {13, 15}   # P phrased

    # Build lookup from text -> index (exact match)
    text_to_index = {q: i for i, q in enumerate(STATIC_QUESTIONS)}

    for q_text, val in answers.items():
        try:
            v = int(val)
        except (TypeError, ValueError):
            continue
        if v < 1 or v > 5:
            continue
        idx = text_to_index.get(q_text)
        if idx is None:
            print(f"Unknown question: {q_text}")
            continue

        comp = 6 - v  # complementary score
        
        print(f"Q{idx}: \"{q_text[:50]}...\" -> {v} -> comp={comp}")

        if idx in ei_e_indices:
            E += v; I += comp
            print(f"  E-phrased: E+={v}, I+={comp} -> E={E}, I={I}")
        elif idx in ei_i_indices:
            I += v; E += comp
            print(f"  I-phrased: I+={v}, E+={comp} -> E={E}, I={I}")

        if idx in sn_s_indices:
            S += v; N += comp
            print(f"  S-phrased: S+={v}, N+={comp}")
        elif idx in sn_n_indices:
            N += v; S += comp
            print(f"  N-phrased: N+={v}, S+={comp}")

        if idx in tf_t_indices:
            T += v; F += comp
            print(f"  T-phrased: T+={v}, F+={comp}")
        elif idx in tf_f_indices:
            F += v; T += comp
            print(f"  F-phrased: F+={v}, T+={comp}")

        if idx in jp_j_indices:
            J += v; P += comp
            print(f"  J-phrased: J+={v}, P+={comp}")
        elif idx in jp_p_indices:
            P += v; J += comp
            print(f"  P-phrased: P+={v}, J+={comp}")

    print(f"\nFinal scores: E={E}, I={I}, S={S}, N={N}, T={T}, F={F}, J={J}, P={P}")
    
    # Determine each axis
    ei_letter = "E" if E > I else "I"
    sn_letter = "S" if S > N else "N"
    tf_letter = "T" if T > F else "F"
    jp_letter = "J" if J > P else "P"
    
    letters = ei_letter + sn_letter + tf_letter + jp_letter
    
    print(f"Result: {letters}")
    return letters

# Test with extraverted answers
print("=== TESTING EXTRAVERTED ANSWERS ===\n")

extraverted_answers = {
    # E/I questions - favor extraversion
    STATIC_QUESTIONS[0]: 5,  # Strongly agree with E-question
    STATIC_QUESTIONS[1]: 5,  # Strongly agree with E-question  
    STATIC_QUESTIONS[2]: 5,  # Strongly agree with E-question
    STATIC_QUESTIONS[3]: 1,  # Strongly disagree with I-question
    
    # Other questions - neutral
    STATIC_QUESTIONS[4]: 3,
    STATIC_QUESTIONS[5]: 3,
    STATIC_QUESTIONS[6]: 3,
    STATIC_QUESTIONS[7]: 3,
    STATIC_QUESTIONS[8]: 3,
    STATIC_QUESTIONS[9]: 3,
    STATIC_QUESTIONS[10]: 3,
    STATIC_QUESTIONS[11]: 3,
    STATIC_QUESTIONS[12]: 3,
    STATIC_QUESTIONS[13]: 3,
    STATIC_QUESTIONS[14]: 3,
    STATIC_QUESTIONS[15]: 3,
}

result = map_answers_to_mbti_likert(extraverted_answers)

if result[0] == 'E':
    print("✅ SUCCESS: Got E as expected")
else:
    print(f"❌ FAILURE: Expected E but got {result[0]}")
