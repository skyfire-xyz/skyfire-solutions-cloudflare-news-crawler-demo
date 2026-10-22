"use client"

import { useState } from "react"

import { Input } from "@/components/ui/input"

import { suggestions } from "./SearchBar"

interface UrlSelectorProps {
  value: string
  onChange: (url: string) => void
  disabled?: boolean
}

export default function UrlSelector({
  value,
  onChange,
  disabled,
}: UrlSelectorProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isFocused || suggestions.length === 0) return

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case "ArrowUp":
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case "Enter":
        e.preventDefault()
        if (selectedIndex >= 0) {
          onChange(suggestions[selectedIndex].url)
          setIsFocused(false)
          setSelectedIndex(-1)
        }
        break
      case "Escape":
        setIsFocused(false)
        setSelectedIndex(-1)
        break
    }
  }

  return (
    <div className="relative">
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setTimeout(() => setIsFocused(false), 200)}
        onKeyDown={handleKeyDown}
        placeholder="Select or Enter website URL"
        autoComplete="off"
        disabled={disabled}
      />
      {isFocused && (
        <div className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-md border bg-white shadow-lg">
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.url}
              className={`cursor-pointer border-b px-4 py-3 last:border-b-0 ${
                index === selectedIndex
                  ? "border-blue-200 bg-gray-50"
                  : "hover:bg-gray-50"
              }`}
              onClick={() => {
                onChange(suggestion.url)
                setIsFocused(false)
                setSelectedIndex(-1)
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <span
                    className={`rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-800 ${
                      suggestion.type === "Protected" ? "mr-4" : ""
                    }`}
                  >
                    {suggestion.type}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-gray-900">
                      {suggestion.name}
                    </div>
                    <div className="mt-1 truncate text-xs text-gray-500">
                      {suggestion.url}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
