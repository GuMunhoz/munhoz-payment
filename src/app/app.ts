import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { SimulatorPanelComponent } from './features/simulator-panel/simulator-panel.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    SimulatorPanelComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {}
