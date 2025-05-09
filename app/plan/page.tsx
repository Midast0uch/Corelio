"use client"; // Add this directive at the very top

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context'; // Assuming your AuthProvider provides a useAuth hook
import { db } from '@/lib/firebase'; // Assuming you have a firebase config file at lib/firebase.ts
import { doc, getDoc, DocumentData } from 'firebase/firestore';
import { generateWorkoutPlan, generateMealPlan } from '@/lib/openai'; // Import both functions

const PlanPage = () => {
  const { user, loading } = useAuth(); // Get user and loading state from your auth context
  const router = useRouter();

  const [userData, setUserData] = useState<DocumentData | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [workoutPlan, setWorkoutPlan] = useState<any>(null); // Adjust type based on expected plan structure
  const [mealPlan, setMealPlan] = useState<any>(null); // Adjust type based on expected plan structure
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        // If user is not logged in and not currently loading, redirect to onboarding
        if (!loading) {
          router.push("/onboarding");
        }
        return; // Stop execution if no user
      }

      setDataLoading(true);
      setError(null); // Clear previous errors

      try {
        const userDocRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
          const userData = docSnap.data();
          setUserData(userData);
          setDataLoading(false);

          // Format the userData object into a string prompt for the API
          const userPrompt = `Create a detailed workout and meal plan for a user with the following profile:\n
- Fitness Level: ${userData.fitnessLevel}\n
- Goals: ${userData.goals}\n
- Dietary Restrictions: ${userData.dietaryRestrictions}\n
- Preferred Workout Types: ${userData.preferredWorkoutTypes}\n
- Available Time Per Day: ${userData.timeAvailable}\n
- Equipment Available: ${userData.equipmentAvailable}\n
- Any Health Conditions: ${userData.healthConditions}\n
- Age: ${userData.age}\n
- Weight: ${userData.weight} lbs\n
- Height: ${userData.height} inches\n
- Gender: ${userData.gender}\n
- Activity Level: ${userData.activityLevel}\n
- Sleep Hours: ${userData.sleepHours}\n
- Stress Level: ${userData.stressLevel}\n
- Current Eating Habits: ${userData.currentEatingHabits}\n
- Hydration Level: ${userData.hydrationLevel}\n
- Motivation Level: ${userData.motivationLevel}\n
- Previous Exercise Experience: ${userData.previousExerciseExperience}\n
- Preferred Meal Types: ${userData.preferredMealTypes}\n
- Meal Frequency: ${userData.mealFrequency}\n
- Snack Preferences: ${userData.snackPreferences}\n
- Hydration Habits: ${userData.hydrationHabits}\n
- Stress Management Techniques: ${userData.stressManagementTechniques}\n
- Sleep Quality: ${userData.sleepQuality}\n
- Energy Levels: ${userData.energyLevels}\n
- Barriers To Fitness: ${userData.barriersToFitness}\n
- Exercise Preferences: ${userData.exercisePreferences}\n
- Learning Style: ${userData.learningStyle}
`;

          setAiLoading(true);

          try {
            const workoutPlanResponse = await generateWorkoutPlan(userPrompt);
            const mealPlanResponse = await generateMealPlan(userPrompt);

            setWorkoutPlan(workoutPlanResponse);
            setMealPlan(mealPlanResponse);
            setError(null);

          } catch (apiError: any) {
            console.error("Error generating plans:", apiError);
            setError(`Error generating plans: ${apiError.message}`);
            setWorkoutPlan(null);
            setMealPlan(null);
          } finally {
            setAiLoading(false);
          }

        } else {
          console.log("No such document!");
          setError("User data not found.");
          setUserData(null); // Set user data to null if document doesn't exist
          setDataLoading(false);
          setAiLoading(false);
          router.push("/onboarding"); // Redirect if data is missing
        }
      } catch (firebaseError: any) {
        console.error("Error fetching user data:", firebaseError);
        setError(`Error fetching user data: ${firebaseError.message}`);
        setDataLoading(false);
        setAiLoading(false);
      }
    };

    if (user || !loading) { // Fetch if user is available or if loading is complete (meaning no user)
      fetchUserData();
    }

  }, [user, loading, router]); // Dependencies for useEffect

  if (dataLoading) {
    return <div>Loading user data...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (aiLoading) {
    return <div>Generating your plan...</div>;
  }

  if (workoutPlan && mealPlan) {
    return (
      <div>
        <h1>Your Personalized Plan</h1>
        <h2>Workout Plan</h2>
        <pre>{JSON.stringify(workoutPlan, null, 2)}</pre> {/* Display workout plan */}
        <h2>Meal Plan</h2>
        <pre>{JSON.stringify(mealPlan, null, 2)}</pre> {/* Display meal plan */}
      </div>
    );
  }

  // Fallback if no plan is available
  return <div>No plan available. Please complete onboarding.</div>;
};

export default PlanPage;
