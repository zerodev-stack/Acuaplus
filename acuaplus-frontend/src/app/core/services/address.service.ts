import { Injectable } from '@angular/core';
import {ApiService} from "./api.service";

export interface Address {
  id: number;
  user_id: number;
  recipient_name: string;
  address_line: string;
  city: string;
  department: string;   // ← viene del alias AS department
  zip_code: string | null;
  is_default: number;
}
@Injectable({
  providedIn: 'root'
})
export class AddressService {

  constructor(private apiService: ApiService) { }

getAddresses() {
  return this.apiService.get<{data: Address[]}>('addresses');
}

createAddress(data: {
  recipient_name: string;
  address_line: string;
  city: string;
  department: string;
  zip_code?: string;
  is_default?: boolean;
}) {
  return this.apiService.post<{data: Address}>('addresses', data);
}

}
