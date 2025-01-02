import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BirthdayService } from '../../services/birthday.service';
import { Birthday } from '../../models/birthday.model';
import { AddBirthdayComponent } from '../add-birthday/add-birthday.component';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, AddBirthdayComponent],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit {
  @ViewChild(AddBirthdayComponent) addBirthdayComp!: AddBirthdayComponent;

  months: string[] = [
    'Enero', 'Febrero', 'Marzo',
    'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre',
    'Octubre', 'Noviembre', 'Diciembre'
  ];
  birthdaysByMonth: { [month: number]: Birthday[] } = {};

  constructor(private birthdayService: BirthdayService) {}

  ngOnInit(): void {
    // Si ya estaban en memoria, no recarga. Si no, hace GET /api/birthdays
    this.birthdayService.loadBirthdays().subscribe(() => {
      this.birthdaysByMonth = this.birthdayService.getBirthdaysByMonth();
    });
  }

}
