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
  selectedImageFile: File | null = null;
  selectedImageName = '';

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
      minorderqty: [1, [Validators.required, Validators.min(1)]],
      unit: [''],
      weightkg: [''],
      status: ['draft', Validators.required],
      imageurl: [''],
      specs: this.fb.array([]),
    });
  }

  loadCategories(): void {
    this.productService.getCategories().subscribe({
      next: (res) => {
        this.categories = res.data ?? [];
      },
      error: () => {
        this.errorMsg = 'No se pudieron cargar las categorías.';
      },
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
          imageurl: '',
        });

        this.specsArray.clear();
        (p.specs ?? []).forEach((s) => this.addSpec(s.speckey, s.specvalue, s.spectype));

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
        spectype: [type, Validators.required],
      })
    );
  }

  removeSpec(i: number): void {
    this.specsArray.removeAt(i);
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    this.selectedImageFile = file;
    this.selectedImageName = file?.name ?? '';

    if (file) {
      this.form.patchValue({ imageurl: '' });
    }
  }

  clearSelectedImage(): void {
    this.selectedImageFile = null;
    this.selectedImageName = '';
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
      category_id: Number(raw.categoryid),
      name: raw.name,
      description: raw.description || undefined,
      sku: raw.sku || undefined,
      price: Number(raw.price),
      stock: Number(raw.stock),
      min_order_qty: Number(raw.minorderqty) || 1,
      unit: raw.unit || undefined,
      weight_kg: raw.weightkg ? Number(raw.weightkg) : undefined,
      status: raw.status,
      specs: raw.specs?.length
        ? raw.specs.map((s: any) => ({
            speckey: s.speckey,
            specvalue: s.specvalue,
            spectype: s.spectype,
          }))
        : undefined,
      images: !this.selectedImageFile && raw.imageurl
        ? [
            {
              imageurl: raw.imageurl,
              source: 'url',
              isprimary: true,
            },
          ]
        : undefined,
    };

    const request$ =
      this.isEditing && this.productId
        ? this.productService.update(this.productId, payload)
        : this.productService.create(payload);

    request$.subscribe({
      next: (res) => {
        const savedProductId = this.isEditing ? this.productId : res?.data?.id;

        if (this.selectedImageFile && savedProductId) {
          this.productService.uploadImage(savedProductId, this.selectedImageFile).subscribe({
            next: () => {
              this.loading = false;
              this.successMsg = this.isEditing
                ? 'Producto actualizado correctamente.'
                : 'Producto creado correctamente.';
              setTimeout(() => this.router.navigate(['/seller/products']), 1500);
            },
            error: (err) => {
              this.loading = false;
              this.errorMsg =
                err.error?.error?.message ??
                'El producto se guardó, pero la imagen no se pudo subir.';
            },
          });
          return;
        }

        this.loading = false;
        this.successMsg = this.isEditing
          ? 'Producto actualizado correctamente.'
          : 'Producto creado correctamente.';
        setTimeout(() => this.router.navigate(['/seller/products']), 1500);
      },
      error: (err) => {
        this.loading = false;
        const zodErrors = err.error?.error?.details;

        if (zodErrors) {
          this.errorMsg = zodErrors
            .map((e: any) => `${e.path.join('.')}: ${e.message}`)
            .join(' | ');
        } else {
          this.errorMsg = err.error?.error?.message ?? 'Error al guardar el producto.';
        }
      },
    });
  }

  get name() {
    return this.form.get('name')!;
  }

  get categoryid() {
    return this.form.get('categoryid')!;
  }

  get price() {
    return this.form.get('price')!;
  }

  get stock() {
    return this.form.get('stock')!;
  }
}