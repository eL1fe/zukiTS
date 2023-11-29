import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ZukiChatService {
  private readonly API_KEY: string;
  private readonly API_ENDPOINT =
    'https://zukijourney.xyzbot.net/v1/chat/completions';
  private readonly API_ENDPOINT_UNFILTERED =
    'https://zukijourney.xyzbot.net/unf/chat/completions';
  // A backup endpoint, if appplicable. Usually meant to utilize another API.
  // By default it's set to the WebRaft API due to its rate limit being ideal for testing purposes.
  private API_ENDPOINT_BACKUP =
    'https://thirdparty.webraft.in/v1/chat/completions';
  private systemPrompt: string;
  private model: string;
  private temperature: number;
  private modelsList = [
    'gpt-3.5',
    'gpt-3.5-turbo',
    'gpt-3.5-4k',
    'gpt-3.5-16k',
    'gpt-4',
    'gpt-4-4k',
    'gpt-4-16k',
    'claude-2',
  ];

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.API_KEY = this.configService.get<string>('API_KEY');
    this.systemPrompt = 'You are a helpful assistant.';
    this.model = 'gpt-3.5';
    this.temperature = 0.7;
  }

  setModel(newModel: string) {
    if (this.modelsList.includes(newModel)) {
      this.model = newModel;
    } else {
      throw new Error(`${newModel} is not a valid text model!`);
    }
  }

  /*
   * Sets the system systemPrompt for the model to
   * a new one. Prompt must be a string, otherwise
   * an error will be thrown.
   */

  setSystemPrompt(newPrompt: string) {
    if (typeof newPrompt !== 'string') {
      throw new Error('Prompt must be a string!');
    }
    this.systemPrompt = newPrompt;
  }

  /*
   * Sets the system systemPrompt for the model to
   * a new one. Prompt must be a string, otherwise
   * an error will be thrown.
   */

  setTemp(newTemp: number) {
    if (newTemp < 0 || newTemp > 1) {
      throw new Error('Temperature must be a value between 0 and 1!');
    }
    this.temperature = newTemp;
  }

  /*
   * Changes the backup endpoint to the new endpoint.
   */

  changeBackupEndpoint(newEndpoint: string) {
    this.API_ENDPOINT_BACKUP = newEndpoint;
  }

  private async chatCall(
    userName: string,
    userMessage: string,
    endpoint: string,
  ): Promise<string> {
    const data = this.createChatData(userName, userMessage);

    /*
     * Makes an API call via the desired enpoint.
     */

    try {
      const response = await firstValueFrom(
        this.httpService.post(endpoint, data, {
          headers: {
            Authorization: `Bearer ${this.API_KEY}`,
            'Content-Type': 'application/json',
          },
        }),
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  /*
   * Gets the actual data object being sent to the API.
   */

  private createChatData(userName: string, userMessage: string) {
    return {
      model: this.model, //You can change the model here.
      messages: [
        {
          role: 'system', //This role instructs the AI on what to do. It's basically the main prompt.
          content: this.systemPrompt,
        },
        {
          role: 'user', //This role indicates the message the user sent.
          //We're also putting the prompt in the message because the API will revert to a generic response if userMessage is less than a certain length.
          content: `${this.systemPrompt}\n Here is a message a user called ${userName} sent you: ${userMessage}`,
        },
      ],
      temperature: this.temperature, //Change this to modify the responses' randomness (higher -> more random, lower -> more predictable).
    };
  }

  /*
   * Calls the regular API via the /v1/ endpoint.
   */

  async sendMessage(userName: string, userMessage: string): Promise<string> {
    return this.chatCall(userName, userMessage, this.API_ENDPOINT);
  }

  /*
   * Calls the unfiltered API via the /unf/ endpoint.
   */

  async sendUnfilteredMessage(
    userName: string,
    userMessage: string,
  ): Promise<string> {
    return this.chatCall(userName, userMessage, this.API_ENDPOINT_UNFILTERED);
  }

  /*
   * Calls the backup API via the backup endpoint.
   */

  async sendBackupMessage(
    userName: string,
    userMessage: string,
  ): Promise<string> {
    return this.chatCall(userName, userMessage, this.API_ENDPOINT_BACKUP);
  }
}
