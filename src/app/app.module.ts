import { DroppableModule } from '@ctrl/ngx-droppable';
import { ClipboardModule } from 'ngx-clipboard';
import { Web3Service } from './services/web3.service';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { MDBBootstrapModule } from 'angular-bootstrap-md';
import { AppRoutingModule, routingComponents } from './app-routing.module';
import { AppComponent } from './app.component';
import { MembersComponent } from './members/members.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { VotesComponent } from './votes/votes.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MetaMaskComponent } from './meta-mask/meta-mask.component';
import { ConfirmApplicationDialogComponent } from './dialogs/confirm-application-dialog/confirm-application-dialog.component';
import {
  MatFormFieldModule, MatGridListModule, MatCardModule, MatToolbarModule,
  MatMenuModule, MatIconModule, MatButtonToggleModule, MatButtonModule,
  MatSortModule, MatInputModule, MatSnackBarModule, MatTooltipModule, MatTableModule,
  MatDialogModule, MatTabsModule, MatStepperModule, MatSelectModule, MatOptionModule
} from '@angular/material';
import { CastVoteDialogComponent } from './dialogs/cast-vote-dialog/cast-vote-dialog.component';
import { VoteListComponent } from './vote-list/vote-list.component';
import { ConfirmCloseVoteDialogComponent } from './dialogs/confirm-close-vote-dialog/confirm-close-vote-dialog.component';
import { ConfirmResignDialogComponent } from './dialogs/confirm-resign-dialog/confirm-resign-dialog.component';
import { NewsfeedComponent } from './newsfeed/newsfeed.component';

@NgModule({
  declarations: [
    AppComponent,
    MembersComponent,
    DashboardComponent,
    VotesComponent,
    NotFoundComponent,
    MetaMaskComponent,
    ConfirmApplicationDialogComponent,
    CastVoteDialogComponent,
    VoteListComponent,
    ConfirmCloseVoteDialogComponent,
    ConfirmResignDialogComponent,
    NewsfeedComponent,
  ],
  imports: [
    BrowserModule,
    DroppableModule,
    ClipboardModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatGridListModule,
    MatCardModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSortModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    MatTabsModule,
    MatStepperModule,
    MatTooltipModule,
    MatButtonToggleModule,
    MatTableModule,
    MatDialogModule,
    MatSelectModule,
    MatOptionModule,
    MDBBootstrapModule.forRoot()
  ],
  providers: [
    Web3Service,
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    ConfirmApplicationDialogComponent,
    ConfirmCloseVoteDialogComponent,
    CastVoteDialogComponent,
    ConfirmResignDialogComponent
  ]
})
export class AppModule {

}
