import merge from 'lodash/merge'

export default function() {

  let initialState = {}

  return function notification(state = initialState, action = {}) {
    switch (action.type) {

      case 'SET_NOTIFICATION':
        return merge({}, action.state, {})

      case 'SET_NOTIFICATION_LIST_BY_ID':
        var { name, data } = action
        state[name] = data
        return merge({}, state, {})

      case 'UPDATE_NOTIFICATION':
        var { id, update } = action
        for (let i in state) {
          state[i].data.map(item => {
            if (item._id == id) {
              for (let i in update) item[i] = update[i]
            }
          })
        }
        return merge({}, state, {})

      // 清空
      case 'CLEAN':
        return {}

      default:
        return state;
    }
  }

}

export const getNotificationListById = (state, name) => {
  return state.notification[name] || {}
}
