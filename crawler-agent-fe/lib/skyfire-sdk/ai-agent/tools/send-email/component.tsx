"use client"

import React from "react"
import { CircleAlert, CircleCheckBig } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export const Component: React.FC<{
  result: {
    to: string
    success: boolean
  }
}> = ({ result }) => {
  if (!result) return null

  return (
    <Alert
      variant={result.success ? "default" : "destructive"}
      className="mb-4"
    >
      {result.success ? (
        <CircleCheckBig className="size-4" />
      ) : (
        <CircleAlert className="size-4" />
      )}
      <AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
      <AlertDescription>
        {result.success
          ? `Email successfully sent to ${result.to}`
          : `Failed to send email to ${result.to}`}
      </AlertDescription>
    </Alert>
  )
}
