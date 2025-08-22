"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LogIn } from "lucide-react"

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log("Login submitted:", formData)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-accent/20 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-primary/30 to-accent/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-l from-accent/40 to-primary/40 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      <div className="relative w-full max-w-md space-y-8 z-10">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="p-4 bg-gradient-to-br from-primary to-accent rounded-3xl shadow-2xl">
              <LogIn className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent tracking-tight">
            Welcome Back
          </h1>
          <p className="text-xl text-muted-foreground font-medium">Sign in to continue your journey</p>
        </div>

        <Card className="border-2 shadow-2xl bg-card/70 backdrop-blur-lg border-primary/20">
          <CardHeader className="pb-8">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Sign In
            </CardTitle>
            <CardDescription className="text-lg text-muted-foreground">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="email" className="text-base font-semibold text-foreground">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  className="h-14 text-base border-2 focus:border-primary transition-all duration-300 bg-input/80 backdrop-blur-sm rounded-xl"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="password" className="text-base font-semibold text-foreground">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="h-14 text-base border-2 focus:border-primary transition-all duration-300 bg-input/80 backdrop-blur-sm rounded-xl"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  required
                />
              </div>

              <div className="text-right">
                <a
                  href="/forgot-password"
                  className="text-primary hover:text-accent font-medium hover:underline transition-all duration-300"
                >
                  Forgot your password?
                </a>
              </div>

              <Button
                type="submit"
                className="w-full h-14 text-lg font-bold bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 rounded-xl"
              >
                Sign In
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center text-lg text-muted-foreground">
          Don't have an account?{" "}
          <a
            href="/register"
            className="text-primary hover:text-accent font-bold hover:underline transition-all duration-300"
          >
            Create one here
          </a>
        </div>
      </div>
    </div>
  )
}
