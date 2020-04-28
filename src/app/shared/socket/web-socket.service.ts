import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { Subject, Observable, Observer } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  constructor() { }

  private ws: any;
    private message: Subject<any> = new Subject<any>(); // 消息列表

    // 连接后台socket
    connetSocket(url) {
        this.ws = io(url);
        this.ws.on('connect_error', (error) => { // 连接失败
            console.log('connect_error');
        });
        this.ws.on('reconnecting', (timeout) => { // 重连次数
            if (timeout === 3) {
                this.ws.close();
            }
        });
        this.ws.on('message', (data) => {
            this.analysisMessage(data);
        });
    }

    analysisMessage(message) {
        //const messagejson = JSON.parse(message);
        this.message.next(message);
    }

    getMessage(): Observable<any> {
        return this.message.asObservable();
    }
}
