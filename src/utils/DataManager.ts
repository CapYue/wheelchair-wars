/**
 * 数据管理器
 * 轮椅大作战 - 管理游戏数据存储
 */

import { STORAGE_KEY, CharacterType, WeaponType } from './Constants';

export class DataManager {
    private static instance: DataManager = null;
    
    // 用户数据
    private userData: UserData = null;
    
    // 设置
    private settings: GameSettings = null;
    
    // 缓存
    private cache: Cache = null;

    constructor() {
        DataManager.instance = this;
    }

    public static getInstance(): DataManager = null {
        return DataManager.instance;
    }

    /**
     * 加载数据
     */
    load() {
        this.loadUserData();
        this.loadSettings();
        this.loadCache();
    }

    /**
     * 保存数据
     */
    save() {
        this.saveUserData();
        this.saveSettings();
        this.saveCache();
    }

    // ==================== 用户数据 ====================

    private loadUserData() {
        const str = cc.sys.localStorage.getItem(STORAGE_KEY.USER_DATA);
        if (str) {
            try {
                this.userData = JSON.parse(str);
            } catch (e) {
                this.userData = this.createDefaultUserData();
            }
        } else {
            this.userData = this.createDefaultUserData();
        }
    }

    private saveUserData() {
        const str = JSON.stringify(this.userData);
        cc.sys.localStorage.setItem(STORAGE_KEY.USER_DATA, str);
    }

    private createDefaultUserData(): UserData {
        return {
            openid: this.generateUUID(),
            nickname: '轮椅战士',
            avatar: '',
            level: 1,
            exp: 0,
            gold: 0,
            diamond: 0,
            characters: [
                { id: CharacterType.LI_DAYE, level: 1, unlocked: true }
            ],
            weapons: [
                { id: WeaponType.EGG, level: 1, unlocked: true, count: 999 }
            ],
            skins: [],
            rank: {
                score: 0,
                level: 1,
                star: 0
            },
            stats: {
                total_games: 0,
                wins: 0,
                kills: 0,
                deaths: 0,
                maxKillStreak: 0
            },
            achievements: [],
            createTime: Date.now(),
            lastLoginTime: Date.now(),
            totalPlayTime: 0
        };
    }

    /**
     * 获取用户数据
     */
    public getUserData(): UserData {
        return this.userData;
    }

    /**
     * 更新用户数据
     */
    public updateUserData(data: Partial<UserData>) {
        Object.assign(this.userData, data);
        this.saveUserData();
    }

    /**
     * 添加金币
     */
    public addGold(amount: number) {
        this.userData.gold += amount;
        this.saveUserData();
    }

    /**
     * 消耗金币
     */
    public consumeGold(amount: number): boolean {
        if (this.userData.gold >= amount) {
            this.userData.gold -= amount;
            this.saveUserData();
            return true;
        }
        return false;
    }

    /**
     * 添加经验
     */
    public addExp(amount: number) {
        this.userData.exp += amount;
        
        // 检查升级
        const expNeeded = this.getExpForNextLevel();
        if (this.userData.exp >= expNeeded) {
            this.userData.exp -= expNeeded;
            this.userData.level++;
            cc.log(`[DataManager] 升级! 当前等级: ${this.userData.level}`);
        }
        
        this.saveUserData();
    }

    /**
     * 获取升级所需经验
     */
    private getExpForNextLevel(): number {
        return this.userData.level * 100;
    }

    /**
     * 更新战绩
     */
    public recordGame(result: 'win' | 'lose', stats: GameRecordStats) {
        this.userData.stats.total_games++;
        
        if (result === 'win') {
            this.userData.stats.wins++;
        }
        
        this.userData.stats.kills += stats.kills;
        this.userData.stats.deaths += stats.deaths;
        
        if (stats.kills > this.userData.stats.maxKillStreak) {
            this.userData.stats.maxKillStreak = stats.kills;
        }
        
        // 更新排位分
        this.updateRankScore(result);
        
        // 更新总游戏时长
        this.userData.totalPlayTime += stats.duration;
        
        this.saveUserData();
    }

    /**
     * 更新排位分
     */
    private updateRankScore(result: 'win' | 'lose') {
        const baseScore = 20;
        const winBonus = result === 'win' ? 15 : -10;
        
        this.userData.rank.score += baseScore + winBonus;
        
        // 检查段位变化
        this.checkRankUp();
    }

    /**
     * 检查是否晋级
     */
    private checkRankUp() {
        const score = this.userData.rank.score;
        
        // 段位 thresholds
        if (score >= 3000 && this.userData.rank.level < 6) {
            this.userData.rank.level = 6; // 王者
            this.userData.rank.star = 0;
        } else if (score >= 2000 && this.userData.rank.level < 5) {
            this.userData.rank.level = 5; // 钻石
            this.userData.rank.star = 0;
        } else if (score >= 1500 && this.userData.rank.level < 4) {
            this.userData.rank.level = 4; // 黄金
            this.userData.rank.star = 0;
        } else if (score >= 1000 && this.userData.rank.level < 3) {
            this.userData.rank.level = 3; // 白银
            this.userData.rank.star = 0;
        } else if (score >= 500 && this.userData.rank.level < 2) {
            this.userData.rank.level = 2; // 青铜
            this.userData.rank.star = 0;
        }
        
        // 更新星星
        this.userData.rank.star = Math.floor((score % 100) / 20);
    }

