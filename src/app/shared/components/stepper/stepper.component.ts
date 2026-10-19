import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

export type StepStatus = 'completed' | 'active' | 'pending';

@Component({
  selector: 'app-stepper',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stepper.component.html',
  styleUrls: ['./stepper.component.css']
})
export class StepperComponent {
  @Input() steps: string[] = [];
  @Input() currentStep = 1;
  @Input() allCompleted = false;

  getStatus(index: number): StepStatus {
    const step = index + 1;
    if (this.allCompleted || step < this.currentStep) return 'completed';
    if (step === this.currentStep) return 'active';
    return 'pending';
  }
}
