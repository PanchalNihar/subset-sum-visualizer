import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { InputFormComponent } from './components/input-form/input-form.component';
import { SubsetDisplayComponent } from './components/subset-display/subset-display.component';
import { TreeVisualizationComponent } from './components/tree-visualization/tree-visualization.component';

@Component({
  selector: 'app-root',
  imports: [InputFormComponent,SubsetDisplayComponent,TreeVisualizationComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'subset-sum-visualizer';
}
