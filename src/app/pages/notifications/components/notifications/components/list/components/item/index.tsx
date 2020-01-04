import React from 'react';
import { Link } from 'react-router-dom';
import ReactDOMServer from 'react-dom/server';

// tools
import { dateDiff } from '@app/common/date';

// components
import HTMLText from '@app/components/html-text';

// style
import './styles/index.scss';

interface Props {
  notification: any
  key?: any
}

export default ({ notification }: Props) => {

  const notice = notification;
  
  let content = null;
  let avatar = null;

  if (notice.sender_id && notice.sender_id.avatar_url) {
    let img = <img styleName="avatar" src={notice.sender_id.avatar_url} />
    avatar = <i className="load-demand" data-load-demand={ReactDOMServer.renderToString(img)}></i>
  }

  switch (notice.type) {

    case 'follow-you':
      content = (<div>
          <div styleName="header">
            <Link to={`/people/${notice.sender_id._id}`} className="text-dark">{avatar}{notice.sender_id.nickname}</Link>
            {dateDiff(notice.create_at)} 关注了你
          </div>
        </div>)
      break

    case 'follow-posts':
      content = (<div>
          <div styleName="header">
            <Link to={`/people/${notice.sender_id._id}`} className="text-dark">{avatar}{notice.sender_id.nickname}</Link>
            {dateDiff(notice.create_at)} 收藏了你的
            <Link to={`/posts/${notice.posts_id._id}`} className="text-dark">{notice.posts_id.title}</Link>
          </div>
        </div>)
      break

    case 'like-posts':
      content = (<div>
          <div styleName="header">
            <Link to={`/people/${notice.sender_id._id}`} className="text-dark">{avatar}{notice.sender_id.nickname}</Link>
            {dateDiff(notice.create_at)} 赞了你的
            <Link to={`/posts/${notice.posts_id._id}`} className="text-dark">{notice.posts_id.title}</Link>
          </div>
        </div>)
      break

    case 'reply':
      content = (<div>
        <div styleName="header">
          <Link to={`/people/${notice.sender_id._id}`} className="text-dark">{avatar}{notice.sender_id.nickname}</Link>
          {dateDiff(notice.create_at)} 回复了你的
          {notice.comment_id.parent_id ?
            <Link to={`/comment/${notice.comment_id.parent_id._id}`} className="text-dark">
              {notice.comment_id.reply_id ? notice.comment_id.reply_id.content_trim : notice.comment_id.parent_id.content_trim}
            </Link>
            : null}
          {notice.comment_id.reply_id ? '回复' : '评论'}
        </div>
        <div styleName="content">
          <HTMLText content={notice.comment_id.content_html} />
        </div>
      </div>)
      break

    case 'comment':
      content = (<div>
        <div styleName="header">
          <Link to={`/people/${notice.sender_id._id}`} className="text-dark">{avatar}{notice.sender_id.nickname}</Link>
          {dateDiff(notice.create_at)} 评论了你的
          <Link to={`/posts/${notice.comment_id.posts_id._id}`} className="text-dark">{notice.comment_id.posts_id.title}</Link>
        </div>
        <div styleName="content">
          <HTMLText content={notice.comment_id.content_html} />
        </div>
      </div>)
      break
      
    case 'like-reply':
      let commentId = notice.comment_id.parent_id ? notice.comment_id.parent_id._id : notice.comment_id._id;
      content = (<div>
        <div styleName="header">
          <Link to={`/people/${notice.sender_id._id}`} className="text-dark">{avatar}{notice.sender_id.nickname}</Link>
          {dateDiff(notice.create_at)} 赞了你的
          <Link to={`/comment/${commentId}`} className="text-dark">{notice.comment_id.content_trim}</Link>
          回复
        </div>
      </div>)
      break

    case 'like-comment':
      content = (<div>
        <div styleName="header">
          <Link to={`/people/${notice.sender_id._id}`} className="text-dark">{avatar}{notice.sender_id.nickname}</Link>
          {dateDiff(notice.create_at)} 赞了你的
          <Link to={`/comment/${notice.comment_id._id}`} className="text-dark">{notice.comment_id.content_trim}</Link>
          评论
        </div>
      </div>)
      break

    // 新的回答通知
    case 'new-comment':
      content = (<div>
        <div styleName="header">
          <Link to={`/people/${notice.sender_id._id}`} className="text-dark">{avatar}{notice.sender_id.nickname}</Link>
          {dateDiff(notice.create_at)} 评论了
          <Link to={`/posts/${notice.comment_id.posts_id._id}`} className="text-dark">{notice.comment_id.posts_id.title}</Link>
        </div>
        <div styleName="content">
          <Link to={`/comment/${notice.comment_id._id}`} className="text-dark">{notice.comment_id.content_trim}</Link>
        </div>
      </div>)
      break
  }

  if (content) {
    if (notice.deleted) {
      content = (<div key={notice._id}>
        <del styleName="del">{content}</del>
      </div>)
    } else {
      content = (<div key={notice._id}>
        {content}
      </div>)
    }
  }

  return <div className="card-body border-bottom">
    {content}
  </div>

}