import {
  Component,
  OnInit,
  Renderer2,
  ViewChild,
  ElementRef
} from "@angular/core";
import { HttpHeaders, HttpClient, HttpParams } from "@angular/common/http";
import {
  trigger,
  state,
  style,
  transition,
  useAnimation
} from "@angular/animations";
import { bounceInAnimation } from "../animations";
import {
  faComment,
  faGrin,
  faArrowAltCircleLeft,
  faTimesCircle,
  faArrowRight,
  faAddressCard
} from "@fortawesome/free-solid-svg-icons";
import { Message } from "./message";
import { Option } from "./option";
import { SendMailService } from "../send-mail.service";
import { BotReportingService } from "../bot-reporting.service";
import { ClientIpServiceService } from "../client-ip-service.service";
import { CookieService } from "ngx-cookie-service";
import { ReturnStatement } from "@angular/compiler";
import { Image, GalleryService, ButtonsStrategy, ButtonsConfig, ButtonType } from "angular-modal-gallery";
import { DeviceDetectorService } from "ngx-device-detector";

import * as AWS from "aws-sdk";
import * as _ from "lodash";
import * as uuid from "uuid";
import anchorme from "anchorme";
import { reduce } from "rxjs/operators";
@Component({
  selector: "a5-chat-window",
  templateUrl: "./a5-chat-window.component.html",
  styleUrls: ["./a5-chat-window.component.css"],
  animations: [
    trigger("bounceMenu", [
      state("botResponse", style({})),
      state("button", style({})),
      transition("void => *", [
        useAnimation(bounceInAnimation, {
          params: {
            duration: "2s",
            delay: "0ms"
          }
        })
      ])
    ])
  ],
  providers: [SendMailService]
})
export class A5ChatWindowComponent implements OnInit {
  @ViewChild("botMessageInput")
  botMessageInput: ElementRef;
  lexRuntime: any;
  lexUserID = "Halbot" + Date.now();
  botOptionsTitle: string;
  botMenuOptions: Option[] = [];
  faComment = faComment;
  faTimesCircle = faTimesCircle;
  faArrowAltCircleLeft = faArrowAltCircleLeft;
  faAddressCard = faAddressCard;
  faGrin = faGrin;
  faArrowRight = faArrowRight;
  userMessageInput: string;
  showMainMenuOptions = true;
  showMainMenuButton = false;
  messages: Message[] = [];
  lottieConfig: Object;
  notMobileScreen = true;
  bounceMenu: string;
  emojiPickerShown = false;
  currentTheme = "";
  lexBotResponseObj: any;
  showAlivePayModal = false;
  responseCards: any = [];
  currentResponseCardPosition = undefined;
  multipleCards = false;
  lastResponseCard = false;
  movieTitle: string;
  botLeadEmailMsg = {
    servicesChosen: "",
    email: "",
    serviceDetails: ""
  };
  customEmojis = [
    {
      name: "Computer Guy",
      short_names: ["computer_guy"],
      text: "",
      emoticons: [],
      imageUrl: "../../assets/img/cc-computer-guy.png"
    },
    {
      name: "Computer Girl",
      short_names: ["computer_girl"],
      text: "",
      emoticons: [],
      imageUrl: "../../assets/img/cc-computer-girl.png"
    },
    {
      name: "Money",
      short_names: ["cc_money"],
      text: "",
      emoticons: [],
      keywords: ["cc_money"],
      imageUrl: "../../assets/img/cc-money.png"
    },
    {
      name: "Phone Hand",
      short_names: ["phone_hand"],
      text: "",
      emoticons: [],
      keywords: ["phone_hand"],
      imageUrl: "../../assets/img/cc-phone-hand.png"
    },
    {
      name: "Phone",
      short_names: ["cc_phone"],
      text: "",
      emoticons: [],
      keywords: ["cc_phone"],
      imageUrl: "../../assets/img/cc-phone.png"
    },
    {
      name: "Repair",
      short_names: ["cc_repair"],
      text: "",
      emoticons: [],
      keywords: ["cc_repair"],
      imageUrl: "../../assets/img/cc-repair.png"
    },
    {
      name: "TV",
      short_names: ["cc_tv"],
      text: "",
      emoticons: [],
      keywords: ["cc_tv"],
      imageUrl: "../../assets/img/cc-tv.png"
    }
  ];
  emojiExcludedCategories = [
    "recent",
    "people",
    "nature",
    "foods",
    "activity",
    "places",
    "objects",
    "symbols",
    "flags",
    "search"
  ];

 

  // Customizing **************
  windowBannerStyle = {
    "background-color": "#fff",
    "border-bottom-color": "#4198B5"
  };
  logoImg = "/assets/img/hdnLogo.png"; //EDIT with s3 bucket file name
  //Contact button
  showContactButton = true; //Turn to true to show top right Contact Button
  contactButtonStyle = {
    "background-color": "red",
    border: "red",
    color: "white"
  };
  showGreetingSection = true;
  greetingLine = "Welcome to HDN's Chatbot!";
  greetingSectionStyle = {
    "background-color": "#3c4558"
  };
  greetingFontStyle = {
    color: "#fff"
  };
  botOptionsImg = false;
  showBotOptions = false;
  botOptionImgSource = ""; // IF USE IMG: EDIT with S3 bucket name
  botOptionsStyle = {
    "background-color": "#3c4558"
  };
  botOptionButtonStyle = {
    "border-color": "#4198B5",
    color: "#fff",
    background: "#4198B5"
  };
  botOptionTitleStyle = {
    color: "#fff"
  };
  messageListStyle = {
    background: "url(/assets/img/geometry.png)" //EDIT with S3 bucket name (remove../../)
  };
  messageSubmissionStyle = {
    background: "#fff",
    color: "black"
  };
  sendButtonStyle = {
    color: "#ff8359"
  };

