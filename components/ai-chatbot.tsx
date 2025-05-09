"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Bot, Send, User, X, Minimize2, Maximize2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface Message {
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface AIChatbotProps {
  userData: any
}

export default function AIChatbot({ userData }: AIChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Hi there! I'm your Corelio AI assistant. I can help answer questions about your workout and meal plans. What would you like to know?`,
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!input.trim()) return

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setLoading(true)

    try {
      // Here we would normally call the OpenAI API
      // For now, we'll simulate a response
      setTimeout(() => {
        const responses = [
          `Based on your ${userData.fitnessLevel} fitness level, I recommend focusing on proper form for all exercises in your plan.`,
          `With your ${userData.dailyRoutine} lifestyle, it's important to stay consistent with your workouts.`,
          `For your ${userData.foodPreferences} diet, make sure you're getting enough protein to support muscle recovery.`,
          `Given your available time of ${userData.timeAvailable}, your workout plan is optimized for efficiency.`,
          `Remember to stay hydrated throughout the day, especially before and after workouts!`,
          `If you're feeling too sore after a workout, consider adding an extra rest day or doing light recovery exercises.`,
          `Your meal plan is designed to provide about ${userData.dailyCalorieIntake} calories, which aligns with your goals.`,
        ]

        const randomResponse = responses[Math.floor(Math.random() * responses.length)]

        const assistantMessage: Message = {
          role: "assistant",
          content: randomResponse,
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, assistantMessage])
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.error("Error sending message:", error)
      setLoading(false)
    }
  }

  const toggleChatbot = () => {
    setIsOpen(!isOpen)
    setIsMinimized(false)
  }

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized)
  }

  return (
    <>
      {/* Floating chat button */}
      {!isOpen && (
        <motion.button
          className="fixed bottom-6 right-6 bg-primary text-white p-4 rounded-full shadow-lg z-50 flex items-center justify-center"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleChatbot}
        >
          <Bot size={24} />
        </motion.button>
      )}

      {/* Chatbot interface */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={
              isMinimized
                ? { opacity: 1, y: 0, scale: 1, height: "auto" }
                : { opacity: 1, y: 0, scale: 1, height: "auto" }
            }
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 w-full max-w-md"
          >
            <Card className="border-primary/20 shadow-xl overflow-hidden">
              <CardHeader className="bg-primary/10 p-4 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-primary flex items-center">
                  <Bot className="mr-2" size={20} />
                  Corelio Assistant
                </CardTitle>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={toggleMinimize}
                    aria-label={isMinimized ? "Maximize" : "Minimize"}
                  >
                    {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={toggleChatbot}
                    aria-label="Close"
                  >
                    <X size={16} />
                  </Button>
                </div>
              </CardHeader>

              <AnimatePresence>
                {!isMinimized && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <CardContent className="p-0">
                      <div className="h-80 overflow-y-auto p-4 space-y-4">
                        {messages.map((message, index) => (
                          <div
                            key={index}
                            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`flex items-start space-x-2 max-w-[80%] ${
                                message.role === "user" ? "flex-row-reverse space-x-reverse" : ""
                              }`}
                            >
                              <Avatar className={message.role === "assistant" ? "bg-primary/20" : "bg-gray-200"}>
                                {message.role === "assistant" ? (
                                  <Bot className="h-5 w-5 text-primary" />
                                ) : (
                                  <User className="h-5 w-5" />
                                )}
                                <AvatarFallback>{message.role === "assistant" ? "AI" : "You"}</AvatarFallback>
                              </Avatar>
                              <div
                                className={`rounded-lg p-3 ${
                                  message.role === "assistant" ? "bg-primary/10 text-gray-800" : "bg-primary text-white"
                                }`}
                              >
                                <p className="text-sm">{message.content}</p>
                                <p className="text-xs opacity-70 mt-1">
                                  {message.timestamp.toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                        {loading && (
                          <div className="flex justify-start">
                            <div className="flex items-start space-x-2 max-w-[80%]">
                              <Avatar className="bg-primary/20">
                                <Bot className="h-5 w-5 text-primary" />
                                <AvatarFallback>AI</AvatarFallback>
                              </Avatar>
                              <div className="rounded-lg p-3 bg-primary/10">
                                <div className="flex space-x-1">
                                  <div
                                    className="w-2 h-2 rounded-full bg-primary/40 animate-bounce"
                                    style={{ animationDelay: "0ms" }}
                                  ></div>
                                  <div
                                    className="w-2 h-2 rounded-full bg-primary/40 animate-bounce"
                                    style={{ animationDelay: "150ms" }}
                                  ></div>
                                  <div
                                    className="w-2 h-2 rounded-full bg-primary/40 animate-bounce"
                                    style={{ animationDelay: "300ms" }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        <div ref={messagesEndRef} />
                      </div>
                    </CardContent>

                    <CardFooter className="p-3 border-t">
                      <form onSubmit={handleSendMessage} className="flex w-full space-x-2">
                        <Input
                          placeholder="Ask about your workout or meal plan..."
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          className="flex-1"
                          disabled={loading}
                        />
                        <Button
                          type="submit"
                          size="icon"
                          disabled={!input.trim() || loading}
                          className="bg-primary hover:bg-primary/90"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </form>
                    </CardFooter>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
