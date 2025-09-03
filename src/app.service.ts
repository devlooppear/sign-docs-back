import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): Object {
    const initialMessage = 'my API LOL';
    return { message: initialMessage };
  }
}
