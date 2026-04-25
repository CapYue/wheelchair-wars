/**
 * 音效管理器
 * 轮椅大作战 - 管理所有游戏音效
 */

import { SOUND_EFFECTS } from './Constants';

export class SoundManager {
    private static instance: SoundManager = null;
    
    // 背景音乐
    private bgm: cc.AudioSource = null;
    private currentBgm: string = '';
    
    // 音效音量
    private sfxVolume: number = 1.0;
    
    // BGM音量
    private bgmVolume: number = 0.5;
    
    // 静音状态
    private isMuted: boolean = false;

    constructor() {
        SoundManager.instance = this;
    }

    public static getInstance(): SoundManager {
        return SoundManager.instance;
    }

    /**
     * 加载音效资源
     */
    load() {
        // 加载背景音乐
        this.loadBGM();
        
        // 加载音效
        this.loadSFX();
    }

    private loadBGM() {
        // 创建BGM播放器
        const bgmNode = new cc.Node('BGM');
        bgmNode.parent = cc.director.getScene();
        this.bgm = bgmNode.addComponent(cc.AudioSource);
        this.bgm.loop = true;
        this.bgm.volume = this.bgmVolume;
    }

    private loadSFX() {
        // 音效预加载
        const sfxList = [
            'throw',
            'hit_light',
            'hit_heavy',
            'wheel_roll',
            'skill_charge',
            'skill_use',
            'ui_click',
            'ui_popup',
            'game_start',
            'win',
            'lose'
        ];
        
        sfxList.forEach(name => {
            // 预加载音效
            // cc.loader.loadRes(`audio/sfx/${name}`, cc.AudioClip, (err, clip) => {
            //     if (!err) {
            //         cc.log(`[SoundManager] Loaded SFX: ${name}`);
            //     }
            // });
        });
    }

    /**
     * 播放BGM
     */
    playBGM(name: string) {
        if (this.isMuted || this.currentBgm === name) return;
        
        // 停止当前BGM
        if (this.bgm && this.bgm.clip) {
            this.bgm.stop();
        }
        
        // 加载并播放新BGM
        // cc.loader.loadRes(`audio/bgm/${name}`, cc.AudioClip, (err, clip) => {
        //     if (!err && this.bgm) {
        //         this.bgm.clip = clip;
        //         this.bgm.play();
        //         this.currentBgm = name;
        //     }
        // });
        
        this.currentBgm = name;
        cc.log(`[SoundManager] Playing BGM: ${name}`);
    }

    /**
     * 停止BGM
     */
    stopBGM() {
        if (this.bgm) {
            this.bgm.stop();
            this.currentBgm = '';
        }
    }

    /**
     * 暂停BGM
     */
    pauseBGM() {
        if (this.bgm) {
            this.bgm.pause();
        }
    }

    /**
     * 恢复BGM
     */
    resumeBGM() {
        if (this.bgm) {
            this.bgm.resume();
        }
    }

    /**
     * 播放音效
     */
    playSFX(name: string, loop: boolean = false) {
        if (this.isMuted) return;
        
        // 查找音效配置
        const sfxPath = `audio/sfx/${name}`;
        
        // 加载并播放
        // cc.loader.loadRes(sfxPath, cc.AudioClip, (err, clip) => {
        //     if (!err) {
        //         cc.audioEngine.playEffect(clip, loop, this.sfxVolume);
        //     }
        // });
        
        cc.log(`[SoundManager] Playing SFX: ${name}`);
    }

    /**
     * 播放命中音效
     */
    playHitSound(weaponType: number) {
        // 根据武器类型播放不同命中音效
        const hitType = weaponType <= 2 ? 'hit_light' : 'hit_heavy';
        this.playSFX(hitType);
    }

    /**
     * 设置音效音量
     */
    setSFXVolume(volume: number) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
    }

    /**
     * 设置BGM音量
     */
    setBGMVolume(volume: number) {
        this.bgmVolume = Math.max(0, Math.min(1, volume));
        if (this.bgm) {
            this.bgm.volume = this.bgmVolume;
        }
    }

    /**
     * 静音/取消静音
     */
    toggleMute() {
        this.isMuted = !this.isMuted;
        
        if (this.isMuted) {
            cc.audioEngine.pauseAll();
        } else {
            cc.audioEngine.resumeAll();
        }
    }

    /**
     * 停止所有声音
     */
    stopAll() {
        this.stopBGM();
        cc.audioEngine.stopAllEffects();
    }

    /**
     * 销毁
     */
    destroy() {
        this.stopAll();
        if (this.bgm) {
            this.bgm.destroy();
        }
        SoundManager.instance = null;
    }
}