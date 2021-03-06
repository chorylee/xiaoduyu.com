import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { matchPath } from 'react-router';
import ReactGA from 'react-ga';
// import * as OfflinePluginRuntime from 'offline-plugin/runtime';
import serviceWorker from './service-worker';

import configureStore from '@app/redux';
import createRouter from '@app/router';
import * as socket from './socket';
import * as browser from '@app/common/browser';


import { GA, analysisScript } from '@config';
import { debug } from '@config/feature.config';
// import * as globalData from '@app/common/global-data';

import '../app/theme/global.scss';

import { getUserInfo } from '@app/redux/reducers/user';
import { initUnlockToken } from '@app/redux/actions/unlock-token';
import { requestNotificationPermission } from '@app/redux/actions/website';
import { initHasRead } from '@app/redux/actions/has-read-posts';

import theme from '@app/theme';

import initData from '@app/init-data';

/*
// -----------------------------------
const ServiceWorker = {

  get: function() {
    return new Promise(resolve=>{
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
          resolve(registrations);
        })
      } else {
        resolve(null)
      }
    })
  },

  install: function(){
    return new Promise(async resolve=>{
      if (process.env.NODE_ENV != 'development') {
        await OfflinePluginRuntime.install();
      }
      resolve();
    })
  },

  uninstall: function(){
    return new Promise(async resolve=>{
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
          for (const registration of registrations) {
            registration.unregister()
          }
          resolve();
        }).catch(err=>{
          resolve();
        })
      } else {
        resolve();
      }

    })
  }

}

globalData.set('service-worker', ServiceWorker);
ServiceWorker.install();
*/

serviceWorker.install();

(async function(){

  // 从页面中获取服务端生产redux数据，作为客户端redux初始值
  const store = configureStore(window.__initState__);

  let userinfo = null;

  let isAppShell = window.inAppShell || false;
  
  if (isAppShell) {

    await initData(store);

    await new Promise((resolve, reject)=>{
      $.ajax({
        url: '/sign/check',
        type: 'post',
        success: (res: any) => {
          if (res && res.signIn && !res.error) {
            store.dispatch({ type: 'SET_USER', userinfo: res.userInfo });
            if (res.accessToken) {
              store.dispatch({ type: 'ADD_ACCESS_TOKEN', access_token: res.accessToken });
            }
          }
          userinfo = getUserInfo(store.getState());
          resolve();
        },
        error: (err: any)=>{
          resolve();
        }
      });
    });
    
  } else {
    userinfo = getUserInfo(store.getState());
  }

  // 从cookie中获取unlock token，并添加到redux
  initUnlockToken()(store.dispatch, store.getState);
  requestNotificationPermission()(store.dispatch, store.getState);

  let enterEvent = (userinfo?: any): void => {};
  
  if (GA) {
    // https://github.com/react-ga/react-ga
    let gaOptions: any = {}

    if (userinfo) {
      gaOptions.userId = userinfo._id;
    }
    
    ReactGA.initialize(GA, { debug, gaOptions });

    enterEvent = (userinfo) => {
      ReactGA.pageview(window.location.pathname+window.location.search);
    }
  }

  const router = createRouter({ user: userinfo, enterEvent });
  const Page: any = router.dom;

  socket.connect(store);

  let _route: any = null;

  router.list.some((route: any) => {
    let match = matchPath(window.location.pathname, route);
    if (match && match.path) {
      _route = route;
      return true;
    }
  });

  // 预先加载首屏的js（否则会出现，loading 一闪的情况）
  await _route.body.preload();

  // 如果是离线appShell页面，清空启动页loading的内容
  if (isAppShell) $('#app')[0].innerHTML = '';

  ReactDOM.hydrate(
    <Provider store={store}><BrowserRouter><Page /></BrowserRouter></Provider>,
    $('#app')[0]
  );

  // 开发模式下，启动热更新
  if (process.env.NODE_ENV === 'development' && module.hot) module.hot.accept();

  // 添加页面第三方统计分析脚本
  $('body').append(`<div style="display:none">${analysisScript}</div>`);

  // 解决在 ios safari iframe 上touchMove 滚动后，外部的点击事件会无效的问题
  if (browser.isSafari()) {
    document.addEventListener('touchmove', function(e) {
      e.preventDefault();
    });
  }
  
  initHasRead()(store.dispatch, store.getState);

  theme(userinfo);

}());