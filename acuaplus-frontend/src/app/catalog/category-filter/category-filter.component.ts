import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CategoryService, Category } from '../../core/services/category.service';

@Component({
  selector: 'app-category-filter',
  templateUrl: './category-filter.component.html',
  styleUrls: ['./category-filter.component.css']
})
export class CategoryFilterComponent implements OnInit {
  @Output() categorySelected = new EventEmitter<number | null>();

  categories: Category[] = [];
  selectedId: number | null = null;
  loading = true;

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.categoryService.getCategories().subscribe({
      next: (res) => {
        this.categories = res.data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  select(id: number | null): void {
    this.selectedId = id;
    this.categorySelected.emit(id);
  }
}