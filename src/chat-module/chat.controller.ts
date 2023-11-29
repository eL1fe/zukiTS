import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('chat')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('/generate')
  @ApiOperation({ summary: 'Generate response message from GPT' })
  @ApiResponse({ status: 200, description: 'Message generated successfully.' })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userName: { type: 'string', example: 'John Doe' },
        message: { type: 'string', example: 'Diz nuts' },
      },
    },
  })
  async sendMessage(
    @Body() body: { userName: string; message: string },
  ): Promise<{ response: string }> {
    try {
      const { userName, message } = body;

      const response = await this.chatService.generate(userName, message);
      return { response };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
