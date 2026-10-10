import React from 'react';
import ReactDOM from 'react-dom';
import classnames from 'classnames';
import networkErrors from 'chromium-net-errors';
import { localized } from 'mailspring-exports';

import { RetinaImg } from './retina-img';
import { Disposable } from 'event-kit';

type InitialLoadingCoverProps = {
  ready?: boolean;
  error?: string;
  onTryAgain?: (...args: any[]) => any;
};
type InitialLoadingCoverState = {
  slow: boolean;
};

class InitialLoadingCover extends React.Component<
  InitialLoadingCoverProps,
  InitialLoadingCoverState
> {
  state = {
    slow: false,
  };
  _slowTimeout: NodeJS.Timeout;

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this._slowTimeout = setTimeout(() => {
      this.setState({ slow: true });
    }, 3500);
  }

  componentWillUnmount() {
    clearTimeout(this._slowTimeout);
    this._slowTimeout = null;
  }

  render() {
    const classes = classnames({
      'webview-cover': true,
      ready: this.props.ready,
      error: this.props.error,
      slow: this.state.slow,
    });

    let message = this.props.error;
    if (this.props.error) {
      message = this.props.error;
    } else if (this.state.slow) {
      message = localized('Still connecting to the sign-in page…');
    } else {
      message = '&nbsp;';
    }

    return (
      <div className={classes}>
        <div style={{ flex: 1 }} />
        <RetinaImg
          className="spinner"
          style={{ width: 20, height: 20 }}
          name="inline-loading-spinner.gif"
          mode={RetinaImg.Mode.ContentPreserve}
        />
        <div className="message" role={this.props.error ? 'alert' : 'status'} aria-live="polite">
          {message}
        </div>
        <button type="button" className="btn try-again" onClick={this.props.onTryAgain}>
          {localized('Try Again')}
        </button>
        <div style={{ flex: 1 }} />
      </div>
    );
  }
}

type WebviewProps = {
  src?: string;
  onDidFinishLoad?: (...args: any[]) => any;
};
type WebviewState = {
  webviewLoading: boolean;
  ready: boolean;
  error: string | null;
};

export default class Webview extends React.Component<WebviewProps, WebviewState> {
  static displayName = 'Webview';

  _mounted = false;
  _disposable?: Disposable;

  state: WebviewState = {
    webviewLoading: false,
    ready: false,
    error: null,
  };

  componentDidMount() {
    this._mounted = true;
    this._setupWebview(this.props);
  }

  componentDidUpdate(prevProps: WebviewProps) {
    if (prevProps.src !== this.props.src) {
      this.setState({ error: null, webviewLoading: true, ready: false });
      this._setupWebview(this.props);
    }
  }

  componentWillUnmount() {
    this._mounted = false;
    const webview = ReactDOM.findDOMNode(this.refs.webview) as Electron.WebviewTag;
    if (webview) {
      const listeners = this._webviewListeners();
      for (const event of Object.keys(listeners)) {
        webview.removeEventListener(event, listeners[event]);
      }
    }
    if (this._disposable) {
      this._disposable.dispose();
      this._disposable = null;
    }
  }

  _webviewListeners() {
    return {
      'did-fail-load': this._webviewDidFailLoad,
      'did-finish-load': this._webviewDidFinishLoad,
      'did-frame-navigate': this._webviewDidFrameNavigate,
      'new-window': this._onNewWindow,
      'did-navigate': this._webviewDidNavigate,
    };
  }

  _setupWebview(props) {
    if (!props.src) return;
    const webview = ReactDOM.findDOMNode(this.refs.webview) as Electron.WebviewTag;
    const listeners = this._webviewListeners();
    for (const event of Object.keys(listeners)) {
      webview.removeEventListener(event, listeners[event]);
    }
    webview.partition = 'in-memory-only';
    webview.src = props.src;
    for (const event of Object.keys(listeners)) {
      webview.addEventListener(event, listeners[event]);
    }
  }

  _onTryAgain = () => {
    if (!this._mounted) return;
    this.setState({ error: null, ready: false, webviewLoading: true });
    const webview = ReactDOM.findDOMNode(this.refs.webview) as Electron.WebviewTag;
    webview.reload();
  };

  _onNewWindow = (event: { preventDefault: () => void }) => {
    // A remote identity page must not launch arbitrary URLs in the host browser.
    // A future explicit, user-initiated browser flow needs its own reviewed policy.
    event.preventDefault();
    if (this._mounted) {
      const error = localized(
        'A sign-in pop-up was blocked for your security. Return to sign-in and choose another method.'
      );
      this.setState({ ready: false, error, webviewLoading: false });
    }
  };

  _webviewDidNavigate = () => {
    if (!this._mounted) return;
    // Navigating a guest can leave the text cursor out of sync until refocused.
    const webview = ReactDOM.findDOMNode(this.refs.webview) as Electron.WebviewTag;
    webview.blur();
  };

  _webviewDidFrameNavigate = ({
    httpResponseCode,
    isMainFrame,
  }: {
    url: string;
    httpResponseCode: number;
    httpStatusText: string;
    isMainFrame: boolean;
  }) => {
    if (!this._mounted) return;
    // Only handle main frame navigation, ignore secondary resources
    if (!isMainFrame) return;

    if (httpResponseCode >= 400) {
      const error = localized('Could not load the sign-in page. (HTTP %@)', httpResponseCode);
      this.setState({ ready: false, error, webviewLoading: false });
      return;
    }
    this.setState({ ready: true, error: null, webviewLoading: false });
  };

  _webviewDidFailLoad = ({ errorCode }) => {
    if (!this._mounted) return;
    // "Operation was aborted" can be fired when we move between pages quickly.
    if (errorCode === -3) {
      return;
    }

    const e = networkErrors.createByCode(errorCode);
    const error = localized('Could not load the sign-in page. %@', e ? e.message : errorCode);
    this.setState({ ready: false, error: error, webviewLoading: false });
  };

  _webviewDidFinishLoad = () => {
    if (!this._mounted) return;
    // this is sometimes called right after did-fail-load
    if (this.state.error) return;
    this.setState({ ready: true, webviewLoading: false });

    if (!this.props.onDidFinishLoad) return;
    const webview = ReactDOM.findDOMNode(this.refs.webview) as Electron.WebviewTag;
    this.props.onDidFinishLoad(webview);

    // tweak the size of the webview to ensure it's contents have laid out
    window.requestAnimationFrame(() => {
      webview.style.bottom = '1px';
      window.requestAnimationFrame(() => {
        webview.style.bottom = '0';
      });
    });
  };

  render() {
    return (
      <div className="webview-wrap">
        <webview ref="webview" partition="in-memory-only" />
        <div className={`webview-loading-spinner loading-${this.state.webviewLoading}`}>
          <RetinaImg
            style={{ width: 20, height: 20 }}
            name="inline-loading-spinner.gif"
            mode={RetinaImg.Mode.ContentPreserve}
          />
        </div>
        <InitialLoadingCover
          ready={this.state.ready}
          error={this.state.error}
          onTryAgain={this._onTryAgain}
        />
      </div>
    );
  }
}
