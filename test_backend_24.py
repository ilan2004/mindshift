#!/usr/bin/env python3

# Updated 24-item questions (matches frontend)
STATIC_QUESTIONS = [
    # E vs I (6)
    # E-leaning (agree => E)
    "You gain energy from being around people and external activity.",
    "You prefer discussing ideas out loud rather than reflecting silently.",
    "You are quick to engage and speak up in group settings.",
    # I-leaning (agree => I)
    "You feel refreshed after spending time alone with your thoughts.",
    "You often think through an idea fully before sharing it.",
    "You prefer a few close friends over a wide circle of acquaintances.",

    # S vs N (6)
    # S-leaning (agree => S)
    "You rely on concrete facts and past experience when solving problems.",
    "You are attentive to practical details in day-to-day tasks.",
    "You prefer step-by-step instructions over open-ended exploration.",
    # N-leaning (agree => N)
    "You're drawn to patterns, possibilities, and big-picture connections.",
    "You enjoy brainstorming novel ideas and future scenarios.",
    "You often interpret information beyond what is explicitly stated.",

    # T vs F (6)
    # T-leaning (agree => T)
    "You prioritize objective criteria over personal values when deciding.",
    "You feel comfortable giving candid, critical feedback when needed.",
    "In debates, you value accuracy more than maintaining harmony.",
    # F-leaning (agree => F)
    "You consider the impact on people as much as the logic of a decision.",
    "You strive to create consensus and preserve relationships.",
    "You tend to empathize and see multiple personal perspectives.",

    # J vs P (6)
    # J-leaning (agree => J)
    "You like to plan ahead and close decisions rather than keep options open.",
    "You feel satisfied when tasks are completed well before deadlines.",
    "You prefer clear structure, schedules, and defined expectations.",
    # P-leaning (agree => P)
    "You enjoy keeping options open and adapting plans as things change.",
    "You're productive in flexible, spontaneous bursts rather than steady routines.",
    "You're comfortable starting before everything is fully defined.",
]

def map_answers_to_mbti_likert(answers):
    # Initialize axis totals
    E = I = S = N = T = F = J = P = 0

    # Index sets per axis for 24-item MBTI questions (0-based indices in STATIC_QUESTIONS)
    ei_e_indices = {0, 1, 2}     # E-leaning questions (indices 0-2)
    ei_i_indices = {3, 4, 5}     # I-leaning questions (indices 3-5)

    sn_s_indices = {6, 7, 8}     # S-leaning questions (indices 6-8)
    sn_n_indices = {9, 10, 11}   # N-leaning questions (indices 9-11)

    tf_t_indices = {12, 13, 14}  # T-leaning questions (indices 12-14)
    tf_f_indices = {15, 16, 17}  # F-leaning questions (indices 15-17)

    jp_j_indices = {18, 19, 20}  # J-leaning questions (indices 18-20)
    jp_p_indices = {21, 22, 23}  # P-leaning questions (indices 21-23)

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
            print(f"Unknown question: {q_text[:50]}...")
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

# Test with extraverted answers for all E-leaning questions
print("=== TESTING EXTRAVERTED ANSWERS WITH 24-ITEM QUESTIONS ===\n")

extraverted_answers = {}
for i, question in enumerate(STATIC_QUESTIONS):
    if i in {0, 1, 2}:  # E-leaning questions
        extraverted_answers[question] = 5  # Strongly agree
        print(f"Q{i} (E-leaning): Strongly Agree (5)")
    elif i in {3, 4, 5}:  # I-leaning questions  
        extraverted_answers[question] = 1  # Strongly disagree
        print(f"Q{i} (I-leaning): Strongly Disagree (1)")
    else:
        extraverted_answers[question] = 3  # Neutral for other dimensions
        
print()
result = map_answers_to_mbti_likert(extraverted_answers)

if result[0] == 'E':
    print("✅ SUCCESS: Got E as expected")
else:
    print(f"❌ FAILURE: Expected E but got {result[0]}")
