import React, { Component } from 'react';

// redux
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { isMember } from '@reducers/user';

// style
import './index.scss';

@connect(
  (state, props) => ({
    isMember: isMember(state)
  }),
  dispatch => ({
  })
)
export default class CommentButton extends Component {
  
  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
  }

  onClick(e) {

    e.stopPropagation();

    const { reply, comment, posts, isMember } = this.props;
    const target = comment || reply || posts;

    if (!isMember) {
      $('#sign').modal({
        show: true
      }, {});
      return;
    }

    let type = 'reply';

    if (posts) type = 'comment';

    $('#editor-comment-modal').modal({
      show: true
    }, {
      type,
      comment: comment || reply || null,
      posts
    });

  }

  stopPropagation(e) {
    e.stopPropagation();
  }

  render () {
    
    const { reply, comment, posts, isMember } = this.props;
    const target = comment || reply || posts;

    let t = posts ? '评论' : '回复';

    if (!isMember) {
      return (<a styleName="button" href="javascript:void(0)" data-toggle="modal" data-target="#sign" onClick={this.stopPropagation} className="text-secondary">
        <span className="d-none d-lg-inline d-xl-inline">{target.comment_count ? target.comment_count+' 条'+t : t}</span>
      </a>)
    }

    return (<a styleName="button" href="javascript:void(0)" onClick={this.onClick} className="text-secondary">
      <span className="d-none d-lg-inline d-xl-inline">{target.comment_count ? target.comment_count+' 条'+t : t}</span>
    </a>)

  }
}
