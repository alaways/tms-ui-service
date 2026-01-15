# 为了方便实现三端公共触发打包不用麻烦
# 在目录下使用
# chmod +x deploy.sh
# ./deploy.sh

# 导入公共配置
source main.sh

# 清除运行中的 ssh-agent 进程
ps aux | grep ssh-agent | awk '{print $2}' | xargs kill -9 2>/dev/null

# 清除代理中的私钥
ssh-add -D

# 启动新的 ssh-agent 并添加私钥
eval "$(ssh-agent -s)"
ssh-add "$SSH_PRIVATE_KEY"
  
# 设置api环境  
# 判断操作系统类型
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS 需要 -i 后跟空字符串
  sed -i '' "s|VITE_GLOB_API_URL=.*|VITE_GLOB_API_URL=$PRE_API_URL|" ../.env.production
else
  # Linux 或 Git Bash 不需要
  sed -i "s|VITE_GLOB_API_URL=.*|VITE_GLOB_API_URL=$PRE_API_URL|" ../.env.production
fi

#  Build
  pnpm build

# 替换文件夹名称
  ssh $USER_NAME@$PRE_IP mv $PRE_PATH/dist $PRE_PATH/old

# 确保目标路径存在
  ssh $USER_NAME@$PRE_IP mkdir -p $PRE_PATH/dist

# 将dist copy到对应目录下
  scp -r ../dist $USER_NAME@$PRE_IP:$PRE_PATH

# 删除old文件
  ssh $USER_NAME@$PRE_IP rm -r $PRE_PATH/old
