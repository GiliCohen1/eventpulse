import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const uri = config.get<string>('MONGO_URI', 'mongodb://localhost:27017');
        const dbName = config.get<string>('MONGO_DB_NOTIFICATIONS', 'eventpulse_notifications');
        const url = new URL(uri);
        url.pathname = '/' + dbName;
        return { uri: url.toString() };
      },
    }),
  ],
})
export class DatabaseModule {}
