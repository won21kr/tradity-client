import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { GroupService } from '../group.service';

@Component({
  moduleId: module.id,
  selector: 'tradity-group',
  templateUrl: 'group.component.html'
})
export class GroupComponent implements OnInit {
  private groupSubscription: Subscription;
  group: any = {};

  constructor(private route: ActivatedRoute, private groupService: GroupService) { }

  ngOnInit() {
    this.groupSubscription = this.route.params
      .switchMap((params: Params) => this.groupService.getGroup(params['id']))
      .subscribe(res => this.group = res);
  }
}