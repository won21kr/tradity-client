import { Component, OnInit } from '@angular/core';

@Component({
  selector: '[tradity-form]',
  styleUrls: ['app/shared/form.component.css'],
  template: '<ng-content></ng-content>'
})
export class FormComponent implements OnInit {
  constructor() { }

  ngOnInit() { }
}