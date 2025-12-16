import { Clock, AlertTriangle, Lightbulb } from 'lucide-react';

export function DetailedSteps({ recipe }) {
  // Use detailed steps if available, otherwise fall back to basic steps
  const hasDetailedSteps = recipe.detailedSteps && recipe.detailedSteps.length > 0;
  const stepsToDisplay = hasDetailedSteps ? recipe.detailedSteps : (recipe.steps || []).map((step, index) => ({
    stepNumber: index + 1,
    title: `Step ${index + 1}`,
    description: step,
    detailedInstructions: [step],
    timeMinutes: 0,
    tips: [],
    warnings: []
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-text dark:text-neutral-50">
          {hasDetailedSteps ? 'Detailed Instructions' : 'Steps'}
        </h3>
        {recipe.prepTimeMinutes && (
          <div className="flex items-center gap-1 text-xs text-muted dark:text-neutral-300">
            <Clock className="h-3 w-3" />
            Prep: {recipe.prepTimeMinutes}min
          </div>
        )}
      </div>

      <div className="space-y-6">
        {stepsToDisplay.map((step, index) => (
          <div key={index} className="relative">
            {/* Step number indicator */}
            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-accent text-white text-sm font-semibold">
                {step.stepNumber || index + 1}
              </div>
              
              <div className="flex-1 space-y-3">
                {/* Step title and description */}
                <div>
                  <h4 className="font-semibold text-text dark:text-neutral-50">
                    {step.title}
                  </h4>
                  {step.description && step.description !== step.title && (
                    <p className="mt-1 text-sm text-muted dark:text-neutral-300">
                      {step.description}
                    </p>
                  )}
                </div>

                {/* Detailed instructions */}
                {hasDetailedSteps && step.detailedInstructions && step.detailedInstructions.length > 0 && (
                  <div className="space-y-2">
                    {step.detailedInstructions.map((instruction, idx) => (
                      <div key={idx} className="flex gap-2">
                        <div className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent/60" />
                        <p className="text-sm leading-relaxed text-text/80 dark:text-neutral-200">
                          {instruction}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Time indicator */}
                {step.timeMinutes > 0 && (
                  <div className="flex items-center gap-1 text-xs text-muted dark:text-neutral-300">
                    <Clock className="h-3 w-3" />
                    {step.timeMinutes} minutes
                  </div>
                )}

                {/* Tips */}
                {step.tips && step.tips.length > 0 && (
                  <div className="rounded-lg border border-black/5 bg-blue-50 p-3 dark:border-white/10 dark:bg-blue-950/20">
                    <div className="flex items-center gap-2 text-sm font-medium text-blue-800 dark:text-blue-200">
                      <Lightbulb className="h-4 w-4" />
                      Tips
                    </div>
                    <ul className="mt-2 space-y-1 text-sm text-blue-700 dark:text-blue-300">
                      {step.tips.map((tip, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="mt-1 text-blue-500">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Warnings */}
                {step.warnings && step.warnings.length > 0 && (
                  <div className="rounded-lg border border-black/5 bg-orange-50 p-3 dark:border-white/10 dark:bg-orange-950/20">
                    <div className="flex items-center gap-2 text-sm font-medium text-orange-800 dark:text-orange-200">
                      <AlertTriangle className="h-4 w-4" />
                      Important Notes
                    </div>
                    <ul className="mt-2 space-y-1 text-sm text-orange-700 dark:text-orange-300">
                      {step.warnings.map((warning, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="mt-1 text-orange-500">•</span>
                          <span>{warning}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Equipment needed */}
      {recipe.equipment && recipe.equipment.length > 0 && (
        <div className="mt-8 rounded-lg border border-black/5 bg-gray-50 p-4 dark:border-white/10 dark:bg-neutral-900">
          <h4 className="text-sm font-semibold text-text dark:text-neutral-50 mb-3">
            Equipment Needed
          </h4>
          <div className="flex flex-wrap gap-2">
            {recipe.equipment.map((item, index) => (
              <span
                key={index}
                className="rounded-md border border-black/10 bg-white px-2 py-1 text-xs text-text dark:border-white/10 dark:bg-neutral-800 dark:text-neutral-200"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* General notes */}
      {recipe.notes && recipe.notes.length > 0 && (
        <div className="mt-8 rounded-lg border border-black/5 bg-yellow-50 p-4 dark:border-white/10 dark:bg-yellow-950/20">
          <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-3">
            Additional Notes
          </h4>
          <ul className="space-y-2 text-sm text-yellow-700 dark:text-yellow-300">
            {recipe.notes.map((note, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="mt-1 text-yellow-500">•</span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
