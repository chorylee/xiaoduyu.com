import React from 'react';
import { Link } from 'react-router-dom';

import { useSelector } from 'react-redux';
import { getUserInfo } from '@app/redux/reducers/user';

// components
import Follow from '@app/components/follow';

import './styles/index.scss';

interface Props {
  topic: Topic
}

type Topic = {
  _id: string,
  parent_id: any,
  name: string,
  avatar: string,
  brief: string,
  posts_count: number,
  follow_count: number,
  comment_count: number,
  follow: boolean
}

export default function({ topic }:Props) {

  const me = useSelector((state:object)=>getUserInfo(state));

  return (<div>
      <img styleName="avatar" src={topic.avatar} className="rounded" alt={topic.name} />
      <div>
        <div>
          <h6>
            {topic.parent_id ?
              <>
                <Link to={`/topic/${topic.parent_id._id}`} className="text-dark"><b>{topic.parent_id.name}</b></Link>
                <span className="ml-2 mr-2">›</span>
              </>
              : null}
            {topic ? <b>{topic.name}</b> : null}
          </h6>

          <div styleName="brief">{topic.brief}</div>

          <div styleName="info">
            {topic.posts_count ? <span>{topic.posts_count} 帖子</span> : null}
            {topic.follow_count ? <span>{topic.follow_count} 人关注</span> : null}
            {topic.comment_count ? <span>{topic.comment_count} 条评论</span> : null}
          </div>

        </div>
        <div styleName="action">
          {topic.parent_id && me ?
            <>
              <Link to={`/new-posts?topic_id=${topic._id}`} className="btn btn-outline-primary btn-sm rounded-pill">创建话题</Link>
              <Follow topic={topic} />
            </>
            : null}
        </div>
      </div>
    </div>)
  /*
  return (
    <div styleName="container">
    <div styleName="main">
      <img styleName="avatar" src={topic.avatar} className="align-self-start rounded" width="80" height="80" alt={topic.name} />
      <div className="d-flex justify-content-between">
        <div>
          {topic.parent_id ?
            <>
              <Link to={`/topic/${topic.parent_id._id}`} className="text-primary">{topic.parent_id.name}</Link>
              <span className="ml-1 mr-1">›</span>
            </>
            : null}
          {topic ? topic.name : null}
          <div styleName="brief">{topic.brief}</div>
          {topic.posts_count ? <span className="mr-3" styleName="brief">{topic.posts_count} 帖子</span> : null}
          {topic.follow_count ? <span className="mr-3" styleName="brief">{topic.follow_count} 人关注</span> : null}
          {topic.comment_count ? <span className="mr-3" styleName="brief">{topic.comment_count} 条评论</span> : null}
        </div>
        <div styleName="action">
          {topic.parent_id && me ?
            <>
              <Link to={`/new-posts?topic_id=${topic._id}`} className="btn btn-outline-primary btn-sm rounded-pill">创建话题</Link>
              <div className="mt-2"><Follow topic={topic} /></div>
            </>
            : null}
        </div>
      </div>
    </div>
    </div>
  )
  */
}