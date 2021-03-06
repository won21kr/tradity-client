import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { routing } from './admin.routing';
import { AdminComponent } from './admin.component';
import { AdminUserlistComponent } from './admin-userlist.component';
import { AdminGroupsComponent } from './admin-groups.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    routing
  ],
  exports: [],
  declarations: [
    AdminComponent,
    AdminUserlistComponent,
    AdminGroupsComponent
  ],
  providers: [],
})
export class AdminModule { }