  //User info for live chat agent
  fullname = "";
  email = "";
  question = "";
  showUserInput = false;
  currentIntentName = "";
  clientIP: string;
  slotToElicit: string;
  browser: string;
  //elastic search
  activeFAQDirectory = false;
  isTyping = false;
  httpOptions = {
    headers: new HttpHeaders({
      Authorization:
        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhbGl2ZV9wYXkiOnRydWUsImFsbG93X2J1bGtzbXMiOiIiLCJjaGFyZ2ViZWVfcGxhbiI6InByby1wbGFuIiwiY2hhcmdlYmVlX3BsYW5fbGFiZWwiOjksImNyZWRpdHNfdXNlZCI6OTQwOCwiaXNzIjoiYWxpdmU1X2FwaSIsIm1heF9jcmVkaXRzIjoyMzM1MCwib3JnX25hbWUiOiJhbGl2ZTVzdGFnZSIsInBheW1lbnRfbWV0aG9kIjoiY2hhcmdlYmVlIiwic2NyZWVuX25hbWUiOiJkdXN0aW4yIiwic3Vic2NyaXB0aW9uX2VuZF9kYXRlIjoxNTQ4NTgyNzMzLCJzdWJzY3JpcHRpb25faWQiOiJIcjU1MThuUW5VSVF0Yk5FMyIsInN1YnNjcmlwdGlvbl9zdGFydF9kYXRlIjoxNTQ1OTA0MzMzLCJ0eXBlIjoidXNlciIsInVzZXJfaWQiOiIzNzJmMWM2NS0xOWNhLTQwYzctOTJhOC01ZTJiMTNhMDU5MjMiLCJ1c2VyX3JvbGUiOiJhZG1pbiIsInZlcmlmaWVkIjp0cnVlLCJwb2xpY3lfaWQiOiJhMGY3MmMzMC1mYTdjLTQ5Y2EtODM1Mi1lNGZiZDYxMTJlMjMiLCJwb2xpY3kiOnsiY3JlYXRlZF9hdCI6MTU0MzMwNDE1NDY1MiwicG9saWN5X25hbWUiOiJhbGl2ZUNoYXQgRW5hYmxlZCIsInBvbGljeV9mZWF0dXJlcyI6WyJTTVMiLCJCT1RTIiwiYWxpdmVDaGF0IiwiQWxpdmVQYXkiLCJQSVBMIl0sInBvbGljeV9pZCI6ImEwZjcyYzMwLWZhN2MtNDljYS04MzUyLWU0ZmJkNjExMmUyMyJ9LCJpYXQiOjE1NDc2Njg3NDN9.5YDP1-SX0_6YH3GxKhPPNbeFjkb-2MMRtAM_HkwzpBQ"
    }),
    data: {
      org_name: "spectrabg",
      search: "",
      category_name: "Greetings"
    }
  };

  //Check whether an agent is online for Live Chat
  agentOnline: any;
  //Gallery Images
  customButtonsConfigExtUrlNewTab: ButtonsConfig = {
    visible: true,
    strategy: ButtonsStrategy.CUSTOM,
    buttons: [
      {
        className: 'ext-url-image',
        type: ButtonType.EXTURL,
        extUrlInNewTab: true
      }
    ]
  }

  // aliveDial
  showAliveDialModal = false;
  galleryImages: Image[] = [
  
    new Image(0, {
      img: "https://s3.amazonaws.com/qr.alive5.com/images/HDN/50footfloorplans/Balboa1of2.png",
      extUrl: "https://s3.amazonaws.com/qr.alive5.com/images/HDN/50footfloorplans/Balboa1of2.png",
      description: "Balboa 1of2"
    }),
    new Image(1, {
      img: "https://s3.amazonaws.com/qr.alive5.com/images/HDN/50footfloorplans/Balboa2of2.png",
      extUrl: "https://s3.amazonaws.com/qr.alive5.com/images/HDN/50footfloorplans/Balboa2of2.png",
      description: "Balboa 2of2"
    }),
    new Image(2, {
      img: "https://www.websitealive.com/images/chatwindow-3.png",
      description: "Customized Chat Windows"
    }),
    new Image(3, {
      img: "https://www.websitealive.com/images/chatwindow-4.png",
      description: "Customized Chat Windows"
    }),
    new Image(4, {
      img: "https://www.websitealive.com/images/cta-example-1.png",
      description: "Add a welcoming face to your engagement efforts."
    }),
    new Image(5, {
      img: "https://www.websitealive.com/images/cta-example-4.png",
      description:
        "Use shortlinks for easy social media or website engagements."
    }),
    new Image(6, {
      img: "https://www.websitealive.com/images/cta-example-3.png",
      description:
        "Customize call-to-action to suit your website's look and feel."
    }),
    new Image(7, {
      img: "https://www.websitealive.com/images/cta-example-2.png",
      description: "Communicate in your customer's language."
    })
  ];

