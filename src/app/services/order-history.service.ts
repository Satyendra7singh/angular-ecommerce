import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { OrderHistory } from '../common/order-history';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class OrderHistoryService {

  private orderUrl=environment['shoppingAppApiUrl'] +'/orders';

  constructor(private httpClient:HttpClient) { }

  getOrderHistory(theEmail:string):Observable<GetResponseOrderHistory>{

    //need to build URL base on the cutsomer email
    const orderHistoryUrl=`${this.orderUrl}/search/findByCustomerEmailOrderByDateCreatedDesc?email=${theEmail}`;

    return this.httpClient.get<GetResponseOrderHistory>(orderHistoryUrl);
  }
}

interface GetResponseOrderHistory{
  _embedded:{
    orders:OrderHistory[];
  }
}