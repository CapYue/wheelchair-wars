/**
 * 对象池管理器
 * 轮椅大作战 - 高效管理可复用对象
 */

export class PoolManager {
    // 对象池存储
    private pools: Map<string, cc.Node[]> = new Map();
    
    // 预制体引用
    private prefabs: Map<string, cc.Prefab> = new Map();

    constructor() {}

    /**
     * 注册预制体
     */
    public registerPrefab(key: string, prefab: cc.Prefab) {
        this.prefabs.set(key, prefab);
        this.pools.set(key, []);
    }

    /**
     * 获取对象
     */
    public get(key: string): cc.Node | null {
        const pool = this.pools.get(key);
        if (!pool) {
            cc.warn(`[PoolManager] Pool not found: ${key}`);
            return null;
        }
        
        if (pool.length > 0) {
            return pool.pop();
        }
        
        // 池为空，创建新对象
        const prefab = this.prefabs.get(key);
        if (prefab) {
            return cc.instantiate(prefab);
        }
        
        return null;
    }

    /**
     * 归还对象
     */
    public put(key: string, node: cc.Node) {
        if (!node) return;
        
        let pool = this.pools.get(key);
        if (!pool) {
            pool = [];
            this.pools.set(key, pool);
        }
        
        node.active = false;
        pool.push(node);
    }

    /**
     * 清空指定池
     */
    public clear(key: string) {
        const pool = this.pools.get(key);
        if (pool) {
            pool.forEach(node => node.destroy());
            pool = [];
        }
    }

    /**
     * 清空所有池
     */
    public clearAll() {
        this.pools.forEach((pool, key) => {
            pool.forEach(node => node.destroy());
        });
        this.pools.clear();
    }

    /**
     * 预热池
     */
    public preheat(key: string, count: number) {
        const pool = this.pools.get(key) || [];
        const prefab = this.prefabs.get(key);
        
        if (!prefab) {
            cc.warn(`[PoolManager] Prefab not found: ${key}`);
            return;
        }
        
        for (let i = 0; i < count; i++) {
            const node = cc.instantiate(prefab);
            node.active = false;
            pool.push(node);
        }
        
        this.pools.set(key, pool);
    }

    /**
     * 获取池大小
     */
    public getPoolSize(key: string): number {
        const pool = this.pools.get(key);
        return pool ? pool.length : 0;
    }

    /**
     * 获取所有池统计
     */
    public getStats(): Record<string, number> {
        const stats: Record<string, number> = {};
        this.pools.forEach((pool, key) => {
            stats[key] = pool.length;
        });
        return stats;
    }
}

// 单例模式访问
let instance: PoolManager = null;
export function getPoolManager(): PoolManager {
    if (!instance) {
        instance = new PoolManager();
    }
    return instance;
}