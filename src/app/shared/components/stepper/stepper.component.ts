import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

export type StepperState = 'checkout' | 'success' | 'error';

@Component({
  selector: 'app-stepper',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stepper.component.html',
  styleUrls: ['./stepper.component.css']
})
export class StepperComponent {
  @Input() currentStep: 1 | 2 | 3 = 2;
  @Input() state: StepperState = 'checkout';
}
