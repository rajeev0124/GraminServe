import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { FirebaseService } from '@app/shared/firebase/firebase.service';
import { UserRole } from '@app/common/enums';
import { FieldValue } from 'firebase-admin/firestore';

export interface CreateProfileDto {
  uid: string;
  displayName: string;
  phone: string;
  role: UserRole;
  location?: { lat: number; lng: number; geohash: string };
}

export interface ProfessionalProfile {
  uid: string;
  displayName: string;
  phone: string;
  role: UserRole;
  location?: { lat: number; lng: number; geohash: string };
  isVerified: boolean;
  isAvailable: boolean;
  averageRating: number;
  totalReviews: number;
  createdAt: FirebaseFirestore.FieldValue;
  updatedAt: FirebaseFirestore.FieldValue;
}

@Injectable()
export class ProfilesService {
  private readonly logger = new Logger(ProfilesService.name);
  private readonly COLLECTION = 'users';

  constructor(private readonly firebase: FirebaseService) {}

  /**
   * Creates a new user profile document in Firestore.
   * Throws ConflictException if the UID already exists.
   */
  async createProfile(dto: CreateProfileDto): Promise<void> {
    const ref = this.firebase.firestore().collection(this.COLLECTION).doc(dto.uid);
    const existing = await ref.get();

    if (existing.exists) {
      throw new ConflictException(`Profile for UID ${dto.uid} already exists.`);
    }

    const profile: ProfessionalProfile = {
      ...dto,
      isVerified: false,
      isAvailable: dto.role === UserRole.PROFESSIONAL,
      averageRating: 0,
      totalReviews: 0,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    await ref.set(profile);
    this.logger.log(`Profile created for UID: ${dto.uid}`);
  }

  /**
   * Retrieves a profile by UID.
   */
  async getProfile(uid: string): Promise<ProfessionalProfile> {
    const doc = await this.firebase
      .firestore()
      .collection(this.COLLECTION)
      .doc(uid)
      .get();

    if (!doc.exists) {
      throw new NotFoundException(`Profile not found for UID: ${uid}`);
    }

    return doc.data() as ProfessionalProfile;
  }

  /**
   * Updates selected fields on an existing profile.
   */
  async updateProfile(
    uid: string,
    updates: Partial<Omit<ProfessionalProfile, 'uid' | 'createdAt' | 'updatedAt'>>,
  ): Promise<void> {
    const ref = this.firebase.firestore().collection(this.COLLECTION).doc(uid);
    await ref.update({ ...updates, updatedAt: FieldValue.serverTimestamp() });
  }
}
