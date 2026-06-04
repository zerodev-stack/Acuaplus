import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
private baseUrl = 'http://localhost:4000/api';
  constructor(private http: HttpClient) {}

get<T>(path: string) {
  return this.http.get<T>(`${this.baseUrl}${path}`, {
    withCredentials:true
  });
}

post <T>(path: string, body: unknown) {
return this.http.post<T>(`${this.baseUrl}${path}`, body, {withCredentials:true

});
}
patch<T>(path: string, body: unknown) {
return this.http.patch<T>(`${this.baseUrl}${path}`, body, {withCredentials:true
});
}

}