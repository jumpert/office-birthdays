import { Routes } from '@angular/router';
import { BirthdayListComponent } from './components/birthday-list/birthday-list.component';
import { CalendarComponent } from './components/calendar/calendar.component';

export const routes: Routes = [
  { path: '', component: BirthdayListComponent },
  { path: 'calendar', component: CalendarComponent },
  // Puedes agregar más rutas si las necesitas
];
