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

  // Carga inicial desde el backend si no están en memoria
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

  // Devuelve la lista en memoria
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

  /**
   * Restar manualmente 3 horas al `date` para simular la hora de Montevideo
   * (UTC-3). No contempla posibles cambios futuros de DST.
   */
  getMontevideoNow(date: Date): Date {
    const offsetMs = 3 * 60 * 60 * 1000; // 3 horas en ms
    return new Date(date.getTime() - offsetMs);
  }

  /**
   * Retorna los cumpleaños que ocurrirán en los próximos `daysRange` días,
   * calculando la "fecha actual" con UTC-3 (Montevideo).
   */
  getUpcomingBirthdays(daysRange: number = 15): Birthday[] {
    // 1) Hora real del sistema
    const now = new Date();
    // 2) Ajustarla a UTC-3 (Montevideo)
    const nowMvd = this.getMontevideoNow(now);

    const result: Birthday[] = [];

    for (const b of this.birthdays) {
      // Asumimos b.birthday = "YYYY-MM-DD"
      const bDate = new Date(b.birthday);
      // Ajustamos el año actual en la fecha del cumpleaños
      bDate.setFullYear(nowMvd.getFullYear());

      // Diferencia en días: (cumple - hoyMvd)
      let diffDays = (bDate.getTime() - nowMvd.getTime()) / (1000 * 3600 * 24);

      // Si ya pasó en el año actual, sumamos 1 año
      if (diffDays < 0) {
        bDate.setFullYear(nowMvd.getFullYear() + 1);
        diffDays = (bDate.getTime() - nowMvd.getTime()) / (1000 * 3600 * 24);
      }

      // Si está dentro del rango
      if (diffDays >= 0 && diffDays <= daysRange) {
        result.push(b);
      }
    }

    // Ordenar por la fecha más cercana
    result.sort((a, b) => {
      const dateA = new Date(a.birthday);
      const dateB = new Date(b.birthday);
      dateA.setFullYear(nowMvd.getFullYear());
      dateB.setFullYear(nowMvd.getFullYear());
      return dateA.getTime() - dateB.getTime();
    });

    return result;
  }

  /**
   * Agrupar por mes teniendo en cuenta UTC-3 (Montevideo)
   * Forzamos “T12:00:00” para evitar que un huso negativo
   * empuje la fecha al día anterior.
   */
  getBirthdaysByMonth(): { [month: number]: Birthday[] } {
    const grouped: { [month: number]: Birthday[] } = {};

    this.birthdays.forEach(b => {
      // "YYYY-MM-DD" + "T12:00:00" para asegurar que no retroceda al día anterior
      const date = new Date(`${b.birthday}T12:00:00`);

      // Además, podríamos restar 3 horas para forzar UTC-3
      const dateMvd = this.getMontevideoNow(date);

      const monthIndex = dateMvd.getMonth() + 1; // enero=0 => +1
      if (!grouped[monthIndex]) {
        grouped[monthIndex] = [];
      }
      grouped[monthIndex].push(b);
    });

    return grouped;
  }

  // Actualizar cumpleaños => PUT
  updateBirthday(birthday: Birthday): Observable<Birthday> {
    return new Observable(observer => {
      this.http.put<Birthday>(`${this.apiUrl}/${birthday.id}`, birthday)
        .subscribe({
          next: updated => {
            const idx = this.birthdays.findIndex(b => b.id === updated.id);
            if (idx !== -1) {
              this.birthdays[idx] = updated;
            }
            observer.next(updated);
            observer.complete();
          },
          error: (err) => observer.error(err)
        });
    });
  }

  // Borrar cumpleaños => DELETE
  deleteBirthday(id: number): Observable<any> {
    return new Observable(observer => {
      this.http.delete(`${this.apiUrl}/${id}`).subscribe({
        next: () => {
          this.birthdays = this.birthdays.filter(b => b.id !== id);
          observer.next({ message: 'Deleted' });
          observer.complete();
        },
        error: (err) => observer.error(err)
      });
    });
  }
}
