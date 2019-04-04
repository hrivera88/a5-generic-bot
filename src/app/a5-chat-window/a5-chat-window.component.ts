import {
  Component,
  OnInit,
  Renderer2,
  ViewChild,
  ElementRef
} from "@angular/core";
import { HttpHeaders, HttpClient } from '@angular/common/http';
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
  faArrowRight
} from "@fortawesome/free-solid-svg-icons";
import { Message } from "./message";
import { Option } from "./option";
import * as AWS from "aws-sdk";
import * as _ from "lodash";
import { SendMailService } from "../send-mail.service";
import { ReturnStatement } from "@angular/compiler";

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
  isTyping = false;
  activeFAQDirectory = false;
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

  // Customizing
  windowContainerStyle = {
    'background': `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('/budweiser-gardens/assets/img/BudGardens-BW-Background.png') center center no-repeat`,
    'border-left': `1px solid #ccc`,
    'border-right': '1px solid #ccc',
    'background-size': 'cover'
  };
  windowBannerStyle = {
    'background': 'rgba(0, 0, 0, 0.7)',
    'border-bottom-color': '#f8f8f8'
  };
  logoImg = "/budweiser-gardens/assets/img/budweiser-logo.svg";
  showGreetingSection = false;
  greetingLine = "Welcome to Doc Juris!";
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
    'background': 'none'
  };
  botOptionButtonStyle = {
    'border-color': '#d71920',
    color: '#fff',
    'background': '#d71920'
  }
  botOptionTitleStyle = {
    'color': "#fff"

  }
  messageListStyle = {
    'background': 'none'
  };
  sendButtonStyle = {
    color: '#d71920'
  };
  messageSubmissionStyle = {
    background: '#000'
  };
  constructor(
    private sendMailService: SendMailService,
    private renderer: Renderer2,
    private http: HttpClient
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
      this.botMenuOptions.push(opt);
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
          this.botOptionsTitle = "Speak with a person?"
          this.botMenuOptions = [
            {
              text: 'Text Us Your Question',
              value: 'text us your question'
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
            console.log('subscride error');
            this.isTyping = false;
            this.showResponse(false, 'Sorry, I couldn\'t help you out. Would you like to ask a human?');
            this.showBotOptions = true;
            this.botMenuOptions = [
              {
                text: 'Text Us Your Question',
                value: 'text us your question'
              }];
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
      console.log('no userMessage');
      this.showResponse(false, 'Sorry, I couldn\'t help you out. Would you like to ask a human?');
      this.showBotOptions = true;
      this.botMenuOptions = [
        {
          text: 'Text Us Your Question',
          value: 'text us your question'
        }];
    }
  }
  showBotResponseToUser(botResponse) {
    //Display Bot's response to Chat UI

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
      if (botResponse.responseCard) {
        //If the Bot response has a Response Card with Options show them in the UI
        this.botMenuOptions = [];
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
    messageUserTyped = messageUserTyped.replace(/(\r\n|\n|\r)/gm, "")
    if (messageUserTyped === '') {
      return;
    }
    this.showResponse(true, messageUserTyped);
    this.botMessageInput.nativeElement.innerText = "";
    this.multipleCards = false;
    if (this.activeFAQDirectory === false) {
      this.showBotOptions = false;
      this.makeCallToFAQAPI(messageUserTyped);
    } else {
      // do stuff if theres a active local stored faq list
      if (messageUserTyped.toLowerCase() === 'yes') {
        this.isTyping = true;
        this.showBotOptions = false;
        this.sendSuccessFAQMessage();
      } else if (messageUserTyped.toLowerCase() === 'no') {
        this.sendAnswerToUser();
        this.showBotOptions = false;
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
      botName: "BudweiserGardens",
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

  triggerAliveChat() {
    //for Hal's webbot
    let alive5_sms_phone_number, alive5_sms_message_question;

    if (window.location.pathname == '/budweiser-gardens') {
      alive5_sms_phone_number = '+15196675700';
      alive5_sms_message_question = 'I\'d like to connect with Budweiser Gardens Concierge [hit Send>]';
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
    } else {
      //alive5_cta_button is your object/button you want enabled with SMS trigger
      document.location.href = alive5_pre_link;
    }
  }

  chooseBotOption(evt: any) {
    let optionText = evt.target.value;
    this.showResponse(true, optionText);
    if (this.activeFAQDirectory === true) {
      if (optionText === 'yes') {
        this.isTyping = true;
        this.sendSuccessFAQMessage();
        this.showBotOptions = false;
      } else {
        this.isTyping = true;
        this.sendAnswerToUser();
        this.showBotOptions = false;
      }
    } else {
      if (optionText === 'text us your question') {
        this.triggerAliveChat();
      } else {
        this.sendTextMessageToBot(optionText);
        this.bounceMenu = "button";
        this.showBotOptions = false;
      }
    }
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

  modalState(evt: any) {
    this.showAlivePayModal = evt;
  }
}
