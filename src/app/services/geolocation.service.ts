import { Injectable } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';

@Injectable({
  providedIn: 'root'
})
export class GeolocationService {
  async getCurrentPosition(): Promise<{ lat: number, lon: number }> {
    const position = await Geolocation.getCurrentPosition();
    return {
      lat: position.coords.latitude,
      lon: position.coords.longitude,
    };
  }
}
