import { Matrix } from "@/components/eisenhower/matrix"

export default function Home() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">My Tasks</h1>
      </div>
      <Matrix />
    </div>
  )
}
