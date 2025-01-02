import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BirthdayService } from '../../services/birthday.service';
import { Birthday } from '../../models/birthday.model';

@Component({
  selector: 'app-add-birthday',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-birthday.component.html',
  styleUrls: ['./add-birthday.component.css']
})
export class AddBirthdayComponent {
  newFriendName = '';
  newFriendBirthday = '';

  constructor(private birthdayService: BirthdayService) {}

  addFriend() {
    const name = this.newFriendName.trim();
    const birthday = this.newFriendBirthday.trim();
    if (name && birthday) {
      const newBirthday: Birthday = { name, birthday };
      // Llamada al servicio para guardar el cumpleaños
      this.birthdayService.addBirthday(newBirthday).subscribe({
        next: () => {
          // Tras "Agregar", podría cerrarse el modal automáticamente.
          // Uso data-bs-dismiss en el botón "Agregar" si lo deseas.
          console.log('Cumpleaños agregado correctamente');
        },
        error: (err) => console.error(err)
      });
    }
  }
}
