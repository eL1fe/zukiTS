import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { ZukiChatService } from './services/zuki-chat.service';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [ZukiChatService, ChatService],
  controllers: [ChatController],
  exports: [ZukiChatService],
})
export class ChatModule {}
