"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, X } from "lucide-react";

interface ChecklistStep {
  id: string;
  label: string;
  isCompleted: boolean;
  actionUrl?: string;
}

export function OnboardingChecklist({
  steps,
  isVisible,
  onDismiss,
}: {
  steps: ChecklistStep[];
  isVisible: boolean;
  onDismiss?: () => void;
}) {
  const completedCount = steps.filter((s) => s.isCompleted).length;
  const progress = (completedCount / steps.length) * 100;

  const handleDismiss = () => onDismiss?.();

  if (!isVisible) return null;

  return (
    <Card className="mb-6 relative border-primary/20 bg-primary/5">
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute top-2 right-2 h-6 w-6 text-muted-foreground hover:text-foreground"
        onClick={handleDismiss}
        aria-label="Dismiss onboarding checklist"
      >
        <X className="h-4 w-4" />
      </Button>
      
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-bold">Getting Started with GroqTales</CardTitle>
          <span className="text-sm font-medium text-muted-foreground mr-8">
            {completedCount}/{steps.length} Steps
          </span>
        </div>
        <Progress value={progress} className="h-2 w-full mt-2" />
      </CardHeader>
      
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mt-2">
          {steps.map((step) => (
            <div 
              key={step.id} 
              className={`flex items-center gap-2 p-2 rounded-md transition-colors ${
                step.isCompleted ? "text-primary opacity-80" : "text-foreground"
              }`}
            >
              {step.isCompleted ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground" />
              )}
              <span className={`text-sm ${step.isCompleted ? "line-through" : "font-medium"}`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}