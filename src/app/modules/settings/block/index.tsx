import React from 'react';
import { Link } from 'react-router-dom';

import { useSelector } from 'react-redux';
import { getProfile } from '@reducers/user';

export default function() {

    const me = useSelector((state:object)=>getProfile(state));
    
    return (
        <div className="card">
            <div className="card-header">屏蔽管理</div>
            <div className="card-body">
                <div><Link to="/block/posts">屏蔽{me.block_posts_count}个帖子</Link></div>
                <div><Link to="/block/peoples">屏蔽{me.block_people_count}个用户</Link></div>
                <div><Link to="/block/comments">屏蔽{me.block_comment_count}条评论</Link></div>
            </div>
        </div>
    )
}

/*
@connect(
    (state, props) => ({
        me: getProfile(state)
    }),
    dispatch => ({
    })
)
export default class Block extends Component {
    
    constructor(props) {
        super(props)
    }

    render() {

        const { me } = this.props;

        return (
            <div>
                <div className="card">
                    <div className="card-header">屏蔽管理</div>
                    <div className="card-body">
                        <div><Link to="/block/posts">屏蔽{me.block_posts_count}个帖子</Link></div>
                        <div><Link to="/block/peoples">屏蔽{me.block_people_count}个用户</Link></div>
                        <div><Link to="/block/comments">屏蔽{me.block_comment_count}条评论</Link></div>
                    </div>
                </div>
            </div>
        )

    }

}
*/