import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  // Para usar directivas de enrutado como <router-outlet> o routerLink
  imports: [RouterModule],
  templateUrl: './app.component.html',
})
export class AppComponent {}

