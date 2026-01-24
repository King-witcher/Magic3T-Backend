import { useState } from 'react'
import { Button } from '@/components/ui'
import { CellState } from './cell-state'
import { DemoBoard } from './demo-board'

export function ForkStrategyDemo() {
  const [step, setStep] = useState(0)

  // Fork example: Player picks 2, 6 creating a fork with 4 and 7
  const steps = [
    {
      title: 'Initial Position',
      description: 'You (blue) have picked 2. Your opponent (red) has picked 5.',
      cells: [
        { value: 1, state: 'available' as CellState },
        { value: 2, state: 'ally' as CellState },
        { value: 3, state: 'available' as CellState },
        { value: 4, state: 'available' as CellState },
        { value: 5, state: 'enemy' as CellState },
        { value: 6, state: 'available' as CellState },
        { value: 7, state: 'available' as CellState },
        { value: 8, state: 'available' as CellState },
        { value: 9, state: 'available' as CellState },
      ],
    },
    {
      title: 'Creating a Fork',
      description: 'You pick 6. Now you threaten TWO winning combinations: 2+6+7=15 AND 2+4+9=15',
      cells: [
        { value: 1, state: 'available' as CellState },
        { value: 2, state: 'ally' as CellState },
        { value: 3, state: 'available' as CellState },
        { value: 4, state: 'available' as CellState },
        { value: 5, state: 'enemy' as CellState },
        { value: 6, state: 'highlight-ally' as CellState },
        { value: 7, state: 'available' as CellState },
        { value: 8, state: 'available' as CellState },
        { value: 9, state: 'available' as CellState },
      ],
    },
    {
      title: 'The Dilemma',
      description:
        'Your opponent can only block ONE threat! If they take 7, you take 4 and 9 to win. If they take 4 or 9, you take 7 to win.',
      cells: [
        { value: 1, state: 'available' as CellState },
        { value: 2, state: 'ally' as CellState },
        { value: 3, state: 'available' as CellState },
        { value: 4, state: 'available' as CellState },
        { value: 5, state: 'enemy' as CellState },
        { value: 6, state: 'ally' as CellState },
        { value: 7, state: 'enemy' as CellState },
        { value: 8, state: 'available' as CellState },
        { value: 9, state: 'available' as CellState },
      ],
    },
    {
      title: 'Victory!',
      description:
        'They blocked 7, but you complete 2+4+9=15 for the win! This is the power of fork strategies.',
      cells: [
        { value: 1, state: 'available' as CellState },
        { value: 2, state: 'highlight-ally' as CellState },
        { value: 3, state: 'available' as CellState },
        { value: 4, state: 'highlight-ally' as CellState },
        { value: 5, state: 'enemy' as CellState },
        { value: 6, state: 'ally' as CellState },
        { value: 7, state: 'enemy' as CellState },
        { value: 8, state: 'available' as CellState },
        { value: 9, state: 'highlight-ally' as CellState },
      ],
    },
  ]

  const currentStep = steps[step]

  return (
    <div className="flex flex-col items-center gap-4 p-6 rounded-lg bg-grey-3/40 border border-gold-5/30">
      <div className="text-center mb-2">
        <h4 className="font-serif font-bold text-lg text-gold-2">{currentStep.title}</h4>
        <p className="text-grey-1 text-sm mt-1 max-w-md">{currentStep.description}</p>
      </div>

      <DemoBoard cells={currentStep.cells} />

      <div className="flex items-center gap-4 mt-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
        >
          Previous
        </Button>
        <span className="text-grey-1 text-sm">
          Step {step + 1} of {steps.length}
        </span>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))}
          disabled={step === steps.length - 1}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
