import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class ClientIpServiceService {

  constructor(private http: HttpClient) { }
  getClientIP(){
    return this.http.get("https://api.ipify.org/?format=json");
  }
}
