import CryptoJS from 'crypto-js';
import * as JSEncrypt from 'jsencrypt';

export function encrypt(password: string): string {
  const publicKey = "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCT5zYg1mYEGoti/TrLyjv+Y/9UsqtCen6+KAW7PP81MG6Wj6N+dYtkQ8UGMq4SH2baxCSp+OtZtt3iAaUCoIR9NTRoH3deDkKxfKOUt3nJmOYgEo75C4l02R7aXxBgc6xXSnYbMRf0MlWD7+wlvVYdQ5bveqwgn3mp5QtprDwrgQIDAQAB";

  const enc = new JSEncrypt.default();
  enc.setPublicKey(publicKey);

  return enc.encrypt(password) || "";
}
