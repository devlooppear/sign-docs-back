import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): Object {
    const initialMessage = 'Welcome to SignDocs API!';
    return { message: initialMessage };
  }
}
