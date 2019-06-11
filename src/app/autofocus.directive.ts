import { Directive, AfterContentInit, ElementRef, Input } from '@angular/core';

@Directive({
  selector: '[autofocus]'
})
export class AutofocusDirective implements AfterContentInit {
  @Input() public autofocus: boolean;
  constructor(private el: ElementRef) { }

  ngAfterContentInit() {
    setTimeout(() => {
      this.el.nativeElement.focus();
    }, 500);
  }

}
