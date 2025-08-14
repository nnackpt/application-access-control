import { CheckIcon } from "@heroicons/react/24/outline"
import React, { useEffect, useId, useRef, useState } from "react"

interface UserIdAutocompleteProps {
    value: string
    onChange: (value: string) => void
    onGetSuggestions: (searchTerm: string) => Promise<string[]>
    onSelect?: (value: string) => void
    disabled?: boolean
    placeholder?: string
    error?: string
}

const UserIdAutoComplete: React.FC<UserIdAutocompleteProps> = ({
    value,
    onChange,
    onGetSuggestions,
    onSelect,
    disabled = false,
    placeholder = "",
    error
}) => {
    const [isOpen, setIsOpen] = useState(false)
    const [suggestions, setSuggestions] = useState<string[]>([])
    const [loading, setLoading] = useState(false)
    const [highlightedIndex, setHighlightedIndex] = useState(-1)
    const inputRef = useRef<HTMLInputElement>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)

    const listboxId = useId()
    const inputId = useId()
    const errorId = useId()

    const debounce = <A extends unknown[], R>(func: (...args: A) => R, wait: number) => {
        let timeout: NodeJS.Timeout
        return (...args: A): void => {
            const later = () => {
                clearTimeout(timeout)
                void func(...args)
            }
            clearTimeout(timeout)
            timeout = setTimeout(later, wait)
        }
    }

    // Fetch suggestions
    const fetchSuggestions = async (searchTerm: string) => {
        if (!searchTerm.trim()) {
            setSuggestions([])
            return
        }

        setLoading(true)
        try {
            const results = await onGetSuggestions(searchTerm)
            setSuggestions(results)
        } catch (err) {
            console.error("Error fetching suggestions:", err)
            setSuggestions([])
        } finally {
            setLoading(false)
        }
    }

    // Debounce fetch function
    const debouncedFetchSuggestions = debounce(fetchSuggestions, 300)

    // Handle input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value
        onChange(newValue)
        setIsOpen(true)
        setHighlightedIndex(-1)
        debouncedFetchSuggestions(newValue)
    }

    // Handle suggestion click
    const handleSuggestionClick = (suggestion: string) => {
        onChange(suggestion)
        onSelect?.(suggestion)
        setIsOpen(false)
        setSuggestions([])
        setHighlightedIndex(-1)
    }

    // Handle keyboard nav
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen) return

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault()
                setHighlightedIndex(prev =>
                    prev < suggestions.length - 1 ? prev + 1 : prev
                )
                break
            case 'ArrowUp':
                e.preventDefault()
                setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1)
                break
            case 'Enter':
                e.preventDefault()
                if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
                    handleSuggestionClick(suggestions[highlightedIndex])
                } else if (value.trim()) {
                    const exact = suggestions.find(s => s === value)
                    const fallback = exact ?? (suggestions.length === 1 ? suggestions[0] : undefined)
                    if (fallback) handleSuggestionClick(fallback)
                    else onSelect?.(value)
                }
                break
            case 'Tab':
                if (isOpen && highlightedIndex >= 0 && suggestions[highlightedIndex]) {
                    e.preventDefault()
                    handleSuggestionClick(suggestions[highlightedIndex])
                }
                break
            case 'Escape':
                setIsOpen(false)
                setHighlightedIndex(-1)
                break
        }
    }

    // Handle click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                !inputRef.current?.contains(event.target as Node)
            ) {
                setIsOpen(false)
                setHighlightedIndex(-1)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const inputCls = [
        "block w-full rounded-xl border border-gray-200 px-4 py-2.5 shadow-sm",
        "focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border[var(--primary-color)]",
        "transition sm:text-sm",
        error ? "border-red-300" : "",
        disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white",
    ]
        .filter(Boolean)
        .join(" ")

    return (
        <div className="relative">
            <div className="relative">
                <input
                    id={inputId}
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => {
                        if (value) {
                            debouncedFetchSuggestions(value)
                            setIsOpen(true)
                        }
                    }}
                    disabled={disabled}
                    placeholder={placeholder}
                    className={inputCls}
                    role="combobox"
                    aria-expanded={isOpen}
                    aria-controls={listboxId}
                    aria-autocomplete="list"
                    aria-activedescendant={
                        highlightedIndex >= 0 ? `${listboxId}-option-${highlightedIndex}` : undefined
                    }
                    aria-invalid={!!error}
                    aria-describedby={error ? errorId : undefined}
                    // className={`mt-1 block w-full px-3 py-2 pr-10 border rounded-md shadow-sm focus:outline-none
                    //     focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] sm:text-sm ${
                    //     error ? 'border-red-300' : 'border-gray-300'
                    // } ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}                
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    {loading ? (
                        <div
                            aria-hidden
                            className="w-4 h-4 border-2 border-gray-300 border-t-[var(--primary-color)] rounded-full animate-spin"
                        ></div>
                    ) : null}
                </div>
            </div>

            {/* Dropdown */}
            {isOpen && (
                <div
                    ref={dropdownRef}
                    id={listboxId}
                    role="listbox"
                    className="absolute z-10 w-full mt-1 bg-white rounded-xl border border-gray-200 shadow-lg right-1 ring-black/5 max-h-60 overflow-auto text-sm"
                >
                    {suggestions.length === 0 && !loading ? (
                        <div className="px-4 py-2 text-sm text-gray-500">
                            {value.trim() ? 'No Users found' : 'Start typing to search...'}
                        </div>
                    ) : (
                        suggestions.map((suggestion, index) => {
                            const isActive = index === highlightedIndex
                            const isSelected = value === suggestion
                            return (
                                <div
                                    key={suggestion}
                                    id={`${listboxId}-option-${index}`}
                                    role="option"
                                    aria-selected={isSelected}
                                    className={`px-4 py-2 cursor-pointer flex items-center justify-between select-none ${
                                        isActive 
                                            ? "bg-[var(--primary-color)] text-white"
                                            : "text-gray-900 hover:bg-gray-100"
                                    }`}
                                    onClick={() => handleSuggestionClick(suggestion)}
                                >
                                    <span>{suggestion}</span>
                                    {isSelected && (
                                        <CheckIcon className="h-4 w-4 text-white" />
                                    )}
                                </div>
                            )
                        })
                    )}
                </div>
            )}

            {error ? (
                <p id={errorId} className="text-red-500 text-xs mt-1">
                    {error}
                </p>
            ) : null}
        </div>
    )
}

export default UserIdAutoComplete