  constructor(
    private sendMailService: SendMailService,
    private renderer: Renderer2,
    private http: HttpClient,
    private galleryService: GalleryService,
    private botReporting: BotReportingService,
    private clientIPService: ClientIpServiceService,
    private cookieService: CookieService,
    private deviceService: DeviceDetectorService
  ) {
    AWS.config.region = "us-east-1";
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
      IdentityPoolId: "us-east-1:11d2972f-0167-4d1f-be3c-a81711311b6f"
    });
    this.lexRuntime = new AWS.LexRuntime();
  }

  ngOnInit() {
    this.sendTextMessageToBot("menu");

    //Checking to see if bot is running in a mobile device
    if (screen.width < 768) {
      this.notMobileScreen = false;
    }

    //Making request to API to retrieve info on whether an live chat agent is online or not.
    const params = new HttpParams()
      .set("action", "groupstatus")
      .set("groupid", "9");
    const headers = new HttpHeaders().set(
      "Content-Type",
      "text/plain; charset=utf-8"
    );

    //Get Current User's Client IP Address
    this.http
      .get("https://www.websitealive3.com/9/status.asp", {
        headers: headers,
        params: params,
        responseType: "text"
      })
      .subscribe(data => {
        this.agentOnline = data;
      });
    this.clientIPService.getClientIP().subscribe(data => {
      this.clientIP = data["ip"];
    });

    this.checkForCookie();

    this.browser = this.deviceService.browser;
  }

  checkForCookie() {
    let cookieExist: boolean = this.cookieService.check("a5BotCookie");
    if (cookieExist) {
      // do something
    } else {
      this.cookieService.set("a5BotCookie", uuid.v4());
    }
  }
  toggleEmojiPicker() {
    this.emojiPickerShown = !this.emojiPickerShown;
  }

  selectedEmoji(event: any) {
    let evt = event;
    console.log(event);
    console.log(this.userMessageInput);
    console.log(this.botMessageInput);
    if (evt.emoji.custom) {
      let customEmojiElem = this.renderer.createElement("img");
      this.renderer.addClass(customEmojiElem, "emojiImg");
      this.renderer.setAttribute(customEmojiElem, "src", evt.emoji.imageUrl);
      this.renderer.appendChild(
        this.botMessageInput.nativeElement,
        customEmojiElem
      );
    } else if (evt.emoji.native) {
      let nativeSpanElem = this.renderer.createElement("span");
      let nativeParaElem = this.renderer.createElement("p");
      let emoText = this.renderer.createText(evt.emoji.native);
      this.renderer.appendChild(nativeSpanElem, emoText);
      this.renderer.appendChild(
        this.botMessageInput.nativeElement,
        nativeSpanElem
      );
      this.renderer.appendChild(
        this.botMessageInput.nativeElement,
        nativeParaElem
      );
    }
    this.toggleEmojiPicker();
  }

  sendMail(servicesChosen, email, serviceDetails) {
    this.botLeadEmailMsg = {
      servicesChosen: servicesChosen,
      email: email,
      serviceDetails: serviceDetails
    };
    this.sendMailService.sendMail(this.botLeadEmailMsg).subscribe(result => {
      console.log(result);
    });
  }

  showResponse(isUserMessage: boolean, message: string) {
    // Check whether the User to show a response from the User or Bot
    if (isUserMessage) {
      let response: Message = {
        userMessage: true,
        name: "",
        message: message
      };
      //Add User's response to Messages UI
      this.messages.unshift(response);
    } else {
      let response: Message = {
        userMessage: false,
        name: "",
        message: message
      };
      //Add Bot's response to Messages UI
      this.messages.unshift(response);
    }
  }

  loopThroughBotResponseCardButtons(responseCardButtons) {
    _.map(responseCardButtons, opt => {
      //Check to see if an agent is online to shoow Chat With A Human button
      if (opt.value === "chat with a human") {
        if (this.agentOnline === "online") {
          this.botMenuOptions.push(opt);
        }
      } else {
        this.botMenuOptions.push(opt);
      }
    });
  }

  checkBotIntent(botResponse) {
    if (botResponse.intentName === "PortlWatchTrailer") {
      this.showAlivePayModal = true;
    }
  }

  setBotOptions(botOptions, position) {
    if (botOptions.length > 1) {
      this.multipleCards = true;
    } else {
      this.multipleCards = false;
    }
    this.currentResponseCardPosition = position;
    this.botOptionsTitle = botOptions[position].title;
    this.loopThroughBotResponseCardButtons(botOptions[position].buttons);
  }

  setBotOptionPagination(currentPosition, responseCards) {
    let responseCardsLength = this.responseCards.length;
    this.currentResponseCardPosition = currentPosition + 1;
    this.botMenuOptions = [];
    if (this.currentResponseCardPosition === responseCardsLength) {
      this.lastResponseCard = true;
      this.currentResponseCardPosition = 0;
    }
    this.botOptionsTitle =
      responseCards[this.currentResponseCardPosition].title;
    this.loopThroughBotResponseCardButtons(
      responseCards[this.currentResponseCardPosition].buttons
    );
  }
  storeFAQAnswersLocalStorage(answers: any) {
    localStorage.setItem("faq-answers", JSON.stringify(answers));
  }

  removeFAQAnswersLocalStorage() {
    localStorage.removeItem("faq-answers");
  }

  sendAnswerToUser() {
    let answers = localStorage.getItem("faq-answers");
    let parsed = JSON.parse(answers);
    if (parsed) {
      if (parsed.length === 0) {
        console.log("parsed equal zeero");
        this.isTyping = false;
        this.showResponse(
          false,
          "Sorry, I couldn't help you out. Would you like to ask a human?"
        );
        this.removeFAQAnswersLocalStorage();
        this.activeFAQDirectory = false;
        this.sendToBotReportingService(
          "out",
          "html",
          `Sorry, I couldn't help you out. Would you like to ask a human?`,
          this.clientIP,
          this.browser,
          this.cookieService.get("a5BotCookie")
        );
        setTimeout(() => {
          this.botOptionsTitle = "Speak with a person or go to main menu?";
          this.botMenuOptions = [
            {
              text: "Chat with a human",
              value: "chat with a human"
            },
            {
              text: "Main Menu",
              value: "go back to main menu"
            }
          ];
          this.showBotOptions = true;
        }, 1000);
      } else {
        this.isTyping = false;
        let answer = parsed.shift();
        this.storeFAQAnswersLocalStorage(parsed);
        this.showResponse(false, anchorme(answer));
        this.sendToBotReportingService(
          "out",
          "html",
          answer,
          this.clientIP,
          this.browser,
          this.cookieService.get("a5BotCookie")
        );
        setTimeout(() => {
          this.botOptionsTitle = "Was this helpful?";
          this.botMenuOptions = [
            {
              text: "Yes",
              value: "yes"
            },
            {
              text: "No",
              value: "no"
            }
          ];
          this.showBotOptions = true;
        }, 1000);
      }
    }
  }

  sendSuccessFAQMessage() {
    this.isTyping = false;
    this.showResponse(
      false,
      "Great, if you have any other questions let us know."
    );
    this.sendToBotReportingService(
      "out",
      "html",
      `Great, if you have any other questions let us know.`,
      this.clientIP,
      this.browser,
      this.cookieService.get("a5BotCookie")
    );
    this.removeFAQAnswersLocalStorage();
    this.activeFAQDirectory = false;
    setTimeout(() => {
      this.showBotOptions = true;
      this.botOptionsTitle = "View Main Menu?";
      this.botMenuOptions = [
        {
          text: "Main Menu",
          value: "menu"
        }
      ];
    }, 1000);
  }

  sendToBotReportingService(
    event_direction: string,
    event_type: string,
    event_content: string,
    client_ip: string,
    browser_type: string,
    cookieid: string
  ) {
    let action = `record_event`;
    let objectref = "wsa3";
    let groupid = 9;
    let websiteid = 123;
    let alive5_org_name = null;
    this.botReporting
      .sendToReportingAPI(
        action,
        objectref,
        groupid,
        websiteid,
        client_ip,
        event_direction,
        event_type,
        event_content,
        browser_type,
        cookieid,
        alive5_org_name
      )
      .subscribe(data => {
        console.log("reporting data : ", data);
      });
  }

  makeCallToFAQAPI(userMessage: string) {
    this.isTyping = true;
    if (userMessage) {
      this.httpOptions.data.search = userMessage;
      this.http
        .get("https://api-v2.alive5.com/1.0/kb-article/search-external", {
          headers: this.httpOptions.headers,
          params: this.httpOptions.data
        })
        .subscribe((data: any) => {
          if (data.error) {
            console.log("subscribe error");
            this.isTyping = false;
            this.showResponse(
              false,
              "Sorry, I couldn't help you out. Would you like to ask a human?"
            );
            this.showBotOptions = true;
            this.botMenuOptions = [
              {
                text: "Chat with a human",
                value: "chat with a human"
              },
              {
                text: "Main Menu",
                value: "go back to main menu"
              }
            ];
          } else {
            let faqAnswersData = data.data;
            this.storeFAQAnswersLocalStorage(faqAnswersData);
            this.isTyping = false;
            this.sendAnswerToUser();
            this.activeFAQDirectory = true;
          }
          console.log(data);
        });
    } else {
      this.isTyping = false;
      console.log("no user message");
      this.showResponse(
        false,
        "Sorry, I couldn't help you out. Would you like to ask a human?"
      );
      this.showBotOptions = true;
      this.botMenuOptions = [
        {
          text: "Chat with a human",
          value: "chat with a human"
        },
        {
          text: "Main Menu",
          value: "go back to main menu"
        }
      ];
    }
  }

  showBotResponseToUser(botResponse) {
    //Display Bot's response to Chat UI
    this.currentIntentName = botResponse.intentName;
    if (
      this.currentIntentName === "askQuestion" ||
      this.currentIntentName === "humanChat"
    ) {
      this.showUserInput = true;
    } else {
      this.showUserInput = false;
    }
    this.showResponse(false, botResponse.message);
    //Check whether the Dialog is at the ending state or not.
    if (botResponse.dialogState !== "Fulfilled" && !botResponse.responseCard) {
      this.showMainMenuButton = false;
      this.showBotOptions = false;
      this.showMainMenuOptions = false;
      //Event Direction is always out
      //Then Check if Intent is humanChat
      //If Intent is askQuestion - Check if activeDirectory is true
      //Check Slot type name
      // Get Client IP
      //Pass Slot type
      //Checking to see if Bot is asking for these specific things from the User
      switch (botResponse.slotToElicit) {
        case "email":
          this.slotToElicit = "email";
          this.sendToBotReportingService(
            "out",
            "alive5_email",
            botResponse.message,
            this.clientIP,
            this.browser,
            this.cookieService.get("a5BotCookie")
          );
          break;
        case "fullname":
          this.slotToElicit = "fullname";
          this.sendToBotReportingService(
            "out",
            "alive5_fullname",
            botResponse.message,
            this.clientIP,
            this.browser,
            this.cookieService.get("a5BotCookie")
          );
          break;
        case "firstname":
          this.slotToElicit = "firstname";
          this.sendToBotReportingService(
            "out",
            "alive5_firstname",
            botResponse.message,
            this.clientIP,
            this.browser,
            this.cookieService.get("a5BotCookie")
          );
          break;
        case "lastname":
          this.slotToElicit = "lastname";
          this.sendToBotReportingService(
            "out",
            "alive5_lastname",
            botResponse.message,
            this.clientIP,
            this.browser,
            this.cookieService.get("a5BotCookie")
          );
          break;
        case "phone":
          this.slotToElicit = "phone";
          this.sendToBotReportingService(
            "out",
            "alive5_phone",
            botResponse.message,
            this.clientIP,
            this.browser,
            this.cookieService.get("a5BotCookie")
          );
          break;
        case "company":
          this.slotToElicit = "company";
          this.sendToBotReportingService(
            "out",
            "alive5_company",
            botResponse.message,
            this.clientIP,
            this.browser,
            this.cookieService.get("a5BotCookie")
          );
          break;
        case "company_title":
          this.slotToElicit = "company_title";
          this.sendToBotReportingService(
            "out",
            "alive5_company_title",
            botResponse.message,
            this.clientIP,
            this.browser,
            this.cookieService.get("a5BotCookie")
          );
          break;
        case "question":
          this.slotToElicit = "question";
          this.sendToBotReportingService(
            "out",
            "alive5_notes",
            botResponse.message,
            this.clientIP,
            this.browser,
            this.cookieService.get("a5BotCookie")
          );
          break;
        default:
          this.sendToBotReportingService(
            "out",
            "html",
            botResponse.message,
            this.clientIP,
            this.browser,
            this.cookieService.get("a5BotCookie")
          );
      }
    } else if (
      botResponse.responseCard &&
      botResponse.dialogState !== "Fulfilled"
    ) {
      //Capture Bot's reply for Bot Reporting API
      switch (botResponse.slotToElicit) {
        case "email":
          this.slotToElicit = "email";
          this.sendToBotReportingService(
            "out",
            "alive5_email",
            botResponse.message,
            this.clientIP,
            this.browser,
            this.cookieService.get("a5BotCookie")
          );
          break;
        case "fullname":
          this.slotToElicit = "fullname";
          this.sendToBotReportingService(
            "out",
            "alive5_fullname",
            botResponse.message,
            this.clientIP,
            this.browser,
            this.cookieService.get("a5BotCookie")
          );
          break;
        case "firstname":
          this.slotToElicit = "firstname";
          this.sendToBotReportingService(
            "out",
            "alive5_firstname",
            botResponse.message,
            this.clientIP,
            this.browser,
            this.cookieService.get("a5BotCookie")
          );
          break;
        case "lastname":
          this.slotToElicit = "lastname";
          this.sendToBotReportingService(
            "out",
            "alive5_lastname",
            botResponse.message,
            this.clientIP,
            this.browser,
            this.cookieService.get("a5BotCookie")
          );
          break;
        case "phone":
          this.slotToElicit = "phone";
          this.sendToBotReportingService(
            "out",
            "alive5_phone",
            botResponse.message,
            this.clientIP,
            this.browser,
            this.cookieService.get("a5BotCookie")
          );
          break;
        case "company":
          this.slotToElicit = "company";
          this.sendToBotReportingService(
            "out",
            "alive5_company",
            botResponse.message,
            this.clientIP,
            this.browser,
            this.cookieService.get("a5BotCookie")
          );
          break;
        case "company_title":
          this.slotToElicit = "company_title";
          this.sendToBotReportingService(
            "out",
            "alive5_company_title",
            botResponse.message,
            this.clientIP,
            this.browser,
            this.cookieService.get("a5BotCookie")
          );
          break;
        case "question":
          this.slotToElicit = "question";
          this.sendToBotReportingService(
            "out",
            "alive5_notes",
            botResponse.message,
            this.clientIP,
            this.browser,
            this.cookieService.get("a5BotCookie")
          );
          break;
        default:
          this.sendToBotReportingService(
            "out",
            "html",
            botResponse.message,
            this.clientIP,
            this.browser,
            this.cookieService.get("a5BotCookie")
          );
          break;
      }

      this.botMenuOptions = [];
      //If the Bot response has a Response Card with Options show them in the UI
      this.responseCards = botResponse.responseCard.genericAttachments;
      this.setBotOptions(this.responseCards, 0);
      this.showBotOptions = true;
      this.bounceMenu = "botResponse";
    } else {
      //Capture Bot's reply for Bot Reporting API
      switch (botResponse.slotToElicit) {
        case "email":
          this.slotToElicit = "email";
          this.sendToBotReportingService(
            "out",
            "alive5_email",
            botResponse.message,
            this.clientIP,
            this.browser,
            this.cookieService.get("a5BotCookie")
          );
          break;
        case "fullname":
          this.slotToElicit = "fullname";
          this.sendToBotReportingService(
            "out",
            "alive5_fullname",
            botResponse.message,
            this.clientIP,
            this.browser,
            this.cookieService.get("a5BotCookie")
          );
          break;
        case "firstname":
          this.slotToElicit = "firstname";
          this.sendToBotReportingService(
            "out",
            "alive5_firstname",
            botResponse.message,
            this.clientIP,
            this.browser,
            this.cookieService.get("a5BotCookie")
          );
          break;
        case "lastname":
          this.slotToElicit = "lastname";
          this.sendToBotReportingService(
            "out",
            "alive5_lastname",
            botResponse.message,
            this.clientIP,
            this.browser,
            this.cookieService.get("a5BotCookie")
          );
          break;
        case "phone":
          this.slotToElicit = "phone";
          this.sendToBotReportingService(
            "out",
            "alive5_phone",
            botResponse.message,
            this.clientIP,
            this.browser,
            this.cookieService.get("a5BotCookie")
          );
          break;
        case "company":
          this.slotToElicit = "company";
          this.sendToBotReportingService(
            "out",
            "alive5_company",
            botResponse.message,
            this.clientIP,
            this.browser,
            this.cookieService.get("a5BotCookie")
          );
          break;
        case "company_title":
          this.slotToElicit = "company_title";
          this.sendToBotReportingService(
            "out",
            "alive5_company_title",
            botResponse.message,
            this.clientIP,
            this.browser,
            this.cookieService.get("a5BotCookie")
          );
          break;
        case "question":
          this.slotToElicit = "question";
          this.sendToBotReportingService(
            "out",
            "alive5_notes",
            botResponse.message,
            this.clientIP,
            this.browser,
            this.cookieService.get("a5BotCookie")
          );
          break;
        default:
          this.sendToBotReportingService(
            "out",
            "html",
            botResponse.message,
            this.clientIP,
            this.browser,
            this.cookieService.get("a5BotCookie")
          );
      }
      if (
        botResponse.slots.fullname &&
        botResponse.slots.email &&
        botResponse.slots.question
      ) {
        this.fullname = botResponse.slots.name;
        this.email = botResponse.slots.email;
        this.question = botResponse.slots.question;
        this.triggerAliveChat();
      }
      if (botResponse.responseCard) {
        //If the Bot response has a Response Card with Options show them in the UI
        this.botMenuOptions = [];
        console.log("botResponses *****", this.fullname, this.email);
        this.responseCards = botResponse.responseCard.genericAttachments;
        this.setBotOptions(this.responseCards, 0);
        this.showBotOptions = true;
        this.bounceMenu = "botResponse";
      } else {
        this.showBotOptions = false;
        this.showMainMenuOptions = false;
        this.showMainMenuButton = true;
      }
    }
  }

  submitMessageToBot(message: any) {
    let messageUserTyped = this.botMessageInput.nativeElement.innerText;
    messageUserTyped = messageUserTyped.replace(/(\r\n|\n|\r)/gm, "");
    if (messageUserTyped === "") {
      return;
    }
    this.showResponse(true, messageUserTyped);
    this.botMessageInput.nativeElement.innerText = "";
    this.multipleCards = false;
    if (this.activeFAQDirectory === false) {
      this.showBotOptions = false;
      //If the user is replying to a Bot's question; we check what slot we are answering for API.
      if (this.slotToElicit) {
        switch (this.slotToElicit) {
          case "email":
            this.slotToElicit = null;
            this.sendToBotReportingService(
              "in",
              "alive5_email",
              messageUserTyped,
              this.clientIP,
              this.browser,
              this.cookieService.get("a5BotCookie")
            );
            break;
          case "fullname":
            this.slotToElicit = null;
            this.sendToBotReportingService(
              "in",
              "alive5_fullname",
              messageUserTyped,
              this.clientIP,
              this.browser,
              this.cookieService.get("a5BotCookie")
            );
            break;
          case "firstname":
            this.slotToElicit = null;
            this.sendToBotReportingService(
              "in",
              "alive5_firstname",
              messageUserTyped,
              this.clientIP,
              this.browser,
              this.cookieService.get("a5BotCookie")
            );
            break;
          case "lastname":
            this.slotToElicit = null;
            this.sendToBotReportingService(
              "in",
              "alive5_lastname",
              messageUserTyped,
              this.clientIP,
              this.browser,
              this.cookieService.get("a5BotCookie")
            );
            break;
          case "phone":
            this.slotToElicit = null;
            this.sendToBotReportingService(
              "in",
              "alive5_phone",
              messageUserTyped,
              this.clientIP,
              this.browser,
              this.cookieService.get("a5BotCookie")
            );
            break;
          case "company":
            this.slotToElicit = null;
            this.sendToBotReportingService(
              "in",
              "alive5_company",
              messageUserTyped,
              this.clientIP,
              this.browser,
              this.cookieService.get("a5BotCookie")
            );
            break;
          case "company_title":
            this.slotToElicit = null;
            this.sendToBotReportingService(
              "in",
              "alive5_company_title",
              messageUserTyped,
              this.clientIP,
              this.browser,
              this.cookieService.get("a5BotCookie")
            );
            break;
          case "question":
            this.slotToElicit = null;
            this.sendToBotReportingService(
              "in",
              "alive5_notes",
              messageUserTyped,
              this.clientIP,
              this.browser,
              this.cookieService.get("a5BotCookie")
            );
            break;
        }
      } else {
        this.sendToBotReportingService(
          "in",
          "html",
          messageUserTyped,
          this.clientIP,
          this.browser,
          this.cookieService.get("a5BotCookie")
        );
      }
      if (this.currentIntentName === "askQuestion") {
        this.makeCallToFAQAPI(messageUserTyped);
      } else if (this.currentIntentName === "humanChat") {
        this.sendTextMessageToBot(messageUserTyped);
      }
    } else {
      this.sendToBotReportingService(
        "in",
        "html",
        messageUserTyped,
        this.clientIP,
        this.browser,
        this.cookieService.get("a5BotCookie")
      );
      if (messageUserTyped.toLowerCase() === "yes") {
        this.isTyping = true;
        this.showBotOptions = false;
        this.sendSuccessFAQMessage();
      } else if (messageUserTyped.toLowerCase() === "no") {
        this.sendAnswerToUser();
        this.showBotOptions = false;
      } else if (messageUserTyped.toLowerCase() === "go back to main menu") {
        this.sendTextMessageToBot(messageUserTyped.toLowerCase());
        this.activeFAQDirectory = false;
        this.removeFAQAnswersLocalStorage();
      } else {
        this.showResponse(false, "Let me search for that real quick");
        this.removeFAQAnswersLocalStorage();
        this.showBotOptions = false;
        setTimeout(() => {
          this.makeCallToFAQAPI(messageUserTyped);
        }, 1000);
      }
    }
  }

  sendTextMessageToBot(textMessage) {
    this.userMessageInput = "";
    // Gather needed parameters for Amazon Lex
    let params = {
      botAlias: "$LATEST",
      botName: "HDNbot",
      inputText: textMessage,
      userId: this.lexUserID
    };
    // Send Main Menu Button text value to Amazon Lex Bot
    this.lexRuntime.postText(params, (err, data) => {
      if (err) {
        console.log(err, err.stack);
      }
      if (data) {
        console.log("boooottttttttt: ", data);
        this.lexBotResponseObj = data;
        this.showBotResponseToUser(data);
      }
    });
  }

  chooseMainOption(evt: any) {
    //Get text value from Main Menu Button
    let optionText = evt.target.value;
    // Show Main Menu Button text value in Messages UI
    this.showResponse(true, optionText);
    this.sendTextMessageToBot(optionText);
  }

  makePurchase(botResponse) {
    if (botResponse) {
      this.movieTitle = botResponse;
    } else {
      this.movieTitle = null;
    }
    console.log(this.movieTitle);
  }

  exchangeContact() {
    this.triggerAliveChat();
  }

  triggerAliveChat() {
    //for Hal's webbot
    let alive5_sms_phone_number, alive5_sms_message_question;

    if (window.location.pathname == "/budweiser-gardens") {
      alive5_sms_phone_number = "+15196675700";
      alive5_sms_message_question =
        "I'd like to connect with Budweiser Gardens Concierge [hit Send>]";
    }

    if (window.location.pathname == "/alive5?u=dustin@alive5.com") {
      alive5_sms_phone_number = "+17139994636";
      alive5_sms_message_question =
        "I'd like to connect with dustin@alive5.com [hit Send>]";
    }

    if (window.location.pathname == "/alive5?u=glenn@alive5.com") {
      alive5_sms_phone_number = "+17139994636";
      alive5_sms_message_question =
        "I'd like to connect with glenn@alive5.com [hit Send>]";
    }

    let alive5_pre_link;
    let alive5_isDesktop = false;
    let alive5_platform = navigator.platform.toUpperCase();
    let alive5_isMobile = true;
    let alive5_is_alive5_phone_number;

    switch (alive5_platform) {
      case "IPAD":
        alive5_isMobile = false;
        //desktop Apple
        if (alive5_is_alive5_phone_number == "Y") {
          alive5_pre_link =
            "javascript:popAliveSMS('" + alive5_sms_phone_number + "')";
          alive5_isDesktop = true;
        } else {
          alive5_pre_link = "javascript:void()";
        }
        break;
      case "IPHONE":
        //see if 5, 6, or 7
        //mobile
        var isSafari =
          navigator.vendor &&
          navigator.vendor.indexOf("Apple") > -1 &&
          navigator.userAgent &&
          !navigator.userAgent.match("CriOS");

        if (isSafari && window.self !== window.top) {
          //if safari AND in iframe. If in iframe, iMessages does not trigger, so open a new web page with a hack to run the SMS via redirect when page loads.
          //mainly for WIX embed widget issue.
          alive5_pre_link =
            "javascript:window.open( alive5_cdn_url + '/test/click.html?phone_number=" +
            alive5_sms_phone_number +
            "');";
          alive5_isDesktop = true;
        } else {
          alive5_pre_link =
            "sms:" +
            alive5_sms_phone_number +
            "&body=" +
            alive5_sms_message_question;
        }
        break;
      default:
        //ANDROID and Desktop others
        //3/6/19 - chrome (72.0.3626.121) on android does not populate SMS
        if (/Mobi/.test(navigator.userAgent)) {
          //alive5_pre_link = 'sms:' + alive5_sms_phone_number + '?body=' + alive5_sms_message_question;
          alive5_pre_link =
            "sms://" +
            alive5_sms_phone_number +
            "?body=" +
            alive5_sms_message_question;
        } else {
          alive5_isMobile = false;
          alive5_pre_link =
            "javascript:popAliveSMS('" + alive5_sms_phone_number + "')";
          alive5_isDesktop = true;
        }
        break;
    }
    if (alive5_isDesktop) {
      //currently desktop is not supported
      //End alive5 Widget Code v2.0
      window.location.href = `https://go.websitealive.com/alive5/wsa-connect/?name=${
        this.fullname
      }&email=${this.email}&question=${this.question}`;
    } else {
      //alive5_cta_button is your object/button you want enabled with SMS trigger
      if (this.currentIntentName === "humanChat") {
        window.location.href = `https://go.websitealive.com/alive5/wsa-connect/?name=${
          this.fullname
        }&email=${this.email}&question=${this.question}`;
      } else {
        document.location.href = alive5_pre_link;
      }
    }
  }

  openGallery() {
    this.galleryService.openGallery(1, 0);
  }

  chooseBotOption(evt: any) {
    let optionText = evt.target.value;
    this.sendToBotReportingService(
      "in",
      "html",
      optionText,
      this.clientIP,
      this.browser,
      this.cookieService.get("a5BotCookie")
    );
    if (this.activeFAQDirectory === true) {
      if (optionText === "yes") {
        this.isTyping = true;
        this.sendSuccessFAQMessage();
        this.showBotOptions = false;
      } else if (optionText === "go back to main menu") {
        this.isTyping = true;
        this.sendTextMessageToBot(optionText);
        this.showBotOptions = false;
        this.activeFAQDirectory = false;
      } else {
        this.isTyping = true;
        this.sendAnswerToUser();
        this.showBotOptions = false;
      }
    } else {
      let botQuote;
      switch (optionText) {
        //Check if special action is required by certain button pressed
        case "chat with a human":
          botQuote = `<p>Ok, I see you want to chat with a real human. I suppose I’m not human enough, huh? It’s ok, I’m not hurt as I have no feelings. Let me get you someone.</p>`;
          this.showResponse(false, botQuote);
          this.sendTextMessageToBot(optionText);
          this.bounceMenu = "button";
          break;
        case "call me":
          botQuote = `<p>Call Me</p>`;
          this.showResponse(false, botQuote);
          this.showAliveDialModal = true;
          this.bounceMenu = "button";
          break;
        case "gallery":
          botQuote = `<p>Gallery Text:</p>`;
          this.showResponse(false, botQuote);
          this.openGallery();
          break;
          case "fifty foot":
            botQuote = `<p>50' Floor Plans:</p>`;
            this.showResponse(false, botQuote);
            this.openGallery();
            break;
        default:
          this.showResponse(true, optionText);
          this.sendTextMessageToBot(optionText);
          this.bounceMenu = "button";
          break;
      }
    }
  }

  modalState(evt: any) {
    let userQuote;
    let botQuote;
    switch (evt.triggeredBy) {
      case "alivedial-cancel-btn":
        this.showAliveDialModal = evt.dialogState;
        userQuote = `Don't call me right now.`;
        this.showResponse(true, userQuote);
        botQuote = `Anything else I can help you with?`;
        this.bounceMenu = "button";
        setTimeout(() => {
          this.showBotOptions = true;
          this.botOptionsTitle = "View Main Menu?";
          this.botMenuOptions = [
            {
              text: "View other ticket options",
              value: "buy tickets"
            },
            {
              text: "Main Menu",
              value: "menu"
            }
          ];
        }, 1000);
        break;
      case "alivedial-make-call":
        this.showAliveDialModal = evt.dialogState;
        userQuote = `Yes, I'm ready for a call.`;
        this.showResponse(true, userQuote);
        botQuote =
          "Ok, one of our agents should reach out to you soon. Can I help you with anything else?";
        this.showResponse(false, botQuote);
        this.bounceMenu = "button";
        setTimeout(() => {
          this.showBotOptions = true;
          this.botOptionsTitle = "View Main Menu?";
          this.botMenuOptions = [
            {
              text: "View other ticket options",
              value: "buy tickets"
            },
            {
              text: "Main Menu",
              value: "menu"
            }
          ];
        }, 1000);
        break;
    }
  }
}
