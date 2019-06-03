import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
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
// import { fa-envelope-open-text } from "@fortawesome/free-solid-svg-icons";

@Component({
  selector: 'a5-aliveemail-modal',
  templateUrl: './a5-aliveemail-modal.component.html',
  styleUrls: ['./a5-aliveemail-modal.component.css'],
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
export class A5AliveemailModalComponent implements OnInit {
  @Input()
  showModal: boolean;
  @Output()
  modalHidden: EventEmitter<{}> = new EventEmitter();
  modalAnimation: string;
  aliveEmailForm = new FormGroup({
    "aliveemail-email": new FormControl(undefined, [Validators.required]),
    "aliveemail-name": new FormControl(undefined, [Validators.required]),
    "aliveemail-question": new FormControl(undefined)
  });
  //faPhone was here.
  clientIP: string;
  httpOptions = {
    data: {
      action: "aliveemail_send_email", 
      objectref: "wsa3",
      groupid: "9",
      websiteid: "0",
      operatorid: "0",
      email_customer: "",
      name_customer: "",
      question_customer: "",
      email_agent: "becci@alive5.com",
    
    }
  };
  email_customer = new FormControl("");
  name_customer = new FormControl("");
  question_customer = new FormControl("");
  constructor(private http: HttpClient) {}

  ngOnInit() {}
  getClientIP() {
    this.http.get("https://api.ipify.org/?format=json").subscribe(data => {
      this.httpOptions.data["client_ip"] = data["ip"];
      this.makeAliveEmailRequest();
    });
  }
  makeAliveEmailRequest() {
    this.http
      .get(
        "https://api-v1.websitealive.com/aliveemail/sendemail/?format=json&emailmeback=",
        {
          params: this.httpOptions.data
        }
      )
      .subscribe((data: any) => {
        console.log(data);
      });
  }
  sendEmail(trigger: string) {
    let userSubmittedEmail = this.email_customer.value;
    let userSubmittedName = this.name_customer.value;
    let userSubmittedQuestion = this.question_customer.value;
    //updating user's info -email -name -question to API Request
    this.httpOptions.data["email_customer"] = userSubmittedEmail;
    this.httpOptions.data["name_customer"] = userSubmittedName;
    this.httpOptions.data["question_customer"] = userSubmittedQuestion;
    //Get User IP for API Request
    this.getClientIP();
    this.hideModal(trigger);
    this.email_customer.setValue("");
    this.name_customer.setValue("");
    this.question_customer.setValue("");
  }
  hideModal(trigger: string){
    //console.log('hide modal: ', evt.target.classlist.contains('cancel-modal-btn'));
    //check which button was pressed
    if (trigger === "cancel-button"){
      this.modalHidden.emit({
        dialogState: false,
        triggerBy: "aliveemail-cancel-btn"
      });
    }
    if (trigger === "send-email-button"){
      this.modalHidden.emit({
        dialogState: false,
        triggeredBy: "aliveemail-send-email"
      });
    }
    this.showModal = false;
  }




}
