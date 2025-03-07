class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 800;
        this.canvas.height = 400;
        
        // 游戏状态
        this.score = 0;
        this.health = 100;
        this.gameOver = false;
        this.gameStarted = false;
        
        // 游戏元素
        this.obstacles = [];
        this.enemies = [];
        this.projectiles = [];
        
        // 玩家属性
        this.player = {
            x: 50,
            y: this.canvas.height - 80,
            width: 50,
            height: 80,
            velocityY: 0,
            isJumping: false,
            jumpCount: 0,
            maxJumps: 2,
            color: '#FF5722'
        };
        
        // 游戏配置
        this.gravity = 0.5;
        this.jumpForce = -12;
        this.obstacleSpeed = 5;
        this.enemySpeed = 3;
        this.projectileSpeed = 7;
        
        // 加载精灵图
        this.sprites = {
            player: new Image(),
            enemy: new Image(),
            obstacle: new Image(),
            cloud: new Image(),
            ground: new Image()
        };
        
        this.sprites.player.src = 'assets/player.png';
        this.sprites.enemy.src = 'assets/enemy.png';
        this.sprites.obstacle.src = 'assets/obstacle.png';
        this.sprites.cloud.src = 'assets/cloud.png';
        this.sprites.ground.src = 'assets/ground.png';
        
        // 背景元素
        this.clouds = [
            {x: 100, y: 50},
            {x: 300, y: 30},
            {x: 500, y: 70}
        ];
        
        // 按钮
        this.startButton = {
            x: this.canvas.width / 2 - 60,
            y: this.canvas.height / 2 - 30,
            width: 120,
            height: 60
        };
        
        this.resetButton = {
            x: this.canvas.width / 2 - 50,
            y: this.canvas.height / 2 - 25,
            width: 100,
            height: 50
        };
        
        // 定时器ID
        this.obstacleTimer = null;
        this.enemyTimer = null;
        
        // 排行榜
        this.leaderboard = this.loadLeaderboard();
        
        // 绑定事件监听器
        this.bindEvents();
        
        // 开始游戏循环
        this.gameLoop();
    }
    
    startGame() {
        console.log('Game started');  // 添加调试日志
        this.gameStarted = true;
        this.score = 0;
        this.health = 100;
        
        // 重置玩家位置
        this.player.y = this.canvas.height - this.player.height;
        this.player.velocityY = 0;
        this.player.isJumping = false;
        this.player.jumpCount = 0;
        
        // 清空游戏元素
        this.obstacles = [];
        this.enemies = [];
        this.projectiles = [];
        
        // 启动定时器
        this.startTimers();
    }
    
    bindEvents() {
        // 跳跃控制
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && this.gameStarted && !this.gameOver && this.player.jumpCount < this.player.maxJumps) {
                e.preventDefault();  // 防止空格键滚动页面
                this.jump();
            }
        });
        
        // 攻击控制
        this.canvas.addEventListener('click', (e) => {
            if (this.gameStarted && !this.gameOver) {
                this.shoot();
            }
        });
        
        // 开始/重置游戏的点击事件
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;
            
            if (!this.gameStarted) {
                if (clickX >= this.startButton.x && 
                    clickX <= this.startButton.x + this.startButton.width &&
                    clickY >= this.startButton.y && 
                    clickY <= this.startButton.y + this.startButton.height) {
                    console.log('Start button clicked');  // 添加调试日志
                    this.startGame();
                }
            } else if (this.gameOver) {
                if (clickX >= this.resetButton.x && 
                    clickX <= this.resetButton.x + this.resetButton.width &&
                    clickY >= this.resetButton.y && 
                    clickY <= this.resetButton.y + this.resetButton.height) {
                    this.reset();
                }
            }
        });
    }
    
    startTimers() {
        // 清除可能存在的旧定时器
        if (this.obstacleTimer) clearInterval(this.obstacleTimer);
        if (this.enemyTimer) clearInterval(this.enemyTimer);
        
        // 启动新的定时器
        this.obstacleTimer = setInterval(() => this.generateObstacle(), 2000);
        this.enemyTimer = setInterval(() => this.generateEnemy(), 3000);
    }
    
    jump() {
        if (this.player.jumpCount < this.player.maxJumps) {
            this.player.velocityY = this.jumpForce;
            this.player.isJumping = true;
            this.player.jumpCount++;
        }
    }
    
    shoot() {
        this.projectiles.push({
            x: this.player.x + this.player.width,
            y: this.player.y + this.player.height / 2,
            width: 30,    // 增大子弹尺寸
            height: 10,
            color: '#FFD700'
        });
    }
    
    generateObstacle() {
        // 随机决定是地面障碍物还是空中障碍物
        const isAirObstacle = Math.random() > 0.5;
        const obstacleY = isAirObstacle 
            ? Math.random() * (this.canvas.height - 200) // 空中障碍物
            : this.canvas.height - 60;                   // 地面障碍物
            
        this.obstacles.push({
            x: this.canvas.width,
            y: obstacleY,
            width: 40,    // 增大障碍物尺寸
            height: 40,
            color: '#673AB7'
        });
    }
    
    generateEnemy() {
        this.enemies.push({
            x: this.canvas.width,
            y: Math.random() * (this.canvas.height - 150),  // 调整敌人生成范围
            width: 50,    // 增大敌人尺寸
            height: 50,
            color: '#F44336'
        });
    }
    
    loadLeaderboard() {
        const savedLeaderboard = localStorage.getItem('gameLeaderboard');
        return savedLeaderboard ? JSON.parse(savedLeaderboard) : [];
    }
    
    saveScore() {
        const playerName = prompt('游戏结束！请输入你的名字：');
        if (playerName) {
            this.leaderboard.push({
                name: playerName,
                score: this.score
            });
            
            // 排序并只保留前10名
            this.leaderboard.sort((a, b) => b.score - a.score);
            if (this.leaderboard.length > 10) {
                this.leaderboard.length = 10;
            }
            
            // 保存到本地存储
            localStorage.setItem('gameLeaderboard', JSON.stringify(this.leaderboard));
        }
    }
    
    reset() {
        // 重置游戏状态
        this.score = 0;
        this.health = 100;
        this.gameOver = false;
        
        // 重置玩家
        this.player.y = this.canvas.height - this.player.height;
        this.player.velocityY = 0;
        this.player.isJumping = false;
        this.player.jumpCount = 0;
        
        // 清空游戏元素
        this.obstacles = [];
        this.enemies = [];
        this.projectiles = [];
        
        // 重新启动定时器
        this.startTimers();
    }
    
    drawLeaderboard() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(this.canvas.width - 200, 0, 200, 220);
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = '16px Arial';
        this.ctx.fillText('排行榜', this.canvas.width - 180, 30);
        
        this.leaderboard.slice(0, 10).forEach((entry, index) => {
            this.ctx.fillText(
                `${index + 1}. ${entry.name}: ${entry.score}`,
                this.canvas.width - 180,
                60 + index * 20
            );
        });
    }
    
    update() {
        if (!this.gameStarted || this.gameOver) return;
        
        // 更新玩家位置
        this.player.velocityY += this.gravity;
        this.player.y += this.player.velocityY;
        
        // 防止玩家超出屏幕上方
        if (this.player.y < 0) {
            this.player.y = 0;
            this.player.velocityY = 0;
        }
        
        // 地面碰撞检测
        if (this.player.y > this.canvas.height - this.player.height) {
            this.player.y = this.canvas.height - this.player.height;
            this.player.velocityY = 0;
            this.player.isJumping = false;
            this.player.jumpCount = 0;  // 重置跳跃次数
        }
        
        // 更新障碍物位置
        this.obstacles = this.obstacles.filter(obstacle => {
            obstacle.x -= this.obstacleSpeed;
            
            // 碰撞检测
            if (this.checkCollision(this.player, obstacle)) {
                this.health -= 10;
                return false;
            }
            
            return obstacle.x > -obstacle.width;
        });
        
        // 更新敌人位置
        this.enemies = this.enemies.filter(enemy => {
            enemy.x -= this.enemySpeed;
            
            // 碰撞检测
            if (this.checkCollision(this.player, enemy)) {
                this.health -= 20;
                return false;
            }
            
            return enemy.x > -enemy.width;
        });
        
        // 更新子弹位置
        this.projectiles = this.projectiles.filter(projectile => {
            projectile.x += this.projectileSpeed;
            
            // 检查子弹是否击中敌人
            this.enemies = this.enemies.filter(enemy => {
                if (this.checkCollision(projectile, enemy)) {
                    this.score += 10;
                    return false;
                }
                return true;
            });
            
            return projectile.x < this.canvas.width;
        });
        
        // 更新分数和生命值显示
        document.getElementById('score').textContent = this.score;
        document.getElementById('health').textContent = this.health;
        
        // 检查游戏是否结束
        if (this.health <= 0) {
            this.gameOver = true;
            this.saveScore();
        }
    }
    
    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    draw() {
        // 清空画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 设置像素渲染
        this.ctx.imageSmoothingEnabled = false;
        
        // 绘制背景
        this.ctx.fillStyle = '#8C9EFF';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制云朵
        this.clouds.forEach(cloud => {
            if (this.sprites.cloud.complete) {
                this.ctx.drawImage(this.sprites.cloud, cloud.x, cloud.y);
            }
        });
        
        // 绘制地面
        if (this.sprites.ground.complete) {
            // 重复绘制地面纹理
            const groundHeight = 30;
            const groundWidth = this.sprites.ground.width;
            for (let x = 0; x < this.canvas.width; x += groundWidth) {
                this.ctx.drawImage(
                    this.sprites.ground,
                    x,
                    this.canvas.height - groundHeight,
                    groundWidth,
                    groundHeight
                );
            }
        } else {
            this.ctx.fillStyle = '#FFB74D';
            this.ctx.fillRect(0, this.canvas.height - 30, this.canvas.width, 30);
        }
        
        if (!this.gameStarted) {
            // 绘制开始按钮
            this.ctx.fillStyle = '#4CAF50';
            this.ctx.fillRect(
                this.startButton.x,
                this.startButton.y,
                this.startButton.width,
                this.startButton.height
            );
            
            this.ctx.fillStyle = 'white';
            this.ctx.font = '24px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(
                '开始游戏',
                this.startButton.x + this.startButton.width / 2,
                this.startButton.y + this.startButton.height / 2 + 8
            );
            this.ctx.textAlign = 'left';
        } else {
            // 绘制玩家
            if (this.sprites.player.complete) {
                this.ctx.drawImage(
                    this.sprites.player,
                    this.player.x,
                    this.player.y,
                    this.player.width,
                    this.player.height
                );
            } else {
                // 后备渲染
                this.ctx.fillStyle = this.player.color;
                this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
            }
            
            // 绘制障碍物
            this.obstacles.forEach(obstacle => {
                if (this.sprites.obstacle.complete) {
                    this.ctx.drawImage(
                        this.sprites.obstacle,
                        obstacle.x,
                        obstacle.y,
                        obstacle.width,
                        obstacle.height
                    );
                } else {
                    this.ctx.fillStyle = obstacle.color;
                    this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
                }
            });
            
            // 绘制敌人
            this.enemies.forEach(enemy => {
                if (this.sprites.enemy.complete) {
                    this.ctx.drawImage(
                        this.sprites.enemy,
                        enemy.x,
                        enemy.y,
                        enemy.width,
                        enemy.height
                    );
                } else {
                    this.ctx.fillStyle = enemy.color;
                    this.ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
                }
            });
            
            // 绘制子弹
            this.projectiles.forEach(projectile => {
                this.ctx.fillStyle = projectile.color;
                this.ctx.fillRect(projectile.x, projectile.y, projectile.width, projectile.height);
            });
            
            // 如果游戏结束，绘制重新开始按钮
            if (this.gameOver) {
                this.ctx.fillStyle = '#4CAF50';
                this.ctx.fillRect(
                    this.resetButton.x,
                    this.resetButton.y,
                    this.resetButton.width,
                    this.resetButton.height
                );
                
                this.ctx.fillStyle = 'white';
                this.ctx.font = '20px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(
                    '重新开始',
                    this.resetButton.x + this.resetButton.width / 2,
                    this.resetButton.y + this.resetButton.height / 2 + 7
                );
                this.ctx.textAlign = 'left';
            }
        }
        
        // 绘制排行榜
        this.drawLeaderboard();
    }
    
    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// 当页面加载完成后启动游戏
window.addEventListener('load', () => {
    new Game();
}); 