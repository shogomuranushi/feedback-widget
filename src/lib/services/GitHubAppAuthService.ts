import jwt from 'jsonwebtoken';
import fs from 'fs';
import { Octokit } from '@octokit/rest';

export interface GitHubAppConfig {
  appId: string;
  installationId: string;
  privateKeyPath?: string;
  privateKey?: string;
}

export class GitHubAppAuthService {
  private config: GitHubAppConfig;
  private privateKey: string;

  constructor(config: GitHubAppConfig) {
    this.config = config;
    
    // 秘密鍵を取得（環境変数から直接、またはファイルから）
    if (config.privateKey) {
      // 環境変数から直接秘密鍵を取得
      // Base64エンコードされている場合はデコード
      if (config.privateKey.match(/^[A-Za-z0-9+/]+=*$/)) {
        this.privateKey = Buffer.from(config.privateKey, 'base64').toString('utf8');
      } else {
        this.privateKey = config.privateKey;
      }
    } else if (config.privateKeyPath) {
      // ファイルパスから秘密鍵を読み込む
      this.privateKey = fs.readFileSync(config.privateKeyPath, 'utf8');
    } else {
      throw new Error('Either privateKey or privateKeyPath must be provided');
    }
  }

  /**
   * GitHub App用のJWTを生成
   * @returns JWT文字列
   */
  generateJWT(): string {
    const payload = {
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (10 * 60), // 10分後に期限切れ
      iss: this.config.appId
    };

    return jwt.sign(payload, this.privateKey, { algorithm: 'RS256' });
  }

  /**
   * インスタレーションアクセストークンを取得
   * @returns アクセストークン
   */
  async getInstallationAccessToken(): Promise<string> {
    const appJWT = this.generateJWT();
    
    // JWT認証でOctokitを初期化
    const appOctokit = new Octokit({
      auth: appJWT,
    });

    // インスタレーションアクセストークンを取得
    const { data } = await appOctokit.rest.apps.createInstallationAccessToken({
      installation_id: parseInt(this.config.installationId),
    });

    return data.token;
  }

  /**
   * 認証済みOctokitインスタンスを取得
   * @returns Octokitインスタンス
   */
  async getAuthenticatedOctokit(): Promise<Octokit> {
    const token = await this.getInstallationAccessToken();
    return new Octokit({ auth: token });
  }
}