    // ==================== 设置 ====================

    private loadSettings() {
        const str = cc.sys.localStorage.getItem(STORAGE_KEY.SETTINGS);
        if (str) {
            try {
                this.settings = JSON.parse(str);
            } catch (e) {
                this.settings = this.createDefaultSettings();
            }
        } else {
            this.settings = this.createDefaultSettings();
        }
    }

    private saveSettings() {
        const str = JSON.stringify(this.settings);
        cc.sys.localStorage.setItem(STORAGE_KEY.SETTINGS, str);
    }

    private createDefaultSettings(): GameSettings {
        return {
            sfxVolume: 1.0,
            bgmVolume: 0.5,
            muted: false,
            vibration: true,
            showFPS: false,
            controlType: 'joystick', // joystick / buttons
            joystickPosition: 'left', // left / right
            quality: 'high' // low / medium / high
        };
    }

    /**
     * 获取设置
     */
    public getSettings(): GameSettings {
        return this.settings;
    }

    /**
     * 更新设置
     */
    public updateSettings(settings: Partial<GameSettings>) {
        Object.assign(this.settings, settings);
        this.saveSettings();
    }

    // ==================== 缓存 ====================

    private loadCache() {
        const str = cc.sys.localStorage.getItem(STORAGE_KEY.CACHE);
        if (str) {
            try {
                this.cache = JSON.parse(str);
            } catch (e) {
                this.cache = { version: 1, data: {} };
            }
        } else {
            this.cache = { version: 1, data: {} };
        }
    }

    private saveCache() {
        const str = JSON.stringify(this.cache);
        cc.sys.localStorage.setItem(STORAGE_KEY.CACHE, str);
    }

    /**
     * 设置缓存
     */
    public setCache(key: string, value: any) {
        this.cache.data[key] = value;
        this.saveCache();
    }

    /**
     * 获取缓存
     */
    public getCache(key: string): any {
        return this.cache.data[key];
    }

    // ==================== 战绩记录 ====================

    /**
     * 保存游戏记录
     */
    public saveGameRecord(record: GameRecord) {
        const key = STORAGE_KEY.GAME_RECORD;
        let records = [];
        
        const str = cc.sys.localStorage.getItem(key);
        if (str) {
            try {
                records = JSON.parse(str);
            } catch (e) {
                records = [];
            }
        }
        
        // 添加新记录
        records.unshift(record);
        
        // 保留最近100条
        if (records.length > 100) {
            records = records.slice(0, 100);
        }
        
        cc.sys.localStorage.setItem(key, JSON.stringify(records));
    }

    /**
     * 获取游戏记录
     */
    public getGameRecords(limit: number = 10): GameRecord[] {
        const key = STORAGE_KEY.GAME_RECORD;
        const str = cc.sys.localStorage.getItem(key);
        
        if (str) {
            try {
                const records = JSON.parse(str);
                return records.slice(0, limit);
            } catch (e) {
                return [];
            }
        }
        
        return [];
    }

    /**
     * 获取胜率
     */
    public getWinRate(): number {
        const stats = this.userData.stats;
        if (stats.total_games === 0) return 0;
        return (stats.wins / stats.total_games * 100).toFixed(1);
    }

    /**
     * 获取KDA
     */
    public getKDA(): string {
        const stats = this.userData.stats;
        if (stats.deaths === 0) return `${stats.kills}/0/${stats.kills}`;
        return `${stats.kills}/${stats.deaths}/${Math.round(stats.kills / stats.deaths * 10) / 10}`;
    }

    // ==================== 工具方法 ====================

    private generateUUID(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}

// 类型定义
interface UserData {
    openid: string;
    nickname: string;
    avatar: string;
    level: number;
    exp: number;
    gold: number;
    diamond: number;
    characters: CharacterUnlock[];
    weapons: WeaponUnlock[];
    skins: SkinUnlock[];
    rank: RankInfo;
    stats: GameStats;
    achievements: string[];
    createTime: number;
    lastLoginTime: number;
    totalPlayTime: number;
}

interface CharacterUnlock {
    id: CharacterType;
    level: number;
    unlocked: boolean;
}

interface WeaponUnlock {
    id: WeaponType;
    level: number;
    unlocked: boolean;
    count: number;
}

interface SkinUnlock {
    id: string;
    characterId: CharacterType;
    unlocked: boolean;
}

interface RankInfo {
    score: number;
    level: number;
    star: number;
}

interface GameStats {
    total_games: number;
    wins: number;
    kills: number;
    deaths: number;
    maxKillStreak: number;
}

interface GameSettings {
    sfxVolume: number;
    bgmVolume: number;
    muted: boolean;
    vibration: boolean;
    showFPS: boolean;
    controlType: 'joystick' | 'buttons';
    joystickPosition: 'left' | 'right';
    quality: 'low' | 'medium' | 'high';
}

interface Cache {
    version: number;
    data: Record<string, any>;
}

interface GameRecord {
    mode: string;
    result: 'win' | 'lose';
    damage: number;
    kill: number;
    death: number;
    duration: number;
    time: number;
}

interface GameRecordStats {
    kills: number;
    deaths: number;
    duration: number;
}