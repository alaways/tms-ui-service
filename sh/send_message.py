import sys

import requests


# 发送文字
def send_message(key, message):
    wx_url = "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=" + key

    data = {
        "msgtype": "text",
        # "text": {"content": message, "mentioned_list": "@all"},  # 需@人的姓名
        "text": {"content": message},  # 需@人的姓名
    }
    r = requests.post(
        url=wx_url, json=data
    )  # url中的xxx是你的机器人webhook对应片段，不要轻易泄露出去否则任何人都可以控制你的机器人


# 发送文字
if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(1)
    key = sys.argv[1]
    message = sys.argv[2]
    send_message(key, message)
