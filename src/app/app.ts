import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { environment } from '../environments/environment';

@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  readonly title = 'CV Admin Panel';
  readonly portfolioUrl = environment.portfolioUrl;
  readonly sanityProjectId = environment.sanity.projectId;
  readonly dataset = environment.sanity.dataset;
}
