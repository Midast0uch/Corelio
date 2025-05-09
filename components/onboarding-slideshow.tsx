"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context" // Make sure useAuth is imported
import { doc, setDoc } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { motion, AnimatePresence } from "framer-motion"
import { LogoWithText } from "@/components/ui/logo"
import { getFirebaseClient } from "@/lib/firebase-client"

interface FormData {
  fitnessLevel: string
  dailyRoutine: string
  timeAvailable: string
  foodPreferences: string
  dailyCalorieIntake: string
  age: string
  weight: string
  height: string
  sex: string
  otherFitnessLevel: string
  otherDailyRoutine: string
  otherTimeAvailable: string
  otherFoodPreferences: string
  otherDailyCalorieIntake: string
  otherAge: string
  otherWeight: string
  otherHeight: string
}

const questions = [
  {
    id: "fitnessLevel",
    question: "What is your fitness level?",
    type: "select",
    options: ["Beginner", "Intermediate", "Advanced", "Other"],
    otherField: "otherFitnessLevel",
  },
  {
    id: "dailyRoutine",
    question: "What is your daily routine like?",
    type: "radio",
    options: ["Sedentary", "Moderately Active", "Highly Active", "Other"],
    otherField: "otherDailyRoutine",
  },
  {
    id: "timeAvailable",
    question: "How much time do you have for exercise?",
    type: "radio",
    options: ["30 minutes", "1 hour", "1.5 hours", "2 hours", "Other"],
    otherField: "otherTimeAvailable",
  },
  {
    id: "foodPreferences",
    question: "What are your food preferences?",
    type: "radio",
    options: ["No restrictions", "Vegetarian", "Vegan", "Gluten-Free", "Other"],
    otherField: "otherFoodPreferences",
  },
  {
    id: "dailyCalorieIntake",
    question: "What is your daily calorie intake?",
    type: "radio",
    options: ["Under 1500", "1500-2000", "2000-2500", "Over 2500", "Don't know", "Other"],
    otherField: "otherDailyCalorieIntake",
  },
  {
    id: "age",
    question: "What is your age?",
    type: "select",
    options: ["Under 18", "18-30", "31-45", "46-60", "Over 60", "Other"],
    otherField: "otherAge",
  },
  {
    id: "weight",
    question: "What is your weight?",
    type: "select",
    options: ["Under 120 lbs", "120-150 lbs", "151-180 lbs", "181-220 lbs", "Over 220 lbs", "Other"],
    otherField: "otherWeight",
  },
  {
    id: "height",
    question: "What is your height?",
    type: "select",
    options: ["Under 5'0\"", "5'0\" - 5'4\"", "5'5\" - 5'8\"", "5'9\" - 6'0\"", "Over 6'0\"", "Other"],
    otherField: "otherHeight",
  },
  {
    id: "sex",
    question: "What is your sex?",
    type: "select",
    options: ["Male", "Female", "Prefer not to say"],
  },
]

