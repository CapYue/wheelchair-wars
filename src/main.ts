/**
 * 游戏入口
 * 轮椅大作战
 */

import { Game } from './Game';
import { UIManager } from './ui/UIManager';
import { DataManager } from './utils/DataManager';
import { SoundManager } from './utils/SoundManager';

// 启动游戏
cc.game.run({
    settings: {
        debugMode: cc.debug.DebugMode.INFO,
        showFPS: false,
        frameRate: 60,
        assetOptions: {
            preloadBundles: []
        }
    },
    prepare: () => {
        // 初始化游戏
        cc.director.loadScene('Boot');
    },
    complete: () => {
        cc.log('🥚 轮椅大作战 - 游戏启动完成 🥚');
        
        // 创建游戏主控制器
        const gameNode = new cc.Node('Game');
        cc.director.getScene().addChild(gameNode);
        
        const game = gameNode.addComponent(Game);
        const ui = gameNode.addComponent(UIManager);
        
        // 初始化管理器
        const dataManager = gameNode.addComponent(DataManager);
        const soundManager = gameNode.addComponent(SoundManager);
        
        dataManager.load();
        soundManager.load();
    }
});

// 暴露全局访问
(window as any).WheelchairWars = {
    Game,
    DataManager,
    SoundManager
};

cc.log('轮椅大作战 - 入口文件加载完成');