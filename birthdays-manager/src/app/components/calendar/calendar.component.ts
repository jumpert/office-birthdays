import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BirthdayService } from '../../services/birthday.service';
import { Birthday } from '../../models/birthday.model';
import { AddBirthdayComponent } from '../add-birthday/add-birthday.component';


@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, AddBirthdayComponent, FormsModule],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit {
  months: string[] = [
    'Enero', 'Febrero', 'Marzo',
    'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre',
    'Octubre', 'Noviembre', 'Diciembre'
  ];
  birthdaysByMonth: { [month: number]: Birthday[] } = {};
  currentMonth: number = 0;

  // Para edición
  selectedBirthday: Birthday | null = null;
  editName = '';
  editDate = '';

  constructor(private birthdayService: BirthdayService) {}

  ngOnInit(): void {
    // Determinar mes actual
    const now = new Date();
    this.currentMonth = now.getMonth() + 1;

    // Cargar data
    this.birthdayService.loadBirthdays().subscribe(() => {
      this.birthdaysByMonth = this.birthdayService.getBirthdaysByMonth();
    });
  }

  // Abre el modal, pasando los datos del cumpleaños a editar
  openEditModal(friend: Birthday) {
    this.selectedBirthday = { ...friend }; // clon para no mutar directamente
    this.editName = friend.name;
    this.editDate = friend.birthday; // "YYYY-MM-DD"
  }

  // Confirmar edición
  saveEdit() {
    if (!this.selectedBirthday) return;
    const updated: Birthday = {
      ...this.selectedBirthday,
      name: this.editName.trim(),
      birthday: this.editDate
    };

    // Puedes pedir confirmación extra con `if (confirm('¿Confirmar edición?')) { ... }`
    // O directamente procesar:
    this.birthdayService.updateBirthday(updated).subscribe({
      next: () => {
        // Actualiza la lista
        this.birthdaysByMonth = this.birthdayService.getBirthdaysByMonth();
        console.log('Cumpleaños editado satisfactoriamente');
      },
      error: (err) => console.error(err)
    });
  }

  // Confirmar borrado
  deleteBirthday() {
    if (!this.selectedBirthday?.id) return;
    // Confirmación extra
    if (!confirm('¿Estás seguro de eliminar este cumpleaños?')) {
      return; // user canceló
    }

    this.birthdayService.deleteBirthday(this.selectedBirthday.id).subscribe({
      next: () => {
        this.birthdaysByMonth = this.birthdayService.getBirthdaysByMonth();
        console.log('Cumpleaños eliminado');
      },
      error: (err) => console.error(err)
    });
  }
}
