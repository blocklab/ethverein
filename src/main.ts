import { AppRoutingModule } from './app/app-routing.module';
import { Router } from '@angular/router';
import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';



if (environment.production) {
  enableProdMode();
}

window.addEventListener('load', function () {

  
  platformBrowserDynamic().bootstrapModule(AppModule)
    .catch(err => console.log(err));
});
