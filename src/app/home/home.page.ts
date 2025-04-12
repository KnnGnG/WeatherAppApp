import { Component, OnInit } from '@angular/core';
import { WeatherService } from '../services/weather.service';
import { FormControl } from '@angular/forms';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss']
})
export class HomePage implements OnInit {

  searchControl = new FormControl('');
  currentWeather: any;
  forecast: any[] = [];
  hourlyForecast: any[] = [];
  isCelsius: boolean = true;
  alertsEnabled: boolean = true;
  isDarkMode: boolean = false;
  unitType: string = 'metric';

  constructor(
    private weatherService: WeatherService,
    private toastCtrl: ToastController
  ) {}

  async ngOnInit() {
    await this.weatherService.loadSavedTheme();
    await this.loadSettings();
    await this.loadWeatherByCurrentLocation();
    this.checkTheme();
  }

  async loadSettings() {
    const unit = await this.weatherService.getCachedWeatherData('unit');
    const alert = await this.weatherService.getCachedWeatherData('alerts');

    this.isCelsius = unit !== 'imperial';
    this.unitType = this.isCelsius ? 'metric' : 'imperial';
    this.alertsEnabled = alert !== false;
  }

  checkTheme() {
    const currentTheme = document.body.getAttribute('color-theme');
    this.isDarkMode = currentTheme === 'dark';
  }

  async loadWeatherByCurrentLocation() {
    try {
      const coords = await this.weatherService.getCurrentLocation();
      await this.loadWeather(coords.lat, coords.lon);
    } catch (error) {
      this.showToast('Failed to get location.');
    }
  }

  async searchWeather() {
    const city = this.searchControl.value;
    if (!city) {
      this.showToast('Please enter a city name.');
      return;
    }

    try {
      const geo: any = await this.weatherService.getGeoByCity(city);
      await this.loadWeather(geo.lat, geo.lon);
    } catch (error) {
      this.showToast('City not found.');
    }
  }

  async loadWeather(lat: number, lon: number) {
    const online = await this.weatherService.isOnline();

    if (online) {
      this.currentWeather = await this.weatherService.getWeatherByCoords(lat, lon, this.unitType).toPromise();
      const forecastData: any = await this.weatherService.getForecastByCoords(lat, lon, this.unitType).toPromise();

      // Real 5-Day Forecast (12:00PM only)
      this.forecast = forecastData.list.filter((item: any) =>
        item.dt_txt.includes('12:00:00')
      );

      // Hourly Forecast (Today Only)
      const today = new Date().toISOString().split('T')[0];
      this.hourlyForecast = forecastData.list.filter((item: any) =>
        item.dt_txt.startsWith(today)
      );

      await this.weatherService.cacheWeatherData('lastWeatherData', {
        currentWeather: this.currentWeather,
        forecast: this.forecast,
        hourlyForecast: this.hourlyForecast
      });

    } else {
      const cached = await this.weatherService.getCachedWeatherData('lastWeatherData');
      if (cached) {
        this.currentWeather = cached.currentWeather;
        this.forecast = cached.forecast;
        this.hourlyForecast = cached.hourlyForecast;
        this.showToast('Offline Mode: Loaded Cached Weather');
      } else {
        this.showToast('Offline Mode: No Cached Data');
      }
    }
  }

  toggleUnits() {
    this.isCelsius = !this.isCelsius;
    this.unitType = this.isCelsius ? 'metric' : 'imperial';
    this.weatherService.cacheWeatherData('unit', this.unitType);
    this.loadWeatherByCurrentLocation();
  }

  toggleAlerts() {
    this.alertsEnabled = !this.alertsEnabled;
    this.weatherService.cacheWeatherData('alerts', this.alertsEnabled);
  }

  async showToast(msg: string) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 2000,
      position: 'top'
    });
    await toast.present();
  }

}
