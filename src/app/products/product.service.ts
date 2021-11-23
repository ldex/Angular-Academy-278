import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, delay, first, map, max, mergeAll, shareReplay, tap } from 'rxjs/operators';
import { Product } from './product.interface';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private baseUrl = 'https://storerestservice.azurewebsites.net/api/products/';
  products$: Observable<Product[]>;
  mostExpensiveProduct$: Observable<Product>;

  constructor(private http: HttpClient) {
    this.initProducts();
    this.initMostExpensiveProduct();
  }

  private initMostExpensiveProduct() {
    this.mostExpensiveProduct$ =
      this
      .products$
      .pipe(
        map(products => [...products].sort((p1, p2) => p1.price > p2.price ? -1 : 1)),
        // [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}]
        // 1 item!!!
        mergeAll(),
        // {}, {}, {}, {}, {}, {}, {}, {}, {}, {}
        // 10 items!!
        first()
      )
  }

  initProducts() {
    let url:string = this.baseUrl + `?$orderby=ModifiedDate%20desc`;

    this.products$ = this
                      .http
                      .get<Product[]>(url)
                      .pipe(
                        delay(1500), // Fake delay...
                        tap(console.table),
                        shareReplay()
                      );
  }

  insertProduct(newProduct: Product): Observable<Product> {
    return this.http.post<Product>(this.baseUrl, newProduct).pipe(delay(2000));
  }

  deleteProduct(id: number): Observable<any> {
    return this.http.delete(this.baseUrl + id);
  }
}
