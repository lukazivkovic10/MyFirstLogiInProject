import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-calander',
  templateUrl: './calander.component.html',
  styleUrls: ['./calander.component.css']
})
export class CalanderComponent {
  daysInMonth: number[] = Array.from({ length: 31 }, (_, i) => i + 1);
  selectedDate: number | null = null;

  @Output() dateSelected = new EventEmitter<number | undefined>();

  selectDate(date: number) {
    if (this.selectedDate === date) {
      this.selectedDate = null;
    } else {
      this.selectedDate = date;
    }

    // Emit the selected date or undefined
    this.dateSelected.emit(this.selectedDate !== null ? this.selectedDate : undefined);
  }
}
