/* src/app/services/birthday.service.ts */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

import { Birthday } from '../models/birthday.model';

@Injectable({
  providedIn: 'root'
})
export class BirthdayService {
  private apiUrl = 'http://localhost:3000/api/birthdays';

  private birthdays: Birthday[] = [];

  constructor(private http: HttpClient) {}

  // Cargar desde backend si todavía no están en memoria
  loadBirthdays(): Observable<Birthday[]> {
    if (this.birthdays.length > 0) {
      return of(this.birthdays);
    } else {
      return this.http.get<Birthday[]>(this.apiUrl).pipe(
        tap((data) => {
          this.birthdays = data;
        })
      );
    }
  }

  // Devolver la lista en memoria
  getBirthdays(): Birthday[] {
    return this.birthdays;
  }

  // Agregar un nuevo cumpleaños => POST
  addBirthday(newBirthday: Birthday): Observable<Birthday> {
    return this.http.post<Birthday>(this.apiUrl, newBirthday).pipe(
      tap((created) => {
        // Actualizamos la lista en memoria
        this.birthdays.push(created);
      })
    );
  }

  // Eliminar => DELETE
  deleteBirthday(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        // Remover de la lista en memoria
        this.birthdays = this.birthdays.filter(b => b.id !== id);
      })
    );
  }

  // Obtener próximos cumpleaños (ej. 15 días) a partir de la lista en memoria
  getUpcomingBirthdays(daysRange: number = 15): Birthday[] {
    const now = new Date();
    const result: Birthday[] = [];

    for (const b of this.birthdays) {
      const bDate = new Date(b.birthday);
      bDate.setFullYear(now.getFullYear());

      let diffDays = (bDate.getTime() - now.getTime()) / (1000 * 3600 * 24);
      // Si ya pasó, consideramos el siguiente año
      if (diffDays < 0) {
        bDate.setFullYear(now.getFullYear() + 1);
        diffDays = (bDate.getTime() - now.getTime()) / (1000 * 3600 * 24);
      }
      if (diffDays >= 0 && diffDays <= daysRange) {
        result.push(b);
      }
    }

    // Ordenar por día más cercano
    result.sort((a, b) => {
      const dateA = new Date(a.birthday);
      const dateB = new Date(b.birthday);
      dateA.setFullYear(now.getFullYear());
      dateB.setFullYear(now.getFullYear());
      return dateA.getTime() - dateB.getTime();
    });

    return result;
  }

  // Agrupar por mes
  // birthday.service.ts
  getBirthdaysByMonth(): { [month: number]: Birthday[] } {
    const grouped: { [month: number]: Birthday[] } = {};

    this.birthdays.forEach(b => {
      // Forzar las 12:00 (hora local) para evitar que se nos vaya
      // al día anterior en husos horarios negativos.
      const date = new Date(`${b.birthday}T12:00:00`);
      const monthIndex = date.getMonth() + 1; // enero=0
      if (!grouped[monthIndex]) {
        grouped[monthIndex] = [];
      }
      grouped[monthIndex].push(b);
    });

    return grouped;
  }

}


