import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Subject } from 'rxjs';
import { environment } from '../../environments/environment';
import { Auth } from './auth';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: Socket | null = null;

  bookingStatusUpdated$ = new Subject<{ bookingId: string; status: string }>();
  engineerLocationUpdated$ = new Subject<{ bookingId: string; longitude: number; latitude: number }>();
  incomingRequest$ = new Subject<any>();
  engineerStatusUpdated$ = new Subject<{ engineerId: string; status: string }>();

  constructor(private auth: Auth) {}

  connect() {
    if (this.socket?.connected) return;

    this.socket = io(environment.socketUrl, {
      auth: { token: this.auth.getToken() },
      transports: ['websocket']
    });

    this.socket.on('booking:statusUpdated', (data) => this.bookingStatusUpdated$.next(data));
    this.socket.on('engineer:locationUpdated', (data) => this.engineerLocationUpdated$.next(data));
    this.socket.on('booking:incomingRequest', (data) => this.incomingRequest$.next(data));
    this.socket.on('engineer:statusUpdated', (data) => this.engineerStatusUpdated$.next(data));

    this.socket.on('connect_error', (err) => console.error('Socket auth failed:', err.message));
  }

  emitStatusChange(status: 'ONLINE' | 'OFFLINE') {
    this.socket?.emit('engineer:statusChange', { status });
  }

  emitLocationUpdate(longitude: number, latitude: number, bookingId?: string) {
    this.socket?.emit('engineer:locationUpdate', { longitude, latitude, bookingId });
  }

  emitRideStart(bookingId: string) {
    this.socket?.emit('booking:rideStart', { bookingId });
  }

  emitRideEnd(bookingId: string) {
    this.socket?.emit('booking:rideEnd', { bookingId });
  }

  emitEngineerResponse(bookingId: string, response: 'ACCEPT' | 'REJECT') {
    this.socket?.emit('booking:engineerResponse', { bookingId, response });
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }
}