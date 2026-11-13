type Props = {
  total: number
  current: number
}

/** A segmented bar with a plain-language count. A single-step form has no progress. */
export default function FormStepTracker({ total, current }: Props) {
  if (total < 2) return null

  return (
    <div data-part="progress">
      <p data-part="step-count">
        Step {current + 1} of {total}
      </p>
      <ol data-part="steps" aria-label="Form progress">
        {Array.from({ length: total }).map((_, index) => (
          <li
            key={index}
            data-part="step"
            data-state={index < current ? 'done' : index === current ? 'current' : 'todo'}
            aria-current={index === current ? 'step' : undefined}
          >
            <span className="sr-only">
              Step {index + 1}{index < current ? ', complete' : index === current ? ', current' : ''}
            </span>
          </li>
        ))}
      </ol>
    </div>
  )
}
