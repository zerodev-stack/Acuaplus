import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { ProductService, Product } from '../../core/services/product.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit, OnDestroy {

  products: Product[] = [];
  loading = true;
  error = '';

  // Paginación
  currentPage = 1;
  totalPages = 1;
  totalProducts = 0;
  readonly pageSize = 12;

  // Formulario de filtros
  filterForm: FormGroup;

  // Para cancelar suscripciones al destruir el componente
  private destroy$ = new Subject<void>();

  // Toast de carrito
  cartToast = '';

  constructor(
    private productService: ProductService,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      search:   [''],
      category: [''],
      minPrice: [''],
      maxPrice: [''],
    });
  }

  ngOnInit() {
    this.loadProducts();

    // Buscar automáticamente al escribir (con 400ms de espera)
    this.filterForm.get('search')!.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.currentPage = 1;
      this.loadProducts();
    });

    // Aplicar filtros al cambiar categoría
    this.filterForm.get('category')!.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.currentPage = 1;
      this.loadProducts();
    });
  }

  loadProducts() {
    this.loading = true;
    this.error = '';

    const { search, category, minPrice, maxPrice } = this.filterForm.value;

    this.productService.getProducts({
      search:   search   || undefined,
      category: category || undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      page:     this.currentPage,
      limit:    this.pageSize
    }).subscribe({
      next: (res) => {
        this.products     = res.data;
        this.totalProducts = res.total;
        this.totalPages    = res.totalPages;
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar los productos. Intenta de nuevo más tarde.';
        this.loading = false;
      }
    });
  }

  applyPriceFilter() {
    this.currentPage = 1;
    this.loadProducts();
  }

  clearFilters() {
    this.filterForm.reset({ search: '', category: '', minPrice: '', maxPrice: '' });
    this.currentPage = 1;
    this.loadProducts();
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadProducts();
    // Scroll arriba al cambiar página
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Arreglo de páginas para mostrar en la paginación
  get pageNumbers(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, this.currentPage - 2);
    const end   = Math.min(this.totalPages, this.currentPage + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  onAddToCart(product: Product) {
    // Por ahora muestra un toast — en el siguiente módulo lo conectamos al carrito real
    this.cartToast = `"${product.name}" agregado al carrito`;
    setTimeout(() => this.cartToast = '', 3000);
  }

  get categories() {
    return this.productService.categories;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}