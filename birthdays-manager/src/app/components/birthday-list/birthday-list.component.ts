/* src/app/components/birthday-list/birthday-list.component.ts */
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
  upcomingBirthdays: Birthday[] = [];
  newFriendName = '';
  newFriendBirthday = '';

  constructor(private birthdayService: BirthdayService) {}

  ngOnInit(): void {
    this.birthdayService.loadBirthdays().subscribe(() => {
      // Asumiendo que getUpcomingBirthdays(30) retorna todos los cumple de
      // los próximos 30 días, ordenados cronológicamente
      this.upcomingBirthdays = this.birthdayService.getUpcomingBirthdays(30);
    });
  }

  private updateUpcomingList() {
    this.upcomingBirthdays = this.birthdayService.getUpcomingBirthdays(15);
  }

  deleteFriend(id: number) {
    this.birthdayService.deleteBirthday(id).subscribe({
      next: () => {
        // Eliminado del servidor y de la lista en memoria
        this.updateUpcomingList();
      },
      error: (err) => console.error(err)
    });
  }

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
}
