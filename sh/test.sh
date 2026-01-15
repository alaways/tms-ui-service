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
  sed -i '' "s|VITE_GLOB_API_URL=.*|VITE_GLOB_API_URL=$TEST_DATA_API_URL|" ../.env.production
else
  # Linux 或 Git Bash 不需要
  sed -i "s|VITE_GLOB_API_URL=.*|VITE_GLOB_API_URL=$TEST_DATA_API_URL|" ../.env.production
fi

# 测试环境 - 准备更新
  # python3 send_message.py $WECOM_TECHNOLOGY_KEY "后台-测试环境-正在打包,准备更新"

# 删除已有打包，避免其他环境冲突
  OUTPUT_NAME="../dist.zip"
 if [ -f "$OUTPUT_NAME" ]; then
      rm -f "$OUTPUT_NAME"
  fi
 if [ -d "../dist" ]; then
      rm -rf "../dist"
  fi

#  Build
  pnpm build

# 将当前dist文件压缩
  zip -r "$OUTPUT_NAME" "../dist"
  
# 测试环境 - 正在更新
  # python3 send_message.py $WECOM_TECHNOLOGY_KEY "后台-测试环境-开始更新"

# 将压缩包复制到对应路径下
  scp $OUTPUT_NAME $USER_NAME@$TEST_IP:$TEST_DATA_PATH

# 替换文件夹名称
  ssh $USER_NAME@$TEST_IP mv $TEST_DATA_PATH/dist $TEST_DATA_PATH/old

# 确保目标路径存在
  # ssh $USER_NAME@$TEST_IP mkdir -p $TEST_DATA_PATH/dist

# 将dist copy到对应目录下
  # scp -r ../dist $USER_NAME@$TEST_IP:$TEST_DATA_PATH

# 将解压包解压
  ssh "$USER_NAME@$TEST_IP" "unzip $TEST_DATA_PATH/dist.zip -d $TEST_DATA_PATH"

# 删除old文件
  ssh $USER_NAME@$TEST_IP rm -r $TEST_DATA_PATH/old
  ssh $USER_NAME@$TEST_IP rm -r $TEST_DATA_PATH/dist.zip

# 测试环境 - 更新完毕
  # python3 send_message.py $WECOM_TECHNOLOGY_KEY "前端-后台-测试环境-更新完毕"