export default function OnboardingSlideshow() {
  const { user, loading } = useAuth() // Get loading state from useAuth
  const router = useRouter()
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [direction, setDirection] = useState(0) // -1 for backward, 1 for forward

  const [formData, setFormData] = useState<FormData>({
    fitnessLevel: "",
    dailyRoutine: "",
    timeAvailable: "",
    foodPreferences: "",
    dailyCalorieIntake: "",
    age: "",
    weight: "",
    height: "",
    sex: "",
    otherFitnessLevel: "",
    otherDailyRoutine: "",
    otherTimeAvailable: "",
    otherFoodPreferences: "",
    otherDailyCalorieIntake: "",
    otherAge: "",
    otherWeight: "",
    otherHeight: "",
  })

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Clear validation error when field is updated
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const validateCurrentQuestion = (): boolean => {
    const currentQuestion = questions[currentQuestionIndex]
    const newErrors: Record<string, string> = {}

    const fieldId = currentQuestion.id as keyof FormData
    const fieldValue = formData[fieldId]
    const otherFieldId = currentQuestion.otherField as keyof FormData

    if (!fieldValue) {
      newErrors[fieldId] = `Please answer this question`
    } else if (fieldValue === "Other" && otherFieldId && !formData[otherFieldId]) {
      newErrors[otherFieldId] = "Please provide details"
    }

    setValidationErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (!validateCurrentQuestion()) return

    if (currentQuestionIndex < questions.length - 1) {
      setDirection(1)
      setTimeout(() => {
        setCurrentQuestionIndex((prev) => prev + 1)
      }, 300)
    } else {
      handleSubmit()
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setDirection(-1)
      setTimeout(() => {
        setCurrentQuestionIndex((prev) => prev - 1)
      }, 300)
    }
  }

  const handleSubmit = async () => {
    if (!validateCurrentQuestion()) return

    // Check if user is available before submitting data that requires a user ID
    if (!user) {
      setError("You must be logged in to submit")
      return
    }

    setSaving(true)
    setError(null)

    try {
      // Get Firestore instance
      const { db } = getFirebaseClient()
      if (!db) {
        throw new Error("Database not initialized")
      }

      // Prepare data for Firestore
      const userData = {
        fitnessLevel: formData.fitnessLevel === "Other" ? formData.otherFitnessLevel : formData.fitnessLevel,
        dailyRoutine: formData.dailyRoutine === "Other" ? formData.otherDailyRoutine : formData.dailyRoutine,
        timeAvailable: formData.timeAvailable === "Other" ? formData.otherTimeAvailable : formData.timeAvailable,
        foodPreferences:
          formData.foodPreferences === "Other" ? formData.otherFoodPreferences : formData.foodPreferences,
        dailyCalorieIntake:
          formData.dailyCalorieIntake === "Other" ? formData.otherDailyCalorieIntake : formData.dailyCalorieIntake,
        age: formData.age === "Other" ? formData.otherAge : formData.age,
        weight: formData.weight === "Other" ? formData.otherWeight : formData.weight,
        height: formData.height === "Other" ? formData.otherHeight : formData.height,
        sex: formData.sex,
        createdAt: new Date().toISOString(),
      }

      // Save to Firestore
      await setDoc(doc(db, "users", user.uid), userData)

      // Redirect to plan page
      router.push("/plan")
    } catch (err: any) {
      setError(err.message || "Failed to save data")
    } finally {
      setSaving(false)
    }
  }

  const getProgressPercentage = (): number => {
    return ((currentQuestionIndex + 1) / questions.length) * 100
  }

  // Render a loading state if authentication is still loading
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  // If not loading and no user, redirect to the home page (login)
  // This is a safeguard, app/onboarding/page.tsx should handle this, but it doesn't hurt.
  if (!user) {
    router.push("/");
    return null;
  }


  const renderQuestion = () => {
    const currentQuestion = questions[currentQuestionIndex]
    const fieldId = currentQuestion.id as keyof FormData
    const fieldValue = formData[fieldId]
    const otherFieldId = currentQuestion.otherField as keyof FormData

    return (
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: direction * 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -50 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <div className="text-center mb-8">
            <motion.h2
              className="text-3xl font-bold mb-2 text-primary drop-shadow-lg"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              {currentQuestion.question}
            </motion.h2>
          </div>

          <div className="space-y-4">
            {currentQuestion.type === "select" ? (
              <div className="space-y-2">
                <Select value={fieldValue} onValueChange={(value) => handleInputChange(fieldId, value)}>
                  <SelectTrigger id={fieldId} aria-label={currentQuestion.question}>
                    <SelectValue placeholder={`Select your ${fieldId}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {currentQuestion.options.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {validationErrors[fieldId] && <p className="text-sm text-red-500 mt-1">{validationErrors[fieldId]}</p>}
              </div>
            ) : (
              <RadioGroup
                value={fieldValue}
                onValueChange={(value) => handleInputChange(fieldId, value)}
                className="grid grid-cols-1 gap-3 sm:grid-cols-2"
              >
                {currentQuestion.options.map((option) => (
                  <div
                    key={option}
                    className="flex items-center space-x-2 bg-white p-3 rounded-lg border border-gray-200 hover:border-primary/50 transition-colors"
                  >
                    <RadioGroupItem value={option} id={`${fieldId}-${option}`} />
                    <Label htmlFor={`${fieldId}-${option}`} className="flex-grow cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {fieldValue === "Other" && otherFieldId && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                <Label htmlFor={otherFieldId}>Please specify</Label>
                <Input
                  id={otherFieldId}
                  value={formData[otherFieldId]}
                  onChange={(e) => handleInputChange(otherFieldId, e.target.value)}
                  aria-label={`Other ${fieldId}`}
                />
                {validationErrors[otherFieldId] && (
                  <p className="text-sm text-red-500 mt-1">{validationErrors[otherFieldId]}</p>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 px-4 py-8">
      <Card className="w-full max-w-2xl shadow-lg border-none relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 z-0"></div>

        <div className="relative z-10 p-6 md:p-8">
          <div className="flex justify-center mb-6">
            <LogoWithText />
          </div>

          <div className="mb-6">
            <Progress value={getProgressPercentage()} className="h-2 bg-secondary" />
            <div className="flex justify-between mt-2 text-sm text-gray-500">
              <span>
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              <span>{Math.round(getProgressPercentage())}% Complete</span>
            </div>
          </div>

          {renderQuestion()}

          {error && (
            <Alert variant="destructive" className="mt-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-between mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="border-primary text-primary hover:bg-primary/10"
            >
              Previous
            </Button>

            {/* Corrected Button element with closing tag */}

            <Button type="button" onClick={handleNext} disabled={saving} className="bg-primary hover:bg-primary/90">
              {saving ? (
                <>
                  <span className="mr-2">Saving...</span>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </>
              ) : currentQuestionIndex === questions.length - 1 ? (
                "Finish"
              ) : (
                "Next"
              )}
            </Button>
          </div>
        </div>
        {/* Corrected Card closing tag */}
      </Card>
    {/* Corrected div closing tag */}
    </div>
  );
}
