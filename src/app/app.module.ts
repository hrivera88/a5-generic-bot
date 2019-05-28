import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

import { AppComponent } from "./app.component";
import { A5ChatWindowComponent } from "./a5-chat-window/a5-chat-window.component";
import { A5ChatBubbleComponent } from "./a5-chat-bubble/a5-chat-bubble.component";

import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { LottieAnimationViewModule } from "ng-lottie";
import { HtmlSanitizerPipe } from "./html-sanitizer.pipe";
import { PickerModule } from "@ctrl/ngx-emoji-mart";
import { EmojiModule } from "@ctrl/ngx-emoji-mart/ngx-emoji";
import { A5AlivepayModalComponent } from "./a5-alive5-modal/a5-alive5-modal.component";

import "hammerjs";
import "mousetrap";
import { ModalGalleryModule } from "angular-modal-gallery";
import { AutofocusDirective } from "./autofocus.directive";
import { CookieService } from "ngx-cookie-service";
import { DeviceDetectorModule } from "ngx-device-detector";

@NgModule({
  declarations: [
    AppComponent,
    A5ChatWindowComponent,
    A5ChatBubbleComponent,
    HtmlSanitizerPipe,
    A5AlivepayModalComponent,
    AutofocusDirective
  ],
  imports: [
    BrowserModule,
    FontAwesomeModule,
    FormsModule,
    LottieAnimationViewModule.forRoot(),
    BrowserAnimationsModule,
    HttpClientModule,
    PickerModule,
    EmojiModule,
    DeviceDetectorModule.forRoot(),
    ModalGalleryModule.forRoot()
  ],
  providers: [CookieService],
  bootstrap: [AppComponent]
})
export class AppModule {}
