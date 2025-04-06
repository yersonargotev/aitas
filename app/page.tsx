import { Matrix } from "@/components/eisenhower/matrix"

export default function Home() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Eisenhower Matrix</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Organize your tasks based on their urgency and importance using the Eisenhower Matrix.
          Prioritize what really matters and make better decisions about your time.
        </p>
      </div>
      <Matrix />
    </div>
  )
}
