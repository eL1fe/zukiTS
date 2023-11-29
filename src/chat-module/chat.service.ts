import { Injectable } from '@nestjs/common';
import { ZukiChatService } from './services/zuki-chat.service';

@Injectable()
export class ChatService {
  constructor(private readonly zukiChatService: ZukiChatService) {}

  /**
   * Generate a message and send it through the ZukiChat service.
   *
   * @param {string} userName - The name of the user sending the message.
   * @param {string} message - The message to be sent.
   * @return {Promise<string>} - A promise that resolves to the response from the ZukiChat service.
   */

  generate(userName: string, message: string): Promise<string> {
    return this.zukiChatService.sendMessage(userName, message);
  }
}
