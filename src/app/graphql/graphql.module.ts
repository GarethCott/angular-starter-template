import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { Apollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';

@NgModule({
  imports: [
    HttpClientModule
  ],
  providers: [
    Apollo,
    HttpLink
  ]
})
export class GraphQLModule {} 