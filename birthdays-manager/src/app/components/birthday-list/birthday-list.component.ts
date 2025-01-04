import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BirthdayService } from '../../services/birthday.service';
import { Birthday } from '../../models/birthday.model';

@Component({
  selector: 'app-birthday-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './birthday-list.component.html',
  styleUrls: ['./birthday-list.component.css']
})
export class BirthdayListComponent implements OnInit {
  // Listas separadas
  todaysBirthdays: Birthday[] = [];
  upcomingBirthdays: Birthday[] = [];
  nextWeekBirthdays: Birthday[] = [];

  // (si deseas un formulario para agregar, etc.)
  newFriendName = '';
  newFriendBirthday = '';

  constructor(private birthdayService: BirthdayService) {}

  ngOnInit(): void {
    // Cargamos la lista de cumpleaños (30 días es un ejemplo)
    this.birthdayService.loadBirthdays().subscribe(() => {
      const allSoon = this.birthdayService.getUpcomingBirthdays(30);

      // Separamos en HOY vs Próximos
      const now = new Date();
      const dayToday = now.getDate();
      const monthToday = now.getMonth();

      this.todaysBirthdays = allSoon.filter(b => this.isToday(b.birthday, dayToday, monthToday));
      this.upcomingBirthdays = allSoon.filter(b => !this.isToday(b.birthday, dayToday, monthToday));
      this.nextWeekBirthdays = allSoon.filter(b => this.isBirthdaySoon(b.birthday, 7));
      // eliminar de upcomingBirthdays los que están en nextWeekBirthdays
      this.upcomingBirthdays = this.upcomingBirthdays.filter(b => !this.nextWeekBirthdays.includes(b));
    });
  }

  // Determina si 'birthdayStr' corresponde a HOY (mismo día y mes)
  private isToday(birthdayStr: string, dayToday: number, monthToday: number): boolean {
    const bDate = new Date(birthdayStr);
    bDate.setFullYear(new Date().getFullYear());
    return (
      bDate.getDate() === dayToday &&
      bDate.getMonth() === monthToday
    );
  }

  // Opcional, para resaltar si faltan <=7 días
  isBirthdaySoon(birthdayStr: string, days: number): boolean {
    const now = new Date();
    const bDate = new Date(birthdayStr);
    bDate.setFullYear(now.getFullYear());

    let diffDays = (bDate.getTime() - now.getTime()) / (1000 * 3600 * 24);
    if (diffDays < 0) {
      bDate.setFullYear(now.getFullYear() + 1);
      diffDays = (bDate.getTime() - now.getTime()) / (1000 * 3600 * 24);
    }

    return diffDays >= 0 && diffDays <= days;
  }

  nextWeek() {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    this.nextWeekBirthdays = this.birthdayService.getUpcomingBirthdays(7).filter(
      b => new Date(b.birthday) <= nextWeek
    );
  }

}