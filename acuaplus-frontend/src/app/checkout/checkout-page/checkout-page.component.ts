import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AddressService, Address } from '../../core/services/address.service';
import { PaymentService, SavedCard } from '../../core/services/payment.service';
import { CheckoutService, Order } from '../../core/services/checkout.service';

type Step = 'address' | 'payment' | 'processing' | 'confirmation' | 'error';

@Component({
  selector: 'app-checkout-page',
  templateUrl: './checkout-page.component.html',
  styleUrls: ['./checkout-page.component.css']
})
export class CheckoutPageComponent implements OnInit {

  // Control de pasos
  currentStep: Step = 'address';

  // Datos cargados
  addresses: Address[] = [];
  savedCards: SavedCard[] = [];

  // Selecciones del usuario
  selectedAddressId: number | null = null;
  selectedCardId: number | null = null;
  paymentMethod: 'card' | 'transfer' | 'cashondelivery' = 'card';

  // Resultado final
  createdOrder: Order | null = null;
  paymentStatus: 'approved' | 'declined' | 'timeout' | 'insufficient_funds' | null = null;
  errorMsg = '';

  // Loaders
  loadingAddresses = true;
  loadingCards = true;
  processing = false;

  // Formularios
  newAddressForm: FormGroup;
  newCardForm: FormGroup;
  showNewAddressForm = false;
  showNewCardForm = false;
  savingAddress = false;
  savingCard = false;
  notesForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private addressService: AddressService,
    private paymentService: PaymentService,
    private checkoutService: CheckoutService,
    private router: Router
  ) {
    this.newAddressForm = this.fb.group({
      recipient_name: ['', [Validators.required, Validators.minLength(2)]],
      address_line: ['', [Validators.required, Validators.minLength(5)]],
      city:         ['', Validators.required],
      department:   ['', Validators.required],
      zip_code:     ['']
    });

    this.newCardForm = this.fb.group({
      cardholder_name: ['', [Validators.required, Validators.minLength(2)]],
      pan:             ['', [Validators.required, Validators.minLength(13), Validators.maxLength(19)]],
      cvv:             ['', [Validators.required, Validators.minLength(3), Validators.maxLength(4)]],
      exp_month:       ['', [Validators.required, Validators.min(1), Validators.max(12)]],
      exp_year:        ['', [Validators.required, Validators.min(2024), Validators.max(2040)]],
      is_default:      [false]
    });

    this.notesForm = this.fb.group({
      notes: ['', Validators.maxLength(500)]
    });
  }

  ngOnInit(): void {
    this.loadAddresses();
    this.loadCards();
  }

  // ─── Carga de datos ───────────────────────────────────────────

  loadAddresses(): void {
    this.loadingAddresses = true;
    this.addressService.getAddresses().subscribe({
      next: (res) => {
        this.addresses = res.data;
        const def = this.addresses.find(a => a.is_default === 1);
        if (def) this.selectedAddressId = def.id;
        this.loadingAddresses = false;
      },
      error: () => { this.loadingAddresses = false; }
    });
  }

  loadCards(): void {
    this.loadingCards = true;
    this.paymentService.getCards().subscribe({
      next: (res) => {
        this.savedCards = res.data;
        const def = this.savedCards.find(c => c.is_default === 1);
        if (def) this.selectedCardId = def.id;
        this.loadingCards = false;
      },
      error: () => { this.loadingCards = false; }
    });
  }

  // ─── Paso 1: dirección ────────────────────────────────────────

  selectAddress(id: number): void {
    this.selectedAddressId = id;
  }

  saveNewAddress(): void {
    if (this.newAddressForm.invalid) {
      this.newAddressForm.markAllAsTouched();
      return;
    }
    this.savingAddress = true;
    this.addressService.createAddress(this.newAddressForm.value).subscribe({
      next: (res) => {
        this.addresses.push(res.data);
        this.selectedAddressId = res.data.id;
        this.showNewAddressForm = false;
        this.newAddressForm.reset();
        this.savingAddress = false;
      },
      error: () => { this.savingAddress = false; }
    });
  }

  goToPayment(): void {
    if (!this.selectedAddressId) return;
    this.currentStep = 'payment';
  }

  // ─── Paso 2: método de pago ───────────────────────────────────

  selectCard(id: number): void {
    this.selectedCardId = id;
    this.paymentMethod = 'card';
  }

  selectPaymentMethod(method: 'card' | 'transfer' | 'cashondelivery'): void {
    this.paymentMethod = method;
    if (method !== 'card') this.selectedCardId = null;
  }

  saveNewCard(): void {
    if (this.newCardForm.invalid) {
      this.newCardForm.markAllAsTouched();
      return;
    }
    this.savingCard = true;
    const v = this.newCardForm.value;
    this.paymentService.savedCard({
      ...v,
      exp_month: +v.exp_month,
      exp_year:  +v.exp_year
    }).subscribe({
      next: (res) => {
        this.savedCards.push(res.data);
        this.selectedCardId = res.data.id;
        this.paymentMethod = 'card';
        this.showNewCardForm = false;
        this.newCardForm.reset();
        this.savingCard = false;
      },
      error: () => { this.savingCard = false; }
    });
  }

  // ─── Paso 3: confirmar y pagar ────────────────────────────────

  confirmOrder(): void {
    if (!this.selectedAddressId) return;
    if (this.paymentMethod === 'card' && !this.selectedCardId) return;

    this.currentStep = 'processing';
    this.processing = true;

    const payload: any = {
      address_id: this.selectedAddressId,
      payment_method: this.paymentMethod,
      notes: this.notesForm.value.notes || undefined
    };

    // 1. Crear la orden
    this.checkoutService.createOrder(payload).subscribe({
      next: (res) => {
        this.createdOrder = res.data;

        // 2a. Si el método es tarjeta → procesar pago inmediatamente
        if (this.paymentMethod === 'card' && this.selectedCardId) {
          this.paymentService.processPayment(this.createdOrder!.id, this.selectedCardId).subscribe({
            next: (payRes) => {
              this.paymentStatus = payRes.data.status;
              this.currentStep = 'confirmation';
              this.processing = false;
            },
            error: (err) => {
              this.paymentStatus = 'declined';
              this.currentStep = 'confirmation';
              this.processing = false;
            }
          });
        } else {
          // 2b. Transferencia o contra entrega → confirmación directa
          this.paymentStatus = 'approved';
          this.currentStep = 'confirmation';
          this.processing = false;
        }
      },
      error: (err) => {
        this.errorMsg = err.error?.error?.message || 'No se pudo crear la orden.';
        this.currentStep = 'error';
        this.processing = false;
      }
    });
  }

  // ─── Helpers ──────────────────────────────────────────────────

  formatPrice(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP', maximumFractionDigits: 0
    }).format(value);
  }

  cardBrandIcon(brand: string): string {
    const icons: Record<string, string> = {
      visa: 'bi-credit-card-2-front',
      mastercard: 'bi-credit-card',
      amex: 'bi-credit-card-fill',
      diners: 'bi-credit-card-2-back'
    };
    return icons[brand] ?? 'bi-credit-card';
  }

  goToOrders(): void {
    this.router.navigate(['/orders']);
  }

  goToHome(): void {
    this.router.navigate(['/dashboard']);
  }

  retryPayment(): void {
    if (!this.createdOrder || !this.selectedCardId) return;
    this.processing = true;
    this.paymentService.processPayment(this.createdOrder.id, this.selectedCardId).subscribe({
      next: (res) => {
        this.paymentStatus = res.data.status;
        this.processing = false;
      },
      error: () => {
        this.paymentStatus = 'declined';
        this.processing = false;
      }
    });
  }
}