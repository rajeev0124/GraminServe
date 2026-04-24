import { Global, Module } from '@nestjs/common';
import { FirebaseService } from './firebase/firebase.service';

/**
 * SharedModule is marked @Global so FirebaseService is available
 * across all feature modules without re-importing SharedModule.
 */
@Global()
@Module({
  providers: [FirebaseService],
  exports: [FirebaseService],
})
export class SharedModule {}
