import { Module } from '@nestjs/common';
import { WebSocketService } from './websocket.service';

@Module({
  providers: [WebSocketService],
})
export class WebSocketModule {}
