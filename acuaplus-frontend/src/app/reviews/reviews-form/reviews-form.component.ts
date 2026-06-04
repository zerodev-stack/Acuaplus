import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReviewService, Review } from '../../core/services/reviews.service';

@Component({
  selector: 'app-review-form',
  templateUrl: './review-form.component.html',
  styleUrls: ['./review-form.component.css']
})
export class ReviewFormComponent implements OnInit {
  @Input() productId!: number;
  @Input() orderId!: number;
  @Output() reviewCreated = new EventEmitter<Review>();

  form!: FormGroup;
  submitting = false;
  successMsg = '';
  errorMsg = '';
  hoveredStar = 0;

  constructor(
    private fb: FormBuilder,
    private reviewService: ReviewService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      rating:  [0, [Validators.required, Validators.min(1), Validators.max(5)]],
      comment: ['', [Validators.maxLength(500)]]
    });
  }

  setRating(star: number): void {
    this.form.patchValue({ rating: star });
  }

  get rating(): number {
    return this.form.get('rating')?.value ?? 0;
  }

  get commentLength(): number {
    return this.form.get('comment')?.value?.length ?? 0;
  }

  submit(): void {
    if (this.form.invalid || this.rating === 0) {
      this.errorMsg = 'Por favor selecciona una calificación.';
      return;
    }

    this.submitting = true;
    this.errorMsg = '';
    this.successMsg = '';

    const payload = {
      product_id: this.productId,
      order_id:   this.orderId,
      rating:     this.rating,
      comment:    this.form.get('comment')?.value?.trim() || undefined
    };

    this.reviewService.createReview(payload).subscribe({
      next: (res) => {
        this.successMsg = '¡Gracias por tu calificación!';
        this.submitting = false;
        this.form.reset({ rating: 0, comment: '' });
        this.reviewCreated.emit(res.data);
      },
      error: (err) => {
        const msg = err?.error?.message;
        if (msg === 'Ya calificaste este producto en esta orden') {
          this.errorMsg = 'Ya calificaste este producto en esta orden.';
        } else if (msg === 'Solo puedes calificar productos de órdenes entregadas') {
          this.errorMsg = 'Solo puedes calificar órdenes entregadas.';
        } else {
          this.errorMsg = msg || 'Ocurrió un error al enviar la calificación.';
        }
        this.submitting = false;
      }
    });
  }
}