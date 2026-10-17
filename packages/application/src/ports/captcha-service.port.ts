export interface CaptchaVerificationService {
  verify(token: string, remoteIp?: string): Promise<boolean>;
}
