import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StripeService } from './stripe.service';
import { Product } from '../products/product.entity';

@Module({})
export class StripeModule {

    static forRootAsync(): DynamicModule {
        return {
            module: StripeModule,
            imports: [ConfigModule.forRoot(), TypeOrmModule.forFeature([Product])],
            providers: [
                StripeService,
                {
                    provide: 'STRIPE_API_KEY',
                    useFactory: async (configService: ConfigService) =>
                        configService.get('STRIPE_API_KEY'),
                    inject: [ConfigService],
                },
            ],
            exports: [StripeService],
        };
    }
}