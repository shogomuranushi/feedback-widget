/**
 * API Key + Domain認証ユーティリティ
 */

export interface ApiKeyValidationResult {
  isValid: boolean;
  error?: string;
  keyInfo?: {
    key: string;
    domain?: string;
    description?: string;
  };
}

export interface DomainApiKeyMapping {
  [domain: string]: string[];
}


/**
 * 環境変数からドメイン-APIキーマッピングを取得
 * 形式: DOMAIN_API_MAPPINGS=example.com:widget_key1,widget_key2;localhost:widget_dev;app.company.com:widget_prod
 */
function getDomainApiKeyMappings(): DomainApiKeyMapping {
  const mappingsEnv = process.env.DOMAIN_API_MAPPINGS;
  if (!mappingsEnv) {
    console.warn('DOMAIN_API_MAPPINGS environment variable not set - domain validation disabled');
    return {};
  }
  
  const mappings: DomainApiKeyMapping = {};
  
  try {
    // セミコロンでドメインエントリを分割
    const domainEntries = mappingsEnv.split(';');
    
    for (const entry of domainEntries) {
      const [domain, keysStr] = entry.split(':');
      if (domain && keysStr) {
        const keys = keysStr.split(',').map(key => key.trim()).filter(Boolean);
        mappings[domain.trim()] = keys;
      }
    }
    
    console.log('Domain-API key mappings loaded:', Object.keys(mappings));
    return mappings;
  } catch (error) {
    console.error('Failed to parse DOMAIN_API_MAPPINGS:', error);
    return {};
  }
}

/**
 * APIキー + ドメインの有効性を検証
 */
export function validateApiKey(apiKey: string | null, domain?: string | null): ApiKeyValidationResult {
  // APIキーが提供されていない場合
  if (!apiKey) {
    return {
      isValid: false,
      error: 'API key is required'
    };
  }

  // 基本的な形式チェック
  if (!apiKey.startsWith('widget_')) {
    return {
      isValid: false,
      error: 'API key must start with "widget_"'
    };
  }

  // 長さチェック（最低限の安全性）
  if (apiKey.length < 10) {
    return {
      isValid: false,
      error: 'API key is too short'
    };
  }

  // ドメインが必須
  if (!domain) {
    return {
      isValid: false,
      error: 'Domain is required for API key validation'
    };
  }

  // ドメイン-APIキーマッピングを取得
  const domainMappings = getDomainApiKeyMappings();
  
  // ドメインマッピングが設定されていない場合はエラー
  if (Object.keys(domainMappings).length === 0) {
    return {
      isValid: false,
      error: 'DOMAIN_API_MAPPINGS environment variable not configured'
    };
  }

  console.log(`Validating domain-API key pair: ${domain} + ${apiKey}`);
  
  // ドメインが登録されているかチェック
  if (!domainMappings[domain]) {
    return {
      isValid: false,
      error: `Domain '${domain}' is not authorized`
    };
  }
  
  // そのドメインに対してAPIキーが許可されているかチェック
  if (!domainMappings[domain].includes(apiKey)) {
    return {
      isValid: false,
      error: `API key '${apiKey}' is not authorized for domain '${domain}'`
    };
  }
  
  return {
    isValid: true,
    keyInfo: {
      key: apiKey,
      domain: domain,
      description: `Valid API key for domain '${domain}'`
    }
  };
}

/**
 * ドメイン-APIキー設定状況を確認
 */
export function getApiKeyConfigStatus(): {
  configured: boolean;
  domainCount: number;
  domains?: string[];
} {
  const domainMappings = getDomainApiKeyMappings();
  const domains = Object.keys(domainMappings);
  
  return {
    configured: domains.length > 0,
    domainCount: domains.length,
    domains: domains.length > 0 ? domains : undefined
  };
}