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
import * as AWS from "aws-sdk";
import * as _ from "lodash";
import { SendMailService } from "../send-mail.service";
import { ReturnStatement } from "@angular/compiler";
import { Image, GalleryService } from 'angular-modal-gallery';

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

  //EDITS: add the following:
// HAL:  Bot UPDATE: ‘sendTextMsgToBot’ function make a change to parameters from string to variable and add to variable to customization section.
// HAL: update master branch with changes:
// * Contact button with on/off
// * aliveDial on/off
// * Word wrapping to chat bubbles
// * Knowledgebase - limiting answers to 3 then ask if wants to speak with a human
// * Style.css add. Message ul paddding-left: 1.5rem


  // Customizing **************
  windowBannerStyle = {
    'background-color': '#fff',
    'border-bottom-color': '#000'
  };
  logoImg = "/assets/img/walter-bond-logo-1.jpg";  //EDIT with s3 bucket file name
  showGreetingSection = true;
  greetingLine = "Welcome Walter Bond KeyNote Speaker!"; 
  greetingSectionStyle = {
    'background-color': '#486290'
  };
  greetingFontStyle = {
    color: '#fff'
  };
  botOptionsImg = false;
  showBotOptions = false;
  botOptionImgSource = "../../assets/img/featurettes-header.png";
  botOptionsStyle = {
    'background-color': '#486290'
  };
  botOptionButtonStyle = {
    'border-color': '#f1592b',
    color: '#fff',
    background: '#f1592b'
  }
  botOptionTitleStyle = {
    'color': "#fff"

  }
  messageSubmissionStyle = {
    background: '#fff'
  }
  sendButtonStyle = {
    color: '#ff8359'
  };

  //User info for live chat agent
  name = '';
  email = '';
  question = '';
  showUserInput = false;
  currentIntentName = '';
  //elastic search
  activeFAQDirectory = false;
  isTyping = false;
  httpOptions = {
    headers: new HttpHeaders({
      "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhbGl2ZV9wYXkiOnRydWUsImFsbG93X2J1bGtzbXMiOiIiLCJjaGFyZ2ViZWVfcGxhbiI6InByby1wbGFuIiwiY2hhcmdlYmVlX3BsYW5fbGFiZWwiOjksImNyZWRpdHNfdXNlZCI6OTQwOCwiaXNzIjoiYWxpdmU1X2FwaSIsIm1heF9jcmVkaXRzIjoyMzM1MCwib3JnX25hbWUiOiJhbGl2ZTVzdGFnZSIsInBheW1lbnRfbWV0aG9kIjoiY2hhcmdlYmVlIiwic2NyZWVuX25hbWUiOiJkdXN0aW4yIiwic3Vic2NyaXB0aW9uX2VuZF9kYXRlIjoxNTQ4NTgyNzMzLCJzdWJzY3JpcHRpb25faWQiOiJIcjU1MThuUW5VSVF0Yk5FMyIsInN1YnNjcmlwdGlvbl9zdGFydF9kYXRlIjoxNTQ1OTA0MzMzLCJ0eXBlIjoidXNlciIsInVzZXJfaWQiOiIzNzJmMWM2NS0xOWNhLTQwYzctOTJhOC01ZTJiMTNhMDU5MjMiLCJ1c2VyX3JvbGUiOiJhZG1pbiIsInZlcmlmaWVkIjp0cnVlLCJwb2xpY3lfaWQiOiJhMGY3MmMzMC1mYTdjLTQ5Y2EtODM1Mi1lNGZiZDYxMTJlMjMiLCJwb2xpY3kiOnsiY3JlYXRlZF9hdCI6MTU0MzMwNDE1NDY1MiwicG9saWN5X25hbWUiOiJhbGl2ZUNoYXQgRW5hYmxlZCIsInBvbGljeV9mZWF0dXJlcyI6WyJTTVMiLCJCT1RTIiwiYWxpdmVDaGF0IiwiQWxpdmVQYXkiLCJQSVBMIl0sInBvbGljeV9pZCI6ImEwZjcyYzMwLWZhN2MtNDljYS04MzUyLWU0ZmJkNjExMmUyMyJ9LCJpYXQiOjE1NDc2Njg3NDN9.5YDP1-SX0_6YH3GxKhPPNbeFjkb-2MMRtAM_HkwzpBQ",
    }),
    data: {
      "org_name": "spectrabg",
      "search": "",
      "category_name": "Greetings",
    }
  };

  //Check whether an agent is online for Live Chat
  agentOnline: any;

  galleryImages: Image[] = [
    new Image(0, {
      img: 'https://www.websitealive.com/images/chatwindow-1.png',
      description: 'Customized Chat Windows'
    }),
    new Image(1, {
      img: 'https://www.websitealive.com/images/chatwindow-2.png',
      description: 'Customized Chat Windows'
    }),
    new Image(2, {
      img: 'https://www.websitealive.com/images/chatwindow-3.png',
      description: 'Customized Chat Windows'
    }),
    new Image(3, {
      img: 'https://www.websitealive.com/images/chatwindow-4.png',
      description: 'Customized Chat Windows'
    }),
    new Image(4, {
      img: 'https://www.websitealive.com/images/cta-example-1.png',
      description: 'Add a welcoming face to your engagement efforts.'
    }),
    new Image(5, {
      img: 'https://www.websitealive.com/images/cta-example-4.png',
      description: 'Use shortlinks for easy social media or website engagements.'
    }),
    new Image(6, {
      img: 'https://www.websitealive.com/images/cta-example-3.png',
      description: 'Customize call-to-action to suit your website\'s look and feel.'
    }),
    new Image(7, {
      img: 'https://www.websitealive.com/images/cta-example-2.png',
      description: 'Communicate in your customer\'s language.'
    })
  ];

  constructor(
    private sendMailService: SendMailService,
    private renderer: Renderer2,
    private http: HttpClient,
    private galleryService: GalleryService
  ) {
    AWS.config.region = "us-east-1";
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
      IdentityPoolId: "us-east-1:11d2972f-0167-4d1f-be3c-a81711311b6f"
    });
    this.lexRuntime = new AWS.LexRuntime();
  }

  ngOnInit() {
    this.sendTextMessageToBot("menu");
    console.log(screen.width);
    if (screen.width < 768) {
      this.notMobileScreen = false;
    }
    //Making request to API to retrieve info on whether an live chat agent is online or not.
    const params = new HttpParams()
      .set('action', 'groupstatus')
      .set('groupid', '9');
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    this.http
      .get(
        "https://www.websitealive3.com/9/status.asp", { headers: headers, params: params, responseType: 'text' }
      ).subscribe((data) => {
        this.agentOnline = data;
      })
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
      if (opt.value === 'chat with a human') {
        if (this.agentOnline === 'online') {
          this.botMenuOptions.push(opt);
        }
      } else {
        this.botMenuOptions.push(opt);
      }
    });
  }

  checkBotIntent(botResponse) {
    console.log("whoaaaaa", botResponse);
    if (botResponse.intentName === "PortlWatchTrailer") {
      this.showAlivePayModal = true;
    }
  }

  setBotOptions(botOptions, position) {
    console.log("rawrBotOption: ", botOptions);
    console.log("rwarPosition: ", position);
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
    localStorage.setItem('faq-answers', JSON.stringify(answers));
  }

  removeFAQAnswersLocalStorage() {
    localStorage.removeItem('faq-answers');
  }

  sendAnswerToUser() {
    let answers = localStorage.getItem('faq-answers');
    let parsed = JSON.parse(answers);
    if (parsed) {
      if (parsed.length === 0) {
        console.log('parsed equal zeero');
        this.isTyping = false;
        this.showResponse(false, 'Sorry, I couldn\'t help you out. Would you like to ask a human?');
        this.removeFAQAnswersLocalStorage();
        this.activeFAQDirectory = false;

        setTimeout(() => {
          this.botOptionsTitle = "Speak with a person or go to main menu?"
          this.botMenuOptions = [
            {
              text: "Chat with a human",
              value: "chat with a human"
            },
            {
              text: 'Main Menu',
              value: 'go back to main menu'
            }];
          this.showBotOptions = true;
        }, 1000);
      } else {
        this.isTyping = false;
        let answer = parsed.shift();
        this.storeFAQAnswersLocalStorage(parsed);
        this.showResponse(false, answer);
        setTimeout(() => {
          this.botOptionsTitle = 'Was this helpful?'
          this.botMenuOptions = [
            {
              text: 'Yes',
              value: 'yes'
            },
            {
              text: 'No',
              value: 'no'
            }
          ];
          this.showBotOptions = true;
        }, 1000);
      }
    }
  }

  sendSuccessFAQMessage() {
    this.isTyping = false;
    this.showResponse(false, 'Great, if you have any other questions let us know.');
    this.removeFAQAnswersLocalStorage();
    this.activeFAQDirectory = false;
    setTimeout(() => {
      this.showBotOptions = true;
      this.botOptionsTitle = "View Main Menu?"
      this.botMenuOptions = [
        {
          text: 'Main Menu',
          value: 'menu'
        }];
    }, 1000);
  }

  makeCallToFAQAPI(userMessage: string) {
    this.isTyping = true;
    if (userMessage) {
      this.httpOptions.data.search = userMessage;
      this.http.get("https://api-v2.alive5.com/1.0/kb-article/search-external", {
        headers: this.httpOptions.headers,
        params: this.httpOptions.data
      })
        .subscribe((data: any) => {
          if (data.error) {
            console.log('subscribe error');
            this.isTyping = false;
            this.showResponse(false, 'Sorry, I couldn\'t help you out. Would you like to ask a human?');
            this.showBotOptions = true;
            this.botMenuOptions = [
              {
                text: "Chat with a human",
                value: "chat with a human"
              },
              {
                text: 'Main Menu',
                value: 'go back to main menu'
              }];
          } else {
            let faqAnswersData = data.data;
            this.storeFAQAnswersLocalStorage(faqAnswersData);
            this.isTyping = false;
            this.sendAnswerToUser();
            this.activeFAQDirectory = true;
          }
          console.log(data);
        })

    } else {
      this.isTyping = false;
      console.log('no user message');
      this.showResponse(false, 'Sorry, I couldn\'t help you out. Would you like to ask a human?');
      this.showBotOptions = true;
      this.botMenuOptions = [
        {
          text: "Chat with a human",
          value: "chat with a human"
        },
        {
          text: 'Main Menu',
          value: 'go back to main menu'
        }];
    }
  }

  showBotResponseToUser(botResponse) {
    //Display Bot's response to Chat UI
    this.currentIntentName = botResponse.intentName;
    if (this.currentIntentName === 'askQuestion' || this.currentIntentName === 'humanChat') {
      this.showUserInput = true;
    } else {
      this.showUserInput = false;
    }
    this.showResponse(false, botResponse.message);
    //Check whether the Dialog is at the ending state or not.
    if (botResponse.dialogState !== "Fulfilled" && !botResponse.responseCard) {
      console.log("RAWRWRWRWRWRW");
      this.showMainMenuButton = false;
      this.showBotOptions = false;
      this.showMainMenuOptions = false;
    } else if (
      botResponse.responseCard &&
      botResponse.dialogState !== "Fulfilled"
    ) {
      this.botMenuOptions = [];
      //If the Bot response has a Response Card with Options show them in the UI
      this.responseCards = botResponse.responseCard.genericAttachments;
      this.setBotOptions(this.responseCards, 0);
      this.showBotOptions = true;
      this.bounceMenu = "botResponse";
    } else {
      if (botResponse.slots.name && botResponse.slots.email && botResponse.slots.question) {
        this.name = botResponse.slots.name;
        this.email = botResponse.slots.email;
        this.question = botResponse.slots.question;
        this.triggerAliveChat();
      }
      if (botResponse.responseCard) {
        //If the Bot response has a Response Card with Options show them in the UI
        this.botMenuOptions = [];
        console.log('botResponses *****', this.name, this.email)
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
    if (messageUserTyped === '') {
      return;
    }
    this.showResponse(true, messageUserTyped);
    this.botMessageInput.nativeElement.innerText = "";
    this.multipleCards = false;
    if (this.activeFAQDirectory === false) {
      this.showBotOptions = false;
      if (this.currentIntentName === 'askQuestion') {
        this.makeCallToFAQAPI(messageUserTyped);
      } else if (this.currentIntentName === 'humanChat') {
        this.sendTextMessageToBot(messageUserTyped);
      }
    } else {
      if (messageUserTyped.toLowerCase() === 'yes') {
        this.isTyping = true;
        this.showBotOptions = false;
        this.sendSuccessFAQMessage();
      } else if (messageUserTyped.toLowerCase() === 'no') {
        this.sendAnswerToUser();
        this.showBotOptions = false;
      } else if (messageUserTyped.toLowerCase() === 'go back to main menu') {
        this.sendTextMessageToBot(messageUserTyped.toLowerCase());
        this.activeFAQDirectory = false;
        this.removeFAQAnswersLocalStorage();
      } else {
        this.showResponse(false, 'Let me search for that real quick');
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
      botName: "bemerUserBot",
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

  // chooseBotOption(evt: any) {
  //   let optionText = evt.target.value;
  //   this.showResponse(true, optionText);
  //   if (optionText === 'schedule a demo') {
  //     this.triggerAliveChat();
  //   } else {
  //     this.sendTextMessageToBot(optionText);
  //   }
  //   this.bounceMenu = "button";
  // }

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

  modalState(evt: any) {
    this.showAlivePayModal = evt;
  }

  exchangeContact() {
    this.triggerAliveChat();
  }

  triggerAliveChat() {
    //for Hal's webbot
    let alive5_sms_phone_number, alive5_sms_message_question;

    if (window.location.pathname == '/budweiser-gardens') {
      alive5_sms_phone_number = '+15196675700';
      alive5_sms_message_question = 'I\'d like to connect with Budweiser Gardens Concierge [hit Send>]';
    }

    if (window.location.pathname == '/alive5?u=dustin@alive5.com') {
      alive5_sms_phone_number = '+17139994636';
      alive5_sms_message_question = 'I\'d like to connect with dustin@alive5.com [hit Send>]';
    }

    if (window.location.pathname == '/alive5?u=glenn@alive5.com') {
      alive5_sms_phone_number = '+17139994636';
      alive5_sms_message_question = 'I\'d like to connect with glenn@alive5.com [hit Send>]';
    }

    let alive5_pre_link;
    let alive5_isDesktop = false;
    let alive5_platform = navigator.platform.toUpperCase();
    let alive5_isMobile = true;
    let alive5_is_alive5_phone_number;

    switch (alive5_platform) {
      case 'IPAD':
        alive5_isMobile = false;
        //desktop Apple
        if (alive5_is_alive5_phone_number == 'Y') {
          alive5_pre_link = 'javascript:popAliveSMS(\'' + alive5_sms_phone_number + '\')';
          alive5_isDesktop = true;
        } else {
          alive5_pre_link = 'javascript:void()';
        }
        break;
      case 'IPHONE':
        //see if 5, 6, or 7
        //mobile
        var isSafari = navigator.vendor && navigator.vendor.indexOf('Apple') > -1 &&
          navigator.userAgent && !navigator.userAgent.match('CriOS');

        if (isSafari && (window.self !== window.top)) {
          //if safari AND in iframe. If in iframe, iMessages does not trigger, so open a new web page with a hack to run the SMS via redirect when page loads.
          //mainly for WIX embed widget issue.
          alive5_pre_link = "javascript:window.open( alive5_cdn_url + '/test/click.html?phone_number=" + alive5_sms_phone_number + "');";
          alive5_isDesktop = true;
        } else {
          alive5_pre_link = 'sms:' + alive5_sms_phone_number + '&body=' + alive5_sms_message_question;
        }
        break;
      default:
        //ANDROID and Desktop others
        //3/6/19 - chrome (72.0.3626.121) on android does not populate SMS
        if (/Mobi/.test(navigator.userAgent)) {
          //alive5_pre_link = 'sms:' + alive5_sms_phone_number + '?body=' + alive5_sms_message_question;
          alive5_pre_link = 'sms://' + alive5_sms_phone_number + '?body=' + alive5_sms_message_question;
        } else {
          alive5_isMobile = false;
          alive5_pre_link = 'javascript:popAliveSMS(\'' + alive5_sms_phone_number + '\')';
          alive5_isDesktop = true;
        }
        break;
    }
    if (alive5_isDesktop) {
      //currently desktop is not supported
      //End alive5 Widget Code v2.0
      window.location.href = `https://go.websitealive.com/alive5/wsa-connect/?name=${
        this.name
        }&email=${this.email}&question=${this.question}`;
    } else {
      //alive5_cta_button is your object/button you want enabled with SMS trigger
      if (this.currentIntentName === "humanChat") {
        window.location.href = `https://go.websitealive.com/alive5/wsa-connect/?name=${
          this.name
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
    if (this.activeFAQDirectory === true) {
      if (optionText === 'yes') {
        this.isTyping = true;
        this.sendSuccessFAQMessage();
        this.showBotOptions = false;
      } else if (optionText === 'go back to main menu') {
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
        case "our story":
          botQuote = `<p>WebsiteAlive is a forward thinking online communications provider dedicated to creating innovative, customizable, and unique experiences for businesses and consumers.</p>`;
          this.showResponse(false, botQuote);
          this.sendTextMessageToBot(optionText);
          this.bounceMenu = "button";
          break;
        case 'customization':
          botQuote = `<p>Customizable chat windows and calls to action to uniquely match your brand:</p>`;
          this.showResponse(false, botQuote);
          this.openGallery();
          break;
        default:
          this.showResponse(true, optionText);
          this.sendTextMessageToBot(optionText);
          this.bounceMenu = "button";
      }
    }
  }
  

}
