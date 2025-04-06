import { CheckIcon } from '@heroicons/react/24/outline';

interface ProgressStepsProps {
  currentStep: number;
  steps: string[];
}

const ProgressSteps = ({ currentStep, steps }: ProgressStepsProps) => {
  return (
    <div className="mb-6">
      <div className="flex items-center">
        {steps.map((step, index) => (
          <div key={step} className="flex items-center">
            <div
              className={`flex items-center justify-center rounded-full h-8 w-8 ${
                index + 1 <= currentStep
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {index + 1 < currentStep ? (
                <CheckIcon className="h-5 w-5" />
              ) : (
                index + 1
              )}
            </div>
            <div
              className={`ml-2 text-sm ${
                index + 1 <= currentStep ? 'font-medium text-gray-900' : 'text-gray-500'
              }`}
            >
              {step}
            </div>
            {index < steps.length - 1 && (
              <div
                className={`mx-2 h-0.5 w-8 ${
                  index + 1 < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressSteps;