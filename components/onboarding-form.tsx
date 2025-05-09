"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { db } from "@/lib/firebase"
import { doc, setDoc } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

type FormSection = "fitness" | "lifestyle" | "nutrition" | "personal"

interface FormData {
  fitnessLevel: string
  dailyRoutine: string
  timeAvailable: string
  foodPreferences: string
  dailyCalorieIntake: string
  age: string
  weight: string
  sex: string
  otherFitnessLevel: string
  otherDailyRoutine: string
  otherTimeAvailable: string
  otherFoodPreferences: string
  otherDailyCalorieIntake: string
  otherAge: string
  otherWeight: string
}

export default function OnboardingForm() {
  const { user } = useAuth()
  const router = useRouter()
  const [currentSection, setCurrentSection] = useState<FormSection>("fitness")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<FormData>({
    fitnessLevel: "",
    dailyRoutine: "",
    timeAvailable: "",
    foodPreferences: "",
    dailyCalorieIntake: "",
    age: "",
    weight: "",
    sex: "",
    otherFitnessLevel: "",
    otherDailyRoutine: "",
    otherTimeAvailable: "",
    otherFoodPreferences: "",
    otherDailyCalorieIntake: "",
    otherAge: "",
    otherWeight: "",
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

  const validateSection = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (currentSection === "fitness") {
      if (!formData.fitnessLevel) {
        newErrors.fitnessLevel = "Please select a fitness level"
      } else if (formData.fitnessLevel === "Other" && !formData.otherFitnessLevel) {
        newErrors.otherFitnessLevel = "Please specify your fitness level"
      }
    } else if (currentSection === "lifestyle") {
      if (!formData.dailyRoutine) {
        newErrors.dailyRoutine = "Please select your daily routine"
      } else if (formData.dailyRoutine === "Other" && !formData.otherDailyRoutine) {
        newErrors.otherDailyRoutine = "Please specify your daily routine"
      }

      if (!formData.timeAvailable) {
        newErrors.timeAvailable = "Please select available time"
      } else if (formData.timeAvailable === "Other" && !formData.otherTimeAvailable) {
        newErrors.otherTimeAvailable = "Please specify your available time"
      }
    } else if (currentSection === "nutrition") {
      if (!formData.foodPreferences) {
        newErrors.foodPreferences = "Please select your food preferences"
      } else if (formData.foodPreferences === "Other" && !formData.otherFoodPreferences) {
        newErrors.otherFoodPreferences = "Please specify your food preferences"
      }

      if (!formData.dailyCalorieIntake) {
        newErrors.dailyCalorieIntake = "Please select your daily calorie intake"
      } else if (formData.dailyCalorieIntake === "Other" && !formData.otherDailyCalorieIntake) {
        newErrors.otherDailyCalorieIntake = "Please specify your daily calorie intake"
      }
    } else if (currentSection === "personal") {
      if (!formData.age) {
        newErrors.age = "Please select your age"
      } else if (formData.age === "Other" && !formData.otherAge) {
        newErrors.otherAge = "Please specify your age"
      }

      if (!formData.weight) {
        newErrors.weight = "Please select your weight"
      } else if (formData.weight === "Other" && !formData.otherWeight) {
        newErrors.otherWeight = "Please specify your weight"
      }

      if (!formData.sex) {
        newErrors.sex = "Please select your sex"
      }
    }

    setValidationErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (!validateSection()) return

    if (currentSection === "fitness") setCurrentSection("lifestyle")
    else if (currentSection === "lifestyle") setCurrentSection("nutrition")
    else if (currentSection === "nutrition") setCurrentSection("personal")
  }

  const handlePrevious = () => {
    if (currentSection === "lifestyle") setCurrentSection("fitness")
    else if (currentSection === "nutrition") setCurrentSection("lifestyle")
    else if (currentSection === "personal") setCurrentSection("nutrition")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateSection()) return

    if (!user) {
      setError("You must be logged in to submit")
      return
    }

    setSaving(true)
    setError(null)

    try {
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
    if (currentSection === "fitness") return 25
    if (currentSection === "lifestyle") return 50
    if (currentSection === "nutrition") return 75
    return 100
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4 py-8">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Welcome to Corelio</CardTitle>
          <CardDescription className="text-center">
            Let's create your personalized fitness and nutrition plan
          </CardDescription>
          <div className="mt-4">
            <Progress value={getProgressPercentage()} className="h-2 bg-secondary" />
            <div className="flex justify-between mt-1 text-sm text-gray-500">
              <span className={currentSection === "fitness" ? "font-medium text-primary" : ""}>Fitness</span>
              <span className={currentSection === "lifestyle" ? "font-medium text-primary" : ""}>Lifestyle</span>
              <span className={currentSection === "nutrition" ? "font-medium text-primary" : ""}>Nutrition</span>
              <span className={currentSection === "personal" ? "font-medium text-primary" : ""}>Personal</span>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Fitness Section */}
            {currentSection === "fitness" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fitnessLevel">What is your fitness level?</Label>
                  <Select
                    value={formData.fitnessLevel}
                    onValueChange={(value) => handleInputChange("fitnessLevel", value)}
                  >
                    <SelectTrigger id="fitnessLevel" aria-label="Fitness Level">
                      <SelectValue placeholder="Select your fitness level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {validationErrors.fitnessLevel && (
                    <p className="text-sm text-red-500 mt-1">{validationErrors.fitnessLevel}</p>
                  )}
                </div>

                {formData.fitnessLevel === "Other" && (
                  <div className="space-y-2">
                    <Label htmlFor="otherFitnessLevel">Please specify your fitness level</Label>
                    <Input
                      id="otherFitnessLevel"
                      value={formData.otherFitnessLevel}
                      onChange={(e) => handleInputChange("otherFitnessLevel", e.target.value)}
                      aria-label="Other Fitness Level"
                    />
                    {validationErrors.otherFitnessLevel && (
                      <p className="text-sm text-red-500 mt-1">{validationErrors.otherFitnessLevel}</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Lifestyle Section */}
            {currentSection === "lifestyle" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="dailyRoutine">What is your daily routine like?</Label>
                  <RadioGroup
                    value={formData.dailyRoutine}
                    onValueChange={(value) => handleInputChange("dailyRoutine", value)}
                    className="grid grid-cols-1 gap-2 sm:grid-cols-3"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Sedentary" id="sedentary" />
                      <Label htmlFor="sedentary">Sedentary</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Moderately Active" id="moderate" />
                      <Label htmlFor="moderate">Moderately Active</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Highly Active" id="active" />
                      <Label htmlFor="active">Highly Active</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Other" id="otherRoutine" />
                      <Label htmlFor="otherRoutine">Other</Label>
                    </div>
                  </RadioGroup>
                  {validationErrors.dailyRoutine && (
                    <p className="text-sm text-red-500 mt-1">{validationErrors.dailyRoutine}</p>
                  )}
                </div>

                {formData.dailyRoutine === "Other" && (
                  <div className="space-y-2">
                    <Label htmlFor="otherDailyRoutine">Please specify your daily routine</Label>
                    <Input
                      id="otherDailyRoutine"
                      value={formData.otherDailyRoutine}
                      onChange={(e) => handleInputChange("otherDailyRoutine", e.target.value)}
                      aria-label="Other Daily Routine"
                    />
                    {validationErrors.otherDailyRoutine && (
                      <p className="text-sm text-red-500 mt-1">{validationErrors.otherDailyRoutine}</p>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="timeAvailable">How much time do you have available for exercise?</Label>
                  <RadioGroup
                    value={formData.timeAvailable}
                    onValueChange={(value) => handleInputChange("timeAvailable", value)}
                    className="grid grid-cols-1 gap-2 sm:grid-cols-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="30 minutes" id="time30" />
                      <Label htmlFor="time30">30 minutes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="1 hour" id="time60" />
                      <Label htmlFor="time60">1 hour</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="1.5 hours" id="time90" />
                      <Label htmlFor="time90">1.5 hours</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="2 hours" id="time120" />
                      <Label htmlFor="time120">2 hours</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Other" id="timeOther" />
                      <Label htmlFor="timeOther">Other</Label>
                    </div>
                  </RadioGroup>
                  {validationErrors.timeAvailable && (
                    <p className="text-sm text-red-500 mt-1">{validationErrors.timeAvailable}</p>
                  )}
                </div>

                {formData.timeAvailable === "Other" && (
                  <div className="space-y-2">
                    <Label htmlFor="otherTimeAvailable">Please specify your available time (hours/minutes)</Label>
                    <Input
                      id="otherTimeAvailable"
                      value={formData.otherTimeAvailable}
                      onChange={(e) => handleInputChange("otherTimeAvailable", e.target.value)}
                      aria-label="Other Time Available"
                    />
                    {validationErrors.otherTimeAvailable && (
                      <p className="text-sm text-red-500 mt-1">{validationErrors.otherTimeAvailable}</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Nutrition Section */}
            {currentSection === "nutrition" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="foodPreferences">What are your food preferences?</Label>
                  <RadioGroup
                    value={formData.foodPreferences}
                    onValueChange={(value) => handleInputChange("foodPreferences", value)}
                    className="grid grid-cols-1 gap-2 sm:grid-cols-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="No restrictions" id="noRestrictions" />
                      <Label htmlFor="noRestrictions">No restrictions</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Vegetarian" id="vegetarian" />
                      <Label htmlFor="vegetarian">Vegetarian</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Vegan" id="vegan" />
                      <Label htmlFor="vegan">Vegan</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Gluten-Free" id="glutenFree" />
                      <Label htmlFor="glutenFree">Gluten-Free</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Other" id="foodOther" />
                      <Label htmlFor="foodOther">Other</Label>
                    </div>
                  </RadioGroup>
                  {validationErrors.foodPreferences && (
                    <p className="text-sm text-red-500 mt-1">{validationErrors.foodPreferences}</p>
                  )}
                </div>

                {formData.foodPreferences === "Other" && (
                  <div className="space-y-2">
                    <Label htmlFor="otherFoodPreferences">Please specify your food preferences</Label>
                    <Input
                      id="otherFoodPreferences"
                      value={formData.otherFoodPreferences}
                      onChange={(e) => handleInputChange("otherFoodPreferences", e.target.value)}
                      aria-label="Other Food Preferences"
                    />
                    {validationErrors.otherFoodPreferences && (
                      <p className="text-sm text-red-500 mt-1">{validationErrors.otherFoodPreferences}</p>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="dailyCalorieIntake">What is your daily calorie intake?</Label>
                  <RadioGroup
                    value={formData.dailyCalorieIntake}
                    onValueChange={(value) => handleInputChange("dailyCalorieIntake", value)}
                    className="grid grid-cols-1 gap-2 sm:grid-cols-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Under 1500" id="cal1500" />
                      <Label htmlFor="cal1500">Under 1500</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="1500-2000" id="cal1500to2000" />
                      <Label htmlFor="cal1500to2000">1500-2000</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="2000-2500" id="cal2000to2500" />
                      <Label htmlFor="cal2000to2500">2000-2500</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Over 2500" id="calOver2500" />
                      <Label htmlFor="calOver2500">Over 2500</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Don't know" id="calDontKnow" />
                      <Label htmlFor="calDontKnow">Don't know</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Other" id="calOther" />
                      <Label htmlFor="calOther">Other</Label>
                    </div>
                  </RadioGroup>
                  {validationErrors.dailyCalorieIntake && (
                    <p className="text-sm text-red-500 mt-1">{validationErrors.dailyCalorieIntake}</p>
                  )}
                </div>

                {formData.dailyCalorieIntake === "Other" && (
                  <div className="space-y-2">
                    <Label htmlFor="otherDailyCalorieIntake">Please specify your daily calorie intake</Label>
                    <Input
                      id="otherDailyCalorieIntake"
                      value={formData.otherDailyCalorieIntake}
                      onChange={(e) => handleInputChange("otherDailyCalorieIntake", e.target.value)}
                      aria-label="Other Daily Calorie Intake"
                    />
                    {validationErrors.otherDailyCalorieIntake && (
                      <p className="text-sm text-red-500 mt-1">{validationErrors.otherDailyCalorieIntake}</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Personal Section */}
            {currentSection === "personal" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="age">What is your age?</Label>
                  <Select value={formData.age} onValueChange={(value) => handleInputChange("age", value)}>
                    <SelectTrigger id="age" aria-label="Age">
                      <SelectValue placeholder="Select your age range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Under 18">Under 18</SelectItem>
                      <SelectItem value="18-30">18-30</SelectItem>
                      <SelectItem value="31-45">31-45</SelectItem>
                      <SelectItem value="46-60">46-60</SelectItem>
                      <SelectItem value="Over 60">Over 60</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {validationErrors.age && <p className="text-sm text-red-500 mt-1">{validationErrors.age}</p>}
                </div>

                {formData.age === "Other" && (
                  <div className="space-y-2">
                    <Label htmlFor="otherAge">Please specify your age</Label>
                    <Input
                      id="otherAge"
                      type="number"
                      value={formData.otherAge}
                      onChange={(e) => handleInputChange("otherAge", e.target.value)}
                      aria-label="Other Age"
                    />
                    {validationErrors.otherAge && (
                      <p className="text-sm text-red-500 mt-1">{validationErrors.otherAge}</p>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="weight">What is your weight?</Label>
                  <Select value={formData.weight} onValueChange={(value) => handleInputChange("weight", value)}>
                    <SelectTrigger id="weight" aria-label="Weight">
                      <SelectValue placeholder="Select your weight range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Under 120 lbs">Under 120 lbs</SelectItem>
                      <SelectItem value="120-150 lbs">120-150 lbs</SelectItem>
                      <SelectItem value="151-180 lbs">151-180 lbs</SelectItem>
                      <SelectItem value="181-220 lbs">181-220 lbs</SelectItem>
                      <SelectItem value="Over 220 lbs">Over 220 lbs</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {validationErrors.weight && <p className="text-sm text-red-500 mt-1">{validationErrors.weight}</p>}
                </div>

                {formData.weight === "Other" && (
                  <div className="space-y-2">
                    <Label htmlFor="otherWeight">Please specify your weight (in lbs)</Label>
                    <Input
                      id="otherWeight"
                      type="number"
                      value={formData.otherWeight}
                      onChange={(e) => handleInputChange("otherWeight", e.target.value)}
                      aria-label="Other Weight"
                    />
                    {validationErrors.otherWeight && (
                      <p className="text-sm text-red-500 mt-1">{validationErrors.otherWeight}</p>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="sex">What is your sex?</Label>
                  <Select value={formData.sex} onValueChange={(value) => handleInputChange("sex", value)}>
                    <SelectTrigger id="sex" aria-label="Sex">
                      <SelectValue placeholder="Select your sex" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                  {validationErrors.sex && <p className="text-sm text-red-500 mt-1">{validationErrors.sex}</p>}
                </div>
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-between pt-4">
              {currentSection !== "fitness" ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  className="border-primary text-primary hover:bg-primary/10"
                >
                  Previous
                </Button>
              ) : (
                <div></div>
              )}

              {currentSection !== "personal" ? (
                <Button type="button" onClick={handleNext} className="bg-primary hover:bg-primary/90">
                  Next
                </Button>
              ) : (
                <Button type="submit" disabled={saving} className="bg-primary hover:bg-primary/90">
                  {saving ? (
                    <>
                      <span className="mr-2">Saving</span>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </>
                  ) : (
                    "Submit"
                  )}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
