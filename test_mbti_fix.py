#!/usr/bin/env python3
"""
Test script to verify the MBTI calculation fix works correctly
"""
import sys
import os

# Add the backend app to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from app.services.personality_service import map_answers_to_mbti, map_answers_to_mbti_likert
from app.services.question_service import STATIC_QUESTIONS

def test_mbti_variety():
    """Test that we can get different MBTI types instead of always ESTJ"""
    
    print("🧪 Testing MBTI Calculation Variety")
    print("=" * 50)
    
    # Test Case 1: Extreme Introvert responses
    print("\n1️⃣ Testing Extreme Introvert Responses")
    introvert_answers = {
        "I love spending time alone": "I really enjoy solitude and quiet reflection",
        "How do you work": "I work best alone in quiet environments", 
        "Social situations": "I find large groups draining and prefer small gatherings",
        "Decision making": "I think through things carefully before deciding"
    }
    result1 = map_answers_to_mbti(introvert_answers)
    print(f"Result: {result1} (should start with I)")
    
    # Test Case 2: Extreme Extravert responses  
    print("\n2️⃣ Testing Extreme Extravert Responses")
    extravert_answers = {
        "Energy source": "I get energized by being around people and talking",
        "Work style": "I love collaborating with teams and brainstorming together",
        "Social life": "I'm always organizing parties and social gatherings", 
        "Communication": "I think out loud and talk through problems with others"
    }
    result2 = map_answers_to_mbti(extravert_answers)
    print(f"Result: {result2} (should start with E)")
    
    # Test Case 3: Intuitive responses
    print("\n3️⃣ Testing Intuitive Responses") 
    intuitive_answers = {
        "Problem solving": "I focus on the big picture and future possibilities",
        "Learning": "I love exploring new concepts and abstract theories",
        "Work approach": "I get excited by innovative ideas and creative solutions",
        "Information": "I prefer understanding patterns over memorizing details"
    }
    result3 = map_answers_to_mbti(intuitive_answers)
    print(f"Result: {result3} (should have N)")
    
    # Test Case 4: Feeling responses
    print("\n4️⃣ Testing Feeling-oriented Responses")
    feeling_answers = {
        "Decision making": "I always consider how my choices will affect others",
        "Values": "I prioritize empathy and harmony in all my relationships", 
        "Conflict": "I try to find solutions that make everyone feel heard",
        "Motivation": "I'm driven by my values and helping people"
    }
    result4 = map_answers_to_mbti(feeling_answers)
    print(f"Result: {result4} (should have F)")
    
    # Test Case 5: Perceiving responses
    print("\n5️⃣ Testing Perceiving Responses")
    perceiving_answers = {
        "Planning": "I prefer to stay flexible and adapt as things change",
        "Work style": "I work in spontaneous bursts when I feel inspired", 
        "Deadlines": "I often work better under pressure and last minute",
        "Structure": "I like to explore options and keep things open-ended"
    }
    result5 = map_answers_to_mbti(perceiving_answers)
    print(f"Result: {result5} (should end with P)")
    
    # Test Case 6: Likert scale test (simulate balanced/neutral responses)
    print("\n6️⃣ Testing Likert Scale with Neutral Responses")
    # Create neutral responses (3 = neither agree nor disagree)
    neutral_responses = {q: 3 for q in STATIC_QUESTIONS}
    result6 = map_answers_to_mbti_likert(neutral_responses)
    print(f"Result: {result6} (should vary, not always ESTJ)")
    
    # Test Case 7: Multiple runs with neutral responses (should show variety)
    print("\n7️⃣ Testing Multiple Runs for Randomness")
    results = []
    for i in range(5):
        result = map_answers_to_mbti_likert(neutral_responses)
        results.append(result)
        print(f"Run {i+1}: {result}")
    
    unique_results = len(set(results))
    print(f"\n✅ Got {unique_results} different results out of 5 runs")
    if unique_results > 1:
        print("🎉 SUCCESS: The fix is working - we're getting variety!")
    else:
        print("❌ ISSUE: Still getting the same result every time")
    
    print("\n" + "=" * 50)
    print("Test completed!")

if __name__ == "__main__":
    test_mbti_variety()
