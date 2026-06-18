import { NgModule } from '@angular/core';
import { RouterModule, Routes, UrlSegment } from '@angular/router';
import { ProductListComponent } from './product-list/product-list.component';
import { ProductDetailComponent } from './product-detail/product-detail.component';

// Solo coincide si el segmento es un número
export function numericIdMatcher(segments: UrlSegment[]) {
  if (segments.length === 1 && /^\d+$/.test(segments[0].path)) {
    return { consumed: segments, posParams: { id: segments[0] } };
  }
  return null;
}

const routes: Routes = [
  { path: '',            component: ProductListComponent },
  { matcher: numericIdMatcher, component: ProductDetailComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CatalogRoutingModule {}