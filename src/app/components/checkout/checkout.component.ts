import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ShoppingFormService } from '../../services/shopping-form.service';
import { Country } from '../../common/country';
import { State } from '../../common/state';
import { ShoppingValidators } from '../../validators/shopping-validators';
import { CartService } from '../../services/cart.service';
import { CheckoutService } from '../../services/checkout.service';
import { Router } from '@angular/router';
import { Order } from '../../common/order';
import { OrderItem } from '../../common/order-item';
import { Purchase } from '../../common/purchase';
import { PaymentInfo } from '../../common/payment-info';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent implements OnInit{

  checkoutFormGroup:FormGroup;

  totalPrice:number=0;
  totalQuantity:number=0;

  creditCardYears:number[]=[];
  creditCardMonths:number[]=[];

  countries:Country[]=[];
  
  shippingAddressStates: State[]=[];
  billingAddressStates: State[]=[];

  storage:Storage=sessionStorage;


  //initialize Stripe API
  stripe=Stripe(environment.stripePublishableKey);
  paymentInfo:PaymentInfo=new PaymentInfo();
  cardElement:any;
  displayError:any="";




  constructor(private formBuilder:FormBuilder,
    private shoppingFormService:ShoppingFormService,
    private cartService:CartService,
    private checkoutService:CheckoutService,
    private router:Router
  ){}

  ngOnInit():void{

    //steup Stripe payment form
    this.setupStripePaymentForm();

    this.reviewCartDetails();

    //read  the user's email address from browser storage
    const theEmail=JSON.parse(this.storage.getItem('userEmail')!);

    this.checkoutFormGroup=this.formBuilder.group({
      customer:this.formBuilder.group({
        firstName:new FormControl('',[Validators.required,Validators.minLength(2),ShoppingValidators.notOnlyWhitespace]),
        lastName:new FormControl('',[Validators.required,Validators.minLength(2),ShoppingValidators.notOnlyWhitespace]),
        email:new FormControl(theEmail,
                              [Validators.required,Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')])
      }),
      shippingAddress: this.formBuilder.group({
        street:new FormControl('',[Validators.required,Validators.minLength(2),ShoppingValidators.notOnlyWhitespace]),
        city:new FormControl('',[Validators.required,Validators.minLength(2),ShoppingValidators.notOnlyWhitespace]),
        state:new FormControl('',[Validators.required]),
        country:new FormControl('',[Validators.required]),
        zipCode:new FormControl('',[Validators.required,Validators.minLength(2),ShoppingValidators.notOnlyWhitespace])
      }),
      billingAddress: this.formBuilder.group({
        street:new FormControl('',[Validators.required,Validators.minLength(2),ShoppingValidators.notOnlyWhitespace]),
        city:new FormControl('',[Validators.required,Validators.minLength(2),ShoppingValidators.notOnlyWhitespace]),
        state:new FormControl('',[Validators.required]),
        country:new FormControl('',[Validators.required]),
        zipCode:new FormControl('',[Validators.required,Validators.minLength(2),ShoppingValidators.notOnlyWhitespace])
      }),
      creditCard: this.formBuilder.group({
        /*
        cardType:new FormControl('',[Validators.required]),
        nameOnCard:new FormControl('',[Validators.required,Validators.minLength(2),ShoppingValidators.notOnlyWhitespace]),
        cardNumber:new FormControl('',[Validators.required,Validators.pattern('[0-9]{16}')]),
        securityCode:new FormControl('',[Validators.required,Validators.pattern('[0-9]{3}')]),
        expirationMonth:[''],
        expirationYear:['']
        */
      })
    });

    //populate credity card months
    /*
    const startMonth:number=new Date().getMonth()+1;
    console.log("startMonth: "+startMonth);

    this.shoppingFormService.getCreditCardMonths(startMonth).subscribe(

      data=>{
        console.log("Retrieved credit card months: "+ JSON.stringify(data));
        this.creditCardMonths=data;
      }
    );


    //populate credit card years
    this.shoppingFormService.getCreditCardYears().subscribe(
      data=>{
        console.log("Retrieve credit card years: "+JSON.stringify(data));
        this.creditCardYears=data;
      }
    );
    */

    //populate Countries
    this.shoppingFormService.getCountries().subscribe(
      data=>{
        console.log("Retrieved countries: "+JSON.stringify(data));
        this.countries=data;
      }
    );
 }
  setupStripePaymentForm() {
    //get a handle to stripe elements
    var elements=this.stripe.elements();

    //Create a card element ... and hide the zip-code field
    this.cardElement=elements.create('card',{hidePostalCode:true});



    //Add an instance of card UI component into the 'card-element' div
    this.cardElement.mount('#card-element');

    //Add event binding for the 'change' event on the card element
    this.cardElement.on('change',(event:any)=>{

      //get a handle to card-errors element
      this.displayError=document.getElementById('card-errors');

      if(event.complete){
        this.displayError.textContent="";
      }
      else if (event.error) {
        //show validation error to customer
        this.displayError.textContent=event.error.message;
      }
    });

  }
  reviewCartDetails() {
    
    // subscribe to cartService.totalQuantity
    this.cartService.totalQuantity.subscribe(
      totalQuantity=>this.totalQuantity=totalQuantity
    );

    //subscribe to cartService.totalPrice
    this.cartService.totalPrice.subscribe(
      totalPrice=>this.totalPrice=totalPrice
    );

  }

 get firstName(){return this.checkoutFormGroup.get('customer.firstName');}
 get lastName(){return this.checkoutFormGroup.get('customer.lastName');}
 get email(){return this.checkoutFormGroup.get('customer.email');}

 get shippingAddressStreet(){return this.checkoutFormGroup.get('shippingAddress.street');}
 get shippingAddressCity(){return this.checkoutFormGroup.get('shippingAddress.city');}
 get shippingAddressState(){return this.checkoutFormGroup.get('shippingAddress.state');}
 get shippingAddressZipCode(){return this.checkoutFormGroup.get('shippingAddress.zipCode');}
 get shippingAddressCountry(){return this.checkoutFormGroup.get('shippingAddress.country');}


 get billingAddressStreet(){return this.checkoutFormGroup.get('billingAddress.street');}
 get billingAddressCity(){return this.checkoutFormGroup.get('billingAddress.city');}
 get billingAddressState(){return this.checkoutFormGroup.get('billingAddress.state');}
 get billingAddressZipCode(){return this.checkoutFormGroup.get('billingAddress.zipCode');}
 get billingAddressCountry(){return this.checkoutFormGroup.get('billingAddress.country');}


 get creditCardType(){return this.checkoutFormGroup.get('creditCard.cardType');}
 get creditCardNameOnCard(){return this.checkoutFormGroup.get('creditCard.nameOnCard');}
 get creditCardNumber(){return this.checkoutFormGroup.get('creditCard.cardNumber');}
 get creditCardSecurityCode(){return this.checkoutFormGroup.get('creditCard.securityCode');}






  copyShippingAddressToBillingAddress(event){

    if (event.target.checked){
      this.checkoutFormGroup.controls['billingAddress']
      .setValue(this.checkoutFormGroup.controls['shippingAddress'].value);

      // bug fix for states
      this.billingAddressStates=this.shippingAddressStates;
    }
    else{
      this.checkoutFormGroup.controls['billingAddress'].reset();

      // bug fix for states
      this.billingAddressStates=[];
    }

    
  }


  onSubmit(){
    console.log("Handle the submit button");

    if(this.checkoutFormGroup.invalid){
      this.checkoutFormGroup.markAllAsTouched();
      return;
    }

    //set up order
    let order =new Order();
    order.totalPrice=this.totalPrice;
    order.totalQuantity=this.totalQuantity;

    //get cart items
    const cartItems=this.cartService.cartItems;


    //create orderItems form cartItems
    //-long way
    /*
    let orderItems: OrderItem[]=[];
    for(let i=0;i<cartItems.length;i++){
    orderItems[i]=new OrderItem(cartItems[i]);
    }
    */

    //- short way of doing the same thing
    let orderItems:OrderItem[]=cartItems.map(tempCartItem=>new OrderItem(tempCartItem)); 

    //set up purchase
    let purchase=new Purchase();

    //populate purchase - customer
    purchase.customer=this.checkoutFormGroup.controls['customer'].value;


    //populate purchase - shipping address
    purchase.shippingAddress=this.checkoutFormGroup.controls['shippingAddress'].value;
    const shippingState: State=JSON.parse(JSON.stringify(purchase.shippingAddress.state));
    const shippingCountry: Country=JSON.parse(JSON.stringify(purchase.shippingAddress.country));
    purchase.shippingAddress.state=shippingState.name;
    purchase.shippingAddress.country=shippingCountry.name;



    //populate purchase - billing address
    purchase.billingAddress=this.checkoutFormGroup.controls['billingAddress'].value;
    const billingState: State=JSON.parse(JSON.stringify(purchase.billingAddress.state));
    const billingCountry: Country=JSON.parse(JSON.stringify(purchase.billingAddress.country));
    purchase.billingAddress.state=billingState.name;
    purchase.billingAddress.country=billingCountry.name;

    //populate purchase - order and orderItems
    purchase.order=order;
    purchase.orderItems=orderItems;

    //compute payment info
    this.paymentInfo.amount=this.totalPrice*100;
    this.paymentInfo.currency="USD";


    //if valid form then
    //-create payment intent
    //-confirm card payment
    //-place order

    if(!this.checkoutFormGroup.invalid && this.displayError.textContent===""){
      this.checkoutService.createPaymentIntent(this.paymentInfo).subscribe(
        (paymentIntentResponse)=>{
          this.stripe.confirmCardPayment(paymentIntentResponse.client_secret,
            {
              payment_method:{
                card:this.cardElement
              }
            },{handleActions:false}).then((result:any)=>{
              if(result.error){
                //inform the customer there was an error
                alert(`There was an error:${result.error.message}`);
              }
              else{
                //call Rest API via the CheckoutService
                this.checkoutService.placeOrder(purchase).subscribe({
                  next:(response:any)=>{
                    alert(`Your order has been received.\nOrder tracking number: ${response.orderTrackingNumber}`);

                    //reset cart
                    this.resetCart();
                  },
                  error:(err:any)=>{
                    alert(`There was an error: ${err.msessage}`);
                  }
                })
              }
            });
          }
        );
    } else{
      this.checkoutFormGroup.markAllAsTouched();
      return;
    }
    
  }
  resetCart() {
    //reset cart data
    this.cartService.cartItems=[];
    this.cartService.totalPrice.next(0);
    this.cartService.totalQuantity.next(0);

    //reset the form
    this.checkoutFormGroup.reset();

    //navigate back to the products page
    this.router.navigateByUrl("/products");
  }

  handleMonthsAndYears(){
    const creditCardFormGroup=this.checkoutFormGroup.get('creditCard');
    
    const currentYear:number=new Date().getFullYear();
    const selectedYear: number=Number(creditCardFormGroup.value.expirationYear);

    //if the current year equals the selected year, then start with the current month

    let startMonth:number;
    if(currentYear===selectedYear){
      startMonth=new Date().getMonth()+1;
    }
    else{
      startMonth=1;
    }

    this.shoppingFormService.getCreditCardMonths(startMonth).subscribe(
      data=>{
        console.log("Retrieved credit card months: "+JSON.stringify(data));
        this.creditCardMonths=data;
      }
    );
  }

  getStates(formGroupName:string){
    const formGroup=this.checkoutFormGroup.get(formGroupName);
    const countryCode=formGroup.value.country.code;
    const countryName=formGroup.value.country.name;

    console.log(`${formGroupName} country code: ${countryCode}`);
    console.log(`${formGroupName} country name: ${countryName}`);

    this.shoppingFormService.getStates(countryCode).subscribe(
      data =>{
        if(formGroupName==='shippingAddress'){
          this.shippingAddressStates=data;
        }
        else{
          this.billingAddressStates=data;
        }

        //select first item by default
        formGroup.get('state').setValue(data[0]);
      }
    );
  }


}
