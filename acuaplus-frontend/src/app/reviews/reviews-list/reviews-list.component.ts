import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ReviewService, Review } from '../../core/services/reviews.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-review-list',
  templateUrl: './review-list.component.html',
  styleUrls: ['./review-list.component.css']
})
export class ReviewListComponent implements OnInit, OnChanges {
  @Input() productId!: number;
 
  @Input() orderId: number | null = null;

  reviews: Review[] = [];
  total = 0;
  page = 1;
  totalPages = 1;
  loading = false;
  error = '';

  isBuyer = false;
  showForm = false;

  constructor(
    private reviewService: ReviewService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUser;
    this.isBuyer = user?.role === 'buyer';
    this.loadReviews();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['productId'] && !changes['productId'].firstChange) {
      this.page = 1;
      this.loadReviews();
    }
  }

  loadReviews(): void {
    this.loading = true;
    this.error = '';
    this.reviewService.getProductReviews(this.productId, this.page).subscribe({
      next: (res) => {
        this.reviews = res.data;
        this.total = res.total;
        this.totalPages = res.totalPages;
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar las reseñas.';
        this.loading = false;
      }
    });
  }

  onReviewCreated(review: Review): void {
    this.showForm = false;
    this.page = 1;
    this.loadReviews();
  }

  getAvgRating(): number {
    if (this.reviews.length === 0) return 0;
    const sum = this.reviews.reduce((acc, r) => acc + r.rating, 0);
    return Math.round((sum / this.reviews.length) * 10) / 10;
  }

  getStars(rating: number): { filled: boolean }[] {
    return Array.from({ length: 5 }, (_, i) => ({ filled: i < Math.round(rating) }));
  }

  changePage(newPage: number): void {
    if (newPage < 1 || newPage > this.totalPages) return;
    this.page = newPage;
    this.loadReviews();
  }

  getPages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
  }
}