import * as React from "react"
import { cn } from "@/lib/utils"

const InputOTP = React.forwardRef(
  ({ className, containerClassName, value, onChange, maxLength = 6, ...props }, ref) => {
    const inputRefs = React.useRef([])
    const [values, setValues] = React.useState(Array(maxLength).fill(""))

    React.useEffect(() => {
      if (value) {
        const valueArray = value.split("").slice(0, maxLength)
        const newValues = Array(maxLength).fill("")
        valueArray.forEach((char, index) => {
          newValues[index] = char
        })
        setValues(newValues)
      } else {
        setValues(Array(maxLength).fill(""))
      }
    }, [value, maxLength])

    const handleChange = (index, newValue) => {
      // Only allow digits
      if (newValue && !/^\d$/.test(newValue)) {
        return
      }

      const newValues = [...values]
      newValues[index] = newValue
      setValues(newValues)

      // Call onChange with the complete value
      const completeValue = newValues.join("")
      if (onChange) {
        onChange({ target: { value: completeValue } })
      }

      // Auto-focus next input
      if (newValue && index < maxLength - 1) {
        inputRefs.current[index + 1]?.focus()
      }
    }

    const handleKeyDown = (index, e) => {
      if (e.key === "Backspace" && !values[index] && index > 0) {
        inputRefs.current[index - 1]?.focus()
      }
      if (e.key === "ArrowLeft" && index > 0) {
        inputRefs.current[index - 1]?.focus()
      }
      if (e.key === "ArrowRight" && index < maxLength - 1) {
        inputRefs.current[index + 1]?.focus()
      }
    }

    const handlePaste = (e) => {
      e.preventDefault()
      const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, maxLength)
      const newValues = Array(maxLength).fill("")
      pastedData.split("").forEach((char, index) => {
        newValues[index] = char
      })
      setValues(newValues)
      
      if (onChange) {
        onChange({ target: { value: pastedData } })
      }

      // Focus the next empty input or the last one
      const nextIndex = Math.min(pastedData.length, maxLength - 1)
      inputRefs.current[nextIndex]?.focus()
    }

    return (
      <div 
        className={cn("flex items-center gap-2", containerClassName)}
        onPaste={handlePaste}
      >
        {Array.from({ length: maxLength }).map((_, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el
              if (ref && typeof ref === "function") {
                ref(el)
              } else if (ref && index === 0) {
                ref.current = el
              }
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={values[index]}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-md border border-input bg-background text-center text-lg font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              className
            )}
            autoComplete="off"
            {...props}
          />
        ))}
      </div>
    )
  }
)
InputOTP.displayName = "InputOTP"

export { InputOTP }

