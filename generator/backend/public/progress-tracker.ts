function advanceProgress(currentIndex: number): void {
    const steps = document.querySelectorAll<HTMLElement>('.step-wizard-item');
    const successMessage = document.getElementById('successMessage') as HTMLDivElement;

    for (let i = 0; i <= currentIndex; i++) {
        steps[i].classList.remove('current-item');
        steps[i].classList.add('completed');
    }

    if (currentIndex + 1 < steps.length) {
        steps[currentIndex + 1].classList.add('current-item');
    }

    localStorage.setItem('currentStep', (currentIndex + 1).toString());
}

function restoreProgress(): void {
    const steps = document.querySelectorAll<HTMLElement>('.step-wizard-item');
    const savedStepIndex = parseInt(localStorage.getItem('currentStep') || '0', 10);

    steps.forEach((step, index) => {
        if (index < savedStepIndex) {
            step.classList.add('completed');
            step.classList.remove('current-item');
        } else if (index === savedStepIndex) {
            step.classList.add('current-item');
            step.classList.remove('completed');
        } else {
            step.classList.remove('completed', 'current-item');
        }
    });
}

document.addEventListener('DOMContentLoaded', restoreProgress);
