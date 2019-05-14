import { Component, OnInit, Input, EventEmitter, Output } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { trigger, transition, useAnimation } from "@angular/animations";
import { fadeUpAnimation } from "../animations";
import {
  HttpHeaders,
  HttpClient,
  HttpParams,
  HttpErrorResponse
} from "@angular/common/http";

import { Observable, merge } from "rxjs";
import { map } from "rxjs/operators";

import { faPhone } from "@fortawesome/free-solid-svg-icons";
@Component({
  selector: "a5-alivedial-modal",
  templateUrl: "./a5-alivedial-modal.component.html",
  styleUrls: ["./a5-alivedial-modal.component.css"],
  animations: [
    trigger("modalVisibility", [
      transition(":enter", [
        useAnimation(fadeUpAnimation, {
          params: {
            delay: "700ms",
            from: 0,
            to: 1,
            startingPoint: "150%",
            endingPoint: "0",
            time: "1s"
          }
        })
      ]),
      transition(":leave", [
        useAnimation(fadeUpAnimation, {
          params: {
            delay: "500ms",
            from: 1,
            to: 0,
            startingPoint: "0",
            endingPoint: "150%",
            time: "1s"
          }
        })
      ])
    ])
  ]
})
export class A5AlivedialModalComponent implements OnInit {
  @Input()
  showModal: boolean;
  @Output()
  modalHidden: EventEmitter<{}> = new EventEmitter();
  modalAnimation: string;
  // AliveDial Form Field
  aliveDialForm = new FormGroup({
    "alivedial-number": new FormControl(undefined, [Validators.required])
  });
  faPhone = faPhone;
  clientIP: string;
  httpOptions = {
    data: {
      action: "alivedial_call_twilio",
      objectref: "wsa3",
      groupid: "9",
      websiteid: "0",
      operatorid: "0",
      phone_customer: "",
      phone_agent: "+18886964513",
      phone_number_extension: "2",
      caller_id: "+18886964513"
    }
  };
  phone_customer = new FormControl("");
  constructor(private http: HttpClient) {}

  ngOnInit() {}
  getClientIP() {
    this.http.get("https://api.ipify.org/?format=json").subscribe(data => {
      this.httpOptions.data["client_ip"] = data["ip"];
      this.makeAliveDialRequest();
    });
  }
  makeAliveDialRequest() {
    this.http
      .get(
        "https://api-v1.websitealive.com/alivedial/makecall/?format=json&callback=?",
        {
          params: this.httpOptions.data
        }
      )
      .subscribe((data: any) => {
        console.log(data);
      });
  }
  makeCall(trigger: string) {
    let userSubmittedNumber = this.phone_customer.value;
    //Updating User's phone number to API Request
    this.httpOptions.data[
      "phone_customer"
    ] = userSubmittedNumber.internationalNumber.replace(/-|\s/g, "");

    //  Get User's IP for API Request
    this.getClientIP();

    this.hideModal(trigger);
    this.phone_customer.setValue("");
  }
  hideModal(trigger: string) {
    //Checking what button was pressed

    if (trigger === "cancel-button") {
      this.modalHidden.emit({
        dialogState: false,
        triggeredBy: "alivedial-cancel-btn"
      });
    }

    if (trigger === "make-call-button") {
      this.modalHidden.emit({
        dialogState: false,
        triggeredBy: "alivedial-make-call"
      });
    }
    this.showModal = false;
  }
}
