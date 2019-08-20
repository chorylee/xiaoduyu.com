import io from 'socket.io-client';

// config
import { api } from '@config/index';

// redux actions
import { setOnlineUserCount, sendNotification } from '@app/redux/actions/website';
import { getAccessToken } from '@app/redux/reducers/user';

import { loadTips } from '@app/redux/actions/tips';
import { updateSession } from '@app/redux/actions/session';
import { addMessagesToList } from '@app/redux/actions/message';

let socket: any;

export const connect = function ({ dispatch, getState }: any) {

  // 用于判断是否登录
  const me = getState().user.userInfo;
  const accessToken = getAccessToken(getState());

  const handleActions = function(action: any, params: any = null) {
    action(params)(dispatch, getState);
  }
  
  const handleNotification = (notification: any) => {

    try {
      notification = JSON.parse(notification);
    } catch (err) {
      notification = '';
      console.log(err);
    }
  
    if (!notification || !notification.type) return;
  
    const { type, data } = notification;
  
    switch (type) {
      // 有新通知
      case 'notification':
        handleActions(loadTips);

        if (data && data.comment_id && data.type == 'comment' ||
            data && data.comment_id && data.type == 'reply'
        ) {
          let body = data.comment_id.content_html;

          body = body.replace(/<[^>]+>/g, '');
          body = body.replace(/\r\n/g, ''); 
          body = body.replace(/\n/g, '');

          handleActions(sendNotification, {
            content: data.sender_id.nickname,
            option: {
              body,
              icon: 'https:'+data.sender_id.avatar_url,
              image: 'https:'+data.sender_id.avatar_url,
              tag: 'comment',
              data: data
            }
          });
        }

        break;
      case 'new-feed':
        handleActions(loadTips);
        break;
      case 'recommend-posts':
        handleActions(loadTips);
        break;
      case 'new-session':
        handleActions(loadTips);
        handleActions(updateSession, data.sessionId);
        handleActions(addMessagesToList, data);
        break;
    }

  }

  socket = io(api.socket, {
    // 是否自动重新连接
    reconnection: true,
    // 自动重连10次后放弃
    reconnectionAttempts: 15,
    // 自动重连间隔时间
    reconnectionDelay: 3000,
    // 发送参数给服务器，服务端获取参数 socket.handshake.query
    query: {
      accessToken
    }
  });

  socket.on("connect", function() {

    console.log('socket connect success.');
    
    // 更新在线用户
    socket.on("online-user", function(res: any) {
      handleActions(setOnlineUserCount, res);
    });
    
    // 与用户自己相关的消息
    if (me) socket.on(me._id, handleNotification);
    // 会员消息
    if (me) socket.on('member', handleNotification);    

  });

  // 如果断开了连接，尝试重新连接
  socket.on('disconnect', function() {
    console.log('socket has disconnect.');
  });

  // 加载未读消息、通知、等等红点提醒
  if (me && me._id) {
    handleActions(loadTips);
  }

}

// 关闭 socket
export const close = () => {
  if (socket) {
    socket.close();
    socket = null;
  }
}