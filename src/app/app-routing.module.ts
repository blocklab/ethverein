import { MetaMaskComponent } from './meta-mask/meta-mask.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { VotesComponent } from './votes/votes.component';
import { MembersComponent } from './members/members.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { VoteListComponent } from './vote-list/vote-list.component';

const routes: Routes = [
  { path: '', redirectTo: '/myVerein', pathMatch: 'full' },
  { path: 'members', component: MembersComponent },
  { path: 'newVote', component: VotesComponent },
  { path: 'myVerein', component: DashboardComponent },
  { path: 'MetaMask', component: MetaMaskComponent },
  { path: 'votes', component: VoteListComponent },  
  { path: '**', component: NotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
export const routingComponents = [
  MembersComponent,
  VotesComponent,
  DashboardComponent,
  MetaMaskComponent,
  NotFoundComponent
];

