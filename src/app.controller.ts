import { Controller, Get, Render } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  // constructor(private readonly appService: AppService) {}

  @Get()
  @Render('index.hbs')
  root() {
    return { message: 'Hello world!' };
  }

  @Get('index')
  index() {
    return { message: 'Hello world!' };
  }
}
