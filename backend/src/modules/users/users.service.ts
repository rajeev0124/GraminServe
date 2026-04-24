import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { FirebaseService } from '@app/shared/firebase/firebase.service';
import { UserRole } from '@app/common/enums';
import { FieldValue } from 'firebase-admin/firestore';

export interface CreateUserDto {
  uid: string;
  displayName: string;
  phoneNumber: string;
  role: UserRole;
  email?: string;
  photoURL?: string;
}

export interface UpdateUserDto {
  displayName?: string;
  photoURL?: string;
  location?: {
    geopoint: FirebaseFirestore.GeoPoint;
    geohash: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
}

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  private readonly COL = 'users';

  constructor(private readonly firebase: FirebaseService) {}

  async createUser(dto: CreateUserDto): Promise<void> {
    const ref = this.firebase.firestore().collection(this.COL).doc(dto.uid);
    if ((await ref.get()).exists) {
      throw new ConflictException(`User ${dto.uid} already exists.`);
    }
    await ref.set({
      ...dto,
      isVerified: false,
      isAvailable: false,
      averageRating: 0,
      totalReviews: 0,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    this.logger.log(`User created: ${dto.uid} [${dto.role}]`);
  }

  async getUser(uid: string): Promise<FirebaseFirestore.DocumentData> {
    const doc = await this.firebase.firestore().collection(this.COL).doc(uid).get();
    if (!doc.exists) throw new NotFoundException(`User ${uid} not found.`);
    return doc.data()!;
  }

  async updateUser(uid: string, dto: UpdateUserDto): Promise<void> {
    await this.firebase.firestore().collection(this.COL).doc(uid).update({
      ...dto,
      updatedAt: FieldValue.serverTimestamp(),
    });
  }

  async listUsers(role?: UserRole, limit = 20): Promise<FirebaseFirestore.DocumentData[]> {
    let query: FirebaseFirestore.Query = this.firebase.firestore().collection(this.COL);
    if (role) query = query.where('role', '==', role);
    query = query.limit(limit);
    const snap = await query.get();
    return snap.docs.map((d) => d.data());
  }

  async deleteUser(uid: string): Promise<void> {
    await this.firebase.firestore().collection(this.COL).doc(uid).delete();
    await this.firebase.auth().deleteUser(uid);
    this.logger.warn(`User deleted: ${uid}`);
  }

  async suspendUser(uid: string): Promise<void> {
    await this.firebase.auth().updateUser(uid, { disabled: true });
    this.logger.warn(`User suspended: ${uid}`);
  }

  async reinstateUser(uid: string): Promise<void> {
    await this.firebase.auth().updateUser(uid, { disabled: false });
    this.logger.log(`User reinstated: ${uid}`);
  }
}
