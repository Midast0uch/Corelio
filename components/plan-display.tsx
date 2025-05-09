"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LogoWithText } from "@/components/ui/logo"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface PlanDisplayProps {
  userData: any
  workoutPlan?: any
  mealPlan?: any
  isLoading?: boolean
  error?: string | null
}

export default function PlanDisplay({
  userData,
  workoutPlan: customWorkoutPlan,
  mealPlan: customMealPlan,
  isLoading = false,
  error = null,
}: PlanDisplayProps) {
  // Default workout plan if AI-generated plan is not available
  const defaultWorkoutPlan = {
    monday: {
      title: "Upper Body Strength",
      exercises: [
        { name: "Push-ups", sets: 3, reps: "10-12", rest: "60 sec" },
        { name: "Dumbbell Rows", sets: 3, reps: "10-12", rest: "60 sec" },
        { name: "Shoulder Press", sets: 3, reps: "8-10", rest: "90 sec" },
        { name: "Bicep Curls", sets: 3, reps: "12-15", rest: "60 sec" },
        { name: "Tricep Dips", sets: 3, reps: "12-15", rest: "60 sec" },
      ],
    },
    tuesday: {
      title: "Cardio & Core",
      exercises: [
        { name: "Jogging/Running", duration: "20 min", intensity: "Moderate" },
        { name: "Plank", sets: 3, duration: "30-45 sec", rest: "30 sec" },
        { name: "Russian Twists", sets: 3, reps: "20 (10 each side)", rest: "45 sec" },
        { name: "Mountain Climbers", sets: 3, duration: "30 sec", rest: "30 sec" },
        { name: "Leg Raises", sets: 3, reps: "12-15", rest: "45 sec" },
      ],
    },
    wednesday: {
      title: "Rest Day",
      exercises: [
        { name: "Light Stretching", duration: "15-20 min" },
        { name: "Walking", duration: "20-30 min", intensity: "Low" },
      ],
    },
    thursday: {
      title: "Lower Body Strength",
      exercises: [
        { name: "Squats", sets: 3, reps: "12-15", rest: "90 sec" },
        { name: "Lunges", sets: 3, reps: "10 each leg", rest: "60 sec" },
        { name: "Glute Bridges", sets: 3, reps: "15-20", rest: "60 sec" },
        { name: "Calf Raises", sets: 3, reps: "15-20", rest: "45 sec" },
        { name: "Wall Sit", sets: 3, duration: "30-45 sec", rest: "45 sec" },
      ],
    },
    friday: {
      title: "Full Body HIIT",
      exercises: [
        { name: "Jumping Jacks", sets: 4, duration: "30 sec", rest: "15 sec" },
        { name: "Burpees", sets: 4, duration: "30 sec", rest: "15 sec" },
        { name: "High Knees", sets: 4, duration: "30 sec", rest: "15 sec" },
        { name: "Jump Squats", sets: 4, duration: "30 sec", rest: "15 sec" },
        { name: "Rest", duration: "2 min" },
        { name: "Repeat circuit once more" },
      ],
    },
    saturday: {
      title: "Active Recovery",
      exercises: [
        { name: "Yoga or Pilates", duration: "30-45 min" },
        { name: "Foam Rolling", duration: "10-15 min" },
      ],
    },
    sunday: {
      title: "Rest Day",
      exercises: [{ name: "Complete Rest" }, { name: "Light Walking (optional)", duration: "20-30 min" }],
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
    },
  }

  // Use custom plans if available, otherwise use defaults
  const workoutPlan = customWorkoutPlan || defaultWorkoutPlan
  const mealPlan = customMealPlan || defaultMealPlan

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
              This workout plan is designed based on your fitness level ({userData.fitnessLevel}) and available time (
              {userData.timeAvailable}). Adjust weights and intensity as needed. Always warm up before and cool down
              after each session.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="meal" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(mealPlan).map(([mealTime, meal]: [string, any]) => (
              <Card key={mealTime}>
                <CardHeader>
                  <CardTitle>{meal.title}</CardTitle>
                  <CardDescription>{meal.meal}</CardDescription>
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

                  <div className="bg-gray-100 p-3 rounded-md">
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
              This meal plan is tailored to your food preferences ({userData.foodPreferences}) and calorie needs (
              {userData.dailyCalorieIntake}). Adjust portion sizes as needed to meet your specific goals. Stay hydrated
              by drinking at least 8 glasses of water daily.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
