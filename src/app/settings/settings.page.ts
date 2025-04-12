import { Component, OnInit } from '@angular/core';
import { WeatherService } from '../services/weather.service';

@Component({
  selector: 'app-settings',
  standalone: false,
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss']
})
export class SettingsPage implements OnInit {

  isCelsius: boolean = true;
  alertsEnabled: boolean = true;

  constructor(public weatherService: WeatherService) { }

  async ngOnInit() {
    const unit = await this.weatherService.getCachedWeatherData('unit');
    const alert = await this.weatherService.getCachedWeatherData('alerts');

    this.isCelsius = unit !== 'imperial';
    this.alertsEnabled = alert !== false;
  }

  toggleUnits() {
    this.isCelsius = !this.isCelsius;
    const unit = this.isCelsius ? 'metric' : 'imperial';
    this.weatherService.cacheWeatherData('unit', unit);
  }

  toggleAlerts() {
    this.alertsEnabled = !this.alertsEnabled;
    this.weatherService.cacheWeatherData('alerts', this.alertsEnabled);
  }
}
