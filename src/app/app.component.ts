import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { WeatherService } from '../app/services/weather.service';

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {

  constructor(private platform: Platform, private weatherService: WeatherService) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.weatherService.loadSavedTheme();
    });
  }
}
