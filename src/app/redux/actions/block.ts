import graphql from '../../common/graphql';
import loadList from '../../common/new-graphql-load-list';

export const loadBlockList = loadList({
  reducerName: 'block',
  actionType: 'SET_BLOCK_LIST_BY_ID',
  api: 'blocks',
  fields: `
    _id
    deleted
    create_at
    ip
    user_id
    comment_id {
      _id
      content_html
      posts_id
      parent_id
    }
    people_id {
      create_at
      avatar
      _id
      nickname
      avatar_url
      id
    }
    posts_id {
      title
      _id
    }
  `
});

export const addBlock = ({ args }: any) => {
  return (dispatch: any, getState: any) => {
    return new Promise(async resolve => {

      let [ err, res ] = await graphql({
        type: 'mutation',
        apis: [{
          api: 'addBlock',
          args,
          fields: `
          success
          _id  
          `
        }],
        headers: { accessToken: getState().user.accessToken }
      });

      resolve([err, res]);

      if (err || !res || !res.success) return;

      let profile = getState().user.profile;

      // 更新个人资料里面的累计数
      if (args.people_id) {
        if (!profile.block_people_count) {
          profile.block_people_count = 1;
        } else {
          profile.block_people_count += 1;
        }

      } else if (args.posts_id) {
        if (!profile.block_posts_count) {
          profile.block_posts_count = 1;
        } else {
          profile.block_posts_count += 1;
        }

        dispatch({ type: 'REMOVE_POSTS_BY_ID', id: args.posts_id });
      } else if (args.comment_id) {
        if (!profile.block_comment_count) {
          profile.block_comment_count = 1;
        } else {
          profile.block_comment_count += 1;
        }
        dispatch({ type: 'REMOVE_COMMENT_BY_ID', id: args.comment_id });
      }

      dispatch({ type: 'SET_USER', userinfo: profile });
      dispatch({ type: 'SET_BLOCK_STATE', state: {} });

    })
  }
}

export const removeBlock = ({ args, id }: any) => {
  return (dispatch: any, getState: any) => {
    return new Promise(async resolve => {

      let user = getState().user;

      let [ err, res ] = await graphql({
        type: 'mutation',
        apis: [{
          api: 'removeBlock',
          args,
          fields: `success`
        }],
        headers: { accessToken: user.accessToken }
      });

      resolve([err, res]);

      if (err || !res || !res.success) return;

      // 删除该条数据
      dispatch({ type: 'REMOVE_BLOCK_BY_ID', id });

      // 更新个人资料里面的累计数
      if (args.people_id) {
        user.profile.block_people_count -= 1;
      } else if (args.posts_id) {
        user.profile.block_posts_count -= 1;
      } else if (args.comment_id) {
        user.profile.block_comment_count -= 1;
      }

      dispatch({ type: 'SET_USER', userinfo: user.profile });

    })
  }
}
