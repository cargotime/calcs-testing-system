import { Injectable } from "@nestjs/common";
import { io, Socket } from "socket.io-client";

@Injectable()
export class WebSocketService {
  private socket: Socket;

  constructor() {
    this.socket = io(process.env.WS_SERVER_URL);
  }

  public getCargoData(cargoData: any): void {
    this.socket.emit('transferCargoData', cargoData);
    this.socket.on('transferSuggestionsData', (suggestionsData: any) => {
      this.handleSuggestionsData(suggestionsData);
    });
  }

  private handleSuggestionsData(suggestionsData: any): void {
    console.log(suggestionsData);
  }
}
