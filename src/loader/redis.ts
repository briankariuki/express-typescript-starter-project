import { RedisClient } from 'redis';
import { promisify } from 'util';

export class AsyncRedis extends RedisClient {
  public readonly getAsync = promisify(this.get).bind(this);
  public readonly setAsync = promisify(this.set).bind(this);
  public readonly setexAsync = promisify(this.setex).bind(this);
  public readonly quitAsync = promisify(this.quit).bind(this);
  public readonly rpushAsync: (list: string, item: string) => Promise<number> = promisify(this.rpush).bind(this);
  public readonly blpopAsync: (list: string, timeout: number) => Promise<[string, string]> = promisify(this.blpop).bind(
    this,
  );
  public readonly flushdbAsync = promisify(this.flushdb).bind(this);
}
