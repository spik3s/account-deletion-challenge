import React from 'react'
import ReactDOM from 'react-dom'

import './index.css'
import MockDataProvider from './MockDataProvider'
import Dialog from './components/Dialog'

ReactDOM.render(
  <MockDataProvider>
    {props => <Dialog {...props} />}
  </MockDataProvider>,
  document.getElementById('root')
)

// Hot Module Replacement
if (module.hot) {
  module.hot.accept()
}
