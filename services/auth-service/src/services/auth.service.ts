import { UserRepository } from "../repositories/user.repository.js";
import { verifyPassword, hashPassword } from "../utils/password.js";

import { RegisterInput, LonginInput } from "../validators/auth.validator.js";

import {
  createAccessTolken,
  createRefreshToken,
  getRefreshTokenExpiry,
  hashToken,
  verifyRefreshToken,
} from "../utils/token.js";

import { SessionRepository } from "../repositories/session.repository.js";

export class AuthService {
  private readonly userRepository = new UserRepository();

  private readonly sessionRepository = new SessionRepository();

  async register(input: RegisterInput) {
    const existingUser = await this.userRepository.findByEmail(input.email);

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    const passwordHash = await hashPassword(input.password);

    const user = await this.userRepository.create({
      email: input.email,
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
    });

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      emailVerified: user.emailVerified,
    };
  }

  async login(input: LonginInput) {
    const user = await this.userRepository.findByEmail(input.email);

    if (!user) {
      throw new Error("Invalid email");
    }

    const passwordVaid = await verifyPassword(
      input.password,
      user.passwordHash,
    );

    if (!passwordVaid) {
      throw new Error("Invalid password");
    }

    if (user.status !== "active") {
      throw new Error("Account is not active");
    }

    const accessToken = createAccessTolken({
      sub: user.id,
      role: user.role,
    });

    const expiresAt = getRefreshTokenExpiry();

    const session = await this.sessionRepository.create({
      userId: user.id,
      expiresAt,
    });

    const refreshToken = createRefreshToken({
      sub: user.id,
      sid: session.id,
    });

    const refreshTokenHash = hashToken(refreshToken);

    await this.sessionRepository.updateRefreshToken(
      session.id,
      refreshTokenHash,
    );

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.isDirectModified,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        emailVerfied: user.emailVerified,
      },
    };
  }

  async refresh(refreshToken: string) {
    const payload = verifyRefreshToken(refreshToken);

    const session = await this.sessionRepository.findById(payload.sid);

    if (!session) {
      throw new Error("Invalid session");
    }

    if (session.userId.toString() !== payload.sub) {
      throw new Error("Invalid Session");
    }

    if (session.expiresAt < new Date()) {
      await this.sessionRepository.deleteById(session.id);
      throw new Error("Session expired");
    }

    const receivedTokendHash = hashToken(refreshToken);

    if (receivedTokendHash !== session.refreshTokenHash) {
      await this.sessionRepository.deleteById(session.id);

      throw new Error("Invalid refresh token");
    }

    const user = await this.userRepository.findById(payload.sub);

    if (!user) {
      await this.sessionRepository.deleteById(session.id);

      throw new Error("User not found");
    }

    if (user.status !== "active") {
      await this.sessionRepository.deleteById(session.id);

      throw new Error("Account is not active");
    }

    const accessToken = createAccessTolken({
        sub: user.id,
        role: user.role
    })

    const newRefreshToken = createRefreshToken({
        sub: user.id,
        sid: session.id,
    })

    const newRefreshTokenHash = hashToken(newRefreshToken);

    await this.sessionRepository.updateRefreshToken(
        session.id,
        newRefreshTokenHash
    )

    return { 
        accessToken,
        refreshToken: newRefreshToken,
    }
  }
}
