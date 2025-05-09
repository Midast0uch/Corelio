"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LogoWithText } from "@/components/ui/logo"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, ChevronDown, ChevronUp, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import AIChatbot from "@/components/ai-chatbot"

interface InteractivePlanDisplayProps {
  userData: any
  workoutPlan?: any
  mealPlan?: any
  isLoading?: boolean
  error?: string | null
}

export default function InteractivePlanDisplay({
  userData,
  workoutPlan: customWorkoutPlan,
  mealPlan: customMealPlan,
  isLoading = false,
  error = null,
}: InteractivePlanDisplayProps) {
  // Default workout plan if AI-generated plan is not available
  const defaultWorkoutPlan = {
    monday: {
      title: "Upper Body Strength",
      exercises: [
        {
          name: "Push-ups",
          sets: 3,
          reps: "10-12",
          rest: "60 sec",
          description: "Keep your core tight and lower your chest to just above the ground.",
        },
        {
          name: "Dumbbell Rows",
          sets: 3,
          reps: "10-12",
          rest: "60 sec",
          description: "Pull the weight towards your hip, keeping your back straight.",
        },
        {
          name: "Shoulder Press",
          sets: 3,
          reps: "8-10",
          rest: "90 sec",
          description: "Press the weights directly overhead, fully extending your arms.",
        },
        {
          name: "Bicep Curls",
          sets: 3,
          reps: "12-15",
          rest: "60 sec",
          description: "Keep your elbows close to your sides and curl the weights up.",
        },
        {
          name: "Tricep Dips",
          sets: 3,
          reps: "12-15",
          rest: "60 sec",
          description: "Lower yourself until your elbows are at 90 degrees, then push back up.",
        },
      ],
    },
    tuesday: {
      title: "Cardio & Core",
      exercises: [
        {
          name: "Jogging/Running",
          duration: "20 min",
          intensity: "Moderate",
          description: "Maintain a pace where you can still hold a conversation.",
        },
        {
          name: "Plank",
          sets: 3,
          duration: "30-45 sec",
          rest: "30 sec",
          description: "Keep your body in a straight line from head to heels.",
        },
        {
          name: "Russian Twists",
          sets: 3,
          reps: "20 (10 each side)",
          rest: "45 sec",
          description: "Rotate your torso from side to side, touching the ground with your hands.",
        },
        {
          name: "Mountain Climbers",
          sets: 3,
          duration: "30 sec",
          rest: "30 sec",
          description: "Drive your knees toward your chest in an alternating fashion.",
        },
        {
          name: "Leg Raises",
          sets: 3,
          reps: "12-15",
          rest: "45 sec",
          description: "Keep your lower back pressed into the floor as you raise and lower your legs.",
        },
      ],
    },
    wednesday: {
      title: "Rest Day",
      exercises: [
        {
          name: "Light Stretching",
          duration: "15-20 min",
          description: "Focus on areas that feel tight or sore from previous workouts.",
        },
        {
          name: "Walking",
          duration: "20-30 min",
          intensity: "Low",
          description: "A casual walk to promote blood flow and recovery.",
        },
      ],
    },
    thursday: {
      title: "Lower Body Strength",
      exercises: [
        {
          name: "Squats",
          sets: 3,
          reps: "12-15",
          rest: "90 sec",
          description: "Keep your weight in your heels and lower until your thighs are parallel to the ground.",
        },
        {
          name: "Lunges",
          sets: 3,
          reps: "10 each leg",
          rest: "60 sec",
          description:
            "Step forward and lower your back knee toward the ground, keeping your front knee over your ankle.",
        },
        {
          name: "Glute Bridges",
          sets: 3,
          reps: "15-20",
          rest: "60 sec",
          description: "Squeeze your glutes at the top of the movement and hold briefly.",
        },
        {
          name: "Calf Raises",
          sets: 3,
          reps: "15-20",
          rest: "45 sec",
          description: "Rise up onto your toes, then lower your heels back to the ground.",
        },
        {
          name: "Wall Sit",
          sets: 3,
          duration: "30-45 sec",
          rest: "45 sec",
          description: "Keep your back flat against the wall and thighs parallel to the ground.",
        },
      ],
    },
    friday: {
      title: "Full Body HIIT",
      exercises: [
        {
          name: "Jumping Jacks",
          sets: 4,
          duration: "30 sec",
          rest: "15 sec",
          description: "Jump your feet out while raising your arms overhead, then return to starting position.",
        },
        {
          name: "Burpees",
          sets: 4,
          duration: "30 sec",
          rest: "15 sec",
          description: "Drop to a push-up position, perform a push-up, jump your feet forward, then jump up.",
        },
        {
          name: "High Knees",
          sets: 4,
          duration: "30 sec",
          rest: "15 sec",
          description: "Run in place, bringing your knees up to hip level with each step.",
        },
        {
          name: "Jump Squats",
          sets: 4,
          duration: "30 sec",
          rest: "15 sec",
          description: "Perform a squat, then explode upward into a jump, landing softly back into the squat position.",
        },
        { name: "Rest", duration: "2 min", description: "Take a full rest before repeating the circuit." },
        { name: "Repeat circuit once more", description: "Complete all exercises again in the same order." },
      ],
    },
    saturday: {
      title: "Active Recovery",
      exercises: [
        {
          name: "Yoga or Pilates",
          duration: "30-45 min",
          description: "Focus on breathing and gentle movements to promote recovery.",
        },
        {
          name: "Foam Rolling",
          duration: "10-15 min",
          description: "Target major muscle groups, spending extra time on sore areas.",
        },
      ],
    },
    sunday: {
      title: "Rest Day",
      exercises: [
        { name: "Complete Rest", description: "Allow your body to fully recover before starting the next week." },
        {
          name: "Light Walking (optional)",
          duration: "20-30 min",
          description: "If desired, a casual walk can promote blood flow without taxing your system.",
        },
      ],
    },
  }

  // Default meal plan if AI-generated plan is not available
  const defaultMealPlan = {
    breakfast: {
      title: "Breakfast",
      meal: "Protein Oatmeal Bowl",
      ingredients: [
        "1/2 cup rolled oats",
        "1 cup almond milk",
        "1 scoop protein powder",
        "1 tbsp chia seeds",
        "1/2 banana, sliced",
        "1 tbsp almond butter",
        "Sprinkle of cinnamon",
      ],
      nutrition: {
        calories: 420,
        protein: "25g",
        carbs: "45g",
        fat: "18g",
      },
      instructions:
        "Cook oats with almond milk according to package directions. Stir in protein powder, chia seeds, and cinnamon. Top with banana slices and almond butter.",
      benefits: "This breakfast provides complex carbs for sustained energy and protein for muscle recovery.",
    },
    snack1: {
      title: "Morning Snack",
      meal: "Greek Yogurt Parfait",
      ingredients: ["1 cup Greek yogurt", "1/4 cup berries", "1 tbsp honey", "2 tbsp granola"],
      nutrition: {
        calories: 220,
        protein: "20g",
        carbs: "25g",
        fat: "5g",
      },
      instructions: "Layer Greek yogurt, berries, and granola in a bowl or jar. Drizzle with honey.",
      benefits: "Greek yogurt provides protein to keep you full, while berries offer antioxidants.",
    },
    lunch: {
      title: "Lunch",
      meal: "Chicken & Quinoa Bowl",
      ingredients: [
        "4 oz grilled chicken breast",
        "1/2 cup cooked quinoa",
        "1 cup mixed vegetables (broccoli, bell peppers, carrots)",
        "1 tbsp olive oil",
        "1 tsp herbs and spices",
        "1/4 avocado, sliced",
      ],
      nutrition: {
        calories: 450,
        protein: "35g",
        carbs: "30g",
        fat: "20g",
      },
      instructions:
        "Cook quinoa according to package directions. Grill chicken with herbs and spices. Sauté vegetables in olive oil. Combine in a bowl and top with avocado slices.",
      benefits: "This balanced meal provides lean protein, complex carbs, and healthy fats to fuel your afternoon.",
    },
    snack2: {
      title: "Afternoon Snack",
      meal: "Protein Smoothie",
      ingredients: [
        "1 scoop protein powder",
        "1 cup spinach",
        "1/2 banana",
        "1 cup almond milk",
        "1 tbsp flaxseed",
        "Ice cubes",
      ],
      nutrition: {
        calories: 230,
        protein: "25g",
        carbs: "20g",
        fat: "7g",
      },
      instructions: "Blend all ingredients until smooth. Add more liquid if needed to reach desired consistency.",
      benefits: "This smoothie provides protein and nutrients to prevent afternoon energy crashes.",
    },
    dinner: {
      title: "Dinner",
      meal: "Baked Salmon with Roasted Vegetables",
      ingredients: [
        "5 oz salmon fillet",
        "1 cup roasted vegetables (sweet potato, zucchini, asparagus)",
        "1 tbsp olive oil",
        "Herbs and spices to taste",
        "1/2 cup brown rice",
      ],
      nutrition: {
        calories: 480,
        protein: "30g",
        carbs: "35g",
        fat: "22g",
      },
      instructions:
        "Season salmon with herbs and spices. Bake at 400°F for 12-15 minutes. Toss vegetables in olive oil and roast until tender. Serve with cooked brown rice.",
      benefits: "Salmon provides omega-3 fatty acids for heart health and inflammation reduction.",
    },
  }

  // Use custom plans if available, otherwise use defaults
  const workoutPlan = customWorkoutPlan || defaultWorkoutPlan
  const mealPlan = customMealPlan || defaultMealPlan

  // State for expanded exercise details
  const [expandedExercises, setExpandedExercises] = useState<Record<string, boolean>>({})
  const [expandedMeals, setExpandedMeals] = useState<Record<string, boolean>>({})

  const toggleExerciseDetails = (day: string, index: number) => {
    const key = `${day}-${index}`
    setExpandedExercises((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const toggleMealDetails = (mealTime: string) => {
    setExpandedMeals((prev) => ({
      ...prev,
      [mealTime]: !prev[mealTime],
    }))
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-center mb-8">
        <LogoWithText />
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Generating your personalized plans...</p>
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="workout" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8 bg-secondary">
          <TabsTrigger value="workout" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            Workout Plan
          </TabsTrigger>
          <TabsTrigger value="meal" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            Meal Plan
          </TabsTrigger>
        </TabsList>

        <TabsContent value="workout" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(workoutPlan).map(([day, plan]: [string, any]) => (
              <Card key={day} className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="bg-secondary/50">
                  <CardTitle className="capitalize">{day}</CardTitle>
                  <CardDescription>{plan.title}</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <ul className="space-y-4">
                    {plan.exercises.map((exercise: any, index: number) => (
                      <li key={index} className="border-b pb-2 last:border-0 last:pb-0">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-medium">{exercise.name}</div>
                            <div className="text-sm text-gray-500">
                              {exercise.sets && exercise.reps && (
                                <span>
                                  {exercise.sets} sets × {exercise.reps}
                                </span>
                              )}
                              {exercise.sets && exercise.duration && (
                                <span>
                                  {exercise.sets} sets × {exercise.duration}
                                </span>
                              )}
                              {!exercise.sets && exercise.duration && <span>Duration: {exercise.duration}</span>}
                              {exercise.intensity && <span> • Intensity: {exercise.intensity}</span>}
                              {exercise.rest && <span> • Rest: {exercise.rest}</span>}
                            </div>
                          </div>
                          {exercise.description && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-0 h-8 w-8"
                              onClick={() => toggleExerciseDetails(day, index)}
                              aria-label={expandedExercises[`${day}-${index}`] ? "Hide details" : "Show details"}
                            >
                              {expandedExercises[`${day}-${index}`] ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                        </div>
                        <AnimatePresence>
                          {expandedExercises[`${day}-${index}`] && exercise.description && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="mt-2 text-sm bg-gray-50 p-3 rounded-md"
                            >
                              <div className="flex items-start">
                                <Info className="h-4 w-4 text-primary mr-2 mt-0.5" />
                                <p>{exercise.description}</p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="bg-accent p-4 rounded-lg border border-primary/20 mt-8">
            <h3 className="font-medium text-primary mb-2">Workout Notes</h3>
            <p className="text-primary/80 text-sm">
              This workout plan is designed based on your fitness level ({userData.fitnessLevel}), available time (
              {userData.timeAvailable}), and physical attributes (height: {userData.height}, weight: {userData.weight}).
              Adjust weights and intensity as needed. Always warm up before and cool down after each session.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="meal" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(mealPlan).map(([mealTime, meal]: [string, any]) => (
              <Card key={mealTime} className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="bg-secondary/50 pb-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>{meal.title}</CardTitle>
                      <CardDescription>{meal.meal}</CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-0 h-8 w-8"
                      onClick={() => toggleMealDetails(mealTime)}
                      aria-label={expandedMeals[mealTime] ? "Hide details" : "Show details"}
                    >
                      {expandedMeals[mealTime] ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <h4 className="font-medium mb-2">Ingredients:</h4>
                  <ul className="list-disc pl-5 mb-4 space-y-1">
                    {meal.ingredients.map((ingredient: string, index: number) => (
                      <li key={index} className="text-sm">
                        {ingredient}
                      </li>
                    ))}
                  </ul>

                  <AnimatePresence>
                    {expandedMeals[mealTime] && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {meal.instructions && (
                          <div className="mb-4">
                            <h4 className="font-medium mb-1 text-sm">Instructions:</h4>
                            <p className="text-sm">{meal.instructions}</p>
                          </div>
                        )}

                        {meal.benefits && (
                          <div className="mb-4 bg-accent/50 p-3 rounded-md">
                            <h4 className="font-medium mb-1 text-sm">Benefits:</h4>
                            <p className="text-sm">{meal.benefits}</p>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="bg-gray-100 p-3 rounded-md mt-3">
                    <h4 className="font-medium mb-1 text-sm">Nutrition Info:</h4>
                    <div className="grid grid-cols-4 gap-2 text-xs">
                      <div>
                        <div className="font-medium">Calories</div>
                        <div>{meal.nutrition.calories}</div>
                      </div>
                      <div>
                        <div className="font-medium">Protein</div>
                        <div>{meal.nutrition.protein}</div>
                      </div>
                      <div>
                        <div className="font-medium">Carbs</div>
                        <div>{meal.nutrition.carbs}</div>
                      </div>
                      <div>
                        <div className="font-medium">Fat</div>
                        <div>{meal.nutrition.fat}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="bg-accent p-4 rounded-lg border border-primary/20 mt-8">
            <h3 className="font-medium text-primary mb-2">Meal Plan Notes</h3>
            <p className="text-primary/80 text-sm">
              This meal plan is tailored to your food preferences ({userData.foodPreferences}), calorie needs (
              {userData.dailyCalorieIntake}), and physical attributes (height: {userData.height}, weight:{" "}
              {userData.weight}). Adjust portion sizes as needed to meet your specific goals. Stay hydrated by drinking
              at least 8 glasses of water daily.
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {/* AI Chatbot */}
      <AIChatbot userData={userData} />
    </div>
  )
}
