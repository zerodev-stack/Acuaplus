import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService, Category } from '../../core/services/product.service';

@Component({
  selector: 'app-seller-product-form',
  templateUrl: './seller-product-form.component.html',
  styleUrls: ['./seller-product-form.component.css'],
})
export class SellerProductFormComponent implements OnInit {
  form!: FormGroup;
  categories: Category[] = [];
  loading = false;
  loadingData = true;
  errorMsg = '';
  successMsg = '';
  isEditing = false;
  productId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadCategories();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditing = true;
      this.productId = Number(id);
      this.loadProduct(this.productId);
    } else {
      this.loadingData = false;
    }
  }

  buildForm(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
      categoryid: ['', Validators.required],
      description: [''],
      sku: [''],
      price: ['', [Validators.required, Validators.min(1)]],
      stock: ['', [Validators.required, Validators.min(0)]],
      minorderqty: [1, Validators.min(1)],
      unit: [''],
      weightkg: [''],
      status: ['draft'],
      imageurl: [''],
      specs: this.fb.array([]),
    });
  }

  loadCategories(): void {
    this.productService.getCategories().subscribe({
      next: (res) => (this.categories = res.data ?? []),
      error: () => (this.errorMsg = 'No se pudieron cargar las categorías.'),
    });
  }

  loadProduct(id: number): void {
    this.productService.getById(id).subscribe({
      next: (res) => {
        const p = res.data;
        this.form.patchValue({
          name: p.name,
          categoryid: p.categoryid,
          description: p.description ?? '',
          sku: p.sku ?? '',
          price: p.price,
          stock: p.stock,
          minorderqty: p.minorderqty,
          unit: p.unit ?? '',
          weightkg: p.weightkg ?? '',
          status: p.status,
        });
        // Cargar specs
        this.specsArray.clear();
        (p.specs ?? []).forEach((s: any) => this.addSpec(s.speckey, s.specvalue, s.spectype));
        this.loadingData = false;
      },
      error: () => {
        this.errorMsg = 'Error al cargar el producto.';
        this.loadingData = false;
      },
    });
  }

  get specsArray(): FormArray {
    return this.form.get('specs') as FormArray;
  }

  addSpec(key = '', value = '', type: 'text' | 'number' | 'range' = 'text'): void {
    this.specsArray.push(
      this.fb.group({
        speckey: [key, Validators.required],
        specvalue: [value, Validators.required],
        spectype: [type],
      })
    );
  }

  removeSpec(i: number): void {
    this.specsArray.removeAt(i);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMsg = '';
    this.successMsg = '';

    const raw = this.form.value;
    const payload: any = {
      categoryid: Number(raw.categoryid),
      name: raw.name,
      description: raw.description || undefined,
      sku: raw.sku || undefined,
      price: Number(raw.price),
      stock: Number(raw.stock),
      minorderqty: Number(raw.minorderqty) || 1,
      unit: raw.unit || undefined,
      weightkg: raw.weightkg ? Number(raw.weightkg) : undefined,
      status: raw.status,
      specs: raw.specs.length > 0 ? raw.specs : undefined,
    };

    // Imagen por URL si se proporcionó
    if (raw.imageurl) {
      payload.images = [{ imageurl: raw.imageurl, source: 'url', isprimary: true }];
    }

    const request$ = this.isEditing && this.productId
      ? this.productService.update(this.productId, payload)
      : this.productService.create(payload);

    request$.subscribe({
      next: () => {
        this.loading = false;
        this.successMsg = this.isEditing
          ? 'Producto actualizado correctamente.'
          : 'Producto creado correctamente.';
        setTimeout(() => this.router.navigate(['/seller/products']), 1500);
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err.error?.error?.message ?? 'Error al guardar el producto.';
      },
    });
  }

  // Getters para validación
  get name() { return this.form.get('name')!; }
  get categoryid() { return this.form.get('categoryid')!; }
  get price() { return this.form.get('price')!; }
  get stock() { return this.form.get('stock')!; }
}