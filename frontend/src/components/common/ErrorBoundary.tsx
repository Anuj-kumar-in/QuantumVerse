import React, { Component,type  ReactNode } from 'react'
import Card from './Card'
import Button from './Button'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)

    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)

    this.setState({
      error,
      errorInfo
    })
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card variant="default" className="max-w-2xl w-full">
            <div className="text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h1 className="text-2xl font-bold text-red-400 mb-4">
                Blockchain Error Detected
              </h1>

              <p className="text-gray-400 mb-6">
                Something went wrong with the blockchain connection or smart contract interaction.
                This could be due to network issues, contract problems, or wallet connectivity.
              </p>

              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold text-red-300 mb-2">Error Details:</h3>
                <pre className="text-sm text-red-200 whitespace-pre-wrap overflow-auto max-h-40">
                  {this.state.error?.message || 'Unknown error occurred'}
                </pre>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    variant="quantum"
                    onClick={this.handleReset}
                    className="w-full"
                  >
                    Try Again
                  </Button>

                  <Button
                    variant="secondary"
                    onClick={() => window.location.reload()}
                    className="w-full"
                  >
                    Refresh Page
                  </Button>
                </div>

                <div className="text-sm text-gray-500 space-y-1">
                  <p>If the problem persists:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Check your wallet connection</li>
                    <li>Ensure you're on the correct network (Hedera)</li>
                    <li>Verify smart contracts are deployed</li>
                    <li>Try refreshing your browser</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary