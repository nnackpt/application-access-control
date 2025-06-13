"use client"

import { AlertTriangle, RefreshCcw } from "lucide-react";
import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
    children: ReactNode
}

interface State {
    hasError: boolean
    error: Error | null
}

export default class ErrorBoundary extends Component
<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    }

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error }
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        console.error('Uncaught error:', error, errorInfo)
    }

    private handleRetry = () => {
        this.setState({ hasError: false, error: null })
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
                        <div className="mb-6">
                            <AlertTriangle className="mx-auto text-red-500" size={48} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">
                            Something went wrong
                        </h2>
                        <p className="text-gray-600 mb-6">
                            An error occurred while loading the application. Please try again.
                        </p>
                        {this.state.error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6 text-left">
                                <p className="text-sm text-red-800 font-mono">
                                    {this.state.error.message}
                                </p>
                            </div>
                        )}
                        <button
                            onClick={this.handleRetry}
                            className="flex items-center space-x-2 bg-[#005496] text-white px-6 py-3 rounded-lg hover:bg-[#004080] transition-colors mx-auto"
                        >
                            <RefreshCcw size={16} />
                            <span>Try Again</span>
                        </button>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}