import { Module } from '@nestjs/common';

import { ConfigModule } from '@nestjs/config';
import { ChatModule } from './chat-module/chat.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [ConfigModule.forRoot(), ChatModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
