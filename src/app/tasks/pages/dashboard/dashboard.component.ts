import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { TaskService } from '../../../core/services/task.service';
import { Task } from '../../../core/models/task.model';
import { TaskFormComponent } from '../../components/task-form/task-form.component';

// Material Imports
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatCardModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private taskService = inject(TaskService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  displayedColumns: string[] = ['id', 'title', 'description', 'status', 'actions'];
  dataSource: Task[] = [];

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.taskService.getTasks().subscribe({
      next: (tasks) => this.dataSource = tasks,
      error: (err) => this.showSnackBar('Error al cargar tareas')
    });
  }

  // Modificado para aceptar una tarea opcional (Editar vs Crear)
  openTaskForm(task?: Task): void {
    const dialogRef = this.dialog.open(TaskFormComponent, {
      width: '400px',
      disableClose: true,
      data: task ? { ...task } : null // Pasamos los datos si es edicion
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (task && task.id) {
          this.updateTask(task.id, result);
        } else {
          this.saveTask(result);
        }
      }
    });
  }

  saveTask(taskData: Task): void {
    this.taskService.createTask(taskData).subscribe({
      next: () => {
        this.showSnackBar('Tarea creada con exito');
        this.loadTasks();
      },
      error: () => this.showSnackBar('Error al guardar la tarea')
    });
  }

  updateTask(id: number, taskData: Task): void {
    this.taskService.updateTask(id, taskData).subscribe({
      next: () => {
        this.showSnackBar('Tarea actualizada con exito');
        this.loadTasks();
      },
      error: () => this.showSnackBar('Error al actualizar la tarea')
    });
  }

  deleteTask(id: number): void {
    if (confirm('¿Estas seguro de eliminar esta tarea?')) {
      this.taskService.deleteTask(id).subscribe({
        next: () => {
          this.showSnackBar('Tarea eliminada');
          this.dataSource = this.dataSource.filter(t => t.id !== id);
        },
        error: () => this.showSnackBar('Error al eliminar la tarea')
      });
    }
  }

  private showSnackBar(message: string): void {
    this.snackBar.open(message, 'Cerrar', { duration: 3000 });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}