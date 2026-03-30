import React from 'react';
import { GlobalError } from '../pages/GlobalError';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, message: error.message };
  }
  componentDidCatch(error, errorInfo) {
    console.error("Terminal Rendering Critical Error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return <GlobalError code="500" type="DOM Exception" message={this.state.message} />;
    }
    return this.props.children; 
  }
}
