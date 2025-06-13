import ErrorBoundary from "@/Components/Error/ErrorBoundary";
import Applications from './Applications';

export default function ApplicationsPage() {
  return (
    <ErrorBoundary>
      <Applications />
    </ErrorBoundary>
  )
}